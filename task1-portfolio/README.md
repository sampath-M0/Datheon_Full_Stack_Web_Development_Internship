# Sampath Panuganti: Developer Portfolio

Responsive portfolio with a cursor light, particle network, dark/light theme, scroll-spy navigation and project modals. No build step.

## Run locally
Open the folder in VS Code, install the **Live Server** extension, right-click `index.html` > **Open with Live Server**.

## Add your photo / video
Put files in `assets/`:
- `photo.jpg` (portrait, 4:5 works best)
- `intro.mp4` (5-10 s loop, under 5 MB; it covers the photo when present)
- `resume.pdf` (already included; replace it with your own any time)

If a file is missing, the hero falls back gracefully.

## Edit projects
Change the `P` array at the top of `js/main.js`. Add `link:'https://github.com/sampath-M0/<repo>'` to point a card at its repository.

## Deploy
Push to GitHub, then import the repo in Vercel or Netlify (no build command, publish directory `/`), or enable GitHub Pages.
