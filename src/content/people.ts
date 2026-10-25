import type { ImageAsset, PlaceholderScene } from "./media";

/**
 * Documentary participants.
 *
 * EVERY ENTRY BELOW IS A LAYOUT PLACEHOLDER. No real person is described.
 * Replace an entry only after the participant has signed a release that
 * covers publication of their name, image, location and words, and set
 * `placeholder: false`.
 *
 * Quotes must be transcribed from recorded interviews. Never paraphrase a
 * participant into a quote.
 */

export type Participant = {
  slug: string;
  placeholder: boolean;
  displayName: string;
  location: string | null;
  role: string; // e.g. "Small-business owner"
  chapter: string; // which film chapter they appear in
  summary: string;
  story: string[];
  quotes: { text: string; context?: string }[];
  portrait: ImageAsset | null;
  scene: PlaceholderScene;
  /** YouTube ID of an approved documentary excerpt. */
  excerptYouTubeId: string | null;
};

const placeholderStory = [
  "This story is still being filmed.",
  "Once the participant has reviewed and approved it, their story will be told here in their own words: who they are, where they live, how they came to their vote, and what has happened since.",
];

export const people: Participant[] = [
  {
    slug: "participant-01",
    placeholder: true,
    displayName: "Participant One",
    location: null,
    role: "Story in production",
    chapter: "The Vote",
    summary: "A story that begins at the ballot box.",
    story: placeholderStory,
    quotes: [],
    portrait: null,
    scene: "portrait",
    excerptYouTubeId: null,
  },
  {
    slug: "participant-02",
    placeholder: true,
    displayName: "Participant Two",
    location: null,
    role: "Story in production",
    chapter: "The Expectation",
    summary: "A story about what they hoped would change.",
    story: placeholderStory,
    quotes: [],
    portrait: null,
    scene: "porch",
    excerptYouTubeId: null,
  },
  {
    slug: "participant-03",
    placeholder: true,
    displayName: "Participant Three",
    location: null,
    role: "Story in production",
    chapter: "The Reality",
    summary: "A story about life after the election.",
    story: placeholderStory,
    quotes: [],
    portrait: null,
    scene: "kitchen",
    excerptYouTubeId: null,
  },
  {
    slug: "participant-04",
    placeholder: true,
    displayName: "Participant Four",
    location: null,
    role: "Story in production",
    chapter: "The Conversation",
    summary: "A story about the people in their life who see things differently.",
    story: placeholderStory,
    quotes: [],
    portrait: null,
    scene: "diner",
    excerptYouTubeId: null,
  },
];

export function getParticipant(slug: string) {
  return people.find((p) => p.slug === slug) ?? null;
}
