const STORAGE_KEY = "activity-shelf-data-v1";

const starterShelves = [
  {
    id: "shelf-watch",
    name: "Watchlist",
    color: "sky",
    activities: [
      { id: crypto.randomUUID(), title: "Watch one cozy travel vlog with tea", mood: "cozy", energy: "low", time: "short" },
      { id: crypto.randomUUID(), title: "Start that anime everyone keeps lovingly mentioning", mood: "curious", energy: "medium", time: "long" },
      { id: crypto.randomUUID(), title: "Rewatch a comfort scene and notice what still hits", mood: "grounded", energy: "low", time: "short" }
    ]
  },
  {
    id: "shelf-make",
    name: "Make",
    color: "peach",
    activities: [
      { id: crypto.randomUUID(), title: "Build a tiny weird app idea for 20 minutes", mood: "creative", energy: "medium", time: "medium" },
      { id: crypto.randomUUID(), title: "Make a mood board for a future room or life chapter", mood: "playful", energy: "medium", time: "medium" },
      { id: crypto.randomUUID(), title: "Write three lines that feel like a soft manifesto", mood: "grounded", energy: "low", time: "short" }
    ]
  },
  {
    id: "shelf-play",
    name: "Play",
    color: "gold",
    activities: [
      { id: crypto.randomUUID(), title: "Play one game quest with no pressure to progress fast", mood: "playful", energy: "medium", time: "medium" },
      { id: crypto.randomUUID(), title: "Try clay, collage, or any material your hands would enjoy", mood: "creative", energy: "high", time: "medium" }
    ]
  },
  {
    id: "shelf-outdoor",
    name: "Outdoor",
    color: "mint",
    activities: [
      { id: crypto.randomUUID(), title: "Take a slow photo walk and collect colors", mood: "curious", energy: "medium", time: "medium" },
      { id: crypto.randomUUID(), title: "Sit outside for ten minutes and let your face meet the light", mood: "grounded", energy: "low", time: "short" },
      { id: crypto.randomUUID(), title: "Notice three beautiful things on the street and save them mentally", mood: "cozy", energy: "low", time: "short" }
    ]
  },
  {
    id: "shelf-self-love",
    name: "Self-love bits",
    color: "rose",
    activities: [
      { id: crypto.randomUUID(), title: "Write a note to yourself like you are rooting for a friend", mood: "grounded", energy: "low", time: "short" },
      { id: crypto.randomUUID(), title: "Dress up a little just because your day gets to have texture", mood: "playful", energy: "medium", time: "short" },
      { id: crypto.randomUUID(), title: "List five things your present self has survived already", mood: "grounded", energy: "low", time: "short" }
    ]
  }
];

const autoSuggestionPool = {
  Watchlist: [
    { title: "Find a study-with-me video that feels like company", mood: "cozy", energy: "low", time: "medium" },
    { title: "Watch a behind-the-scenes clip from something you love", mood: "curious", energy: "low", time: "short" }
  ],
  Make: [
    { title: "Design a fake poster for a life phase you are growing into", mood: "creative", energy: "medium", time: "medium" },
    { title: "Make a tiny playlist title first, then fill it in", mood: "playful", energy: "low", time: "short" }
  ],
  Play: [
    { title: "Invent a silly challenge mode for a game you already play", mood: "playful", energy: "high", time: "medium" },
    { title: "Learn one tiny trick in something hands-on", mood: "curious", energy: "medium", time: "short" }
  ],
  Outdoor: [
    { title: "Go outside and look only for soft shapes and shadows", mood: "grounded", energy: "low", time: "short" },
    { title: "Walk a slightly different route and let novelty do a little work", mood: "curious", energy: "medium", time: "medium" }
  ],
  "Self-love bits": [
    { title: "Choose a scent, song, or outfit detail that makes today feel cared for", mood: "cozy", energy: "low", time: "short" },
    { title: "Write down one thing you like about how you move through the world", mood: "grounded", energy: "low", time: "short" }
  ]
};

const shelfBoard = document.getElementById("shelf-board");
const shelfTemplate = document.getElementById("shelf-template");
const activityTemplate = document.getElementById("activity-template");
const suggestionCard = document.getElementById("suggestion-card");
const filterForm = document.getElementById("filter-form");
const activityDialog = document.getElementById("activity-dialog");
const activityForm = document.getElementById("activity-form");
const shelfDialog = document.getElementById("shelf-dialog");
const shelfForm = document.getElementById("shelf-form");

let shelves = loadShelves();
let hiddenActivityIds = new Set();

renderShelves();
renderSuggestion(pickSuggestion());

document.getElementById("suggest-btn").addEventListener("click", () => {
  renderSuggestion(pickSuggestion());
});

document.getElementById("reroll-btn").addEventListener("click", () => {
  renderSuggestion(pickSuggestion());
});

filterForm.addEventListener("change", () => {
  renderSuggestion(pickSuggestion());
});

document.getElementById("add-shelf-btn").addEventListener("click", () => {
  shelfForm.reset();
  shelfDialog.showModal();
});

document.getElementById("cancel-activity-btn").addEventListener("click", () => {
  activityDialog.close();
});

document.getElementById("cancel-shelf-btn").addEventListener("click", () => {
  shelfDialog.close();
});

activityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(activityForm);
  const shelfId = formData.get("shelfId");
  const shelf = shelves.find((entry) => entry.id === shelfId);
  if (!shelf) {
    return;
  }

  shelf.activities.unshift({
    id: crypto.randomUUID(),
    title: String(formData.get("title")).trim(),
    mood: String(formData.get("mood")),
    energy: String(formData.get("energy")),
    time: String(formData.get("time"))
  });

  persistShelves();
  renderShelves();
  renderSuggestion(pickSuggestion());
  activityDialog.close();
});

shelfForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(shelfForm);
  shelves.push({
    id: `shelf-${crypto.randomUUID()}`,
    name: String(formData.get("name")).trim(),
    color: String(formData.get("color")),
    activities: []
  });

  persistShelves();
  renderShelves();
  shelfDialog.close();
});

function loadShelves() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return structuredClone(starterShelves);
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : structuredClone(starterShelves);
  } catch (error) {
    console.error("Could not load shelf data", error);
    return structuredClone(starterShelves);
  }
}

function persistShelves() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves));
}

function renderShelves() {
  shelfBoard.innerHTML = "";

  shelves.forEach((shelf) => {
    const fragment = shelfTemplate.content.cloneNode(true);
    const shelfCard = fragment.querySelector(".shelf-card");
    const kicker = fragment.querySelector(".shelf-kicker");
    const title = fragment.querySelector(".shelf-title");
    const addButton = fragment.querySelector(".add-activity-button");
    const autoFillButton = fragment.querySelector(".auto-fill-button");
    const activityList = fragment.querySelector(".activity-list");

    shelfCard.dataset.color = shelf.color;
    kicker.textContent = `${shelf.activities.length} on shelf`;
    title.textContent = shelf.name;

    addButton.addEventListener("click", () => openActivityDialog(shelf.id));
    autoFillButton.addEventListener("click", () => autoFillShelf(shelf.id));

    if (shelf.activities.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "This shelf is waiting for its first soft little idea.";
      activityList.appendChild(empty);
    } else {
      shelf.activities.forEach((activity) => {
        const activityFragment = activityTemplate.content.cloneNode(true);
        const activityTitle = activityFragment.querySelector(".activity-title");
        const activityTags = activityFragment.querySelector(".activity-tags");
        const doneButton = activityFragment.querySelector(".done-button");
        const hideButton = activityFragment.querySelector(".hide-button");

        activityTitle.textContent = activity.title;
        activityTags.textContent = `${toTitleCase(activity.mood)} | ${toTitleCase(activity.energy)} energy | ${timeLabel(activity.time)}`;

        doneButton.addEventListener("click", () => markDone(shelf.id, activity.id));
        hideButton.addEventListener("click", () => {
          hiddenActivityIds.add(activity.id);
          renderSuggestion(pickSuggestion());
        });

        activityList.appendChild(activityFragment);
      });
    }

    shelfBoard.appendChild(fragment);
  });
}

function openActivityDialog(shelfId) {
  activityForm.reset();
  document.getElementById("activity-shelf-id").value = shelfId;
  activityDialog.showModal();
}

function autoFillShelf(shelfId) {
  const shelf = shelves.find((entry) => entry.id === shelfId);
  if (!shelf) {
    return;
  }

  const matches = autoSuggestionPool[shelf.name] || [];
  const existingTitles = new Set(shelf.activities.map((activity) => activity.title));
  const nextSuggestion = matches.find((entry) => !existingTitles.has(entry.title));

  if (!nextSuggestion) {
    renderSuggestion({
      shelf: shelf.name,
      title: "That shelf already has all of its starter sparks.",
      mood: "grounded",
      energy: "low",
      time: "short",
      note: "Try adding your own activity next. The best shelves usually get personal."
    });
    return;
  }

  shelf.activities.push({
    id: crypto.randomUUID(),
    ...nextSuggestion
  });

  persistShelves();
  renderShelves();
  renderSuggestion({
    shelf: shelf.name,
    ...nextSuggestion,
    note: "Added a soft new prompt to this shelf."
  });
}

function markDone(shelfId, activityId) {
  const shelf = shelves.find((entry) => entry.id === shelfId);
  if (!shelf) {
    return;
  }

  const activity = shelf.activities.find((entry) => entry.id === activityId);
  shelf.activities = shelf.activities.filter((entry) => entry.id !== activityId);

  if (activity) {
    shelf.activities.push(activity);
  }

  persistShelves();
  renderShelves();
  renderSuggestion({
    shelf: shelf.name,
    title: "Saved that little win.",
    mood: activity?.mood || "grounded",
    energy: activity?.energy || "low",
    time: activity?.time || "short",
    note: "Finished activities go to the back of the shelf so they can come around again later."
  });
}

function pickSuggestion() {
  const filters = new FormData(filterForm);
  const mood = filters.get("mood");
  const energy = filters.get("energy");
  const time = filters.get("time");

  const allActivities = shelves.flatMap((shelf) =>
    shelf.activities.map((activity) => ({
      shelf: shelf.name,
      ...activity
    }))
  );

  const visibleActivities = allActivities.filter((activity) => !hiddenActivityIds.has(activity.id));
  const filtered = visibleActivities.filter((activity) => {
    const moodMatch = mood === "any" || activity.mood === mood;
    const energyMatch = energy === "any" || activity.energy === energy;
    const timeMatch = time === "any" || activity.time === time;
    return moodMatch && energyMatch && timeMatch;
  });

  const source = filtered.length > 0 ? filtered : visibleActivities;
  if (source.length === 0) {
    return {
      shelf: "Fresh start",
      title: "Your shelf is empty right now.",
      mood: "grounded",
      energy: "low",
      time: "short",
      note: "Add a shelf or drop in a few activities and this space will start feeling alive."
    };
  }

  const chosen = source[Math.floor(Math.random() * source.length)];
  return {
    ...chosen,
    note: filtered.length > 0
      ? "This one fits the mood of the moment."
      : "Nothing matched every filter, so I picked from the wider shelf instead."
  };
}

function renderSuggestion(activity) {
  suggestionCard.innerHTML = `
    <p class="suggestion-shelf">${activity.shelf}</p>
    <h3 class="suggestion-title">${activity.title}</h3>
    <p class="suggestion-meta">${toTitleCase(activity.mood)} | ${toTitleCase(activity.energy)} energy | ${timeLabel(activity.time)}</p>
    <p class="suggestion-note">${activity.note || "A quiet nudge from your shelf."}</p>
  `;
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function timeLabel(value) {
  if (value === "short") {
    return "under 20 min";
  }
  if (value === "medium") {
    return "20 to 60 min";
  }
  return "an hour or more";
}
