// ==============================================
// StaffQuest Data Handling & Storage Utilities
// ==============================================

// LocalStorage key
const SQ_STORAGE_KEY = "staffquest_ultra_state";

// ----------------------
// Default demo employees
// ----------------------
function sqDefaultEmployees() {
  return [
    {
      id: "emp_alex",
      name: "Alex Rivera",
      role: "Server",
      xp: 220,
      questHistory: [],
      pin: "1111"
    },
    {
      id: "emp_jordan",
      name: "Jordan Lee",
      role: "Host",
      xp: 90,
      questHistory: [],
      pin: "2222"
    },
    {
      id: "emp_taylor",
      name: "Taylor Kim",
      role: "Line Cook",
      xp: 310,
      questHistory: [],
      pin: "3333"
    }
  ];
}

// ----------------------
// Default quest list
// ----------------------
function sqDefaultQuests() {
  return [
    {
      id: "q_take_orders",
      name: "Take 10 accurate orders",
      category: "Service",
      type: "daily",
      xp: 50,
      repeatable: true,
      description: "Handle 10 orders correctly and efficiently."
    },
    {
      id: "q_clean_station",
      name: "Clean prep station",
      category: "Cleanliness",
      type: "daily",
      xp: 40,
      repeatable: true,
      description: "Keep your prep area spotless during your shift."
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
      description: "Support teammates during peak rush hours."
    },
    {
      id: "q_positive_feedback",
      name: "Earn positive customer feedback",
      category: "Service",
      type: "weekly",
      xp: 70,
      repeatable: true,
      description: "Receive positive feedback from a customer."
    }
  ];
}

// ----------------------
// Default team quests
// ----------------------
function sqDefaultTeamQuests() {
  return [
    {
      id: "tq_crush_the_week",
      name: "Crush the Week",
      description: "As a team, complete 25 quests in the last 7 days.",
      metric: "quests_7d",
      target: 25
    },
    {
      id: "tq_clean_sweep_today",
      name: "Clean Sweep Today",
      description: "As a team, complete 8 Cleanliness quests today.",
      metric: "quests_today_cleanliness",
      target: 8
    }
  ];
}

// ----------------------
// State Load / Save
// ----------------------
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

    const parsed = JSON.parse(raw) || {};

    // Ensure arrays exist
    if (!Array.isArray(parsed.employees)) parsed.employees = sqDefaultEmployees();
    if (!Array.isArray(parsed.quests)) parsed.quests = sqDefaultQuests();
    if (!Array.isArray(parsed.teamQuests)) parsed.teamQuests = sqDefaultTeamQuests();
    if (!Array.isArray(parsed.pendingApprovals)) parsed.pendingApprovals = [];

    // 🔥 Fix for GitHub Pages "no profiles" bug
    if (!parsed.employees.length) parsed.employees = sqDefaultEmployees();

    sqSaveState(parsed);
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
  localStorage.setItem(SQ_STORAGE_KEY, JSON.stringify(state));
}

let sqState = sqLoadState();

// ----------------------
// Helper Getters
// ----------------------
function sqGetEmployees() {
  return sqState.employees || [];
}
function sqSetEmployees(list) {
  sqState.employees = list;
  sqSaveState(sqState);
}
function sqGetEmployeeById(id) {
  return sqGetEmployees().find((e) => e.id === id);
}

function sqGetQuests() {
  return sqState.quests || [];
}
function sqGetQuestById(id) {
  return sqGetQuests().find((q) => q.id === id);
}
function sqGetTeamQuests() {
  return sqState.teamQuests || [];
}

// ----------------------
// Employee Management
// ----------------------
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
    pin
  };
  const list = sqGetEmployees().slice();
  list.push(emp);
  sqSetEmployees(list);
  return emp;
}

// ----------------------
// Quest Completion Logic
// ----------------------
function sqGetLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

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
    e.id === emp.id ? updatedEmp : e
  );
  sqSetEmployees(list);

  const levelUp = afterLevel > beforeLevel;
  return { employee: updatedEmp, quest, xpGained: xpGain, levelUp };
}

// ----------------------
// Pending Approvals
// ----------------------
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
  sqState.pendingApprovals = sqState.pendingApprovals.filter((p) => p.id !== id);
  sqSaveState(sqState);
}

function sqHasPendingApproval(empId, questId) {
  return sqGetPendingApprovals().some(
    (p) => p.empId === empId && p.questId === questId
  );
}

// ----------------------
// Achievements (XP + Verified-based)
// ----------------------
function sqGetQuestCountsForEmployee(emp) {
  return (emp.questHistory || []).length;
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
    return (q.xp || 0) >= 80;
  }).length;

  if (quests >= 1)
    achievements.push({
      id: "first_quest",
      name: "First Shift Hero",
      description: "Completed your first quest."
    });
  if (quests >= 10)
    achievements.push({
      id: "ten_quests",
      name: "Consistency Champ",
      description: "Completed 10 quests."
    });
  if (xp >= 300)
    achievements.push({
      id: "xp_300",
      name: "On a Roll",
      description: "Earned 300+ XP."
    });
  if (xp >= 600)
    achievements.push({
      id: "xp_600",
      name: "StaffQuest Veteran",
      description: "Earned 600+ XP overall."
    });
  if (verifiedCount >= 5)
    achievements.push({
      id: "verified_5",
      name: "Trusted Teammate",
      description: "Completed 5 manager-verified quests."
    });
  if (verifiedCount >= 15)
    achievements.push({
      id: "verified_15",
      name: "Manager’s Go-To",
      description: "Completed 15 manager-verified quests."
    });
  if (hardVerifiedCount >= 5)
    achievements.push({
      id: "verified_hard_5",
      name: "Clutch Performer",
      description: "Completed 5 hard quests with manager approval."
    });

  return achievements;
}

// ----------------------
// Demo Data Generator
// ----------------------
function sqPopulateDemoData() {
  const employees = sqGetEmployees();
  const quests = sqGetQuests ? sqGetQuests() : (sqState.quests || []);
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

      const numCompletions = Math.floor(Math.random() * maxPerDay);
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
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    return { ...emp, xp: xpTotal, questHistory: history };
  });

  sqState.employees = updatedEmployees;
  sqState.pendingApprovals = [];
  sqSaveState(sqState);
}

// ----------------------
// Reset to Defaults
// ----------------------
function sqClearAllData() {
  sqState = {
    employees: sqDefaultEmployees(),
    quests: sqDefaultQuests(),
    teamQuests: sqDefaultTeamQuests(),
    pendingApprovals: []
  };
  sqSaveState(sqState);
}
