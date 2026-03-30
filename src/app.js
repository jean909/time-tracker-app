import { renderAdminPage } from "./pages/admin/page.js";
import { renderKioskPage } from "./pages/kiosk/page.js";
import { renderLoginPage } from "./pages/login/page.js";
import {
  addEmployee,
  buildAdminRows,
  getEmployeeName,
  getEmployeeStatus,
  loadState,
  removeEmployee,
  saveState,
  toggleEmployee,
} from "./state/store.js";
import { formatDateTime } from "./utils/time.js";

const root = document.getElementById("app");

const viewState = {
  route: "login",
  isAdminAuthenticated: false,
  kioskMessage: "",
};

let state = loadState();

function rerender() {
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
          errorBox.textContent = "Credentiale invalide.";
        }
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
          const action = result.type === "IN" ? "a intrat la munca" : "a iesit de la munca";
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
    },
    {
      onLogout: () => {
        viewState.isAdminAuthenticated = false;
        viewState.route = "login";
        rerender();
      },
      onGoKiosk: () => {
        viewState.route = "kiosk";
        rerender();
      },
      onAddEmployee: (name) => {
        if (!addEmployee(state, name)) return;
        saveState(state);
        rerender();
      },
      onRemoveEmployee: (employeeId) => {
        removeEmployee(state, employeeId);
        saveState(state);
        rerender();
      },
    }
  );
}

rerender();
