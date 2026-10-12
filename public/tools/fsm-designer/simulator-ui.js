// Simulator controls for the FSM Designer.
//
// Presentation only: the automaton logic lives in simulator.js and the drawing
// in fsm.js. This file reads the machine from the editor, asks FsmSimulator for
// the steps, and shows one step at a time on the board, the tape and the trace.
(function() {
	var ACTIVE = { 'stroke': '#22d3ee', 'fill': 'rgba(34, 211, 238, 0.18)' };
	var ACCEPT = { 'stroke': '#34d399', 'fill': 'rgba(52, 211, 153, 0.24)' };
	var REJECT = { 'stroke': '#f87171', 'fill': 'rgba(248, 113, 113, 0.22)' };
	var TRAVERSED = '#22d3ee';
	var STEP_DELAY = 900; // milliseconds per step at 1x speed

	var result = null; // the current FsmSimulator.run() result, or null
	var stepIndex = 0;
	var playing = false;
	var timer = null;
	var signature = '';
	var el = {};

	function byId(id) {
		return document.getElementById(id);
	}

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

	function setMessages(errors, warnings) {
		el.messages.textContent = '';
		var groups = [[errors, 'error'], [warnings, 'warning']];
		for(var g = 0; g < groups.length; g++) {
			for(var i = 0; i < groups[g][0].length; i++) {
				var item = document.createElement('p');
				item.className = groups[g][1];
				item.textContent = groups[g][0][i];
				el.messages.appendChild(item);
			}
		}
	}

	function describeMachine(machine) {
		var kind = machine.type == 'DFA' ? 'Deterministic (DFA)' : (machine.hasEpsilon ? 'Nondeterministic with ε-moves (ε-NFA)' : 'Nondeterministic (NFA)');
		var text = kind + ' · ' + machine.states.length + (machine.states.length == 1 ? ' state' : ' states') + ' · Σ = ' + FsmSimulator.symbolSet(machine.alphabet);
		if(machine.type == 'DFA' && !machine.complete) {
			text += ' · a missing transition rejects the input';
		}
		return text;
	}

	function describeStep(step) {
		var machine = result.machine;
		if(step.index == 0) {
			return 'Start in ' + FsmSimulator.stateSet(machine, step.active) + (step.epsilonMoves.length > 0 ? ', the start state and everything reachable by ε-moves.' : '.');
		}
		return 'Read \'' + showSymbol(step.symbol) + '\': ' + FsmSimulator.stateSet(machine, step.from) + ' → ' + FsmSimulator.stateSet(machine, step.active) + (step.halted ? ' (no transition)' : '');
	}

	function describeMoves(step) {
		var machine = result.machine;
		var parts = [];
		var groups = [step.moves, step.epsilonMoves];
		for(var g = 0; g < groups.length; g++) {
			for(var i = 0; i < groups[g].length; i++) {
				var move = groups[g][i];
				parts.push(machine.states[move.from].name + ' —' + (move.symbol == null ? FsmSimulator.EPSILON : showSymbol(move.symbol)) + '→ ' + machine.states[move.to].name);
			}
		}
		for(var i = 0; i < step.dead.length; i++) {
			parts.push(machine.states[step.dead[i]].name + ' ✗ no transition');
		}
		if(parts.length == 0) {
			return step.index == 0 ? 'start' : '—';
		}
		return parts.join('   ');
	}

	function buildHighlight(step) {
		var highlight = { 'nodes': {}, 'links': {} };
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
			highlight.nodes[states[i]] = mark;
		}
		for(var i = 0; i < step.moves.length; i++) {
			highlight.links[step.moves[i].link] = TRAVERSED;
		}
		for(var i = 0; i < step.epsilonMoves.length; i++) {
			highlight.links[step.epsilonMoves[i].link] = TRAVERSED;
		}
		return highlight;
	}

	function renderTape(step) {
		el.tape.textContent = '';
		var input = result.input;
		if(input.length == 0) {
			var empty = document.createElement('span');
			empty.className = 'cell empty';
			empty.textContent = 'ε';
			el.tape.appendChild(empty);
			el.tapeNote.textContent = 'Empty input: nothing to read.';
			return;
		}
		for(var i = 0; i < input.length; i++) {
			var cell = document.createElement('span');
			var state = i < step.consumed - 1 ? 'done' : (i == step.consumed - 1 ? (step.halted ? 'fail' : 'current') : 'todo');
			cell.className = 'cell ' + state;
			cell.textContent = showSymbol(input[i]);
			el.tape.appendChild(cell);
		}
		var current = el.tape.children[Math.max(step.consumed - 1, 0)];
		el.tape.scrollLeft = Math.max(0, current.offsetLeft - el.tape.clientWidth / 2);
		var consumed = input.slice(0, step.consumed).map(showSymbol).join('');
		var remaining = input.slice(step.consumed).map(showSymbol).join('');
		el.tapeNote.textContent = 'Consumed: ' + (consumed || 'ε') + ' · Remaining: ' + (remaining || 'ε');
	}

	function buildTrace() {
		el.traceBody.textContent = '';
		for(var i = 0; i < result.steps.length; i++) {
			var step = result.steps[i];
			var row = document.createElement('tr');
			var cells = [
				String(step.index),
				step.index == 0 ? '—' : showSymbol(step.symbol),
				result.input.slice(step.consumed).map(showSymbol).join('') || 'ε',
				FsmSimulator.stateSet(result.machine, step.active),
				describeMoves(step),
			];
			for(var j = 0; j < cells.length; j++) {
				var cell = document.createElement('td');
				cell.textContent = cells[j];
				row.appendChild(cell);
			}
			row.tabIndex = 0;
			row.setAttribute('aria-label', 'Go to step ' + step.index);
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
		}
		var row = rows[stepIndex];
		var box = el.traceScroll;
		if(row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
			box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight;
		} else if(row.offsetTop - el.traceHead.offsetHeight < box.scrollTop) {
			box.scrollTop = Math.max(0, row.offsetTop - el.traceHead.offsetHeight);
		}
	}

	function renderControls() {
		var loaded = result != null;
		el.reset.disabled = !loaded;
		el.previous.disabled = !loaded || stepIndex == 0;
		el.next.disabled = !loaded || stepIndex == lastIndex();
		el.play.disabled = !loaded || lastIndex() == 0;
		el.play.textContent = playing ? 'Pause' : 'Play';
		el.play.setAttribute('aria-label', playing ? 'Pause playback' : 'Play the simulation');
	}

	function render() {
		renderControls();
		if(result == null) {
			simulationHighlight = null;
			el.panel.hidden = true;
			el.trace.hidden = true;
			draw();
			return;
		}
		var step = result.steps[stepIndex];
		var finished = stepIndex == lastIndex();
		simulationHighlight = buildHighlight(step);
		draw();

		el.panel.hidden = false;
		el.trace.hidden = false;
		el.machine.textContent = describeMachine(result.machine);
		el.step.textContent = 'Step ' + stepIndex + ' of ' + result.input.length + ' · ' + describeStep(step);
		renderTape(step);
		renderTrace();

		// the box is always there, so the board does not jump when the result arrives
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

	function goTo(index) {
		if(result == null) return;
		stepIndex = Math.max(0, Math.min(lastIndex(), index));
		render();
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
		goTo(stepIndex + 1);
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
		result = null;
		stepIndex = 0;
	}

	function execute() {
		clearSimulation();
		var outcome = FsmSimulator.run(readMachine(), el.input.value);
		if(!outcome.ok) {
			setMessages(outcome.errors, []);
			render();
			return;
		}
		result = outcome;
		signature = machineSignature();
		setMessages([], outcome.warnings);
		buildTrace();
		render();
		play();
	}

	window.addEventListener('load', function() {
		var ids = {
			'form': 'sim-form', 'input': 'sim-input', 'reset': 'sim-reset', 'previous': 'sim-previous', 'play': 'sim-play',
			'next': 'sim-next', 'speed': 'sim-speed', 'speedValue': 'sim-speed-value', 'messages': 'sim-messages',
			'panel': 'sim-panel', 'machine': 'sim-machine', 'step': 'sim-step', 'tape': 'sim-tape', 'tapeNote': 'sim-tape-note',
			'verdict': 'sim-verdict', 'verdictTitle': 'sim-verdict-title', 'verdictText': 'sim-verdict-text',
			'verdictPath': 'sim-verdict-path', 'trace': 'sim-trace', 'traceScroll': 'sim-trace-scroll',
			'traceHead': 'sim-trace-head', 'traceBody': 'sim-trace-body',
		};
		for(var name in ids) {
			el[name] = byId(ids[name]);
		}

		el.form.onsubmit = function(e) {
			e.preventDefault();
			execute();
		};
		el.reset.onclick = function() { pause(); goTo(0); };
		el.previous.onclick = function() { pause(); goTo(stepIndex - 1); };
		el.next.onclick = function() { pause(); goTo(stepIndex + 1); };
		el.play.onclick = function() {
			if(playing) pause(); else play();
		};
		el.speed.oninput = function() {
			el.speedValue.textContent = Number(el.speed.value) + '×';
		};
		el.speed.oninput();

		// editing the machine makes the computed steps stale, so drop them rather than show a wrong run
		onBeforeDraw = function() {
			if(result != null && machineSignature() != signature) {
				clearSimulation();
				simulationHighlight = null;
				setMessages([], ['The machine was edited, so the simulation was cleared. Press Execute to run it again.']);
				renderControls();
				el.panel.hidden = true;
				el.trace.hidden = true;
			}
		};

		renderControls();
	});
})();
