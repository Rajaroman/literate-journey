# FERAL DRIVE — City Driving Simulator

A browser-based 3D city-driving prototype built with Three.js and Node.js/WebSocket room support. It replaces the previous shooter UI with car-focused driving, AI traffic, and checkpoint delivery runs.

## Features

- Procedurally generated city blocks, asphalt roads, lane markings, sidewalks, buildings, trees and street lamps
- Three vehicle classes: Street Sport, Supercar and Urban SUV
- Custom vehicle paint colors
- Arcade-style driving physics: throttle, brake/reverse, steering, drag, handbrake/drift, nitro, RPM and speed readout
- Traffic cars that cruise city lanes, vehicle impacts and body damage
- Fuel, cash, odometer, vehicle repair, headlights and three camera modes (chase, hood, cinematic)
- Checkpoint delivery / time-trial mode
- Desktop keyboard controls and mobile steering/pedal controls
- Optional room-code co-op that synchronizes driver positions through the included WebSocket server

## Run locally

Requires Node.js 18+ and an internet connection for the Three.js CDN.

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Controls

- **W / Up:** throttle
- **S / Down:** brake; reverse after stopping
- **A / D or Left / Right:** steer
- **Space:** handbrake / drift
- **Shift:** nitro boost (when throttle is held)
- **C:** change camera
- **E:** headlights
- **R:** reset car
- On mobile, use the steering pad and GAS / BRAKE / NITRO / DRIFT buttons.

## Deploy to Render

Create a Node.js Web Service for this repository. If using the project subfolder in the existing monorepo, set **Root Directory** to `feral_ops_3d`, **Build Command** to `npm install`, and **Start Command** to `npm start`. A free instance can sleep while idle; it may take a little time to wake.

## Prototype limitations

This is a stylized browser-driving prototype, not a full commercial driving simulator. Vehicle handling is arcade/sim-lite rather than tire-physics simulation. Traffic is lane-following loop traffic. Co-op synchronizes remote vehicle positions, not shared traffic physics or mission progress. The game uses the Three.js CDN and needs internet access.
