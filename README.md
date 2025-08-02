# AI Text Generator

This project is a web application that generates poems, stories, or song lyrics based on user inputs such as theme, mood, and length.  
It uses the **OpenAI API** to create creative, high-quality text and displays the results with an elegant and interactive frontend built with **Vue 3, TypeScript, and Tailwind CSS**.

## Features
- Generate poems, stories, or song lyrics based on custom user inputs.
- Choose theme, mood, and length for personalized content.
- AI-generated content powered by OpenAI API.
- Responsive UI with Vue 3 + Tailwind CSS.
- Fallback poem mechanism in case the API is unavailable.
- Optional text-to-speech feature for reading the generated text aloud.

## Tech Stack
- **Frontend:** Vue 3, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** OpenAI API
- **Other:** CORS, dotenv

## How It Works
1. User selects content type (poem, story, or song lyrics), theme, mood, and length.
2. The frontend sends these inputs to the backend API.
3. The backend calls the OpenAI API with a custom prompt.
5. If the OpenAI API is unavailable, a fallback poem is used.

## Installation & Usage
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the backend directory and add your OpenAI API key:
   OPENAI_API_KEY=your_openai_api_key
4. Start the backend:
   ```bash
   cd api
   npm run dev
5. Start the frontend:
   ```bash
   npm run dev
