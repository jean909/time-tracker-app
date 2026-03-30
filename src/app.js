import { renderAdminPage } from "./pages/admin/page.js";
import { renderKioskPage } from "./pages/kiosk/page.js";
import { renderLoginPage } from "./pages/login/page.js";
import {
  addEmployee,
  addManualSession,
  buildAdminRows,
  deleteSession,
  editSession,
  getEmployeeName,
  getEmployeeSessions,
  getEmployeeStatus,
  loadState,
  removeEmployee,
  saveState,
  toggleEmployee,
} from "./state/store.js";
import { formatDateTime } from "./utils/time.js";
import { initLanguage, setLanguage, t, getCurrentLanguage } from "./utils/i18n.js";
import { addStatusIndicator } from "./components/status-indicator.js";

const root = document.getElementById("app");

const viewState = {
  route: "login",
  isAdminAuthenticated: false,
  kioskMessage: "",
  editingEmployee: null,
};

let state = null;
let isInitialized = false;

// Initialize app state
async function initializeApp() {
  if (isInitialized) return;
  state = await loadState();
  isInitialized = true;
  rerender();
}

// Initialize on app load
initializeApp();

// Initialize language
initLanguage();

// Add status indicator
addStatusIndicator();

function rerender() {
  // Don't render until state is loaded
  if (!state) {
    document.getElementById('app').innerHTML = '<div class="container"><h1>Loading...</h1></div>';
    return;
  }

  // Update active language button
  document.querySelectorAll('.language-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === getCurrentLanguage()) {
      btn.classList.add('active');
    }
  });

  if (viewState.route === "login") {
    renderLoginPage(root, {
      onGoKiosk: () => {
        viewState.route = "kiosk";
        rerender();
      },
      onAdminLogin: ({ username, password }) => {
        if (username === state.admin.username && password === state.admin.password) {
          viewState.isAdminAuthenticated = true;
          viewState.route = "admin";
          rerender();
          return;
        }
        const errorBox = root.querySelector("#error-box");
        if (errorBox) {
          errorBox.textContent = t('invalidCredentials');
        }
      },
      onLanguageChange: (lang) => {
        setLanguage(lang);
        rerender();
      },
    });
    return;
  }

  if (viewState.route === "kiosk") {
    renderKioskPage(
      root,
      {
        employees: state.employees,
        message: viewState.kioskMessage,
        getStatus: (employeeId) => getEmployeeStatus(state, employeeId),
      },
      {
        onBackHome: () => {
          viewState.route = "login";
          rerender();
        },
        onGoAdmin: () => {
          viewState.route = "login";
          rerender();
        },
        onTapEmployee: (employeeId) => {
          const result = toggleEmployee(state, employeeId);
          saveState(state);
          const name = getEmployeeName(state, employeeId);
          const action = result.type === "IN" ? t('enteredWork') : t('leftWork');
          viewState.kioskMessage = `${name} ${action} (${formatDateTime(result.at)}).`;
          rerender();
        },
      }
    );
    return;
  }

  if (viewState.route === "admin" && !viewState.isAdminAuthenticated) {
    viewState.route = "login";
    rerender();
    return;
  }

  renderAdminPage(
    root,
    {
      rows: buildAdminRows(state),
      events: state.events.map((event) => ({
        ...event,
        employeeName: getEmployeeName(state, event.employeeId),
        at: formatDateTime(event.at),
      })),
      editingEmployee: viewState.editingEmployee,
      employeeSessions: viewState.editingEmployee ? getEmployeeSessions(state, viewState.editingEmployee.id) : null,
    },
    {
      onLogout: () => {
        viewState.isAdminAuthenticated = false;
        viewState.route = "login";
        viewState.editingEmployee = null;
        rerender();
      },
      onGoKiosk: () => {
        viewState.route = "kiosk";
        viewState.editingEmployee = null;
        rerender();
      },
      onAddEmployee: async (name) => {
        if (!(await addEmployee(state, name))) return;
        saveState(state);
        rerender();
      },
      onRemoveEmployee: async (employeeId) => {
        const employeeName = getEmployeeName(state, employeeId);
        if (confirm(t('confirmDeleteEmployee', { name: employeeName }))) {
          await removeEmployee(state, employeeId);
          saveState(state);
          rerender();
        }
      },
      onEditEmployee: (employeeId) => {
        const employee = state.employees.find(e => e.id === employeeId);
        if (employee) {
          viewState.editingEmployee = employee;
          rerender();
        }
      },
      onBackToAdmin: () => {
        viewState.editingEmployee = null;
        rerender();
      },
      onAddManualSession: (employeeId, startTime, endTime) => {
        if (addManualSession(state, employeeId, startTime, endTime)) {
          saveState(state);
          rerender();
        } else {
          alert(t('invalidData'));
        }
      },
      onEditSession: (sessionId, startTime, endTime) => {
        if (editSession(state, sessionId, startTime, endTime)) {
          saveState(state);
          rerender();
        } else {
          alert(t('invalidData'));
        }
      },
      onDeleteSession: (sessionId) => {
        if (deleteSession(state, sessionId)) {
          saveState(state);
          rerender();
        }
      },
    }
  );
}

rerender();
