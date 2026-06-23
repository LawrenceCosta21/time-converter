# Epoch Converter

A clean, fast Unix timestamp converter. Convert between epoch timestamps and human-readable dates across any timezone — with zero dependencies, no tracking, no ads.

## Features

- **Date → Epoch** — Pick a date, time, and timezone, get epoch in seconds and milliseconds
- **Epoch → Date** — Paste any epoch, see UTC, ISO 8601, local time, a custom timezone, day of week, day of year, and week number
- Live UTC clock in the header
- Copy-to-clipboard buttons
- Fully responsive, keyboard accessible, respects `prefers-reduced-motion`
- Zero dependencies — vanilla HTML, CSS, JS

## Project structure

```
epoch-converter/
├── index.html   # Markup and layout
├── style.css    # All styles (dark theme)
├── app.js       # All logic
└── README.md
```

## Deploy in one click

### Netlify Drop
1. Zip this folder
2. Go to [netlify.com/drop](https://netlify.com/drop)
3. Drag and drop the zip — done

### Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --dir . --prod
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your site will be live at `https://<username>.github.io/<repo>`

### Cloudflare Pages
1. Push to GitHub
2. Connect repo in [Cloudflare Pages](https://pages.cloudflare.com)
3. Build command: _(leave empty)_
4. Output directory: `/` (root)

### Any static host
This is a plain static site — just upload the three files (`index.html`, `style.css`, `app.js`) to any web server or CDN.

## Local development

No build step needed:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# Then open http://localhost:8080
```

## License

MIT
