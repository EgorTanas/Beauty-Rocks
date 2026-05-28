# Date statice (fallback + configurări UI)

Aici sunt **datele care nu vin direct de la API** — categorii, texte demo, imagini fallback.

| Fișier | Conține |
|--------|---------|
| `servicesData.js` | Categorii servicii, filtre, mapare API → card |
| `homeData.js` | Galerie homepage, preview echipă |
| `teamData.js` | Echipă fallback când API nu răspunde |
| `bookingData.js` | Pașii rezervării, formatare dată, mapare servicii |
| `bookingAdminData.js` | Programări demo pentru admin (offline) |

**Regulă:** componentele UI (`components/`) afișează; `data/` ține listele și constantele.
