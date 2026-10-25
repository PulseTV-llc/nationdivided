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
  "This page shows how a participant's story will be presented once they have approved it for publication.",
  "Long-form text from the participant's interviews will appear here: who they are, where they live, how they came to their vote, and what has happened since.",
  "Nothing on this page describes a real person.",
];

export const people: Participant[] = [
  {
    slug: "participant-01",
    placeholder: true,
    displayName: "Participant One",
    location: null,
    role: "Story in production",
    chapter: "The Vote",
    summary: "A layout placeholder for a participant whose story begins at the ballot box.",
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
    summary: "A layout placeholder for a participant whose story centres on what they hoped would change.",
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
    summary: "A layout placeholder for a participant reflecting on life after the election.",
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
    summary: "A layout placeholder for a participant and the people in their life who see things differently.",
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
