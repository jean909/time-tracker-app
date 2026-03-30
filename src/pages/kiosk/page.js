export function renderKioskPage(root, model, handlers) {
  const employeeButtons = model.employees
    .map((employee) => {
      const status = model.getStatus(employee.id);
      const className = status === "IN" ? "status-on" : "status-off";
      return `
      <button class="btn employee-btn ${className}" data-employee-id="${employee.id}">
        ${employee.name}
        <br />
        <small>${status === "IN" ? "La munca" : "Plecat"}</small>
      </button>`;
    })
    .join("");

  root.innerHTML = `
    <div class="container">
      <div class="toolbar">
        <h1>Mod Kiosk</h1>
        <div class="row">
          <button class="btn" id="back-home">Inapoi</button>
          <button class="btn btn-primary" id="go-admin">Admin</button>
        </div>
      </div>
      <p class="muted">Apasa pe nume pentru intrare/iesire/revenire.</p>
      <div class="message" id="kiosk-message">${model.message || "Selecteaza un nume."}</div>
      <div class="card" style="margin-top:12px;">
        <div class="kiosk-grid">${employeeButtons || "<p>Nu exista angajati.</p>"}</div>
      </div>
    </div>
  `;

  root.querySelector("#back-home").addEventListener("click", handlers.onBackHome);
  root.querySelector("#go-admin").addEventListener("click", handlers.onGoAdmin);
  root.querySelectorAll("[data-employee-id]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onTapEmployee(button.getAttribute("data-employee-id"));
    });
  });
}
