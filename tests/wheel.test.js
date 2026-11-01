const {test}=require('node:test');const assert=require('node:assert/strict');const W=require('../app/src/main/assets/wheel.js');
test('all 25 saved choices stop at the corresponding pointer sector',()=>{for(let i=0;i<25;i++)assert.equal(W.pointedIndex(W.target(i)),i);assert.equal(W.DURATION,10000);assert.throws(()=>W.target(25))});
