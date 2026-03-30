export function renderLoginPage(root, handlers) {
  root.innerHTML = `
    <div class="container grid" style="max-width: 480px; margin-top: 60px;">
      <div class="card">
        <h1>Pontaj Simplu</h1>
        <p class="muted">Aplicatie de pontaj pentru tableta, cu mod kiosk si admin.</p>
      </div>

      <div class="card">
        <h2>Intrare kiosk</h2>
        <p class="muted">Folosit pe tableta de la intrare.</p>
        <button class="btn btn-success" id="go-kiosk">Deschide Kiosk</button>
      </div>

      <div class="card">
        <h2>Intrare admin</h2>
        <div class="grid">
          <input class="input" id="admin-user" placeholder="Utilizator" value="admin" />
          <input class="input" id="admin-pass" placeholder="Parola" type="password" value="admin123" />
          <button class="btn btn-primary" id="go-admin">Login Admin</button>
          <p class="muted" id="error-box"></p>
        </div>
      </div>
    </div>
  `;

  root.querySelector("#go-kiosk").addEventListener("click", handlers.onGoKiosk);
  root.querySelector("#go-admin").addEventListener("click", () => {
    const username = root.querySelector("#admin-user").value;
    const password = root.querySelector("#admin-pass").value;
    handlers.onAdminLogin({ username, password });
  });
}
