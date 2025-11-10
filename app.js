// StaffQuest – Simple gamified training prototype
// Data is stored in localStorage under STAFFQUEST_DATA_V1

const STORAGE_KEY = "STAFFQUEST_DATA_V1";
const MANAGER_PIN = "1234"; // demo PIN

// Session (who is "logged in")
let currentSession = {
  role: null,        // "employee" | "manager" | null
  employeeId: null   // if role === "employee"
};

// --- State setup ---

let state = {
  employees: [],
  quests: []
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      return;
    } catch (e) {
      console.warn("Failed to parse StaffQuest data, resetting.", e);
    }
  }
  // Seed with example data if none present
  state = {
    employees: [
      {
        id: "emp-1",
        name: "Alex",
        role: "Cashier",
        xp: 80,
        completedQuests: [
          { questId: "q-welcome", timesCompleted: 1 },
          { questId: "q-clean", timesCompleted: 1 }
        ]
      },
      {
        id: "emp-2",
        name: "Jordan",
        role: "Cook",
        xp: 160,
        completedQuests: [
          { questId: "q-welcome", timesCompleted: 1 },
          { questId: "q-speed", timesCompleted: 1 }
        ]
      }
    ],
    quests: [
      {
        id: "q-welcome",
        name: "First Shift Completed",
        category: "Onboarding",
        xp: 50,
        repeatable: false,
        description: "Successfully complete your first shift, following guidance from your trainer."
      },
      {
        id: "q-speed",
        name: "Rush Ready",
        category: "Service",
        xp: 70,
        repeatable: true,
        description: "Support the team during a rush while keeping errors low and communication clear."
      },
      {
        id: "q-clean",
        name: "Closing Checklist Perfect",
        category: "Cleanliness",
        xp: 60,
        repeatable: true,
        description: "Finish the full closing checklist with no missed items and manager sign-off."
      },
      {
        id: "q-accuracy",
        name: "Order Accuracy Streak",
        category: "Accuracy",
        xp: 80,
        repeatable: true,
        description: "Complete 20+ orders in a row without making an input or assembly error."
      }
    ]
  };
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Level + badges helpers ---

function getLevel(xp) {
  // Simple level curve: every 100 XP is a new level
  return Math.floor(xp / 100) + 1;
}

function getLevelProgress(xp) {
  const level = getLevel(xp);
  const base = (level - 1) * 100;
  const current = xp - base;
  const needed = 100;
  return {
    level,
    current,
    needed,
    percent: Math.max(0, Math.min(100, (current / needed) * 100))
  };
}

function getBadgesForEmployee(emp) {
  const xp = emp.xp || 0;
  const completedCount = emp.completedQuests?.reduce((acc, c) => acc + (c.timesCompleted || 0), 0) || 0;

  const badges = [];
  if (xp >= 50) badges.push("Onboarded");
  if (xp >= 150) badges.push("Rising Star");
  if (xp >= 300) badges.push("Shift Hero");
  if (completedCount >= 5) badges.push("Quest Grinder");
  if (completedCount >= 10) badges.push("Veteran");

  return badges;
}

function countCompletedQuests(emp) {
  return emp.completedQuests?.reduce((acc, c) => acc + (c.timesCompleted || 0), 0) || 0;
}

// --- Quest helper declared early so achievements can use it ---

function getQuestCompletion(emp, questId) {
  if (!emp || !emp.completedQuests) return 0;
  const entry = emp.completedQuests.find((c) => c.questId === questId);
  return entry ? entry.timesCompleted || 0 : 0;
}

// --- Achievements setup ---

const ACHIEVEMENTS = [
  {
    id: "ach-first-quest",
    name: "First Quest Done",
    description: "Complete your first quest in StaffQuest.",
    condition: (emp) => countCompletedQuests(emp) >= 1
  },
  {
    id: "ach-five-quests",
    name: "Quest Streak",
    description: "Complete 5 quests in total.",
    condition: (emp) => countCompletedQuests(emp) >= 5
  },
  {
    id: "ach-level3",
    name: "Level 3 Reached",
    description: "Reach level 3 (200 XP).",
    condition: (emp) => getLevel(emp.xp || 0) >= 3
  },
  {
    id: "ach-accuracy",
    name: "Accuracy Ace",
    description: "Complete the 'Order Accuracy Streak' quest at least once.",
    condition: (emp) => getQuestCompletion(emp, "q-accuracy") >= 1
  }
];

function getAchievements(emp) {
  if (!emp) return [];
  return ACHIEVEMENTS.filter((a) => a.condition(emp));
}

// --- DOM references ---

const loginViewSection = document.getElementById("loginView");
const employeeViewSection = document.getElementById("employeeView");
const managerViewSection = document.getElementById("managerView");

const employeeViewBtn = document.getElementById("employeeViewBtn");
const managerViewBtn = document.getElementById("managerViewBtn");

const userStatus = document.getElementById("userStatus");
const logoutBtn = document.getElementById("logoutBtn");

// Login controls
const loginRoleSelect = document.getElementById("loginRoleSelect");
const loginEmployeeSelect = document.getElementById("loginEmployeeSelect");
const loginEmployeeBlock = document.getElementById("loginEmployeeBlock");
const managerPinBlock = document.getElementById("managerPinBlock");
const managerPinInput = document.getElementById("managerPinInput");
const loginContinueBtn = document.getElementById("loginContinueBtn");

const employeeSelect = document.getElementById("employeeSelect");
const newEmployeeBtn = document.getElementById("newEmployeeBtn");
const newEmployeeForm = document.getElementById("newEmployeeForm");
const employeeNameInput = document.getElementById("employeeNameInput");
const employeeRoleInput = document.getElementById("employeeRoleInput");
const cancelNewEmployee = document.getElementById("cancelNewEmployee");

const employeeNameDisplay = document.getElementById("employeeNameDisplay");
const employeeRoleDisplay = document.getElementById("employeeRoleDisplay");
const employeeLevelDisplay = document.getElementById("employeeLevel");
const employeeXPDisplay = document.getElementById("employeeXP");
const employeeBadgesDisplay = document.getElementById("employeeBadges");
const employeeAchievementsList = document.getElementById("employeeAchievementsList");

const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const questFilterSelect = document.getElementById("questFilterSelect");
const questList = document.getElementById("questList");

const employeeTableBody = document.getElementById("employeeTableBody");

const newQuestForm = document.getElementById("newQuestForm");
const questNameInput = document.getElementById("questNameInput");
const questCategoryInput = document.getElementById("questCategoryInput");
const questXPInput = document.getElementById("questXPInput");
const questRepeatableInput = document.getElementById("questRepeatableInput");
const questDescriptionInput = document.getElementById("questDescriptionInput");

// Toast
const achievementToast = document.getElementById("achievementToast");
const achievementToastBody = document.getElementById("achievementToastBody");
let toastTimeoutId = null;

// --- Toast helper ---

function showAchievementToast(achievements) {
  if (!achievements || !achievements.length) return;
  const names = achievements.map((a) => a.name).join(", ");
  achievementToastBody.textContent = names;
  achievementToast.classList.add("sq-toast-visible");

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    achievementToast.classList.remove("sq-toast-visible");
  }, 3500);
}

// --- User status / logout ---

function updateUserStatus() {
  if (!currentSession.role) {
    userStatus.textContent = "Not signed in";
    logoutBtn.style.display = "none";
    return;
  }

  if (currentSession.role === "manager") {
    userStatus.textContent = "Logged in as Manager";
  } else if (currentSession.role === "employee") {
    const emp = state.employees.find((e) => e.id === currentSession.employeeId);
    if (emp) {
      userStatus.textContent = `Logged in as ${emp.name} (Employee)`;
    } else {
      userStatus.textContent = "Logged in as Employee";
    }
  }
  logoutBtn.style.display = "inline-flex";
}

logoutBtn.addEventListener("click", () => {
  currentSession = { role: null, employeeId: null };
  managerPinInput.value = "";
  loginRoleSelect.value = "employee";
  loginEmployeeBlock.style.display = "block";
  managerPinBlock.style.display = "none";

  loginViewSection.classList.remove("sq-view-hidden");
  employeeViewSection.classList.add("sq-view-hidden");
  managerViewSection.classList.add("sq-view-hidden");

  employeeViewBtn.classList.add("sq-tab-btn-active");
  managerViewBtn.classList.remove("sq-tab-btn-active");

  updateUserStatus();
});

// --- View switching with simple access control ---

employeeViewBtn.addEventListener("click", () => {
  if (!currentSession.role) {
    alert("Please sign in first.");
    return;
  }
  showEmployeeView();
});

managerViewBtn.addEventListener("click", () => {
  if (!currentSession.role) {
    alert("Please sign in first.");
    return;
  }
  if (currentSession.role !== "manager") {
    alert("Manager View is restricted in this demo. Sign in as Manager to access it.");
    return;
  }
  showManagerView();
});

function showEmployeeView() {
  loginViewSection.classList.add("sq-view-hidden");
  employeeViewSection.classList.remove("sq-view-hidden");
  managerViewSection.classList.add("sq-view-hidden");
  employeeViewBtn.classList.add("sq-tab-btn-active");
  managerViewBtn.classList.remove("sq-tab-btn-active");
}

function showManagerView() {
  loginViewSection.classList.add("sq-view-hidden");
  employeeViewSection.classList.add("sq-view-hidden");
  managerViewSection.classList.remove("sq-view-hidden");
  managerViewBtn.classList.add("sq-tab-btn-active");
  employeeViewBtn.classList.remove("sq-tab-btn-active");
  renderManagerTable();
}

// --- Login-ish logic ---

function renderLoginEmployeeSelect() {
  if (!loginEmployeeSelect) return;

  loginEmployeeSelect.innerHTML = "";
  if (!state.employees.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No employees yet";
    loginEmployeeSelect.appendChild(opt);
    loginEmployeeSelect.disabled = true;
    return;
  }

  loginEmployeeSelect.disabled = false;

  state.employees.forEach((emp) => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = `${emp.name} (${emp.role || "No role"})`;
    loginEmployeeSelect.appendChild(opt);
  });

  if (!loginEmployeeSelect.value && state.employees[0]) {
    loginEmployeeSelect.value = state.employees[0].id;
  }
}

// Role selection toggles employee block vs manager PIN
loginRoleSelect.addEventListener("change", () => {
  if (loginRoleSelect.value === "employee") {
    loginEmployeeBlock.style.display = "block";
    managerPinBlock.style.display = "none";
  } else {
    loginEmployeeBlock.style.display = "none";
    managerPinBlock.style.display = "block";
    managerPinInput.focus();
  }
});

loginContinueBtn.addEventListener("click", () => {
  const role = loginRoleSelect.value;

  if (role === "employee") {
    let empId = loginEmployeeSelect.value;
    if (!empId && state.employees[0]) {
      empId = state.employees[0].id;
    }
    if (!empId) {
      alert("Please create an employee profile first in the Employee View.");
      return;
    }

    currentSession.role = "employee";
    currentSession.employeeId = empId;

    employeeSelect.value = empId;
    renderEmployeeStats();
    renderQuestList();
    updateUserStatus();
    showEmployeeView();
  } else if (role === "manager") {
    const pin = managerPinInput.value.trim();
    if (pin !== MANAGER_PIN) {
      alert("Incorrect manager PIN.");
      return;
    }
    currentSession.role = "manager";
    currentSession.employeeId = null;
    updateUserStatus();
    showManagerView();
  }
});

// --- Employee creation and selection ---

function renderEmployeeSelect() {
  employeeSelect.innerHTML = "";
  if (!state.employees.length) {
    const opt = document.createElement("option");
    opt.textContent = "No employees yet";
    opt.value = "";
    employeeSelect.appendChild(opt);
    return;
  }

  state.employees.forEach((emp) => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = `${emp.name} (${emp.role || "No role"})`;
    employeeSelect.appendChild(opt);
  });

  if (!employeeSelect.value && state.employees[0]) {
    employeeSelect.value = state.employees[0].id;
  }
}

function getActiveEmployee() {
  const id = employeeSelect.value;
  return state.employees.find((e) => e.id === id) || null;
}

employeeSelect.addEventListener("change", () => {
  renderEmployeeStats();
  renderQuestList();
});

// New employee form toggle
newEmployeeBtn.addEventListener("click", () => {
  newEmployeeForm.classList.remove("sq-form-hidden");
  employeeNameInput.focus();
});

cancelNewEmployee.addEventListener("click", () => {
  newEmployeeForm.reset();
  newEmployeeForm.classList.add("sq-form-hidden");
});

newEmployeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = employeeNameInput.value.trim();
  const role = employeeRoleInput.value.trim();

  if (!name) return;

  const id = `emp-${Date.now()}`;
  state.employees.push({
    id,
    name,
    role,
    xp: 0,
    completedQuests: []
  });
  saveState();
  renderEmployeeSelect();
  renderLoginEmployeeSelect();

  employeeSelect.value = id;
  renderEmployeeStats();
  renderQuestList();

  newEmployeeForm.reset();
  newEmployeeForm.classList.add("sq-form-hidden");
});

// --- Employee stats rendering ---

function renderEmployeeStats() {
  const emp = getActiveEmployee();
  if (!emp) {
    employeeNameDisplay.textContent = "No employee selected";
    employeeRoleDisplay.textContent = "";
    employeeLevelDisplay.textContent = "–";
    employeeXPDisplay.textContent = "–";
    employeeBadgesDisplay.textContent = "–";
    progressFill.style.width = "0%";
    progressLabel.textContent = "0 / 100 XP";
    employeeAchievementsList.innerHTML = "<li>None yet – complete quests to unlock!</li>";
    return;
  }

  employeeNameDisplay.textContent = emp.name;
  employeeRoleDisplay.textContent = emp.role ? emp.role : "Role not set";

  const xp = emp.xp || 0;
  const { level, current, needed, percent } = getLevelProgress(xp);
  employeeLevelDisplay.textContent = level;
  employeeXPDisplay.textContent = xp;

  const badges = getBadgesForEmployee(emp);
  employeeBadgesDisplay.textContent = badges.length ? badges.join(", ") : "None yet";

  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = `${current} / ${needed} XP`;

  const achievements = getAchievements(emp);
  employeeAchievementsList.innerHTML = "";
  if (!achievements.length) {
    const li = document.createElement("li");
    li.textContent = "None yet – complete quests to unlock!";
    employeeAchievementsList.appendChild(li);
  } else {
    achievements.forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="sq-achievement-name">${a.name}</span> – ${a.description}`;
      employeeAchievementsList.appendChild(li);
    });
  }
}

// --- Quest filter and list ---

function renderQuestFilterOptions() {
  const categories = new Set(["all"]);
  state.quests.forEach((q) => {
    if (q.category) categories.add(q.category);
  });

  questFilterSelect.innerHTML = "";
  Array.from(categories).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat === "all" ? "All" : cat;
    questFilterSelect.appendChild(opt);
  });
}

questFilterSelect.addEventListener("change", () => {
  renderQuestList();
});

function renderQuestList() {
  const emp = getActiveEmployee();
  questList.innerHTML = "";

  if (!state.quests.length) {
    const p = document.createElement("p");
    p.className = "sq-muted";
    p.textContent = "No quests yet. Managers can add quests in the Manager View.";
    questList.appendChild(p);
    return;
  }

  const filter = questFilterSelect.value || "all";

  state.quests.forEach((quest) => {
    if (filter !== "all" && quest.category !== filter) return;

    const card = document.createElement("div");
    card.className = "sq-quest-card";

    const main = document.createElement("div");
    main.className = "sq-quest-main";

    const titleRow = document.createElement("div");
    titleRow.className = "sq-quest-title-row";

    const title = document.createElement("div");
    title.className = "sq-quest-title";
    title.textContent = quest.name;

    const catBadge = document.createElement("span");
    catBadge.className = "sq-badge sq-badge-category";
    catBadge.textContent = quest.category || "General";

    const xpBadge = document.createElement("span");
    xpBadge.className = "sq-badge sq-badge-xp";
    xpBadge.textContent = `+${quest.xp} XP`;

    titleRow.appendChild(title);
    titleRow.appendChild(catBadge);
    titleRow.appendChild(xpBadge);

    const desc = document.createElement("p");
    desc.className = "sq-quest-desc";
    desc.textContent = quest.description || "No description provided.";

    main.appendChild(titleRow);
    main.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "sq-quest-meta";

    if (emp) {
      const times = getQuestCompletion(emp, quest.id);
      if (!quest.repeatable && times > 0) {
        meta.textContent = "Completed (non-repeatable)";
      } else if (times > 0) {
        meta.textContent = `Completed ${times} time(s)`;
      } else {
        meta.textContent = "Not yet completed";
      }
    } else {
      meta.textContent = "Select an employee to track completion.";
    }

    main.appendChild(meta);

    const actionWrapper = document.createElement("div");
    if (emp) {
      const button = document.createElement("button");
      button.className = "sq-btn sq-btn-primary";
      button.textContent = "Complete Quest";

      const times = getQuestCompletion(emp, quest.id);
      const locked = !quest.repeatable && times > 0;

      if (locked) {
        button.disabled = true;
        button.textContent = "Quest Locked";
      }

      button.addEventListener("click", () => {
        handleCompleteQuest(emp.id, quest.id);
      });

      actionWrapper.appendChild(button);
    }

    card.appendChild(main);
    card.appendChild(actionWrapper);
    questList.appendChild(card);
  });
}

// --- Quest completion ---

function handleCompleteQuest(empId, questId) {
  const emp = state.employees.find((e) => e.id === empId);
  const quest = state.quests.find((q) => q.id === questId);
  if (!emp || !quest) return;

  const beforeAchievementIds = getAchievements(emp).map((a) => a.id);

  let record = emp.completedQuests.find((c) => c.questId === questId);
  if (!record) {
    record = { questId, timesCompleted: 0 };
    emp.completedQuests.push(record);
  }

  if (!quest.repeatable && record.timesCompleted > 0) {
    return;
  }

  record.timesCompleted += 1;
  emp.xp = (emp.xp || 0) + (quest.xp || 0);

  const afterAchievements = getAchievements(emp);
  const newlyUnlocked = afterAchievements.filter(
    (a) => !beforeAchievementIds.includes(a.id)
  );

  saveState();
  renderEmployeeStats();
  renderQuestList();
  renderManagerTable();

  if (newlyUnlocked.length) {
    showAchievementToast(newlyUnlocked);
  }
}

// --- Manager table ---

function renderManagerTable() {
  employeeTableBody.innerHTML = "";

  if (!state.employees.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "No employees yet. Add employees from the Employee View.";
    td.className = "sq-muted";
    tr.appendChild(td);
    employeeTableBody.appendChild(tr);
    return;
  }

  state.employees.forEach((emp) => {
    const tr = document.createElement("tr");

    const level = getLevel(emp.xp || 0);
    const questsCompleted = countCompletedQuests(emp);

    const nameTd = document.createElement("td");
    nameTd.textContent = emp.name;

    const roleTd = document.createElement("td");
    roleTd.textContent = emp.role || "–";

    const levelTd = document.createElement("td");
    levelTd.textContent = level;

    const xpTd = document.createElement("td");
    xpTd.textContent = emp.xp || 0;

    const qTd = document.createElement("td");
    qTd.textContent = questsCompleted;

    tr.appendChild(nameTd);
    tr.appendChild(roleTd);
    tr.appendChild(levelTd);
    tr.appendChild(xpTd);
    tr.appendChild(qTd);

    employeeTableBody.appendChild(tr);
  });
}

// --- New quest creation ---

newQuestForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = questNameInput.value.trim();
  const category = questCategoryInput.value.trim() || "General";
  const xp = parseInt(questXPInput.value, 10) || 50;
  const repeatable = questRepeatableInput.checked;
  const description = questDescriptionInput.value.trim();

  if (!name) return;

  const id = `q-${Date.now()}`;
  state.quests.push({
    id,
    name,
    category,
    xp,
    repeatable,
    description
  });

  saveState();
  renderQuestFilterOptions();
  renderQuestList();
  newQuestForm.reset();
  questRepeatableInput.checked = true;
});

// --- Init ---

function init() {
  loadState();
  renderEmployeeSelect();
  renderLoginEmployeeSelect();
  renderQuestFilterOptions();
  renderEmployeeStats();
  renderQuestList();
  renderManagerTable();

  loginViewSection.classList.remove("sq-view-hidden");
  employeeViewSection.classList.add("sq-view-hidden");
  managerViewSection.classList.add("sq-view-hidden");

  updateUserStatus();
  logoutBtn.style.display = "none";
}

document.addEventListener("DOMContentLoaded", init);
