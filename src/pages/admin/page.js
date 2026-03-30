export function renderAdminPage(root, model, handlers) {
  if (model.editingEmployee) {
    return renderEmployeeDetail(root, model, handlers);
  }

  const rows = model.rows
    .map(
      (row) => `
      <tr>
        <td>${row.name}</td>
        <td>${row.status}</td>
        <td>${row.worked} (${row.sessionsCount} sesiuni)</td>
        <td>${row.lastEvent}</td>
        <td>
          <button class="btn btn-primary" data-edit="${row.id}">Editeaza</button>
          <button class="btn btn-danger" data-remove="${row.id}">Sterge</button>
        </td>
      </tr>`
    )
    .join("");

  const events = model.events
    .slice(0, 20)
    .map((event) => `<li>${event.employeeName} - ${event.type} - ${event.at}</li>`)
    .join("");

  root.innerHTML = `
    <div class="container grid">
      <div class="toolbar">
        <h1>Admin</h1>
        <div class="row">
          <button class="btn" id="go-kiosk">Kiosk</button>
          <button class="btn" id="go-home">Logout</button>
        </div>
      </div>

      <div class="card">
        <h2>Adauga angajat</h2>
        <div class="row">
          <input class="input" id="employee-name" placeholder="Nume angajat" />
          <button class="btn btn-success" id="add-employee">Adauga</button>
        </div>
      </div>

      <div class="card">
        <h2>Situatie curenta</h2>
        <table>
          <thead>
            <tr>
              <th>Nume</th>
              <th>Status</th>
              <th>Total ore</th>
              <th>Ultimul eveniment</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>${rows || "<tr><td colspan='5'>Nu exista angajati.</td></tr>"}</tbody>
        </table>
      </div>

      <div class="card">
        <h2>Ultimele evenimente</h2>
        <ul>${events || "<li>Nu exista evenimente.</li>"}</ul>
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
          <button class="btn btn-success" data-save="${session.id}">Salveaza</button>
          <button class="btn btn-danger" data-delete-session="${session.id}">Sterge</button>
        </td>
      </tr>
    `;
  }).join("");

  root.innerHTML = `
    <div class="container grid">
      <div class="toolbar">
        <h1>Editeaza pontaj: ${employee.name}</h1>
        <button class="btn" id="back-admin">Inapoi la Admin</button>
      </div>

      <div class="card">
        <h2>Adauga sesiune manuala</h2>
        <div class="grid grid-2">
          <div>
            <label>Intrare:</label>
            <input type="datetime-local" id="manual-start" class="input" />
          </div>
          <div>
            <label>Iesire (optional):</label>
            <input type="datetime-local" id="manual-end" class="input" />
          </div>
          <div style="grid-column: 1 / -1;">
            <button class="btn btn-success" id="add-manual">Adauga sesiune</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Sesiuni existente</h2>
        <table>
          <thead>
            <tr>
              <th>Intrare</th>
              <th>Iesire</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            ${sessionRows || "<tr><td colspan='3'>Nu exista sesiuni.</td></tr>"}
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
      if (confirm("Sigur stergi aceasta sesiune?")) {
        handlers.onDeleteSession(button.getAttribute("data-delete-session"));
      }
    });
  });
}
