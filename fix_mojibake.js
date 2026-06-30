const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

// Fix all mojibake patterns
// gia_Ä'Äƒng -> gia_đăng
c = c.split('gia_\u0110\u0103ng').join('gia_đăng');  // uppercase Đ variant
c = c.split('gia_Ä\u0092Ä\u0192ng').join('gia_đăng'); // another variant

// Direct hex replacement for the mojibake pattern
// Mojibake hex: c384 e280 98 c384 c692 = Ä'Äƒ (which should be đăng)
const mojibakeDang = Buffer.from('c384e28098c384c692', 'hex').toString('utf8');
const correctDang = 'đă';
c = c.split('gia_' + mojibakeDang + 'ng').join('gia_đăng');

// phi_ha_tang3.000_â‚« -> phi_ha_tang3.000_₫
const mojibakeDong = Buffer.from('c3a2e2809ac2ab', 'hex').toString('utf8');
const correctDong = '₫';
c = c.split('phi_ha_tang3.000_' + mojibakeDong).join('phi_ha_tang3.000_₫');

// Also fix gia_đong_goi (the đ in đong might be mojibake too)
// Check: gia_Ä'ong should be gia_đong
const mojibakeDo = Buffer.from('c384e28098', 'hex').toString('utf8');
// Actually looking at the hex, gia_đong = c491, which is correct đ
// The mojibake is only Ä'Äƒ pattern

// Count replacements
const remaining = c.match(/gia_Ä/g);
console.log('Remaining mojibake gia_ patterns:', remaining ? remaining.length : 0);

const remainingPhi = c.match(/phi_ha_tang3\.000_â/g);
console.log('Remaining mojibake phi_ patterns:', remainingPhi ? remainingPhi.length : 0);

fs.writeFileSync('app.js', c, 'utf8');
console.log('Done fixing!');
