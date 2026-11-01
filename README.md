# 🖨️ SRM ART PRINTS · Printing Cost Estimator

An internal web tool for [SRM ART PRINTS](https://srmartprints.in) that turns the shop's manual
estimation maths into a fast, repeatable workflow: answer seven quick questions about the print
job, watch the cost update live, and hand the customer a clean quotation — printed on paper or
sent straight to their WhatsApp.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149ECA) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Live estimate form** — the seven questions every job starts with: pieces per sheet, total
  pieces wanted, single/double side, sheet rates, cutting, creasing and lamination. Totals
  recalculate on every keystroke, before anything is saved.
- **Automatic rate selection** — pick the printing type and the app applies the matching sheet
  rate automatically (single-side or double-side). The double-side rate is entered manually, so
  pricing stays exactly the way the shop decides it — no hidden margin logic.
- **Flexible processing charges** — cutting and creasing can each be priced as an *overall*
  amount, *per piece*, or *per sheet*; lamination as *overall* or *per sheet*.
- **Quotation preview & print** — a branded quotation document with a running quote number
  (SRM-0001, SRM-0002 …) that opens the browser's print dialog, so it can be printed or saved
  as PDF in one step.
- **WhatsApp sharing** — one tap opens `wa.me` with the full estimate pre-filled as a ready-to-
  send text message to the customer's number (10-digit Indian numbers get the +91 code added
  automatically).
- **Quotation history** — every saved quotation can be viewed, edited, deleted or duplicated
  into a new estimate. Totals are always recomputed server-side on save, so the stored numbers
  are trustworthy.
- **Saved rate presets** — store frequently used pricing combinations (e.g. "Visiting cards
  standard") and load them into the form with a single tap.
- **Indian-localised formatting** — ₹ currency with en-IN digit grouping and `dd MMM yyyy`
  dates throughout the app and on the printed quotation.

## 🧮 How the pricing works

| Step | Rule |
| --- | --- |
| Sheets needed | `ceil(total pieces ÷ pieces per sheet)` |
| Printing cost | `sheets × sheet rate` — rate auto-selected from single/double side |
| Cutting / creasing | overall price, or `price × total pieces`, or `price × sheets` |
| Lamination | overall price, or `price × sheets` (only when enabled) |
| **Grand total** | printing + cutting + creasing + lamination |

The same calculation engine (`src/lib/calc.ts`) runs on the client for the live preview and on
the server as the source of truth whenever a quotation is saved or updated.

## 🛠️ Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, Tailwind CSS 4, shadcn/ui components, lucide-react icons, sonner toasts |
| Language | TypeScript (strict mode) |
| Database | SQLite via Prisma ORM |
| Runtime | Bun (Node.js 20+ works too) |

## 🚀 Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.2+ (or Node.js 20+ with npm/pnpm)

### 1. Clone and install

```bash
git clone https://github.com/kamalesh0769/srm-estim.git
cd srm-estim
bun install        # or: npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

The default uses a local SQLite file created at `prisma/dev.db`. Adjust `DATABASE_URL` in `.env`
if you want the database somewhere else.

### 3. Create the database

```bash
bun run db:push    # creates the SQLite database from prisma/schema.prisma
```

### 4. Start the app

```bash
bun run dev        # development server on http://localhost:3000
```

Open <http://localhost:3000>, enter your first job and press **Save quotation**.

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the development server on port 3000 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Run the standalone production server |
| `bun run lint` | ESLint |
| `bun run db:push` | Push `prisma/schema.prisma` to the SQLite database |
| `bun run db:generate` | Regenerate the Prisma Client |

## 🔌 API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/quotations` | List all quotations (newest first) |
| `POST` | `/api/quotations` | Create a quotation — totals computed server-side |
| `GET` | `/api/quotations/:id` | Fetch one quotation |
| `PUT` | `/api/quotations/:id` | Edit a quotation — totals recomputed server-side |
| `DELETE` | `/api/quotations/:id` | Delete a quotation |
| `GET` | `/api/rates` | List saved rate presets |
| `POST` | `/api/rates` | Save a rate preset |
| `DELETE` | `/api/rates/:id` | Delete a rate preset |
| `GET` | `/api` | Health check |

## 📁 Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── quotations/[id]/route.ts   # quotation GET / PUT / DELETE
│   │   ├── quotations/route.ts        # quotation list / create
│   │   ├── rates/[id]/route.ts        # preset delete
│   │   ├── rates/route.ts             # preset list / create
│   │   └── route.ts                   # health check
│   ├── layout.tsx                     # fonts, metadata, toaster
│   ├── page.tsx                       # main app shell (tabs, dialogs, state)
│   └── globals.css                    # theme tokens & brand colours
├── components/
│   ├── estimator/
│   │   ├── estimator-form.tsx         # the 7-question job form
│   │   ├── summary-card.tsx           # live totals + save/preview/share actions
│   │   ├── preview-dialog.tsx         # quotation preview modal (print/share)
│   │   ├── quotation-document.tsx     # branded printable quotation document
│   │   ├── history-tab.tsx            # saved quotations (view/edit/delete/copy)
│   │   ├── rates-tab.tsx              # saved rate presets (apply/delete)
│   │   └── types.ts                   # shared client types & form helpers
│   └── ui/                            # shadcn/ui primitives
└── lib/
    ├── calc.ts                        # pricing engine (shared client + server)
    ├── format.ts                      # ₹ / date / phone formatting helpers
    ├── db.ts                          # Prisma client singleton
    └── utils.ts                       # class-name helper
```

## 🚢 Deployment

The build produces a **standalone** Next.js server, so any always-on machine works — the shop
PC, a Raspberry Pi in the back office, or a small VPS:

```bash
bun run build
bun run start       # serves on port 3000; put it behind nginx/Caddy for HTTPS
```

**About the database:** this tool intentionally uses SQLite — a single file that is trivial to
back up (copy `prisma/dev.db`, or whatever your `DATABASE_URL` points to). That makes it ideal
for a single-shop internal tool on a persistent machine. On serverless platforms (e.g. Vercel)
the filesystem is ephemeral, so if you deploy there you would need to move to a hosted database
and adjust the Prisma datasource accordingly.

## 📄 License

Released under the [MIT License](LICENSE).
