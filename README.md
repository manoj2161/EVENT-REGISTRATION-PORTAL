# University Event Registration Portal

This is a university-level HTML, CSS, and JavaScript project for managing campus events.

## Panels

- Student panel: View approved events, filter events, and register with name, roll number, phone, email, and department.
- Organizer panel: Create event requests for admin approval.
- Admin panel: Create approved events, approve or reject organizer events, delete events, view registrations, and export registrations as CSV.

## Login and Signup

The project includes a login/signup screen. After login, users are automatically linked to their correct panel based on role.

Demo accounts:

- Student: `student@university.edu`
- Organizer: `organizer@university.edu`
- Admin: `thakurmanu065@gmail.com`

Student and organizer password: `password123`
Admin password: `Manu@2621`

Users can sign up only as students or organizers. Admin signup is disabled, and the only admin account is Manoj.

## Roll Number Rule

Student roll numbers are accepted only from `H220001` to `H250999`.

A student cannot register again for the same event. The system blocks duplicate registration using the logged-in account, roll number, or email address.

Students can see their registered events below the registration form. They can edit submitted information or cancel a registration.

Organizers and admins can select multiple eligible departments for one event, so students from more than one department can participate.

## Departments Included

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

## Data Handling

The project currently uses `localStorage` through `js/api.js`. This file acts like a small API layer, so it can later be replaced with real backend API calls and a database without changing most of the user interface code.

## Files

- `index.html` - Login and signup page
- `student.html` - Student event browsing and registration page
- `organizer.html` - Organizer event creation page
- `admin.html` - Admin event approval and registration management page
- `css/styles.css` - Complete responsive styling
- `js/api.js` - Temporary data/API logic
- `js/app.js` - Page routing, forms, validation, filtering, and rendering
