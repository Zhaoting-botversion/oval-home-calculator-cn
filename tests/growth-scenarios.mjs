import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual shared screen/print component without a browser.
const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const formatters = source.slice(source.indexOf('const currency ='), source.indexOf('const bands ='));
const component = source.slice(source.indexOf('function GrowthScenarios('), source.indexOf('type OverviewGroup ='));
const js = ts.transpileModule(formatters + component, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = vm.createContext({ React: { createElement: (type, props, ...children) => ({ type, props, children }) } });
vm.runInContext(js, context);
const output = JSON.stringify(context.GrowthScenarios({ price: 1_000_000, totalCost: 1_100_000, noi: 40_000, exchangeRate: 9 }));
for (const expected of ['-0.91%', '3.64%', '5.45%', '8.18%', '10.0%', '-£50,000', '£1,070,000']) {
  assert.ok(output.includes(expected), `Missing expected calculation: ${expected}`);
}
const zero = JSON.stringify(context.GrowthScenarios({ price: 0, totalCost: 0, noi: 0, exchangeRate: 9 }));
assert.equal((zero.match(/不适用/g) || []).length, 5);
assert.ok(!zero.includes('NaN') && !zero.includes('Infinity'));
console.log('Growth scenarios: all calculation and zero-cost checks passed.');
