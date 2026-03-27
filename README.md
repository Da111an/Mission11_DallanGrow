# Mission 11 - Online Bookstore (IS 413)

This project implements Mission 11 using:
- ASP.NET Core Web API (`backend`)
- React + TypeScript + Vite (`frontend`)
- SQLite database (`Bookstore.sqlite`)

## Assignment Requirements Coverage

- Store and display required book fields:
  - Title
  - Author
  - Publisher
  - ISBN
  - Classification
  - Category
  - Number of Pages
  - Price
- Database connected to app via EF Core SQLite
- Book list component rendered in `App.tsx`
- Pagination implemented (default 5 per page)
- User can change page size
- User can sort by book title (A-Z / Z-A)
- Bootstrap styling applied

## Project Structure

- `Bookstore.sqlite` - provided assignment database
- `backend` - ASP.NET Core API
- `frontend` - React UI

## Prerequisites

- .NET SDK 10
- Node.js 18+ and npm

## Run Instructions

Open two terminals from the project root.

### 1) Start backend API

```powershell
cd backend
dotnet run --urls http://localhost:5000
```

The API runs at:
- `http://localhost:5000/api/books`

### 2) Start frontend app

```powershell
cd frontend
npm install
npm run dev
```

Vite will print the frontend URL (usually `http://localhost:5173`).

## API Usage

### GET `/api/books`

Query params:
- `page` (default `1`)
- `pageSize` (default `5`)
- `sort` (`asc` or `desc`, default `asc`)

Example:

```text
http://localhost:5000/api/books?page=1&pageSize=5&sort=asc
```

Response includes:
- `books` array
- `pagination` object (`page`, `pageSize`, `totalItems`, `totalPages`)

## Build Verification

Backend:

```powershell
cd backend
dotnet build
```

Frontend:

```powershell
cd frontend
npm run build
```

## GitHub Submission Notes

1. Push this repository to GitHub.
2. Confirm both `backend` and `frontend` folders are included.
3. Submit the GitHub repository link in Learning Suite.

## (Bootstrap attributes used)


`Used Bootstrap data attributes not shown in class videos: (1) In frontend/src/components/BookList.tsx, the "Toggle" button uses data-bs-toggle="collapse" and data-bs-target="#categoryFilterPanel" to expand/collapse the category checkbox filter section. (2) In frontend/src/components/CartSummary.tsx, the "Quick Cart Preview" button uses data-bs-toggle="offcanvas" and data-bs-target="#cartPreviewOffcanvas" to open a right-side cart preview panel, and buttons with data-bs-dismiss="offcanvas" close that panel.`
