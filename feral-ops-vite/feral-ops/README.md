# FERAL OPS: City Assault

Stylized open-world 3D shooter in the browser. Vanilla JS, Three.js, Vite.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build   # output in dist/
```

## Deploy
- **Render (Static Site):** build command `npm install && npm run build`, publish directory `dist`.
- **GitHub Pages:** push `dist/` to a `gh-pages` branch, or use a GitHub Actions Vite workflow. `base` is already `./`.

## Controls
WASD move, Shift sprint, Mouse aim, Click fire, R reload, G grenade, E enter/exit car, Space handbrake, K flip A/D if reversed (saved in the browser).

## Roadmap
Split `src/main.js` into modules (world, player, enemies, vehicles, weapons, ui, audio), then co-op (Socket.IO), touch controls, more weapons, police AI, settings.
