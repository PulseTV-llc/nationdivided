/** "Beyond the Ballot" — the film's premise told in five chapters. */

export type Chapter = {
  id: string;
  number: string;
  title: string;
  kicker: string;
  body: string;
  question: string;
  tone: "crimson" | "steel" | "gold" | "ivory";
};

export const chapters: Chapter[] = [
  {
    id: "the-vote",
    number: "01",
    title: "The Vote",
    kicker: "November 2024",
    body: "A single mark on a ballot carries a whole life behind it: a paycheck, a worry, a memory, a hope for the kids. We started filming during the 2024 election, asking people to explain the choice they were about to make.",
    question: "Why did you vote the way you did?",
    tone: "ivory",
  },
  {
    id: "the-expectation",
    number: "02",
    title: "The Expectation",
    kicker: "What was promised",
    body: "Every vote is a bet on the future. We asked people what they expected to change, for the country and for themselves, and wrote down their answers.",
    question: "What did you hope would be different?",
    tone: "crimson",
  },
  {
    id: "the-reality",
    number: "03",
    title: "The Reality",
    kicker: "After the ballots were counted",
    body: "Then we went back. Same people, new questions. Some are satisfied. Some are disappointed. Many are somewhere in between, and willing to say so on camera.",
    question: "How does the country look to you now?",
    tone: "steel",
  },
  {
    id: "the-consequences",
    number: "04",
    title: "The Consequences",
    kicker: "At the kitchen table",
    body: "Policy becomes personal at work, at the grocery store, at the dinner table. We follow participants through ordinary days to see where political decisions actually land.",
    question: "What has changed in your everyday life?",
    tone: "gold",
  },
  {
    id: "the-conversation",
    number: "05",
    title: "The Conversation",
    kicker: "Across the divide",
    body: "Finally, the hardest part: listening. Friends, families, and coworkers who disagree talk to each other, and we document what is lost and what is still possible.",
    question: "Can we still understand each other?",
    tone: "ivory",
  },
];

/** Statements used by "The Divide" scroll sequence on the homepage. */
export const divideStatements = [
  { id: "same", text: "We see the same country." },
  { id: "reality", text: "We don't always see the same reality." },
  { id: "listen", text: "But what happens when we listen?" },
];
