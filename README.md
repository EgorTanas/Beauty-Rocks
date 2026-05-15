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
├── client/     # Aplicația frontend React (Vite)
└── server/     # API backend Node.js (Express)
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

Backend-ul expune următoarele endpoint-uri de autentificare sub prefixul `/api/auth`:

| Metodă | Endpoint                 | Descriere                                  |
| :----- | :----------------------- | :----------------------------------------- |
| `POST` | `/register`              | Creează un cont nou de utilizator.         |
| `POST` | `/login`                 | Autentifică un utilizator și emite JWT-uri.|
| `POST` | `/logout`                | Deconectează și șterge cookie-urile de sesiune. |
| `GET`  | `/me`                    | Obține profilul utilizatorului autentificat.|
| `POST` | `/refresh`               | Emite un nou token de acces folosind un token de refresh. |
| `POST` | `/forgot-password`       | Trimite un link de resetare a parolei la email-ul utilizatorului. |
| `POST` | `/reset-password`        | Resetează parola folosind un token valid.  |
| `GET`  | `/verify-email`          | Verifică adresa de email a utilizatorului. |
| `GET`  | `/google`                | Inițiază fluxul de autentificare Google OAuth 2.0. |
| `GET`  | `/google/callback`       | Gestionează callback-ul de la Google OAuth.|
