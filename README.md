# University Event Registration Portal

A role-based university event management and registration web application built with HTML, CSS, and JavaScript. The project provides separate workflows for students, organizers, and administrators, with event approval and registration management built into the application.

## Live Demo

Add your deployed project URL here.

## Overview

The portal models a university event workflow from event creation to student registration:

```text
Organizer creates event
        ↓
Admin reviews event
   ┌────┴────┐
 Approve   Reject
    ↓
Published Event
    ↓
Student Registration
    ↓
Admin Registration Management
```

## Roles & Features

### Student

- View approved events
- Filter available events
- Register for eligible events
- Registration form validation
- Prevent duplicate registrations
- View registered events
- Edit registration information
- Cancel registrations

### Organizer

- Submit event requests
- Select multiple eligible departments
- Provide event details for admin review

### Admin

- Create and manage approved events
- Review organizer event requests
- Approve or reject event requests
- Delete events
- View student registrations
- Export registration data as CSV
- Manage the event workflow from a central panel

## Validation & Business Rules

- Student roll numbers are validated against the configured university roll-number range.
- Students cannot register more than once for the same event.
- Duplicate registration checks use the logged-in account, roll number, and email address.
- Events can target multiple eligible departments.
- Admin signup is disabled in the application.

## Departments

The application includes departments such as:

- C.S.E - BCA
- C.S.E - B.Tech
- C.S.E - MCA
- C.S.E - BSc IT
- C.S.E - BSc CS
- Science - Physics
- Science - Chemistry
- Science - Maths
- Science - Zoology
- Law Department
- Pharmacy Department
- HM Department

## Event Locations

- Pragti Room
- MP Hall
- Ground

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage
- CSV data export
- Responsive web design

## Data Layer

The current version uses `localStorage` through `js/api.js` as a browser-based data layer. The API-style separation is intentional so the frontend can later be connected to a real backend API and database with less impact on the UI layer.

## Project Structure

```text
EVENT-REGISTRATION-PORTAL/
├── index.html          # Login and signup
├── student.html        # Student dashboard and registration
├── organizer.html      # Organizer event requests
├── admin.html          # Admin management panel
├── css/
│   └── styles.css      # Responsive application styling
└── js/
    ├── api.js          # Local data/API abstraction
    └── app.js          # Routing, validation, filtering, and rendering
```

## Getting Started

```bash
git clone https://github.com/manoj2161/EVENT-REGISTRATION-PORTAL.git
cd EVENT-REGISTRATION-PORTAL
```

Open `index.html` in a browser or use a local development server such as VS Code Live Server.

## What I Practiced

This project strengthened practical frontend development skills including DOM manipulation, JavaScript application logic, form validation, role-based UI flows, browser storage, data filtering, CRUD-style interactions, responsive design, and CSV export.

## Future Improvements

- Replace `localStorage` with a Node.js/Express backend
- Add MongoDB for persistent multi-user data
- Implement secure authentication and authorization
- Add email notifications for event approvals and registrations
- Add event capacity management
- Add deployment and production-ready API architecture

## Author

**Manoj Kumar**

- GitHub: https://github.com/manoj2161
- Portfolio: https://manoj-portfolio-21.vercel.app/
- LinkedIn: https://www.linkedin.com/in/manoj-kumar-811245200
