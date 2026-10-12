// Finite automaton simulator for the FSM Designer.
//
// Pure logic: no DOM and no canvas. compile() reads the machine description
// that fsm.js produces in serializeMachine() (the same data it saves to
// localStorage), and run() turns an input string into a list of steps. Steps
// are computed up front and never mutated, so playback can move both ways.
var FsmSimulator = (function() {
	var EPSILON = 'ε';

	// labels that mean "move without reading a symbol"
	var epsilonLabels = {};
	epsilonLabels['ε'] = true; // ε
	epsilonLabels['ϵ'] = true; // ϵ
	epsilonLabels['λ'] = true; // λ
	epsilonLabels['\\epsilon'] = true;
	epsilonLabels['\\varepsilon'] = true;
	epsilonLabels['\\lambda'] = true;

	function has(object, key) {
		return Object.prototype.hasOwnProperty.call(object, key);
	}

	function isStateIndex(value, count) {
		return typeof value == 'number' && value % 1 == 0 && value >= 0 && value < count;
	}

	function plural(count, word) {
		return count + ' ' + word + (count == 1 ? '' : 's');
	}

	function quote(symbol) {
		return "'" + (symbol == ' ' ? '␣' : symbol) + "'";
	}

	function stateName(machine, index) {
		return machine.states[index].name;
	}

	function stateSet(machine, indices) {
		if(indices.length == 0) return '∅';
		var names = [];
		for(var i = 0; i < indices.length; i++) {
			names.push(stateName(machine, indices[i]));
		}
		return '{' + names.join(', ') + '}';
	}

	function symbolSet(symbols) {
		return symbols.length == 0 ? '∅' : '{' + symbols.join(', ') + '}';
	}

	// "a, b" -> ['a', 'b'], "\epsilon" -> [null]
	function parseLabel(text) {
		var parts = text.split(',');
		var symbols = [];
		var seen = {};
		for(var i = 0; i < parts.length; i++) {
			var token = parts[i].replace(/^\s+|\s+$/g, '');
			if(token == '') continue;
			var symbol;
			if(has(epsilonLabels, token)) {
				symbol = null;
			} else if(Array.from(token).length == 1) {
				symbol = token;
			} else {
				return { 'error': 'long', 'token': token };
			}
			var key = symbol == null ? 'e' : 's' + symbol;
			if(!has(seen, key)) {
				seen[key] = true;
				symbols.push(symbol);
			}
		}
		if(symbols.length == 0) {
			return { 'error': 'empty' };
		}
		return { 'symbols': symbols };
	}

	function compile(data, options) {
		options = options || {};
		var normalize = options.normalizeLabel || function(text) { return text; };
		var rawNodes = data && Array.isArray(data.nodes) ? data.nodes : [];
		var rawLinks = data && Array.isArray(data.links) ? data.links : [];
		var machine = {
			'states': [],
			'transitions': [],
			'start': null,
			'alphabet': [],
			'hasEpsilon': false,
			'deterministic': true,
			'complete': true,
			'type': 'DFA',
			'errors': [],
			'warnings': [],
			'bySymbol': [],
			'epsilonFrom': [],
		};

		if(rawNodes.length == 0) {
			machine.errors.push('The board is empty. Double-click the board to add a state.');
			return machine;
		}

		var unnamed = 0;
		var nameCount = {};
		var duplicates = [];
		var hasAccepting = false;
		for(var i = 0; i < rawNodes.length; i++) {
			var rawNode = rawNodes[i] || {};
			var name = normalize(String(rawNode.text == null ? '' : rawNode.text)).replace(/^\s+|\s+$/g, '');
			if(name == '') {
				name = '#' + (i + 1);
				unnamed++;
			} else if(has(nameCount, name)) {
				if(nameCount[name]++ == 1) duplicates.push(name);
			} else {
				nameCount[name] = 1;
			}
			var accepting = !!rawNode.isAcceptState;
			hasAccepting = hasAccepting || accepting;
			machine.states.push({ 'index': i, 'name': name, 'accepting': accepting });
			machine.bySymbol.push({});
			machine.epsilonFrom.push([]);
		}

		var count = machine.states.length;
		var starts = [];
		var alphabet = {};
		for(var i = 0; i < rawLinks.length; i++) {
			var rawLink = rawLinks[i] || {};
			var from, to;
			if(rawLink.type == 'StartLink') {
				if(!isStateIndex(rawLink.node, count)) {
					machine.errors.push('A start arrow points to a state that does not exist.');
				} else if(starts.indexOf(rawLink.node) == -1) {
					starts.push(rawLink.node);
				}
				continue;
			} else if(rawLink.type == 'SelfLink') {
				from = to = rawLink.node;
			} else if(rawLink.type == 'Link') {
				from = rawLink.nodeA;
				to = rawLink.nodeB;
			} else {
				machine.errors.push('Transition ' + (i + 1) + ' has an unknown type and cannot be simulated.');
				continue;
			}
			if(!isStateIndex(from, count) || !isStateIndex(to, count)) {
				machine.errors.push('Transition ' + (i + 1) + ' is attached to a state that does not exist.');
				continue;
			}

			var where = 'The transition ' + stateName(machine, from) + ' → ' + stateName(machine, to);
			var label = parseLabel(normalize(String(rawLink.text == null ? '' : rawLink.text)));
			if(label.error == 'empty') {
				machine.errors.push(where + ' has no label. Select it and type a symbol, or \\epsilon for a move that reads nothing.');
				continue;
			} else if(label.error == 'long') {
				machine.errors.push(where + ' is labelled "' + label.token + '". Each symbol must be a single character; separate several symbols with commas, for example "a, b".');
				continue;
			}
			for(var j = 0; j < label.symbols.length; j++) {
				var symbol = label.symbols[j];
				var transition = { 'from': from, 'to': to, 'symbol': symbol, 'link': i };
				machine.transitions.push(transition);
				if(symbol == null) {
					machine.hasEpsilon = true;
					machine.epsilonFrom[from].push(transition);
				} else {
					alphabet[symbol] = true;
					if(!has(machine.bySymbol[from], symbol)) {
						machine.bySymbol[from][symbol] = [];
					}
					machine.bySymbol[from][symbol].push(transition);
				}
			}
		}

		for(var symbol in alphabet) {
			if(has(alphabet, symbol)) machine.alphabet.push(symbol);
		}
		machine.alphabet.sort();

		if(starts.length == 0) {
			machine.errors.push('There is no start state. Shift-drag from an empty part of the board onto a state to add a start arrow.');
		} else if(starts.length > 1) {
			starts.sort(function(a, b) { return a - b; });
			machine.errors.push('There are ' + starts.length + ' start states ' + stateSet(machine, starts) + '. A finite automaton has exactly one; delete the extra start arrows.');
		} else {
			machine.start = starts[0];
		}

		// deterministic: no ε-moves, and at most one target per state and symbol
		machine.deterministic = !machine.hasEpsilon;
		for(var i = 0; i < count; i++) {
			for(var j = 0; j < machine.alphabet.length; j++) {
				var symbol = machine.alphabet[j];
				if(!has(machine.bySymbol[i], symbol)) {
					machine.complete = false;
					continue;
				}
				var targets = machine.bySymbol[i][symbol];
				for(var k = 1; k < targets.length; k++) {
					if(targets[k].to != targets[0].to) machine.deterministic = false;
				}
			}
		}
		machine.type = machine.deterministic ? 'DFA' : (machine.hasEpsilon ? 'ε-NFA' : 'NFA');

		if(!hasAccepting) {
			machine.warnings.push('No state is accepting, so every input is rejected. Double-click a state to make it accepting.');
		}
		if(unnamed > 0) {
			machine.warnings.push(plural(unnamed, 'state') + (unnamed == 1 ? ' has' : ' have') + ' no name and ' + (unnamed == 1 ? 'is' : 'are') + ' shown by number, such as #1.');
		}
		if(duplicates.length > 0) {
			machine.warnings.push('Several states share the name ' + duplicates.join(', ') + ', which makes the trace harder to read.');
		}
		return machine;
	}

	function byNumber(a, b) {
		return a - b;
	}

	function configKey(position, state) {
		return position + ':' + state;
	}

	// every state reachable from the seeds by ε-moves alone, and the ε-moves used
	function closure(machine, seeds, position, parents) {
		var queue = seeds.slice();
		var seen = {};
		var moves = [];
		for(var i = 0; i < queue.length; i++) {
			seen[queue[i]] = true;
		}
		for(var i = 0; i < queue.length; i++) {
			var out = machine.epsilonFrom[queue[i]];
			for(var j = 0; j < out.length; j++) {
				var transition = out[j];
				moves.push({ 'from': transition.from, 'to': transition.to, 'symbol': null, 'link': transition.link });
				if(!has(seen, transition.to)) {
					seen[transition.to] = true;
					queue.push(transition.to);
					parents[configKey(position, transition.to)] = { 'position': position, 'state': transition.from, 'symbol': null, 'link': transition.link };
				}
			}
		}
		queue.sort(byNumber);
		return { 'states': queue, 'moves': moves };
	}

	function describePath(machine, path) {
		if(path.length == 0) {
			return stateName(machine, machine.start);
		}
		var text = stateName(machine, path[0].from);
		for(var i = 0; i < path.length; i++) {
			text += ' —' + (path[i].symbol == null ? EPSILON : path[i].symbol) + '→ ' + stateName(machine, path[i].to);
		}
		return text;
	}

	function run(machine, input) {
		var symbols = Array.from(String(input == null ? '' : input));
		var result = {
			'ok': false,
			'errors': machine.errors.slice(),
			'warnings': machine.warnings.slice(),
			'machine': machine,
			'input': symbols,
			'steps': [],
			'accepted': false,
			'outcome': null,
			'explanation': '',
			'acceptingPath': null,
			'acceptingPathText': '',
			'invalidSymbols': [],
		};
		if(machine.errors.length > 0) {
			return result;
		}
		result.ok = true;

		for(var i = 0; i < symbols.length; i++) {
			if(machine.alphabet.indexOf(symbols[i]) == -1) {
				result.invalidSymbols.push({ 'symbol': symbols[i], 'position': i + 1 });
			}
		}

		// parents remembers how each (position, state) was first reached, to rebuild one accepting path
		var parents = {};
		var first = closure(machine, [machine.start], 0, parents);
		var active = first.states;
		result.steps.push({
			'index': 0,
			'consumed': 0,
			'symbol': null,
			'from': [],
			'moves': [],
			'epsilonMoves': first.moves,
			'dead': [],
			'active': active,
			'halted': false,
		});

		var halted = false;
		for(var i = 0; i < symbols.length && !halted; i++) {
			var symbol = symbols[i];
			var moves = [];
			var dead = [];
			var targets = [];
			var seen = {};
			for(var j = 0; j < active.length; j++) {
				var state = active[j];
				var out = has(machine.bySymbol[state], symbol) ? machine.bySymbol[state][symbol] : [];
				if(out.length == 0) {
					dead.push(state);
				}
				for(var k = 0; k < out.length; k++) {
					var transition = out[k];
					moves.push({ 'from': state, 'to': transition.to, 'symbol': symbol, 'link': transition.link });
					if(!has(seen, transition.to)) {
						seen[transition.to] = true;
						targets.push(transition.to);
						parents[configKey(i + 1, transition.to)] = { 'position': i, 'state': state, 'symbol': symbol, 'link': transition.link };
					}
				}
			}
			var closed = closure(machine, targets, i + 1, parents);
			halted = closed.states.length == 0;
			result.steps.push({
				'index': i + 1,
				'consumed': i + 1,
				'symbol': symbol,
				'from': active,
				'moves': moves,
				'epsilonMoves': closed.moves,
				'dead': dead,
				'active': closed.states,
				'halted': halted,
			});
			active = closed.states;
		}

		var last = result.steps[result.steps.length - 1];
		var total = symbols.length;
		var accepting = [];
		for(var i = 0; i < active.length; i++) {
			if(machine.states[active[i]].accepting) accepting.push(active[i]);
		}
		var deterministic = machine.deterministic;
		var read = total == 1 ? 'The 1 symbol was read' : 'All ' + total + ' symbols were read';

		if(halted) {
			var position = last.index;
			var unread = total - position;
			if(machine.alphabet.indexOf(last.symbol) == -1) {
				result.outcome = 'invalid-symbol';
				result.explanation = 'The symbol ' + quote(last.symbol) + ' at position ' + position + ' is not in the alphabet of this machine, ' + symbolSet(machine.alphabet) + ', so no transition can read it.';
			} else if(deterministic) {
				result.outcome = 'stuck';
				result.explanation = 'State ' + stateName(machine, last.from[0]) + ' has no transition on ' + quote(last.symbol) + ' (position ' + position + '), so the machine cannot continue.';
			} else {
				result.outcome = 'stuck';
				result.explanation = 'No state in ' + stateSet(machine, last.from) + ' has a transition on ' + quote(last.symbol) + ' (position ' + position + '), so every computation branch dies.';
			}
			if(unread > 0) {
				result.explanation += ' ' + plural(unread, 'symbol') + (unread == 1 ? ' was' : ' were') + ' left unread.';
			}
		} else if(accepting.length > 0) {
			result.accepted = true;
			result.outcome = 'accepted';
			var path = [];
			var current = { 'position': total, 'state': accepting[0] };
			var parent;
			while((parent = parents[configKey(current.position, current.state)])) {
				path.unshift({ 'from': parent.state, 'to': current.state, 'symbol': parent.symbol, 'link': parent.link });
				current = parent;
			}
			result.acceptingPath = path;
			result.acceptingPathText = describePath(machine, path);
			if(total == 0) {
				if(machine.states[machine.start].accepting) {
					result.explanation = 'The empty string is accepted because the start state ' + stateName(machine, machine.start) + ' is an accepting state.';
				} else {
					result.explanation = 'The empty string is accepted because ' + stateName(machine, accepting[0]) + ', an accepting state, can be reached from the start state by ε-moves alone.';
				}
			} else if(deterministic) {
				result.explanation = read + ' and the machine stopped in ' + stateName(machine, active[0]) + ', which is an accepting state.';
			} else {
				result.explanation = read + ' and the machine can be in ' + stateSet(machine, active) + '. ' + stateSet(machine, accepting) + (accepting.length == 1 ? ' is' : ' are') + ' accepting, so at least one computation branch accepts.';
			}
		} else {
			result.outcome = 'not-accepting';
			if(total == 0) {
				result.explanation = 'The empty string is rejected because the start state ' + stateName(machine, machine.start) + ' is not an accepting state' + (machine.hasEpsilon ? ', and no accepting state can be reached by ε-moves alone.' : '.');
			} else if(deterministic) {
				result.explanation = read + ', but the machine stopped in ' + stateName(machine, active[0]) + ', which is not an accepting state.';
			} else {
				result.explanation = read + ', but none of the states the machine can be in, ' + stateSet(machine, active) + ', is accepting, so no computation branch accepts.';
			}
		}
		return result;
	}

	function simulate(data, input, options) {
		return run(compile(data, options), input);
	}

	return {
		'EPSILON': EPSILON,
		'compile': compile,
		'run': run,
		'simulate': simulate,
		'stateSet': stateSet,
		'symbolSet': symbolSet,
	};
})();
