# A350-FlightSim
A350 FLIGHT SIMULATOR
# A350-900 Web Simulator

An early open-source Airbus A350-900 style flight simulator for the web.

This first build runs as a static Three.js app and includes a procedural A350-900 placeholder, runway environment, basic flight physics, HUD, throttle, flaps, and landing gear.

## Run locally

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Controls

- `W` / `S`: throttle
- Arrow down / up: climb and descend
- Arrow left / right: bank and turn
- `A` / `D` or `Q` / `E`: yaw / rotate
- `K` / `I`: climb and descend
- `J` / `L`: bank and turn
- `G`: landing gear
- `Space`: brakes
- Left panel: throttle, flaps, gear
- Right pad: up arrow descends, down arrow climbs, side arrows bank, curved arrows rotate

The climb control also applies takeoff thrust assist so the aircraft can leave the runway quickly in the current arcade flight model.
