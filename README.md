# CivicSense Complaint Portal

A role-based civic complaint management portal built with React, Vite, Express, and MongoDB.
It supports citizens submitting complaints, employees managing assignments, and admins monitoring complaint status and location on a map.

## Features

- Citizen complaint submission with department assignment
- Role-based authentication for Citizen, Employee, and Admin users
- Complaint tracking by ID
- Admin dashboard with complaint map visualization (`AdminMap.jsx`)
- Employee dashboard for updating status, assigning complaints, and adding progress messages
- Feedback collection after complaint resolution
- Optional email notification support via Nodemailer
- Optional image upload to Cloudinary for complaint photos and resolution proof

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, OpenLayers
- Backend: Node.js, Express, MongoDB, Mongoose
- Email: Nodemailer
- Optional media hosting: Cloudinary

## Repository Structure

- `/src` - React frontend source
  - `App.jsx` - main application and routing logic
  - `src/Admin` - admin dashboard and map components
  - `src/Citizen` - citizen pages and feedback form
  - `src/Employee` - employee dashboard pages
  - `src/auth` - authentication-related forms and helpers
  - `src/complaints` - complaint storage and API utilities
- `/server` - backend API and models
  - `index.js` - Express server and API routes
  - `/models` - Mongoose schemas for User, Complaint, Employee, Feedback
- `.gitignore` - ignores `node_modules`, `.env`, and build output

## Prerequisites

- Node.js 20+ recommended
- MongoDB running locally or accessible remotely
- npm installed

## Environment Variables

Create a `.env` file inside `/server` with these values:

```env
MONGO_URI=mongodb://localhost:27017/smartcity
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Notes:

- `CLOUDINARY_*` variables are optional. If not configured, images remain stored as Base64 strings.
- `EMAIL_USER` and `EMAIL_PASS` are optional. If absent, Nodemailer falls back to an Ethereal test account.

## Installation

Install dependencies for both frontend and backend.

From the repository root:

```bash
npm install
cd server
npm install
```

## Running the App

### Start the backend

From `/server`:

```bash
npm run dev
```

### Start the frontend

From repository root:

```bash
npm run dev
```

By default, Vite serves the frontend at `http://localhost:5173` and the backend runs at `http://localhost:5000`.

## Default Admin Credentials

The app includes a built-in admin fallback user for login:

- Email: `admin@gmail.com`
- Password: `111111`

## Usage

- Citizen:
  - Register or login as a citizen
  - Submit a complaint with location, department, and description
  - Track complaint status using complaint ID
  - Provide feedback after resolution
- Employee:
  - Login as an employee
  - View and update assigned complaints
  - Change complaint status and add progress messages
- Admin:
  - Login using default admin credentials
  - View all complaints and map markers in the admin dashboard
  - Monitor resolution progress and complaint distribution

## API Overview

- `POST /api/users/register` - register user with OTP verification
- `POST /api/users/login` - login by role, email, and password
- `POST /api/users/send-otp` - send registration OTP to email
- `POST /api/users/forgot-password-otp` - send password reset OTP
- `PUT /api/users/reset-password` - reset password with OTP
- `GET /api/users` - list all users
- `GET /api/complaints` - fetch all complaints
- `POST /api/complaints` - submit a complaint
- `PUT /api/complaints/:id/status` - update complaint status
- `PUT /api/complaints/:id/assign` - assign employee
- `POST /api/complaints/:id/messages` - add progress message
- `DELETE /api/complaints/:id` - delete complaint
- `GET /api/feedback` - fetch feedback
- `POST /api/feedback` - submit feedback

## Notes

- The frontend uses OpenLayers (`ol`) to render the admin complaint map in `src/Admin/AdminMap.jsx`.
- The server seeds employee IDs after the first MongoDB connection if none exist.
- The admin dashboard and complaint handling rely on the complaint schema fields such as `status`, `latitude`, `longitude`, and `progressMessages`.

## Contributing

Feel free to add feature branches, improve validation, add authentication middleware, or integrate a proper user session system.

## License

This repository does not include a license file. Add one if you intend to open source the project.