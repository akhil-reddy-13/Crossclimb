# Deployment Guide for Vercel

## Step 1: Push to GitHub

Since your project isn't in GitHub yet, follow these steps:

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Custom Crossclimb app"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it something like `crossclimb` or `custom-crossclimb`
   - Don't initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual GitHub username and repo name)

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with your GitHub account (if not already signed in)

2. **Import your project:**
   - Click "Add New..." → "Project"
   - You should see your GitHub repositories listed
   - Find and click "Import" next to your `crossclimb` repository

3. **Configure the project:**
   - Vercel should auto-detect Next.js
   - Framework Preset: Next.js (should be auto-selected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should be auto-filled)
   - Output Directory: `.next` (should be auto-filled)
   - Install Command: `npm install` (should be auto-filled)

4. **Environment Variables (if needed):**
   - If you want to use Gemini clues, add:
     - Key: `GEMINI_API_KEY`
     - Value: `[gemini_api_key]`
   - Click "Add" for each variable
   - Note: The dictionary API works without any keys, so this is optional

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Once done, you'll get a URL like `your-app.vercel.app`

## Step 3: Test Your Deployment

1. Visit your Vercel URL
2. Create a test puzzle
3. Share the puzzle URL with friends to test!

## Important Notes

- **Puzzle Storage**: Currently, puzzles are stored in-memory on the server. This means:
  - Puzzles will be lost if the server restarts
  - For production, you'd want to use a database (like Vercel Postgres, MongoDB, etc.)
  - For now, this works great for testing and sharing with friends!

- **Dictionary Files**: The preprocessed dictionary files in `/data` are already committed, so they'll be included in the deployment.

- **Custom Domain**: You can add a custom domain later in Vercel settings if you want!

## Troubleshooting

If you get build errors:
- Make sure all dependencies are in `package.json`
- Check that `next.config.js` is properly configured
- Ensure TypeScript compiles without errors (`npm run build` locally first)

