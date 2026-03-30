export function renderAdminPage(root, model, handlers) {
  const rows = model.rows
    .map(
      (row) => `
      <tr>
        <td>${row.name}</td>
        <td>${row.status}</td>
        <td>${row.worked}</td>
        <td>${row.lastEvent}</td>
        <td><button class="btn btn-danger" data-remove="${row.id}">Sterge</button></td>
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
  root.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => handlers.onRemoveEmployee(button.getAttribute("data-remove")));
  });
}
