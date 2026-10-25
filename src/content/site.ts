/**
 * Site-wide copy and settings.
 *
 * The casting address is real. Press and general addresses still use the
 * reserved `.example` domain until StockHouse Films supplies real ones.
 */

export const site = {
  title: "Nation Divided",
  studio: "StockHouse Films",
  tagline: "One Nation. Millions of Stories.",
  description:
    "An independent documentary exploring the people, beliefs, and personal stories behind America's political divide.",
  logline:
    "Through intimate interviews recorded before and after the 2024 election, Nation Divided follows everyday Americans beyond the ballot to ask what they hoped for, what changed, and whether people who disagree can still understand each other.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  format: "Feature documentary · approx. 90 minutes",
  genre: "Political · Social · Investigative · Human Interest",
  status: "In development",

  contact: {
    casting: "casting@stockhousefilms.org",
    press: "press@stockhousefilms.example",
    general: "hello@stockhousefilms.example",
  },

  social: {
    /** Official StockHouse Films YouTube channel URL. Leave empty until confirmed. */
    youtubeChannel: "",
    instagram: "",
  },

  phrases: [
    "Beyond the ballot is a human story.",
    "Different beliefs. Shared consequences.",
    "What happens after the vote?",
    "Every vote has a story.",
    "Behind every political opinion is a person.",
  ],
} as const;

export type NavItem = { label: string; href: string; index: string };

export const nav: NavItem[] = [
  { label: "Home", href: "/", index: "00" },
  { label: "The Film", href: "/film", index: "01" },
  { label: "The Story", href: "/#story", index: "02" },
  { label: "The Questions", href: "/questions", index: "03" },
  { label: "People", href: "/stories", index: "04" },
  { label: "Casting", href: "/casting", index: "05" },
  { label: "About", href: "/about", index: "06" },
  { label: "Press", href: "/press", index: "07" },
];

export const editorialPrinciples = [
  {
    title: "No predetermined conclusion",
    body: "We begin with questions, not a verdict. The film is not designed to move anyone toward a party or candidate.",
  },
  {
    title: "Claims are checked",
    body: "Statements of fact are scrutinized and attributed. Personal experience is presented as personal experience.",
  },
  {
    title: "People are not props",
    body: "Participants are treated as people with full lives, not as symbols for a side. Their consent comes first.",
  },
  {
    title: "Contradiction is allowed",
    body: "People can hold mixed feelings. We document that complexity instead of flattening it.",
  },
];
