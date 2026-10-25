import type { Metadata } from "next";
import { QuestionsExperience } from "@/components/storytelling/questions-experience";

export const metadata: Metadata = {
  title: "The Questions",
  description:
    "The questions at the heart of Nation Divided. No poll, no sign-up, no affiliation required — just questions worth sitting with.",
  alternates: { canonical: "/questions" },
};

export default function QuestionsPage() {
  return <QuestionsExperience />;
}
