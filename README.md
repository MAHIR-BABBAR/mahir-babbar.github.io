# Mahir Babbar — portfolio

A 3D showpiece: a glowing network of nodes and links (the shape of a
distributed system) turns behind a giant 3D name, the camera flies through
keyframed scenes as you scroll, and the network re-forms per project: a cube
lattice of containers, a retrieval ring, a jittering adversarial graph. Bloom,
chromatic aberration, grain, glass panels, kinetic marquees.

Stack: Vite · React 19 · Three.js via React Three Fiber + drei + postprocessing ·
GSAP ScrollTrigger · Framer Motion (card tilt) · Lenis. No analytics, no trackers.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
```

## Edit the content

Every word on the site lives in `src/data/profile.js`. Components only render
what they find there.

Colours, type and spacing are CSS variables at the top of `src/styles/global.css`.
The scroll choreography (camera, network position, shape, colour, dimming per
section) is the keyframe list in `src/world/keyframes.js`; each keyframe is
anchored to a section id, so adding a section means adding a keyframe.

The 3D name uses `public/fonts/Unbounded-Black.ttf`, a Latin subset of the
open-licence Unbounded font. The rest of the type comes from Google Fonts.

## Deploy

**Vercel / Netlify** — import the repo, framework "Vite", build command
`npm run build`, output directory `dist`.

**GitHub Pages** — if the site lives at `https://<user>.github.io/<repo>/`, set
`base: '/<repo>/'` in `vite.config.js` (the 3D font path follows it), build,
and publish `dist/`.

## Accessibility and performance notes

- `prefers-reduced-motion`, or no WebGL: a static poster with the name replaces
  the world; no intro, no animation.
- The three.js bundle is lazy-loaded behind the intro; the render loop pauses
  while the tab is hidden. If the WebGL world fails to start on a device, the
  poster takes its place and the rest of the page keeps working. Device pixel ratio is capped at 1.5 on phones and
  2 on desktop; phones get a lighter network and fewer particles.
- The name is also present as a screen-reader-only heading; all controls are
  real links and buttons with visible focus rings.

## Design source

`design/project/` holds the Design canvas for the first (terminal-themed)
version, which this build replaced. It is not part of the build.
