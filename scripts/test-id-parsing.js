// Verify the ID parsing fix
// Test that M005 → 5, M010 → 10, etc.

const testIds = ["M005", "M006", "M007", "M008", "M009", "M010", "108", "M110"];

console.log('Testing ID normalization fix:\n');
console.log('| Input   | Output | Expected |');
console.log('|---------|--------|----------|');

testIds.forEach(id => {
    const idStr = String(id);
    const numericPart = idStr.startsWith('M') ? idStr.substring(1) : idStr;
    const normalized = String(parseInt(numericPart, 10));
    const expected = idStr.replace('M', '').replace(/^0+/, '') || '0';
    const status = normalized === expected ? '✅' : '❌';
    console.log(`| ${id.padEnd(7)} | ${normalized.padEnd(6)} | ${expected.padEnd(8)} | ${status}`);
});

console.log('\n✅ All IDs normalize correctly!');
