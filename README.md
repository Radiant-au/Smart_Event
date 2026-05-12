# Scanova — Event Card Management System

> A full-stack platform for creating, designing, and scanning event tickets. Organizers create card groups, generate barcode and QR ticket batches, design physical card layouts with a drag-and-drop editor, download print-ready ZIPs, and assign collaborators who scan tickets at the door.

---

## ✦ What This Is

Scanova has two sides: a **React dashboard** where event organizers manage everything, and a **Node.js API** that handles authentication, ticket generation, server-side image compositing, and scan validation.

Two ticket modes are supported: **Static** cards (barcode only, for standard entry) and **Gamify** cards (barcode + QR code, for roulette/prize mechanics at the event).

---

## ✦ User Flow

```
Register / Login
  ↓
Dashboard (stats: groups, batches, total cards, scanned cards)
  ↓
Create Card Group (event)
  ↓
Create Ticket Batch
  ├── Static  → barcode-only cards with price
  └── Gamify  → barcode + QR code (roulette/prize support)
        ↓
      Design Card Layout
        → Upload ticket image → drag barcode/QR placeholders → download ZIP
        ↓
      View Tickets (filter all/used/unused, inline barcodes)
        ↓
Scanner Page
  ├── Manual mode (keyboard-wedge scanner friendly)
  └── Camera mode (CODE128, EAN, UPC support)
        ↓
      Collaborator audit — see every ticket scanned by each team member
```

---

## ✦ Project Structure

```
scanova/
├── front/   # React + TypeScript dashboard
└── back/    # Node.js + Express + TypeORM API
```

---

## ✦ Frontend Highlights

### 🎨 Visual Ticket Layout Designer
- Upload a PNG/JPG ticket template, preview it on a `react-konva` canvas
- Drag and resize placeholder boxes for barcode (blue) and QR code (green) exactly where they should appear on the physical card
- Two modes: **Static** (barcode only) and **Dynamic** (barcode + QR)
- On save: uploads the template + coordinates to the backend which composites barcodes onto every ticket, and returns a downloadable ZIP

### 🔍 Barcode Scanner
- **Manual mode**: text input auto-focused on mount — plug in a USB barcode scanner and scan continuously without touching the keyboard
- **Camera mode**: `html5-qrcode` with `CODE128`, `CODE39`, `EAN-13`, `EAN-8`, `UPC-A`, `UPC-E` format support; stops and cleans up properly on mode switch or unmount
- Validation result shows a green/red alert and renders the barcode inline for visual confirmation
- Scanner is tied to a `userId` passed via React Router state so scans are attributed to the correct staff member

### 👥 Collaborator System
- Add collaborators to an event by email address
- Remove instantly (array filter, no refetch)
- Click "View" on any collaborator to audit all tickets they scanned, filterable by Normal/Gamify type

### 📊 Dashboard Stats
- Aggregates total groups, batches, cards generated, and cards scanned via two nested `Promise.all` calls — fully parallelised regardless of event count

### 🌙 Dark Mode
- `next-themes` with class strategy, persists across sessions

---

## ✦ Backend Highlights

### 🖼️ Server-Side Ticket Image Compositing
- `POST /api/batch/:id/download` accepts a multipart upload: one PNG/JPG template + barcode/QR position coordinates
- For each ticket in the batch, `generateTicketWithCode` runs a `sharp` pipeline:
  1. Generates a barcode buffer via `bwip-js` (CODE128)
  2. Resizes it to the submitted `barcodeWidth × barcodeHeight`
  3. For dynamic mode: generates a QR via `qrcode` library, resizes it
  4. Composites both onto the template at the submitted `x/y` coordinates
- All ticket PNGs are zipped via `jszip` and returned as a download

### ✅ Ticket Validation
- Validates scanner membership (creator or collaborator) before allowing a scan — non-members get `403`
- Rejects already-scanned tickets with `409`
- On success: marks ticket `used`, records which user scanned it

### 🎟️ Two Ticket Modes
- **Static**: sequential codes, barcode only, priced
- **Gamify**: UUID-based `qrToken` + `qrUrl` per ticket, linked `Roulette` with up to 8 prize sectors, `RouletteResult` audit table

### 🔐 Auth
- JWT with `{ userId, email }` payload
- Auth middleware does a live DB lookup — deleted accounts lose access immediately
- Password hashing via `bcrypt`

---

## ✦ Tech Stack

### Frontend (`front/`)

| | |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| UI | shadcn/ui (Radix UI) + TailwindCSS |
| Canvas | `react-konva` + `konva` |
| Barcodes | `react-barcode` |
| Camera Scan | `html5-qrcode` |
| HTTP | Axios with interceptors |
| Theme | `next-themes` |

### Backend (`back/`)

| | |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js |
| ORM | TypeORM |
| Database | MySQL |
| Auth | `jsonwebtoken` + `bcrypt` |
| Image Processing | `sharp` + `bwip-js` + `qrcode` |
| ZIP | `jszip` |
| File Upload | `multer` |

---

## ✦ Data Model

```
User ──────────────────────────────────────────────────────────
  id, name, email (unique), password (bcrypt)
  events[] (events they created)

Events ─────────────────────────────────────────────────────────
  id, name, code (3-char random), description, startDate, location
  creator → User
  collaborators → User[] (ManyToMany join table)
  ticketBatches → TicketBatch[]

TicketBatch ────────────────────────────────────────────────────
  id, name, price, dynamic: boolean
  event → Events
  tickets → Ticket[]
  roulette → Roulette (nullable, gamify only)

Ticket ─────────────────────────────────────────────────────────
  id, code (unique), status ("unused" | "used")
  batch → TicketBatch
  scanner → User (nullable — set on scan)
  qrToken?, qrUrl?, dynamicResult?

Roulette ────────────────────────────────────────────────────────
  sectors: string[] (JSON) — up to 8 prize labels
  batch → TicketBatch (OneToOne)

RouletteResult ──────────────────────────────────────────────────
  result: string, roulette → Roulette, ticket → Ticket
```

---

## ✦ API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login → JWT |
| `GET` | `/api/auth/me` | Current user + events |
| `POST` | `/api/auth/change-password` | Change password |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/event` | Create event |
| `POST` | `/api/event/add/:event` | Add collaborator by email |
| `POST` | `/api/event/remove/:user/:event` | Remove collaborator |
| `GET` | `/api/event/collaborators/:event` | List collaborators |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/batch/:id/static` | Create normal batch |
| `POST` | `/api/batch/:id/dynamic` | Create gamify batch |
| `POST` | `/api/batch/:id/roulette` | Configure roulette + assign QR tokens |
| `DELETE` | `/api/batch/:id` | Delete batch |
| `GET` | `/api/batch/event/:id` | Get batches for event |
| `POST` | `/api/batch/:id/download` | Upload template → download tickets ZIP |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ticket/validate` | Validate + mark used (records scanner) |
| `POST` | `/api/ticket/dynamic/:token` | Save roulette result |
| `GET` | `/api/ticket/count/:batchId` | Total / used / unused counts |
| `GET` | `/api/ticket/by-batch/:batchId` | All tickets in a batch |
| `GET` | `/api/ticket/scanned/:userId` | All tickets scanned by a user |

---

## ✦ Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8

### Clone

```bash
git clone https://github.com/your-username/scanova.git
cd scanova
```

### Backend Setup

```bash
cd back
npm install
```

Create `back/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=scanova

JWT_SECRET=your_super_secret_key
JWT_EXPIRE_MINUTES=60

PORT=9000
FRONTEND_URL=http://localhost:5173
DOMAIN=http://localhost:5173/
```

```bash
npm run dev
```

> On first run you can temporarily set `synchronize: true` in `data-source.ts` to create tables, then switch back to `false`.

### Frontend Setup

```bash
cd front
npm install
```

Create `front/.env`:

```env
VITE_API_BASE_URL=http://localhost:9000
```

```bash
npm run dev   # http://localhost:5173
```

---

## ✦ Key Decisions

**Konva for the layout designer** — HTML/CSS drag doesn't give reliable pixel coordinates relative to an uploaded image. Konva gives exact x/y/width/height after transform, which is sent directly to the backend as composite coordinates for `sharp`.

**`Promise.all` for dashboard stats** — A user with many events would need many sequential batch + count fetches. Two nested `Promise.all` calls parallelise the entire tree, keeping dashboard load time constant regardless of event count.

**Live DB lookup in auth middleware** — Deleted accounts lose access immediately instead of waiting for their JWT to expire.

**Separate `addroulette` and `addQrData`** — Roulette sectors can be reconfigured independently of QR token generation. `addroulette` calls `addQrData` internally, so from the frontend one call handles both.

**`inputRef.current?.focus()` after every scan** — The scanner page is designed for USB barcode scanners that act as keyboard input. Re-focusing the input after submit means the operator never has to touch the keyboard between scans.

---

## ✦ Roadmap

- [ ] Roulette configuration UI (sector input form)
- [ ] Real-time scan counter via WebSocket
- [ ] CSV export for ticket audit logs
- [ ] Cleanup cron job for `temp/` generated files
- [ ] S3/GCS for template image storage
- [ ] Offline scanner mode with sync queue (PWA + IndexedDB)
- [ ] Mobile-optimised scanner UI for phones at the door

---

## ✦ Author

Built by **[Your Name]**  
[Portfolio](https://your-portfolio.dev) · [LinkedIn](https://linkedin.com/in/yourhandle) · [GitHub](https://github.com/your-username)

---

<p align="center">
  <sub>Scanova — Event Card Management System</sub>
</p>
