/**
 * Documentary timeline.
 *
 * Two kinds of entries:
 *  - "fact": a public, verifiable event. MUST include at least one source.
 *  - "production": a milestone in the making of the film, stated by
 *    StockHouse Films (no external source required).
 *
 * Do not add statistics, quotes, or claims without a source you have
 * checked yourself. `validateTimeline()` below fails the build if a
 * fact entry is missing a source.
 */

export type Source = { label: string; url: string };

export type TimelineEntry = {
  id: string;
  era: "2024" | "2025" | "2026" | "beyond";
  date: string; // human-readable, e.g. "Nov 5, 2024"
  title: string;
  body: string;
  kind: "fact" | "production";
  sources?: Source[];
  /** Optional image/clip from the media registry (cleared material only). */
  mediaIndex?: number;
};

export const eras = [
  { id: "2024", year: "2024", title: "The Election" },
  { id: "2025", year: "2025", title: "The Aftermath" },
  { id: "2026", year: "2026", title: "The Conversation Continues" },
  { id: "beyond", year: "Beyond", title: "The Story Is Still Unfolding" },
] as const;

export const timeline: TimelineEntry[] = [
  {
    id: "interviews-2024",
    era: "2024",
    date: "2024",
    title: "Cameras roll during the campaign",
    body: "StockHouse Films records original interviews with voters during the 2024 election period, asking why they planned to vote the way they did.",
    kind: "production",
  },
  {
    id: "election-day",
    era: "2024",
    date: "Nov 5, 2024",
    title: "Election Day",
    body: "Americans vote in the 2024 general election for president, Congress, and state and local offices.",
    kind: "fact",
    sources: [
      {
        label: "Federal Election Commission — Election results and voting information",
        url: "https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/",
      },
    ],
  },
  {
    id: "electors",
    era: "2024",
    date: "Dec 17, 2024",
    title: "Electors cast their votes",
    body: "Presidential electors meet in each state and cast their votes for president and vice president.",
    kind: "fact",
    sources: [{ label: "National Archives — 2024 Electoral College", url: "https://www.archives.gov/electoral-college/2024" }],
  },
  {
    id: "count",
    era: "2025",
    date: "Jan 6, 2025",
    title: "Congress counts the electoral votes",
    body: "In a joint session, Congress counts the electoral votes and confirms Donald Trump as the winner of the 2024 presidential election.",
    kind: "fact",
    sources: [{ label: "National Archives — 2024 Electoral College", url: "https://www.archives.gov/electoral-college/2024" }],
  },
  {
    id: "inauguration",
    era: "2025",
    date: "Jan 20, 2025",
    title: "Inauguration",
    body: "Donald Trump is sworn in as the 47th president of the United States. The Twentieth Amendment sets noon on January 20 as the start of the term.",
    kind: "fact",
    sources: [
      { label: "U.S. Constitution, 20th Amendment (Constitution Annotated)", url: "https://constitution.congress.gov/constitution/amendment-20/" },
    ],
  },
  {
    id: "return-interviews",
    era: "2025",
    date: "2025",
    title: "We go back",
    body: "The production returns to people interviewed during the campaign and begins new interviews about life after the election.",
    kind: "production",
  },
  {
    id: "casting-open",
    era: "2026",
    date: "2026",
    title: "Casting opens for day-in-the-life stories",
    body: "StockHouse Films invites people who voted for Donald Trump in 2024, whatever they think now, to share their story on camera.",
    kind: "production",
  },
  {
    id: "midterms",
    era: "2026",
    date: "Nov 3, 2026",
    title: "Midterm elections",
    body: "Federal law sets the general election for Congress on the Tuesday after the first Monday in November of even-numbered years.",
    kind: "fact",
    sources: [{ label: "2 U.S. Code § 7 (Cornell LII)", url: "https://www.law.cornell.edu/uscode/text/2/7" }],
  },
  {
    id: "release",
    era: "beyond",
    date: "To be announced",
    title: "The film",
    body: "Nation Divided is in development. Release plans will be announced here, and nowhere else first.",
    kind: "production",
  },
];

export function validateTimeline(entries: TimelineEntry[] = timeline) {
  const missing = entries.filter((e) => e.kind === "fact" && (!e.sources || e.sources.length === 0));
  if (missing.length) {
    throw new Error(`Timeline fact entries need sources: ${missing.map((m) => m.id).join(", ")}`);
  }
  return entries;
}
