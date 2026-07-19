const fs = require('fs');
const metadata = JSON.parse(fs.readFileSync('variant_metadata.json', 'utf8'));
const variant = Object.keys(metadata).map(k=>metadata[k]).flat().find(v => v.id === 'weightedlittlekiller');
console.log(variant.id.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
