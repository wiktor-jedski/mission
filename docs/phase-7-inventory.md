# Phase 7 Effects Inventory

This implementation note maps every Phase 7 effect to its host component and outlines the core flows that must remain entirely unaffected.

## Effect Locations

- **Preferences State (`lib/player/preferences.ts`)**: Uses standard client-side state combined with an isolated `localStorage` adapter.
- **Preferences UI (`components/player/EffectSettings.tsx`)**: Placed within the player layout (e.g., `PlayerHome` or `MapView` shell) without interrupting navigation.
- **Intro Overlay (`components/player/IntroOverlay.tsx`)**: Renders over or before `PlayerHome.tsx`. Once skipped or finished, the user accesses the unchanged `PlayerHome.tsx`.
- **Map Reveal Animation (`components/player/MapView.tsx`)**: Replaces the static fragment render with a CSS-animated rendering *only* if the fragment is newly revealed. The underlying grid state matches exactly the pre-Phase 7 structure.
- **Full-Map Effect (`components/player/MapView.tsx`)**: Applied as a wrapper styling or sibling element beside the final prize access button.
- **Audio Unlock (`components/player/MapView.tsx`)**: Triggered directly by the first user interaction (e.g. click) within the map view. The obelisk sound only plays within `MapView.tsx` during reveal animations.

## Core Flows That Must Remain Unaffected

1. **Player Authentication**: Login, session persistence, and logout must work exactly as before.
2. **Quest Submission**: A team must be able to view quests, submit proof, and resubmit if rejected, with or without any effects enabled.
3. **Map State Accuracy**: The number of revealed fragments must always faithfully represent the database state. Effects must only delay visual feedback slightly (if animation is enabled), never alter the core number.
4. **Admin Shell**: Admin login, pending submissions viewing, approval, and rejection must have **zero** interference from player-side client effects.
5. **Privacy and Isolation**: Reveal events must only be triggered by the logged-in team's progress. No effect logic may leak the other team's progress.
