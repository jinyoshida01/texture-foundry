# Texture Foundry

A browser tool for making looping textures. Stack textures and effects, tweak them with sliders, animate them, and export the result.

**Live:** https://jinyoshida01.github.io/texture-foundry/

## What it does

- 60+ texture and effect layers that stack with blend modes
- Loops up to 30 seconds that start and end on the same frame
- Keyframe timeline with easing curves
- 3D shapes, or your own GLB, glTF, OBJ or STL model (glTF animations play)
- Preset library you can reorder, import and export
- Export to PNG, JPEG, WebP, GIF, MP4 and WebM

Everything runs locally in the browser. Nothing is uploaded.

## Running it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

## Editing

The code lives in `src/`. After changing it, rebuild the page:

```sh
python3 build.py
```

Built with [three.js](https://threejs.org/) r128. Video export uses [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) and [webm-muxer](https://github.com/Vanilagy/webm-muxer).

---

Made by [Jin Yoshida](https://www.jinyoshida.me/).
