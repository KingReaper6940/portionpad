import {parseAmount as parse} from '../src/math.mjs';import test from 'node:test';import assert from 'node:assert/strict';import {plan,normalize} from '../src/plan.mjs';import {EXAMPLE} from '../src/example.mjs';
const copy=()=>structuredClone(EXAMPLE);
test('servings scale exactly while hold and manual policies remain explicit',()=>{const r=plan(copy());assert.equal(r.factor,'1 1/2');assert.equal(r.rows[0].exact,'375');assert.equal(r.rows[1].exact,'2');assert.equal(r.rows[4].exact,'1');assert.equal(r.rows[5].exact,null);});
test('anchor uses the same unit and reports proportional yield',()=>{const p=copy();p.mode='anchor';const r=plan(p);assert.equal(r.factor,'1 2/5');assert.equal(r.rows[0].exact,'350');assert.equal(r.servings,'5 3/5');});
test('rounding reports its exact difference and highlights zero',()=>{const p=copy();p.target='1';p.rounding=1;const r=plan(p);assert.equal(r.rows[3].exact,'1/12');assert.equal(r.rows[3].display,'0');assert.equal(r.rows[3].delta,'-1/12');assert.equal(r.rows[3].roundedToZero,true);assert.equal(r.rows[4].delta,'0');});
test('rejects zero anchor, held anchor, invalid amounts and extreme factors',()=>{for(const change of [p=>p.base='0',p=>p.rows[0].amount='0',p=>p.rows[0].policy='hold',p=>p.available='1000000']){const p=copy();p.mode='anchor';change(p);assert.throws(()=>plan(p));}});
test('bounded project validation rejects malformed rows and text',()=>{for(const change of [p=>p.rows=[],p=>p.rows[0].name='',p=>p.rows[0].note='a'.repeat(121),p=>p.rounding=3,p=>p.anchor=-1]){const p=copy();change(p);assert.throws(()=>normalize(p));}});

test('400 serving ratios preserve exact proportional amounts',()=>{
 for(let base=1;base<=20;base++)for(let target=1;target<=20;target++){const p=copy();p.base=String(base);p.target=String(target);p.rows=[{name:'Thirds',amount:'1/3',unit:'cup',policy:'scale',note:''}];p.anchor=0;const r=plan(p);const parsed=parse(r.rows[0].exact);assert.equal(parsed.n*BigInt(base)*3n,BigInt(target)*parsed.d);}
});
test('large exact amounts do not rely on floating point rounding',()=>{const p=copy();p.base='1';p.target='1000';p.rows[0].amount='1000000';assert.equal(plan(p).rows[0].exact,'1000000000');});
