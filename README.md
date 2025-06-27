# URL Shortener Application

A full-stack URL shortening service that allows users to create and manage shortened URLs.

## Repository Structure

This repository contains the following components:

- **Logging Middleware**: A reusable logging package
- **Backend**: Node.js server for URL shortening and analytics
- **Frontend**: React application with Material UI

## Features

- Shorten up to 5 URLs at once
- Custom shortcode support
- Configurable URL validity period
- URL analytics and statistics
- Copy to clipboard functionality
- Responsive design

## Setup Instructions

### Logging Middleware

```bash
cd Logging\ Middleware
npm install
npm run build
npm link
```

### Backend

```bash
cd backend
npm install
npm link logging-middleware
npm start
```

### Frontend

```bash
cd frontend
npm install
npm link logging-middleware
npm run dev
```

## Technologies Used

- **Frontend**: React, TypeScript, Material UI, Vite
- **Backend**: Node.js, Express, MongoDB
- **Logging**: Custom middleware package
