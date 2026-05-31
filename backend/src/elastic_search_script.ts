import carCatalog from "./data/cars_data.json";

// ─── Config ───────────────────────────────────────────────────────────────────

const ES_ENDPOINT =
  process.env.ES_ENDPOINT ??
  "https://car-recommedation-d3fb4b.es.asia-south1.gcp.elastic.cloud:443";

const ES_API_KEY = process.env.ELASTIC_API_KEY ?? "";

const INDEX = "cars";

if (!ES_API_KEY) {
  console.error("❌  ES_API_KEY env var is not set.");
  console.error(
    "    Run: ES_API_KEY=your_key bun run src/elastic_search_script.ts",
  );
  process.exit(1);
}

// ─── Shared headers ───────────────────────────────────────────────────────────

const jsonHeaders = {
  "Content-Type": "application/json",
  Authorization: `ApiKey ${ES_API_KEY}`,
};

const ndjsonHeaders = {
  "Content-Type": "application/x-ndjson",
  Authorization: `ApiKey ${ES_API_KEY}`,
};

// ─── Step 1: Create index + mapping ──────────────────────────────────────────

async function createIndex(): Promise<void> {
  console.log(`\n📦  Creating index "${INDEX}"...`);

  const res = await fetch(`${ES_ENDPOINT}/${INDEX}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({
      mappings: {
        properties: {
          id: { type: "integer" },
          name: { type: "text", fields: { keyword: { type: "keyword" } } },
          brand: { type: "keyword" },
          type: { type: "keyword" },
          year: { type: "integer" },
          price_range: {
            properties: {
              min: { type: "integer" },
              max: { type: "integer" },
              currency: { type: "keyword" },
            },
          },
          seats: { type: "integer" },
          fuel_types: { type: "keyword" },
          use_cases: { type: "keyword" },
          drivetrain: { type: "keyword" },
          transmission: { type: "keyword" },
          features: { type: "text", fields: { keyword: { type: "keyword" } } },
          available_colors: { type: "keyword" },
          rating: { type: "float" },
        },
      },
    }),
  });

  const body = (await res.json()) as {
    acknowledged?: boolean;
    error?: { type: string; reason: string };
  };

  if (res.ok) {
    console.log(`✅  Index "${INDEX}" created.`);
    return;
  }

  if (
    res.status === 400 &&
    body.error?.type === "resource_already_exists_exception"
  ) {
    console.warn(`⚠️   Index "${INDEX}" already exists — skipping.`);
    return;
  }

  throw new Error(
    `Create index failed [${res.status}]: ${body.error?.reason ?? res.statusText}`,
  );
}

// ─── Step 2: Bulk index ───────────────────────────────────────────────────────

async function bulkIndex(cars: any[]): Promise<void> {
  console.log(`\n🚗  Bulk indexing ${cars.length} cars...`);

  // ES bulk API requires NDJSON: one action line + one source line per doc
  const ndjson =
    cars
      .flatMap((car) => [
        JSON.stringify({ index: { _index: INDEX, _id: String(car.id) } }),
        JSON.stringify(car),
      ])
      .join("\n") + "\n"; // trailing newline is required

  const res = await fetch(`${ES_ENDPOINT}/_bulk`, {
    method: "POST",
    headers: ndjsonHeaders,
    body: ndjson,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bulk request failed [${res.status}]: ${text}`);
  }

  const body = (await res.json()) as {
    took: number;
    errors: boolean;
    items: Array<{
      index: {
        _id: string;
        _index: string;
        result?: string;
        status: number;
        error?: { type: string; reason: string };
      };
    }>;
  };

  let ok = 0;
  const failed: string[] = [];

  for (const item of body.items) {
    const { _id, status, result, error } = item.index;
    if (status >= 200 && status < 300) {
      ok++;
      console.log(`   ✔  _id=${_id}  (${result})`);
    } else {
      const reason = error?.reason ?? "unknown";
      failed.push(`_id=${_id} → ${reason}`);
      console.error(`   ✘  _id=${_id}  → ${reason}`);
    }
  }

  console.log(
    `\n📊  ${ok} indexed, ${failed.length} failed. Took ${body.took}ms.`,
  );

  if (failed.length > 0) {
    throw new Error(`Some documents failed:\n${failed.join("\n")}`);
  }
}

// ─── Step 3: Verify count ─────────────────────────────────────────────────────

async function verifyCount(expected: number): Promise<void> {
  console.log("\n🔍  Verifying count (waiting 1s for refresh)...");
  await Bun.sleep(1000);

  const res = await fetch(`${ES_ENDPOINT}/${INDEX}/_count`, {
    headers: jsonHeaders,
  });

  const body = (await res.json()) as { count: number };
  const match = body.count === expected;

  console.log(
    match
      ? `✅  ${body.count} / ${expected} documents confirmed in index.`
      : `⚠️   Count mismatch — found ${body.count}, expected ${expected}.`,
  );
}

// ─── Step 4: Smoke-test search ────────────────────────────────────────────────

async function smokeSearch(): Promise<void> {
  console.log("\n🔎  Smoke-test — top 3 cars by rating...");

  const res = await fetch(`${ES_ENDPOINT}/${INDEX}/_search`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      size: 3,
      query: { match_all: {} },
      sort: [{ rating: "desc" }],
    }),
  });

  const body = (await res.json()) as {
    hits: {
      total: { value: number };
      hits: Array<{ _id: string; _source: any }>;
    };
  };

  console.log(`   Total hits: ${body.hits.total.value}`);
  for (const hit of body.hits.hits) {
    const c = hit._source;
    console.log(
      `   • [${hit._id}] ${c.name}  ⭐ ${c.rating}  $${c.price_range.min.toLocaleString()}–$${c.price_range.max.toLocaleString()}`,
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("══════════════════════════════════════════");
  console.log("  🚘  Car Catalog Indexer  (Bun + fetch)  ");
  console.log("══════════════════════════════════════════");
  console.log(`  Endpoint : ${ES_ENDPOINT}`);
  console.log(`  Index    : ${INDEX}`);
  console.log(`  Cars     : ${carCatalog.cars.length}`);

  try {
    await createIndex();
    await bulkIndex(carCatalog.cars);
    await verifyCount(carCatalog.cars.length);
    await smokeSearch();
    console.log("\n🎉  Done!\n");
  } catch (err) {
    console.error("\n❌ ", (err as Error).message);
    process.exit(1);
  }
}

main();
