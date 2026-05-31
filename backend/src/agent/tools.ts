import type { ChatCompletionTool } from "openai/resources.js";
import { createHttpClient } from "./mcp";

export const elasticMCP = await createHttpClient(
  "elastic-agent-builder",
  `${process.env.KIBANA_URL!}/api/agent_builder/mcp`,
  {
    Authorization: `ApiKey ${process.env.ELASTIC_API_KEY!}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
);
