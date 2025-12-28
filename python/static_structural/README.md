# Weather Dashboard - Static/Structural Failure

## Difficulty: ⭐⭐
## Pillar: Static + Structural Failures

## What This Project Does (When Fixed)

A terminal-based weather dashboard that displays:
- Current temperature with ASCII art thermometer
- 5-day forecast with trend visualization
- Weather alerts with color coding
- Humidity and wind speed gauges

## Symptoms

When you try to run `python main.py`:
- Import errors cascade through multiple files
- Some imports reference non-existent modules
- Circular dependency prevents startup
- The application never reaches the main display logic

## Expected Success State

```
╔══════════════════════════════════════════════════════════╗
║           🌤️  WEATHER DASHBOARD - San Francisco          ║
╠══════════════════════════════════════════════════════════╣
║  CURRENT: 68°F  ████████████░░░░░░░░  Partly Cloudy     ║
║                                                          ║
║  5-DAY FORECAST:                                         ║
║  Mon: 65°F ▂▄   Tue: 70°F ▄▆   Wed: 72°F ▆█            ║
║  Thu: 68°F ▄▆   Fri: 63°F ▂▄                            ║
║                                                          ║
║  💧 Humidity: 45%  💨 Wind: 12 mph NW                   ║
╚══════════════════════════════════════════════════════════╝
```

## How to Verify Success

```bash
python main.py
```

The dashboard should render without errors and display mock weather data.

## What Makes This Realistic

- Real-world module organization patterns
- Common mistakes when refactoring imports
- Circular dependencies that arise from feature additions
- The kind of structural bugs that break during "quick fixes"

## Files

- `main.py` - Entry point
- `weather/api.py` - Data fetching (mock)
- `weather/models.py` - Data structures
- `display/renderer.py` - ASCII rendering
- `display/widgets.py` - UI components
- `utils/formatters.py` - Data formatting
- `utils/colors.py` - Terminal colors
