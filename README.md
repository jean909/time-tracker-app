# Pontaj Simplu (Admin + Kiosk)

Aplicatie web simpla pentru pontaj pe tableta:
- `kiosk`: apesi pe nume pentru intrare/iesire/revenire
- `admin`: gestiune angajati + vizualizare ore si evenimente

## Rulare rapida

1. Deschide folderul proiectului.
2. Porneste un server static (exemplu):
   - `npx serve .`
3. Deschide `http://localhost:3000` (sau portul afisat in terminal).

## Login

- Admin implicit:
  - user: `admin`
  - parola: `admin123`

## Structura

- `src/app.js` - routing simplu intre ecrane
- `src/state/store.js` - persistenta localStorage + logica pontaj
- `src/pages/login/page.js` - pagina login
- `src/pages/kiosk/page.js` - pagina kiosk
- `src/pages/admin/page.js` - pagina admin
- `src/utils/time.js` - utilitare data/ore
