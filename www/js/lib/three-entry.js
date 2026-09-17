// Entry for `npm run vendor:three` — bundles three.js into an IIFE global `THREE`
// (plus GLTFLoader for the rigged Mr Owl model in the first-person view).
// ESM on both lines so the loader and the core share one copy of three.
export * from 'three';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
