const fs = require('fs');
const metadata = JSON.parse(fs.readFileSync('variant_metadata.json', 'utf8'));
const variant = metadata.find(v => v.id === 'weightedlittlekiller' || v.id === 'weighted little killer');
console.log(variant);
