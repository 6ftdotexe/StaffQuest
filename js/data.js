// StaffQuest data + gamification helpers

const SQ_STATE_KEY = "sq_state_v1";

function sqDefaultEmployees() {
  return [
    {
      id: "emp_alex",
      name: "Alex Rivera",
      role: "Server",
      xp: 220,
      questHistory: []
    },
    {
      id: "emp_jordan",
      name: "Jordan Lee",
      role: "Host",
      xp: 90,
      questHistory: []
    },
    {
      id: "emp_taylor",
      name: "Taylor Kim",
      role: "Line Cook",
      xp: 310,
      questHistory: []
    }
  ];
}

function sqDefaultQuests() {
  return [
    {
      id: "q_greet_10_tables",
      name: "Greet 10 tables with a smile",
      category: "Service",
      type: "daily",
      xp: 40,
      repeatable: true,
      description: "Warmly greet 10 tables using the house greeting script."
    },
    {
      id: "q_zero_order_errors",
      name: "Zero order errors",
      category: "Service",
      type: "core",
      xp: 80,
      repeatable: true,
      description: "Complete a shift without any order entry mistakes."
    },
    {
      id: "q_sidework_reset",
      name: "Complete sidework reset",
      category: "Cleanliness",
      type: "daily",
      xp: 30,
      repeatable: true,
      description: "Reset your section: tables, condiments, and menus fully stocked."
    },
    {
      id: "q_rush_teamwork",
      name: "Crush the dinner rush",
      category: "Teamwork",
      type: "weekly",
      xp: 100,
      repeatable: true,
      description: "Support teammates during peak rush with proactive running and expo help."
    },
    {
      id: "q_kitchen_prep",
      name: "Prep station master",
      category: "Kitchen",
      type: "core",
      xp: 60,
      repeatable: true,
      description: "Keep your line station stocked and clean for the whole shift."
    }
  ];
}

function sqLoadState() {
  try {
    const raw = localStorage.getItem(SQ_STATE_KEY);
    if (!raw) {
      const state = {
        employees: sqDefaultEmployees(),
        quests: sqDefaultQuests()
      };
      sqSaveState(state);
      return state;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.employees) parsed.employees = [];
    if (!parsed.quests) parsed.quests = [];
    return parsed;
  } catch (e) {
    const fallback = {
      employees: sqDefaultEmployees(),
      quests: sqDefaultQuests()
    };
    sqSaveState(fallback);
    return fallback;
  }
}

function sqSaveState(state) {
  localStorage.setItem(SQ_STATE_KEY, JSON.stringify(state));
}

let sqState = sqLoadState();

// ---------- Employee helpers ----------

function sqGetEmployees() {
  return sqState.employees || [];
}

function sqGetEmployeeById(id) {
  return sqGetEmployees().find((e) => e.id === id) || null;
}

function sqSetEmployees(list) {
  sqState.employees = list;
  sqSaveState(sqState);
}

function sqAddEmployee(name, role) {
  const id = "emp_" + Date.now().toString(36);
  const emp = { id, name: name || "New Employee", role: role || "", xp: 0, questHistory: [] };
  const list = sqGetEmployees().slice();
  list.push(emp);
  sqSetEmployees(list);
  return emp;
}

function sqResetEmployee(empId) {
  const list = sqGetEmployees().map((e) => {
    if (e.id !== empId) return e;
    return { ...e, xp: 0, questHistory: [] };
  });
  sqSetEmployees(list);
}

// ---------- Quest helpers ----------

function sqGetQuests() {
  return sqState.quests || [];
}

function sqGetQuestById(id) {
  return sqGetQuests().find((q) => q.id === id) || null;
}

function sqUpsertQuest(qData) {
  const quests = sqGetQuests().slice();
  if (qData.id) {
    const idx = quests.findIndex((q) => q.id === qData.id);
    if (idx >= 0) {
      quests[idx] = { ...quests[idx], ...qData };
    } else {
      quests.push(qData);
    }
  } else {
    const id = "q_" + Date.now().toString(36);
    quests.push({ ...qData, id });
  }
  sqState.quests = quests;
  sqSaveState(sqState);
}

function sqDeleteQuest(id) {
  sqState.quests = sqGetQuests().filter((q) => q.id !== id);
  sqSaveState(sqState);
}

// ---------- Levels & achievements ----------

function sqGetLevel(xp) {
  const perLevel = 100;
  return Math.floor((xp || 0) / perLevel) + 1;
}

function sqGetLevelProgress(xp) {
  const perLevel = 100;
  const level = sqGetLevel(xp);
  const levelStart = (level - 1) * perLevel;
  const current = Math.max(0, (xp || 0) - levelStart);
  const needed = perLevel;
  const percent = Math.max(0, Math.min(100, Math.round((current / needed) * 100)));
  return { level, current, needed, percent };
}

function sqGetQuestCountsForEmployee(emp) {
  return (emp.questHistory || []).length;
}

function sqGetAchievements(emp) {
  const xp = emp.xp || 0;
  const quests = sqGetQuestCountsForEmployee(emp);
  const achievements = [];

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
  return achievements;
}

// ---------- Quest completion ----------

function sqCompleteQuest(empId, questId) {
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
        xpEarned: xpGain
      }
    ]
  };

  const employees = sqGetEmployees().map((e) => (e.id === empId ? updatedEmp : e));
  sqSetEmployees(employees);

  const unlockedAchievements = sqGetAchievements(updatedEmp);

  return {
    employee: updatedEmp,
    quest,
    xpGained: xpGain,
    previousLevel: beforeLevel,
    newLevel: afterLevel,
    levelUp: afterLevel > beforeLevel,
    unlockedAchievements
  };
}

// ---------- Reset all data ----------

function sqResetAllData() {
  const fresh = {
    employees: sqDefaultEmployees(),
    quests: sqDefaultQuests()
  };
  sqState = fresh;
  sqSaveState(fresh);

  // also clear moods
  localStorage.removeItem("sq_mood_log");
}
