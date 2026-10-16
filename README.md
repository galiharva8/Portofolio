# Galih Arva Nandia — Personal Portfolio

Personal portfolio website showcasing **Technology × Creativity** — web development, graphic design, video editing, and photography.

## Tech Stack

- HTML5
- CSS3 (Flexbox, Grid, custom properties)
- Vanilla JavaScript

## Features

- Responsive design (mobile-first)
- Dark theme (default) + light mode toggle (`localStorage`)
- Portfolio filter by category (All, Development, Graphic Design, Video, Photography)
- Selected works on homepage
- Project detail modal
- Photography lightbox in project modal
- Certificates grid with PDF links
- Contact section
- Smooth scroll, reveal animations, lazy-loaded images
- SEO & Open Graph meta tags

## Project Structure

```
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js      ← edit projects, certificates, links
│   └── script.js
├── assets/
│   ├── images/
│   │   ├── profile/
│   │   ├── design/
│   │   ├── photography/
│   │   ├── video/
│   │   ├── projects/
│   │   └── certificates/
│   ├── certificates/   ← PDF files
│   └── cv/
│       └── CV-Galih-Arva-Nandia.pdf
└── README.md
```

## Run Locally

1. Clone or download this repository.
2. Open the folder on your computer.
3. **Option A:** Double-click `index.html` (some browsers may restrict local JS — prefer Option B).
4. **Option B (recommended):** Use a simple local server:

   **VS Code / Cursor:** Install the “Live Server” extension → right-click `index.html` → “Open with Live Server”.

   **Python 3:**

   ```bash
   cd path/to/portfolio
   python -m http.server 5500
   ```

   Then open `http://localhost:5500` in your browser.

   **Node (npx, no install):**

   ```bash
   npx serve .
   ```

## Customize Content

| What | Where |
|------|--------|
| Projects, featured list, video/Drive links | `js/data.js` |
| Award details, photos, and videos | `PORTFOLIO.awards` in `js/data.js` |
| Instagram & GitHub buttons | `index.html` — search `data-social` and set `href` |
| Profile photo | Replace `assets/images/profile/profile-placeholder.svg` (or use `.jpg`/`.webp` and update `index.html`) |
| Design / photo / project images | Replace files under `assets/images/...` and update paths in `data.js` |
| Certificates | Add PDFs to `assets/certificates/` and update `pdfUrl` in `data.js` |
| CV download | Replace `assets/cv/CV-Galih-Arva-Nandia.pdf` with your real PDF |

Award media uses `image` for the card image, `gallery` for photos shown in the detail modal, and `videoPreview` for a local video. Media paths are relative to `index.html`.

### Video Projects (Google Drive / YouTube)

In `js/data.js`, each video project can use `youtubeUrl` (or a YouTube URL in `externalLink`) for a YouTube preview, or `videoPreview` for a local video:

- `youtubeUrl`: a normal YouTube watch, short, Shorts, or embed URL. When present and valid, it takes priority over `videoPreview`; the project modal converts it to an embedded preview and attempts muted autoplay when opened.
- `externalLink`: optional URL to open separately. When the project has a YouTube URL, the modal shows **Watch Full Video on YouTube** as a separate link.
- `videoPreview`: optional local video path. Local video previews retain their in-modal player and start muted when visible.

Example:

```javascript
youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
externalLink: '', // optional external destination
```

Autoplay is attempted muted and inline, and the preview pauses when it leaves the viewport. Browser policies and YouTube embedding permissions can still prevent playback; an in-modal notice and the separate YouTube button remain available as fallback.

## Upload to GitHub

1. Create a new repository on GitHub (e.g. `galih-arva-portfolio`).
2. In this project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio website"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

3. Ensure `index.html` is at the **root** of the repository (not inside a subfolder), unless you use a `/docs` or project subpath setting.

## Enable GitHub Pages

1. On GitHub, open your repository → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
3. Branch: `main`, folder: **`/ (root)`**.
4. Save. After 1–3 minutes your site will be at:

   `https://USERNAME.github.io/REPO/`

   If the repository is named `USERNAME.github.io`, the site URL is:

   `https://USERNAME.github.io`

5. Use **relative paths** only (already used in this project: `css/`, `assets/`, etc.).

## License

Personal portfolio — © Galih Arva Nandia.
