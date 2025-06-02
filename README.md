# Mindful Break Generator

A simple web application that generates mindfulness break suggestions using Google's Gemini AI. Perfect for students who need quick, refreshing breaks during study sessions.

## Features

- Automatically generates mindfulness activities and stretching suggestions
- Timer functionality for break duration
- Clean, minimalist interface
- Secure API key handling through environment variables

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js (Vercel Serverless Functions)
- AI: Google Gemini API
- Deployment: Vercel

## Project Structure

```
/
├── api/
│   └── gemini.js        # Serverless function for Gemini API
├── public/
│   ├── index.html       # Main webpage
│   ├── script.js        # Frontend JavaScript
│   └── style.css        # Styles
└── README.md           # Project documentation
```

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Deploy to Vercel:
   ```bash
   vercel
   ```

## Environment Variables

Set the following environment variable in your Vercel project settings:

- `GEMINI_API_KEY`: Your Google Gemini API key

## Development

To run locally:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Run the development server:
   ```bash
   vercel dev
   ```

## Deployment

The project is configured for automatic deployment on Vercel. Simply push to the main branch or deploy through the Vercel CLI:

```bash
vercel --prod
``` 