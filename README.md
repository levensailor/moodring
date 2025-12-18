# MoodRing - Mood Board Application

A beautiful mood board application to help organize your life, including work, house, kids, band, and other side projects.

## Features

- **Main View**: Retro grid background with draggable mood board cards
- **Liquid Glass Cards**: Beautiful glassmorphic card design
- **Mood Board Canvas**: Interactive canvas with drag, resize, and rotate capabilities
- **Rich Content Support**:
  - Photos (paste or drag & drop)
  - Text with formatting (bold, italic, underline, strikethrough)
  - Link previews
  - Icons
  - Shapes (rectangles, circles)
  - Lines and arrows
  - Sub-boards
- **Background Customization**: Color, transparency, and wallpaper patterns
- **Persistent State**: All data saved to Neon PostgreSQL database
- **Cloud Image Storage**: Images stored in Vercel Blob

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: React, Tailwind CSS, Custom glassmorphic components
- **Canvas**: react-konva
- **State Management**: React Query
- **Database**: Neon PostgreSQL
- **Storage**: Vercel Blob
- **Icons**: Iconify
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon database account (free tier available)
- A Vercel account (for deployment and blob storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moodring
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
```

### Setting Up Neon Database

1. Create an account at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it will look like `postgresql://user:password@host/database?sslmode=require`)
4. Add it to your `.env.local` file as `DATABASE_URL`
5. Run the migration SQL:
   - Open the Neon SQL Editor
   - Copy and paste the contents of `migrations/init.sql`
   - Execute the SQL to create the tables

### Setting Up Vercel Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Blob
3. Create a new blob store (or use an existing one)
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to your `.env.local` file as `BLOB_READ_WRITE_TOKEN`

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL`: Your Neon database connection string
   - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add BLOB_READ_WRITE_TOKEN
```

### Post-Deployment Setup

After deploying, make sure to:
1. Run the database migration SQL in your Neon database (if not already done)
2. Verify environment variables are set correctly in Vercel dashboard
3. Test the application by creating a mood board

## Usage

1. **Create a Mood Board**: Click the "+" card on the main view
2. **Add Content**: Use the toolbar at the bottom to add photos, text, links, icons, shapes, lines, arrows, or sub-boards
3. **Edit Text**: Double-click on text objects to open the text editor
4. **Rearrange**: Drag objects around the canvas
5. **Resize/Rotate**: Select an object and use the handles to resize or rotate
6. **Customize Background**: Click the palette icon in the toolbar to change background color, transparency, or wallpaper pattern
7. **Paste Images/URLs**: Paste images or URLs directly onto the canvas

## Project Structure

```
moodring/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── board/[id]/        # Board view page
│   └── page.tsx           # Main view
├── components/            # React components
│   ├── board/            # Board-related components
│   ├── main/             # Main view components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
├── migrations/            # Database migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Author

Built with ❤️ for organizing life's many projects and ideas.

## License

MIT
