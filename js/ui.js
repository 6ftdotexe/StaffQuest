// ui.js – DOM rendering & lightweight helpers

const sqDom = {
  // General
  loginScreen: document.getElementById("loginScreen"),
  employeeScreen: document.getElementById("employeeScreen"),
  managerScreen: document.getElementById("managerScreen"),
  logoutBtn: document.getElementById("logoutBtn"),
  toastContainer: document.getElementById("toastContainer"),

  // Login
  loginRoleSelect: document.getElementById("loginRoleSelect"),
  loginEmployeeBlock: document.getElementById("loginEmployeeBlock"),
  loginEmployeeSelect: document.getElementById("loginEmployeeSelect"),
  employeePinBlock: document.getElementById("employeePinBlock"),
  employeePinInput: document.getElementById("employeePinInput"),
  managerPinBlock: document.getElementById("managerPinBlock"),
  managerPinInput: document.getElementById("managerPinInput"),
  loginContinueBtn: document.getElementById("loginContinueBtn"),

  // Employee view
  empName: document.getElementById("empName"),
  empRole: document.getElementById("empRole"),
  empLevel: document.getElementById("empLevel"),
  empTitle: document.getElementById("empTitle"),
  empXP: document.getElementById("empXP"),
  empQuestsDone: document.getElementById("empQuestsDone"),
  empXPProgressFill: document.getElementById("empXPProgressFill"),
  empAchievementsList: document.getElementById("empAchievementsList"),

  empXPToday: document.getElementById("empXPToday"),
  empStreakCurrent: document.getElementById("empStreakCurrent"),
  empStreakBest: document.getElementById("empStreakBest"),
  viewHistoryBtn: document.getElementById("viewHistoryBtn"),

  moodButtons: document.querySelectorAll(".sq-mood-btn"),
  empMoodText: document.getElementById("empMoodText"),

  teamQuestsEmployee: document.getElementById("teamQuestsEmployee"),

  questList: document.getElementById("questList"),
  randomQuestBtn: document.getElementById("randomQuestBtn"),
  filterTypeAll: document.getElementById("filterTypeAll"),
  filterTypeDaily: document.getElementById("filterTypeDaily"),
  filterTypeWeekly: document.getElementById("filterTypeWeekly"),
  filterTypeCore: document.getElementById("filterTypeCore"),
  filterCategorySelect: document.getElementById("filterCategorySelect"),

  // History modal
  historyModal: document.getElementById("historyModal"),
  historyCloseBtn: document.getElementById("historyCloseBtn"),
  historyList: document.getElementById("historyList"),

  // Manager view
  employeeTableBody: document.getElementById("employeeTableBody"),
  addEmployeeBtn: document.getElementById("addEmployeeBtn"),

  teamTotalXP: document.getElementById("teamTotalXP"),
  teamAvgLevel: document.getElementById("teamAvgLevel"),
  teamTotalQuests: document.getElementById("teamTotalQuests"),
  teamQuestsToday: document.getElementById("teamQuestsToday"),
  teamXPToday: document.getElementById("teamXPToday"),
  teamMostActiveToday: document.getElementById("teamMostActiveToday"),

  teamQuestsManager: document.getElementById("teamQuestsManager"),

  topPerformersList: document.getElementById("topPerformersList"),
  activityList: document.getElementById("activityList"),

  verificationQueue: document.getElementById("verificationQueue"),

  addQuestBtn: document.getElementById("addQuestBtn"),
  questManagerList: document.getElementById("questManagerList"),

  populateDemoDataBtn: document.getElementById("populateDemoDataBtn"),
  clearDemoDataBtn: document.getElementById("clearDemoDataBtn")
};

/* ---------- Toasts ---------- */

function sqShowToast(title, message) {
  if (!sqDom.toastContainer) return;
  const el = document.createElement("div");
  el.className = "sq-toast";
  el.innerHTML = `<strong>${title}</strong><br /><span>${message}</span>`;
  sqDom.toastContainer.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3500);
}

/* ---------- Login UI ---------- */

function sqRenderLoginEmployeeOptions() {
  if (!sqDom.loginEmployeeSelect) return;
  const employees = sqGetEmployees();
  sqDom.loginEmployeeSelect.innerHTML = "";
  employees.forEach((emp) => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = `${emp.name} – ${emp.role}`;
    sqDom.loginEmployeeSelect.appendChild(opt);
  });
}

function sqRenderLoginRoleUI() {
  const role = sqDom.loginRoleSelect.value;
  if (role === "employee") {
    sqDom.loginEmployeeBlock.classList.remove("sq-hidden");
    if (sqDom.employeePinBlock)
      sqDom.employeePinBlock.classList.remove("sq-hidden");
    sqDom.managerPinBlock.classList.add("sq-hidden");
  } else {
    sqDom.loginEmployeeBlock.classList.add("sq-hidden");
    if (sqDom.employeePinBlock)
      sqDom.employeePinBlock.classList.add("sq-hidden");
    sqDom.managerPinBlock.classList.remove("sq-hidden");
    sqDom.managerPinInput.focus();
  }
}

/* ---------- Employee render ---------- */

function sqRenderEmployeeProfile(empId, opts = {}) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) return;

  const achievements = sqGetAchievements(emp);
  const level = sqGetLevel(emp.xp || 0);

  if (sqDom.empName) sqDom.empName.textContent = emp.name;
  if (sqDom.empRole) sqDom.empRole.textContent = emp.role || "Team Member";
  if (sqDom.empLevel) sqDom.empLevel.textContent = String(level);
  if (sqDom.empXP) sqDom.empXP.textContent = `${emp.xp || 0} XP`;

  const questCount = sqGetQuestCountsForEmployee(emp);
  if (sqDom.empQuestsDone)
    sqDom.empQuestsDone.textContent = `${questCount} quests done`;

  // Simple "title" based on level
  let title = "Rookie";
  if (level >= 4 && level <= 6) title = "Regular";
  else if (level >= 7 && level <= 9) title = "Pro";
  else if (level >= 10) title = "Legend";
  if (sqDom.empTitle) sqDom.empTitle.textContent = title;

  // Progress to next level (100 XP chunks)
  const xpInLevel = (emp.xp || 0) % 100;
  const pct = Math.max(0, Math.min(100, (xpInLevel / 100) * 100));
  if (sqDom.empXPProgressFill) {
    sqDom.empXPProgressFill.style.width = `${pct}%`;
  }

  if (sqDom.empAchievementsList) {
    sqDom.empAchievementsList.innerHTML = "";
    if (!achievements.length) {
      const li = document.createElement("li");
      li.className = "sq-pill sq-pill-soft";
      li.textContent = "No achievements yet";
      sqDom.empAchievementsList.appendChild(li);
    } else {
      achievements.forEach((a) => {
        const li = document.createElement("li");
        li.className = "sq-pill sq-pill-soft";
        li.textContent = a.name;
        sqDom.empAchievementsList.appendChild(li);
      });
    }
  }

  // Level up feedback
  if (opts.levelUp) {
    sqShowToast("Level up!", `${emp.name} reached level ${level}!`);
  }

  // Streak + mood
  sqRenderEmployeeTodayAndStreak(empId);
  sqRenderEmployeeMood(empId);
}

function sqRenderEmployeeTodayAndStreak(empId) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) return;
  const info = sqGetStreakInfo(emp);
  if (sqDom.empXPToday)
    sqDom.empXPToday.textContent = String(info.xpToday || 0);
  if (sqDom.empStreakCurrent)
    sqDom.empStreakCurrent.textContent = String(info.current || 0);
  if (sqDom.empStreakBest)
    sqDom.empStreakBest.textContent = String(info.best || 0);
}

function sqRenderEmployeeMood(empId) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) return;
  const mood = sqGetMoodForToday(emp);
  if (!sqDom.empMoodText) return;
  if (!mood) {
    sqDom.empMoodText.textContent = "No mood logged yet for today.";
  } else {
    sqDom.empMoodText.textContent = `Today's mood: ${mood}`;
  }

  if (sqDom.moodButtons && sqDom.moodButtons.length) {
    sqDom.moodButtons.forEach((btn) => {
      btn.classList.toggle(
        "sq-mood-selected",
        mood && btn.dataset.mood === mood
      );
    });
  }
}

/* ---------- Quest list (employee) ---------- */

function sqDifficultyLabel(xp) {
  if (xp >= 80) return "Hard";
  if (xp >= 40) return "Normal";
  return "Easy";
}

function sqRenderQuestCategoryFilterOptions() {
  if (!sqDom.filterCategorySelect) return;
  const quests = sqGetQuests();
  const categories = Array.from(
    new Set(quests.map((q) => q.category || "General"))
  );
  sqDom.filterCategorySelect.innerHTML =
    '<option value="all">All categories</option>';
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sqDom.filterCategorySelect.appendChild(opt);
  });
}

function sqRenderQuestList(empId, typeFilter, categoryFilter) {
  const container = sqDom.questList;
  if (!container) return;
  const emp = sqGetEmployeeById(empId);
  if (!emp) {
    container.innerHTML =
      '<p class="sq-muted sq-caption">No employee selected.</p>';
    return;
  }

  const quests = sqGetQuests();
  const hist = emp.questHistory || [];
  const todayKey = sqDateKeyFromDate(new Date());

  let filtered = quests.slice();
  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter((q) => q.type === typeFilter);
  }
  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter((q) => q.category === categoryFilter);
  }

  if (!filtered.length) {
    container.innerHTML =
      '<p class="sq-muted sq-caption">No quests match this filter.</p>';
    return;
  }

  container.innerHTML = "";

  filtered.forEach((quest) => {
    const card = document.createElement("div");
    card.className = "sq-quest-card";

    const header = document.createElement("div");
    header.className = "sq-quest-header";

    const nameEl = document.createElement("div");
    nameEl.className = "sq-quest-name";
    nameEl.textContent = quest.name;

    const tags = document.createElement("div");
    tags.className = "sq-quest-tags";

    const xpTag = document.createElement("span");
    xpTag.className = "sq-tag sq-tag-accent";
    xpTag.textContent = `+${quest.xp} XP`;

    const typeTag = document.createElement("span");
    typeTag.className = "sq-tag";
    typeTag.textContent = quest.type;

    const catTag = document.createElement("span");
    catTag.className = "sq-tag";
    catTag.textContent = quest.category || "General";

    const diffTag = document.createElement("span");
    diffTag.className = "sq-tag";
    diffTag.textContent = sqDifficultyLabel(quest.xp || 0);

    tags.appendChild(xpTag);
    tags.appendChild(typeTag);
    tags.appendChild(catTag);
    tags.appendChild(diffTag);

    header.appendChild(nameEl);
    header.appendChild(tags);

    const meta = document.createElement("div");
    meta.className = "sq-quest-meta";

    const totalCount = hist.filter((h) => h.questId === quest.id).length;
    const todayCount = hist.filter((h) => {
      if (h.questId !== quest.id) return false;
      const d = new Date(h.completedAt);
      return !isNaN(d.getTime()) && sqDateKeyFromDate(d) === todayKey;
    }).length;

    meta.textContent = `Completed ${totalCount} time${
      totalCount === 1 ? "" : "s"
    } · ${todayCount} today`;

    const footer = document.createElement("div");
    footer.className = "sq-quest-footer";

    const locked = false; // placeholder if we later add lock conditions
    const requiresVerification = !!quest.requiresVerification;
    const hasPending =
      typeof sqHasPendingApproval === "function"
        ? sqHasPendingApproval(emp.id, quest.id)
        : false;

    const btn = document.createElement("button");
    btn.className = "sq-btn sq-btn-primary sq-btn-sm";

    if (locked) {
      btn.textContent = "Quest locked";
      btn.disabled = true;
    } else if (requiresVerification && hasPending) {
      btn.textContent = "Waiting approval";
      btn.disabled = true;
    } else if (requiresVerification) {
      btn.textContent = "Request approval";
      btn.disabled = false;
    } else {
      btn.textContent = "Complete quest";
      btn.disabled = false;
    }

    btn.addEventListener("click", () => {
      if (locked) return;
      if (!requiresVerification) {
        if (typeof sqHandleQuestCompleted === "function") {
          sqHandleQuestCompleted(emp.id, quest.id, false);
        }
      } else {
        if (hasPending) return;
        if (typeof sqAddPendingApproval === "function") {
          sqAddPendingApproval(emp.id, quest.id);
          sqShowToast(
            "Approval requested",
            "This quest is now in the manager verification queue."
          );
          // Re-render list so button updates to 'Waiting approval'
          sqRenderQuestList(
            emp.id,
            window.sqActiveQuestTypeFilter || "all",
            window.sqActiveQuestCategoryFilter || "all"
          );
          if (typeof sqRenderVerificationQueue === "function") {
            sqRenderVerificationQueue();
          }
        } else {
          sqShowToast(
            "Not available",
            "Pending approvals are not configured."
          );
        }
      }
    });

    footer.appendChild(btn);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

/* ---------- Quest history modal ---------- */

function sqOpenHistoryModal(empId) {
  const emp = sqGetEmployeeById(empId);
  if (!emp || !sqDom.historyModal || !sqDom.historyList) return;

  sqDom.historyList.innerHTML = "";
  const history = (emp.questHistory || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    );

  if (!history.length) {
    const li = document.createElement("li");
    li.className = "sq-history-item";
    li.textContent = "No quests completed yet.";
    sqDom.historyList.appendChild(li);
  } else {
    history.forEach((h) => {
      const quest = sqGetQuestById(h.questId);
      const name = quest ? quest.name : "Unknown quest";
      const xp = h.xpEarned || (quest ? quest.xp || 0 : 0);
      const d = new Date(h.completedAt);
      const dateStr = isNaN(d.getTime())
        ? h.completedAt
        : d.toLocaleString();
      const status = h.verified ? "Manager verified" : "Self-completed";

      const li = document.createElement("li");
      li.className = "sq-history-item";
      li.innerHTML = `<strong>${name}</strong> · +${xp} XP<br /><span class="sq-muted">${dateStr} · ${status}</span>`;
      sqDom.historyList.appendChild(li);
    });
  }

  sqDom.historyModal.classList.remove("sq-hidden");
}

/* ---------- Manager: employees & summary ---------- */

function sqRenderEmployeeTable() {
  const body = sqDom.employeeTableBody;
  if (!body) return;
  const employees = sqGetEmployees();
  body.innerHTML = "";
  employees.forEach((emp) => {
    const tr = document.createElement("tr");
    const level = sqGetLevel(emp.xp || 0);
    const quests = sqGetQuestCountsForEmployee(emp);

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.role || "–"}</td>
      <td>${level}</td>
      <td>${emp.xp || 0}</td>
      <td>${quests}</td>
    `;
    body.appendChild(tr);
  });
}

function sqRenderTopPerformers(employees) {
  const list = sqDom.topPerformersList;
  if (!list) return;
  const sorted = employees.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const top = sorted.slice(0, 5);
  list.innerHTML = "";
  if (!top.length) {
    const li = document.createElement("li");
    li.className = "sq-muted sq-caption";
    li.textContent = "No employees yet.";
    list.appendChild(li);
    return;
  }
  top.forEach((emp, idx) => {
    const li = document.createElement("li");
    const level = sqGetLevel(emp.xp || 0);
    li.innerHTML = `<span>${idx + 1}. ${emp.name}</span><span>Lv ${level} · ${
      emp.xp || 0
    } XP</span>`;
    list.appendChild(li);
  });
}

function sqRenderActivityList() {
  const listEl = sqDom.activityList;
  if (!listEl) return;

  const employees = sqGetEmployees();
  const items = [];

  employees.forEach((emp) => {
    const history = emp.questHistory || [];
    history.forEach((h) => {
      const quest = sqGetQuestById(h.questId);
      const xp = h.xpEarned || (quest ? quest.xp || 0 : 0);
      const date = new Date(h.completedAt);
      const dateStr = isNaN(date.getTime())
        ? h.completedAt
        : date.toLocaleString();
      const verified = !!h.verified;
      items.push({
        empName: emp.name,
        questName: quest ? quest.name : "Unknown quest",
        xp,
        dateStr,
        verified,
        completedAtRaw: h.completedAt
      });
    });
  });

  if (!items.length) {
    listEl.innerHTML =
      '<p class="sq-muted sq-caption">No quest activity yet.</p>';
    return;
  }

  items.sort(
    (a, b) =>
      new Date(b.completedAtRaw).getTime() -
      new Date(a.completedAtRaw).getTime()
  );

  const latest = items.slice(0, 10);
  listEl.innerHTML = "";
  latest.forEach((item) => {
    const div = document.createElement("div");
    div.className = "sq-history-item";
    const statusText = item.verified ? "Manager verified" : "Self-completed";
    div.innerHTML = `<strong>${item.empName} – ${
      item.questName
    }</strong> · +${
      item.xp
    } XP<br /><span class="sq-muted">${item.dateStr} · ${statusText}</span>`;
    listEl.appendChild(div);
  });
}

function sqComputeTeamQuestProgress(tq) {
  const employees = sqGetEmployees();
  let current = 0;
  const target = tq.target || 0;

  const now = new Date();
  const todayKey = sqDateKeyFromDate(now);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  employees.forEach((emp) => {
    (emp.questHistory || []).forEach((h) => {
      const d = new Date(h.completedAt);
      if (isNaN(d.getTime())) return;

      if (tq.metric === "quests_7d") {
        if (d >= sevenDaysAgo && d <= now) {
          current += 1;
        }
      } else if (tq.metric === "quests_today_cleanliness") {
        if (sqDateKeyFromDate(d) !== todayKey) return;
        const q = sqGetQuestById(h.questId);
        if (!q) return;
        if ((q.category || "").toLowerCase() === "cleanliness") {
          current += 1;
        }
      }
    });
  });

  const percent =
    target > 0
      ? Math.max(0, Math.min(100, Math.round((current / target) * 100)))
      : 0;

  return { current, target, percent };
}

function sqRenderTeamQuests() {
  const teamQuests =
    typeof sqGetTeamQuests === "function" ? sqGetTeamQuests() : [];
  const tqEmp = sqDom.teamQuestsEmployee;
  const tqMgr = sqDom.teamQuestsManager;

  const renderInto = (container, compactLabel) => {
    if (!container) return;
    container.innerHTML = "";

    if (!teamQuests.length) {
      const p = document.createElement("p");
      p.className = "sq-muted sq-caption";
      p.textContent = "No active team quests.";
      container.appendChild(p);
      return;
    }

    teamQuests.forEach((tq) => {
      const { current, target, percent } = sqComputeTeamQuestProgress(tq);
      const item = document.createElement("div");
      item.className = "sq-team-quest-item";

      const title = document.createElement("div");
      title.className = "sq-team-quest-title";
      title.textContent = tq.name;

      const desc = document.createElement("p");
      desc.className = "sq-team-quest-desc";
      desc.textContent = tq.description || "";

      const progWrap = document.createElement("div");
      progWrap.className = "sq-progress-bar";
      const progFill = document.createElement("div");
      progFill.className = "sq-progress-fill";
      progFill.style.width = `${percent}%`;
      progWrap.appendChild(progFill);

      const meta = document.createElement("div");
      meta.className = "sq-team-quest-meta";
      meta.textContent = `${current} / ${target} ${
        compactLabel || "tasks completed"
      }`;

      item.appendChild(title);
      item.appendChild(desc);
      item.appendChild(progWrap);
      item.appendChild(meta);

      container.appendChild(item);
    });
  };

  renderInto(tqEmp, "steps done");
  renderInto(tqMgr, "toward goal");
}

function sqRenderTeamSummary() {
  const stats = sqGetTeamStats();
  const employees = sqGetEmployees();

  if (sqDom.teamTotalXP)
    sqDom.teamTotalXP.textContent = String(stats.totalXP || 0);
  if (sqDom.teamAvgLevel)
    sqDom.teamAvgLevel.textContent = (stats.avgLevel || 0).toFixed(1);
  if (sqDom.teamTotalQuests)
    sqDom.teamTotalQuests.textContent = String(stats.totalQuests || 0);

  if (sqDom.teamQuestsToday)
    sqDom.teamQuestsToday.textContent = String(stats.questsToday || 0);
  if (sqDom.teamXPToday)
    sqDom.teamXPToday.textContent = String(stats.xpToday || 0);
  if (sqDom.teamMostActiveToday) {
    sqDom.teamMostActiveToday.textContent = stats.mostActive
      ? stats.mostActive.name
      : "–";
  }

  sqRenderTopPerformers(employees);
  sqRenderActivityList();
  sqRenderTeamQuests();
}

/* ---------- Verification Queue ---------- */

function sqRenderVerificationQueue() {
  const container = sqDom.verificationQueue;
  if (!container) return;

  const pending =
    typeof sqGetPendingApprovals === "function"
      ? sqGetPendingApprovals()
      : [];

  container.innerHTML = "";

  if (!pending.length) {
    const p = document.createElement("p");
    p.className = "sq-muted sq-caption";
    p.textContent = "No quests waiting for approval.";
    container.appendChild(p);
    return;
  }

  pending
    .slice()
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() -
        new Date(a.requestedAt).getTime()
    )
    .forEach((p) => {
      const emp = sqGetEmployeeById(p.empId);
      const quest = sqGetQuestById(p.questId);
      const empName = emp ? emp.name : "Unknown employee";
      const questName = quest ? quest.name : "Unknown quest";
      const date = new Date(p.requestedAt);
      const dateStr = isNaN(date.getTime())
        ? p.requestedAt
        : date.toLocaleString();

      const item = document.createElement("div");
      item.className = "sq-quest-manager-item";

      const main = document.createElement("div");
      main.className = "sq-quest-manager-main";

      const title = document.createElement("div");
      title.className = "sq-quest-manager-title";
      title.textContent = `${empName} – ${questName}`;

      const meta = document.createElement("div");
      meta.className = "sq-quest-manager-meta";
      meta.textContent = `${dateStr}`;

      main.appendChild(title);
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "sq-quest-manager-actions";

      const approveBtn = document.createElement("button");
      approveBtn.className = "sq-btn sq-btn-primary sq-btn-xs";
      approveBtn.textContent = "Approve";
      approveBtn.addEventListener("click", () => {
        sqHandleQuestCompleted(p.empId, p.questId, true);
        sqRemovePendingApproval(p.id);
        sqRenderVerificationQueue();

        const activeEmpId = window.sqCurrentEmployeeId;
        if (activeEmpId) {
          sqRenderQuestList(
            activeEmpId,
            window.sqActiveQuestTypeFilter || "all",
            window.sqActiveQuestCategoryFilter || "all"
          );
        }
      });

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "sq-btn sq-btn-ghost sq-btn-xs";
      rejectBtn.textContent = "Reject";
      rejectBtn.addEventListener("click", () => {
        sqRemovePendingApproval(p.id);
        sqRenderVerificationQueue();
        sqShowToast(
          "Quest rejected",
          "This quest request was removed from the queue."
        );
      });

      actions.appendChild(approveBtn);
      actions.appendChild(rejectBtn);

      item.appendChild(main);
      item.appendChild(actions);
      container.appendChild(item);
    });
}

/* ---------- Quest Manager (manager) ---------- */

function sqRenderQuestManagerList() {
  const container = sqDom.questManagerList;
  if (!container) return;
  const quests = sqGetQuests();
  container.innerHTML = "";
  if (!quests.length) {
    container.innerHTML =
      '<p class="sq-muted sq-caption">No quests yet. Add one to get started.</p>';
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
    const diff = sqDifficultyLabel(q.xp || 0);
    const verifyLabel = q.requiresVerification ? " · requires approval" : "";
    meta.textContent = `${q.category || "General"} · ${
      q.type
    } · +${q.xp} XP · ${diff}${verifyLabel}`;

    main.appendChild(title);
    main.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "sq-quest-manager-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "sq-btn sq-btn-secondary sq-btn-xs sq-quest-edit";
    editBtn.textContent = "Edit";
    editBtn.dataset.questId = q.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "sq-btn sq-btn-ghost sq-btn-xs sq-quest-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.questId = q.id;

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(main);
    item.appendChild(actions);
    container.appendChild(item);
  });
}
