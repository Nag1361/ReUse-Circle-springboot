# ReUseCircle — Give Away & Reuse Board

A simple college project for giving usable items away for free. Built with Spring Boot, MySQL and React. No OAuth2, moderators, paid services, or file uploads.

## Start here

You need **JDK 17 or 21**, **MySQL 8+**, an internet connection on first use, and a recent browser. **Do not install Maven, Node.js or npm globally.** The included wrappers download and reuse their tools automatically.

On macOS and Linux, use the built-in Bash plus curl (or wget), tar, and shasum (or sha256sum). macOS already includes these. Windows uses built-in PowerShell 5.1+.

- Backend: official Maven Wrapper (`backend/mvnw` and `mvnw.cmd`), pinned to Maven 3.9.11. Maven is cached in your user Maven cache; it is not globally installed.
- Frontend: project-local `frontend/nodew` and `frontend/npmw` (plus `.cmd` versions), pinned to Node 22.23.5 with bundled npm. Downloads are checksum-verified and cached in `.tools/` within this project. Supports macOS/Linux x64 and ARM64, and Windows x64/ARM64.
- First run downloads tools and application dependencies, so it can take a few minutes. Later runs reuse the downloaded tools. The frontend launcher runs `npm ci` each time to keep dependencies aligned with the lockfile; registry access may still be needed. No administrator permissions, Homebrew, or permanent PATH changes are required.

Unzip the project, open the extracted project folder in your editor, then follow these steps. The backend and frontend run in **two separate terminal windows**.

### 1. Create the database

Open MySQL Workbench, or run `mysql -u root -p`, then execute:

```sql
CREATE DATABASE IF NOT EXISTS reusecircle_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Spring Boot creates the three tables on startup. `database/schema.sql` is also included as a readable reference and optional way to create the tables yourself. There is no preloaded data: register users and create listings through the application.

### 2. Configure and run the backend

From the project root:

```bash
cd backend
cp application-local.properties.example application-local.properties
```

On Windows, copy and rename the file in your editor or File Explorer. Open `application-local.properties` and replace the username and password with your local MySQL credentials. Generate your own JWT signing secret:

```bash
openssl rand -base64 32
```

Paste the output as the value of `app.jwt.secret`. On Windows without OpenSSL, run PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

The example contains placeholders, not working secrets. Do not publish your local configuration. It is already excluded by `.gitignore`.

Run **from inside `backend/`**, so Spring can find the local properties file:

```bash
sh ./mvnw spring-boot:run
```

Or use the launcher **from the project root**:

```bash
bash run-backend.sh
```

On Windows Command Prompt, from the root, use `run-backend.cmd` (or from `backend/`, use `mvnw.cmd spring-boot:run`).

Backend: `http://localhost:8080`. Public listings API: `http://localhost:8080/api/listings`.

Alternative: set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` as environment variables and omit the local properties file. Spring Boot does **not** automatically load a backend `.env` file; the local properties approach is simpler here.

### 3. Configure and run the frontend

In a **second terminal**, from the project root:

```bash
cd frontend
cp .env.example .env
bash ./npmw ci
bash ./npmw run dev
```

Or use the launcher **from the project root**, which creates `.env` if needed and installs frontend dependencies:

```bash
bash run-frontend.sh
```

On Windows Command Prompt, from the root, use `run-frontend.cmd`. The individual Windows wrapper commands inside `frontend/` are `npmw.cmd ci`, `npmw.cmd run dev`, and `npmw.cmd run build`.

Open **`http://localhost:5173`**. Keep both terminals running. The frontend `.env` contains only the public API URL; it must never contain your database password or JWT signing secret.

Register an owner account and create a listing. Use a different browser or a private window for a requester account. Each browser tab stores its own login session. Tokens expire after 24 hours; log in again when needed.

### Optional build commands

```bash
# Inside backend/
sh ./mvnw -DskipTests package
java -jar target/reusecircle-1.0.0.jar

# Inside frontend/
bash ./npmw run build
```

Run the JAR from `backend/` to load `application-local.properties`. Vite outputs the frontend to `frontend/dist/`. The supplied CORS configuration allows `http://localhost:5173`; a different frontend origin needs a matching CORS change. Serving the frontend elsewhere also requires history fallback to `index.html` for React Router.

## Project structure

```text
ReUseCircle/
  run-backend.sh / run-backend.cmd
  run-frontend.sh / run-frontend.cmd
  tools/               Local Node download and checksum verification
  backend/
    mvnw / mvnw.cmd    Official Maven Wrapper
    .mvn/wrapper/maven-wrapper.properties
    pom.xml
    application-local.properties.example
    src/main/java/com/reusecircle/
      ReusecircleApplication.java
      controller/    HTTP endpoints and JSON error responses
      service/       Business rules and transactions
      repository/    JPA queries and row locks
      entity/        User, Listing, ItemRequest and status enums
      dto/           Validated inputs and safe responses
      security/      JWT creation, verification and Spring Security
    src/main/resources/application.properties
  frontend/
    nodew / nodew.cmd  Local Node wrapper
    npmw / npmw.cmd    Local npm wrapper
    package.json
    package-lock.json
    .env.example
    index.html
    vite.config.js
    src/
      App.jsx        Routes, navbar and login state
      api.js         Fetch wrapper, API URL and session helpers
      main.jsx
      options.js     Category and condition dropdown options
      styles.css
      components/    Card, image and message components
      pages/         Browse, auth, details, form, listings and requests
  database/schema.sql
  docs/API.md
  docs/MANUAL_CHECKLIST.md
  docs/PROJECT_REVIEW.md
  .gitignore
```

## Application rules

- Visitors browse listings and details. Login is required to give items or request them.
- The JWT identifies a database user. Listing ownership always comes from the authenticated user, never from form data.
- Listing lifecycle: `AVAILABLE → RESERVED → COLLECTED`. There is no manual status field on create/edit forms.
- An owner can edit an available listing and delete any of their own listings. Deletion also removes its requests and their history. Reserved/collected listings cannot be edited.
- A requester cannot request their own item, request an unavailable item, or request the same listing twice, including after a decline.
- Only pending requests can be accepted or declined. Accepting reserves the listing and declines all other pending requests in the same transaction.
- A reserved item can be marked collected only by its owner. The accepted request stays `ACCEPTED`; the listing becomes `COLLECTED`.
- Request creation, acceptance, editing, collection and deletion lock the same listing row. MySQL InnoDB transactions serialize competing actions, so there can be only one accepted requester.
- Email addresses are stored in lowercase and have a database uniqueness constraint. Passwords use BCrypt and never appear in responses.
- Images are optional public HTTP/HTTPS URLs, loaded by the browser. There are no uploads or cloud storage. Missing/broken images display a CSS placeholder.
- Category and condition are simple text fields; the frontend provides standard dropdown choices. API clients may use custom values within the length limits.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Backend cannot connect to MySQL | Start MySQL; check database name, username, password and port. For port 3307, update the JDBC URL. |
| Missing `DB_USERNAME` or `JWT_SECRET` | Run from `backend/` and check that the copied file is named `application-local.properties`, not `.example` or `.txt`. |
| JWT key error at startup | Generate a Base64 secret from at least 32 random bytes; replace the placeholder. |
| Port 8080 already in use | Stop the old backend, or add `server.port=8081` locally and change `VITE_API_URL` to match. Restart Vite after `.env` changes. |
| Port 5173 already in use | Stop the previous Vite process. This project uses a strict port so CORS remains consistent. |
| Cannot reach server | Ensure the backend started successfully and the API URL in `frontend/.env` matches. |
| Maven or Node command missing | Use the included `mvnw` / `npmw` wrappers or root launch scripts. Global Maven/Node/npm commands are not needed. |
| Permission denied when executing a wrapper | Use `bash run-backend.sh`, `bash run-frontend.sh`, `sh ./mvnw`, or `bash ./npmw` as shown above. |
| Tool download fails | Check internet/proxy access to repo.maven.apache.org, nodejs.org and registry.npmjs.org, then retry. |
| Node download lock after an interrupted run | Make sure no other launcher is downloading Node; delete only the named `.tools/node-v*.lock` directory and retry. |
| Editor shows missing Lombok methods | Enable annotation processing and install your editor's Lombok support if needed. Maven builds process Lombok automatically. |
| Unauthorized / expired session | Log in again. Altering a token or user ID cannot grant backend ownership. |

## Documentation

- [API routes and sample JSON](docs/API.md)
- [Manual review checklist](docs/MANUAL_CHECKLIST.md)
- [Beginner project explanation](docs/PROJECT_REVIEW.md)

Automated tests are intentionally not included, as requested. See `docs/BUILD_NOTES.md` for the exact build verification performed on the delivered package.
