import { t, getAvailableLanguages } from "../utils/i18n.js";

export function renderLoginPage(root, handlers) {
  const languages = getAvailableLanguages();
  const languageOptions = languages.map(lang => 
    `<option value="${lang.code}">${lang.name}</option>`
  ).join('');

  root.innerHTML = `
    <div class="container grid" style="max-width: 480px; margin-top: 60px;">
      <div class="card">
        <div class="toolbar">
          <h1>${t('appTitle')}</h1>
          <select id="language-select" class="input" style="width: auto;">
            ${languageOptions}
          </select>
        </div>
        <p class="muted">${t('appDescription')}</p>
      </div>

      <div class="card">
        <h2>${t('kioskEntry')}</h2>
        <p class="muted">${t('kioskDescription')}</p>
        <button class="btn btn-success" id="go-kiosk">${t('openKiosk')}</button>
      </div>

      <div class="card">
        <h2>${t('adminEntry')}</h2>
        <div class="grid">
          <input class="input" id="admin-user" placeholder="${t('username')}" value="admin" />
          <input class="input" id="admin-pass" placeholder="${t('password')}" type="password" value="admin123" />
          <button class="btn btn-primary" id="go-admin">${t('loginAdmin')}</button>
          <p class="muted" id="error-box"></p>
        </div>
      </div>
    </div>
  `;

  root.querySelector("#language-select").addEventListener("change", (e) => {
    handlers.onLanguageChange(e.target.value);
  });
  root.querySelector("#go-kiosk").addEventListener("click", handlers.onGoKiosk);
  root.querySelector("#go-admin").addEventListener("click", () => {
    const username = root.querySelector("#admin-user").value;
    const password = root.querySelector("#admin-pass").value;
    handlers.onAdminLogin({ username, password });
  });
}
