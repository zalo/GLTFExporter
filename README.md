# [GLTFExporter](https://zalo.github.io/GLTFExporter/)

<p align="left">
  <a href="https://github.com/zalo/GLTFExporter/deployments/activity_log?environment=github-pages">
      <img src="https://img.shields.io/github/deployments/zalo/GLTFExporter/github-pages?label=Github%20Pages%20Deployment" title="Github Pages Deployment"></a>
  <a href="https://github.com/zalo/GLTFExporter/commits/master">
      <img src="https://img.shields.io/github/last-commit/zalo/GLTFExporter" title="Last Commit Date"></a>
  <!--<a href="https://github.com/zalo/GLTFExporter/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/zalo/GLTFExporter" title="License: Apache V2"></a> -->
</p>

Ultra-simple one-off tool for importing an .fbx, applying a texture to it, and exporting it as a .gltf.

Based on the [three.js GLTF Exporter](https://threejs.org/examples/?q=gltf#misc_exporter_gltf): https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_gltf.html

 # Building

This toy can either be run without building (in Chrome/Edge/Opera since raw three.js examples need [Import Maps](https://caniuse.com/import-maps)), or built with:
```
npm install
npm run build
```
If building manually, make sure to edit the index .html to point from `"./src/main.js"` to `"./build/main.js"`.

 # Dependencies
 - [three.js](https://github.com/mrdoob/three.js/) (3D Rendering Engine)
 - [esbuild](https://github.com/evanw/esbuild/) (Bundler)
