// StaffQuest main logic

let sqSession = { role: null, employeeId: null };

let sqActiveQuestTypeFilter = "all";
let sqActiveQuestCategoryFilter = "all";

// allow quest manager to refresh employee quest list
window.sqRefreshEmployeeQuestList = function () {
  const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
  if (empId) {
    sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
  }
};

// handle quest completion
function sqHandleQuestCompleted(empId, questId) {
  const result = sqCompleteQuest(empId, questId);
  if (!result) return;

  const emp = result.employee;
  const quest = result.quest;

  sqRenderEmployeeProfile(emp.id, { levelUp: result.levelUp });
  sqRenderQuestList(emp.id, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
  sqRenderEmployeeTable(sqDom.employeeSearchInput.value || "");
  sqRenderTeamSummary();

  sqShowToast("Quest completed", `${quest.name}: +${result.xpGained} XP`);

  // optional: could show unlocked achievements here if you want
}

// --- Init helpers ---

function sqEnterEmployee(empId) {
  sqSession = { role: "employee", employeeId: empId };
  sqUpdateUserStatus(sqSession);

  sqSetTabActive("employee");
  sqShowView("employee");

  sqRenderEmployeeSelect();
  if (sqDom.employeeSelect) {
    sqDom.employeeSelect.value = empId;
  }

  sqRenderEmployeeProfile(empId);
  sqRenderQuestCategoryFilter();
  sqRenderQuestTypePills(sqActiveQuestTypeFilter);
  sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
}

function sqEnterManager() {
  sqSession = { role: "manager", employeeId: null };
  sqUpdateUserStatus(sqSession);

  sqSetTabActive("manager");
  sqShowView("manager");

  sqRenderEmployeeTable("");
  sqRenderQuestManagerList();
  sqRenderQuestCategoryFilter();
}

// extra events (help, mood, random quest, manage button)
function sqInitExtraEvents() {
  // Help modal
  if (sqDom.helpBtn) {
    sqDom.helpBtn.addEventListener("click", sqOpenHelpModal);
  }
  if (sqDom.helpModalClose) {
    sqDom.helpModalClose.addEventListener("click", sqCloseHelpModal);
  }
  if (sqDom.helpModal) {
    sqDom.helpModal.addEventListener("click", (e) => {
      if (e.target === sqDom.helpModal) {
        sqCloseHelpModal();
      }
    });
  }

  // Jump to manager tab
  if (sqDom.employeeManageBtn) {
    sqDom.employeeManageBtn.addEventListener("click", () => {
      if (sqSession.role === "manager") {
        sqEnterManager();
      } else {
        sqShowToast("Manager only", "Sign in as Manager (PIN 1234) to manage employees.");
      }
    });
  }

  // Random quest
  if (sqDom.randomQuestBtn) {
    sqDom.randomQuestBtn.addEventListener("click", sqSuggestRandomQuest);
  }

  // Mood check-in
  if (sqDom.moodButtons) {
    sqDom.moodButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mood]");
      if (!btn) return;

      const mood = btn.getAttribute("data-mood");
      const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
      const emp = sqGetEmployeeById(empId);

      if (!emp) {
        sqShowToast("Pick an employee", "Select an employee profile first.");
        return;
      }

      const map = sqGetMoodMap();
      const todayKey = new Date().toDateString();
      map[emp.id] = { mood, date: todayKey };
      sqSaveMoodMap(map);

      if (sqDom.moodStatus) {
        sqDom.moodStatus.textContent = `Today's mood: ${mood}`;
      }

      sqShowToast("Shift logged", `${emp.name}'s mood for today: ${mood}`);
    });
  }
}

// main init
document.addEventListener("DOMContentLoaded", () => {
  // default login role UI
  sqRenderLoginEmployeeOptions();
  sqRenderLoginRoleUI();
  sqUpdateUserStatus(null);
  sqShowView("login");
  sqSetTabActive("employee");
  sqRenderTeamSummary();

  // login role change
  if (sqDom.loginRoleSelect) {
    sqDom.loginRoleSelect.addEventListener("change", sqRenderLoginRoleUI);
  }

  // login continue
  if (sqDom.loginContinueBtn) {
    sqDom.loginContinueBtn.addEventListener("click", () => {
      const role = sqDom.loginRoleSelect.value;
      if (role === "employee") {
        const empId = sqDom.loginEmployeeSelect.value;
        if (!empId) {
          sqShowToast("No employee", "Add an employee in the Manager view first.");
          return;
        }
        sqEnterEmployee(empId);
      } else {
        const pin = sqDom.managerPinInput.value.trim();
        if (pin !== "1234") {
          sqShowToast("Wrong PIN", "Manager PIN is incorrect.");
          return;
        }
        sqEnterManager();
      }
    });
  }

  // logout
  if (sqDom.logoutBtn) {
    sqDom.logoutBtn.addEventListener("click", () => {
      sqSession = { role: null, employeeId: null };
      sqUpdateUserStatus(null);
      sqSetTabActive("employee");
      sqShowView("login");
    });
  }

  // tab buttons
  if (sqDom.employeeViewBtn) {
    sqDom.employeeViewBtn.addEventListener("click", () => {
      if (!sqSession.role) {
        sqShowView("login");
        sqSetTabActive("employee");
        return;
      }
      sqSetTabActive("employee");
      sqShowView("employee");
    });
  }

  if (sqDom.managerViewBtn) {
    sqDom.managerViewBtn.addEventListener("click", () => {
      if (sqSession.role !== "manager") {
        sqShowToast("Manager only", "Sign in as Manager (PIN 1234) to open this tab.");
        return;
      }
      sqEnterManager();
    });
  }

  // employee select change
  if (sqDom.employeeSelect) {
    sqDom.employeeSelect.addEventListener("change", () => {
      const empId = sqDom.employeeSelect.value;
      if (!empId) return;
      sqSession.employeeId = empId;
      sqRenderEmployeeProfile(empId);
      sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
      sqUpdateUserStatus(sqSession);
    });
  }

  // quest filters
  if (sqDom.questTypeFilters) {
    sqDom.questTypeFilters.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-type]");
      if (!btn) return;
      const type = btn.getAttribute("data-type");
      sqActiveQuestTypeFilter = type;
      sqRenderQuestTypePills(type);

      const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
      if (empId) {
        sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
      }
    });
  }

  if (sqDom.questCategoryFilter) {
    sqDom.questCategoryFilter.addEventListener("change", () => {
      sqActiveQuestCategoryFilter = sqDom.questCategoryFilter.value;
      const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
      if (empId) {
        sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
      }
    });
  }

  // history modal
  if (sqDom.viewHistoryBtn) {
    sqDom.viewHistoryBtn.addEventListener("click", () => {
      const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
      if (!empId) {
        sqShowToast("Pick an employee", "Select an employee profile first.");
        return;
      }
      sqOpenHistoryModal(empId);
    });
  }

  if (sqDom.historyModalClose) {
    sqDom.historyModalClose.addEventListener("click", sqCloseHistoryModal);
  }
  if (sqDom.historyModal) {
    sqDom.historyModal.addEventListener("click", (e) => {
      if (e.target === sqDom.historyModal) sqCloseHistoryModal();
    });
  }

  // reset employee profile
  if (sqDom.resetEmployeeBtn) {
    sqDom.resetEmployeeBtn.addEventListener("click", () => {
      const empId = sqDom.employeeSelect && sqDom.employeeSelect.value;
      if (!empId) return;
      if (!confirm("Reset this employee's XP and quest history?")) return;
      sqResetEmployee(empId);
      sqRenderEmployeeProfile(empId);
      sqRenderQuestList(empId, sqActiveQuestTypeFilter, sqActiveQuestCategoryFilter);
      sqRenderEmployeeTable(sqDom.employeeSearchInput.value || "");
      sqRenderTeamSummary();
    });
  }

  // employee search
  if (sqDom.employeeSearchInput) {
    sqDom.employeeSearchInput.addEventListener("input", () => {
      sqRenderEmployeeTable(sqDom.employeeSearchInput.value);
    });
  }

  // add employee
  if (sqDom.addEmployeeBtn) {
    sqDom.addEmployeeBtn.addEventListener("click", () => {
      const name = prompt("Employee name:");
      if (!name) return;
      const role = prompt("Role (optional):") || "";
      const emp = sqAddEmployee(name.trim(), role.trim());
      sqRenderEmployeeTable(sqDom.employeeSearchInput.value || "");
      sqRenderLoginEmployeeOptions();
      sqRenderEmployeeSelect();
      sqRenderTeamSummary();
      sqShowToast("Employee added", `${emp.name} added to StaffQuest.`);
    });
  }

  // reset all data
  if (sqDom.resetAllDataBtn) {
    sqDom.resetAllDataBtn.addEventListener("click", () => {
      if (!confirm("Clear all demo data and restore defaults?")) return;
      sqResetAllData();
      sqRenderLoginEmployeeOptions();
      sqRenderEmployeeSelect();
      sqRenderEmployeeTable("");
      sqRenderQuestManagerList();
      sqRenderQuestCategoryFilter();
      sqRenderTeamSummary();
      sqSession = { role: null, employeeId: null };
      sqUpdateUserStatus(null);
      sqSetTabActive("employee");
      sqShowView("login");
      sqShowToast("Demo reset", "All demo data cleared and reset.");
    });
  }

  // quest form submit
  if (sqDom.questForm) {
    sqDom.questForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = sqDom.questIdInput.value || null;
      const name = sqDom.questNameInput.value.trim();
      if (!name) {
        sqShowToast("Name required", "Quest name cannot be empty.");
        return;
      }
      const questData = {
        id,
        name,
        category: sqDom.questCategoryInput.value.trim() || "General",
        type: sqDom.questTypeInput.value,
        xp: parseInt(sqDom.questXPInput.value || "50", 10),
        repeatable: !!sqDom.questRepeatableInput.checked,
        description: sqDom.questDescriptionInput.value.trim()
      };
      sqUpsertQuest(questData);
      sqFillQuestForm(null);
      sqRenderQuestManagerList();
      sqRenderQuestCategoryFilter();
      window.sqRefreshEmployeeQuestList();
      sqShowToast("Quest saved", `Quest "${name}" has been saved.`);
    });
  }

  if (sqDom.questCancelEditBtn) {
    sqDom.questCancelEditBtn.addEventListener("click", () => {
      sqFillQuestForm(null);
    });
  }

  sqInitExtraEvents();
});
