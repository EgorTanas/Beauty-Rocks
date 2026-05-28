# Ghid prezentare — Beauty Rocks (Frontend)

Document scurt ca să poți explica proiectul la profesoară **fără să intri în detalii tehnice grele**.

---

## 1. Ce face aplicația (30 secunde)

> *„Beauty Rocks e site-ul unui salon de înfrumusețare. Clienții se pot înregistra, văd serviciile și echipa, fac programări online, și își gestionează profilul. Adminul salonului gestionează serviciile, echipa și programările dintr-un panou separat.”*

**Tehnologii:** React (interfață), Vite (build rapid), Node.js + MongoDB (backend, folder `server/`).

---

## 2. Cum pornește aplicația

```
main.jsx  →  App.jsx  →  app/router.jsx  →  pages/Home.jsx (etc.)
```

1. **`main.jsx`** — pornește React în browser
2. **`App.jsx`** — înfășoară totul în autentificare (`AuthProvider`) + router
3. **`app/router.jsx`** — decide ce pagină vezi la fiecare URL (`/`, `/booking`, `/admin`…)
4. **`pages/`** — fiecare pagină e un ecran (Home, Services, Booking…)

---

## 3. Structura folderelor (ce spui la fiecare)

```
client/src/
├── app/           „Unde merg rutele” — /home, /login, /admin
├── lib/           „Legătura cu serverul” — API_BASE, fetch, imagini
├── pages/         „Ecranele” — câte un fișier = o pagină
├── components/    „Piese de UI” — butoane, secțiuni, formulare
├── data/          „Liste și constante” — categorii, pași booking
├── context/       „Cine e logat” — AuthContext
├── utils/         „Funcții ajutătoare” — booking API, profil
├── hooks/         „Logică reutilizabilă” — upload poze
├── constants/     „Adresă salon, rețele sociale”
└── style/         „CSS pe pagini”
```

### Analogie simplă

| Folder | Ca în viața reală |
|--------|-------------------|
| `pages/` | Camerele casei (bucătărie, dormitor) |
| `components/` | Mobilierul din fiecare cameră |
| `lib/` + `utils/` | Instalația (apă, curent) — legătura cu backend |
| `data/` | Catalogul cu prețuri tipărit (fallback) |
| `app/` | Harta — ce ușă duce unde |

---

## 4. Paginile importante (deschide-le când explici)

| URL | Fișier | Ce arăți |
|-----|--------|----------|
| `/` | `pages/Home.jsx` | Homepage — compune secțiuni (hero, servicii, echipă) |
| `/services` | `pages/Services.jsx` | Catalog servicii + filtre |
| `/booking` | `pages/Booking.jsx` | Rezervare în 4 pași |
| `/profile` | `pages/Profile.jsx` | Cont utilizator |
| `/admin` | `pages/AdminDashboard.jsx` | Panou admin |
| `/admin/services` | `pages/AdminServices.jsx` | Adaugă/editează servicii |
| `/login` | `pages/Auth.jsx` | Login / register |

---

## 5. Fluxuri pe care le poți demonstra live

### A) Utilizator normal
1. Intră pe homepage → servicii pin-uite de admin
2. Apasă „Book appointment” → trebuie logat
3. Alege serviciu → specialist → dată → confirmă
4. Vede programarea în Profile

### B) Admin
1. Login cu cont `admin`
2. `/admin/services` — creează serviciu, pin pe homepage (iconița casă)
3. `/admin/team` — adaugă membru + categorii servicii (ex: manicure)
4. `/admin/bookings` — vede și schimbă status programări

---

## 6. Unde sunt datele (frontend ↔ backend)

- **`lib/api.js`** — adresa serverului (`API_BASE`) + `apiFetch()` pentru toate cererile
- **`utils/bookingApi.js`** — programări: sloturi libere, creare appointment
- **`context/AuthContext.jsx`** — ține userul logat în memorie

Cereri tipice:
- `GET /api/services` — lista servicii
- `GET /api/team?service=ID` — specialiști pentru un serviciu
- `POST /api/appointments` — programare nouă

---

## 7. Componente pe zone

| Zonă | Folder | Exemple |
|------|--------|---------|
| Homepage | `components/sections/` | `HomeHero`, `ServicesSection`, `TeamSection` |
| Servicii | `components/services/` | `ServicesGrid`, `CategoriesBar` |
| Rezervare | `components/booking/` | `ServiceSelectionStep`, `DateTimeStep` |
| Profil | `components/profile/` | `ProfileBookingsTab`, `ProfileEditModal` |
| Admin | `components/admin/` | `AdminNav`, `BookingTable` |
| Peste tot | `components/common/` | `Navbar`, `Footer`, `UserAvatar` |

---

## 8. Denumiri importante (să nu te încurci)

| Nume | Unde | Ce e |
|------|------|------|
| `HomeHero` | sections | Banner mare pe homepage |
| `ServicesHero` | services | Banner pe pagina Servicii |
| `UserAvatar` | common | Poza/inițiale user în navbar |
| `AdminServiceCard` | admin | Card serviciu în panou admin |
| `API_BASE` | lib/api.js | URL backend (localhost sau Render) |

---

## 9. Propoziții gata de spus

**Despre structură:**
> *„Am organizat frontend-ul pe foldere: paginile sunt subțiri și doar aranjează componente. Logica de API e centralizată în `lib/`. Datele statice sunt în `data/`.”*

**Despre autentificare:**
> *„Folosim JWT în cookie-uri httpOnly. `AuthContext` știe dacă ești logat. Rutele protejate (`ProtectedRoute`) te trimit la login dacă nu ești autentificat.”*

**Despre booking:**
> *„Specialiștii sunt filtrați după categoria serviciului — adminul setează asta la fiecare membru al echipei.”*

**Despre admin:**
> *„Adminul CRUD servicii și echipă. Poate pin-ui servicii pe homepage. Programările se văd și se actualizează din `/admin/bookings`.”*

---

## 10. Comenzi pentru demo

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
# → http://localhost:5173
```

---

## 11. Dacă te întreabă ceva greu

| Întrebare | Răspuns scurt |
|-----------|---------------|
| De ce React? | Componente reutilizabile, ecosistem mare, potrivit pentru SPA |
| Unde e baza de date? | MongoDB, modele în `server/src/models/` |
| Cum e securizat? | JWT, bcrypt parolă, rute admin verificate pe rol |
| Responsive? | Da — CSS în `style/responsive.css` + Tailwind |
| Deploy? | Frontend Vercel, backend Render |

---

*Document companion: `STRUCTURA-FRONTEND.md` (detalii tehnice)*
