// Execution inspector for StateTrace.
//
// Presentation only: the automaton logic lives in simulator.js and the drawing
// in fsm.js. This file reads the machine from the editor, asks FsmSimulator for
// the steps, and shows one step at a time on the board and in the inspector.
(function() {
	var ACTIVE = { 'stroke': '#ff6f61', 'fill': '#3a1622' };
	var ACCEPT = { 'stroke': '#46e0a3', 'fill': '#0f3a33' };
	var REJECT = { 'stroke': '#ff4d5e', 'fill': '#42121f' };
	var TRAVERSED = '#ff6f61';
	var STEP_DELAY = 900; // milliseconds per step at 1x speed

	var result = null; // the current FsmSimulator.run() result, or null
	var stepIndex = 0;
	var playing = false;
	var timer = null;
	var animation = null; // the transition currently being played on the board
	var signature = ''; // of the machine the result was computed for
	var summarySignature = null; // of the machine the summary shows
	var reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { 'matches': false };
	var el = {};

	function readMachine() {
		return FsmSimulator.compile(serializeMachine(), { 'normalizeLabel': convertLatexShortcuts });
	}

	// the parts of the machine that change what a simulation means (moving or bending does not)
	function machineSignature() {
		var data = serializeMachine();
		var parts = [];
		for(var i = 0; i < data.nodes.length; i++) {
			parts.push([data.nodes[i].text, data.nodes[i].isAcceptState]);
		}
		for(var i = 0; i < data.links.length; i++) {
			var link = data.links[i];
			parts.push([link.type, link.node, link.nodeA, link.nodeB, link.text]);
		}
		return JSON.stringify(parts);
	}

	function showSymbol(symbol) {
		return symbol == ' ' ? '␣' : symbol;
	}

	function lastIndex() {
		return result.steps.length - 1;
	}

	function add(parent, tag, className, text) {
		var child = document.createElement(tag);
		if(className) child.className = className;
		if(text != null) child.textContent = text;
		parent.appendChild(child);
		return child;
	}

	function setNotices(container, errors, warnings) {
		container.textContent = '';
		for(var i = 0; i < errors.length; i++) add(container, 'p', 'notice error', errors[i]);
		for(var i = 0; i < warnings.length; i++) add(container, 'p', 'notice warning', warnings[i]);
	}

	// ---- the machine as drawn: counts, kind and problems, kept up to date while editing ----

	function renderSummary() {
		var data = serializeMachine();
		var machine = FsmSimulator.compile(data, { 'normalizeLabel': convertLatexShortcuts });
		var transitions = 0;
		for(var i = 0; i < data.links.length; i++) {
			if(data.links[i].type != 'StartLink') transitions++;
		}
		el.statStates.textContent = data.nodes.length;
		el.statTransitions.textContent = transitions;
		el.statAlphabet.textContent = FsmSimulator.symbolSet(machine.alphabet);
		el.statAlphabet.title = el.statAlphabet.textContent;

		var kind;
		if(data.nodes.length == 0) {
			el.modeChip.setAttribute('data-state', 'empty');
			el.modeLabel.textContent = 'No machine';
			el.modeChip.setAttribute('data-tip', 'Draw a machine to see whether it is a DFA or an NFA');
			kind = 'Nothing drawn yet.';
		} else if(machine.errors.length > 0) {
			el.modeChip.setAttribute('data-state', 'invalid');
			el.modeLabel.textContent = 'Not runnable';
			el.modeChip.setAttribute('data-tip', 'The machine has a problem; see the Machine panel');
			kind = 'Fix the problem below to run this machine.';
		} else {
			el.modeChip.setAttribute('data-state', 'valid');
			el.modeLabel.textContent = machine.type;
			if(machine.type == 'DFA') {
				el.modeChip.setAttribute('data-tip', 'Deterministic finite automaton');
				kind = 'Deterministic (DFA): at most one move per state and symbol.' + (machine.complete ? '' : ' A missing transition rejects the input.');
			} else if(machine.hasEpsilon) {
				el.modeChip.setAttribute('data-tip', 'Nondeterministic finite automaton with ε-moves');
				kind = 'Nondeterministic with ε-moves (ε-NFA): states can be entered without reading a symbol.';
			} else {
				el.modeChip.setAttribute('data-tip', 'Nondeterministic finite automaton');
				kind = 'Nondeterministic (NFA): a state has several moves for the same symbol.';
			}
		}
		el.machineKind.textContent = kind;
		setNotices(el.machineProblems, data.nodes.length == 0 ? [] : machine.errors, machine.warnings);
	}

	// ---- one step, in the inspector ----

	function describeStep(step) {
		var machine = result.machine;
		if(step.index == 0) {
			return 'Start in ' + FsmSimulator.stateSet(machine, step.active) + (step.epsilonMoves.length > 0 ? ', the start state and everything reachable by ε-moves.' : '.');
		}
		return 'Read \'' + showSymbol(step.symbol) + '\': ' + FsmSimulator.stateSet(machine, step.from) + ' → ' + FsmSimulator.stateSet(machine, step.active) + (step.halted ? ' (no transition)' : '');
	}

	function moveTexts(step) {
		var machine = result.machine;
		var parts = [];
		var groups = [step.moves, step.epsilonMoves];
		for(var g = 0; g < groups.length; g++) {
			for(var i = 0; i < groups[g].length; i++) {
				var move = groups[g][i];
				parts.push({ 'text': machine.states[move.from].name + ' —' + (move.symbol == null ? FsmSimulator.EPSILON : showSymbol(move.symbol)) + '→ ' + machine.states[move.to].name });
			}
		}
		for(var i = 0; i < step.dead.length; i++) {
			parts.push({ 'text': machine.states[step.dead[i]].name + ' ✗ no transition on \'' + showSymbol(step.symbol) + '\'', 'dead': true });
		}
		return parts;
	}

	function renderTape(step) {
		el.tape.textContent = '';
		var input = result.input;
		if(input.length == 0) {
			add(el.tape, 'span', 'cell empty-cell', 'ε');
		}
		for(var i = 0; i < input.length; i++) {
			var state = i < step.consumed - 1 ? 'done' : (i == step.consumed - 1 ? (step.halted ? 'fail' : 'current') : 'todo');
			add(el.tape, 'span', 'cell ' + state, showSymbol(input[i]));
		}
		var current = el.tape.children[Math.max(step.consumed - 1, 0)];
		el.tape.scrollLeft = Math.max(0, current.offsetLeft - el.tape.clientWidth / 2);
		el.consumed.textContent = input.slice(0, step.consumed).map(showSymbol).join('') || 'ε (nothing yet)';
		el.remaining.textContent = input.slice(step.consumed).map(showSymbol).join('') || 'ε (nothing left)';
		if(input.length == 0) {
			el.consumed.textContent = el.remaining.textContent = 'ε (empty input)';
		}
	}

	function renderStates(step) {
		var machine = result.machine;
		el.statesTitle.textContent = machine.deterministic ? 'Current state' : 'Active states (' + step.active.length + ')';
		el.states.textContent = '';
		for(var i = 0; i < step.active.length; i++) {
			var state = machine.states[step.active[i]];
			add(el.states, 'li', 'chip' + (state.accepting ? ' accepting' : ''), state.name);
		}
		if(step.active.length == 0) {
			add(el.states, 'li', 'chip none', machine.deterministic ? 'None: the machine is stuck' : 'None: every branch died');
		}

		el.moves.textContent = '';
		var moves = moveTexts(step);
		for(var i = 0; i < moves.length; i++) {
			add(el.moves, 'li', moves[i].dead ? 'dead' : '', moves[i].text);
		}
		if(moves.length == 0) {
			add(el.moves, 'li', 'quiet', 'None yet: this is the start.');
		}
	}

	function buildTrace() {
		el.traceBody.textContent = '';
		for(var i = 0; i < result.steps.length; i++) {
			var step = result.steps[i];
			var row = document.createElement('li');
			add(row, 'span', 'n', String(step.index));
			add(row, 'span', 'sym', step.index == 0 ? '•' : showSymbol(step.symbol));
			add(row, 'span', 'set', FsmSimulator.stateSet(result.machine, step.active));
			var moves = moveTexts(step);
			var texts = [];
			for(var j = 0; j < moves.length; j++) texts.push(moves[j].text);
			add(row, 'span', 'detail', texts.length > 0 ? texts.join('   ') : 'start');
			row.tabIndex = 0;
			row.setAttribute('aria-label', 'Step ' + step.index + ': ' + describeStep(step));
			row.onclick = (function(index) {
				return function() { pause(); goTo(index); };
			})(i);
			row.onkeydown = (function(index) {
				return function(e) {
					if(e.key == 'Enter' || e.key == ' ') {
						e.preventDefault();
						pause();
						goTo(index);
					}
				};
			})(i);
			el.traceBody.appendChild(row);
		}
	}

	function renderTrace() {
		var rows = el.traceBody.children;
		for(var i = 0; i < rows.length; i++) {
			// later steps stay hidden so the outcome is not given away early
			rows[i].hidden = i > stepIndex;
			rows[i].className = i == stepIndex ? 'current' : '';
			if(i == stepIndex) rows[i].setAttribute('aria-current', 'step'); else rows[i].removeAttribute('aria-current');
		}
		var row = rows[stepIndex];
		var box = el.traceBody;
		if(row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
			box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight;
		} else if(row.offsetTop < box.scrollTop) {
			box.scrollTop = row.offsetTop;
		}
	}

	function renderControls() {
		var loaded = result != null;
		el.reset.disabled = !loaded;
		el.previous.disabled = !loaded || stepIndex == 0;
		el.next.disabled = !loaded || stepIndex == lastIndex();
		el.play.disabled = !loaded || lastIndex() == 0;
		el.playIcon.setAttribute('href', playing ? '#i-pause' : '#i-play');
		el.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
		el.play.setAttribute('data-tip', playing ? 'Pause' : 'Play');
	}

	function renderInspector() {
		renderControls();
		el.panel.hidden = el.trace.hidden = result == null;
		if(result == null) return;

		var step = result.steps[stepIndex];
		var finished = stepIndex == lastIndex();
		var total = result.input.length;
		el.counter.textContent = stepIndex + ' of ' + total;
		el.progress.style.width = (total == 0 ? 100 : 100 * step.consumed / total) + '%';
		el.step.textContent = 'Step ' + stepIndex + ' of ' + total + ' · ' + describeStep(step);
		renderTape(step);
		renderStates(step);
		renderTrace();

		// the box is always there, so the panel does not jump when the result arrives
		if(finished) {
			el.verdict.className = 'verdict ' + (result.accepted ? 'accepted' : 'rejected');
			el.verdictTitle.textContent = result.accepted ? 'Accepted' : 'Rejected';
			el.verdictText.textContent = result.explanation;
			el.verdictPath.textContent = result.accepted && result.acceptingPath.length > 0 ? 'Accepting path: ' + result.acceptingPathText : '';
		} else {
			el.verdict.className = 'verdict pending';
			el.verdictTitle.textContent = 'Running';
			el.verdictText.textContent = 'The result appears once the last symbol has been read.';
			el.verdictPath.textContent = '';
		}
	}

	// ---- one step, on the board ----

	function markLinks(highlight, moves) {
		for(var i = 0; i < moves.length; i++) {
			highlight.links[moves[i].link] = TRAVERSED;
		}
	}

	// how the board looks once a step has been taken
	function restingHighlight(step, halo) {
		var highlight = { 'nodes': {}, 'links': {}, 'tokens': [] };
		var machine = result.machine;
		var finished = step.index == lastIndex();
		var states = step.halted ? step.from : step.active;
		for(var i = 0; i < states.length; i++) {
			var mark = ACTIVE;
			if(finished && !result.accepted) {
				mark = REJECT;
			} else if(finished && machine.states[states[i]].accepting) {
				mark = ACCEPT;
			}
			highlight.nodes[states[i]] = { 'stroke': mark.stroke, 'fill': mark.fill, 'halo': halo };
		}
		markLinks(highlight, step.moves);
		markLinks(highlight, step.epsilonMoves);
		return highlight;
	}

	// a symbol on its way along the transitions: the states it leaves, and a dot on each transition taken
	function travelHighlight(states, moves, progress) {
		var highlight = { 'nodes': {}, 'links': {}, 'tokens': [] };
		for(var i = 0; i < states.length; i++) {
			highlight.nodes[states[i]] = { 'stroke': ACTIVE.stroke, 'fill': ACTIVE.fill, 'halo': 1 };
		}
		markLinks(highlight, moves);
		for(var link in highlight.links) {
			highlight.tokens.push({ 'link': Number(link), 't': progress });
		}
		return highlight;
	}

	function ease(t) {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}

	function stopAnimation() {
		if(animation != null) {
			cancelAnimationFrame(animation.frame);
			animation = null;
		}
	}

	function showOnBoard(animate) {
		stopAnimation();
		if(result == null) {
			simulationHighlight = null;
			draw();
			return;
		}
		var step = result.steps[stepIndex];
		if(!animate || reducedMotion.matches) {
			simulationHighlight = restingHighlight(step, 1);
			draw();
			return;
		}

		// symbols travel first, then any ε-moves, then the new states light up
		var travel = Math.min(520, delay() * 0.5);
		var phases = [];
		if(step.moves.length > 0) {
			phases.push({ 'states': step.from, 'moves': step.moves, 'duration': travel });
		}
		if(step.epsilonMoves.length > 0) {
			var entered = [];
			for(var i = 0; i < step.moves.length; i++) {
				if(entered.indexOf(step.moves[i].to) == -1) entered.push(step.moves[i].to);
			}
			phases.push({ 'states': step.index == 0 ? [result.machine.start] : entered, 'moves': step.epsilonMoves, 'duration': travel });
		}
		phases.push({ 'duration': Math.min(220, delay() * 0.25) });

		animation = { 'phase': 0, 'started': performance.now(), 'frame': 0 };
		var current = animation;
		function frame(now) {
			if(animation !== current) return;
			var phase = phases[current.phase];
			var progress = Math.min(1, (now - current.started) / phase.duration);
			simulationHighlight = phase.moves ? travelHighlight(phase.states, phase.moves, ease(progress)) : restingHighlight(step, ease(progress));
			render();
			if(progress >= 1) {
				current.phase++;
				current.started = now;
				if(current.phase >= phases.length) {
					animation = null;
					return;
				}
			}
			current.frame = requestAnimationFrame(frame);
		}
		current.frame = requestAnimationFrame(frame);
	}

	// ---- playback ----

	function goTo(index, animate) {
		if(result == null) return;
		var target = Math.max(0, Math.min(lastIndex(), index));
		var forward = target == stepIndex + 1;
		stepIndex = target;
		renderInspector();
		showOnBoard(animate && forward);
	}

	function delay() {
		return STEP_DELAY / Number(el.speed.value);
	}

	function pause() {
		clearTimeout(timer);
		timer = null;
		if(playing) {
			playing = false;
			renderControls();
		}
	}

	function tick() {
		timer = null;
		if(!playing || result == null) return;
		goTo(stepIndex + 1, true);
		if(stepIndex >= lastIndex()) {
			pause();
		} else {
			timer = setTimeout(tick, delay());
		}
	}

	function play() {
		if(result == null || lastIndex() == 0) return;
		if(stepIndex >= lastIndex()) {
			goTo(0);
		}
		playing = true;
		renderControls();
		clearTimeout(timer);
		timer = setTimeout(tick, delay());
	}

	function clearSimulation() {
		pause();
		stopAnimation();
		result = null;
		stepIndex = 0;
		simulationHighlight = null;
	}

	function execute() {
		clearSimulation();
		var outcome = FsmSimulator.run(readMachine(), el.input.value);
		if(!outcome.ok) {
			setNotices(el.messages, outcome.errors, []);
			renderInspector();
			showOnBoard(false);
			return;
		}
		result = outcome;
		signature = machineSignature();
		setNotices(el.messages, [], []);
		buildTrace();
		goTo(0);
		play();
	}

	window.addEventListener('load', function() {
		var ids = {
			'form': 'sim-form', 'input': 'sim-input', 'reset': 'sim-reset', 'previous': 'sim-previous', 'play': 'sim-play',
			'playIcon': 'sim-play-icon', 'next': 'sim-next', 'speed': 'sim-speed', 'speedValue': 'sim-speed-value',
			'messages': 'sim-messages', 'panel': 'sim-panel', 'counter': 'sim-counter', 'progress': 'sim-progress',
			'step': 'sim-step', 'tape': 'sim-tape', 'consumed': 'sim-consumed', 'remaining': 'sim-remaining',
			'statesTitle': 'sim-states-title', 'states': 'sim-states', 'moves': 'sim-moves',
			'verdict': 'sim-verdict', 'verdictTitle': 'sim-verdict-title', 'verdictText': 'sim-verdict-text',
			'verdictPath': 'sim-verdict-path', 'trace': 'sim-trace', 'traceBody': 'sim-trace-body',
			'modeChip': 'mode-chip', 'modeLabel': 'mode-label', 'statStates': 'stat-states',
			'statTransitions': 'stat-transitions', 'statAlphabet': 'stat-alphabet', 'machineKind': 'machine-kind',
			'machineProblems': 'machine-problems',
		};
		for(var name in ids) {
			el[name] = document.getElementById(ids[name]);
		}

		el.form.onsubmit = function(e) {
			e.preventDefault();
			execute();
		};
		el.reset.onclick = function() { pause(); goTo(0); };
		el.previous.onclick = function() { pause(); goTo(stepIndex - 1); };
		el.next.onclick = function() { pause(); goTo(stepIndex + 1, true); };
		el.play.onclick = function() {
			if(playing) pause(); else play();
		};
		el.speed.oninput = function() {
			el.speedValue.textContent = Number(el.speed.value) + '×';
		};
		el.speed.oninput();

		drawHooks.push(function() {
			var current = machineSignature();
			// editing the machine makes the computed steps stale, so drop them rather than show a wrong run
			if(result != null && current != signature) {
				clearSimulation();
				setNotices(el.messages, [], ['The machine was edited, so the trace was cleared. Press Execute to run it again.']);
				renderInspector();
			}
			if(current != summarySignature) {
				summarySignature = current;
				renderSummary();
			}
		});

		renderInspector();
		renderSummary();
		summarySignature = machineSignature();
	});
})();
