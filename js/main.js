// main.js – wiring & event handlers

window.sqCurrentEmployeeId = null;
window.sqActiveQuestTypeFilter = "all";
window.sqActiveQuestCategoryFilter = "all";

function sqShowScreen(screen) {
  sqDom.loginScreen.classList.add("sq-hidden");
  sqDom.employeeScreen.classList.add("sq-hidden");
  sqDom.managerScreen.classList.add("sq-hidden");
  if (screen === "login") {
    sqDom.loginScreen.classList.remove("sq-hidden");
    sqDom.logoutBtn.classList.add("sq-hidden");
  } else if (screen === "employee") {
    sqDom.employeeScreen.classList.remove("sq-hidden");
    sqDom.logoutBtn.classList.remove("sq-hidden");
  } else if (screen === "manager") {
    sqDom.managerScreen.classList.remove("sq-hidden");
    sqDom.logoutBtn.classList.remove("sq-hidden");
  }
}

/* ---------- Quest completion handler ---------- */

function sqHandleQuestCompleted(empId, questId, verified = false) {
  const result = sqCompleteQuest(empId, questId, verified);
  if (!result) return;

  const emp = result.employee;
  const quest = result.quest;

  window.sqCurrentEmployeeId = emp.id;

  sqRenderEmployeeProfile(emp.id, { levelUp: result.levelUp });
  sqRenderQuestList(
    emp.id,
    window.sqActiveQuestTypeFilter || "all",
    window.sqActiveQuestCategoryFilter || "all"
  );
  sqRenderEmployeeTable();
  sqRenderTeamSummary();
  sqRenderVerificationQueue();

  const verifyText = verified ? " (manager verified)" : "";
  sqShowToast(
    "Quest completed",
    `${quest.name}: +${result.xpGained} XP${verifyText}`
  );
}

/* ---------- Enter role modes ---------- */

function sqEnterEmployee(empId) {
  window.sqCurrentEmployeeId = empId;
  sqShowScreen("employee");
  sqRenderEmployeeProfile(empId);
  sqRenderQuestCategoryFilterOptions();
  sqRenderQuestList(empId, window.sqActiveQuestTypeFilter, "all");
}

function sqEnterManager() {
  sqShowScreen("manager");
  sqRenderEmployeeTable();
  sqRenderTeamSummary();
  sqRenderQuestManagerList();
  sqRenderVerificationQueue();
}

/* ---------- Init & events ---------- */

document.addEventListener("DOMContentLoaded", () => {
  // Init login UI
  sqRenderLoginEmployeeOptions();
  sqRenderLoginRoleUI();

  if (sqDom.loginRoleSelect) {
    sqDom.loginRoleSelect.addEventListener("change", () => {
      sqRenderLoginRoleUI();
    });
  }

  // Login continue
  if (sqDom.loginContinueBtn) {
    sqDom.loginContinueBtn.addEventListener("click", () => {
      const role = sqDom.loginRoleSelect.value;

      if (role === "employee") {
        const empId = sqDom.loginEmployeeSelect.value;
        const pinInput = sqDom.employeePinInput
          ? sqDom.employeePinInput.value.trim()
          : "";
        const emp = sqGetEmployeeById(empId);

        if (!empId || !emp) {
          sqShowToast(
            "No employee",
            "Add an employee in the Manager view first."
          );
          return;
        }
        if (!pinInput || emp.pin !== pinInput) {
          sqShowToast("Wrong PIN", "Employee PIN is incorrect.");
          return;
        }

        sqEnterEmployee(empId);
        return;
      }

      // Manager
      const pin = sqDom.managerPinInput.value.trim();
      if (pin !== "1234") {
        sqShowToast("Wrong PIN", "Manager PIN is incorrect.");
        return;
      }
      sqEnterManager();
    });
  }

  // Logout
  if (sqDom.logoutBtn) {
    sqDom.logoutBtn.addEventListener("click", () => {
      window.sqCurrentEmployeeId = null;
      window.sqActiveQuestTypeFilter = "all";
      window.sqActiveQuestCategoryFilter = "all";
      sqDom.managerPinInput.value = "";
      if (sqDom.employeePinInput) sqDom.employeePinInput.value = "";
      sqShowScreen("login");
      sqRenderLoginEmployeeOptions();
    });
  }

  // Mood buttons
  if (sqDom.moodButtons && sqDom.moodButtons.length) {
    sqDom.moodButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!window.sqCurrentEmployeeId) {
          sqShowToast(
            "Select profile",
            "Log in as an employee to log mood."
          );
          return;
        }
        const emoji = btn.dataset.mood;
        const updated = sqSetMood(window.sqCurrentEmployeeId, emoji);
        if (updated) {
          sqRenderEmployeeMood(updated.id);
          sqShowToast("Shift logged", `Today's mood: ${emoji}`);
        }
      });
    });
  }

  // History modal
  if (sqDom.viewHistoryBtn) {
    sqDom.viewHistoryBtn.addEventListener("click", () => {
      if (!window.sqCurrentEmployeeId) return;
      sqOpenHistoryModal(window.sqCurrentEmployeeId);
    });
  }

  if (sqDom.historyCloseBtn && sqDom.historyModal) {
    sqDom.historyCloseBtn.addEventListener("click", () => {
      sqDom.historyModal.classList.add("sq-hidden");
    });
    sqDom.historyModal.addEventListener("click", (e) => {
      if (e.target === sqDom.historyModal) {
        sqDom.historyModal.classList.add("sq-hidden");
      }
    });
  }

  // Quest filters
  const filterButtons = [
    sqDom.filterTypeAll,
    sqDom.filterTypeDaily,
    sqDom.filterTypeWeekly,
    sqDom.filterTypeCore
  ].filter(Boolean);

  function setActiveTypeFilter(type) {
    window.sqActiveQuestTypeFilter = type;
    filterButtons.forEach((btn) => {
      btn.classList.toggle(
        "sq-chip-active",
        btn && btn.dataset.filterType === type
      );
    });
    if (window.sqCurrentEmployeeId) {
      sqRenderQuestList(
        window.sqCurrentEmployeeId,
        window.sqActiveQuestTypeFilter,
        window.sqActiveQuestCategoryFilter
      );
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.filterType || "all";
      setActiveTypeFilter(type);
    });
  });

  if (sqDom.filterCategorySelect) {
    sqDom.filterCategorySelect.addEventListener("change", () => {
      window.sqActiveQuestCategoryFilter = sqDom.filterCategorySelect.value;
      if (window.sqCurrentEmployeeId) {
        sqRenderQuestList(
          window.sqCurrentEmployeeId,
          window.sqActiveQuestTypeFilter,
          window.sqActiveQuestCategoryFilter
        );
      }
    });
  }

  // Random quest button
  if (sqDom.randomQuestBtn) {
    sqDom.randomQuestBtn.addEventListener("click", () => {
      if (!window.sqCurrentEmployeeId) return;
      const quests = sqGetQuests();
      const filtered = quests.filter((q) => {
        if (
          window.sqActiveQuestTypeFilter &&
          window.sqActiveQuestTypeFilter !== "all" &&
          q.type !== window.sqActiveQuestTypeFilter
        )
          return false;
        if (
          window.sqActiveQuestCategoryFilter &&
          window.sqActiveQuestCategoryFilter !== "all" &&
          q.category !== window.sqActiveQuestCategoryFilter
        )
          return false;
        return true;
      });
      if (!filtered.length) {
        sqShowToast(
          "No quests",
          "No quests match the current filters to suggest."
        );
        return;
      }
      const quest =
        filtered[Math.floor(Math.random() * filtered.length)];
      sqShowToast(
        "Random quest",
        `${quest.name} (+${quest.xp} XP)`
      );
    });
  }

  // Add employee
  if (sqDom.addEmployeeBtn) {
    sqDom.addEmployeeBtn.addEventListener("click", () => {
      const name = prompt("Employee name:");
      if (!name) return;
      const role = prompt("Role (server, host, cook, etc.):") || "";
      const emp = sqAddEmployee(name.trim(), role.trim());
      sqRenderEmployeeTable();
      sqRenderLoginEmployeeOptions();
      sqShowToast(
        "Employee added",
        `${emp.name} added. PIN: ${emp.pin}`
      );
    });
  }

  // Quest manager – add quest
  if (sqDom.addQuestBtn) {
    sqDom.addQuestBtn.addEventListener("click", () => {
      const name = prompt("Quest name:");
      if (!name) return;
      const category =
        prompt("Category (Service, Cleanliness, Teamwork, etc.):") ||
        "General";
      const type =
        prompt('Type ("daily", "weekly", or "core"):', "daily") ||
        "daily";
      const xp = parseInt(
        prompt("XP value (e.g., 20, 40, 80):", "20") || "20",
        10
      );
      const requiresVerification = confirm(
        "Should this quest require manager approval?"
      );
      const description =
        prompt("Short description (optional):", "") || "";

      sqAddQuest({
        name: name.trim(),
        category: category.trim(),
        type: type.trim(),
        xp: isNaN(xp) ? 20 : xp,
        requiresVerification,
        description
      });

      sqRenderQuestManagerList();
      sqRenderQuestCategoryFilterOptions();
      if (window.sqCurrentEmployeeId) {
        sqRenderQuestList(
          window.sqCurrentEmployeeId,
          window.sqActiveQuestTypeFilter,
          window.sqActiveQuestCategoryFilter
        );
      }
      sqShowToast("Quest added", "New quest added to StaffQuest.");
    });
  }

  // Quest manager – edit/delete (event delegation)
  if (sqDom.questManagerList) {
    sqDom.questManagerList.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("sq-quest-edit")) {
        const id = target.dataset.questId;
        const quest = sqGetQuestById(id);
        if (!quest) return;

        const name =
          prompt("Quest name:", quest.name) || quest.name;
        const category =
          prompt("Category:", quest.category || "General") ||
          quest.category ||
          "General";
        const type =
          prompt(
            'Type ("daily", "weekly", "core"):',
            quest.type || "daily"
          ) || quest.type || "daily";
        const xp = parseInt(
          prompt("XP value:", String(quest.xp || 20)) ||
            String(quest.xp || 20),
          10
        );
        const requiresVerification = confirm(
          "Require manager approval for this quest? OK = yes, Cancel = no."
        );
        const description =
          prompt("Short description:", quest.description || "") ||
          quest.description ||
          "";

        sqUpdateQuest(id, {
          name: name.trim(),
          category: category.trim(),
          type: type.trim(),
          xp: isNaN(xp) ? quest.xp || 20 : xp,
          requiresVerification,
          description
        });
        sqRenderQuestManagerList();
        sqRenderQuestCategoryFilterOptions();
        if (window.sqCurrentEmployeeId) {
          sqRenderQuestList(
            window.sqCurrentEmployeeId,
            window.sqActiveQuestTypeFilter,
            window.sqActiveQuestCategoryFilter
          );
        }
        sqShowToast("Quest updated", "Quest changes have been saved.");
      } else if (target.classList.contains("sq-quest-delete")) {
        const id = target.dataset.questId;
        const quest = sqGetQuestById(id);
        if (!quest) return;
        const ok = confirm(
          `Delete quest "${quest.name}"? This cannot be undone.`
        );
        if (!ok) return;
        sqDeleteQuest(id);
        sqRenderQuestManagerList();
        sqRenderQuestCategoryFilterOptions();
        if (window.sqCurrentEmployeeId) {
          sqRenderQuestList(
            window.sqCurrentEmployeeId,
            window.sqActiveQuestTypeFilter,
            window.sqActiveQuestCategoryFilter
          );
        }
        sqShowToast("Quest deleted", "Quest removed from StaffQuest.");
      }
    });
  }

  // Data controls
  if (sqDom.clearDemoDataBtn) {
    sqDom.clearDemoDataBtn.addEventListener("click", () => {
      const ok = confirm(
        "Reset all demo data to defaults for this browser?"
      );
      if (!ok) return;
      sqClearAllData();
      sqRenderEmployeeTable();
      sqRenderTeamSummary();
      sqRenderQuestManagerList();
      sqRenderVerificationQueue();
      sqRenderLoginEmployeeOptions();
      if (window.sqCurrentEmployeeId) {
        sqEnterEmployee(window.sqCurrentEmployeeId);
      }
      sqShowToast(
        "Demo reset",
        "All data reset to default demo state."
      );
    });
  }

  if (sqDom.populateDemoDataBtn) {
    sqDom.populateDemoDataBtn.addEventListener("click", () => {
      const ok = confirm(
        "Populate sample demo data for all employees? This will overwrite their current progress."
      );
      if (!ok) return;
      sqPopulateDemoData();
      sqRenderEmployeeTable();
      sqRenderTeamSummary();
      sqRenderVerificationQueue();
      if (window.sqCurrentEmployeeId) {
        sqRenderEmployeeProfile(window.sqCurrentEmployeeId);
        sqRenderQuestList(
          window.sqCurrentEmployeeId,
          window.sqActiveQuestTypeFilter,
          window.sqActiveQuestCategoryFilter
        );
      }
      sqShowToast(
        "Demo data populated",
        "Sample activity was generated for the last 7 days."
      );
    });
  }

  // Initial screen
  sqShowScreen("login");
});
