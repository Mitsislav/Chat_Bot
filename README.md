# Chatbot (Node + React + MongoDB + Gemini)

A minimal full‑stack chat app with:

- **Backend:** Node.js (Express), Socket.IO (optional), MongoDB (Mongoose)
- **LLM:** Google **Gemini 1.5 Flash** via REST API
- **Frontend:** React (Vite/CRA style `npm start`), simple chat UI with threads & rename

> The app lets a user create chat threads, send questions, receive AI answers, and keep a per‑user chat history in MongoDB.

---

## Demo (Local)

```bash
# Terminal A — server
npm install
cp .env.example .env   # then edit values
npm start

# Terminal B — client
cd client
npm install
npm start
```

By default the API runs on [**http://localhost:5000**](http://localhost:5000) and the React app on [**http://localhost:3000**](http://localhost:3000) (or the next free port).

---

## Folder Structure

```
chatbot/
├─ server.js            # Express + Socket.IO + Mongoose + Gemini integration
├─ package.json         # server scripts and deps
├─ .env                 # environment variables (create from example)
└─ client/              # React app (UI)
   ├─ src/
   │  ├─ App.jsx
   │  ├─ ChatSideBar/
   │  │  ├─ ChatSideBar.jsx
   │  │  └─ ChatSideBar.module.css
   │  ├─ ChatMessages/
   │  │  ├─ ChatMessages.jsx
   │  │  └─ ChatMessages.module.css
   │  └─ App.css
   └─ package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** (local or Atlas). You’ll need a connection string.
- **Gemini API key** from Google AI Studio

---

## Environment Variables

Create a `.env` file **in the project root** (same folder as `server.js`).

### Required

- `MONGO_URI` — MongoDB connection string
- `GEMINI_API_KEY` — Google Gemini API key

### Optional

- `PORT` — API port (default `5000`)

### Example

```env
# .env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
PORT=5000
```

> **Heads‑up:** The frontend points to `http://localhost:5000/api` inside `src/App.jsx` (`API_URL`). If you change `PORT` or host, update this constant accordingly.

---

## Install & Run

### 1) Backend (server)

```bash
# from project root
npm install
npm start
```

Expected log:

```
MongoDB connected!
Server running on port 5000
```

### 2) Frontend (client)

```bash
cd client
npm install
npm start
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

---

## Usage Notes

- The demo UI currently uses a fixed username in `App.jsx`:

  ```js
  const USERNAME = "giannis";
  ```

  Change this to your own identifier or wire it to a real auth system.

- API base is defined in `App.jsx`:

  ```js
  const API_URL = "http://localhost:5000/api";
  ```

  Modify if you deploy the server elsewhere.

---

## API Endpoints

Base URL: `http://<HOST>:<PORT>/api`

### Create a new chat

`POST /chats`

```json
{
  "user": "giannis",
  "title": "Optional title"
}
```

**Response:** the created chat document.

### Get all chats for a user

`GET /chats/:user`

**Response:** an array of chat objects (sorted by `createdAt` desc).

### Get a chat by id

`GET /chats/id/:chatId`

**Response:** the chat object or `404` if not found.

### Add a message to a chat

`POST /chats/:chatId/message`

```json
{
  "question": "Your question here",
  "answer": "(optional) If omitted, server calls Gemini"
}
```

**Response:** `{ question, answer }`

### Rename a chat

`PATCH /chats/:chatId/title`

```json
{ "title": "New title" }
```

**Response:** `{ "success": true }`

---

## Technology Overview

- **Express** for REST API
- **Mongoose** for MongoDB models and connection
- **Socket.IO** wired for future real‑time events (connection log only by default)
- **Axios** server‑side to call Gemini API
- **CORS** enabled for local development (`origin: '*'`)

---

## Common Issues & Fixes

### 1) `MongoDB error: ...` or hangs on connect

- Verify `MONGO_URI` in `.env` is correct and the database is reachable.
- For MongoDB Atlas, allow your IP and ensure the username/password and database name are correct.

### 2) CORS / Network errors in the browser

- Ensure the server is running on the same host/port as `API_URL` in `App.jsx`.
- If you changed server `PORT`, update `API_URL` accordingly.

### 3) Gemini errors or empty responses

- Check `GEMINI_API_KEY` is valid and has quota.
- The server returns a friendly fallback message if the API fails.

### 4) Port already in use

- Change `PORT` in `.env` or free the port.

---

## Production Tips (Brief)

- Serve the built React app from a static host (e.g., Vercel, Netlify) and deploy the API separately (e.g., Render, Railway, Fly.io, VPS).
- Set environment variables on the server host (never commit `.env`).
- Replace hardcoded `API_URL` with an environment‑based config.
- Add basic auth/session and per‑user scoping beyond the demo `USERNAME` constant.

---

## Scripts

**Root (server)**

```json
{
  "start": "node server.js"
}
```

**client/**

```json
{
  "start": "react-scripts start"
}
```

*(The exact client tooling may vary; adjust scripts as needed.)*

---

## Security Notes

- Do **not** commit your real `.env`.
- Lock down CORS in production (replace `'*'` with your domain).
- Validate inputs on all endpoints before going public.

---

## License

MIT — feel free to use and adapt.

---

## Acknowledgements

- Google AI Studio (Gemini 1.5 Flash)
- React, Express, Mongoose, Socket.IO

