// Tests for the simulator shared by StateTrace2 and the FSM Designer (public/tools/*/simulator.js).
// StateTrace itself is tested in its own repository, github.com/NafeesMansoor/StateTrace.
// The file is a classic browser script, so it is evaluated here exactly as shipped.
// Machines are written in the format fsm.js saves: serializeMachine().
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/tools/statetrace2/simulator.js', import.meta.url), 'utf8');
vm.runInThisContext(source, { filename: 'simulator.js' });
const { compile, run, simulate } = globalThis.FsmSimulator;

test('both tools ship the same simulator', () => {
  assert.equal(readFileSync(new URL('../public/tools/fsm-designer/simulator.js', import.meta.url), 'utf8'), source);
});

const node = (text, isAcceptState = false) => ({ x: 0, y: 0, text, isAcceptState });
const start = (index) => ({ type: 'StartLink', node: index, text: '', deltaX: -50, deltaY: 0 });
const link = (a, b, text) => ({ type: 'Link', nodeA: a, nodeB: b, text, lineAngleAdjust: 0, parallelPart: 0.5, perpendicularPart: 0 });
const loop = (index, text) => ({ type: 'SelfLink', node: index, text, anchorAngle: 0 });

const names = (result, indices) => indices.map((index) => result.machine.states[index].name);
const activeNames = (result) => result.steps.map((step) => names(result, step.active));

// DFA over {0, 1}: accepts strings with an even number of 1s
const evenOnes = {
  nodes: [node('even', true), node('odd')],
  links: [start(0), loop(0, '0'), link(0, 1, '1'), loop(1, '0'), link(1, 0, '1')],
};

// NFA over {a, b}: accepts strings ending in "ab"
const endsInAb = {
  nodes: [node('q0'), node('q1'), node('q2', true)],
  links: [start(0), loop(0, 'a,b'), link(0, 1, 'a'), link(1, 2, 'b')],
};

// ε-NFA: a*b*, with an ε-move from the a-loop to the b-loop
const aStarBStar = {
  nodes: [node('A'), node('B', true)],
  links: [start(0), loop(0, 'a'), link(0, 1, '\\epsilon'), loop(1, 'b')],
};

test('DFA: recognised as deterministic and complete', () => {
  const machine = compile(evenOnes);
  assert.deepEqual(machine.errors, []);
  assert.equal(machine.type, 'DFA');
  assert.equal(machine.deterministic, true);
  assert.equal(machine.complete, true);
  assert.deepEqual(machine.alphabet, ['0', '1']);
  assert.equal(machine.start, 0);
});

test('DFA: accepts and rejects, one state per step', () => {
  const accepted = simulate(evenOnes, '0110');
  assert.equal(accepted.ok, true);
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.outcome, 'accepted');
  assert.deepEqual(activeNames(accepted), [['even'], ['even'], ['odd'], ['even'], ['even']]);
  assert.match(accepted.explanation, /stopped in even, which is an accepting state/);
  assert.equal(accepted.acceptingPathText, 'even —0→ even —1→ odd —1→ even —0→ even');

  const rejected = simulate(evenOnes, '010');
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.outcome, 'not-accepting');
  assert.deepEqual(activeNames(rejected), [['even'], ['even'], ['odd'], ['odd']]);
  assert.match(rejected.explanation, /stopped in odd, which is not an accepting state/);
});

test('DFA: every step records the symbol, the link taken, and what is consumed', () => {
  const result = simulate(evenOnes, '10');
  assert.equal(result.steps.length, 3);
  assert.deepEqual(result.steps[0], {
    index: 0, consumed: 0, symbol: null, from: [], moves: [], epsilonMoves: [], dead: [], active: [0], halted: false,
  });
  assert.deepEqual(result.steps[1].moves, [{ from: 0, to: 1, symbol: '1', link: 2 }]);
  assert.deepEqual(result.steps[1].from, [0]);
  assert.equal(result.steps[1].consumed, 1);
  assert.deepEqual(result.steps[2].moves, [{ from: 1, to: 1, symbol: '0', link: 3 }]);
});

test('empty input: decided by the start state', () => {
  const accepted = simulate(evenOnes, '');
  assert.equal(accepted.steps.length, 1);
  assert.equal(accepted.accepted, true);
  assert.deepEqual(accepted.acceptingPath, []);
  assert.match(accepted.explanation, /empty string is accepted because the start state even/);

  const rejected = simulate(endsInAb, '');
  assert.equal(rejected.accepted, false);
  assert.match(rejected.explanation, /empty string is rejected because the start state q0 is not an accepting state\./);
});

test('NFA: detected, and all branches are tracked as a set of states', () => {
  const machine = compile(endsInAb);
  assert.equal(machine.type, 'NFA');
  assert.equal(machine.deterministic, false);
  assert.equal(machine.hasEpsilon, false);

  const result = run(machine, 'aab');
  assert.equal(result.accepted, true);
  assert.deepEqual(activeNames(result), [['q0'], ['q0', 'q1'], ['q0', 'q1'], ['q0', 'q2']]);
  assert.match(result.explanation, /\{q2\} is accepting, so at least one computation branch accepts/);
});

test('NFA: branching moves and dying branches are reported per step', () => {
  const result = simulate(endsInAb, 'aab');
  // reading the first a forks q0 into q0 and q1
  assert.deepEqual(result.steps[1].moves, [
    { from: 0, to: 0, symbol: 'a', link: 1 },
    { from: 0, to: 1, symbol: 'a', link: 2 },
  ]);
  assert.deepEqual(result.steps[1].dead, []);
  // reading the second a: the branch sitting in q1 has no a-transition and dies
  assert.deepEqual(names(result, result.steps[2].dead), ['q1']);
  assert.deepEqual(names(result, result.steps[2].active), ['q0', 'q1']);
});

test('NFA: accepting path is a real path through the machine', () => {
  const result = simulate(endsInAb, 'abab');
  assert.equal(result.accepted, true);
  assert.equal(result.acceptingPathText, 'q0 —a→ q0 —b→ q0 —a→ q1 —b→ q2');
  const path = result.acceptingPath;
  assert.equal(path[0].from, result.machine.start);
  assert.equal(result.machine.states[path[path.length - 1].to].accepting, true);
  assert.deepEqual(path.map((move) => move.symbol), ['a', 'b', 'a', 'b']);
  for (let i = 1; i < path.length; i++) assert.equal(path[i].from, path[i - 1].to);
  for (const move of path) {
    assert.ok(result.machine.transitions.some((t) => t.from === move.from && t.to === move.to && t.symbol === move.symbol && t.link === move.link));
  }
});

test('NFA: rejects when no branch ends in an accepting state', () => {
  const result = simulate(endsInAb, 'aba');
  assert.equal(result.accepted, false);
  assert.equal(result.outcome, 'not-accepting');
  assert.deepEqual(names(result, result.steps.at(-1).active), ['q0', 'q1']);
  assert.match(result.explanation, /none of the states the machine can be in, \{q0, q1\}, is accepting/);
  assert.equal(result.acceptingPath, null);
});

test('NFA: a branch that passes through an accepting state mid-input does not accept', () => {
  const result = simulate(endsInAb, 'abb');
  assert.deepEqual(names(result, result.steps[2].active), ['q0', 'q2']);
  assert.equal(result.accepted, false);
});

test('ε-NFA: the start set and every step include the ε-closure', () => {
  const machine = compile(aStarBStar);
  assert.deepEqual(machine.errors, []);
  assert.equal(machine.type, 'ε-NFA');
  assert.deepEqual(machine.alphabet, ['a', 'b']);

  const result = run(machine, 'aabb');
  assert.equal(result.accepted, true);
  assert.deepEqual(activeNames(result), [['A', 'B'], ['A', 'B'], ['A', 'B'], ['B'], ['B']]);
  assert.deepEqual(result.steps[0].epsilonMoves, [{ from: 0, to: 1, symbol: null, link: 2 }]);
  assert.deepEqual(result.steps[1].epsilonMoves, [{ from: 0, to: 1, symbol: null, link: 2 }]);
  assert.equal(result.acceptingPathText, 'A —a→ A —a→ A —ε→ B —b→ B —b→ B');
});

test('ε-NFA: empty string accepted through ε-moves alone, and ba rejected', () => {
  const empty = simulate(aStarBStar, '');
  assert.equal(empty.accepted, true);
  assert.match(empty.explanation, /B, an accepting state, can be reached from the start state by ε-moves alone/);
  assert.equal(empty.acceptingPathText, 'A —ε→ B');

  const rejected = simulate(aStarBStar, 'ba');
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.outcome, 'stuck');
  assert.equal(rejected.steps.length, 3);
  assert.equal(rejected.steps[2].halted, true);
});

test('ε-NFA: chains and cycles of ε-moves terminate and reach every state', () => {
  const cycle = {
    nodes: [node('p'), node('q'), node('r'), node('s', true)],
    links: [start(0), link(0, 1, 'ε'), link(1, 2, 'λ'), link(2, 0, '\\lambda'), link(2, 3, 'x')],
  };
  const result = simulate(cycle, 'x');
  assert.deepEqual(activeNames(result), [['p', 'q', 'r'], ['s']]);
  assert.equal(result.accepted, true);
  assert.equal(result.acceptingPathText, 'p —ε→ q —ε→ r —x→ s');
});

test('labels: comma lists, mixed ε, whitespace, and the editor\'s LaTeX shortcuts', () => {
  const machine = compile(
    { nodes: [node('q_0'), node('q_1', true)], links: [start(0), link(0, 1, ' a , \\epsilon ,b,a'), loop(1, '\\alpha')] },
    { normalizeLabel: (text) => text.replace(/\\epsilon/g, 'ε').replace(/\\alpha/g, 'α').replace(/_0/g, '₀').replace(/_1/g, '₁') },
  );
  assert.deepEqual(machine.errors, []);
  assert.deepEqual(machine.states.map((state) => state.name), ['q₀', 'q₁']);
  assert.deepEqual(machine.alphabet, ['a', 'b', 'α']);
  assert.equal(machine.hasEpsilon, true);
  assert.deepEqual(machine.transitions.map((t) => t.symbol), ['a', null, 'b', 'α']);
  assert.equal(run(machine, 'bαα').accepted, true);
});

test('missing transition in a DFA: the machine gets stuck and rejects', () => {
  const partial = { nodes: [node('s'), node('t', true)], links: [start(0), link(0, 1, 'a'), loop(1, 'b')] };
  const machine = compile(partial);
  assert.equal(machine.type, 'DFA');
  assert.equal(machine.complete, false);

  const result = run(machine, 'aab');
  assert.equal(result.accepted, false);
  assert.equal(result.outcome, 'stuck');
  assert.equal(result.steps.length, 3, 'stops at the symbol that cannot be read');
  assert.deepEqual(result.steps[2].active, []);
  assert.deepEqual(names(result, result.steps[2].from), ['t']);
  assert.deepEqual(names(result, result.steps[2].dead), ['t']);
  assert.equal(result.explanation, "State t has no transition on 'a' (position 2), so the machine cannot continue. 1 symbol was left unread.");
});

test('invalid input symbol: reported with its position, run still explained', () => {
  const result = simulate(evenOnes, '01x1');
  assert.equal(result.ok, true);
  assert.equal(result.accepted, false);
  assert.equal(result.outcome, 'invalid-symbol');
  assert.deepEqual(result.invalidSymbols, [{ symbol: 'x', position: 3 }]);
  assert.equal(result.steps.length, 4);
  assert.match(result.explanation, /symbol 'x' at position 3 is not in the alphabet of this machine, \{0, 1\}/);
  assert.match(result.explanation, /1 symbol was left unread/);
});

test('missing start state is an error, not a crash', () => {
  const result = simulate({ nodes: [node('a', true)], links: [loop(0, '1')] }, '1');
  assert.equal(result.ok, false);
  assert.equal(result.steps.length, 0);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /no start state/);
});

test('malformed machines are reported', () => {
  assert.match(simulate({ nodes: [], links: [] }, 'a').errors[0], /board is empty/);
  assert.match(simulate(null, 'a').errors[0], /board is empty/);
  assert.match(simulate({}, 'a').errors[0], /board is empty/);

  const twoStarts = simulate({ nodes: [node('a'), node('b')], links: [start(0), start(1)] }, '');
  assert.match(twoStarts.errors[0], /2 start states \{a, b\}/);

  const unlabelled = simulate({ nodes: [node('a'), node('b')], links: [start(0), link(0, 1, '  ')] }, '');
  assert.match(unlabelled.errors[0], /transition a → b has no label/);

  const longLabel = simulate({ nodes: [node('a'), node('b')], links: [start(0), link(0, 1, 'ab')] }, '');
  assert.match(longLabel.errors[0], /labelled "ab"\. Each symbol must be a single character/);

  const dangling = simulate({ nodes: [node('a')], links: [start(0), link(0, 4, 'x'), { type: 'StartLink', node: 9 }, { type: 'Wormhole' }, null] }, '');
  assert.equal(dangling.ok, false);
  assert.equal(dangling.errors.length, 4);
});

test('two start arrows on the same state are fine', () => {
  const machine = compile({ nodes: [node('a', true)], links: [start(0), start(0)] });
  assert.deepEqual(machine.errors, []);
  assert.equal(machine.start, 0);
});

test('warnings: no accepting state, unnamed and duplicate names', () => {
  const machine = compile({ nodes: [node(''), node('q'), node('q')], links: [start(0), link(0, 1, 'a'), link(0, 2, 'a')] });
  assert.deepEqual(machine.errors, []);
  assert.equal(machine.states[0].name, '#1');
  assert.equal(machine.warnings.length, 3);
  assert.equal(machine.type, 'NFA');
  assert.equal(run(machine, 'a').accepted, false);
});

test('parallel links with the same symbol and target stay deterministic', () => {
  const machine = compile({ nodes: [node('a'), node('b', true)], links: [start(0), link(0, 1, 'x'), link(0, 1, 'x')] });
  assert.equal(machine.type, 'DFA');
  const result = run(machine, 'x');
  assert.equal(result.accepted, true);
  assert.deepEqual(result.steps[1].moves.map((move) => move.link), [1, 2]);
});

test('steps are reversible: rerunning gives identical, independent results', () => {
  const machine = compile(endsInAb);
  const first = run(machine, 'abab');
  const snapshot = JSON.stringify(first.steps);
  const second = run(machine, 'abab');
  run(machine, 'bbbb');
  assert.equal(JSON.stringify(first.steps), snapshot);
  assert.equal(JSON.stringify(second.steps), snapshot);
  first.steps.forEach((step, index) => {
    assert.equal(step.index, index);
    assert.equal(step.consumed, index);
    if (index > 0) assert.deepEqual(step.from, first.steps[index - 1].active);
  });
});

test('input is read by code point, so symbols outside the BMP count once', () => {
  const machine = compile({ nodes: [node('a'), node('b', true)], links: [start(0), link(0, 1, '😀')] });
  assert.deepEqual(machine.errors, []);
  const result = run(machine, '😀');
  assert.equal(result.steps.length, 2);
  assert.equal(result.accepted, true);
});
