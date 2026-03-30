import { t } from "../../utils/i18n.js";

export function renderAdminPage(root, model, handlers) {
  if (model.editingEmployee) {
    return renderEmployeeDetail(root, model, handlers);
  }

  const rows = model.rows
    .map(
      (row) => `
      <tr>
        <td>${row.name}</td>
        <td>${t(row.status)}</td>
        <td>${row.worked} (${row.sessionsCount} ${t('sessions')})</td>
        <td>${row.lastEvent}</td>
        <td>
          <button class="btn btn-primary" data-edit="${row.id}">${t('edit')}</button>
          <button class="btn btn-danger" data-remove="${row.id}">${t('delete')}</button>
        </td>
      </tr>`
    )
    .join("");

  const events = model.events
    .slice(0, 20)
    .map((event) => `<li>${event.employeeName} - ${t(event.type)} - ${event.at}</li>`)
    .join("");

  root.innerHTML = `
    <div class="container grid">
      <div class="toolbar">
        <h1>${t('admin')}</h1>
        <div class="row">
          <button class="btn" id="go-kiosk">${t('kiosk')}</button>
          <button class="btn" id="go-home">${t('logout')}</button>
        </div>
      </div>

      <div class="card">
        <h2>${t('addEmployee')}</h2>
        <div class="row">
          <input class="input" id="employee-name" placeholder="${t('employeeName')}" />
          <button class="btn btn-success" id="add-employee">${t('add')}</button>
        </div>
      </div>

      <div class="card">
        <h2>${t('currentSituation')}</h2>
        <table>
          <thead>
            <tr>
              <th>${t('name')}</th>
              <th>${t('status')}</th>
              <th>${t('totalHours')}</th>
              <th>${t('lastEvent')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan='5'>${t('noEmployees')}</td></tr>`}</tbody>
        </table>
      </div>

      <div class="card">
        <h2>${t('recentEvents')}</h2>
        <ul>${events || `<li>${t('noEvents')}</li>`}</ul>
      </div>
    </div>
  `;

  root.querySelector("#go-home").addEventListener("click", handlers.onLogout);
  root.querySelector("#go-kiosk").addEventListener("click", handlers.onGoKiosk);
  root.querySelector("#add-employee").addEventListener("click", () => {
    const name = root.querySelector("#employee-name").value;
    handlers.onAddEmployee(name);
  });
  root.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => handlers.onEditEmployee(button.getAttribute("data-edit")));
  });
  root.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => handlers.onRemoveEmployee(button.getAttribute("data-remove")));
  });
}

function renderEmployeeDetail(root, model, handlers) {
  const employee = model.editingEmployee;
  const sessions = model.employeeSessions || [];
  
  const sessionRows = sessions.map(session => {
    const startDate = new Date(session.start);
    const endDate = session.end ? new Date(session.end) : null;
    
    return `
      <tr>
        <td>
          <input type="datetime-local" 
                 value="${startDate.toISOString().slice(0, 16)}" 
                 data-session-id="${session.id}" 
                 data-field="start" />
        </td>
        <td>
          <input type="datetime-local" 
                 value="${endDate ? endDate.toISOString().slice(0, 16) : ''}" 
                 data-session-id="${session.id}" 
                 data-field="end" />
        </td>
        <td>
          <button class="btn btn-success" data-save="${session.id}">${t('save')}</button>
          <button class="btn btn-danger" data-delete-session="${session.id}">${t('delete')}</button>
        </td>
      </tr>
    `;
  }).join("");

  root.innerHTML = `
    <div class="container grid">
      <div class="toolbar">
        <h1>${t('editTimeTracking')}: ${employee.name}</h1>
        <button class="btn" id="back-admin">${t('backToAdmin')}</button>
      </div>

      <div class="card">
        <h2>${t('addManualSession')}</h2>
        <div class="grid grid-2">
          <div>
            <label>${t('entry')}:</label>
            <input type="datetime-local" id="manual-start" class="input" />
          </div>
          <div>
            <label>${t('exit')}:</label>
            <input type="datetime-local" id="manual-end" class="input" />
          </div>
          <div style="grid-column: 1 / -1;">
            <button class="btn btn-success" id="add-manual">${t('addSession')}</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>${t('existingSessions')}</h2>
        <table>
          <thead>
            <tr>
              <th>${t('entry')}</th>
              <th>${t('exit')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${sessionRows || `<tr><td colspan='3'>${t('noSessions')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  root.querySelector("#back-admin").addEventListener("click", handlers.onBackToAdmin);
  
  root.querySelector("#add-manual").addEventListener("click", () => {
    const start = root.querySelector("#manual-start").value;
    const end = root.querySelector("#manual-end").value;
    handlers.onAddManualSession(employee.id, start, end);
  });

  root.querySelectorAll("[data-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const sessionId = button.getAttribute("data-save");
      const startInput = root.querySelector(`[data-session-id="${sessionId}"][data-field="start"]`);
      const endInput = root.querySelector(`[data-session-id="${sessionId}"][data-field="end"]`);
      handlers.onEditSession(sessionId, startInput.value, endInput.value);
    });
  });

  root.querySelectorAll("[data-delete-session]").forEach((button) => {
    button.addEventListener("click", () => {
      if (confirm(t('confirmDelete'))) {
        handlers.onDeleteSession(button.getAttribute("data-delete-session"));
      }
    });
  });
}
