const fs = require('fs');
const c = fs.readFileSync('app.js', 'utf8');

// Check for the correct Vietnamese string
console.log('Has gia_đăng:', c.includes('gia_đăng'));
console.log('Has gia_dang (ascii):', c.includes("gia_dang'"));

// Find all unique gia_ patterns
const matches = c.match(/gia_[^\s'"]+ng/g);
if (matches) {
    const unique = [...new Set(matches)];
    unique.forEach(m => {
        const hex = Buffer.from(m).toString('hex');
        console.log(`Pattern: "${m}" => hex: ${hex}`);
    });
}

// Check phi_ha_tang
const phiMatches = c.match(/phi_ha_tang[^\s'"]+/g);
if (phiMatches) {
    [...new Set(phiMatches)].forEach(m => {
        const hex = Buffer.from(m).toString('hex');
        console.log(`Phi pattern: "${m}" => hex: ${hex}`);
    });
}
