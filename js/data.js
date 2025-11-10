// data.js – core state & logic

const SQ_STORAGE_KEY = "staffquest_ultra_state";

let sqState = sqLoadState();

/* ---------- Load & save ---------- */

function sqLoadState() {
  try {
    const raw = localStorage.getItem(SQ_STORAGE_KEY);
    if (!raw) {
      const state = {
        employees: sqDefaultEmployees(),
        quests: sqDefaultQuests(),
        teamQuests: sqDefaultTeamQuests(),
        pendingApprovals: []
      };
      sqSaveState(state);
      return state;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.employees) parsed.employees = sqDefaultEmployees();
    if (!parsed.quests) parsed.quests = sqDefaultQuests();
    if (!parsed.teamQuests) parsed.teamQuests = sqDefaultTeamQuests();
    if (!parsed.pendingApprovals) parsed.pendingApprovals = [];
    return parsed;
  } catch (e) {
    console.error("Failed to load state, resetting.", e);
    const state = {
      employees: sqDefaultEmployees(),
      quests: sqDefaultQuests(),
      teamQuests: sqDefaultTeamQuests(),
      pendingApprovals: []
    };
    localStorage.removeItem(SQ_STORAGE_KEY);
    sqSaveState(state);
    return state;
  }
}

function sqSaveState(state) {
  sqState = state;
  localStorage.setItem(SQ_STORAGE_KEY, JSON.stringify(state));
}

/* ---------- Defaults ---------- */

function sqDefaultEmployees() {
  return [
    {
      id: "emp_alex",
      name: "Alex Rivera",
      role: "Server",
      xp: 220,
      questHistory: [],
      moods: [],
      pin: "1111"
    },
    {
      id: "emp_jordan",
      name: "Jordan Lee",
      role: "Host",
      xp: 90,
      questHistory: [],
      moods: [],
      pin: "2222"
    },
    {
      id: "emp_taylor",
      name: "Taylor Kim",
      role: "Line Cook",
      xp: 310,
      questHistory: [],
      moods: [],
      pin: "3333"
    }
  ];
}

function sqDefaultQuests() {
  return [
    {
      id: "q_greet_tables",
      name: "Perfect table greeting",
      category: "Service",
      type: "daily",
      xp: 20,
      repeatable: true,
      requiresVerification: false,
      description: "Greet every new table within 60 seconds with full script."
    },
    {
      id: "q_clean_station",
      name: "Reset your station",
      category: "Cleanliness",
      type: "daily",
      xp: 25,
      repeatable: true,
      requiresVerification: false,
      description: "End your shift with a spotless, fully stocked station."
    },
    {
      id: "q_zero_order_errors",
      name: "Zero order errors",
      category: "Service",
      type: "core",
      xp: 80,
      repeatable: true,
      requiresVerification: true,
      description: "Complete a shift without any order entry mistakes."
    },
    {
      id: "q_rush_teamwork",
      name: "Crush the dinner rush",
      category: "Teamwork",
      type: "weekly",
      xp: 100,
      repeatable: true,
      requiresVerification: true,
      description:
        "Support teammates during peak rush with proactive running and expo help."
    },
    {
      id: "q_side_work",
      name: "Sidework superstar",
      category: "Cleanliness",
      type: "weekly",
      xp: 40,
      repeatable: true,
      requiresVerification: false,
      description: "Complete all assigned sidework without reminders."
    },
    {
      id: "q_menu_quiz",
      name: "Menu master",
      category: "Knowledge",
      type: "core",
      xp: 60,
      repeatable: false,
      requiresVerification: true,
      description: "Pass a menu quiz with at least 90%."
    }
  ];
}

function sqDefaultTeamQuests() {
  return [
    {
      id: "tq_crush_the_week",
      name: "Crush the week",
      description: "As a team, complete 25 quests in the last 7 days.",
      metric: "quests_7d",
      target: 25
    },
    {
      id: "tq_clean_sweep_today",
      name: "Clean sweep today",
      description: "As a team, complete 8 Cleanliness quests today.",
      metric: "quests_today_cleanliness",
      target: 8
    }
  ];
}

/* ---------- Employee helpers ---------- */

function sqGetEmployees() {
  return sqState.employees || [];
}

function sqSetEmployees(list) {
  sqState.employees = list;
  sqSaveState(sqState);
}

function sqGetEmployeeById(id) {
  return sqGetEmployees().find((e) => e.id === id) || null;
}

function sqGeneratePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function sqAddEmployee(name, role) {
  const id = "emp_" + Date.now().toString(36);
  const pin = sqGeneratePin();
  const emp = {
    id,
    name: name || "New Employee",
    role: role || "",
    xp: 0,
    questHistory: [],
    moods: [],
    pin
  };
  const list = sqGetEmployees().slice();
  list.push(emp);
  sqSetEmployees(list);
  return emp;
}

/* ---------- Quest helpers ---------- */

function sqGetQuests() {
  return sqState.quests || [];
}

function sqSetQuests(list) {
  sqState.quests = list;
  sqSaveState(sqState);
}

function sqGetQuestById(id) {
  return sqGetQuests().find((q) => q.id === id) || null;
}

function sqAddQuest(partial) {
  const id = "q_" + Date.now().toString(36);
  const quest = {
    id,
    name: partial.name || "New Quest",
    category: partial.category || "General",
    type: partial.type || "daily",
    xp: partial.xp || 20,
    repeatable: partial.repeatable !== false,
    requiresVerification: !!partial.requiresVerification,
    description: partial.description || ""
  };
  const list = sqGetQuests().slice();
  list.push(quest);
  sqSetQuests(list);
  return quest;
}

function sqUpdateQuest(id, changes) {
  const list = sqGetQuests().map((q) =>
    q.id === id
      ? {
          ...q,
          ...changes,
          xp: Number(changes.xp ?? q.xp) || 0
        }
      : q
  );
  sqSetQuests(list);
}

function sqDeleteQuest(id) {
  const list = sqGetQuests().filter((q) => q.id !== id);
  sqSetQuests(list);
}

/* ---------- Team quests & approvals ---------- */

function sqGetTeamQuests() {
  return sqState.teamQuests || [];
}

function sqEnsurePendingApprovalsArray() {
  if (!sqState.pendingApprovals) sqState.pendingApprovals = [];
}

function sqGetPendingApprovals() {
  sqEnsurePendingApprovalsArray();
  return sqState.pendingApprovals;
}

function sqAddPendingApproval(empId, questId) {
  sqEnsurePendingApprovalsArray();
  const id = "pa_" + Date.now().toString(36);
  const entry = {
    id,
    empId,
    questId,
    requestedAt: new Date().toISOString()
  };
  sqState.pendingApprovals.push(entry);
  sqSaveState(sqState);
  return entry;
}

function sqRemovePendingApproval(id) {
  sqEnsurePendingApprovalsArray();
  sqState.pendingApprovals = sqState.pendingApprovals.filter(
    (p) => p.id !== id
  );
  sqSaveState(sqState);
}

function sqHasPendingApproval(empId, questId) {
  return sqGetPendingApprovals().some(
    (p) => p.empId === empId && p.questId === questId
  );
}

/* ---------- Date / streak / stats helpers ---------- */

function sqDateKeyFromDate(d) {
  return d.toISOString().slice(0, 10);
}

function sqGetLevel(xp) {
  xp = xp || 0;
  return Math.floor(xp / 100) + 1;
}

function sqGetQuestCountsForEmployee(emp) {
  return (emp.questHistory || []).length;
}

function sqGetStreakInfo(emp) {
  const history = emp.questHistory || [];
  if (!history.length) {
    return { current: 0, best: 0, xpToday: 0 };
  }

  const map = new Map(); // dateKey -> xp sum
  history.forEach((h) => {
    const d = new Date(h.completedAt);
    if (isNaN(d.getTime())) return;
    const key = sqDateKeyFromDate(d);
    const prev = map.get(key) || 0;
    map.set(key, prev + (h.xpEarned || 0));
  });

  const today = new Date();
  const todayKey = sqDateKeyFromDate(today);
  const xpToday = map.get(todayKey) || 0;

  // current streak: back from today
  let current = 0;
  let cursor = new Date(today);
  // handle case where no quests today: streak = 0
  while (true) {
    const key = sqDateKeyFromDate(cursor);
    if (map.has(key)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // best streak: longest consecutive chain
  const keys = Array.from(map.keys()).sort();
  let best = 0;
  let streak = 0;
  let prevDate = null;
  keys.forEach((key) => {
    const [y, m, d] = key.split("-");
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    if (prevDate) {
      const diff =
        (dateObj.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    if (streak > best) best = streak;
    prevDate = dateObj;
  });

  return { current, best, xpToday };
}

function sqGetAchievements(emp) {
  const xp = emp.xp || 0;
  const quests = sqGetQuestCountsForEmployee(emp);
  const history = emp.questHistory || [];
  const achievements = [];

  const verifiedCount = history.filter((h) => h.verified).length;
  const hardVerifiedCount = history.filter((h) => {
    if (!h.verified) return false;
    const q = sqGetQuestById(h.questId);
    if (!q) return false;
    const qxp = q.xp || 0;
    return qxp >= 80;
  }).length;

  if (quests >= 1) {
    achievements.push({
      id: "first_quest",
      name: "First Shift Hero",
      description: "Completed your first quest."
    });
  }
  if (quests >= 10) {
    achievements.push({
      id: "ten_quests",
      name: "Consistency Champ",
      description: "Completed 10 quests."
    });
  }
  if (xp >= 300) {
    achievements.push({
      id: "xp_300",
      name: "On a Roll",
      description: "Earned 300+ XP."
    });
  }
  if (xp >= 600) {
    achievements.push({
      id: "xp_600",
      name: "StaffQuest Veteran",
      description: "Earned 600+ XP overall."
    });
  }

  if (verifiedCount >= 5) {
    achievements.push({
      id: "verified_5",
      name: "Trusted Teammate",
      description: "Completed 5 manager-verified quests."
    });
  }

  if (verifiedCount >= 15) {
    achievements.push({
      id: "verified_15",
      name: "Manager’s Go-To",
      description: "Completed 15 manager-verified quests."
    });
  }

  if (hardVerifiedCount >= 5) {
    achievements.push({
      id: "verified_hard_5",
      name: "Clutch Performer",
      description: "Completed 5 hard quests with manager approval."
    });
  }

  return achievements;
}

function sqGetTeamStats() {
  const employees = sqGetEmployees();
  let totalXP = 0;
  let totalLevel = 0;
  let totalQuests = 0;
  let questsToday = 0;
  let xpToday = 0;
  let mostActive = null;
  let mostActiveCount = 0;

  const todayKey = sqDateKeyFromDate(new Date());

  employees.forEach((emp) => {
    const xp = emp.xp || 0;
    totalXP += xp;
    totalLevel += sqGetLevel(xp);
    const history = emp.questHistory || [];
    totalQuests += history.length;

    let empQuestsToday = 0;
    let empXPToday = 0;

    history.forEach((h) => {
      const d = new Date(h.completedAt);
      if (isNaN(d.getTime())) return;
      if (sqDateKeyFromDate(d) === todayKey) {
        empQuestsToday++;
        empXPToday += h.xpEarned || 0;
      }
    });

    questsToday += empQuestsToday;
    xpToday += empXPToday;

    if (empQuestsToday > mostActiveCount) {
      mostActiveCount = empQuestsToday;
      mostActive = emp;
    }
  });

  const avgLevel = employees.length ? totalLevel / employees.length : 0;
  return {
    totalXP,
    totalQuests,
    avgLevel,
    questsToday,
    xpToday,
    mostActive
  };
}

/* ---------- Mood helpers ---------- */

function sqSetMood(empId, emoji) {
  const emp = sqGetEmployeeById(empId);
  if (!emp) return null;
  const todayKey = sqDateKeyFromDate(new Date());
  const moods = emp.moods || [];
  const others = moods.filter((m) => m.dateKey !== todayKey);
  const updatedMoods = [...others, { dateKey: todayKey, mood: emoji }];
  const updatedEmp = { ...emp, moods: updatedMoods };
  const list = sqGetEmployees().map((e) =>
    e.id === empId ? updatedEmp : e
  );
  sqSetEmployees(list);
  return updatedEmp;
}

function sqGetMoodForToday(emp) {
  const moods = emp.moods || [];
  const todayKey = sqDateKeyFromDate(new Date());
  const entry = moods.find((m) => m.dateKey === todayKey);
  return entry ? entry.mood : null;
}

/* ---------- Quest completion ---------- */

function sqCompleteQuest(empId, questId, verified = false) {
  const emp = sqGetEmployeeById(empId);
  const quest = sqGetQuestById(questId);
  if (!emp || !quest) return null;

  const xpGain = quest.xp || 0;
  const beforeXP = emp.xp || 0;
  const beforeLevel = sqGetLevel(beforeXP);
  const afterXP = beforeXP + xpGain;
  const afterLevel = sqGetLevel(afterXP);

  const updatedEmp = {
    ...emp,
    xp: afterXP,
    questHistory: [
      ...(emp.questHistory || []),
      {
        questId,
        completedAt: new Date().toISOString(),
        xpEarned: xpGain,
        verified: !!verified
      }
    ]
  };

  const list = sqGetEmployees().map((e) =>
    e.id === empId ? updatedEmp : e
  );
  sqSetEmployees(list);

  return {
    employee: updatedEmp,
    quest,
    xpGained: xpGain,
    beforeLevel,
    afterLevel,
    levelUp: afterLevel > beforeLevel
  };
}

/* ---------- Clear & demo data ---------- */

function sqClearAllData() {
  const state = {
    employees: sqDefaultEmployees(),
    quests: sqDefaultQuests(),
    teamQuests: sqDefaultTeamQuests(),
    pendingApprovals: []
  };
  sqSaveState(state);
}

function sqPopulateDemoData() {
  const employees = sqGetEmployees();
  const quests = sqGetQuests();
  if (!employees.length || !quests.length) return;

  const now = new Date();
  const maxPerDay = 4;
  const daysBack = 7;

  const updatedEmployees = employees.map((emp) => {
    const history = [];
    let xpTotal = 0;

    for (let offset = 0; offset < daysBack; offset++) {
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() - offset);

      const numCompletions = Math.floor(Math.random() * maxPerDay); // 0–3
      for (let i = 0; i < numCompletions; i++) {
        const quest = quests[Math.floor(Math.random() * quests.length)];
        if (!quest) continue;

        const when = new Date(baseDate);
        when.setHours(9 + Math.floor(Math.random() * 10));
        when.setMinutes(Math.floor(Math.random() * 60));
        when.setSeconds(Math.floor(Math.random() * 60));

        const xpGain = quest.xp || 0;
        xpTotal += xpGain;

        history.push({
          questId: quest.id,
          completedAt: when.toISOString(),
          xpEarned: xpGain,
          verified: !!quest.requiresVerification && Math.random() < 0.6
        });
      }
    }

    history.sort(
      (a, b) =>
        new Date(a.completedAt).getTime() -
        new Date(b.completedAt).getTime()
    );

    return {
      ...emp,
      xp: xpTotal,
      questHistory: history
    };
  });

  sqState.employees = updatedEmployees;
  sqState.pendingApprovals = [];
  sqSaveState(sqState);
}
