import { t } from "../../utils/i18n.js";

export function renderKioskPage(root, model, handlers) {
  const employeeButtons = model.employees
    .map((employee) => {
      const status = model.getStatus(employee.id);
      const className = status === "IN" ? "status-on" : "status-off";
      const statusText = status === "IN" ? t('atWork') : t('away');
      const statusIcon = status === "IN" ? "✅" : "⏸️";
      return `
      <button class="btn employee-btn ${className}" data-employee-id="${employee.id}">
        <div class="employee-info">
          <div class="employee-name">${employee.name}</div>
          <div class="employee-status">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
          </div>
        </div>
      </button>`;
    })
    .join("");

  root.innerHTML = `
    <div class="container kiosk-container">
      <div class="kiosk-header">
        <div class="kiosk-title">
          <h1>${t('kioskMode')}</h1>
          <p class="kiosk-subtitle">${t('tapForEntry')}</p>
        </div>
        <div class="kiosk-controls">
          <button class="btn btn-secondary" id="back-home">${t('back')}</button>
          <button class="btn btn-primary" id="go-admin">${t('admin')}</button>
        </div>
      </div>
      
      <div class="kiosk-message ${model.message ? 'visible' : ''}" id="kiosk-message">
        ${model.message || ''}
      </div>
      
      <div class="kiosk-employees">
        <div class="kiosk-grid">
          ${employeeButtons || `<div class="no-employees"><p>${t('noEmployees')}</p></div>`}
        </div>
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
