// StaffQuest UI utilities

// Views
const sqViews = {
  login: document.getElementById("loginView"),
  employee: document.getElementById("employeeView"),
  manager: document.getElementById("managerView")
};

// DOM refs
const sqDom = {
  employeeViewBtn: document.getElementById("employeeViewBtn"),
  managerViewBtn: document.getElementById("managerViewBtn"),
  userStatus: document.getElementById("userStatus"),
  logoutBtn: document.getElementById("logoutBtn"),
  helpBtn: document.getElementById("helpBtn"),

  loginRoleSelect: document.getElementById("loginRoleSelect"),
  loginEmployeeBlock: document.getElementById("loginEmployeeBlock"),
  loginEmployeeSelect: document.getElementById("loginEmployeeSelect"),
  managerPinBlock: document.getElementById("managerPinBlock"),
  managerPinInput: document.getElementById("managerPinInput"),
  loginContinueBtn: document.getElementById("loginContinueBtn"),

  employeeSelect: document.getElementById("employeeSelect"),
  employeeManageBtn: document.getElementById("employeeManageBtn"),
  employeeProfileEmpty: document.getElementById("employeeProfileEmpty"),
  employeeProfilePanel: document.getElementById("employeeProfilePanel"),
  employeeNameDisplay: document.getElementById("employeeNameDisplay"),
  employeeRoleDisplay: document.getElementById("employeeRoleDisplay"),
  employeeLevelLabel: document.getElementById("employeeLevelLabel"),
  employeeXP: document.getElementById("employeeXP"),
  employeeNextLevel: document.getElementById("employeeNextLevel"),
  employeeQuestCount: document.getElementById("employeeQuestCount"),
  progressFill: document.getElementById("progressFill"),
  progressLabel: document.getElementById("progressLabel"),
  employeeAchievementsList: document.getElementById("employeeAchievementsList"),
  viewHistoryBtn: document.getElementById("viewHistoryBtn"),
  resetEmployeeBtn: document.getElementById("resetEmployeeBtn"),

  employeeXPToday: document.getElementById("employeeXPToday"),
  employeeStreakCurrent: document.getElementById("employeeStreakCurrent"),
  employeeStreakBest: document.getElementById("employeeStreakBest"),

  moodButtons: document.getElementById("moodButtons"),
  moodStatus: document.getElementById("moodStatus"),

  questTypeFilters: document.getElementById("questTypeFilters"),
  questCategoryFilter: document.getElementById("questCategoryFilter"),
  questList: document.getElementById("questList"),
  randomQuestBtn: document.getElementById("randomQuestBtn"),

  employeeSearchInput: document.getElementById("employeeSearchInput"),
  addEmployeeBtn: document.getElementById("addEmployeeBtn"),
  employeeListEmpty: document.getElementById("employeeListEmpty"),
  employeeTableWrapper: document.getElementById("employeeTableWrapper"),
  employeeTableBody: document.getElementById("employeeTableBody"),
  resetAllDataBtn: document.getElementById("resetAllDataBtn"),

  teamTotalXP: document.getElementById("teamTotalXP"),
  teamAvgLevel: document.getElementById("teamAvgLevel"),
  teamTotalQuests: document.getElementById("teamTotalQuests"),

  teamQuestsToday: document.getElementById("teamQuestsToday"),
  teamXPToday: document.getElementById("teamXPToday"),
  teamMostActiveToday: document.getElementById("teamMostActiveToday"),

  topPerformersList: document.getElementById("topPerformersList"),

  questForm: document.getElementById("questForm"),
  questIdInput: document.getElementById("questIdInput"),
  questNameInput: document.getElementById("questNameInput"),
  questCategoryInput: document.getElementById("questCategoryInput"),
  questTypeInput: document.getElementById("questTypeInput"),
  questXPInput: document.getElementById("questXPInput"),
  questRepeatableInput: document.getElementById("questRepeatableInput"),
  questDescriptionInput: document.getElementById("questDescriptionInput"),
  questCancelEditBtn: document.getElementById("questCancelEditBtn"),
  questManagerList: document.getElementById("questManagerList"),

  historyModal: document.getElementById("historyModal"),
  historyModalClose: document.getElementById("historyModalClose"),
  historyModalBody: document.getElementById("historyModalBody"),

  helpModal: document.getElementById("helpModal"),
  helpModalClose: document.getElementById("helpModalClose"),

  toast: document.getElementById("toast"),
  toastTitle: document.getElementById("toastTitle"),
  toastBody: document.getElementById("toastBody")
};

let sqToastTimeoutId = null;

// -------- Views --------

function sqShowView(which) {
  Object.keys(sqViews).forEach((k) => sqViews[k].classList.add("sq-hidden"));
  if (sqViews[which]) {
    sqViews[which].classList.remove("sq-hidden");
  }
}

function sqSetTabActive(tab) {
  if (!sqDom.employeeViewBtn || !sqDom.managerViewBtn) return;
  if (tab === "employee") {
    sqDom.employeeViewBtn.classList.add("sq-tab-active");
    sqDom.managerViewBtn.classList.remove("sq-tab-active");
  } else {
    sqDom.managerViewBtn.classList.add("sq-tab-active");
    sqDom.employeeViewBtn.classList.remove("sq-tab-active");
  }
}

function sqUpdateUserStatus(session) {
  if (!session || !session.role) {
    sqDom.userStatus.textContent = "Not signed in";
    sqDom.logoutBtn.classList.add("sq-hidden");
    return;
  }
  if (session.role === "manager") {
    sqDom.userStatus.textContent = "Logged in as Manager";
  } else {
    const emp = sqGetEmployeeById(session.employeeId);
    sqDom.userStatus.textContent = emp
      ? `Logged in as ${emp.name} (Employee)`
      : "Logged in as Employee";
  }
  sqDom.logoutBtn.classList.remove("sq-hidden");
}

// -------- Toasts --------

function sqShowToast(title, body) {
  if (!sqDom.toast) return;
  sqDom.toastTitle.textContent = title || "";
  sqDom.toastBody.textContent = body || "";
  sqDom.toast.classList.add("sq-toast-visible");
  sqDom.toast.classList.remove("sq-hidden");
  if (sqToastTimeoutId) clearTimeout(sqToastTimeoutId);
  sqToastTimeoutId = setTimeout(() => {
    sqDom.toast.classList.remove("sq-toast-visible");
    sqToastTimeoutId = null;
  }, 3200);
}

// -------- Mood storage --------

function sqGetMoodMap() {
  try {
    const raw = localStorage.getItem("sq_mood_log");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function sqSaveMoodMap(map) {
  localStorage.setItem("sq_mood_log", JSON.stringify(map || {}));
}

// -------- Login view --------

function sqRenderLoginEmployeeOptions() {
  const select = sqDom.loginEmployeeSelect;
  if (!select) return;
  const employees = sqGetEmployees();
  select.innerHTML = "";
  if (!employees.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No employees yet";
    select.appendChild(opt);
    select.disabled = true;
    return;
  }
  select.disabled = false;
  employees.forEach((emp) => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = `${emp.name} (${emp.role || "No role"})`;
    select.appendChild(opt);
  });
}

function sqRenderLoginRoleUI() {
  const role = sqDom.loginRoleSelect.value;
  if (role === "employee") {
    sqDom.loginEmployeeBlock.classList.remove("sq-hidden");
    sqDom.managerPinBlock.classList.add("sq-hidden");
  } else {
    sqDom.loginEmployeeBlock.classList.add("sq-hidden");
    sqDom.managerPinBlock.classList.remove("sq-hidden");
    sqDom.managerPinInput.focus();
  }
}

// -------- Employee profile & streaks --------

function sqComputeStreakStats(emp) {
  const history = emp.questHistory || [];
  const today = new Date();
  const todayKey = today.toDateString();

  let xpToday = 0;
  const daySet = new Set();

  history.forEach((h) => {
    const d = new Date(h.completedAt);
    if (isNaN(d.getTime())) return;
    const key = d.toDateString();
    daySet.add(key);
    if (key === todayKey) {
      const quest = sqGetQuestById(h.questId);
      const xp = h.xpEarned || (quest ? quest.xp || 0 : 0);
      xpToday += xp;
    }
  });

  if (!daySet.size) {
    return { xpToday, currentStreak: 0, bestStreak: 0 };
  }

  const sortedTimes = Array.from(daySet)
    .map((k) => new Date(k).getTime())
    .sort((a, b) => a - b);

  let best = 1;
  let current = 1;
  for (let i = 1; i < sortedTimes.length; i++) {
    const diffDays =
      (sortedTimes[i] - sortedTimes[i - 1]) / (1000 * 60 * 60 * 24);
    if (Math.round(diffDays) === 1) {
      current += 1;
    } else {
      current = 1;
    }
    if (current > best) best = current;
  }

  let curStreak = 0;
  let cursor = new Date(todayKey);
  while (daySet.has(cursor.toDateString())) {
    curStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    xpToday,
    currentStreak: curStreak,
    bestStreak: best
  };
}

function sqRenderEmployeeSelect() {
  const select = sqDom.employeeSelect;
  const employees = sqGetEmployees();
  select.innerHTML = "";
  if (!employees.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No employees yet";
    select.appendChild(opt);
    sqDom.employeeProfileEmpty.classList.remove("sq-hidden");
    sqDom.employeeProfilePanel.classList.add("sq-hidden");
    return;
  }
  employees.forEach((emp) => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = `${emp.name} (${emp.role || "No role"})`;
    select.appendChild(opt);
  });
  sqDom.employeeProfileEmpty.classList.add("sq-hidden");
  sqDom.employeeProfilePanel.classList.remove("sq-hidden");
}

function sqRenderEmployeeProfile(empId, opts = {}) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) {
    sqDom.employeeProfileEmpty.classList.remove("sq-hidden");
    sqDom.employeeProfilePanel.classList.add("sq-hidden");
    return;
  }
  sqDom.employeeProfileEmpty.classList.add("sq-hidden");
  sqDom.employeeProfilePanel.classList.remove("sq-hidden");

  const xp = emp.xp || 0;
  const { level, current, needed, percent } = sqGetLevelProgress(xp);
  const questCount = sqGetQuestCountsForEmployee(emp);

  sqDom.employeeNameDisplay.textContent = emp.name;
  sqDom.employeeRoleDisplay.textContent = emp.role || "Role not set";
  sqDom.employeeLevelLabel.textContent = `Lv ${level}`;
  sqDom.employeeXP.textContent = xp;
  sqDom.employeeNextLevel.textContent = `${needed} XP`;
  sqDom.employeeQuestCount.textContent = questCount;
  sqDom.progressLabel.textContent = `${current} / ${needed} XP`;
  sqDom.progressFill.style.width = percent + "%";

  if (opts.levelUp) {
    sqDom.progressFill.classList.add("sq-level-up");
    setTimeout(() => sqDom.progressFill.classList.remove("sq-level-up"), 700);
  }

  const achievements = sqGetAchievements(emp);
  sqDom.employeeAchievementsList.innerHTML = "";
  if (!achievements.length) {
    const li = document.createElement("li");
    li.textContent = "No achievements yet – complete quests to unlock.";
    sqDom.employeeAchievementsList.appendChild(li);
  } else {
    achievements.forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="sq-achievement-name">${a.name}</span> – ${a.description}`;
      sqDom.employeeAchievementsList.appendChild(li);
    });
  }

  const streak = sqComputeStreakStats(emp);
  if (sqDom.employeeXPToday) sqDom.employeeXPToday.textContent = streak.xpToday || 0;
  if (sqDom.employeeStreakCurrent)
    sqDom.employeeStreakCurrent.textContent = (streak.currentStreak || 0) + "d";
  if (sqDom.employeeStreakBest)
    sqDom.employeeStreakBest.textContent = (streak.bestStreak || 0) + "d";

  if (sqDom.moodStatus) {
    const moodMap = sqGetMoodMap();
    const empMood = moodMap[emp.id];
    const todayKey = new Date().toDateString();
    if (empMood && empMood.date === todayKey) {
      sqDom.moodStatus.textContent = `Today's mood: ${empMood.mood}`;
    } else {
      sqDom.moodStatus.textContent = "No mood logged for today yet.";
    }
  }
}

// -------- Quests: difficulty + filters --------

function sqGetDifficultyLabel(quest) {
  const xp = quest.xp || 0;
  if (xp <= 40) return "Easy";
  if (xp <= 80) return "Normal";
  return "Hard";
}

function sqRenderQuestCategoryFilter() {
  const select = sqDom.questCategoryFilter;
  const quests = sqGetQuests();
  const categories = new Set(["all"]);
  quests.forEach((q) => {
    if (q.category) categories.add(q.category);
  });
  select.innerHTML = "";
  Array.from(categories).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat === "all" ? "All categories" : cat;
    select.appendChild(opt);
  });
}

function sqRenderQuestTypePills(activeType) {
  const container = sqDom.questTypeFilters;
  const buttons = container.querySelectorAll("button[data-type]");
  buttons.forEach((btn) => {
    const t = btn.getAttribute("data-type");
    if (t === activeType) {
      btn.classList.add("sq-pill-active");
    } else {
      btn.classList.remove("sq-pill-active");
    }
  });
}

function sqRenderQuestList(activeEmployeeId, filterType = "all", filterCategory = "all") {
  const emp = sqGetEmployeeById(activeEmployeeId);
  const listEl = sqDom.questList;
  listEl.innerHTML = "";

  const quests = sqGetQuests().filter((q) => {
    if (filterType !== "all" && q.type !== filterType) return false;
    if (filterCategory !== "all" && q.category !== filterCategory) return false;
    return true;
  });

  if (!quests.length) {
    const p = document.createElement("p");
    p.className = "sq-muted sq-caption";
    p.textContent = "No quests match the current filters.";
    listEl.appendChild(p);
    return;
  }

  quests.forEach((quest) => {
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

    const typeBadge = document.createElement("span");
    typeBadge.className = "sq-badge sq-badge-type";
    typeBadge.textContent = quest.type;

    const xpBadge = document.createElement("span");
    xpBadge.className = "sq-badge sq-badge-xp";
    xpBadge.textContent = `+${quest.xp || 0} XP`;

    const diffBadge = document.createElement("span");
    diffBadge.className = "sq-badge sq-badge-difficulty";
    diffBadge.textContent = sqGetDifficultyLabel(quest);

    titleRow.appendChild(title);
    titleRow.appendChild(catBadge);
    titleRow.appendChild(typeBadge);
    titleRow.appendChild(xpBadge);
    titleRow.appendChild(diffBadge);

    const desc = document.createElement("p");
    desc.className = "sq-quest-desc";
    desc.textContent = quest.description || "No description provided.";

    const meta = document.createElement("div");
    meta.className = "sq-quest-meta";

    if (emp) {
      const history = emp.questHistory || [];
      const times = history.filter((h) => h.questId === quest.id).length;
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

    main.appendChild(titleRow);
    main.appendChild(desc);
    main.appendChild(meta);

    const action = document.createElement("div");
    if (emp) {
      const history = emp.questHistory || [];
      const times = history.filter((h) => h.questId === quest.id).length;
      const locked = !quest.repeatable && times > 0;

      const btn = document.createElement("button");
      btn.className = "sq-btn sq-btn-primary sq-btn-sm";
      btn.textContent = locked ? "Quest locked" : "Complete quest";
      btn.disabled = locked;

      btn.addEventListener("click", () => {
        if (locked) return;
        if (typeof sqHandleQuestCompleted === "function") {
          sqHandleQuestCompleted(emp.id, quest.id);
        }
      });

      action.appendChild(btn);
    }

    card.appendChild(main);
    card.appendChild(action);
    listEl.appendChild(card);
  });
}

function sqSuggestRandomQuest() {
  const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
  const emp = sqGetEmployeeById(empId);
  if (!emp) {
    sqShowToast("Pick an employee", "Select an employee profile first.");
    return;
  }

  const quests = sqGetQuests();
  if (!quests.length) {
    sqShowToast("No quests yet", "Managers can add quests in the Manager view.");
    return;
  }

  const idx = Math.floor(Math.random() * quests.length);
  const q = quests[idx];
  sqShowToast("Random quest", `${q.name} (+${q.xp || 0} XP)`);
}

// -------- Manager: team + top performers + today summary --------

function sqRenderEmployeeTable(filterText = "") {
  const employees = sqGetEmployees();
  const tbody = sqDom.employeeTableBody;
  tbody.innerHTML = "";

  const text = (filterText || "").toLowerCase();

  const filtered = employees.filter((emp) => {
    if (!text) return true;
    return (
      (emp.name || "").toLowerCase().includes(text) ||
      (emp.role || "").toLowerCase().includes(text)
    );
  });

  if (!filtered.length) {
    sqDom.employeeListEmpty.textContent = employees.length
      ? "No employees match this search."
      : "No employees yet. Add at least one to begin.";
    sqDom.employeeListEmpty.classList.remove("sq-hidden");
    sqDom.employeeTableWrapper.classList.add("sq-hidden");
  } else {
    sqDom.employeeListEmpty.classList.add("sq-hidden");
    sqDom.employeeTableWrapper.classList.remove("sq-hidden");

    filtered.forEach((emp) => {
      const tr = document.createElement("tr");
      const xp = emp.xp || 0;
      const level = sqGetLevel(xp);
      const questCount = sqGetQuestCountsForEmployee(emp);

      const nameTd = document.createElement("td");
      nameTd.textContent = emp.name;

      const roleTd = document.createElement("td");
      roleTd.textContent = emp.role || "–";

      const levelTd = document.createElement("td");
      levelTd.textContent = level;

      const xpTd = document.createElement("td");
      xpTd.textContent = xp;

      const qTd = document.createElement("td");
      qTd.textContent = questCount;

      tr.appendChild(nameTd);
      tr.appendChild(roleTd);
      tr.appendChild(levelTd);
      tr.appendChild(xpTd);
      tr.appendChild(qTd);
      tbody.appendChild(tr);
    });
  }

  sqRenderTeamSummary();
}

function sqRenderTopPerformers(employees) {
  const ul = sqDom.topPerformersList;
  if (!ul) return;
  ul.innerHTML = "";

  if (!employees.length) {
    const li = document.createElement("li");
    li.className = "sq-muted sq-caption";
    li.textContent = "No employees yet.";
    ul.appendChild(li);
    return;
  }

  const sorted = employees
    .slice()
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 3);

  sorted.forEach((emp, index) => {
    const xp = emp.xp || 0;
    const level = sqGetLevel(xp);
    const li = document.createElement("li");
    li.innerHTML = `<strong>${index + 1}. ${emp.name}</strong> – Lv ${level}, ${xp} XP`;
    ul.appendChild(li);
  });
}

function sqRenderTeamSummary() {
  const employees = sqGetEmployees();
  if (!employees.length) {
    sqDom.teamTotalXP.textContent = "0";
    sqDom.teamAvgLevel.textContent = "0";
    sqDom.teamTotalQuests.textContent = "0";

    if (sqDom.teamQuestsToday) sqDom.teamQuestsToday.textContent = "0";
    if (sqDom.teamXPToday) sqDom.teamXPToday.textContent = "0";
    if (sqDom.teamMostActiveToday) sqDom.teamMostActiveToday.textContent = "–";

    if (sqDom.topPerformersList) {
      sqDom.topPerformersList.innerHTML = "";
    }
    return;
  }

  let totalXP = 0;
  let totalQuests = 0;
  let totalLevel = 0;

  const todayKey = new Date().toDateString();
  let questsToday = 0;
  let xpToday = 0;
  let mostActive = null;
  let mostActiveCount = 0;

  employees.forEach((emp) => {
    const xp = emp.xp || 0;
    totalXP += xp;
    totalLevel += sqGetLevel(xp);
    const questCount = sqGetQuestCountsForEmployee(emp);
    totalQuests += questCount;

    const history = emp.questHistory || [];
    let empQuestsToday = 0;
    let empXPToday = 0;

    history.forEach((h) => {
      const d = new Date(h.completedAt);
      if (isNaN(d.getTime())) return;
      if (d.toDateString() !== todayKey) return;

      empQuestsToday += 1;
      const q = sqGetQuestById(h.questId);
      const gained = h.xpEarned || (q ? q.xp || 0 : 0);
      empXPToday += gained;
    });

    questsToday += empQuestsToday;
    xpToday += empXPToday;

    if (empQuestsToday > mostActiveCount) {
      mostActiveCount = empQuestsToday;
      mostActive = emp;
    }
  });

  const avgLevel = totalLevel / employees.length;

  sqDom.teamTotalXP.textContent = String(totalXP);
  sqDom.teamAvgLevel.textContent = avgLevel.toFixed(1);
  sqDom.teamTotalQuests.textContent = String(totalQuests);

  if (sqDom.teamQuestsToday)
    sqDom.teamQuestsToday.textContent = String(questsToday);
  if (sqDom.teamXPToday) sqDom.teamXPToday.textContent = String(xpToday);
  if (sqDom.teamMostActiveToday) {
    sqDom.teamMostActiveToday.textContent = mostActive ? mostActive.name : "–";
  }

  sqRenderTopPerformers(employees);
}

// -------- Quest manager --------

function sqFillQuestForm(quest) {
  if (!quest) {
    sqDom.questIdInput.value = "";
    sqDom.questNameInput.value = "";
    sqDom.questCategoryInput.value = "";
    sqDom.questTypeInput.value = "core";
    sqDom.questXPInput.value = "50";
    sqDom.questRepeatableInput.checked = true;
    sqDom.questDescriptionInput.value = "";
    sqDom.questCancelEditBtn.classList.add("sq-hidden");
    return;
  }
  sqDom.questIdInput.value = quest.id;
  sqDom.questNameInput.value = quest.name || "";
  sqDom.questCategoryInput.value = quest.category || "";
  sqDom.questTypeInput.value = quest.type || "core";
  sqDom.questXPInput.value = quest.xp || 50;
  sqDom.questRepeatableInput.checked = !!quest.repeatable;
  sqDom.questDescriptionInput.value = quest.description || "";
  sqDom.questCancelEditBtn.classList.remove("sq-hidden");
}

function sqRenderQuestManagerList() {
  const quests = sqGetQuests();
  const listEl = sqDom.questManagerList;
  listEl.innerHTML = "";
  if (!quests.length) {
    const p = document.createElement("p");
    p.className = "sq-muted sq-caption";
    p.textContent = "No quests yet. Add a few to get started.";
    listEl.appendChild(p);
    return;
  }
  quests.forEach((q) => {
    const item = document.createElement("div");
    item.className = "sq-quest-manager-item";

    const main = document.createElement("div");
    main.className = "sq-quest-manager-main";

    const title = document.createElement("div");
    title.className = "sq-quest-manager-title";
    title.textContent = q.name;

    const meta = document.createElement("div");
    meta.className = "sq-quest-manager-meta";
    meta.textContent = `${
      q.category || "General"
    } · ${q.type} · XP: ${q.xp || 0} · ${sqGetDifficultyLabel(q)} difficulty`;

    main.appendChild(title);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "sq-quest-manager-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "sq-btn sq-btn-ghost sq-btn-xs";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const fullQuest = sqGetQuestById(q.id);
      sqFillQuestForm(fullQuest);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "sq-btn sq-btn-danger sq-btn-xs";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      if (confirm("Delete this quest? This cannot be undone.")) {
        sqDeleteQuest(q.id);
        sqRenderQuestManagerList();
        sqRenderQuestCategoryFilter();
        if (window.sqRefreshEmployeeQuestList)
          window.sqRefreshEmployeeQuestList();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(main);
    item.appendChild(actions);
    listEl.appendChild(item);
  });
}

// -------- History modal --------

function sqOpenHistoryModal(empId) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) return;
  sqDom.historyModal.classList.remove("sq-hidden");

  const body = sqDom.historyModalBody;
  body.innerHTML = "";
  const history = (emp.questHistory || []).slice().sort((a, b) => {
    return new Date(b.completedAt) - new Date(a.completedAt);
  });

  if (!history.length) {
    const p = document.createElement("p");
    p.className = "sq-muted";
    p.textContent = "No quest history yet.";
    body.appendChild(p);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "sq-history-list";

  history.forEach((h) => {
    const li = document.createElement("li");
    li.className = "sq-history-item";

    const quest = sqGetQuestById(h.questId);
    const name = quest ? quest.name : "Unknown quest";
    const xp = h.xpEarned || (quest ? quest.xp || 0 : 0);
    const date = new Date(h.completedAt);
    const dateStr = isNaN(date.getTime()) ? h.completedAt : date.toLocaleString();

    li.innerHTML = `<strong>${name}</strong> · +${xp} XP<br /><span class="sq-muted">${dateStr}</span>`;
    ul.appendChild(li);
  });

  body.appendChild(ul);
}

function sqCloseHistoryModal() {
  sqDom.historyModal.classList.add("sq-hidden");
}

// -------- Help modal --------

function sqOpenHelpModal() {
  sqDom.helpModal.classList.remove("sq-hidden");
}

function sqCloseHelpModal() {
  sqDom.helpModal.classList.add("sq-hidden");
}
