# Beauty-Rocks

Beauty Rocks este o aplicație web full-stack pentru un salon de înfrumusețare modern, care permite clienților să se înregistreze, să gestioneze profilurile lor și să programeze întâlniri online. Aplicația dispune de un frontend responsiv și animat, precum și de un API backend securizat, oferind o experiență de utilizator fără probleme.

## Funcționalități

-   **Sistem Complet de Autentificare**:
	-   Înregistrare locală a utilizatorilor cu verificare prin email.
	-   Autentificare securizată cu email și parolă.
	-   Funcționalitate de resetare a parolei trimisă prin email.
	-   Google OAuth 2.0 pentru autentificare rapidă și ușoară.
-   **Gestionare Securizată a Sesiunilor**:
	-   Utilizează JSON Web Tokens (JWT) cu token-uri de acces și refresh.
	-   Token-urile sunt stocate în cookie-uri securizate, `httpOnly` pentru protecție împotriva atacurilor XSS.
-   **Gestionarea Profilului Utilizatorului**:
	-   Utilizatorii autentificați pot vizualiza și actualiza informațiile profilului lor.
	-   Încărcarea și ștergerea avatarului de profil.
	-   Schimbarea parolei și ștergerea contului.
	-   Gestionarea serviciilor favorite.
-   **Sistem de Programări**:
	-   Flux de rezervare în mai mulți pași (serviciu → specialist → dată/oră → confirmare).
	-   Verificare în timp real a sloturilor disponibile în funcție de programul specialistului.
	-   Istoricul programărilor și posibilitatea de anulare.
-   **Panou de Administrare**:
	-   Gestionarea completă a serviciilor (creare, editare, ștergere, activare/dezactivare).
	-   Gestionarea echipei (adăugare membri, program de lucru, zile libere).
	-   Gestionarea și monitorizarea tuturor programărilor.
-   **Frontend Dinamic**:
	-   Construit cu React și Vite pentru o experiență de utilizator rapidă și modernă.
	-   Stilizat cu Tailwind CSS pentru un design curat și responsiv.
	-   Interfață atractivă cu tranziții fluide între pagini și animații realizate cu Framer Motion.
-   **API Backend RESTful**:
	-   Construit cu Node.js, Express și Mongoose.
	-   Oferă endpoint-uri clare și securizate pentru autentificare și gestionarea utilizatorilor.

## Stiva Tehnologică

### Frontend

-   **Framework**: [React](https://reactjs.org/)
-   **Instrument de Build**: [Vite](https://vitejs.dev/)
-   **Rutare**: [React Router](https://reactrouter.com/)
-   **Stilizare**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animație**: [Framer Motion](https://www.framer.com/motion/)
-   **Iconițe**: [Lucide React](https://lucide.dev/)

### Backend

-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Bază de Date**: [MongoDB](https://www.mongodb.com/) cu [Mongoose](https://mongoosejs.com/)
-   **Autentificare**: [Passport.js](http://www.passportjs.org/) (pentru Google OAuth), [JWT](https://jwt.io/), [Bcrypt.js](https://github.com/kelektiv/bcrypt.js)
-   **Email**: [Nodemailer](https://nodemailer.com/)

## Structura Proiectului

Repository-ul este organizat într-o structură monorepo cu două pachete principale:

```
/
├── client/                         # Aplicația frontend React (Vite)
│   ├── public/
│   │   ├── img/                    # Imagini pentru autentificare și logo
│   │   └── imgHome/                # Imagini pentru pagina principală
│   └── src/
│       ├── app/                    # Router + route guards (ProtectedRoute, AdminRoute)
│       ├── lib/                    # API_BASE, apiFetch, resolveUploadUrl
│       ├── components/
│       │   ├── admin/              # Componente panou de administrare
│       │   │   └── bookings/       # Componente gestionare programări admin
│       │   ├── booking/            # Componente flux de rezervare
│       │   ├── common/             # Navbar, Footer, UserAvatar, butoane
│       │   ├── profile/            # Componente pagina de profil
│       │   ├── sections/           # Secțiuni homepage (HomeHero, Services, Team…)
│       │   ├── services/           # Componente pagina servicii
│       │   └── team/               # Componente pagina echipă
│       ├── constants/              # Constante globale (linkuri sociale, locație)
│       ├── context/                # Context React (AuthContext)
│       ├── docs/                   # STRUCTURA-FRONTEND.md — ghid pentru prezentare
│       ├── hooks/                  # Hook-uri personalizate
│       ├── pages/                  # Paginile aplicației (thin composers)
│       ├── style/                  # CSS pe pagină / secțiune
│       └── utils/                  # Helpers pe domeniu (booking, profile, categorii)
└── server/                         # API backend Node.js (Express)
	└── src/
		├── config/                 # Configurare DB și Passport
		├── controllers/            # Logica de business pentru fiecare resursă
		├── middleware/             # Middleware autentificare și upload
		├── models/                 # Modele Mongoose (User, Service, TeamMember, Appointment)
		├── routes/
		│   ├── admin/              # Rute protejate pentru admin
		│   └── ...                 # Rute publice și protejate
		└── utils/                  # Utilitare (email, JWT)
```

## Începerea Lucrului

### Cerințe Preliminare

-   Node.js (v20.x sau mai recent)
-   npm sau yarn
-   O instanță de bază de date MongoDB (locală sau cloud precum MongoDB Atlas)
-   O aplicație Google OAuth configurată pentru autentificare Google
-   Un server SMTP pentru trimiterea de email-uri

### Instalare

1.  **Clonați repository-ul:**
	```sh
	git clone https://github.com/egortanas/beauty-rocks.git
	cd beauty-rocks
	```

2.  **Configurați backend-ul:**
	-   Navigați către directorul server:
		```sh
		cd server
		```
	-   Instalați dependențele:
		```sh
		npm install
		```
	-   Creați un fișier `.env` și adăugați variabilele de mediu necesare (vezi secțiunea [Configurare](#configurare)).
	-   Porniți serverul de dezvoltare:
		```sh
		npm run dev
		```
	-   Backend-ul va rula pe `http://localhost:5000` (sau portul specificat în fișierul `.env`).

3.  **Configurați frontend-ul:**
	-   Navigați către directorul client din rădăcină:
		```sh
		cd client
		```
	-   Instalați dependențele:
		```sh
		npm install
		```
	-   Porniți serverul de dezvoltare:
		```sh
		npm run dev
		```
	-   Frontend-ul va rula pe `http://localhost:5173`.

### Configurare

Creați un fișier `.env` în directorul `server` și configurați următoarele variabile:

```env
# Configurare Server
PORT=5000
NODE_ENV=development

# Conexiune MongoDB
MONGO_URI=<string_de_conexiune_mongodb>

# Secrete JWT
JWT_ACCESS_SECRET=<secret_puternic_de_acces>
JWT_REFRESH_SECRET=<secret_puternic_de_refresh>

# Credențiale Google OAuth
GOOGLE_CLIENT_ID=<id_client_google>
GOOGLE_CLIENT_SECRET=<secret_client_google>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# URL Client pentru redirecționări
CLIENT_URL=http://localhost:5173

# Configurare Email SMTP (folosind Nodemailer)
SMTP_HOST=<host_smtp>
SMTP_PORT=<port_smtp>
SMTP_SECURE=false # true pentru portul 465, false pentru altele
SMTP_USER=<nume_utilizator_smtp>
SMTP_PASS=<parolă_smtp>
EMAIL_FROM_NAME="Beauty Rocks"
EMAIL_FROM_ADDRESS=<adresă_email_expeditor>
```

## Endpoint-uri API

### Autentificare — `/api/auth`

| Metodă | Endpoint                 | Descriere                                           | Acces  |
| :----- | :----------------------- | :-------------------------------------------------- | :----- |
| `POST` | `/register`              | Creează un cont nou de utilizator.                  | Public |
| `POST` | `/login`                 | Autentifică un utilizator și emite JWT-uri.         | Public |
| `POST` | `/logout`                | Deconectează și șterge cookie-urile de sesiune.     | Public |
| `GET`  | `/me`                    | Obține profilul utilizatorului autentificat.        | Public |
| `POST` | `/refresh`               | Emite un nou token de acces folosind un token de refresh. | Public |
| `POST` | `/forgot-password`       | Trimite un link de resetare a parolei la email-ul utilizatorului. | Public |
| `POST` | `/reset-password`        | Resetează parola folosind un token valid.           | Public |
| `GET`  | `/verify-email`          | Verifică adresa de email a utilizatorului.          | Public |
| `GET`  | `/google`                | Inițiază fluxul de autentificare Google OAuth 2.0.  | Public |
| `GET`  | `/google/callback`       | Gestionează callback-ul de la Google OAuth.         | Public |

### Utilizator — `/api/user`

Toate endpoint-urile necesită autentificare (JWT).

| Metodă   | Endpoint                    | Descriere                                          |
| :------- | :-------------------------- | :------------------------------------------------- |
| `GET`    | `/profile`                  | Obține datele profilului utilizatorului curent.    |
| `PATCH`  | `/profile`                  | Actualizează informațiile profilului.              |
| `POST`   | `/avatar`                   | Încarcă un avatar nou de profil.                   |
| `DELETE` | `/avatar`                   | Șterge avatarul de profil.                         |
| `GET`    | `/appointments`             | Obține lista programărilor utilizatorului.         |
| `GET`    | `/appointments/stats`       | Obține statistici despre programările utilizatorului. |
| `PATCH`  | `/password`                 | Schimbă parola contului.                           |
| `DELETE` | `/account`                  | Șterge permanent contul utilizatorului.            |
| `GET`    | `/favorites`                | Obține lista serviciilor favorite.                 |
| `POST`   | `/favorites`                | Adaugă un serviciu la favorite.                    |
| `DELETE` | `/favorites/:serviceId`     | Elimină un serviciu din favorite.                  |

### Servicii — `/api/services`

| Metodă | Endpoint  | Descriere                              | Acces  |
| :----- | :-------- | :------------------------------------- | :----- |
| `GET`  | `/`       | Obține lista serviciilor active.       | Public |
| `GET`  | `/:id`    | Obține detaliile unui serviciu.        | Public |

### Echipă — `/api/team`

| Metodă | Endpoint                   | Descriere                                               | Acces  |
| :----- | :------------------------- | :------------------------------------------------------ | :----- |
| `GET`  | `/`                        | Obține lista membrilor activi ai echipei.               | Public |
| `GET`  | `/:id`                     | Obține detaliile unui membru al echipei.                | Public |
| `GET`  | `/:id/availability/:date`  | Verifică disponibilitatea unui specialist la o dată.    | Public |

### Programări — `/api/appointments`

| Metodă  | Endpoint             | Descriere                                              | Acces          |
| :------ | :------------------- | :----------------------------------------------------- | :------------- |
| `GET`   | `/available-slots`   | Obține sloturile disponibile (parametri: `worker`, `date`, `service`). | Public  |
| `GET`   | `/`                  | Obține programările utilizatorului autentificat.       | Autentificat   |
| `POST`  | `/`                  | Creează o programare nouă.                             | Autentificat   |
| `GET`   | `/:id`               | Obține detaliile unei programări.                      | Autentificat   |
| `PATCH` | `/:id/cancel`        | Anulează o programare existentă.                       | Autentificat   |

### Admin — `/api/admin`

Toate endpoint-urile necesită autentificare și rol de `admin`.

#### Servicii Admin — `/api/admin/services`

| Metodă   | Endpoint            | Descriere                                    |
| :------- | :------------------ | :------------------------------------------- |
| `GET`    | `/`                 | Obține toate serviciile (inclusiv inactive). |
| `POST`   | `/`                 | Creează un serviciu nou.                     |
| `POST`   | `/upload-image`     | Încarcă o imagine pentru un serviciu.        |
| `PUT`    | `/:id`              | Actualizează un serviciu existent.           |
| `DELETE` | `/:id`              | Șterge definitiv un serviciu.                |
| `PATCH`  | `/:id/toggle`       | Activează sau dezactivează un serviciu.      |

#### Echipă Admin — `/api/admin/team`

| Metodă   | Endpoint            | Descriere                                          |
| :------- | :------------------ | :------------------------------------------------- |
| `GET`    | `/`                 | Obține toți membrii echipei (inclusiv inactivi).   |
| `POST`   | `/`                 | Adaugă un membru nou în echipă.                    |
| `POST`   | `/upload-image`     | Încarcă un avatar pentru un membru al echipei.     |
| `PUT`    | `/:id`              | Actualizează datele unui membru al echipei.        |
| `DELETE` | `/:id`              | Șterge un membru al echipei.                       |
| `PATCH`  | `/:id/toggle`       | Activează sau dezactivează un membru al echipei.   |

#### Programări Admin — `/api/admin/appointments`

| Metodă   | Endpoint          | Descriere                                               |
| :------- | :---------------- | :------------------------------------------------------ |
| `GET`    | `/`               | Obține toate programările (cu filtrare și paginare).    |
| `POST`   | `/`               | Creează o programare din panoul de admin.               |
| `PATCH`  | `/:id/status`     | Actualizează statusul unei programări.                  |
| `PUT`    | `/:id`            | Reprogramează o programare existentă.                   |
| `DELETE` | `/:id`            | Șterge definitiv o programare.                          |
