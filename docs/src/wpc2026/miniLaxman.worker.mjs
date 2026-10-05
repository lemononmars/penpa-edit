import { generateMiniLaxman } from './miniLaxman.mjs';

self.onmessage = ({ data }) => {
  try { self.postMessage({ puzzle: generateMiniLaxman(data.size, data.seed) }); }
  catch (error) { self.postMessage({ error: error?.message || 'Could not generate a puzzle.' }); }
};
