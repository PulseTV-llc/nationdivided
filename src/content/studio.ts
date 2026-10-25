/**
 * StockHouse Films — production company, credits, and press copy.
 *
 * Names, biographies, and credits are intentionally empty. Fill them in
 * with information StockHouse Films has approved. Do not invent awards,
 * festival selections, or past credits.
 */

export type Credit = { role: string; name: string | null; bio?: string };

export const studio = {
  name: "StockHouse Films",
  summary:
    "StockHouse Films is an independent production company making documentary films about the people behind the headlines.",
  approach: [
    { title: "Independent storytelling", body: "Funded and edited without a political sponsor or party affiliation." },
    { title: "Cinematic production", body: "Shot with the care of a feature film, because ordinary lives deserve it." },
    { title: "Investigative curiosity", body: "We test claims, follow up, and come back a year later to ask again." },
    { title: "Personal interviews", body: "Long, unhurried conversations in the places people actually live." },
    { title: "Human-centred", body: "Participants are people first. Consent and dignity guide every decision." },
    { title: "Editorial independence", body: "No one outside the production approves the edit." },
  ],
  credits: [
    // From the official poster.
    { role: "Director", name: "Nicole Bright" },
    { role: "Producer", name: "Darius Henry" },
    { role: "Editor", name: "Darius Henry" },
    { role: "Featured Music", name: "Various Artists" },
  ] as Credit[],
};

export const press = {
  synopsis: [
    "Nation Divided is a feature-length documentary about political polarization in America, told through the lives of everyday people rather than politicians and pundits.",
    "Beginning with interviews recorded during the 2024 presidential election and continuing with new interviews filmed after it, the film spends particular time with Americans who voted for Donald Trump: why they made that choice, what they hoped would change, and how they feel about the country today. Some are satisfied, some disappointed, many conflicted.",
    "Combining intimate day-in-the-life filmmaking, archival material, expert context, and difficult conversations between people who disagree, Nation Divided does not tell its audience which side to take. It asks what we lose when we stop listening, and what it might take to start again.",
  ],
  directorsStatement: null as string | null,
  productionNotes: [
    { label: "Title", value: "Nation Divided" },
    { label: "Production company", value: "StockHouse Films" },
    { label: "Format", value: "Feature documentary" },
    { label: "Running time", value: "Approx. 90 minutes" },
    { label: "Genre", value: "Political / Social / Investigative / Human interest" },
    { label: "Status", value: "In development" },
    { label: "Country", value: "United States" },
    { label: "Language", value: "English" },
  ],
};
