/*
 * My Growth Journey
 * Supabase is the primary database. The browser keeps an offline working copy,
 * while JSON export/import remains a portable independent backup.
 */

const LEGACY_STORAGE_KEY = "growthJourneyJournal.v1";
const STORAGE_KEY_PREFIX = "growthJourneyJournal.cloud.v1";
let PERIOD_START = localDateISO();
let PERIOD_END = addDaysISO(PERIOD_START, 29);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
let lastOverallProgress = null;
let currentUserId = null;

const HABIT_COLUMNS = ["speexx", "speaking", "recording", "academyReview", "foodPrep", "meal", "movement", "break", "journal", "rt"];
const HABIT_TARGETS = {
  speexx: 18,
  speaking: 12,
  recording: 4,
  academyReview: 12,
  rt: 0,
  foodPrep: 12,
  meal: 16,
  movement: 6,
  break: 6,
  journal: 12
};

const defaultGoals = [
  {
    id: "academy-goal",
    category: "academy",
    label: "Career goal 1",
    title: "Academy reliability and project preparation",
    description: "During this cycle, I will keep Orange Academy as my main priority: record each daily, group, and masterpiece task, finish my responsibility by its deadline, and complete 12 focused review sessions.",
    steps: [
      { id: "academy-1", text: "Record every daily, group, and masterpiece task with its deadline", done: false },
      { id: "academy-2", text: "Complete daily tasks and agreed group responsibilities by their deadlines", done: false },
      { id: "academy-3", text: "Complete 12 short review sessions across the cycle", done: false },
      { id: "academy-4", text: "Ask for help before a blocked task becomes late", done: false }
    ]
  },
  {
    id: "english-goal",
    category: "english",
    label: "Career goal 2",
    title: "Strengthen English for work and Academy",
    description: "During this cycle, I will keep English important without making Academy days impossible: 18 short Speexx sessions, 12 speaking sessions, and four recordings.",
    steps: [
      { id: "english-1", text: "Complete 18 Speexx sessions of at least 10 minutes", done: false },
      { id: "english-2", text: "Complete 12 speaking sessions of at least 5 minutes", done: false },
      { id: "english-3", text: "Make four short English recordings", done: false },
      { id: "english-4", text: "Reuse at least four corrections or useful phrases", done: false }
    ]
  },
  {
    id: "presentation-goal",
    category: "personality",
    label: "Personality goal 1",
    title: "Improve my presentation skills",
    description: "During this cycle, I will use Academy topics for two short presentation practices and apply one useful correction from each.",
    steps: [
      { id: "presentation-1", text: "Complete one short presentation practice in the first half", done: false },
      { id: "presentation-2", text: "Complete one short presentation practice in the second half", done: false },
      { id: "presentation-3", text: "Apply one useful correction from each practice", done: false }
    ]
  },
  {
    id: "boundaries-goal",
    category: "personality",
    label: "Personality goal 2",
    title: "Practice boundaries and become comfortable alone",
    description: "During this cycle, I will take six intentional solo breaks and use a clear boundary sentence when I need time before agreeing.",
    steps: [
      { id: "boundaries-1", text: "Take six intentional solo breaks", done: false },
      { id: "boundaries-2", text: "Use a pause sentence before making commitments", done: false },
      { id: "boundaries-3", text: "Write four brief boundary reflections", done: false }
    ]
  },
  {
    id: "health-goal",
    category: "health",
    label: "Health goal",
    title: "Build a realistic food and movement routine",
    description: "During this cycle, I will support my energy with 12 prepared Academy meals, 16 balanced meals, and six short movement sessions.",
    steps: [
      { id: "health-1", text: "Prepare Academy food on 12 days", done: false },
      { id: "health-2", text: "Eat a balanced meal on 16 days", done: false },
      { id: "health-3", text: "Complete six short movement sessions", done: false }
    ]
  }
];

const defaultRtSessions = [
  {
    id: "session-4",
    label: "Required • Session 4",
    title: "Registration",
    stretch: false,
    tasks: [
      { id: "s4-1", text: "Learn validation and password hashing", done: false },
      { id: "s4-2", text: "Validate username, email, and password", done: false },
      { id: "s4-3", text: "Detect duplicate accounts", done: false },
      { id: "s4-4", text: "Return only sanitized user data", done: false },
      { id: "s4-5", text: "Test valid and invalid registration", done: false },
      { id: "s4-6", text: "Explain hashing versus encryption", done: false }
    ]
  },
  {
    id: "session-5",
    label: "Required • Session 5",
    title: "Login and authentication",
    stretch: false,
    tasks: [
      { id: "s5-1", text: "Learn authentication versus authorization", done: false },
      { id: "s5-2", text: "Implement login and password comparison", done: false },
      { id: "s5-3", text: "Add authentication middleware", done: false },
      { id: "s5-4", text: "Add current-user and logout behavior", done: false },
      { id: "s5-5", text: "Test valid, invalid, and expired credentials", done: false }
    ]
  },
  {
    id: "session-6",
    label: "Required • Session 6",
    title: "Authorization",
    stretch: false,
    tasks: [
      { id: "s6-1", text: "Implement authenticated-user rules", done: false },
      { id: "s6-2", text: "Implement artist-only rules", done: false },
      { id: "s6-3", text: "Implement owner-only rules", done: false },
      { id: "s6-4", text: "Create a permission matrix", done: false },
      { id: "s6-5", text: "Explain 401, 403, and 404", done: false }
    ]
  },
  {
    id: "session-7",
    label: "Stretch • Session 7",
    title: "Artwork creation",
    stretch: true,
    tasks: [
      { id: "s7-1", text: "Learn allowlists and ownership boundaries", done: false },
      { id: "s7-2", text: "Implement artist-only creation", done: false },
      { id: "s7-3", text: "Test success, visitor, role, and invalid cases", done: false }
    ]
  },
  {
    id: "session-8",
    label: "Stretch • Session 8",
    title: "Artwork reading",
    stretch: true,
    tasks: [
      { id: "s8-1", text: "Implement list and detail endpoints", done: false },
      { id: "s8-2", text: "Add pagination, search, and filtering", done: false },
      { id: "s8-3", text: "Test valid, invalid, and missing artwork", done: false }
    ]
  }
];

const defaultResources = [
  {
    id: "resource-boundaries-book",
    title: "Set Boundaries, Find Peace",
    creator: "Nedra Glover Tawwab",
    category: "Boundaries",
    type: "Book",
    url: "https://www.penguinrandomhouse.com/books/647316/set-boundaries-find-peace-by-nedra-glover-tawwab/",
    status: "Not started",
    thisWeek: false,
    tracking: "Pages",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Read for 10–15 minutes and practise one respectful boundary sentence."
  },
  {
    id: "resource-speaking-video",
    title: "How to Speak So That People Want to Listen",
    creator: "Julian Treasure • TED",
    category: "Presentation",
    type: "Video",
    url: "https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen",
    status: "Not started",
    thisWeek: true,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Choose one vocal technique and use it in this week’s five-minute recording."
  },
  {
    id: "resource-presentation-video",
    title: "TED’s Secret to Great Public Speaking",
    creator: "Chris Anderson • TED",
    category: "Presentation",
    type: "Video",
    url: "https://www.ted.com/talks/chris_anderson_ted_s_secret_to_great_public_speaking",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Write the single idea you want your audience to understand."
  },
  {
    id: "resource-speexx",
    title: "Speexx English Practice",
    creator: "Speexx",
    category: "English",
    type: "Course",
    url: "https://www.speexx.com/interactive/",
    status: "In progress",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Complete at least 10 minutes, then record five minutes of speaking."
  },
  {
    id: "resource-british-council",
    title: "B2 Speaking Practice",
    creator: "British Council LearnEnglish",
    category: "English",
    type: "Course",
    url: "https://learnenglish.britishcouncil.org/free-resources/speaking/b2",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Choose one lesson and repeat its useful phrases aloud."
  },
  {
    id: "resource-mdn",
    title: "Learn Web Development",
    creator: "MDN Web Docs",
    category: "Web development",
    type: "Course",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Use the module matching the current Orange topic; do not study the whole curriculum at once."
  },
  {
    id: "resource-react",
    title: "React Quick Start",
    creator: "React documentation",
    category: "Web development",
    type: "Guide",
    url: "https://react.dev/learn",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Read this when Orange or RT reaches React, then rebuild one small example yourself."
  },
  {
    id: "resource-movement",
    title: "Physical Activity Guidance",
    creator: "World Health Organization",
    category: "Health",
    type: "Guide",
    url: "https://www.who.int/initiatives/behealthy/physical-activity",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Use it as long-term guidance while keeping this month’s routine manageable."
  },
  {
    id: "resource-eatwell",
    title: "The Eatwell Guide",
    creator: "NHS",
    category: "Health",
    type: "Guide",
    url: "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "",
    action: "Choose one realistic food-preparation improvement for Academy days."
  },
  {
    id: "resource-creative-break",
    title: "My creative break list",
    creator: "Personal list",
    category: "Creative break",
    type: "Guide",
    url: "",
    status: "Not started",
    thisWeek: false,
    tracking: "Status only",
    completedUnits: 0,
    totalUnits: 0,
    lesson: "Add books, movies, drawing exercises, or curiosity topics I genuinely want to explore.",
    action: "Choose one enjoyable activity without turning it into another performance goal."
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysISO(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}

function fullPeriodLabel(start = PERIOD_START, end = PERIOD_END) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return `${formatDate(start, options)} – ${formatDate(end, options)}`;
}

function makeId(prefix = "item") {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dateRange(start, end) {
  const dates = [];
  const cursor = new Date(`${start}T12:00:00`);
  const finalDate = new Date(`${end}T12:00:00`);
  while (cursor <= finalDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function makeHabits(start = PERIOD_START, end = PERIOD_END) {
  return dateRange(start, end).map((date) => ({
    date,
    plan: "",
    reviewNote: "",
    speexx: false,
    speaking: false,
    recording: false,
    academyReview: false,
    rt: false,
    foodPrep: false,
    meal: false,
    movement: false,
    break: false,
    journal: false
  }));
}

function createDefaultState(start = localDateISO()) {
  const end = addDaysISO(start, 29);
  PERIOD_START = start;
  PERIOD_END = end;
  return {
    version: 9,
    currentPeriod: { start, end, createdAt: new Date().toISOString() },
    theme: "light",
    activeTab: "overview",
    motivation: "This month, Orange Academy is my main work priority and English is a serious daily career habit. I will protect time to review what I learn, keep RT small and optional, and use this journal to record evidence without turning every day into a performance test.",
    goals: clone(defaultGoals),
    habits: makeHabits(start, end),
    todos: [],
    lastTodoCarry: null,
    cardOrder: ["todos", "academy-review", "today-actions", "week-snapshot", "rhythms"],
    archives: [],
    assignments: [],
    rtSessions: clone(defaultRtSessions),
    ideas: [
      { id: makeId("idea"), name: "Idea 1", problem: "", users: "", features: "", technology: "", risk: "", feedback: "" },
      { id: makeId("idea"), name: "Idea 2", problem: "", users: "", features: "", technology: "", risk: "", feedback: "" },
      { id: makeId("idea"), name: "Idea 3", problem: "", users: "", features: "", technology: "", risk: "", feedback: "" }
    ],
    resources: clone(defaultResources),
    entries: [],
    drafts: {},
    archivedHabits: [],
    deepReflections: {
      baseline: ["", "", "", "", "", ""],
      end: ["", "", "", "", "", ""]
    }
  };
}

function normalizeResource(resource) {
  const legacyProgress = Math.max(0, Math.min(100, Number(resource?.progress) || 0));
  const thisWeek = Boolean(resource?.thisWeek) || resource?.status === "This week";
  let status = resource?.status;
  if (status === "Saved" || status === "This week") status = legacyProgress > 0 ? "In progress" : "Not started";
  if (status === "Finished" || legacyProgress === 100) status = "Done";
  if (!["Not started", "In progress", "Done"].includes(status)) status = "Not started";

  const allowedTracking = ["Status only", "Pages", "Chapters", "Lessons"];
  const tracking = allowedTracking.includes(resource?.tracking)
    ? resource.tracking
    : resource?.type === "Book" ? "Pages" : "Status only";
  const completedUnits = Math.max(0, Math.floor(Number(resource?.completedUnits) || 0));
  const totalUnits = Math.max(0, Math.floor(Number(resource?.totalUnits) || 0));
  const { progress: legacyValue, ...resourceWithoutLegacyProgress } = resource || {};

  return {
    ...resourceWithoutLegacyProgress,
    status,
    thisWeek: status === "Done" ? false : thisWeek,
    tracking,
    completedUnits: totalUnits ? Math.min(completedUnits, totalUnits) : completedUnits,
    totalUnits
  };
}

function normalizeState(stored) {
  if (stored && !stored.currentPeriod) {
    const fresh = createDefaultState(localDateISO());
    const legacyDates = Array.isArray(stored.habits) ? stored.habits.map((day) => day.date).filter(Boolean).sort() : [];
    fresh.theme = stored.theme === "dark" ? "dark" : "light";
    fresh.archives = [{
      id: makeId("archive"),
      start: legacyDates[0] || "2026-09-11",
      end: legacyDates.at(-1) || "2026-10-10",
      label: "Imported previous journal",
      savedAt: new Date().toISOString(),
      data: clone(stored)
    }];
    return fresh;
  }

  const start = stored?.currentPeriod?.start || localDateISO();
  const end = stored?.currentPeriod?.end || addDaysISO(start, 29);
  PERIOD_START = start;
  PERIOD_END = end;
  const defaults = createDefaultState(start);
  defaults.currentPeriod.end = end;
  PERIOD_END = end;
  const normalized = {
    ...defaults,
    ...stored,
    version: 9,
    currentPeriod: { ...defaults.currentPeriod, ...(stored?.currentPeriod || {}) },
    goals: Array.isArray(stored?.goals) ? stored.goals : defaults.goals,
    habits: Array.isArray(stored?.habits) && stored.habits.length ? stored.habits : defaults.habits,
    todos: Array.isArray(stored?.todos) ? stored.todos : [],
    lastTodoCarry: stored?.lastTodoCarry &&
      typeof stored.lastTodoCarry.fromDate === "string" &&
      typeof stored.lastTodoCarry.toDate === "string" &&
      Array.isArray(stored.lastTodoCarry.todoIds)
        ? stored.lastTodoCarry
        : null,
    cardOrder: Array.isArray(stored?.cardOrder) ? stored.cardOrder : defaults.cardOrder,
    archives: Array.isArray(stored?.archives) ? stored.archives : [],
    assignments: Array.isArray(stored?.assignments) ? stored.assignments : [],
    rtSessions: Array.isArray(stored?.rtSessions) ? stored.rtSessions : defaults.rtSessions,
    ideas: Array.isArray(stored?.ideas) ? stored.ideas : defaults.ideas,
    resources: Array.isArray(stored?.resources) ? stored.resources : defaults.resources,
    entries: Array.isArray(stored?.entries) ? stored.entries : [],
    drafts: stored?.drafts && typeof stored.drafts === "object" ? stored.drafts : {},
    archivedHabits: Array.isArray(stored?.archivedHabits) ? stored.archivedHabits : [],
    deepReflections: {
      baseline: Array.isArray(stored?.deepReflections?.baseline) ? stored.deepReflections.baseline : defaults.deepReflections.baseline,
      end: Array.isArray(stored?.deepReflections?.end) ? stored.deepReflections.end : defaults.deepReflections.end
    }
  };

  normalized.resources = normalized.resources.map(normalizeResource);

  PERIOD_START = normalized.currentPeriod.start;
  PERIOD_END = normalized.currentPeriod.end;
  const oldOutsidePeriod = normalized.habits.filter((day) => day.date < PERIOD_START || day.date > PERIOD_END);
  const archivedByDate = new Map(normalized.archivedHabits.map((day) => [day.date, day]));
  oldOutsidePeriod.forEach((day) => archivedByDate.set(day.date, day));
  normalized.archivedHabits = [...archivedByDate.values()];
  const existingHabits = new Map(normalized.habits.map((day) => [day.date, day]));
  normalized.habits = makeHabits().map((newDay) => ({
    ...newDay,
    ...(existingHabits.get(newDay.date) || {})
  }));
  const academyGoal = normalized.goals.find((goal) => goal.id === "academy-goal");
  const oldFinalProjectStep = academyGoal?.steps.find((step) => step.id === "academy-7");
  if (oldFinalProjectStep && Number(stored?.version || 1) < 2) {
    oldFinalProjectStep.text = "Record Orange’s official graduation-project requirements and my questions when they become available";
    oldFinalProjectStep.done = false;
  }

  if (Number(stored?.version || 1) < 3) {
    const textUpdates = new Map([
      ["By October 3, I will submit all assigned Academy work by its deadline, complete my agreed team responsibilities, ask for feedback, and take a measured first step toward the graduation project.", "By October 4, I will submit all assigned Academy work by its deadline, complete my agreed team responsibilities, ask for feedback, and take a measured first step toward the graduation project."],
      ["By October 3, I will complete and verify RT Sessions 4–6. Sessions 7–8 are stretch goals only after the secure core and Academy responsibilities are under control.", "By October 4, I will complete and verify RT Sessions 4–6. Sessions 7–8 are stretch goals only after the secure core and Academy responsibilities are under control."],
      ["By October 3, I will complete four recorded five-minute technical presentations, collect feedback about what the listener understood, and practice slowing down and pausing.", "By October 4, I will complete four recorded five-minute technical presentations, collect feedback about what the listener understood, and practice slowing down and pausing."],
      ["By October 3, I will take at least eight intentional solo breaks, practice three respectful boundary sentences, and write eight reflections about boundaries or people-pleasing.", "By October 4, I will take at least eight intentional solo breaks, practice three respectful boundary sentences, and write eight reflections about boundaries or people-pleasing."],
      ["By October 3, I will prepare Academy food four days each week, eat a balanced meal five days each week, and complete three 30-minute movement sessions each week.", "By October 4, I will prepare Academy food four days each week, eat a balanced meal five days each week, and complete three 30-minute movement sessions each week."],
      ["Write three graduation-project ideas by September 12", "Write three graduation-project ideas by September 13"],
      ["Discuss the ideas with two people or trainers by September 19", "Discuss the ideas with two people or trainers by September 20"],
      ["Recording 1 by September 10", "Recording 1 by September 11"],
      ["Recording 2 by September 17", "Recording 2 by September 18"],
      ["Recording 3 by September 24", "Recording 3 by September 25"],
      ["Recording 4 by October 1", "Recording 4 by October 2"]
    ]);
    normalized.goals.forEach((goal) => {
      if (textUpdates.has(goal.description)) goal.description = textUpdates.get(goal.description);
      goal.steps.forEach((step) => {
        if (textUpdates.has(step.text)) step.text = textUpdates.get(step.text);
      });
    });
    Object.values(normalized.drafts).forEach((draft) => {
      if (!draft?.date) return;
      if (draft.date < PERIOD_START) draft.date = PERIOD_START;
      if (draft.date > PERIOD_END) draft.date = PERIOD_END;
    });
  }

  if (Number(stored?.version || 1) < 6) {
    const goalUpdates = {
      "academy-goal": {
        description: "By October 10, I will keep Orange Academy as my main priority: record every daily, group, and masterpiece task, finish my responsibilities by deadline, and review Academy material on at least 20 days.",
        steps: {
          "academy-1": "Record every daily, group, and masterpiece task with its deadline",
          "academy-2": "Complete daily tasks and agreed group responsibilities by their deadlines",
          "academy-3": "Protect a review block after Academy before optional project work",
          "academy-4": "Rehearse each required Academy presentation twice",
          "academy-5": "Keep masterpiece requirements and next actions visible",
          "academy-6": "Ask for help or feedback before a blocked task becomes late",
          "academy-7": "Record Orange’s official graduation-project requirements and my questions when they become available"
        }
      },
      "rt-goal": {
        description: "Until October 10, RT is maintenance only. I will use at most one small RT block per week when Academy tasks and review are already under control.",
        steps: {
          "rt-goal-1": "Use no more than one planned RT focus block per week",
          "rt-goal-2": "Stop RT work when it competes with Academy deadlines or review",
          "rt-goal-3": "Keep the next RT action tiny and explicit"
        }
      },
      "presentation-goal": {
        description: "By October 10, I will use Academy topics for four short presentation practices, collect feedback, and practice slowing down and pausing."
      },
      "boundaries-goal": {
        description: "By October 10, I will take at least eight intentional solo breaks, practice three respectful boundary sentences, and write eight reflections about boundaries or people-pleasing."
      },
      "health-goal": {
        description: "By October 10, I will prepare Academy food four days each week, eat a balanced meal five days each week, and complete three 30-minute movement sessions each week."
      }
    };
    normalized.goals.forEach((goal) => {
      const update = goalUpdates[goal.id];
      if (!update) return;
      goal.description = update.description;
      if (update.steps) {
        goal.steps.forEach((step) => {
          if (update.steps[step.id]) step.text = update.steps[step.id];
        });
      }
    });
    normalized.assignments.forEach((assignment) => {
      if (assignment.type === "Team") assignment.type = "Group";
      if (assignment.type === "Solo") assignment.type = "Daily";
    });
  }

  if (Number(stored?.version || 1) < 7) {
    const englishDefault = clone(defaultGoals.find((goal) => goal.id === "english-goal"));
    const rtIndex = normalized.goals.findIndex((goal) => goal.id === "rt-goal");
    const englishIndex = normalized.goals.findIndex((goal) => goal.id === "english-goal");
    if (englishIndex === -1) {
      if (rtIndex >= 0) normalized.goals.splice(rtIndex, 1, englishDefault);
      else normalized.goals.splice(Math.min(1, normalized.goals.length), 0, englishDefault);
    } else if (rtIndex >= 0) {
      normalized.goals.splice(rtIndex, 1);
    }
    normalized.goals = normalized.goals.slice(0, 5);
    const presentationGoal = normalized.goals.find((goal) => goal.id === "presentation-goal");
    const presentationDates = {
      "presentation-1": "Recording 1 by September 17",
      "presentation-2": "Recording 2 by September 24",
      "presentation-3": "Recording 3 by October 1",
      "presentation-4": "Recording 4 by October 8"
    };
    presentationGoal?.steps.forEach((step) => {
      if (presentationDates[step.id]) step.text = presentationDates[step.id];
    });
  }

  if (Number(stored?.version || 1) < 8) {
    normalized.goals = clone(defaultGoals);
  }

  const allowedCards = ["todos", "academy-review", "today-actions", "week-snapshot", "rhythms"];
  normalized.cardOrder = [
    ...normalized.cardOrder.filter((id) => allowedCards.includes(id)),
    ...allowedCards.filter((id) => !normalized.cardOrder.includes(id))
  ];
  return normalized;
}

function storageKey() {
  return currentUserId ? `${STORAGE_KEY_PREFIX}.${currentUserId}` : STORAGE_KEY_PREFIX;
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey()) || localStorage.getItem(LEGACY_STORAGE_KEY));
    if (!stored || typeof stored !== "object") return createDefaultState();
    return normalizeState(stored);
  } catch (error) {
    console.warn("Saved journal data could not be read. Starting with a fresh journal.", error);
    return createDefaultState();
  }
}

let state = createDefaultState();
let saveTimer;
let toastTimer;

function saveState(message = "Saved locally; syncing…") {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(state));
    const status = document.querySelector("#save-status");
    if (status) status.textContent = message;
    window.GrowthCloud?.save(state, (cloudMessage) => {
      if (status) status.textContent = cloudMessage;
    });
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (status && status.textContent !== "Cloud save failed") status.textContent = "Saved to cloud";
    }, 1500);
  } catch (error) {
    showToast("This browser could not save your journal.");
    console.error(error);
  }
}

function queueSave() {
  const status = document.querySelector("#save-status");
  if (status) status.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(), 250);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function todayInPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  if (today < PERIOD_START) return PERIOD_START;
  if (today > PERIOD_END) return PERIOD_END;
  return today;
}

function percentage(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

function goalStats(goal) {
  const total = goal.steps.length;
  const done = goal.steps.filter((step) => step.done).length;
  return { done, total, percent: percentage(done, total) };
}

function stepKind(stepId) {
  const monthEndSteps = new Set([
    "academy-1",
    "academy-2",
    "academy-3",
    "academy-4",
    "english-1",
    "english-2",
    "english-3",
    "english-4",
    "presentation-5",
    "boundaries-4",
    "health-4"
  ]);
  return monthEndSteps.has(stepId) ? "monthly" : "milestone";
}

function allGoalStats() {
  const steps = state.goals.flatMap((goal) => goal.steps);
  return { done: steps.filter((step) => step.done).length, total: steps.length };
}

function habitStats() {
  const done = HABIT_COLUMNS.reduce((sum, column) => {
    const completedDays = state.habits.filter((day) => Boolean(day[column])).length;
    return sum + Math.min(completedDays, HABIT_TARGETS[column]);
  }, 0);
  const total = Object.values(HABIT_TARGETS).reduce((sum, target) => sum + target, 0);
  return { done, total };
}

function rtStats() {
  const tasks = state.rtSessions.flatMap((session) => session.tasks);
  return { done: tasks.filter((task) => task.done).length, total: tasks.length };
}

function categoryColor(category) {
  return {
    academy: "var(--orange)",
    english: "var(--yellow)",
    rt: "var(--blue)",
    personality: "var(--purple)",
    health: "var(--green)"
  }[category] || "var(--orange)";
}

/* ---------- Navigation ---------- */
function activateTab(tabId, moveFocus = false) {
  const target = document.querySelector(`#${tabId}`);
  if (!target) return;

  document.querySelectorAll(".tab-button").forEach((button) => {
    const active = button.dataset.tab === tabId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && moveFocus) button.focus();
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const active = panel.id === tabId;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });

  animateTabContents(target);

  state.activeTab = tabId;
  saveState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function animateTabContents(panel) {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
  panel.classList.remove("entering");
  void panel.offsetWidth;
  panel.classList.add("entering");
  window.clearTimeout(panel.motionTimer);
  panel.motionTimer = window.setTimeout(() => panel.classList.remove("entering"), 850);
}

function setupNavigation() {
  const tabs = [...document.querySelectorAll(".tab-button")];
  tabs.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      activateTab(tabs[nextIndex].dataset.tab, true);
    });
  });

  document.querySelectorAll("[data-open-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.openTab));
  });
}

/* ---------- Motion feedback ---------- */
function celebrateCompletion(control) {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

  const rect = control.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  control.classList.remove("just-completed");
  void control.offsetWidth;
  control.classList.add("just-completed");

  const burst = document.createElement("span");
  burst.className = "check-firework";
  burst.setAttribute("aria-hidden", "true");
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;

  const colors = ["var(--orange)", "var(--yellow)", "var(--purple)", "var(--blue)", "var(--green)"];
  for (let index = 0; index < 10; index += 1) {
    const particle = document.createElement("i");
    particle.style.setProperty("--particle-angle", `${index * 36}deg`);
    particle.style.setProperty("--particle-distance", `${27 + (index % 3) * 7}px`);
    particle.style.setProperty("--particle-delay", `${(index % 2) * 24}ms`);
    particle.style.setProperty("--particle-color", colors[index % colors.length]);
    burst.append(particle);
  }

  document.body.append(burst);
  window.setTimeout(() => {
    burst.remove();
    control.classList.remove("just-completed");
  }, 850);
}

function setupMotionFeedback() {
  // Capture runs before checkbox-specific handlers redraw a tracker row.
  document.addEventListener("change", (event) => {
    const checkbox = event.target.closest?.('input[type="checkbox"]');
    if (checkbox?.checked) celebrateCompletion(checkbox);
  }, true);
}

function animateOverallProgress(value) {
  const number = document.querySelector("#overall-progress");
  if (lastOverallProgress !== null && lastOverallProgress !== value && !window.matchMedia(REDUCED_MOTION_QUERY).matches) {
    number.classList.remove("progress-number-pop");
    void number.offsetWidth;
    number.classList.add("progress-number-pop");
    window.setTimeout(() => number.classList.remove("progress-number-pop"), 500);
  }
  lastOverallProgress = value;
}

/* ---------- Goals and progress ---------- */
function renderGoalSummary() {
  const container = document.querySelector("#goal-summary");
  container.innerHTML = state.goals.map((goal) => {
    const stats = goalStats(goal);
    return `
      <article class="card summary-card" style="--accent: ${categoryColor(goal.category)}">
        <p class="eyebrow">${escapeHtml(goal.label)}</p>
        <h3>${escapeHtml(goal.title)}</h3>
        <div class="mini-progress" aria-label="${stats.percent}% complete"><span style="width: ${stats.percent}%"></span></div>
        <div class="progress-label"><span>${stats.done}/${stats.total} steps</span><strong>${stats.percent}%</strong></div>
      </article>`;
  }).join("");
}

function renderGoals() {
  const container = document.querySelector("#goals-list");
  container.innerHTML = "";

  state.goals.forEach((goal, goalIndex) => {
    const stats = goalStats(goal);
    const article = document.createElement("article");
    article.className = "card goal-card";
    article.dataset.category = goal.category;
    article.innerHTML = `
      <div class="goal-top">
        <div>
          <span class="goal-number">${escapeHtml(goal.label)}</span>
          <label class="sr-only" for="goal-title-${goalIndex}">Goal title</label>
          <input class="goal-title" id="goal-title-${goalIndex}" value="${escapeHtml(goal.title)}" />
          <label class="sr-only" for="goal-description-${goalIndex}">Goal description</label>
          <textarea class="goal-description" id="goal-description-${goalIndex}" rows="3">${escapeHtml(goal.description)}</textarea>
        </div>
        <div>
          <div class="mini-progress" aria-label="${stats.percent}% complete"><span style="width: ${stats.percent}%"></span></div>
          <div class="progress-label"><span>${stats.done}/${stats.total}</span><strong>${stats.percent}%</strong></div>
        </div>
      </div>
      <div class="goal-steps"></div>
      <button class="secondary-button add-step" type="button">+ Add step</button>`;

    article.querySelector(".goal-title").addEventListener("input", (event) => {
      goal.title = event.target.value;
      queueSave();
      renderGoalSummary();
    });
    article.querySelector(".goal-description").addEventListener("input", (event) => {
      goal.description = event.target.value;
      queueSave();
    });

    const stepsContainer = article.querySelector(".goal-steps");
    goal.steps.forEach((step) => stepsContainer.append(makeGoalStep(goal, step)));
    article.querySelector(".add-step").addEventListener("click", () => {
      goal.steps.push({ id: makeId("step"), text: "New measurable step", done: false });
      saveState();
      renderAllProgress();
      renderGoals();
      article.querySelector(".step-row:last-child .step-text")?.focus();
    });
    container.append(article);
  });
}

function makeGoalStep(goal, step) {
  const row = document.createElement("div");
  row.className = `step-row${step.done ? " completed" : ""}`;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = step.done;
  check.setAttribute("aria-label", `Complete: ${step.text}`);
  check.addEventListener("change", () => {
    step.done = check.checked;
    saveState();
    renderGoals();
    renderAllProgress();
  });

  const kind = stepKind(step.id);
  const kindLabel = document.createElement("span");
  kindLabel.className = `step-kind ${kind}`;
  kindLabel.textContent = kind === "monthly" ? "Month end" : "Milestone";

  const input = document.createElement("input");
  input.className = "step-text";
  input.value = step.text;
  input.setAttribute("aria-label", "Goal step");
  input.addEventListener("input", () => {
    step.text = input.value;
    queueSave();
  });

  const remove = document.createElement("button");
  remove.className = "delete-icon";
  remove.type = "button";
  remove.setAttribute("aria-label", `Delete step: ${step.text}`);
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    goal.steps = goal.steps.filter((candidate) => candidate.id !== step.id);
    saveState();
    renderGoals();
    renderAllProgress();
  });

  row.append(check, kindLabel, input, remove);
  return row;
}

function renderAllProgress() {
  const goals = allGoalStats();
  const habits = habitStats();
  const rt = rtStats();
  const goalPercent = percentage(goals.done, goals.total);
  const habitPercent = percentage(habits.done, habits.total);
  const rtPercent = percentage(rt.done, rt.total);
  const overall = Math.round(goalPercent * 0.5 + habitPercent * 0.5);

  document.querySelector("#overall-progress").textContent = `${overall}%`;
  animateOverallProgress(overall);
  document.querySelector("#habit-progress").textContent = `${habitPercent}%`;
  document.querySelector("#rt-progress").textContent = `${rtPercent}%`;
  const orbit = document.querySelector(".progress-orbit");
  orbit.style.setProperty("--overall-progress", `${overall}%`);
  const habitBar = document.querySelector("#habit-progress-bar");
  habitBar.querySelector("span").style.width = `${habitPercent}%`;
  habitBar.setAttribute("aria-valuenow", String(habitPercent));
  const rtBar = document.querySelector("#rt-progress-bar");
  rtBar.querySelector("span").style.width = `${rtPercent}%`;
  rtBar.setAttribute("aria-valuenow", String(rtPercent));
  document.querySelector("#encouragement").textContent = getEncouragement(overall);
  renderGoalSummary();
}

function getEncouragement(progress) {
  if (progress === 0) return "Begin with one small, honest action.";
  if (progress < 25) return "Your rhythm is taking shape—keep it gentle and clear.";
  if (progress < 50) return "You are building evidence, one choice at a time.";
  if (progress < 75) return "Notice what is working and protect that rhythm.";
  if (progress < 100) return "The finish is close; keep choosing quality over rush.";
  return "You completed the journey. Pause and name what you learned.";
}

/* ---------- Habit tracker ---------- */
function renderHabits() {
  const body = document.querySelector("#habit-table-body");
  const today = todayInPeriod();
  body.innerHTML = "";

  state.habits.forEach((day) => {
    const row = document.createElement("tr");
    if (day.date === today) row.classList.add("today-row");

    const dateCell = document.createElement("th");
    dateCell.scope = "row";
    dateCell.innerHTML = `${formatDate(day.date)}<br><small>${formatDate(day.date, { weekday: "short" })}</small>`;
    row.append(dateCell);

    const planCell = document.createElement("td");
    const plan = document.createElement("input");
    plan.className = "habit-note";
    plan.value = day.plan || "";
    plan.placeholder = "Plan";
    plan.setAttribute("aria-label", `Plan for ${formatDate(day.date)}`);
    plan.addEventListener("input", () => {
      day.plan = plan.value;
      queueSave();
    });
    planCell.append(plan);
    row.append(planCell);

    HABIT_COLUMNS.forEach((column) => {
      const cell = document.createElement("td");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = Boolean(day[column]);
      check.setAttribute("aria-label", `${column} on ${formatDate(day.date)}`);
      check.addEventListener("change", () => {
        day[column] = check.checked;
        saveState();
        renderAllProgress();
        renderWeekSnapshot();
        if (day.date === today) {
          renderToday();
          renderAcademyReviewFocus();
        }
      });
      cell.append(check);
      row.append(cell);
    });
    body.append(row);
  });
}

function renderToday() {
  const date = todayInPeriod();
  const day = state.habits.find((item) => item.date === date);
  document.querySelector("#today-label").textContent = formatDate(date, { weekday: "long", month: "long", day: "numeric" });
  const actions = [
    ["academyReview", "Academy review"],
    ["speexx", "Speexx 10 min"],
    ["speaking", "Speak English 5 min"],
    ["meal", "Balanced meal"]
  ];
  const container = document.querySelector("#today-actions");
  container.innerHTML = "";
  actions.forEach(([key, label]) => {
    const wrapper = document.createElement("label");
    wrapper.className = "today-check";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = Boolean(day?.[key]);
    check.addEventListener("change", () => {
      if (!day) return;
      day[key] = check.checked;
      saveState();
      renderHabits();
      renderAllProgress();
      renderWeekSnapshot();
      renderAcademyReviewFocus();
    });
    wrapper.append(check, document.createTextNode(label));
    container.append(wrapper);
  });
}

function renderAcademyReviewFocus() {
  const date = todayInPeriod();
  const day = state.habits.find((item) => item.date === date);
  const note = document.querySelector("#academy-review-focus");
  const doneButton = document.querySelector("#academy-review-done");
  const status = document.querySelector("#academy-review-status");
  if (!note || !doneButton || !status || !day) return;

  if (document.activeElement !== note) note.value = day.reviewNote || "";
  doneButton.textContent = day.academyReview ? "Review completed ✓" : "Mark review complete";
  doneButton.classList.toggle("is-complete", Boolean(day.academyReview));
  status.textContent = day.academyReview
    ? "Done for today. Keep the note as tomorrow’s starting clue if needed."
    : "20–30 focused minutes is enough: explain, retry one example, then note what is still unclear.";
}

function currentWeekRange(referenceDate = todayInPeriod()) {
  const periodStart = new Date(`${PERIOD_START}T12:00:00Z`);
  const reference = new Date(`${referenceDate}T12:00:00Z`);
  const elapsedDays = Math.max(0, Math.floor((reference - periodStart) / 86400000));
  const weekIndex = Math.floor(elapsedDays / 7);
  const weekStart = new Date(periodStart);
  weekStart.setUTCDate(periodStart.getUTCDate() + weekIndex * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const rawStart = weekStart.toISOString().slice(0, 10);
  const rawEnd = weekEnd.toISOString().slice(0, 10);
  return {
    start: rawStart,
    end: rawEnd > PERIOD_END ? PERIOD_END : rawEnd
  };
}

function entriesInRange(start, end) {
  return state.entries.filter((entry) => entry.date >= start && entry.date <= end);
}

function isSoloReflection(entry) {
  return entry.category === "boundary" && /Intentional solo break:\s*Yes/i.test(entry.body || "");
}

function nextAcademyDeadline(referenceDate) {
  return state.assignments
    .filter((assignment) => assignment.deadline >= referenceDate && !["Submitted", "Feedback received"].includes(assignment.status))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0] || null;
}

function renderWeekSnapshot() {
  const range = currentWeekRange();
  const entries = entriesInRange(range.start, range.end);
  const habits = state.habits.filter((day) => day.date >= range.start && day.date <= range.end);
  const academyReviewCount = habits.filter((day) => day.academyReview).length;
  const speexxCount = habits.filter((day) => day.speexx).length;
  const speakingCount = habits.filter((day) => day.speaking).length;
  const recordingCount = habits.filter((day) => day.recording).length;
  const deadline = nextAcademyDeadline(todayInPeriod());

  const rangeText = `${formatDate(range.start)} – ${formatDate(range.end)}`;
  document.querySelector("#week-range-label").textContent = rangeText;
  document.querySelector("#review-week-label").textContent = rangeText;

  const snapshot = [
    { label: "Academy review", value: `${academyReviewCount} / 3`, className: "academy" },
    { label: "Speexx", value: `${speexxCount} / 4`, className: "english" },
    { label: "English speaking", value: `${speakingCount} / 3`, className: "english" },
    { label: "English recordings", value: `${recordingCount} / 1`, className: "english" },
    { label: "Next Academy deadline", value: deadline ? `${deadline.task} · ${formatDate(deadline.deadline)}` : "Nothing recorded", className: "academy", wide: true }
  ];
  document.querySelector("#week-snapshot").innerHTML = snapshot.map((item) => `
    <div class="snapshot-item ${item.className}${item.wide ? " wide" : ""}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </div>`).join("");

  renderWeeklyTotals(habits, entries);
}

function renderWeeklyTotals(habits, entries) {
  const totals = [
    ["Speexx", habits.filter((day) => day.speexx).length, 4],
    ["Speaking", habits.filter((day) => day.speaking).length, 3],
    ["English recordings", habits.filter((day) => day.recording).length, 1],
    ["Academy review", habits.filter((day) => day.academyReview).length, 3],
    ["Food prepared", habits.filter((day) => day.foodPrep).length, 3],
    ["Balanced meals", habits.filter((day) => day.meal).length, 4],
    ["Movement", habits.filter((day) => day.movement).length, 2],
    ["Presentations", entries.filter((entry) => entry.category === "presentation").length, 1],
    ["Solo breaks", entries.filter(isSoloReflection).length, 2],
    ["RT optional", habits.filter((day) => day.rt).length, 1]
  ];
  document.querySelector("#weekly-totals").innerHTML = totals.map(([label, count, target]) => `
    <div class="weekly-total">
      <span>${escapeHtml(label)}</span>
      <strong>${count}<small> / ${target}</small></strong>
    </div>`).join("");
}

function renderPersonalityCounters() {
  const presentations = state.entries.filter((entry) => entry.category === "presentation").length;
  const reflections = state.entries.filter((entry) => entry.category === "boundary").length;
  const soloBreaks = state.entries.filter(isSoloReflection).length;
  const items = [
    ["Presentation recordings", presentations, 4, "◎"],
    ["Intentional solo breaks", soloBreaks, 8, "◇"],
    ["Short reflections", reflections, 8, "✦"]
  ];
  document.querySelector("#personality-counters").innerHTML = items.map(([label, count, target, icon]) => {
    const safeCount = Math.min(count, target);
    const percent = percentage(safeCount, target);
    return `<article class="card personality-counter">
      <span class="counter-icon" aria-hidden="true">${icon}</span>
      <div><span>${escapeHtml(label)}</span><strong>${safeCount} / ${target}</strong></div>
      <div class="mini-progress" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${safeCount}"><span style="width:${percent}%"></span></div>
    </article>`;
  }).join("");
}

const DEEP_QUESTIONS = [
  "When do I speak quickly, and what am I afraid might happen if I pause?",
  "What do I imagine people think when they see me alone?",
  "When did I smile or agree even though I felt uncomfortable?",
  "Which boundary sentence feels easiest for me?",
  "What is one situation where I can practise a two-second pause?",
  "What would change if I focused on being understood instead of looking confident?"
];

function renderDeepReflections() {
  document.querySelectorAll(".deep-questions").forEach((container) => {
    const reflectionName = container.dataset.reflection;
    container.innerHTML = "";
    DEEP_QUESTIONS.forEach((question, index) => {
      const label = document.createElement("label");
      label.textContent = `${index + 1}. ${question}`;
      const textarea = document.createElement("textarea");
      textarea.rows = 3;
      textarea.value = state.deepReflections[reflectionName][index] || "";
      textarea.addEventListener("input", () => {
        state.deepReflections[reflectionName][index] = textarea.value;
        queueSave();
      });
      label.append(textarea);
      container.append(label);
    });
  });
}

/* ---------- Academy assignments ---------- */
function renderAssignments() {
  const body = document.querySelector("#assignments-body");
  const empty = document.querySelector("#assignments-empty");
  body.innerHTML = "";
  empty.hidden = state.assignments.length > 0;

  const summary = document.querySelector("#assignment-summary");
  if (summary) {
    const activeAssignments = state.assignments.filter((assignment) => !["Submitted", "Feedback received"].includes(assignment.status));
    const countType = (type) => activeAssignments.filter((assignment) => assignment.type === type).length;
    summary.innerHTML = [
      ["Daily", countType("Daily")],
      ["Group", countType("Group")],
      ["Masterpiece", countType("Masterpiece")]
    ].map(([label, count]) => `<div><span>${label}</span><strong>${count}</strong><small>active</small></div>`).join("");
  }

  state.assignments
    .slice()
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
    .forEach((assignment) => {
      const row = document.createElement("tr");
      const done = ["Submitted", "Feedback received"].includes(assignment.status);
      row.innerHTML = `
        <td><strong>${escapeHtml(assignment.task)}</strong>${assignment.feedback ? `<br><small>${escapeHtml(assignment.feedback)}</small>` : ""}</td>
        <td>${escapeHtml(formatDate(assignment.deadline))}${assignment.internalDeadline ? `<br><small>Internal: ${escapeHtml(formatDate(assignment.internalDeadline))}</small>` : ""}</td>
        <td>${escapeHtml(assignment.type)}</td>
        <td>${escapeHtml(assignment.responsibility)}</td>
        <td><span class="status-badge${done ? " done" : ""}">${escapeHtml(assignment.status)}</span></td>
        <td><div class="row-actions"><button class="row-action edit" type="button">Edit</button><button class="row-action delete" type="button">Delete</button></div></td>`;
      row.querySelector(".edit").addEventListener("click", () => openAssignmentDialog(assignment));
      row.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Delete “${assignment.task}”?`)) return;
        state.assignments = state.assignments.filter((item) => item.id !== assignment.id);
        saveState();
        renderAssignments();
        renderWeekSnapshot();
        showToast("Assignment deleted.");
      });
      body.append(row);
    });
}

function openAssignmentDialog(assignment = null) {
  const dialog = document.querySelector("#assignment-dialog");
  const form = document.querySelector("#assignment-form");
  form.reset();
  document.querySelector("#assignment-dialog-title").textContent = assignment ? "Edit assignment" : "Add assignment";
  ["id", "task", "deadline", "type", "responsibility", "internalDeadline", "status", "feedback"].forEach((name) => {
    if (assignment && form.elements[name]) form.elements[name].value = assignment[name] || "";
  });
  if (!assignment) {
    form.elements.id.value = "";
    form.elements.type.value = "Daily";
    form.elements.status.value = "Planned";
  }
  dialog.showModal();
}

function saveAssignmentFromForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const current = state.assignments.find((item) => item.id === data.id);
  if (current) Object.assign(current, data);
  else state.assignments.push({ ...data, id: makeId("assignment") });
  saveState();
  renderAssignments();
  renderWeekSnapshot();
  document.querySelector("#assignment-dialog").close();
  showToast(current ? "Assignment updated." : "Assignment added.");
}

/* ---------- RT tracker ---------- */
function renderRtSessions() {
  const container = document.querySelector("#rt-sessions");
  container.innerHTML = "";
  state.rtSessions.forEach((session) => {
    const card = document.createElement("article");
    card.className = `session-card${session.stretch ? " stretch" : ""}`;
    card.innerHTML = `
      <span class="session-label">${escapeHtml(session.label)}</span>
      <label class="sr-only" for="${session.id}-title">Session title</label>
      <input class="session-title" id="${session.id}-title" value="${escapeHtml(session.title)}" />
      <div class="session-tasks"></div>`;
    card.querySelector(".session-title").addEventListener("input", (event) => {
      session.title = event.target.value;
      queueSave();
    });
    const tasks = card.querySelector(".session-tasks");
    session.tasks.forEach((task) => {
      const row = document.createElement("label");
      row.className = `session-task-row${task.done ? " completed" : ""}`;
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = task.done;
      check.setAttribute("aria-label", `Complete: ${task.text}`);
      const input = document.createElement("input");
      input.className = "session-task";
      input.value = task.text;
      input.setAttribute("aria-label", "RT task");
      check.addEventListener("change", () => {
        task.done = check.checked;
        saveState();
        renderRtSessions();
        renderAllProgress();
      });
      input.addEventListener("input", () => {
        task.text = input.value;
        queueSave();
      });
      row.append(check, input);
      tasks.append(row);
    });
    container.append(card);
  });
}

/* ---------- Graduation ideas ---------- */
function renderIdeas() {
  const container = document.querySelector("#ideas-grid");
  container.innerHTML = "";
  state.ideas.forEach((idea, index) => {
    const card = document.createElement("article");
    card.className = "idea-card";
    card.innerHTML = `<button class="delete-icon" type="button" aria-label="Delete ${escapeHtml(idea.name)}">×</button>`;

    const fields = [
      ["name", "Idea name", "input"],
      ["problem", "Problem", "textarea"],
      ["users", "Target users", "textarea"],
      ["features", "Three essential features", "textarea"],
      ["technology", "Possible technology", "input"],
      ["risk", "Biggest risk or unknown", "textarea"],
      ["feedback", "Feedback", "textarea"]
    ];
    fields.forEach(([key, labelText, type]) => {
      const label = document.createElement("label");
      label.textContent = labelText;
      const field = document.createElement(type);
      field.className = "idea-field";
      field.value = idea[key] || "";
      if (type === "textarea") field.rows = key === "features" ? 3 : 2;
      field.placeholder = index < 3 && key === "name" ? `Idea ${index + 1}` : "";
      field.addEventListener("input", () => {
        idea[key] = field.value;
        queueSave();
      });
      label.append(field);
      card.append(label);
    });
    card.querySelector(".delete-icon").addEventListener("click", () => {
      if (!confirm(`Delete “${idea.name || "this idea"}”?`)) return;
      state.ideas = state.ideas.filter((item) => item.id !== idea.id);
      saveState();
      renderIdeas();
    });
    container.append(card);
  });
}

/* ---------- Resource library ---------- */
function resourceCategoryClass(category) {
  return {
    Presentation: "personality",
    Boundaries: "personality",
    English: "english",
    "Web development": "rt",
    Health: "health",
    "Creative break": "academy"
  }[category] || "academy";
}

function safeResourceUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function resourceUnitProgress(resource) {
  const completed = Math.max(0, Number(resource.completedUnits) || 0);
  const total = Math.max(0, Number(resource.totalUnits) || 0);
  return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
}

function resourceTrackingMarkup(resource) {
  if (resource.tracking === "Status only") {
    const action = resource.status === "Done"
      ? "Completed—record the lesson you want to remember."
      : `Use the status buttons; mark Done after you finish this ${resource.type.toLowerCase()}.`;
    return `<p class="resource-tracking-help">${escapeHtml(action)}</p>`;
  }

  const completed = Math.max(0, Number(resource.completedUnits) || 0);
  const total = Math.max(0, Number(resource.totalUnits) || 0);
  const unit = resource.tracking.toLowerCase();
  if (!total) {
    return `<p class="resource-tracking-help"><strong>${completed} ${escapeHtml(unit)}</strong> completed · Add the total in Edit when you know it.</p>`;
  }

  const progress = resourceUnitProgress(resource);
  return `
    <div class="mini-progress" role="progressbar" aria-label="${completed} of ${total} ${escapeHtml(unit)} completed" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}"><span style="width:${progress}%"></span></div>
    <div class="progress-label"><span>${completed} of ${total} ${escapeHtml(unit)}</span><strong>${resource.status}</strong></div>`;
}

function renderResourceSummary(filteredResources = state.resources) {
  const thisWeek = state.resources.filter((resource) => resource.thisWeek).length;
  const inProgress = state.resources.filter((resource) => resource.status === "In progress").length;
  const finished = state.resources.filter((resource) => resource.status === "Done").length;
  const summary = [
    ["Visible resources", filteredResources.length],
    ["This week", thisWeek],
    ["In progress", inProgress],
    ["Done", finished]
  ];
  document.querySelector("#resource-summary").innerHTML = summary.map(([label, value]) => `
    <div class="resource-summary-item"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

function renderResources() {
  const search = document.querySelector("#resource-search").value.trim().toLowerCase();
  const category = document.querySelector("#resource-category-filter").value;
  const type = document.querySelector("#resource-type-filter").value;
  const status = document.querySelector("#resource-status-filter").value;
  const resources = state.resources.filter((resource) => {
    const searchable = `${resource.title} ${resource.creator} ${resource.lesson} ${resource.action}`.toLowerCase();
    const matchesStatusOrFocus = status === "all"
      || (status === "This week" ? resource.thisWeek : resource.status === status);
    return (!search || searchable.includes(search))
      && (category === "all" || resource.category === category)
      && (type === "all" || resource.type === type)
      && matchesStatusOrFocus;
  });

  renderResourceSummary(resources);
  document.querySelector("#resources-empty").hidden = resources.length > 0;
  const grid = document.querySelector("#resource-grid");
  grid.innerHTML = "";

  resources.forEach((resource) => {
    const url = safeResourceUrl(resource.url);
    const article = document.createElement("article");
    article.className = `card resource-card ${resourceCategoryClass(resource.category)}`;
    article.innerHTML = `
      <div class="resource-card-top">
        <div class="resource-card-tags">
          <span class="resource-type">${escapeHtml(resource.type)}</span>
          <button class="resource-week-toggle${resource.thisWeek ? " active" : ""}" type="button" aria-pressed="${resource.thisWeek}" ${resource.status === "Done" ? "disabled" : ""}>${resource.thisWeek ? "★ This week" : "☆ This week"}</button>
        </div>
        <span class="status-badge${resource.status === "Done" ? " done" : ""}">${escapeHtml(resource.status)}</span>
      </div>
      <p class="eyebrow">${escapeHtml(resource.category)}</p>
      <h2>${escapeHtml(resource.title)}</h2>
      <p class="resource-creator">${escapeHtml(resource.creator || "Personal resource")}</p>
      <div class="resource-status-controls" role="group" aria-label="Progress status for ${escapeHtml(resource.title)}">
        ${["Not started", "In progress", "Done"].map((statusOption) => `<button class="resource-status-button${resource.status === statusOption ? " active" : ""}${statusOption === "Done" ? " done" : ""}" type="button" data-status="${statusOption}" aria-pressed="${resource.status === statusOption}">${statusOption === "Done" ? "✓ Done" : statusOption}</button>`).join("")}
      </div>
      <div class="resource-tracking">${resourceTrackingMarkup(resource)}</div>
      ${resource.lesson ? `<div class="resource-note"><strong>Lesson</strong><p>${escapeHtml(resource.lesson)}</p></div>` : ""}
      ${resource.action ? `<div class="resource-note action"><strong>Practise</strong><p>${escapeHtml(resource.action)}</p></div>` : ""}
      <div class="resource-actions">
        ${url ? `<a class="primary-button resource-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>` : `<span class="no-link">Offline or personal resource</span>`}
        <button class="secondary-button edit-resource" type="button">Edit</button>
        <button class="delete-icon delete-resource" type="button" aria-label="Delete ${escapeHtml(resource.title)}">×</button>
      </div>`;
    article.querySelectorAll(".resource-status-button").forEach((button) => {
      button.addEventListener("click", () => {
        const nextStatus = button.dataset.status;
        if (nextStatus === "Done") {
          if (resource.totalUnits > 0) resource.completedUnits = resource.totalUnits;
          resource.thisWeek = false;
          celebrateCompletion(button);
        }
        resource.status = nextStatus;
        saveState();
        renderResources();
        showToast(nextStatus === "Done" ? "Resource marked done." : `Resource moved to ${nextStatus.toLowerCase()}.`);
      });
    });
    article.querySelector(".resource-week-toggle").addEventListener("click", () => {
      const makeThisWeek = !resource.thisWeek;
      state.resources.forEach((item) => { item.thisWeek = false; });
      resource.thisWeek = makeThisWeek;
      saveState();
      renderResources();
      showToast(makeThisWeek ? "This is your main resource for the week." : "Weekly focus removed.");
    });
    article.querySelector(".edit-resource").addEventListener("click", () => openResourceDialog(resource));
    article.querySelector(".delete-resource").addEventListener("click", () => {
      if (!confirm(`Delete “${resource.title}” from the library?`)) return;
      state.resources = state.resources.filter((item) => item.id !== resource.id);
      saveState();
      renderResources();
      showToast("Resource removed from your library.");
    });
    grid.append(article);
  });
}

function openResourceDialog(resource = null) {
  const dialog = document.querySelector("#resource-dialog");
  const form = document.querySelector("#resource-form");
  form.reset();
  document.querySelector("#resource-dialog-title").textContent = resource ? "Edit resource" : "Add resource";
  ["id", "title", "creator", "category", "type", "url", "status", "tracking", "completedUnits", "totalUnits", "lesson", "action"].forEach((name) => {
    if (resource && form.elements[name]) form.elements[name].value = resource[name] ?? "";
  });
  form.elements.thisWeek.checked = Boolean(resource?.thisWeek);
  if (!resource) {
    form.elements.id.value = "";
    form.elements.category.value = "Presentation";
    form.elements.type.value = "Video";
    form.elements.status.value = "Not started";
    form.elements.tracking.value = "Status only";
    form.elements.completedUnits.value = "0";
    form.elements.totalUnits.value = "";
  }
  updateResourceTrackingFields(form);
  dialog.showModal();
}

function updateResourceTrackingFields(form) {
  const tracking = form.elements.tracking.value;
  const fields = document.querySelector("#resource-unit-fields");
  const usesUnits = tracking !== "Status only";
  fields.hidden = !usesUnits;
  document.querySelector("#resource-completed-label").textContent = usesUnits ? `Completed ${tracking.toLowerCase()}` : "Completed";
  document.querySelector("#resource-total-label").textContent = usesUnits ? `Total ${tracking.toLowerCase()}` : "Total";
  document.querySelector("#resource-tracking-explanation").textContent = usesUnits
    ? `The progress bar will be calculated from completed and total ${tracking.toLowerCase()}.`
    : "Best for videos, articles, guides, and open-ended resources: simply choose Not started, In progress, or Done.";
}

function saveResourceFromForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.thisWeek = form.elements.thisWeek.checked;
  data.completedUnits = Math.max(0, Math.floor(Number(data.completedUnits) || 0));
  data.totalUnits = Math.max(0, Math.floor(Number(data.totalUnits) || 0));
  if (data.totalUnits) data.completedUnits = Math.min(data.completedUnits, data.totalUnits);
  if (data.tracking === "Status only") {
    data.completedUnits = 0;
    data.totalUnits = 0;
  }
  if (data.status === "Done") {
    if (data.totalUnits) data.completedUnits = data.totalUnits;
    data.thisWeek = false;
  } else if (data.totalUnits && data.completedUnits === data.totalUnits) {
    data.status = "Done";
    data.thisWeek = false;
  } else if (data.completedUnits > 0 && data.status === "Not started") {
    data.status = "In progress";
  }
  if (data.thisWeek) {
    state.resources.forEach((resource) => {
      if (resource.id !== data.id) resource.thisWeek = false;
    });
  }
  const current = state.resources.find((resource) => resource.id === data.id);
  if (current) Object.assign(current, data);
  else state.resources.push({ ...data, id: makeId("resource") });
  saveState();
  renderResources();
  document.querySelector("#resource-dialog").close();
  showToast(current ? "Resource updated." : "Resource added to your library.");
}

/* ---------- Journal forms, drafts, and entries ---------- */
function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function saveDraft(form) {
  state.drafts[form.id] = formValues(form);
  queueSave();
}

function restoreDraft(form) {
  const draft = state.drafts[form.id];
  if (!draft) return;
  Object.entries(draft).forEach(([name, value]) => {
    const controls = form.elements[name];
    if (!controls) return;
    if (controls instanceof RadioNodeList) {
      [...controls].forEach((control) => { control.checked = control.value === value; });
    } else {
      controls.value = value;
    }
  });
}

const fieldLabels = {
  energy: "Energy",
  academy: "Academy",
  rt: "RT",
  completed: "Completed",
  learned: "Learned / explained",
  difficult: "Difficult",
  next: "Next action",
  release: "Released before sleep",
  message: "Audience message",
  points: "Main points",
  feedback: "Listener feedback",
  strength: "Strength",
  improvement: "Improvement",
  situation: "Situation",
  feelings: "Feelings",
  response: "My response",
  solo: "Intentional solo break",
  evidence: "Evidence",
  pressure: "Help and pressure",
  adjustment: "Adjustment",
  weekend: "Weekend outcomes",
  priorities: "Priorities",
  english: "English",
  presentation: "Presentation",
  boundaries: "Boundaries",
  health: "Health",
  proud: "Evidence-based pride",
  nextGoals: "Next five goals",
  session: "Roadmap session",
  tested: "Tested",
  result: "Result",
  explained: "Explained without notes"
};

function entryTitle(category, data) {
  if (category === "presentation") return data.topic || "Presentation practice";
  if (category === "boundary") return data.solo === "Yes" ? "Solo-time reflection" : "Boundary reflection";
  if (category === "rt-evidence") return `${data.session || "RT"} evidence`;
  if (category === "weekly") return "Weekly review";
  if (category === "monthly") return "End-of-month review";
  return data.completed ? data.completed.slice(0, 70) : "Daily check-in";
}

function entryBody(data) {
  return Object.entries(data)
    .filter(([key, value]) => !["date", "topic"].includes(key) && String(value || "").trim())
    .map(([key, value]) => `${fieldLabels[key] || key}: ${String(value).trim()}`)
    .join("\n\n");
}

function setupEntryForms() {
  document.querySelectorAll(".entry-form").forEach((form) => {
    restoreDraft(form);
    if (form.elements.date && !form.elements.date.value) form.elements.date.value = todayInPeriod();
    form.addEventListener("input", () => saveDraft(form));
    form.addEventListener("change", () => saveDraft(form));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = formValues(form);
      const category = form.dataset.category;
      state.entries.unshift({
        id: makeId("entry"),
        category,
        date: data.date || todayInPeriod(),
        title: entryTitle(category, data),
        body: entryBody(data),
        createdAt: new Date().toISOString()
      });
      delete state.drafts[form.id];
      form.reset();
      if (form.elements.date) form.elements.date.value = category === "monthly" ? PERIOD_END : todayInPeriod();
      if (form.elements.energy) form.elements.energy.value = "3";
      saveState();
      renderEntries();
      markJournalHabit(data.date);
      showToast("Entry saved. Your evidence is growing.");
    });
  });
}

function markJournalHabit(date) {
  const habit = state.habits.find((day) => day.date === date);
  if (!habit) return;
  habit.journal = true;
  saveState();
  renderHabits();
  renderToday();
  renderAllProgress();
}

function renderEntries() {
  const category = document.querySelector("#entry-category-filter").value;
  const date = document.querySelector("#entry-date-filter").value;
  const filtered = state.entries.filter((entry) => {
    const categoryMatches = category === "all" || entry.category === category;
    const dateMatches = !date || entry.date === date;
    return categoryMatches && dateMatches;
  });

  document.querySelector("#entry-count").textContent = `${state.entries.length} ${state.entries.length === 1 ? "entry" : "entries"}`;
  document.querySelector("#entries-empty").hidden = filtered.length > 0;
  const container = document.querySelector("#entries-list");
  container.innerHTML = "";

  filtered.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "entry-item";
    article.innerHTML = `
      <div class="entry-meta"><span class="entry-category">${escapeHtml(entry.category)}</span>${escapeHtml(formatDate(entry.date, { year: "numeric", month: "short", day: "numeric" }))}</div>
      <div class="entry-content"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.body)}</p></div>
      <div class="row-actions"><button class="row-action edit" type="button">Edit</button><button class="row-action delete" type="button">Delete</button></div>`;
    article.querySelector(".edit").addEventListener("click", () => openEntryEditor(entry));
    article.querySelector(".delete").addEventListener("click", () => {
      if (!confirm(`Delete “${entry.title}”?`)) return;
      state.entries = state.entries.filter((item) => item.id !== entry.id);
      saveState();
      renderEntries();
      showToast("Entry deleted.");
    });
    container.append(article);
  });
  renderPersonalityCounters();
  renderWeekSnapshot();
}

function openEntryEditor(entry) {
  const form = document.querySelector("#entry-editor-form");
  form.elements.id.value = entry.id;
  form.elements.date.value = entry.date;
  form.elements.category.value = entry.category;
  form.elements.title.value = entry.title;
  form.elements.body.value = entry.body;
  document.querySelector("#entry-dialog").showModal();
}

function saveEntryEdit(form) {
  const data = formValues(form);
  const entry = state.entries.find((item) => item.id === data.id);
  if (!entry) return;
  Object.assign(entry, {
    date: data.date,
    category: data.category,
    title: data.title,
    body: data.body,
    updatedAt: new Date().toISOString()
  });
  saveState();
  renderEntries();
  document.querySelector("#entry-dialog").close();
  showToast("Entry updated.");
}

function downloadBackup() {
  const backup = {
    app: "My Growth Journey",
    format: "local-json-database",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `growth-journey-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON database saved. Keep this file so you can load your journal later.");
}

function restoreBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const restored = parsed?.data || parsed;
      if (!restored || !Array.isArray(restored.goals) || !Array.isArray(restored.habits)) {
        throw new Error("This file is not a Growth Journey JSON database.");
      }
      if (!confirm("Replace the journal currently in this browser with this JSON database?")) return;
      state = normalizeState(restored);
      saveState("JSON database loaded");
      location.reload();
    } catch (error) {
      console.error(error);
      showToast("That file could not be loaded. Choose a valid Growth Journey JSON database.");
    }
  });
  reader.addEventListener("error", () => showToast("The backup file could not be read."));
  reader.readAsText(file);
}

/* ---------- Rolling cycle, daily to-do, archive, and card order ---------- */
function renderPeriodUI() {
  document.querySelectorAll("[data-period-label]").forEach((element) => {
    element.textContent = fullPeriodLabel();
  });
  document.querySelectorAll("[data-period-end-label]").forEach((element) => {
    element.textContent = formatDate(PERIOD_END, { month: "long", day: "numeric", year: "numeric" });
  });
  document.querySelectorAll("[data-period-end-value]").forEach((element) => {
    element.value = PERIOD_END;
  });
  document.querySelectorAll("[data-cycle-date]").forEach((element) => {
    element.min = PERIOD_START;
    element.max = PERIOD_END;
  });
  const todoDate = document.querySelector("#todo-date");
  if (todoDate) {
    todoDate.min = PERIOD_START;
    todoDate.max = PERIOD_END;
    if (!todoDate.value || todoDate.value < PERIOD_START || todoDate.value > PERIOD_END) {
      todoDate.value = todayInPeriod();
    }
  }
}

function selectedTodoDate() {
  return document.querySelector("#todo-date")?.value || todayInPeriod();
}

function renderTodos() {
  const date = selectedTodoDate();
  const todos = state.todos.filter((todo) => todo.date === date);
  const container = document.querySelector("#todo-list");
  const completed = todos.filter((todo) => todo.done).length;
  const canMoveBack = date > PERIOD_START;
  const carriedIds = new Set(state.lastTodoCarry?.todoIds || []);
  const undoableCount = state.lastTodoCarry
    ? state.todos.filter((todo) => carriedIds.has(todo.id) && todo.date === state.lastTodoCarry.toDate).length
    : 0;
  const undoButton = document.querySelector("#undo-carry-button");
  undoButton.hidden = undoableCount === 0;
  undoButton.textContent = undoableCount > 0
    ? `Undo last carry (${undoableCount})`
    : "Undo last carry";
  document.querySelector("#todo-count").textContent = `${completed} / ${todos.length} completed`;
  container.innerHTML = todos.length ? todos.map((todo) => `
    <div class="todo-item${todo.done ? " done" : ""}" data-todo-id="${escapeHtml(todo.id)}">
      <span class="todo-drag-handle" draggable="true" title="Drag to reorder" aria-hidden="true">⋮⋮</span>
      <input type="checkbox" ${todo.done ? "checked" : ""} aria-label="Mark ${escapeHtml(todo.text)} complete" />
      <span class="todo-category" data-category="${escapeHtml(todo.category)}">${escapeHtml(todo.category)}</span>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <span class="todo-actions">
        ${canMoveBack ? `<button class="todo-copy-previous" type="button" title="Copy to previous day" aria-label="Copy ${escapeHtml(todo.text)} to previous day">Copy ←</button>
        <button class="todo-move-previous" type="button" title="Move to previous day" aria-label="Move ${escapeHtml(todo.text)} to previous day">Move ←</button>` : ""}
        <button class="todo-delete" type="button" title="Delete task" aria-label="Delete ${escapeHtml(todo.text)}">×</button>
      </span>
    </div>`).join("") : `<p class="todo-empty">No tasks for ${escapeHtml(formatDate(date, { weekday: "long", month: "short", day: "numeric" }))}. Keep the list deliberately small.</p>`;
}

function copyTodoToPreviousDay(id) {
  const source = state.todos.find((todo) => todo.id === id);
  if (!source) return;
  const previousDate = addDaysISO(source.date, -1);
  if (previousDate < PERIOD_START) {
    showToast("This task is already on the first day of the current cycle.");
    return;
  }
  state.todos.push({
    ...source,
    id: makeId("todo"),
    date: previousDate,
    done: false,
    createdAt: new Date().toISOString()
  });
  saveState();
  renderTodos();
  showToast(`Task copied to ${formatDate(previousDate, { month: "short", day: "numeric" })}.`);
}

function moveTodoToPreviousDay(id) {
  const todo = state.todos.find((item) => item.id === id);
  if (!todo) return;
  const previousDate = addDaysISO(todo.date, -1);
  if (previousDate < PERIOD_START) {
    showToast("This task is already on the first day of the current cycle.");
    return;
  }
  todo.date = previousDate;
  document.querySelector("#todo-date").value = previousDate;
  saveState();
  renderTodos();
  showToast(`Task moved back to ${formatDate(previousDate, { month: "short", day: "numeric" })}.`);
}

function carryTodosForward() {
  const fromDate = selectedTodoDate();
  const nextDate = addDaysISO(fromDate, 1);
  if (nextDate > PERIOD_END) {
    showToast("The next day belongs to the next cycle. Archive this cycle first.");
    return;
  }
  const unfinished = state.todos.filter((todo) => todo.date === fromDate && !todo.done);
  if (!unfinished.length) {
    showToast("There are no unfinished tasks to carry forward.");
    return;
  }
  state.lastTodoCarry = {
    fromDate,
    toDate: nextDate,
    todoIds: unfinished.map((todo) => todo.id),
    movedAt: new Date().toISOString()
  };
  unfinished.forEach((todo) => { todo.date = nextDate; });
  document.querySelector("#todo-date").value = nextDate;
  saveState();
  renderTodos();
  showToast(`${unfinished.length} unfinished task${unfinished.length === 1 ? "" : "s"} moved to tomorrow.`);
}

function undoLastTodoCarry() {
  const carry = state.lastTodoCarry;
  if (!carry) {
    showToast("There is no recent carry action to undo.");
    return;
  }
  const carriedIds = new Set(carry.todoIds);
  const tasksToRestore = state.todos.filter((todo) => carriedIds.has(todo.id) && todo.date === carry.toDate);
  if (!tasksToRestore.length) {
    state.lastTodoCarry = null;
    saveState();
    renderTodos();
    showToast("Those carried tasks have already been moved or deleted.");
    return;
  }
  tasksToRestore.forEach((todo) => { todo.date = carry.fromDate; });
  state.lastTodoCarry = null;
  document.querySelector("#todo-date").value = carry.fromDate;
  saveState();
  renderTodos();
  showToast(`${tasksToRestore.length} task${tasksToRestore.length === 1 ? "" : "s"} returned to the previous day.`);
}

function syncTodoOrder() {
  const date = selectedTodoDate();
  const orderedIds = [...document.querySelectorAll("#todo-list [data-todo-id]")]
    .map((item) => item.dataset.todoId);
  if (!orderedIds.length) return;

  const todosById = new Map(state.todos.map((todo) => [todo.id, todo]));
  const orderedTodos = orderedIds.map((id) => todosById.get(id)).filter(Boolean);
  let orderedIndex = 0;
  state.todos = state.todos.map((todo) => {
    if (todo.date !== date) return todo;
    return orderedTodos[orderedIndex++] || todo;
  });
  saveState("To-do order saved; syncing…");
}

function setupTodoReorder() {
  const container = document.querySelector("#todo-list");
  let dragged = null;

  function clearTodoDragState() {
    container.querySelectorAll(".dragging, .drag-over-before, .drag-over-after").forEach((item) => {
      item.classList.remove("dragging", "drag-over-before", "drag-over-after");
    });
  }

  container.addEventListener("dragstart", (event) => {
    const handle = event.target.closest(".todo-drag-handle");
    if (!handle) return;
    dragged = handle.closest("[data-todo-id]");
    if (!dragged) return;
    event.stopPropagation();
    dragged.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dragged.dataset.todoId);
  });

  container.addEventListener("dragover", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target.closest("[data-todo-id]");
    clearTodoDragState();
    dragged.classList.add("dragging");
    if (!target || target === dragged) return;
    const box = target.getBoundingClientRect();
    target.classList.add(event.clientY > box.top + box.height / 2 ? "drag-over-after" : "drag-over-before");
  });

  container.addEventListener("drop", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target.closest("[data-todo-id]");
    if (target && target !== dragged) {
      const box = target.getBoundingClientRect();
      const after = event.clientY > box.top + box.height / 2;
      container.insertBefore(dragged, after ? target.nextElementSibling : target);
      syncTodoOrder();
    }
    clearTodoDragState();
    dragged = null;
  });

  container.addEventListener("dragend", (event) => {
    if (!dragged) return;
    event.stopPropagation();
    clearTodoDragState();
    dragged = null;
  });
}

function applyCardOrder() {
  const container = document.querySelector("#overview-card-list");
  if (!container) return;
  state.cardOrder.forEach((id) => {
    const card = container.querySelector(`[data-card-id="${id}"]`);
    if (card) container.append(card);
  });
}

function syncCardOrder() {
  state.cardOrder = [...document.querySelectorAll("#overview-card-list > [data-card-id]")]
    .map((card) => card.dataset.cardId);
  saveState();
}

function moveCard(card, direction) {
  const sibling = direction === "up" ? card.previousElementSibling : card.nextElementSibling;
  if (!sibling) return;
  if (direction === "up") card.parentElement.insertBefore(card, sibling);
  else card.parentElement.insertBefore(sibling, card);
  syncCardOrder();
}

function setupCardReorder() {
  const container = document.querySelector("#overview-card-list");
  let dragged = null;
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-move-card]");
    if (button) moveCard(button.closest("[data-card-id]"), button.dataset.moveCard);
  });
  container.addEventListener("dragstart", (event) => {
    if (event.target.closest("[data-todo-id]")) return;
    dragged = event.target.closest("[data-card-id]");
    if (!dragged) return;
    dragged.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
  });
  container.addEventListener("dragover", (event) => {
    event.preventDefault();
    const target = event.target.closest("[data-card-id]");
    container.querySelectorAll(".drag-over").forEach((card) => card.classList.remove("drag-over"));
    if (target && target !== dragged) target.classList.add("drag-over");
  });
  container.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target.closest("[data-card-id]");
    if (!dragged || !target || target === dragged) return;
    const box = target.getBoundingClientRect();
    const after = event.clientY > box.top + box.height / 2;
    target.parentElement.insertBefore(dragged, after ? target.nextElementSibling : target);
    syncCardOrder();
  });
  container.addEventListener("dragend", () => {
    container.querySelectorAll(".dragging, .drag-over").forEach((card) => card.classList.remove("dragging", "drag-over"));
    dragged = null;
  });
}

function currentArchiveRecord() {
  const snapshot = clone(state);
  delete snapshot.archives;
  return {
    id: `${PERIOD_START}--${PERIOD_END}`,
    start: PERIOD_START,
    end: PERIOD_END,
    label: fullPeriodLabel(),
    savedAt: new Date().toISOString(),
    data: snapshot
  };
}

function saveCurrentArchive(showMessage = true) {
  const record = currentArchiveRecord();
  const existingIndex = state.archives.findIndex((archive) => archive.id === record.id);
  if (existingIndex >= 0) state.archives[existingIndex] = record;
  else state.archives.push(record);
  saveState();
  renderArchives();
  if (showMessage) showToast("Current cycle snapshot saved in the month archive.");
}

function archiveAndStartNext() {
  if (!confirm(`Archive ${fullPeriodLabel()} and start a fresh 30-day cycle? Your archived data will remain available.`)) return;
  saveCurrentArchive(false);
  const archives = clone(state.archives);
  const theme = state.theme;
  const cardOrder = clone(state.cardOrder);
  const nextStart = addDaysISO(PERIOD_END, 1);
  state = createDefaultState(nextStart);
  state.archives = archives;
  state.theme = theme;
  state.cardOrder = cardOrder;
  saveState("New cycle saved to cloud");
  renderPeriodUI();
  document.querySelector("#motivation").value = state.motivation;
  document.querySelectorAll(".entry-form").forEach((form) => form.reset());
  renderEverything();
  applyTheme();
  activateTab("overview");
  showToast(`New cycle started: ${fullPeriodLabel()}.`);
}

function downloadArchive(archive) {
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `growth-journey-${archive.start}-to-${archive.end}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderArchives() {
  const archives = [...state.archives].sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
  const container = document.querySelector("#archive-list");
  document.querySelector("#archive-empty").hidden = archives.length > 0;
  container.innerHTML = archives.map((archive) => {
    const todos = archive.data?.todos || [];
    const completedTodos = todos.filter((todo) => todo.done).length;
    const completedHabits = (archive.data?.habits || []).reduce((sum, day) => sum + HABIT_COLUMNS.filter((column) => day[column]).length, 0);
    return `<div class="archive-item" data-archive-id="${escapeHtml(archive.id)}">
      <div><strong>${escapeHtml(archive.label || `${archive.start} – ${archive.end}`)}</strong><p>${completedTodos} completed to-dos • ${completedHabits} habit checks • saved ${escapeHtml(formatDate((archive.savedAt || "").slice(0, 10)))}</p></div>
      <button class="secondary-button" type="button" data-download-archive>Download JSON</button>
    </div>`;
  }).join("");
}

/* ---------- Theme, clear data, and initial setup ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const dark = state.theme === "dark";
  const button = document.querySelector("#theme-toggle");
  button.querySelector("[aria-hidden]").textContent = dark ? "☀" : "☾";
  button.querySelector(".button-label").textContent = dark ? "Light" : "Dark";
  button.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
}

function setupStaticFields() {
  const motivation = document.querySelector("#motivation");
  motivation.value = state.motivation;
  motivation.addEventListener("input", () => {
    state.motivation = motivation.value;
    queueSave();
  });

  const academyReviewFocus = document.querySelector("#academy-review-focus");
  academyReviewFocus?.addEventListener("input", () => {
    const day = state.habits.find((item) => item.date === todayInPeriod());
    if (!day) return;
    day.reviewNote = academyReviewFocus.value;
    queueSave();
  });
  document.querySelector("#academy-review-done")?.addEventListener("click", () => {
    const day = state.habits.find((item) => item.date === todayInPeriod());
    if (!day) return;
    day.academyReview = !day.academyReview;
    saveState();
    renderHabits();
    renderToday();
    renderAcademyReviewFocus();
    renderAllProgress();
    renderWeekSnapshot();
  });

  document.querySelector("#theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    saveState();
  });
  document.querySelector("#print-button").addEventListener("click", () => window.print());
  document.querySelector("#download-backup-button").addEventListener("click", downloadBackup);
  document.querySelector("#restore-backup-button").addEventListener("click", () => {
    document.querySelector("#backup-file-input").click();
  });
  document.querySelector("#backup-file-input").addEventListener("change", (event) => {
    restoreBackup(event.target.files[0]);
    event.target.value = "";
  });
  document.querySelector("#todo-date").addEventListener("change", renderTodos);
  document.querySelector("#todo-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.todos.push({
      id: makeId("todo"),
      date: selectedTodoDate(),
      text: form.elements.text.value.trim(),
      category: form.elements.category.value,
      done: false,
      createdAt: new Date().toISOString()
    });
    form.elements.text.value = "";
    saveState();
    renderTodos();
    form.elements.text.focus();
  });
  document.querySelector("#todo-list").addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']")) return;
    const todo = state.todos.find((item) => item.id === event.target.closest("[data-todo-id]")?.dataset.todoId);
    if (!todo) return;
    todo.done = event.target.checked;
    saveState();
    renderTodos();
  });
  document.querySelector("#todo-list").addEventListener("click", (event) => {
    const button = event.target.closest(".todo-copy-previous, .todo-move-previous, .todo-delete");
    if (!button) return;
    const id = button.closest("[data-todo-id]")?.dataset.todoId;
    if (button.matches(".todo-copy-previous")) {
      copyTodoToPreviousDay(id);
      return;
    }
    if (button.matches(".todo-move-previous")) {
      moveTodoToPreviousDay(id);
      return;
    }
    state.todos = state.todos.filter((todo) => todo.id !== id);
    saveState();
    renderTodos();
  });
  document.querySelector("#carry-todos-button").addEventListener("click", carryTodosForward);
  document.querySelector("#undo-carry-button").addEventListener("click", undoLastTodoCarry);
  document.querySelector("#save-month-snapshot").addEventListener("click", () => saveCurrentArchive(true));
  document.querySelector("#archive-start-next").addEventListener("click", archiveAndStartNext);
  document.querySelector("#archive-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-download-archive]");
    if (!button) return;
    const id = button.closest("[data-archive-id]")?.dataset.archiveId;
    const archive = state.archives.find((item) => item.id === id);
    if (archive) downloadArchive(archive);
  });
  document.querySelector("#add-assignment-button").addEventListener("click", () => openAssignmentDialog());
  document.querySelector("#add-resource-button").addEventListener("click", () => openResourceDialog());
  document.querySelector("#add-idea-button").addEventListener("click", () => {
    state.ideas.push({ id: makeId("idea"), name: `Idea ${state.ideas.length + 1}`, problem: "", users: "", features: "", technology: "", risk: "", feedback: "" });
    saveState();
    renderIdeas();
  });

  document.querySelector("#assignment-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") return;
    if (!event.currentTarget.reportValidity()) return;
    saveAssignmentFromForm(event.currentTarget);
  });
  document.querySelector("#entry-editor-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") return;
    if (!event.currentTarget.reportValidity()) return;
    saveEntryEdit(event.currentTarget);
  });
  document.querySelector("#resource-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.submitter?.value === "cancel") return;
    if (!event.currentTarget.reportValidity()) return;
    saveResourceFromForm(event.currentTarget);
  });
  document.querySelector("#resource-form [name='tracking']").addEventListener("change", (event) => {
    updateResourceTrackingFields(event.target.form);
  });

  document.querySelectorAll(".dialog-close, .dialog-actions button[value='cancel']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      button.closest("dialog").close();
    });
  });

  document.querySelector("#entry-category-filter").addEventListener("change", renderEntries);
  document.querySelector("#entry-date-filter").addEventListener("change", renderEntries);
  document.querySelector("#clear-filters").addEventListener("click", () => {
    document.querySelector("#entry-category-filter").value = "all";
    document.querySelector("#entry-date-filter").value = "";
    renderEntries();
  });

  document.querySelector("#resource-search").addEventListener("input", renderResources);
  document.querySelector("#resource-category-filter").addEventListener("change", renderResources);
  document.querySelector("#resource-type-filter").addEventListener("change", renderResources);
  document.querySelector("#resource-status-filter").addEventListener("change", renderResources);
  document.querySelector("#clear-resource-filters").addEventListener("click", () => {
    document.querySelector("#resource-search").value = "";
    document.querySelector("#resource-category-filter").value = "all";
    document.querySelector("#resource-type-filter").value = "all";
    document.querySelector("#resource-status-filter").value = "all";
    renderResources();
  });

  document.querySelector("#clear-data-button").addEventListener("click", () => {
    const confirmed = confirm("Clear the current journal and every archived month from this account? Download a JSON backup first if you may need them. This cannot be undone.");
    if (!confirmed) return;
    state = createDefaultState();
    saveState("Fresh journal saved");
    document.querySelector("#motivation").value = state.motivation;
    document.querySelectorAll(".entry-form").forEach((form) => form.reset());
    renderEverything();
    applyTheme();
    activateTab("overview");
    showToast("Your journal was reset to its starting version.");
  });
}

function renderEverything() {
  renderPeriodUI();
  renderGoals();
  renderHabits();
  renderToday();
  renderAcademyReviewFocus();
  renderAssignments();
  renderRtSessions();
  renderIdeas();
  renderResources();
  renderDeepReflections();
  renderEntries();
  renderAllProgress();
  renderWeekSnapshot();
  renderTodos();
  renderArchives();
  applyCardOrder();
}

async function init() {
  const cloud = await window.GrowthCloud.start();
  currentUserId = cloud.user.id;
  state = cloud.journal ? normalizeState(cloud.journal) : loadState();
  PERIOD_START = state.currentPeriod.start;
  PERIOD_END = state.currentPeriod.end;
  setupNavigation();
  setupMotionFeedback();
  setupStaticFields();
  setupEntryForms();
  setupCardReorder();
  setupTodoReorder();
  applyTheme();
  renderEverything();
  activateTab(state.activeTab && document.querySelector(`#${state.activeTab}`) ? state.activeTab : "overview");
  if (!cloud.journal) saveState("Creating your cloud journal…");
  else localStorage.setItem(storageKey(), JSON.stringify(state));
}

document.addEventListener("DOMContentLoaded", init);
