import { t } from "../utils/i18n.js";

export function renderKioskPage(root, model, handlers) {
  const employeeButtons = model.employees
    .map((employee) => {
      const status = model.getStatus(employee.id);
      const className = status === "IN" ? "status-on" : "status-off";
      const statusText = status === "IN" ? t('atWork') : t('away');
      return `
      <button class="btn employee-btn ${className}" data-employee-id="${employee.id}">
        ${employee.name}
        <br />
        <small>${statusText}</small>
      </button>`;
    })
    .join("");

  root.innerHTML = `
    <div class="container">
      <div class="toolbar">
        <h1>${t('kioskMode')}</h1>
        <div class="row">
          <button class="btn" id="back-home">${t('back')}</button>
          <button class="btn btn-primary" id="go-admin">${t('admin')}</button>
        </div>
      </div>
      <p class="muted">${t('tapForEntry')}</p>
      <div class="message" id="kiosk-message">${model.message || t('selectName')}</div>
      <div class="card" style="margin-top:12px;">
        <div class="kiosk-grid">${employeeButtons || `<p>${t('noEmployees')}</p>`}</div>
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
