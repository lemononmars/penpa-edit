const fs = require('fs');
const metadata = JSON.parse(fs.readFileSync('variant_metadata.json', 'utf8'));
const variant = (Array.isArray(metadata) ? metadata : Object.keys(metadata).map(k=>metadata[k]).flat()).find(v => v && v.id === 'weightedlittlekiller');
console.log(variant);
