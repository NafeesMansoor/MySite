// The drawing editor of StateTrace (see LICENSE.txt).
// Derived from Finite State Machine Designer, copyright (c) 2010 Evan Wallace, MIT License.
// Changes for StateTrace copyright (c) 2019-2026 Nafees Mansoor, MIT License.

// draw using this instead of a canvas and call toLaTeX() afterward
function ExportAsLaTeX() {
	this._points = [];
	this._texData = '';
	this._scale = 0.1; // to convert pixels to document space (TikZ breaks if the numbers get too big, above 500?)

	this.toLaTeX = function() {
		return '\\documentclass[12pt]{article}\n' +
			'\\usepackage{tikz}\n' +
			'\n' +
			'\\begin{document}\n' +
			'\n' +
			'\\begin{center}\n' +
			'\\begin{tikzpicture}[scale=0.2]\n' +
			'\\tikzstyle{every node}+=[inner sep=0pt]\n' +
			this._texData +
			'\\end{tikzpicture}\n' +
			'\\end{center}\n' +
			'\n' +
			'\\end{document}\n';
	};

	this.beginPath = function() {
		this._points = [];
	};
	this.arc = function(x, y, radius, startAngle, endAngle, isReversed) {
		x *= this._scale;
		y *= this._scale;
		radius *= this._scale;
		if(endAngle - startAngle == Math.PI * 2) {
			this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x, 3) + ',' + fixed(-y, 3) + ') circle (' + fixed(radius, 3) + ');\n';
		} else {
			if(isReversed) {
				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;
			}
			if(endAngle < startAngle) {
				endAngle += Math.PI * 2;
			}
			// TikZ needs the angles to be in between -2pi and 2pi or it breaks
			if(Math.min(startAngle, endAngle) < -2*Math.PI) {
				startAngle += 2*Math.PI;
				endAngle += 2*Math.PI;
			} else if(Math.max(startAngle, endAngle) > 2*Math.PI) {
				startAngle -= 2*Math.PI;
				endAngle -= 2*Math.PI;
			}
			startAngle = -startAngle;
			endAngle = -endAngle;
			this._texData += '\\draw [' + this.strokeStyle + '] (' + fixed(x + radius * Math.cos(startAngle), 3) + ',' + fixed(-y + radius * Math.sin(startAngle), 3) + ') arc (' + fixed(startAngle * 180 / Math.PI, 5) + ':' + fixed(endAngle * 180 / Math.PI, 5) + ':' + fixed(radius, 3) + ');\n';
		}
	};
	this.moveTo = this.lineTo = function(x, y) {
		x *= this._scale;
		y *= this._scale;
		this._points.push({ 'x': x, 'y': y });
	};
	this.stroke = function() {
		if(this._points.length == 0) return;
		this._texData += '\\draw [' + this.strokeStyle + ']';
		for(var i = 0; i < this._points.length; i++) {
			var p = this._points[i];
			this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
		}
		this._texData += ';\n';
	};
	this.fill = function() {
		if(this._points.length == 0) return;
		this._texData += '\\fill [' + this.strokeStyle + ']';
		for(var i = 0; i < this._points.length; i++) {
			var p = this._points[i];
			this._texData += (i > 0 ? ' --' : '') + ' (' + fixed(p.x, 2) + ',' + fixed(-p.y, 2) + ')';
		}
		this._texData += ';\n';
	};
	this.measureText = function(text) {
		var c = canvas.getContext('2d');
		c.font = '20px "Times New Romain", serif';
		return c.measureText(text);
	};
	this.advancedFillText = function(text, originalText, x, y, angleOrNull) {
		if(text.replace(' ', '').length > 0) {
			var nodeParams = '';
			// x and y start off as the center of the text, but will be moved to one side of the box when angleOrNull != null
			if(angleOrNull != null) {
				var width = this.measureText(text).width;
				var dx = Math.cos(angleOrNull);
				var dy = Math.sin(angleOrNull);
				if(Math.abs(dx) > Math.abs(dy)) {
					if(dx > 0) nodeParams = '[right] ', x -= width / 2;
					else nodeParams = '[left] ', x += width / 2;
				} else {
					if(dy > 0) nodeParams = '[below] ', y -= 10;
					else nodeParams = '[above] ', y += 10;
				}
			}
			x *= this._scale;
			y *= this._scale;
			this._texData += '\\draw (' + fixed(x, 2) + ',' + fixed(-y, 2) + ') node ' + nodeParams + '{$' + originalText.replace(/ /g, '\\mbox{ }') + '$};\n';
		}
	};

	this.translate = this.save = this.restore = this.clearRect = function(){};
}

// draw using this instead of a canvas and call toSVG() afterward
function ExportAsSVG() {
	this.fillStyle = 'red';
	this.strokeStyle = 'red';
	this.lineWidth = 5;
	this.font = '12px Arial, sans-serif';
	this._points = [];
	this._svgData = '';
	this._transX = 0;
	this._transY = 0;

	this.toSVG = function() {
		// size the image to the drawing, wherever on the board it is
		var box = contentBounds() || { 'left': 0, 'top': 0, 'right': 900, 'bottom': 600 };
		var width = Math.ceil(box.right - box.left);
		var height = Math.ceil(box.bottom - box.top);
		return '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n\n<svg width="' + width + '" height="' + height + '" viewBox="' + Math.floor(box.left) + ' ' + Math.floor(box.top) + ' ' + width + ' ' + height + '" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' + this._svgData + '</svg>\n';
	};

	this.beginPath = function() {
		this._points = [];
	};
	this.arc = function(x, y, radius, startAngle, endAngle, isReversed) {
		x += this._transX;
		y += this._transY;
		var style = 'stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '" fill="none"';

		if(endAngle - startAngle == Math.PI * 2) {
			this._svgData += '\t<ellipse ' + style + ' cx="' + fixed(x, 3) + '" cy="' + fixed(y, 3) + '" rx="' + fixed(radius, 3) + '" ry="' + fixed(radius, 3) + '"/>\n';
		} else {
			if(isReversed) {
				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;
			}

			if(endAngle < startAngle) {
				endAngle += Math.PI * 2;
			}

			var startX = x + radius * Math.cos(startAngle);
			var startY = y + radius * Math.sin(startAngle);
			var endX = x + radius * Math.cos(endAngle);
			var endY = y + radius * Math.sin(endAngle);
			var useGreaterThan180 = (Math.abs(endAngle - startAngle) > Math.PI);
			var goInPositiveDirection = 1;

			this._svgData += '\t<path ' + style + ' d="';
			this._svgData += 'M ' + fixed(startX, 3) + ',' + fixed(startY, 3) + ' '; // startPoint(startX, startY)
			this._svgData += 'A ' + fixed(radius, 3) + ',' + fixed(radius, 3) + ' '; // radii(radius, radius)
			this._svgData += '0 '; // value of 0 means perfect circle, others mean ellipse
			this._svgData += +useGreaterThan180 + ' ';
			this._svgData += +goInPositiveDirection + ' ';
			this._svgData += fixed(endX, 3) + ',' + fixed(endY, 3); // endPoint(endX, endY)
			this._svgData += '"/>\n';
		}
	};
	this.moveTo = this.lineTo = function(x, y) {
		x += this._transX;
		y += this._transY;
		this._points.push({ 'x': x, 'y': y });
	};
	this.stroke = function() {
		if(this._points.length == 0) return;
		this._svgData += '\t<polygon stroke="' + this.strokeStyle + '" stroke-width="' + this.lineWidth + '" points="';
		for(var i = 0; i < this._points.length; i++) {
			this._svgData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
		}
		this._svgData += '"/>\n';
	};
	this.fill = function() {
		if(this._points.length == 0) return;
		this._svgData += '\t<polygon fill="' + this.fillStyle + '" stroke-width="' + this.lineWidth + '" points="';
		for(var i = 0; i < this._points.length; i++) {
			this._svgData += (i > 0 ? ' ' : '') + fixed(this._points[i].x, 3) + ',' + fixed(this._points[i].y, 3);
		}
		this._svgData += '"/>\n';
	};
	this.measureText = function(text) {
		var c = canvas.getContext('2d');
		c.font = '20px "Times New Romain", serif';
		return c.measureText(text);
	};
	this.fillText = function(text, x, y) {
		x += this._transX;
		y += this._transY;
		if(text.replace(' ', '').length > 0) {
			this._svgData += '\t<text x="' + fixed(x, 3) + '" y="' + fixed(y, 3) + '" font-family="Times New Roman" font-size="20">' + textToXML(text) + '</text>\n';
		}
	};
	this.translate = function(x, y) {
		this._transX = x;
		this._transY = y;
	};

	this.save = this.restore = this.clearRect = function(){};
}

function StartLink(node, start) {
	this.node = node;
	this.deltaX = 0;
	this.deltaY = 0;
	this.text = '';

	if(start) {
		this.setAnchorPoint(start.x, start.y);
	}
}

StartLink.prototype.setAnchorPoint = function(x, y) {
	this.deltaX = x - this.node.x;
	this.deltaY = y - this.node.y;

	if(Math.abs(this.deltaX) < snapToPadding) {
		this.deltaX = 0;
	}

	if(Math.abs(this.deltaY) < snapToPadding) {
		this.deltaY = 0;
	}
};

StartLink.prototype.getEndPoints = function() {
	var startX = this.node.x + this.deltaX;
	var startY = this.node.y + this.deltaY;
	var end = this.node.closestPointOnCircle(startX, startY);
	return {
		'startX': startX,
		'startY': startY,
		'endX': end.x,
		'endY': end.y,
	};
};

StartLink.prototype.draw = function(c) {
	var stuff = this.getEndPoints();

	// draw the line
	c.beginPath();
	c.moveTo(stuff.startX, stuff.startY);
	c.lineTo(stuff.endX, stuff.endY);
	c.stroke();

	// draw the text at the end without the arrow
	var textAngle = Math.atan2(stuff.startY - stuff.endY, stuff.startX - stuff.endX);
	drawText(c, this.text, stuff.startX, stuff.startY, textAngle, selectedObject == this);

	// draw the head of the arrow
	drawArrow(c, stuff.endX, stuff.endY, Math.atan2(-this.deltaY, -this.deltaX));
};

StartLink.prototype.containsPoint = function(x, y) {
	var stuff = this.getEndPoints();
	var dx = stuff.endX - stuff.startX;
	var dy = stuff.endY - stuff.startY;
	var length = Math.sqrt(dx*dx + dy*dy);
	var percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
	var distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
	return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
};

function Link(a, b) {
	this.nodeA = a;
	this.nodeB = b;
	this.text = '';
	this.lineAngleAdjust = 0; // value to add to textAngle when link is straight line

	// make anchor point relative to the locations of nodeA and nodeB
	this.parallelPart = 0.5; // percentage from nodeA to nodeB
	this.perpendicularPart = 0; // pixels from line between nodeA and nodeB
}

Link.prototype.getAnchorPoint = function() {
	var dx = this.nodeB.x - this.nodeA.x;
	var dy = this.nodeB.y - this.nodeA.y;
	var scale = Math.sqrt(dx * dx + dy * dy);
	return {
		'x': this.nodeA.x + dx * this.parallelPart - dy * this.perpendicularPart / scale,
		'y': this.nodeA.y + dy * this.parallelPart + dx * this.perpendicularPart / scale
	};
};

Link.prototype.setAnchorPoint = function(x, y) {
	var dx = this.nodeB.x - this.nodeA.x;
	var dy = this.nodeB.y - this.nodeA.y;
	var scale = Math.sqrt(dx * dx + dy * dy);
	this.parallelPart = (dx * (x - this.nodeA.x) + dy * (y - this.nodeA.y)) / (scale * scale);
	this.perpendicularPart = (dx * (y - this.nodeA.y) - dy * (x - this.nodeA.x)) / scale;
	// snap to a straight line
	if(this.parallelPart > 0 && this.parallelPart < 1 && Math.abs(this.perpendicularPart) < snapToPadding) {
		this.lineAngleAdjust = (this.perpendicularPart < 0) * Math.PI;
		this.perpendicularPart = 0;
	}
};

Link.prototype.getEndPointsAndCircle = function() {
	if(this.perpendicularPart == 0) {
		var midX = (this.nodeA.x + this.nodeB.x) / 2;
		var midY = (this.nodeA.y + this.nodeB.y) / 2;
		var start = this.nodeA.closestPointOnCircle(midX, midY);
		var end = this.nodeB.closestPointOnCircle(midX, midY);
		return {
			'hasCircle': false,
			'startX': start.x,
			'startY': start.y,
			'endX': end.x,
			'endY': end.y,
		};
	}
	var anchor = this.getAnchorPoint();
	var circle = circleFromThreePoints(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y, anchor.x, anchor.y);
	var isReversed = (this.perpendicularPart > 0);
	var reverseScale = isReversed ? 1 : -1;
	var startAngle = Math.atan2(this.nodeA.y - circle.y, this.nodeA.x - circle.x) - reverseScale * nodeRadius / circle.radius;
	var endAngle = Math.atan2(this.nodeB.y - circle.y, this.nodeB.x - circle.x) + reverseScale * nodeRadius / circle.radius;
	var startX = circle.x + circle.radius * Math.cos(startAngle);
	var startY = circle.y + circle.radius * Math.sin(startAngle);
	var endX = circle.x + circle.radius * Math.cos(endAngle);
	var endY = circle.y + circle.radius * Math.sin(endAngle);
	return {
		'hasCircle': true,
		'startX': startX,
		'startY': startY,
		'endX': endX,
		'endY': endY,
		'startAngle': startAngle,
		'endAngle': endAngle,
		'circleX': circle.x,
		'circleY': circle.y,
		'circleRadius': circle.radius,
		'reverseScale': reverseScale,
		'isReversed': isReversed,
	};
};

Link.prototype.draw = function(c) {
	var stuff = this.getEndPointsAndCircle();
	// draw arc
	c.beginPath();
	if(stuff.hasCircle) {
		c.arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, stuff.isReversed);
	} else {
		c.moveTo(stuff.startX, stuff.startY);
		c.lineTo(stuff.endX, stuff.endY);
	}
	c.stroke();
	// draw the head of the arrow
	if(stuff.hasCircle) {
		drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle - stuff.reverseScale * (Math.PI / 2));
	} else {
		drawArrow(c, stuff.endX, stuff.endY, Math.atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX));
	}
	// draw the text
	if(stuff.hasCircle) {
		var startAngle = stuff.startAngle;
		var endAngle = stuff.endAngle;
		if(endAngle < startAngle) {
			endAngle += Math.PI * 2;
		}
		var textAngle = (startAngle + endAngle) / 2 + stuff.isReversed * Math.PI;
		var textX = stuff.circleX + stuff.circleRadius * Math.cos(textAngle);
		var textY = stuff.circleY + stuff.circleRadius * Math.sin(textAngle);
		drawText(c, this.text, textX, textY, textAngle, selectedObject == this);
	} else {
		var textX = (stuff.startX + stuff.endX) / 2;
		var textY = (stuff.startY + stuff.endY) / 2;
		var textAngle = Math.atan2(stuff.endX - stuff.startX, stuff.startY - stuff.endY);
		drawText(c, this.text, textX, textY, textAngle + this.lineAngleAdjust, selectedObject == this);
	}
};

Link.prototype.containsPoint = function(x, y) {
	var stuff = this.getEndPointsAndCircle();
	if(stuff.hasCircle) {
		var dx = x - stuff.circleX;
		var dy = y - stuff.circleY;
		var distance = Math.sqrt(dx*dx + dy*dy) - stuff.circleRadius;
		if(Math.abs(distance) < hitTargetPadding) {
			var angle = Math.atan2(dy, dx);
			var startAngle = stuff.startAngle;
			var endAngle = stuff.endAngle;
			if(stuff.isReversed) {
				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;
			}
			if(endAngle < startAngle) {
				endAngle += Math.PI * 2;
			}
			if(angle < startAngle) {
				angle += Math.PI * 2;
			} else if(angle > endAngle) {
				angle -= Math.PI * 2;
			}
			return (angle > startAngle && angle < endAngle);
		}
	} else {
		var dx = stuff.endX - stuff.startX;
		var dy = stuff.endY - stuff.startY;
		var length = Math.sqrt(dx*dx + dy*dy);
		var percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
		var distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
		return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
	}
	return false;
};

function Node(x, y) {
	this.x = x;
	this.y = y;
	this.mouseOffsetX = 0;
	this.mouseOffsetY = 0;
	this.isAcceptState = false;
	this.text = '';
}

Node.prototype.setMouseStart = function(x, y) {
	this.mouseOffsetX = this.x - x;
	this.mouseOffsetY = this.y - y;
};

Node.prototype.setAnchorPoint = function(x, y) {
	this.x = x + this.mouseOffsetX;
	this.y = y + this.mouseOffsetY;
};

Node.prototype.draw = function(c) {
	// draw the circle
	c.beginPath();
	c.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI, false);
	c.stroke();

	// draw the text
	drawText(c, this.text, this.x, this.y, null, selectedObject == this);

	// draw a double circle for an accept state
	if(this.isAcceptState) {
		c.beginPath();
		c.arc(this.x, this.y, nodeRadius - 6, 0, 2 * Math.PI, false);
		// c.fill(); fill the nodes 

		c.stroke();
	}
};

Node.prototype.closestPointOnCircle = function(x, y) {
	var dx = x - this.x;
	var dy = y - this.y;
	var scale = Math.sqrt(dx * dx + dy * dy);
	return {
		'x': this.x + dx * nodeRadius / scale,
		'y': this.y + dy * nodeRadius / scale,
	};
};

Node.prototype.containsPoint = function(x, y) {
	return (x - this.x)*(x - this.x) + (y - this.y)*(y - this.y) < nodeRadius*nodeRadius;
};

function SelfLink(node, mouse) {
	this.node = node;
	this.anchorAngle = 0;
	this.mouseOffsetAngle = 0;
	this.text = '';

	if(mouse) {
		this.setAnchorPoint(mouse.x, mouse.y);
	}
}

SelfLink.prototype.setMouseStart = function(x, y) {
	this.mouseOffsetAngle = this.anchorAngle - Math.atan2(y - this.node.y, x - this.node.x);
};

SelfLink.prototype.setAnchorPoint = function(x, y) {
	this.anchorAngle = Math.atan2(y - this.node.y, x - this.node.x) + this.mouseOffsetAngle;
	// snap to 90 degrees
	var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
	if(Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
	// keep in the range -pi to pi so our containsPoint() function always works
	if(this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
	if(this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
};

SelfLink.prototype.getEndPointsAndCircle = function() {
	var circleX = this.node.x + 1.5 * nodeRadius * Math.cos(this.anchorAngle);
	var circleY = this.node.y + 1.5 * nodeRadius * Math.sin(this.anchorAngle);
	var circleRadius = 0.75 * nodeRadius;
	var startAngle = this.anchorAngle - Math.PI * 0.8;
	var endAngle = this.anchorAngle + Math.PI * 0.8;
	var startX = circleX + circleRadius * Math.cos(startAngle);
	var startY = circleY + circleRadius * Math.sin(startAngle);
	var endX = circleX + circleRadius * Math.cos(endAngle);
	var endY = circleY + circleRadius * Math.sin(endAngle);
	return {
		'hasCircle': true,
		'startX': startX,
		'startY': startY,
		'endX': endX,
		'endY': endY,
		'startAngle': startAngle,
		'endAngle': endAngle,
		'circleX': circleX,
		'circleY': circleY,
		'circleRadius': circleRadius
	};
};

SelfLink.prototype.draw = function(c) {
	var stuff = this.getEndPointsAndCircle();
	// draw arc
	c.beginPath();
	c.arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, false);
	c.stroke();
	// draw the text on the loop farthest from the node
	var textX = stuff.circleX + stuff.circleRadius * Math.cos(this.anchorAngle);
	var textY = stuff.circleY + stuff.circleRadius * Math.sin(this.anchorAngle);
	drawText(c, this.text, textX, textY, this.anchorAngle, selectedObject == this);
	// draw the head of the arrow
	drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle + Math.PI * 0.4);
};

SelfLink.prototype.containsPoint = function(x, y) {
	var stuff = this.getEndPointsAndCircle();
	var dx = x - stuff.circleX;
	var dy = y - stuff.circleY;
	var distance = Math.sqrt(dx*dx + dy*dy) - stuff.circleRadius;
	return (Math.abs(distance) < hitTargetPadding);
};

function TemporaryLink(from, to) {
	this.from = from;
	this.to = to;
}

TemporaryLink.prototype.draw = function(c) {
	// draw the line
	c.beginPath();
	c.moveTo(this.to.x, this.to.y);
	c.lineTo(this.from.x, this.from.y);
	c.stroke();

	// draw the head of the arrow
	drawArrow(c, this.to.x, this.to.y, Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x));
};

// replace the machine on the board with one in the format of serializeMachine()
function loadMachine(backup) {
	nodes.length = 0;
	links.length = 0;
	for(var i = 0; i < backup.nodes.length; i++) {
		var backupNode = backup.nodes[i];
		var node = new Node(backupNode.x, backupNode.y);
		node.isAcceptState = backupNode.isAcceptState;
		node.text = backupNode.text;
		nodes.push(node);
	}
	for(var i = 0; i < backup.links.length; i++) {
		var backupLink = backup.links[i];
		var link = null;
		if(backupLink.type == 'SelfLink') {
			link = new SelfLink(nodes[backupLink.node]);
			link.anchorAngle = backupLink.anchorAngle;
			link.text = backupLink.text;
		} else if(backupLink.type == 'StartLink') {
			link = new StartLink(nodes[backupLink.node]);
			link.deltaX = backupLink.deltaX;
			link.deltaY = backupLink.deltaY;
			link.text = backupLink.text;
		} else if(backupLink.type == 'Link') {
			link = new Link(nodes[backupLink.nodeA], nodes[backupLink.nodeB]);
			link.parallelPart = backupLink.parallelPart;
			link.perpendicularPart = backupLink.perpendicularPart;
			link.text = backupLink.text;
			link.lineAngleAdjust = backupLink.lineAngleAdjust;
		}
		if(link != null) {
			links.push(link);
		}
	}
}

function restoreBackup() {
	if(!localStorage || !JSON) {
		return;
	}

	try {
		loadMachine(JSON.parse(localStorage['fsm']));
	} catch(e) {
		nodes.length = 0;
		links.length = 0;
		localStorage['fsm'] = '';
	}
}

// the machine as plain data: what gets saved to localStorage and what the simulator reads
function serializeMachine() {
	var backup = {
		'nodes': [],
		'links': [],
	};
	for(var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var backupNode = {
			'x': node.x,
			'y': node.y,
			'text': node.text,
			'isAcceptState': node.isAcceptState,
		};
		backup.nodes.push(backupNode);
	}
	for(var i = 0; i < links.length; i++) {
		var link = links[i];
		var backupLink = null;
		if(link instanceof SelfLink) {
			backupLink = {
				'type': 'SelfLink',
				'node': nodes.indexOf(link.node),
				'text': link.text,
				'anchorAngle': link.anchorAngle,
			};
		} else if(link instanceof StartLink) {
			backupLink = {
				'type': 'StartLink',
				'node': nodes.indexOf(link.node),
				'text': link.text,
				'deltaX': link.deltaX,
				'deltaY': link.deltaY,
			};
		} else if(link instanceof Link) {
			backupLink = {
				'type': 'Link',
				'nodeA': nodes.indexOf(link.nodeA),
				'nodeB': nodes.indexOf(link.nodeB),
				'text': link.text,
				'lineAngleAdjust': link.lineAngleAdjust,
				'parallelPart': link.parallelPart,
				'perpendicularPart': link.perpendicularPart,
			};
		}
		if(backupLink != null) {
			backup.links.push(backupLink);
		}
	}

	return backup;
}

function saveBackup() {
	if(!JSON) {
		return;
	}

	var json = JSON.stringify(serializeMachine());
	recordHistory(json);
	try {
		localStorage['fsm'] = json;
	} catch(e) {
		// storage can be full or switched off; the drawing still works for this visit
	}
}

function det(a, b, c, d, e, f, g, h, i) {
	return a*e*i + b*f*g + c*d*h - a*f*h - b*d*i - c*e*g;
}

function circleFromThreePoints(x1, y1, x2, y2, x3, y3) {
	var a = det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
	var bx = -det(x1*x1 + y1*y1, y1, 1, x2*x2 + y2*y2, y2, 1, x3*x3 + y3*y3, y3, 1);
	var by = det(x1*x1 + y1*y1, x1, 1, x2*x2 + y2*y2, x2, 1, x3*x3 + y3*y3, x3, 1);
	var c = -det(x1*x1 + y1*y1, x1, y1, x2*x2 + y2*y2, x2, y2, x3*x3 + y3*y3, x3, y3);
	return {
		'x': -bx / (2*a),
		'y': -by / (2*a),
		'radius': Math.sqrt(bx*bx + by*by - 4*a*c) / (2*Math.abs(a))
	};
}

function fixed(number, digits) {
	return number.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

var greekLetterNames = [ 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega' ];

function convertLatexShortcuts(text) {
	// html greek characters
	for(var i = 0; i < greekLetterNames.length; i++) {
		var name = greekLetterNames[i];
		text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(913 + i + (i > 16)));
		text = text.replace(new RegExp('\\\\' + name.toLowerCase(), 'g'), String.fromCharCode(945 + i + (i > 16)));
	}

	// subscripts
	for(var i = 0; i < 10; i++) {
		text = text.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
	}

	return text;
}

function textToXML(text) {
	text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	var result = '';
	for(var i = 0; i < text.length; i++) {
		var c = text.charCodeAt(i);
		if(c >= 0x20 && c <= 0x7E) {
			result += text[i];
		} else {
			result += '&#' + c + ';';
		}
	}
	return result;
}

function drawArrow(c, x, y, angle) {
	// the board's thin lines need a slightly larger head than the exports
	var size = isBoard(c) ? 1.35 : 1;
	var dx = size * Math.cos(angle);
	var dy = size * Math.sin(angle);
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
	c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
	c.fill();
}

function canvasHasFocus() {
	var active = document.activeElement || document.body;
	return active == document.body || active == canvas;
}

function drawText(c, originalText, x, y, angleOrNull, isSelected) {
	var text = convertLatexShortcuts(originalText);
	var board = isBoard(c);
	c.font = board ? canvasFont : '20px "Times New Roman", serif';
	var width = c.measureText(text).width;

	// center the text
	x -= width / 2;

	// position the text intelligently if given an angle
	if(angleOrNull != null) {
		var cos = Math.cos(angleOrNull);
		var sin = Math.sin(angleOrNull);
		var cornerPointX = (width / 2 + 5) * (cos > 0 ? 1 : -1);
		var cornerPointY = (10 + 5) * (sin > 0 ? 1 : -1);
		var slide = sin * Math.pow(Math.abs(sin), 40) * cornerPointX - cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
		x += cornerPointX - sin * slide;
		y += cornerPointY + cos * slide;
	}

	// draw text and caret (round the coordinates so the caret falls on a pixel)
	if('advancedFillText' in c) {
		c.advancedFillText(text, originalText, x + width / 2, y, angleOrNull);
	} else {
		x = Math.round(x);
		y = Math.round(y);
		if(board) {
			var ink = c.fillStyle;
			if(textBackdrop && angleOrNull != null && text != '') {
				c.fillStyle = textBackdrop;
				c.beginPath();
				c.rect(x - 5, y - 11, width + 10, 22);
				c.fill();
			}
			c.fillStyle = textStyle || ink;
			c.textBaseline = 'middle';
			var shadow = c.shadowBlur;
			c.shadowBlur = 0;
			c.fillText(text, x, y + 1);
			c.shadowBlur = shadow;
			c.fillStyle = ink;
		} else {
			c.fillText(text, x, y + 6);
		}
		if(isSelected && caretVisible && canvasHasFocus() && document.hasFocus()) {
			x += width;
			c.beginPath();
			c.moveTo(x, y - 10);
			c.lineTo(x, y + 10);
			c.stroke();
		}
	}
}

var caretTimer;
var caretVisible = true;

function resetCaret() {
	clearInterval(caretTimer);
	caretTimer = setInterval(function() {
		caretVisible = !caretVisible;
		render();
	}, 500);
	caretVisible = true;
}

var canvas;
var nodeRadius = 31;
var nodes = [];
var links = [];

var cursorVisible = true;
var snapToPadding = 6; // pixels
var hitTargetPadding = 6; // pixels
var selectedObject = null; // either a Link or a Node
var currentLink = null; // a Link
var movingObject = false;
var originalClick;

// colours of the board; exported SVG and LaTeX use exportTheme so they print on paper
var theme = {
	'node': '#5b8cff',
	'nodeFill': '#0f1838',
	'nodeText': '#eef2ff',
	'link': '#6f9bff',
	'linkText': '#c3d0fa',
	'selected': '#a5ecff',
	'labelBackdrop': 'rgba(8, 13, 32, 0.82)',
	'token': '#ffe1dc',
};
var exportTheme = { 'node': 'black', 'link': 'black', 'selected': 'black' };
var canvasFont = '500 17px "JetBrains Mono", ui-monospace, Menlo, monospace';
var textStyle = null; // colour of labels on the board, set by drawUsing
var textBackdrop = null; // colour behind transition labels on the board

// the part of the drawing that is on screen: screen = world * scale + (x, y)
var view = { 'scale': 1, 'x': 0, 'y': 0 };
var minScale = 0.3;
var maxScale = 2.5;
var pixelRatio = 1;
var panning = null;
var linkTool = false; // the toolbar's "draw transition" mode, same as holding shift

function isBoard(c) {
	return c.canvas === canvas;
}

// where a symbol is, a fraction t of the way along a transition
function linkPoint(link, t) {
	var stuff = link instanceof StartLink ? link.getEndPoints() : link.getEndPointsAndCircle();
	if(!stuff.hasCircle) {
		return { 'x': stuff.startX + (stuff.endX - stuff.startX) * t, 'y': stuff.startY + (stuff.endY - stuff.startY) * t };
	}
	var startAngle = stuff.startAngle;
	var endAngle = stuff.endAngle;
	if(stuff.isReversed) {
		while(endAngle > startAngle) endAngle -= 2 * Math.PI;
	} else {
		while(endAngle < startAngle) endAngle += 2 * Math.PI;
	}
	var angle = startAngle + (endAngle - startAngle) * t;
	return { 'x': stuff.circleX + stuff.circleRadius * Math.cos(angle), 'y': stuff.circleY + stuff.circleRadius * Math.sin(angle) };
}

// the box around everything drawn, with room for labels and self-loops, or null for an empty board
function contentBounds() {
	if(nodes.length == 0) return null;
	var box = { 'left': Infinity, 'top': Infinity, 'right': -Infinity, 'bottom': -Infinity };
	function include(x, y, padding) {
		box.left = Math.min(box.left, x - padding);
		box.top = Math.min(box.top, y - padding);
		box.right = Math.max(box.right, x + padding);
		box.bottom = Math.max(box.bottom, y + padding);
	}
	for(var i = 0; i < nodes.length; i++) {
		include(nodes[i].x, nodes[i].y, nodeRadius + 26);
	}
	for(var i = 0; i < links.length; i++) {
		if(links[i] instanceof StartLink) {
			var ends = links[i].getEndPoints();
			include(ends.startX, ends.startY, 14);
		} else {
			var middle = linkPoint(links[i], 0.5);
			include(middle.x, middle.y, 34);
		}
	}
	return box;
}

// highlight is optional: { nodes: { index: { stroke, fill, halo } }, links: { index: color }, tokens: [{ link, t }] }
// the exporters never pass it, so a running simulation does not show up in exported files
function drawUsing(c, highlight) {
	var board = isBoard(c);
	var colors = board ? theme : exportTheme;
	if(board) {
		c.setTransform(1, 0, 0, 1, 0, 0);
		c.clearRect(0, 0, canvas.width, canvas.height);
		c.setTransform(pixelRatio * view.scale, 0, 0, pixelRatio * view.scale, pixelRatio * view.x, pixelRatio * view.y);
		c.lineCap = 'round';
		c.setLineDash([]);
	} else {
		c.clearRect(0, 0, canvas.width, canvas.height);
		c.save();
		c.translate(0.5, 0.5);
	}
	textStyle = textBackdrop = null;

	for(var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var nodeMark = highlight ? highlight.nodes[i] : null;
		var color = nodeMark ? nodeMark.stroke : (node == selectedObject ? colors.selected : colors.node);
		if(board) {
			c.globalAlpha = highlight && !nodeMark ? 0.6 : 1;
			if(nodeMark && nodeMark.halo > 0) {
				// rings around a state the machine is in
				c.strokeStyle = nodeMark.stroke;
				c.lineWidth = 1.5;
				var alpha = c.globalAlpha;
				for(var ring = 1; ring <= 2; ring++) {
					c.globalAlpha = alpha * nodeMark.halo * (ring == 1 ? 0.55 : 0.25);
					c.beginPath();
					c.arc(node.x, node.y, nodeRadius + 9 * ring * nodeMark.halo, 0, 2 * Math.PI, false);
					c.stroke();
				}
				c.globalAlpha = alpha;
			}
			c.fillStyle = nodeMark ? nodeMark.fill : colors.nodeFill;
			c.shadowColor = color;
			c.shadowBlur = nodeMark || node == selectedObject ? 20 : 11;
			c.beginPath();
			c.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
			c.fill();
			c.shadowBlur = 0;
			if(node == selectedObject && nodeMark) {
				c.strokeStyle = colors.selected;
				c.lineWidth = 1.5;
				c.setLineDash([4, 5]);
				c.beginPath();
				c.arc(node.x, node.y, nodeRadius + 5, 0, 2 * Math.PI, false);
				c.stroke();
				c.setLineDash([]);
			}
			textStyle = colors.nodeText;
		}
		c.lineWidth = board ? (nodeMark ? 3 : 2.5) : 1;
		c.fillStyle = c.strokeStyle = color;
		node.draw(c);
	}
	for(var i = 0; i < links.length; i++) {
		var linkMark = highlight ? highlight.links[i] : null;
		var color = linkMark || (links[i] == selectedObject ? colors.selected : colors.link);
		if(board) {
			c.globalAlpha = highlight && !linkMark ? 0.5 : 1;
			c.shadowColor = color;
			c.shadowBlur = linkMark ? 12 : 0;
			textStyle = linkMark || links[i] == selectedObject ? '#ffffff' : colors.linkText;
			textBackdrop = colors.labelBackdrop;
		}
		c.lineWidth = board ? (linkMark ? 3 : (links[i] == selectedObject ? 2.5 : 1.75)) : 1;
		c.fillStyle = c.strokeStyle = color;
		links[i].draw(c);
	}
	if(board) {
		c.globalAlpha = 1;
		c.shadowBlur = 0;
	}
	if(currentLink != null) {
		c.lineWidth = board ? 2 : 1;
		c.fillStyle = c.strokeStyle = colors.selected;
		if(board) c.setLineDash([6, 6]);
		currentLink.draw(c);
		if(board) c.setLineDash([]);
	}
	if(board && highlight && highlight.tokens) {
		// one dot per transition being taken, so an NFA visibly splits
		for(var i = 0; i < highlight.tokens.length; i++) {
			var token = highlight.tokens[i];
			if(!links[token.link]) continue;
			var point = linkPoint(links[token.link], token.t);
			c.fillStyle = theme.token;
			c.shadowColor = highlight.links[token.link] || theme.token;
			c.shadowBlur = 16;
			c.beginPath();
			c.arc(point.x, point.y, 5.5, 0, 2 * Math.PI, false);
			c.fill();
		}
		c.shadowBlur = 0;
	}

	textStyle = textBackdrop = null;
	if(!board) {
		c.restore();
	}
}

var simulationHighlight = null; // set by simulator-ui.js while a simulation is on screen
var drawHooks = []; // run before every draw(), so the interface can follow edits and selection

// repaint only, for animation frames and the caret
function render() {
	drawUsing(canvas.getContext('2d'), simulationHighlight);
}

function draw() {
	for(var i = 0; i < drawHooks.length; i++) {
		drawHooks[i]();
	}
	render();
	saveBackup();
}

// undo and redo keep whole copies of the machine, which is small
var editHistory = { 'undo': [], 'redo': [], 'last': null, 'limit': 200 };

function recordHistory(json) {
	if(editHistory.last == null) {
		editHistory.last = json;
	} else if(json != editHistory.last && !movingObject && currentLink == null) {
		editHistory.undo.push(editHistory.last);
		if(editHistory.undo.length > editHistory.limit) editHistory.undo.shift();
		editHistory.redo = [];
		editHistory.last = json;
	}
}

function stepHistory(from, to) {
	if(from.length == 0) return false;
	to.push(editHistory.last);
	editHistory.last = from.pop();
	loadMachine(JSON.parse(editHistory.last));
	selectedObject = null;
	currentLink = null;
	movingObject = false;
	draw();
	return true;
}

function undo() {
	return stepHistory(editHistory.undo, editHistory.redo);
}

function redo() {
	return stepHistory(editHistory.redo, editHistory.undo);
}

function selectObject(x, y) {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].containsPoint(x, y)) {
			return nodes[i];
		}
	}
	for(var i = 0; i < links.length; i++) {
		if(links[i].containsPoint(x, y)) {
			return links[i];
		}
	}
	return null;
}

function snapNode(node) {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i] == node) continue;

		if(Math.abs(node.x - nodes[i].x) < snapToPadding) {
			node.x = nodes[i].x;
		}

		if(Math.abs(node.y - nodes[i].y) < snapToPadding) {
			node.y = nodes[i].y;
		}
	}
}

function deleteSelected() {
	if(selectedObject == null) return;
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i] == selectedObject) {
			nodes.splice(i--, 1);
		}
	}
	for(var i = 0; i < links.length; i++) {
		if(links[i] == selectedObject || links[i].node == selectedObject || links[i].nodeA == selectedObject || links[i].nodeB == selectedObject) {
			links.splice(i--, 1);
		}
	}
	selectedObject = null;
	draw();
}

function boardSize() {
	return { 'width': canvas.clientWidth, 'height': canvas.clientHeight };
}

// match the drawing surface to the size the canvas has on the page, at the screen's pixel density
function resizeCanvas() {
	var size = boardSize();
	if(size.width == 0 || size.height == 0) return;
	pixelRatio = window.devicePixelRatio || 1;
	var width = Math.round(size.width * pixelRatio);
	var height = Math.round(size.height * pixelRatio);
	if(canvas.width != width || canvas.height != height) {
		canvas.width = width;
		canvas.height = height;
	}
	render();
}

function setView(scale, x, y) {
	view.scale = Math.max(minScale, Math.min(maxScale, scale));
	view.x = x;
	view.y = y;
	draw();
}

// zoom while keeping the point under (screenX, screenY) where it is
function zoomAt(factor, screenX, screenY) {
	var scale = Math.max(minScale, Math.min(maxScale, view.scale * factor));
	var worldX = (screenX - view.x) / view.scale;
	var worldY = (screenY - view.y) / view.scale;
	setView(scale, screenX - worldX * scale, screenY - worldY * scale);
}

function zoomBy(factor) {
	var size = boardSize();
	zoomAt(factor, size.width / 2, size.height / 2);
}

function resetView() {
	setView(1, 0, 0);
}

function fitView() {
	var box = contentBounds();
	var size = boardSize();
	if(box == null || size.width == 0) {
		resetView();
		return;
	}
	var scale = Math.min(size.width / (box.right - box.left), size.height / (box.bottom - box.top), 1);
	scale = Math.max(minScale, scale);
	setView(scale, (size.width - (box.left + box.right) * scale) / 2, (size.height - (box.top + box.bottom) * scale) / 2);
}

function contentIsVisible() {
	var box = contentBounds();
	var size = boardSize();
	if(box == null) return true;
	return box.left * view.scale + view.x >= 0 && box.top * view.scale + view.y >= 0 &&
		box.right * view.scale + view.x <= size.width && box.bottom * view.scale + view.y <= size.height;
}

// the middle of the visible board, in drawing coordinates
function viewCenter() {
	var size = boardSize();
	return { 'x': (size.width / 2 - view.x) / view.scale, 'y': (size.height / 2 - view.y) / view.scale };
}

function screenPos(e) {
	var rect = canvas.getBoundingClientRect();
	return { 'x': e.clientX - rect.left, 'y': e.clientY - rect.top };
}

function canvasPos(e) {
	var screen = screenPos(e);
	return { 'x': (screen.x - view.x) / view.scale, 'y': (screen.y - view.y) / view.scale };
}

function linking() {
	return shift || linkTool;
}

function pressBoard(e) {
	var mouse = canvasPos(e);
	selectedObject = selectObject(mouse.x, mouse.y);
	movingObject = false;
	originalClick = mouse;

	if(selectedObject != null) {
		if(linking() && selectedObject instanceof Node) {
			currentLink = new SelfLink(selectedObject, mouse);
		} else {
			movingObject = true;
			deltaMouseX = deltaMouseY = 0;
			if(selectedObject.setMouseStart) {
				selectedObject.setMouseStart(mouse.x, mouse.y);
			}
		}
		resetCaret();
	} else if(linking()) {
		currentLink = new TemporaryLink(mouse, mouse);
	} else {
		// dragging the empty board moves the view
		var screen = screenPos(e);
		panning = { 'startX': screen.x, 'startY': screen.y, 'viewX': view.x, 'viewY': view.y };
	}

	draw();
}

function doubleClickBoard(e) {
	var mouse = canvasPos(e);
	selectedObject = selectObject(mouse.x, mouse.y);

	if(selectedObject == null) {
		selectedObject = new Node(mouse.x, mouse.y);
		nodes.push(selectedObject);
		resetCaret();
		draw();
	} else if(selectedObject instanceof Node) {
		selectedObject.isAcceptState = !selectedObject.isAcceptState;
		draw();
	}
}

function moveBoard(e) {
	var mouse = canvasPos(e);

	if(panning != null) {
		var screen = screenPos(e);
		view.x = panning.viewX + screen.x - panning.startX;
		view.y = panning.viewY + screen.y - panning.startY;
		draw();
		return;
	}

	if(currentLink != null) {
		var targetNode = selectObject(mouse.x, mouse.y);
		if(!(targetNode instanceof Node)) {
			targetNode = null;
		}

		if(selectedObject == null) {
			if(targetNode != null) {
				currentLink = new StartLink(targetNode, originalClick);
			} else {
				currentLink = new TemporaryLink(originalClick, mouse);
			}
		} else {
			if(targetNode == selectedObject) {
				currentLink = new SelfLink(selectedObject, mouse);
			} else if(targetNode != null) {
				currentLink = new Link(selectedObject, targetNode);
			} else {
				currentLink = new TemporaryLink(selectedObject.closestPointOnCircle(mouse.x, mouse.y), mouse);
			}
		}
		draw();
	}

	if(movingObject) {
		selectedObject.setAnchorPoint(mouse.x, mouse.y);
		if(selectedObject instanceof Node) {
			snapNode(selectedObject);
		}
		draw();
	}
}

function releaseBoard() {
	movingObject = false;
	panning = null;

	if(currentLink != null) {
		if(!(currentLink instanceof TemporaryLink)) {
			selectedObject = currentLink;
			links.push(currentLink);
			linkTool = false;
			resetCaret();
		}
		currentLink = null;
	}
	draw();
}

window.onload = function() {
	canvas = document.getElementById('canvas');
	restoreBackup();
	resizeCanvas();
	if(!contentIsVisible()) {
		fitView();
	}
	draw();
	if(document.fonts && document.fonts.ready) {
		document.fonts.ready.then(render);
	}
	window.addEventListener('resize', resizeCanvas);

	var touches = {}; // fingers on the board, by pointer id
	var pinch = null;
	var lastTap = { 'time': 0, 'x': 0, 'y': 0 };
	var lastTouchDouble = 0;

	function touchList() {
		var list = [];
		for(var id in touches) list.push(touches[id]);
		return list;
	}

	function pinchState() {
		var list = touchList();
		var dx = list[1].x - list[0].x;
		var dy = list[1].y - list[0].y;
		return { 'distance': Math.sqrt(dx * dx + dy * dy) || 1, 'x': (list[0].x + list[1].x) / 2, 'y': (list[0].y + list[1].y) / 2 };
	}

	canvas.addEventListener('pointerdown', function(e) {
		if(e.pointerType == 'mouse' && e.button != 0) return;
		try { canvas.setPointerCapture(e.pointerId); } catch(error) {}

		if(e.pointerType != 'mouse') {
			touches[e.pointerId] = screenPos(e);
			if(touchList().length == 2) {
				// a second finger turns the gesture into zoom and pan
				movingObject = false;
				currentLink = null;
				panning = null;
				var state = pinchState();
				pinch = { 'distance': state.distance, 'worldX': (state.x - view.x) / view.scale, 'worldY': (state.y - view.y) / view.scale, 'scale': view.scale };
				return;
			}
			// touch screens have no double-click, so two quick taps in one place count as one
			var now = Date.now();
			var tap = screenPos(e);
			if(now - lastTap.time < 350 && Math.abs(tap.x - lastTap.x) < 30 && Math.abs(tap.y - lastTap.y) < 30) {
				lastTap.time = 0;
				lastTouchDouble = now;
				doubleClickBoard(e);
				return;
			}
			lastTap = { 'time': now, 'x': tap.x, 'y': tap.y };
		}
		pressBoard(e);
	});

	canvas.addEventListener('pointermove', function(e) {
		if(e.pointerType != 'mouse' && touches[e.pointerId]) {
			touches[e.pointerId] = screenPos(e);
			if(pinch != null && touchList().length == 2) {
				var state = pinchState();
				var scale = Math.max(minScale, Math.min(maxScale, pinch.scale * state.distance / pinch.distance));
				setView(scale, state.x - pinch.worldX * scale, state.y - pinch.worldY * scale);
				return;
			}
		}
		moveBoard(e);
	});

	function pointerEnd(e) {
		var wasPinch = pinch != null;
		delete touches[e.pointerId];
		if(touchList().length < 2) pinch = null;
		if(wasPinch) return;
		releaseBoard();
	}
	canvas.addEventListener('pointerup', pointerEnd);
	canvas.addEventListener('pointercancel', pointerEnd);

	canvas.addEventListener('dblclick', function(e) {
		if(Date.now() - lastTouchDouble < 700) return;
		doubleClickBoard(e);
	});

	// pinch on a trackpad, or ctrl/cmd + wheel, zooms; a plain wheel still scrolls the page
	canvas.addEventListener('wheel', function(e) {
		if(!e.ctrlKey && !e.metaKey) return;
		e.preventDefault();
		var screen = screenPos(e);
		zoomAt(Math.exp(-e.deltaY * 0.01), screen.x, screen.y);
	}, { 'passive': false });
}

var shift = false;

document.onkeydown = function(e) {
	var key = crossBrowserKey(e);

	if(key == 16) {
		shift = true;
	} else if(!canvasHasFocus()) {
		// don't read keystrokes when other things have focus
		return true;
	} else if((e.ctrlKey || e.metaKey) && (key == 90 || key == 89)) { // ctrl/cmd + z, y
		if(key == 89 || e.shiftKey) redo(); else undo();
		return false;
	} else if(key == 8) { // backspace key
		if(selectedObject != null && 'text' in selectedObject) {
			selectedObject.text = selectedObject.text.substr(0, selectedObject.text.length - 1);
			resetCaret();
			draw();
		}

		// backspace is a shortcut for the back button, but do NOT want to change pages
		return false;
	} else if(key == 46) { // delete key
		deleteSelected();
	}
};

document.onkeyup = function(e) {
	var key = crossBrowserKey(e);

	if(key == 16) {
		shift = false;
	}
};

document.onkeypress = function(e) {
	// don't read keystrokes when other things have focus
	var key = crossBrowserKey(e);
	if(!canvasHasFocus()) {
		// don't read keystrokes when other things have focus
		return true;
	} else if(key >= 0x20 && key <= 0x7E && !e.metaKey && !e.altKey && !e.ctrlKey && selectedObject != null && 'text' in selectedObject) {
		selectedObject.text += String.fromCharCode(key);
		resetCaret();
		draw();

		// don't let keys do their actions (like space scrolls down the page)
		return false;
	} else if(key == 8) {
		// backspace is a shortcut for the back button, but do NOT want to change pages
		return false;
	}
};

function crossBrowserKey(e) {
	e = e || window.event;
	return e.which || e.keyCode;
}

function output(text) {
	var element = document.getElementById('output');
	element.style.display = 'block';
	element.value = text;
}

// what the board would look like with nothing selected and no simulation, for exporting
function drawPlain(c) {
	var oldSelectedObject = selectedObject;
	selectedObject = null;
	drawUsing(c);
	selectedObject = oldSelectedObject;
}

function saveAsSVG() {
	var exporter = new ExportAsSVG();
	drawPlain(exporter);
	var svgData = exporter.toSVG();
	output(svgData);
	return svgData;
}

function saveAsLaTeX() {
	var exporter = new ExportAsLaTeX();
	drawPlain(exporter);
	var texData = exporter.toLaTeX();
	output(texData);
	return texData;
}
