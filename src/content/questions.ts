/**
 * "The Questions" — prompts for reflection. Visitors are never asked to
 * reveal how they vote, and nothing they type here leaves their device.
 */

export type Question = {
  id: string;
  text: string;
  theme: "Belief" | "Trust" | "Family" | "Identity" | "Country" | "Listening";
};

export const questions: Question[] = [
  { id: "reconsider", text: "What would make you reconsider your political beliefs?", theme: "Belief" },
  { id: "friendship", text: "Has politics changed a friendship or family relationship?", theme: "Family" },
  { id: "dream", text: "What does the American Dream mean to you today?", theme: "Country" },
  { id: "promise", text: "What promise mattered most when you voted?", theme: "Belief" },
  { id: "trust", text: "How do you know when a political leader deserves your trust?", theme: "Trust" },
  { id: "misunderstand", text: "What do you think people misunderstand about you?", theme: "Identity" },
  {
    id: "watch",
    text: "If someone who disagreed with you watched your story, what would you want them to understand?",
    theme: "Listening",
  },
  { id: "changed-mind", text: "When did you last change your mind about something important?", theme: "Belief" },
  { id: "truth", text: "Who do you trust to tell you the truth about the country?", theme: "Trust" },
  { id: "neighbor", text: "What do you owe a neighbor you disagree with?", theme: "Listening" },
  { id: "dinner", text: "What topic do you avoid at the dinner table, and why?", theme: "Family" },
  { id: "proud", text: "What about this country still makes you proud?", theme: "Country" },
];
