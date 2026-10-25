import test from 'node:test';import assert from 'node:assert/strict';import {parseAmount as p,format,mul,div,sub,rounded} from '../src/math.mjs';
test('parses and reduces exact amounts',()=>{for(const [input,output] of [['1 1/2','1 1/2'],['0.125','1/8'],['4/6','2/3'],['0','0']])assert.equal(format(p(input)),output);});
test('rejects ambiguous, negative and excessive amounts',()=>{for(const value of ['','-1','1/0','1/1001','1.2345','1-2','½','2 cups','1000001','1e2'])assert.throws(()=>p(value));});
test('arithmetic keeps exact thirds and reversible ratios',()=>{assert.equal(format(mul(p('1/3'),p('3'))),'1');assert.equal(format(div(p('3/4'),p('1/2'))),'1 1/2');assert.equal(format(sub(p('1/2'),p('2/3'))),'-1/6');});
test('rounding is explicit and halves round up',()=>{assert.equal(format(rounded(p('1/3'),8)),'3/8');assert.equal(format(rounded(p('1/16'),8)),'1/8');assert.equal(format(rounded(p('1/100'),8)),'0');});
