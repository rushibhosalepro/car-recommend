import { useState } from "react";
import Modal, { type Answer } from "./components/Modal";
import axios from "axios";

interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

interface Car {
  rank: number;
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price_range: PriceRange;
  seats: number;
  fuel_types: string[];
  use_cases: string[];
  drivetrain: string;
  transmission: string;
  features: string[];
  available_colors: string[];
  rating: number;
  match_reason: string;
}

const CarCard = ({ car }: { car: Car }) => (
  <div
    className={`relative bg-white dark:bg-zinc-900 rounded-2xl border p-5 flex flex-col gap-3 ${
      car.rank === 1
        ? "border-violet-400 dark:border-violet-600"
        : "border-zinc-200 dark:border-zinc-700"
    }`}
  >
    {car.rank === 1 && (
      <span className="absolute -top-3 left-4 bg-violet-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
        Best match
      </span>
    )}

    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">
          #{car.rank} · {car.brand}
        </p>
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          {car.year} {car.name}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {car.type} · {car.drivetrain} · {car.transmission}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          ${car.price_range.min.toLocaleString()} – $
          {car.price_range.max.toLocaleString()}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          ★ {car.rating} · {car.seats} seats
        </p>
      </div>
    </div>

    <p className="text-xs text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 rounded-lg px-3 py-2">
      {car.match_reason}
    </p>

    <div className="flex flex-wrap gap-1.5">
      {car.fuel_types.map((f) => (
        <span
          key={f}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md"
        >
          {f}
        </span>
      ))}
      {car.use_cases.map((u) => (
        <span
          key={u}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md"
        >
          {u}
        </span>
      ))}
    </div>

    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-wrap gap-1.5">
      {car.features.map((feat) => (
        <span key={feat} className="text-xs text-zinc-500 dark:text-zinc-400">
          · {feat}
        </span>
      ))}
    </div>
  </div>
);

export function App() {
  const [open, setOpen] = useState<boolean>(true);
  const [result, setResult] = useState<Car[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const url = `${import.meta.env.VITE_BASE_URL}/recommend`;

  const recommend = async (data: Answer[]) => {
    setOpen(false);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, { context: data });
      if (response.status === 200) {
        setResult(response.data.data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <button onClick={() => setOpen(true)}>suggest me a car</button>
      <Modal open={open} fetch={recommend} />

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400">Finding your best matches...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            className="text-sm px-4 py-2 rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {result && !loading && (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                Your top picks
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Based on your preferences
              </p>
            </div>
            <button
              onClick={() => {
                setResult(null);
                setOpen(true);
              }}
              className="text-sm px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Start over
            </button>
          </div>
          {result.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

      {!result && !loading && !error && !open && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
          >
            Recommend me a car
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
