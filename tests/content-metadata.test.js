const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../app/src/main/assets/catalog.json');
test('catalog records include explicit verification status and source metadata', () => {
  assert.equal(catalog.length, 25);
  const films = catalog.flatMap(d => d.films);
  assert.equal(films.length, 150);
  for (const record of [...catalog, ...films]) {
    assert.ok(['verified', 'partial', 'preliminary'].includes(record.verification_status), record.id);
    assert.ok(Array.isArray(record.source_urls) && record.source_urls.length, record.id);
    for (const url of record.source_urls) assert.match(url, /^https:\/\//, record.id);
  }
});
