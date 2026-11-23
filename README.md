# Campus Event & Workshop Management System

Full MERN stack app for students to discover/register for campus events, and
admins to create, manage, and track the event lifecycle.

## Stack
- Frontend: React (Vite), React Router, Tailwind CSS, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT with role-based access (student / admin)

## Folder structure
```
campus-events/
  shared/authValidation.mjs
  backend/
    config/db.js
    models/         User, Event, Registration
    middleware/      auth, validate, errorHandler
    controllers/     authController, eventController, registrationController
    routes/          authRoutes, eventRoutes, registrationRoutes, myRegistrationRoutes
    server.js
  frontend/
    src/
      api/axios.js
      context/AuthContext.jsx
      components/     Navbar, EventCard, EventList, EventForm, SearchFilterBar, ProtectedRoute
      pages/          EventsPage, EventDetailsPage, CreateEventPage, EditEventPage, MyRegistrationsPage, AuthPage, VerifyPassPage
      App.jsx, main.jsx
```

## Features
- **Registration form** — registering for an event now opens a modal that
  captures phone number, student/roll number, and optional notes, which are
  stored on the registration and shown to admins.
- **Digital event pass** — every confirmed registration gets a unique ticket
  code and a scannable QR-code pass (see "My Registrations" → **Pass**), which
  can be printed or saved as a PDF.
- **Live countdown timer** — event cards and the event details page show a
  live countdown to the event start (or "Happening now" / "Event has ended").
- **Verify Pass (admin)** — admins have a `/verify-pass` screen to look up a
  student's ticket code and check them in at the door.
- The responsive event catalog, search filters, and printable passes use a campus poster design.

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.example .env    # edit MONGO_URI / JWT_SECRET as needed
npm run dev             # starts on http://localhost:5000
```
Use Node.js 22.12 or newer and a running MongoDB instance at the URI in `.env`.
Set `JWT_SECRET` to a private random value before starting the API. Set
`ADMIN_INVITE_CODE` to enable organizer signup. A blank invite code enables student signup only.

### 2. Frontend
```
cd frontend
npm install
npm run dev              # starts on http://localhost:5173
```

## Roles
- Register a user with role `admin` to create/edit/delete events and view a
  per-event registration list and mark attendance.
- Register a user with role `student` to browse, search/filter, register,
  cancel, and track your own registrations under "My Registrations".

## API overview
| Method | Endpoint                                   | Access        | Purpose                          |
|--------|---------------------------------------------|---------------|-----------------------------------|
| POST   | /api/auth/register                          | Public        | Create account                   |
| POST   | /api/auth/login                             | Public        | Login, get JWT                   |
| GET    | /api/auth/me                                | Auth          | Current user profile             |
| GET    | /api/events                                 | Public        | List events (search/filter/sort/paginate) |
| GET    | /api/events/:id                             | Public        | Event details + seat availability |
| POST   | /api/events                                 | Admin         | Create event                     |
| PUT    | /api/events/:id                             | Admin         | Update event                     |
| PATCH  | /api/events/:id/status                      | Admin         | Update lifecycle status          |
| DELETE | /api/events/:id                             | Admin         | Delete event                     |
| POST   | /api/events/:eventId/registrations          | Student       | Register for event               |
| DELETE | /api/events/:eventId/registrations          | Auth          | Cancel own registration          |
| GET    | /api/events/:eventId/registrations          | Admin         | List event's registrations       |
| PATCH  | /api/events/:eventId/registrations/:id/attendance | Admin   | Mark attendance                  |
| GET    | /api/myregistrations                        | Auth          | Current user's registrations     |
| GET    | /api/verify/:ticketCode                     | Admin         | Look up a pass by ticket code    |
| PATCH  | /api/verify/:ticketCode/checkin             | Admin         | Check in a student via their pass |

## Event lifecycle
`Upcoming -> Ongoing -> Completed`, or `Upcoming -> Cancelled`, set by admin
via the status dropdown on the event details page. Registration is blocked
once an event is `Completed` or `Cancelled`, or once seats run out.

## Notes
- Registered and checked-in attendees both count toward event capacity.
- Search matches event name, venue, resource person, and description.
- Filters: event type, status. Sort: date, name, capacity.
