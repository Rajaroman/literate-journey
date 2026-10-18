# FERAL OPS: City Assault — 3D Co-op Prototype

A stylized, third-person 3D browser action prototype inspired by open-world city games. Includes a generated city block, third-person camera, shooting, enemy AI, health/armor, ammo/reload, grenades, cash, wanted stars, minimap, vehicle enter/exit, touch controls, and room-code multiplayer presence for two players.

## Run locally

Requires Node.js 18+ and internet access for the Three.js CDN.

```bash
npm install
npm start
```

Open http://localhost:3000. Play Solo works without a second player. For co-op, choose Create Co-op and share the five-character room code; the second player chooses Join.

## Deploy free

1. Upload the project contents to a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Select the free instance tier and deploy.

Use the Render public URL on both devices. WebSockets must be supported. Free instances may sleep when idle and take time to wake.

## Controls

- Desktop: WASD move, mouse aim, left-click shoot, E enter/exit vehicle, R reload, G grenade.
- Mobile: left virtual joystick, FIRE, FRAG, DRIVE/EXIT, RELOAD.

## Prototype limitations

This is a 3D browser prototype, not a full commercial open-world game. The city is procedural and stylized; vehicles are a basic drivable prop; multiplayer sync currently shares player position/rotation and room presence rather than fully authoritative combat, enemy states, mission progress, or vehicle state. Use it as a starting point for further development. No GTA assets or trademarks are included.
