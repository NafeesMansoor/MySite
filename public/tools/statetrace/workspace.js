// Workspace controls for StateTrace: the editing toolbar, the label box, zoom,
// help, and import/export. The editor itself is fsm.js; everything here calls
// into it and repaints through draw().
(function() {
	var BOARD_COLOR = '#090f24';
	var EXAMPLE = {
		'nodes': [
			{ 'x': 0, 'y': 0, 'text': 'q0', 'isAcceptState': false },
			{ 'x': 230, 'y': 0, 'text': 'q1', 'isAcceptState': false },
			{ 'x': 460, 'y': 0, 'text': 'q2', 'isAcceptState': true },
		],
		'links': [
			{ 'type': 'StartLink', 'node': 0, 'text': '', 'deltaX': -90, 'deltaY': 0 },
			{ 'type': 'SelfLink', 'node': 0, 'text': 'a, b', 'anchorAngle': -Math.PI / 2 },
			{ 'type': 'Link', 'nodeA': 0, 'nodeB': 1, 'text': 'a', 'lineAngleAdjust': 0, 'parallelPart': 0.5, 'perpendicularPart': 0 },
			{ 'type': 'Link', 'nodeA': 1, 'nodeB': 2, 'text': 'b', 'lineAngleAdjust': 0, 'parallelPart': 0.5, 'perpendicularPart': 0 },
		],
	};
	var FORMATS = {
		'png': { 'file': 'state-machine.png', 'type': 'image/png' },
		'svg': { 'file': 'state-machine.svg', 'type': 'image/svg+xml' },
		'latex': { 'file': 'state-machine.tex', 'type': 'application/x-tex' },
		'json': { 'file': 'state-machine.json', 'type': 'application/json' },
	};

	var el = {};
	var format = 'png';
	var exported = ''; // text, or a data URL for PNG

	function byId(id) {
		return document.getElementById(id);
	}

	function finite(value) {
		return typeof value == 'number' && isFinite(value);
	}

	// returns a clean copy of an imported machine, or throws with a message for the person importing
	function checkMachine(data) {
		if(!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
			throw new Error('The file is not a StateTrace machine: it needs a "nodes" list and a "links" list.');
		}
		var machine = { 'nodes': [], 'links': [] };
		for(var i = 0; i < data.nodes.length; i++) {
			var node = data.nodes[i] || {};
			if(!finite(node.x) || !finite(node.y)) {
				throw new Error('State ' + (i + 1) + ' in the file has no position.');
			}
			machine.nodes.push({ 'x': node.x, 'y': node.y, 'text': String(node.text == null ? '' : node.text), 'isAcceptState': !!node.isAcceptState });
		}
		function state(value, i) {
			if(typeof value != 'number' || value % 1 != 0 || value < 0 || value >= machine.nodes.length) {
				throw new Error('Transition ' + (i + 1) + ' in the file points to a state that does not exist.');
			}
			return value;
		}
		function number(value, fallback) {
			return finite(value) ? value : fallback;
		}
		for(var i = 0; i < data.links.length; i++) {
			var link = data.links[i] || {};
			var text = String(link.text == null ? '' : link.text);
			if(link.type == 'StartLink') {
				machine.links.push({ 'type': 'StartLink', 'node': state(link.node, i), 'text': text, 'deltaX': number(link.deltaX, -80), 'deltaY': number(link.deltaY, 0) });
			} else if(link.type == 'SelfLink') {
				machine.links.push({ 'type': 'SelfLink', 'node': state(link.node, i), 'text': text, 'anchorAngle': number(link.anchorAngle, 0) });
			} else if(link.type == 'Link') {
				if(link.nodeA === link.nodeB) {
					throw new Error('Transition ' + (i + 1) + ' in the file joins a state to itself but is not marked as a self-loop.');
				}
				machine.links.push({
					'type': 'Link', 'nodeA': state(link.nodeA, i), 'nodeB': state(link.nodeB, i), 'text': text,
					'lineAngleAdjust': number(link.lineAngleAdjust, 0), 'parallelPart': number(link.parallelPart, 0.5), 'perpendicularPart': number(link.perpendicularPart, 0),
				});
			} else {
				throw new Error('Transition ' + (i + 1) + ' in the file has an unknown type.');
			}
		}
		return machine;
	}

	function replaceMachine(machine) {
		loadMachine(machine);
		selectedObject = null;
		currentLink = null;
		fitView();
	}

	function report(className, text) {
		var messages = byId('sim-messages');
		messages.textContent = '';
		var notice = document.createElement('p');
		notice.className = 'notice ' + className;
		notice.textContent = text;
		messages.appendChild(notice);
	}

	// ---- export ----

	// the whole drawing, cropped to its content, on the board's background
	function renderPNG() {
		var box = contentBounds() || { 'left': 0, 'top': 0, 'right': 600, 'bottom': 360 };
		var margin = 24;
		var width = Math.ceil(box.right - box.left) + 2 * margin;
		var height = Math.ceil(box.bottom - box.top) + 2 * margin;
		var scale = 2;
		var layer = document.createElement('canvas');
		layer.width = width * scale;
		layer.height = height * scale;

		// drawUsing paints the board canvas with the current view, so lend it this one for a moment
		var saved = { 'canvas': canvas, 'ratio': pixelRatio, 'scale': view.scale, 'x': view.x, 'y': view.y };
		try {
			canvas = layer;
			pixelRatio = scale;
			view.scale = 1;
			view.x = margin - box.left;
			view.y = margin - box.top;
			drawPlain(layer.getContext('2d'));
		} finally {
			canvas = saved.canvas;
			pixelRatio = saved.ratio;
			view.scale = saved.scale;
			view.x = saved.x;
			view.y = saved.y;
		}

		var image = document.createElement('canvas');
		image.width = layer.width;
		image.height = layer.height;
		var context = image.getContext('2d');
		context.fillStyle = BOARD_COLOR;
		context.fillRect(0, 0, image.width, image.height);
		context.drawImage(layer, 0, 0);
		return image.toDataURL('image/png');
	}

	function setFormat(next) {
		format = next;
		var buttons = el.exportDialog.querySelectorAll('[data-format]');
		for(var i = 0; i < buttons.length; i++) {
			buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-format') == format));
		}
		if(format == 'png') {
			exported = renderPNG();
			el.preview.src = exported;
		} else if(format == 'svg') {
			exported = saveAsSVG();
		} else if(format == 'latex') {
			exported = saveAsLaTeX();
		} else {
			exported = JSON.stringify(serializeMachine(), null, 2);
			output(exported);
		}
		el.preview.hidden = format != 'png';
		el.output.hidden = el.copy.hidden = format == 'png';
		el.exportStatus.textContent = format == 'json' ? 'JSON can be loaded again with Import.' : (format == 'png' ? '' : 'Black on white, ready for a document.');
	}

	function download() {
		var link = document.createElement('a');
		link.download = FORMATS[format].file;
		var url = format == 'png' ? exported : URL.createObjectURL(new Blob([exported], { 'type': FORMATS[format].type }));
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		if(format != 'png') {
			setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
		}
		el.exportStatus.textContent = 'Downloaded ' + FORMATS[format].file + '.';
	}

	function copy() {
		function done() {
			el.exportStatus.textContent = 'Copied.';
		}
		function fallback() {
			el.output.select();
			document.execCommand('copy');
			done();
		}
		if(navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(exported).then(done, fallback);
		} else {
			fallback();
		}
	}

	function open(dialog) {
		if(dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
	}

	// ---- toolbar and label box, kept in step with the board ----

	var historyQueued = false;

	function syncHistory() {
		historyQueued = false;
		el.undo.disabled = editHistory.undo.length == 0;
		el.redo.disabled = editHistory.redo.length == 0;
	}

	function sync() {
		var node = selectedObject instanceof Node ? selectedObject : null;
		el.empty.hidden = nodes.length > 0;
		el.transition.setAttribute('aria-pressed', String(linkTool));
		el.start.disabled = el.accept.disabled = node == null;
		el.accept.setAttribute('aria-pressed', String(node != null && node.isAcceptState));
		el.remove.disabled = selectedObject == null;
		el.clear.disabled = nodes.length == 0;
		canvas.classList.toggle('linking', linkTool);
		canvas.classList.toggle('panning', panning != null);

		var labelled = selectedObject != null && !(selectedObject instanceof StartLink) && 'text' in selectedObject;
		el.labelEditor.hidden = !labelled;
		if(labelled) {
			el.labelCaption.textContent = node ? 'State name' : 'Transition label';
			el.labelHint.textContent = node ? '' : 'a, b or \\epsilon';
			if(document.activeElement != el.labelInput && el.labelInput.value != selectedObject.text) {
				el.labelInput.value = selectedObject.text;
			}
		}

		var zoom = Math.round(view.scale * 100) + '%';
		if(el.zoomLevel.textContent != zoom) el.zoomLevel.textContent = zoom;
		el.board.style.setProperty('--grid', 32 * view.scale + 'px');
		el.board.style.setProperty('--grid-x', view.x + 'px');
		el.board.style.setProperty('--grid-y', view.y + 'px');

		// the history is updated after the draw that calls this, so read it a moment later
		if(!historyQueued) {
			historyQueued = true;
			setTimeout(syncHistory, 0);
		}
	}

	// after a toolbar button, keystrokes should go to the board again
	function backToBoard() {
		canvas.focus({ 'preventScroll': true });
		resetCaret();
		draw();
	}

	window.addEventListener('load', function() {
		var ids = {
			'board': null, 'empty': 'empty-state', 'state': 'tool-state', 'transition': 'tool-transition', 'start': 'tool-start',
			'accept': 'tool-accept', 'remove': 'tool-delete', 'undo': 'tool-undo', 'redo': 'tool-redo', 'clear': 'tool-clear',
			'labelEditor': 'label-editor', 'labelCaption': 'label-caption', 'labelInput': 'label-input', 'labelHint': 'label-hint',
			'zoomLevel': 'zoom-level', 'helpDialog': 'help-dialog', 'exportDialog': 'export-dialog', 'preview': 'export-preview',
			'output': 'output', 'copy': 'export-copy', 'exportStatus': 'export-status', 'importFile': 'import-file',
		};
		for(var name in ids) {
			if(ids[name]) el[name] = byId(ids[name]);
		}
		el.board = canvas.parentNode;

		// when embedded in a frame, make sure typing reaches the board after it is clicked
		document.addEventListener('mousedown', function() { window.focus(); }, true);

		if(window.ResizeObserver) {
			new ResizeObserver(function() { resizeCanvas(); }).observe(el.board);
		}

		el.state.onclick = function() {
			var point = viewCenter();
			// do not drop a new state exactly on top of another
			for(var i = 0; i < nodes.length; i++) {
				if(Math.abs(nodes[i].x - point.x) < 12 && Math.abs(nodes[i].y - point.y) < 12) {
					point.x += 48;
					point.y += 48;
					i = -1;
				}
			}
			selectedObject = new Node(point.x, point.y);
			nodes.push(selectedObject);
			backToBoard();
		};
		el.transition.onclick = function() {
			linkTool = !linkTool;
			backToBoard();
		};
		el.start.onclick = function() {
			if(!(selectedObject instanceof Node)) return;
			for(var i = 0; i < links.length; i++) {
				if(links[i] instanceof StartLink) links.splice(i--, 1);
			}
			var arrow = new StartLink(selectedObject);
			arrow.deltaX = -(nodeRadius + 55);
			links.push(arrow);
			backToBoard();
		};
		el.accept.onclick = function() {
			if(!(selectedObject instanceof Node)) return;
			selectedObject.isAcceptState = !selectedObject.isAcceptState;
			backToBoard();
		};
		el.remove.onclick = function() {
			deleteSelected();
			backToBoard();
		};
		el.undo.onclick = function() { undo(); backToBoard(); };
		el.redo.onclick = function() { redo(); backToBoard(); };
		el.clear.onclick = function() {
			if(nodes.length == 0 || !confirm('Clear the board? Undo brings the drawing back.')) return;
			loadMachine({ 'nodes': [], 'links': [] });
			selectedObject = null;
			resetView();
			backToBoard();
		};

		el.labelInput.oninput = function() {
			if(selectedObject != null && 'text' in selectedObject) {
				selectedObject.text = el.labelInput.value;
				draw();
			}
		};
		el.labelInput.onkeydown = function(e) {
			if(e.key == 'Enter' || e.key == 'Escape') {
				e.preventDefault();
				backToBoard();
			}
		};

		byId('zoom-in').onclick = function() { zoomBy(1.25); };
		byId('zoom-out').onclick = function() { zoomBy(0.8); };
		byId('zoom-fit').onclick = function() { fitView(); };
		el.zoomLevel.onclick = function() { resetView(); };

		byId('example-button').onclick = function() {
			replaceMachine(EXAMPLE);
			backToBoard();
		};

		byId('help-button').onclick = function() { open(el.helpDialog); };
		byId('export-button').onclick = function() {
			open(el.exportDialog);
			setFormat(format);
		};
		var formatButtons = el.exportDialog.querySelectorAll('[data-format]');
		for(var i = 0; i < formatButtons.length; i++) {
			formatButtons[i].onclick = function() { setFormat(this.getAttribute('data-format')); };
		}
		byId('export-download').onclick = download;
		el.copy.onclick = copy;

		var dialogs = [el.helpDialog, el.exportDialog];
		for(var i = 0; i < dialogs.length; i++) {
			(function(dialog) {
				dialog.querySelector('[data-close]').onclick = function() { dialog.close(); };
				// a click on the dimmed area around the dialog closes it
				dialog.addEventListener('click', function(e) {
					if(e.target == dialog) dialog.close();
				});
			})(dialogs[i]);
		}

		byId('import-button').onclick = function() { el.importFile.click(); };
		el.importFile.onchange = function() {
			var file = el.importFile.files[0];
			if(!file) return;
			var reader = new FileReader();
			reader.onload = function() {
				try {
					var machine;
					try {
						machine = JSON.parse(reader.result);
					} catch(error) {
						throw new Error('The file is not valid JSON, so it cannot be imported.');
					}
					replaceMachine(checkMachine(machine));
					report('warning', 'Imported ' + file.name + '. Undo brings the previous drawing back.');
				} catch(error) {
					report('error', error.message);
				}
			};
			reader.readAsText(file);
			el.importFile.value = '';
		};

		drawHooks.push(sync);
		sync();
	});
})();
