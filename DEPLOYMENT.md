# How to Make This Project Live

This project is a static website, so it can be hosted on GitHub Pages, Netlify, or Vercel.

Important note: The project currently stores data in the browser using `localStorage`. That means event data and registrations are saved only on the visitor's own browser. For a real public system where all users share the same data, connect it later with a backend and database.

## Option 1: GitHub Pages

1. Create a GitHub account or login to GitHub.
2. Create a new repository, for example `college-event-registration-portal`.
3. Upload all project files and folders:
   - `index.html`
   - `student.html`
   - `organizer.html`
   - `admin.html`
   - `css`
   - `js`
   - `README.md`
4. Open the repository settings.
5. Go to `Pages`.
6. Under `Branch`, select `main`.
7. Select `/root`.
8. Save.
9. GitHub will give you a live website link.

## Option 2: Netlify

1. Go to Netlify and create/login to your account.
2. Click `Add new site`.
3. Choose `Deploy manually`.
4. Drag and drop the whole project folder.
5. Netlify will create a live website link automatically.

## Option 3: Vercel

1. Go to Vercel and create/login to your account.
2. Click `Add New Project`.
3. Upload or import the project.
4. Keep the default settings.
5. Click `Deploy`.

## First Page

The live website should start from:

`index.html`

This is the login and signup page.
