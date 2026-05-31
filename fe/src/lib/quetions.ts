type QuestionType = "text" | "single_select" | "multi_select";

interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
}

export const questions: Question[] = [
  {
    id: 1,
    question: "What's your budget range?",
    type: "single_select",
    options: ["Under $30k", "$30k – $50k", "$50k – $80k", "$80k+"],
  },
  {
    id: 2,
    question: "What fuel type do you prefer?",
    type: "multi_select",
    options: ["Gasoline", "Hybrid", "Plug-in Hybrid", "Electric", "Diesel"],
  },
  {
    id: 3,
    question: "What will you mainly use the car for?",
    type: "multi_select",
    options: [
      "Daily Commute",
      "Family",
      "Off-Road / Adventure",
      "Highway",
      "Performance / Track",
      "Cargo / Work",
    ],
  },
  {
    id: 4,
    question: "How many seats do you need?",
    type: "single_select",
    options: ["2 (just me / a partner)", "5 (standard)", "7+ (large family)"],
  },
  {
    id: 5,
    question: "Any must-have features?",
    type: "multi_select",
    options: [
      "Apple CarPlay / Android Auto",
      "AWD / 4WD",
      "Towing capability",
      "Advanced safety tech",
      "Wireless charging",
    ],
  },
];
