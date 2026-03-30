import { t, getAvailableLanguages } from "../../utils/i18n.js";

export function renderLoginPage(root, handlers) {
  root.innerHTML = `
    <div class="container grid login-container">
      <div class="card welcome-card">
        <h1>${t('appTitle')}</h1>
        <p class="muted">${t('appDescription')}</p>
        <div class="language-toggle">
          <button class="btn language-btn ${getCurrentLanguage() === 'de' ? 'active' : ''}" data-lang="de">🇩🇪 Deutsch</button>
          <button class="btn language-btn ${getCurrentLanguage() === 'en' ? 'active' : ''}" data-lang="en">🇺🇸 English</button>
        </div>
      </div>

      <div class="card kiosk-card">
        <h2>${t('kioskEntry')}</h2>
        <p class="muted">${t('kioskDescription')}</p>
        <button class="btn btn-success btn-large" id="go-kiosk">${t('openKiosk')}</button>
      </div>

      <div class="card admin-card">
        <h2>${t('adminEntry')}</h2>
        <div class="admin-form">
          <input class="input input-large" id="admin-user" placeholder="${t('username')}" value="admin" />
          <input class="input input-large" id="admin-pass" placeholder="${t('password')}" type="password" value="admin123" />
          <button class="btn btn-primary btn-large" id="go-admin">${t('loginAdmin')}</button>
          <p class="error-message" id="error-box"></p>
        </div>
      </div>
    </div>
  `;

  // Language toggle handlers
  root.querySelectorAll('.language-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      handlers.onLanguageChange(lang);
    });
  });

  root.querySelector("#go-kiosk").addEventListener("click", handlers.onGoKiosk);
  root.querySelector("#go-admin").addEventListener("click", () => {
    const username = root.querySelector("#admin-user").value;
    const password = root.querySelector("#admin-pass").value;
    handlers.onAdminLogin({ username, password });
  });
}
