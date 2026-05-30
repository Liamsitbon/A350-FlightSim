<img width="1470" height="873" alt="Screenshot 2026-05-30 at 10 36 29" src="https://github.com/user-attachments/assets/9d3d4baf-2ce1-44f5-a8c1-b2a19f076715" />

# A350-FlightSim
A350 FLIGHT SIMULATOR
# A350-900 Web Simulator

An early open-source Airbus A350-900 style flight simulator for the web.

This first build runs as a static Three.js app and includes a procedural A350-900 placeholder, runway environment, basic flight physics, HUD, throttle, flaps, and landing gear.

## How To Download?

Currently the simulator is only downloaded via git and is not available via Releases. Maybe in the future it will also be available via Releases but right now there is no reason. So this is how you download

```bash
git clone https://github.com/Liamsitbon/A350-FlightSim.git
```

## How To Update?

Go to the CMD/Terminal folder and do this:

```bash
git pull
```
## How To Open The Game?

Run locally in CMD/Terminal:

```bash
python3 -m http.server 5173
```

Then open in internet browser:

```text
http://localhost:5173
```
(If you pull a new version then you need to change 5173 to a different number each time.)

## Controls

- `W` / `S`: throttle
- Arrow down / up: pitch up and pitch down
- Arrow left / right: roll left and roll right. Holding the key keeps rolling; releasing keeps the bank instead of snapping level.
- `A` / `D` or `Q` / `E`: rudder yaw left and right
- `K` / `I`: climb and descend
- `J` / `L`: bank and turn
- `G`: landing gear
- `Space`: brakes
- Left panel: throttle, flaps, gear
- Right flight pad: pitch, roll, and yaw
- Camera pad: pan around the aircraft and zoom in/out

The aircraft now uses attitude rates for pitch, roll, and yaw, so the controls change the aircraft's motion instead of playing a fixed animation. Weather wind and turbulence also affect the flight path.
