# Python Quiz Site

An interactive quiz platform built with Next.js and Firebase, featuring Python programming challenges.

## Features

- Multiple difficulty levels (Easy, Medium, Hard)
- Interactive code editor with Monaco Editor
- Real-time code execution
- User authentication
- Progress tracking
- Responsive design

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Monaco Editor

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.
