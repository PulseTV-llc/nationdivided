/** Casting page copy, FAQ, and application option lists. */

export const casting = {
  headline: ["Your vote was counted.", "Now we want to hear your story."],
  altHeadline: "What happened after you voted?",
  intro: [
    "Did you vote for Donald Trump in 2024?",
    "Whether you're satisfied with the direction of the country, disappointed, or somewhere in between, we want to understand your experience.",
    "Nation Divided is looking for individuals willing to share their stories in an intimate documentary. We may spend a day with you, explore your community, meet people important to your life, and document what your everyday reality looks like.",
  ],
  closer: ["This isn't about giving the ‘right’ answer.", "It's about telling your story."],

  welcome: [
    "Strongly support the president",
    "Feel satisfied with the country's direction",
    "Feel disappointed",
    "Have mixed feelings",
    "Are reconsidering what you expected",
    "Have seen real changes in your life",
  ],

  involves: [
    { title: "A day together", body: "A small crew spends a day with you, following an ordinary day in your life." },
    { title: "An interview at home", body: "A long, unhurried conversation in a place where you feel comfortable." },
    { title: "Your work and routine", body: "If you're willing, we film where you work and the things you do every day." },
    { title: "People who matter to you", body: "Family members or friends who choose to take part. Only people who say yes." },
    { title: "Places with meaning", body: "Somewhere in your community that matters to your story." },
    { title: "Honest questions", body: "About your beliefs, your expectations, and what has happened since. Some may be difficult." },
  ],

  eligibility: [
    "You are 18 or older and live in the United States.",
    "You voted for Donald Trump in the 2024 presidential election (this is the current casting focus).",
    "You're willing to talk openly about your experience, whatever it is.",
    "You may be available for filming in the coming months. Dates are discussed later.",
  ],

  process: [
    { step: "01", title: "Apply", body: "Tell us about yourself. It takes 10–15 minutes. A video is optional." },
    { step: "02", title: "We read every application", body: "Our casting team reviews each one by hand. No algorithms decide." },
    { step: "03", title: "A conversation", body: "If your story may fit the film, we call you to talk. No commitment." },
    { step: "04", title: "Agreement before filming", body: "Nothing is filmed until we've agreed dates, locations, and signed releases." },
  ],

  faq: [
    {
      q: "Will everyone who applies be filmed?",
      a: "No. We expect many more applications than we can film. Applying does not guarantee you'll be contacted or selected. We read every application, and we'll be in touch if your story may be a fit.",
    },
    {
      q: "Do I have to praise or criticize the president?",
      a: "No. We're not looking for a particular opinion or conclusion. Supporters, critics, and people with mixed feelings are all welcome within the casting focus. We want your honest experience.",
    },
    {
      q: "Will my application be made public?",
      a: "No. Applications are private and are only seen by authorized members of the StockHouse Films casting team. We never publish application answers.",
    },
    {
      q: "Does applying give you permission to film me or use my image?",
      a: "No. Applying only lets us read your application and contact you about casting. Any filming requires a separate conversation and signed release forms that explain exactly how footage may be used.",
    },
    {
      q: "Will my family or friends be filmed?",
      a: "Only if they want to be. We never film anyone who hasn't agreed, and each person signs their own release.",
    },
    {
      q: "Can I use a different name or keep my location private?",
      a: "We can talk about this before filming. Tell us about any privacy concerns in your application or when we speak.",
    },
    {
      q: "What does a filming day look like?",
      a: "It varies. Usually a small crew, an interview, and time spent following your normal routine. Schedules, locations, and anything you'd rather not film are agreed in advance.",
    },
    {
      q: "Can I withdraw?",
      a: "Yes. You can withdraw your application at any time by emailing the casting team, and we will delete it. Participation is always voluntary.",
    },
    {
      q: "Do I need to send a video?",
      a: "No. A short introduction video can help us get to know you, but it's optional. Applications without video are read just as carefully.",
    },
  ],

  privacy: [
    {
      title: "What we collect",
      body: "Only what we need to consider you for the film: contact details, your city and state, your answers, and an optional video.",
    },
    {
      title: "Who can see it",
      body: "Only authorized StockHouse Films casting staff, who sign in to a secured review system. Your answers are never published or sold.",
    },
    {
      title: "How it's stored",
      body: "In a secured database and private file storage. Videos are never publicly accessible and can only be viewed by signed-in staff.",
    },
    {
      title: "No tracking",
      body: "We don't run advertising or analytics scripts on the application, and we don't profile applicants by political views.",
    },
    {
      title: "How long we keep it",
      body: "Applications that aren't selected are deleted after the casting period. You can ask us to delete yours at any time.",
    },
  ],
};

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico",
  "Guam", "U.S. Virgin Islands", "American Samoa", "Northern Mariana Islands",
] as const;

export const VOTE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "prefer_to_discuss", label: "I'd rather explain when we talk" },
] as const;

export const FEELING_OPTIONS = [
  { value: "very_satisfied", label: "Very satisfied" },
  { value: "mostly_satisfied", label: "Mostly satisfied" },
  { value: "mixed", label: "Mixed feelings" },
  { value: "mostly_disappointed", label: "Mostly disappointed" },
  { value: "very_disappointed", label: "Very disappointed" },
  { value: "hard_to_say", label: "Hard to say" },
] as const;

export const ISSUE_OPTIONS = [
  "Cost of living",
  "Jobs & wages",
  "Taxes",
  "Immigration & the border",
  "Healthcare",
  "Energy & gas prices",
  "Trade & tariffs",
  "Crime & public safety",
  "Education",
  "Housing",
  "Government spending",
  "Foreign policy",
  "Abortion",
  "Gun rights",
  "Religious liberty",
  "Free speech",
  "Veterans",
  "Agriculture",
  "Election integrity",
  "Something else",
] as const;

export const COMFORT_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe — I'd like to talk first" },
  { value: "no", label: "Not yet" },
] as const;

export const INTRO_OPTIONS = [
  { value: "yes", label: "Yes, possibly" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
] as const;

/** Introduction video limits — enforced on the client AND the server. */
export const VIDEO_LIMITS = {
  maxBytes: 300 * 1024 * 1024, // 300 MB
  maxLabel: "300 MB",
  types: {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-m4v": "m4v",
  } as Record<string, string>,
  typesLabel: "MP4, MOV, M4V or WebM",
  suggestedLength: "1–3 minutes",
};
