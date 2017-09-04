(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/* jshint esversion: 6 */
"strict mode";

var _ColorSpace = require("../../src/js/ColorSpace.es6");

var _ColorSpace2 = _interopRequireDefault(_ColorSpace);

var _ColorPicker = require("../../src/js/ColorPicker.es6");

var _ColorPicker2 = _interopRequireDefault(_ColorPicker);

var _PMS = require("../../src/js/PMS.es6");

var _PMS2 = _interopRequireDefault(_PMS);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

// import ColorCanvas from "../../src/js/ColorCanvas.es6";
var COLOR_SPACE = new _ColorSpace2.default(),
    PMS = new _PMS2.default();

$(document).ready(function () {
	var cp = new _ColorPicker2.default({
		linkedElement: $("#color-picker"),
		flat: true,
		width: 600,
		initialColor: {
			r: 0,
			g: 0,
			b: 0
		},
		onColorChange: function onColorChange(rgb, hsv) {
			var hex = COLOR_SPACE.RGB2HEX(rgb),
			    cmyk = COLOR_SPACE.rgb2ymck(rgb),
			    p = cp.getProximity(),
			    m = PMS.PMSColorMatching(hex, p),
			    l = rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.114,
			    inverted_color = "#" + (l < 128 ? COLOR_SPACE.RGB2HEX({ r: 255, g: 255, b: 255 }) : COLOR_SPACE.RGB2HEX({ r: 0, g: 0, b: 0 })),
			    $table = $("<table>", {
				"border": "0",
				"cellpadding": "0",
				"style": "font-family: arial; font-size: 12px; font-weight: bold"
			});

			$("#matching").html("").append("PANTONE<sup>®</sup> colors close to RGB color ").append($("<code>", {
				"id": "color_sample",
				"style": "background-color: #" + hex + "; color: " + inverted_color
			}).text("#" + hex)).append($("<br />")).append("Max color distance: " + p);
			if (m.length > 0) {
				var ipms = 0;

				for (var i = 0; i < Math.ceil(m.length / 5); i++) {
					var $tr = $("<tr>", { "align": "center" });
					for (var j = 0; j < 5; j++) {
						var $td = $("<td>");
						if (ipms < m.length) {
							(function () {
								var rgbcode = PMS.PMS2RGB(m[ipms]).toLowerCase();
								$td.append($("<a>", {
									"href": "javascript:;",
									"title": "Use this color"
								}).append(m[ipms]).append($("<div>", {
									"style": "background-color: #" + rgbcode + ";"
								})).on("click", function () {
									$("#HEX").val(rgbcode);
									cp.changeColor(COLOR_SPACE.parseColor(rgbcode));
								}));
								ipms = ipms + 1;
							})();
						}
						$tr.append($td);
					}
					$table.append($tr);
				}
			}
			$("#PMScolors").html($table);
		}
	});
});

},{"../../src/js/ColorPicker.es6":3,"../../src/js/ColorSpace.es6":4,"../../src/js/PMS.es6":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */

var _ColorSpace = require("./ColorSpace.es6");

var _ColorSpace2 = _interopRequireDefault(_ColorSpace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COLOR_SPACE = new _ColorSpace2.default();

var ColorCanvas = function () {
	function ColorCanvas(canvas, hueBar) {
		_classCallCheck(this, ColorCanvas);

		this.newImage = true;
		this.maxX = 255;
		this.maxY = 255;

		this.selX = 128; /* value range 0 - 255 */
		this.selY = 128; /* value range 0 - 255 */
		this.selZ = 1.0;

		this.hueBar = hueBar;
		this.image = canvas; //canvas
		this.ImageData = null;
		this.paint();
	}

	_createClass(ColorCanvas, [{
		key: "paint",
		value: function paint() {
			var w = this.image.width,
			    h = this.image.height;
			if (w === 0 || h === 0) {
				return;
			}

			var x = Math.round(this.selX * w / this.maxX);
			var y = Math.round(this.selY * h / this.maxY);

			if (this.newImage || !this.image) {
				this.makeImage(this.selZ, w, h);
			}
			var ctx = this.image.getContext("2d");
			ctx.putImageData(this.ImageData, 0, 0);

			var color = this.getColor(),
			    l = color.r * 0.3 + color.g * 0.59 + color.b * 0.114;

			if (this.drawPointer) {
				this.drawDefaultPointer(ctx, w, h, x, y, l);
			} else {
				this.drawDefaultPointer(ctx, w, h, x, y, l);
			}
		}
	}, {
		key: "drawDefaultPointer",
		value: function drawDefaultPointer(ctx, w, h, x, y, l, isHueBar) {
			var radius = 6,
			    color = void 0;
			ctx.beginPath();
			ctx.lineWidth = 1;
			color = l < 128 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
			ctx.strokeStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
			ctx.arc(x + 0.5, y + 0.5, radius, 0, Math.PI * 2, true);
			radius += 2;
			// ctx.moveTo(x - radius + 0.5, y + 0.5);
			// ctx.lineTo(x + radius + 0.5, y + 0.5);
			// ctx.moveTo(x + 0.5, y - radius + 0.5);
			// ctx.lineTo(x + 0.5, y + radius + 0.5);
			ctx.stroke();
		}
	}, {
		key: "makeImage",
		value: function makeImage(b, w, h) {
			if (!this.image) {
				this.image = document.createElement("canvas");
				this.image.width = w;
				this.image.height = h;
			}

			var imgData = void 0;
			if (this.hueBar) {
				imgData = this._makeHueMap(b, w, h);
			} else {
				imgData = this._makeColorMap(b, w, h);
			}

			this.newImage = false;
			this.image.getContext("2d").putImageData(imgData, 0, 0);
			this.ImageData = imgData;
		}
	}, {
		key: "_makeColorMap",
		value: function _makeColorMap(b, w, h) {
			var imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			    index = 0,
			    hue = 0.0,
			    sat = 0.0,
			    bri = 0.0,
			    x = void 0,
			    y = void 0;
			hue = (b - Math.floor(b)) * 360;

			for (y = 0; y < h; y++) {
				bri = 1 - y / h;
				for (x = 0; x < w; x++) {
					sat = x / w;
					var rgb = COLOR_SPACE.hsv2rgb(hue, sat * 255, bri * 255);
					//rgb = COLOR_SPACE.getWebSafeColor(rgb);
					imgData.data[index++] = rgb.r;
					imgData.data[index++] = rgb.g;
					imgData.data[index++] = rgb.b;
					imgData.data[index++] = 255;
				}
			}
			return imgData;
		}
	}, {
		key: "_makeHueMap",
		value: function _makeHueMap(b, w, h) {
			var imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			    index = 0,
			    hue = 0.0,
			    sat = 1,
			    x = void 0,
			    y = void 0;

			for (y = h - 1; y >= 0; y--) {
				hue = y / h;
				hue = (hue - Math.floor(hue)) * 360;

				for (x = 0; x < w; x++) {
					var bri = 1 - x / w,
					    rgb = COLOR_SPACE.hsv2rgb(hue, sat * 255, bri * 255);
					//rgb = COLOR_SPACE.getWebSafeColor(rgb);
					imgData.data[index++] = rgb.r;
					imgData.data[index++] = rgb.g;
					imgData.data[index++] = rgb.b;
					imgData.data[index++] = 255;
				}
			}
			return imgData;
		}
	}, {
		key: "setXY",
		value: function setXY(x, y) {
			this.selX = x;this.selY = y;
			this.paint();
		}
	}, {
		key: "setColor",
		value: function setColor(c) {
			var hsb = COLOR_SPACE.rgb2hsv(c.r, c.g, c.b);
			if (this.hueBar) {
				this.selZ = hsb.s / 255;
				this.setXY(255 - hsb.v, 255 - hsb.h / 360 * 255);
			} else {
				this.selZ = hsb.h / 360;
				this.setXY(hsb.s, 255 - hsb.v);
			}
			this.repaint();
		}
	}, {
		key: "getColor",
		value: function getColor() {
			var h = this.hueBar ? 1 - this.selY / 255 : this.selZ,
			    s = this.hueBar ? 255 : this.selX,
			    v = this.hueBar ? this.selX : this.selY;
			h = (h - Math.floor(h)) * 360;
			return COLOR_SPACE.hsv2rgb(h, s, 255 - v);
		}
	}, {
		key: "repaint",
		value: function repaint() {
			this.newImage = true;
			this.paint();
		}
	}]);

	return ColorCanvas;
}();

exports.default = ColorCanvas;

},{"./ColorSpace.es6":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jshint esversion: 6 */

var _ColorSpace = require("./ColorSpace.es6");

var _ColorSpace2 = _interopRequireDefault(_ColorSpace);

var _ColorCanvas = require("./ColorCanvas.es6");

var _ColorCanvas2 = _interopRequireDefault(_ColorCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COLOR_SPACE = new _ColorSpace2.default();

var ColorPicker = function () {
	function ColorPicker(options) {
		_classCallCheck(this, ColorPicker);

		var settings = {
			linkedElement: this,
			flat: true,
			width: 600,
			height: 250,
			showColor: true,
			showRGB: false,
			showHSB: false,
			showPreview: true,
			initialColor: {
				r: 64,
				g: 128,
				b: 128
			},
			onColorChange: function onColorChange(rgb, hsv) {},
			drawColorMapPointer: null,
			drawHueMapPointer: null,
			fnDrawPointer1: true,
			fnDrawPointer2: true
		};
		if (options) {
			$.extend(settings, options);
		}
		Object.assign(this, settings);
		// this.element = this.element.width();

		$(settings.linkedElement).width(settings.width);
		$(settings.linkedElement).height(settings.height);
		// ACTIONS
		if (this.flat) {
			this._buildUI(settings.linkedElement);
		} else {
			this._buildUI();
		}
		$(settings.linkedElement).find("canvas").each(function (k, item) {
			var $canvas_container = $(item).closest(".canvas-container"),
			    w = $canvas_container.width(),
			    h = $canvas_container.height();
			if ($canvas_container.hasClass("color-map")) {
				$(item).attr("width", w - 25);
			} else {
				$(item).attr("width", w);
			}
			$(item).attr("height", h);
		});
		this.canvasMap = $(".color-map canvas")[0];
		this.canvasBar = $(".color-bar canvas")[0];
		// ColorMap
		this.colorMap = new _ColorCanvas2.default(this.canvasMap, false);
		if (settings.fnDrawPointer1) {
			this.colorMap.drawPointer = settings.fnDrawPointer1;
		}
		// ColorBar
		this.colorBar = new _ColorCanvas2.default(this.canvasBar, true);
		if (settings.fnDrawPointer2) {
			this.colorBar.drawPointer = settings.fnDrawPointer2;
		}
		this.setInitialColor(settings.initialColor);
		this._showHEXInput(settings.showColor);
		this._showPreviewBox(settings.showPreview);
		$(this.canvasMap).data({ "ME": this.colorMap, "YOU": this.colorBar });
		$(this.canvasBar).data({ "YOU": this.colorMap, "ME": this.colorBar });

		this._registerEvent();

		//	 // this.setColor({r: 64, g: 128, b: 128});
		if (this._isInput()) {
			var val = $(this.linkedElement).val();
			if (val.length === 6) {
				this.currentColor = _ColorSpace2.default.parseColor(val);
				if (!this.currentColor) {
					this.currentColor = settings.color;
				}
			}
		}
		// if(settings.flat) {
		// 	this.sizeTo($(this).width(), $(this).height());
		// } else {
		// 	this.sizeTo(settings.width, settings.height);
		// }
	}

	_createClass(ColorPicker, [{
		key: "_isInput",
		value: function _isInput() {
			return this.linkedElement && this.linkedElement[0].nodeName.toLowerCase() === "input" && $(this.linkedElement).attr("type") === "text";
		}
	}, {
		key: "CLAMP",
		value: function CLAMP(c, min, max) {
			min = min || 0;max = max || 255;
			if (c < min) {
				c = min;
			}
			if (c > max) {
				c = max;
			}
			return Math.round(c);
		}
	}, {
		key: "_restoreToInitial",
		value: function _restoreToInitial() {
			// if(this._isInput()) {
			// 	$(this.linkedElement).val(COLOR_SPACE.RGB2HEX(this.initialColor));
			// } else {
			// 	$(".cur-color").css("background-color","rgb(" + this.initialColor.r + "," + this.initialColor.g + "," + this.initialColor.b + ")");
			// }
			this.colorChanged(this.initialColor);
		}
	}, {
		key: "_registerEvent",
		value: function _registerEvent() {
			var _this2 = this;

			var _this = this;
			this.mouseStarted = false;

			if (this._isInput()) {
				$(this.linkedElement).on("focus", function () {
					// _this.show();
				});
			} else {
				$(".canvas-container").on("mousedown", function (event) {
					// _this.show();
					_this2.mouseStarted = true;
					var offset = $(event.target).offset(),
					    x = event.pageX - offset.left,
					    y = event.pageY - offset.top;
					_this2._trackChanging(x, y, $(event.target));
				}).on("mousemove", function (event) {
					if (_this2.mouseStarted) {
						var offset = $(event.target).offset(),
						    x = event.pageX - offset.left,
						    y = event.pageY - offset.top;
						_this2._trackChanging(x, y, $(event.target));
					}
				}).on("mouseup mouseout", function () {
					_this2.mouseStarted = false;
				});
			}
			$(".old-color").on("click", function () {
				_this2._restoreToInitial();
			});
			$(".cur-color").click(function () {
				_this2.initialColor = _this2.currentColor;
				$(".old-color").css("background-color", "rgb(" + _this.initialColor.r + "," + _this.initialColor.g + "," + _this.initialColor.b + ")");
			});

			$("input[name=R], input[name=G], input[name=B]").on("keyup", function (event) {
				var v = $(event.target).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					v = _this2.CLAMP(v, 0, 255);
					switch (event.target.name) {
						case "R":
							_this2.currentColor.r = v;break;
						case "G":
							_this2.currentColor.g = v;break;
						case "B":
							_this2.currentColor.b = v;break;
					}
					_this2.setColor(_this2.currentColor);
					_this2.colorChanged(_this2.currentColor);
				} else {
					_this2.setColor(_this2.currentColor);
				}
			});

			$("input[name=H], input[name=S], input[name=V]").on("keyup", function (event) {
				var v = $(event.target).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var hsv = COLOR_SPACE.rgb2hsv(_this2.currentColor);
					// hsv.s = parseInt((hsv.s / 255 * 100).toFixed(0));
					// hsv.v = parseInt((hsv.v / 255 * 100).toFixed(0));
					v = parseFloat(v);
					switch (event.target.name) {
						case "H":
							v = _this2.CLAMP(v, 0, 359);hsv.h = v;break;
						case "S":
							v = _this2.CLAMP(v, 0, 100);hsv.s = v * 255 / 100;break;
						case "V":
							v = _this2.CLAMP(v, 0, 100);hsv.v = v * 255 / 100;break;
					}
					_this2.currentColor = COLOR_SPACE.hsv2rgb(hsv);
					_this2.setColor(_this.currentColor);
					_this2.colorChanged(_this.currentColor);
				} else {
					_this2.setColor(_this2.currentColor);
				}
			});

			$("input[name=Y], input[name=M], input[name=C], input[name=K]").on("keyup", function (event) {
				var v = $(event.target).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var ymck = COLOR_SPACE.rgb2ymck(_this2.currentColor);
					switch (event.target.name) {
						case "C":
							v = _this2.CLAMP(v, 0, 100);ymck.c = v;break;
						case "M":
							v = _this2.CLAMP(v, 0, 100);ymck.m = v;break;
						case "Y":
							v = _this2.CLAMP(v, 0, 100);ymck.y = v;break;
						case "K":
							v = _this2.CLAMP(v, 0, 100);ymck.k = v;break;
					}
					_this2.currentColor = COLOR_SPACE.ymck2rgb(ymck);
					_this2.setColor(_this2.currentColor);
					_this2.colorChanged(_this2.currentColor);
				} else {
					_this.setColor(_this.currentColor);
				}
			});

			$("input[name=HEX]").on("change", function (event) {
				var color = COLOR_SPACE.parseColor($(event.target).val());
			}).on("focus", function (event) {
				$(event.target).select();
			}).on("keyup", function (event) {
				if ($(event.target).val().length == 6) {
					var color = COLOR_SPACE.parseColor($(event.target).val());
					_this2.changeColor(color);
				}
			});
		}
	}, {
		key: "changeColor",
		value: function changeColor(color) {
			if (color) {
				this.setColor(color);
				this.colorChanged(color);
			}
		}
	}, {
		key: "setInitialColor",
		value: function setInitialColor(color) {
			this.initialColor = color;
			$(".old-color").css("backgroundColor", COLOR_SPACE.RGB2HEX(color));
			this.setColor(color);
		}
	}, {
		key: "setColor",
		value: function setColor(color) {
			this.currentColor = color;
			this.setColorText(this.currentColor);
			this.colorMap.setColor(this.currentColor);
			this.colorBar.setColor(this.currentColor);
		}
	}, {
		key: "_trackChanging",
		value: function _trackChanging(x, y, canvas) {
			var x1 = this.CLAMP(x * 255 / canvas.width(), 0, 255),
			    y1 = this.CLAMP(y * 255 / canvas.height(), 0, 255);
			canvas.data("ME").setXY(x1, y1);
			//
			var color = canvas.data("ME").getColor();
			canvas.data("YOU").setColor(color);
			//
			if (color) {
				this.colorChanged(color);
			}
		}
	}, {
		key: "colorChanged",
		value: function colorChanged(color) {
			this.currentColor = color;
			this.setColorText(color);

			if (this._isInput()) {
				$(this.linkedElement).val(COLOR_SPACE.RGB2HEX(color));
			} else {
				$(".cur-color").css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
			}

			if (this.onColorChange) {
				this.onColorChange(color, COLOR_SPACE.rgb2hsv(color));
			}
		}
	}, {
		key: "setColorText",
		value: function setColorText(color) {
			$("input[name=HEX]").val(COLOR_SPACE.RGB2HEX(color));
			$("input[name=R]").val(color.r);
			$("input[name=G]").val(color.g);
			$("input[name=B]").val(color.b);
			var hsv = COLOR_SPACE.rgb2hsv(color);
			hsv.s = (hsv.s / 255 * 100).toFixed(0);
			hsv.v = (hsv.v / 255 * 100).toFixed(0);
			$("input[name=H]").val(hsv.h);
			$("input[name=S]").val(hsv.s);
			$("input[name=V]").val(hsv.v);
			var ymck = COLOR_SPACE.rgb2ymck(color);
			$("input[name=Y]").val(ymck.y);
			$("input[name=M]").val(ymck.m);
			$("input[name=C]").val(ymck.c);
			$("input[name=K]").val(ymck.k);

			$(".preview .cur-color").css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
			$(this.linkedElement).data("current_color", color);
		}
	}, {
		key: "getColor",
		value: function getColor() {
			return this.currentColor;
		}

		// show() {
		// 	if(this.element[0].css.visibility == "hidden") {
		// 		let offset = $(this.linkedElement).offset(),
		// 			left = offset.left,
		// 			top = offset.top + $(this.linkedElement).outerHeight(),
		// 			color = $(this.linkedElement).data("current_color");
		//
		// 		if(left + this.element[0].width() > $(window).width() + $("body").scrollLeft()) {
		// 			left = $(window).width() + $("body").scrollLeft() - this.element.width() - 10;
		// 		}
		// 		if(top + this.element.height() > $(window).height() + $(window).scrollTop()) {
		// 			top =  offset.top - this.element.height() - 10;
		// 		}
		//
		// 		this._mask.css("display","");
		// 		this.element[0].css({
		// 			"visibility": "visible",
		// 			"left": left + "px",
		// 			"top": top + "px"
		// 		}).animate({
		// 			opacity: 1
		// 		}, 300);
		// 		if(this.linkedElement[0].nodeName.toLowerCase() === "input" && $(this.linkedElement).attr("type") === "text") {
		// 			let val = $(this.linkedElement).val();
		// 			if(val.length === 7 && val.charAt(0) === "#") {
		// 				color = COLOR_SPACE.parseColor(val);
		// 			}
		// 		}
		//
		// 		if(color) {
		// 			this.setInitialColor(color);
		// 		}
		// 	}
		// }

		// hide() {
		// 	if(this.element[0].css.visibility !== "hidden") {
		// 		this._mask.css("display", "none");
		// 		this.element[0].animate({
		// 			opacity: 0
		// 		}, 300, () => {
		// 			$(this).css("visibility", "hidden");
		// 		});
		// 	}
		// }

	}, {
		key: "_buildUI",
		value: function _buildUI(element) {
			var _this3 = this;

			var idext = Math.round(Math.random() * 1000000 * new Date()),
			    cp = this.css = {
				position: "absolute",
				left: "0px",
				top: "0px",
				visibility: "visible",
				zIndex: 10001
			},
			    e = $("body"),
			    cls = " popup",
			    options = [];

			for (var i = 4; i <= 64; i *= 2) {
				options.push(i);
			}
			if (element) {
				e = $(element);
				var w = e.width(),
				    h = e.height();
				if (e.css("position") == "relative" || e.css("position") == "absolute") {
					this.css = {
						position: "absolute",
						left: "0px",
						top: "0px",
						visibility: "visible",
						width: w + "px",
						height: h + "px"
					};
				} else {
					e.css("position", "relative");
					this.css = {
						position: "absolute",
						left: "0px",
						top: "0px",
						visibility: "visible",
						width: w + "px",
						height: h + "px"
					};
				}
				cls = "";
			} else {
				e.append(
				// mask
				$("<div></div>").attr("id", "cp-mask-" + idext).css({
					position: "absolute",
					left: "0px",
					top: "0px",
					width: $(document).width() + "px",
					height: $(document).height() + "px",
					zIndex: 10000,
					opacity: 0.01,
					display: "none"
				}).each(function () {
					cp._mask = $(_this3);
				}).bind("mousedown", function () {
					cp.hide();
				}));
			}
			e.append($("<div>", {
				"class": "canvas-color-picker" + cls,
				"id": "cp-" + idext
			}).css(this.css).append($("<div>", { "class": "color-map canvas-container" }).append($("<canvas>", { "class": "colormap" }))).append($("<div>", { "class": "color-bar canvas-container" }).append($("<canvas>", { "class": "huebar" }))).append($("<div>", { "class": "preview" }).append($("<div>", { "class": "cur-color" })).append($("<div>", { "class": "old-color" }))).append($("<div>", { "class": "form" }).append($("<div>", { "class": "hor-div" }).append($("<div>", { "class": "hsb" }).append($("<label>").append("H:").append($("<input>", { "type": "text", "name": "H", "size": "3", "maxlength": "3" })).append("&deg;")).append($("<label>").append("S:").append($("<input>", { "type": "text", "name": "S", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("V:").append($("<input>", { "type": "text", "name": "V", "size": "3", "maxlength": "3" })).append("%"))).append($("<div>", { "class": "rgb" }).append($("<label>").append("R:").append($("<input>", { "type": "text", "name": "R", "size": "3", "maxlength": "3" }))).append($("<label>").append("G:").append($("<input>", { "type": "text", "name": "G", "size": "3", "maxlength": "3" }))).append($("<label>").append("B:").append($("<input>", { "type": "text", "name": "B", "size": "3", "maxlength": "3" })))).append($("<div>", { "class": "cmyk" }).append($("<label>").append("C:").append($("<input>", { "type": "text", "name": "C", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("M:").append($("<input>", { "type": "text", "name": "M", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("Y:").append($("<input>", { "type": "text", "name": "Y", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("K:").append($("<input>", { "type": "text", "name": "K", "size": "3", "maxlength": "3" })).append("%")))).append($("<div>", { "class": "color" }).append($("<label>").append("HEX: #").append($("<input>", { "type": "text", "name": "HEX", "id": "HEX", "size": "6", "maxlength": "6" })))).append($("<div>", { "class": "proximity" }).append($("<label>").append("Color distance:").append($("<select>", { "id": "proximity" }).append($.map(options, function (v) {
				return $("<option>", { "value": v, "selected": v == 32 ? "selected" : null }).append(v);
			})))))).each(function () {
				_this3.element = $(_this3);
			}));
		}
	}, {
		key: "_showRGBInput",
		value: function _showRGBInput(flag) {
			if (flag) {
				$(".form .rgb").show();
			} else {
				$(".form .rgb").hide();
			}
		}
	}, {
		key: "_showHSBInput",
		value: function _showHSBInput(flag) {
			if (flag) {
				$(".form .hsb").show();
			} else {
				$(".form .hsb").hide();
			}
		}
	}, {
		key: "_showHEXInput",
		value: function _showHEXInput(flag) {
			if (flag) {
				$(".form .color").show();
			} else {
				$(".form .color").hide();
			}
		}
	}, {
		key: "_showPreviewBox",
		value: function _showPreviewBox(flag) {
			if (flag) {
				$(".preview").show();
			} else {
				$(".preview").hide();
			}
		}
	}, {
		key: "getProximity",
		value: function getProximity() {
			return $("#proximity").val();
		}
	}, {
		key: "sizeTo",
		value: function sizeTo(w, h) {
			// console.error(w, h);
			if (w < 60) {
				w = 60;
			}
			if (h < 30) {
				h = 30;
			}
			this.element.width(w);
			$(".colormap").width(w).height(h);
			$(".huebar").width(w).height(h);
			if (h < 150) {
				this._showRGBInput(false)._showHSBInput(false);
			}
			if (h < 100) {
				this.showPreview(false)._showHEXInput(false);
			}
			if (w < 200) {
				this._showRGBInput(false)._showHSBInput(false).showPreview(false)._showHEXInput(false);
			}
			this._rearrange();
		}
	}, {
		key: "_rearrange",
		value: function _rearrange() {
			var w = this.element.width(),
			    h = this.element.height();
			if (h < 200) {
				this._showRGBInput(false);
				this._showHSBInput(false);
			}
			$(".colormap").attr({
				"width": $(".color-map").width(),
				"height": $(".color-map").height()
			});
			$(".huebar").attr("height", $(".color-bar").height());

			var rgb = $(".form .rgb"),
			    hsb = $(".form .hsb"),
			    clr = $(".form .color"),
			    btns = $(".buttons"),
			    preview = $(".preview");

			if (rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none" && btns.css("display") == "none" && preview.css("display") == "none") {
				$(".color-map").css("right", "30px");
				$(".color-bar").css("right", "5px");

				$(".colormap").attr({
					"width": $(".color-map").width(),
					"height": $(".color-map").height()
				});
			}

			if (rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none") {
				$(".form").hide();
			} else {
				$(".form").show();
			}

			if (rgb.css("display") == "none" && hsb.css("display") == "none") {
				$(".buttons").css("height", "50px");
				$(".buttons button").css("width", "110px");
			} else {
				$(".buttons").css("height", "25px");
				$(".buttons button").css("width", "55px");
			}

			this.colorMap.repaint();
			this.colorBar.repaint();
		}
	}]);

	return ColorPicker;
}();

exports.default = ColorPicker;

},{"./ColorCanvas.es6":2,"./ColorSpace.es6":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

var ColorSpace = function () {
	function ColorSpace() {
		_classCallCheck(this, ColorSpace);
	}

	_createClass(ColorSpace, [{
		key: "getWebSafeColor",
		value: function getWebSafeColor(color) {
			var rMod = color.r % 51,
			    gMod = color.g % 51,
			    bMod = color.b % 51;

			if (rMod === 0 && gMod === 0 && bMod === 0) return color;

			var wsColor = {};

			wsColor.r = rMod <= 25 ? Math.floor(color.r / 51) * 51 : Math.ceil(color.r / 51) * 51;
			wsColor.g = gMod <= 25 ? Math.floor(color.g / 51) * 51 : Math.ceil(color.g / 51) * 51;
			wsColor.b = bMod <= 25 ? Math.floor(color.b / 51) * 51 : Math.ceil(color.b / 51) * 51;

			return wsColor;
		}
	}, {
		key: "rgb2hsv",
		value: function rgb2hsv() {
			var r = void 0,
			    g = void 0,
			    b = void 0,
			    h = void 0,
			    s = void 0,
			    v = void 0,
			    min = void 0,
			    delta = void 0;
			if (arguments.length === 1) {
				r = arguments[0].r;
				g = arguments[0].g;
				b = arguments[0].b;
			} else {
				r = arguments[0];
				g = arguments[1];
				b = arguments[2];
			}

			v = r > g ? Math.max(r, b) : Math.max(g, b);
			min = r > g ? Math.min(g, b) : Math.min(r, b);
			delta = v - min;

			s = v == 0.0 ? 0.0 : delta / v;

			if (s == 0.0) {
				h = 0.0;
			} else {
				if (r == v) {
					h = 60.0 * (g - b) / delta;
				} else if (g == v) {
					h = 120 + 60.0 * (b - r) / delta;
				} else {
					h = 240 + 60.0 * (r - g) / delta;
				}

				if (h < 0.0) {
					h += 360.0;
				}
				if (h > 360.0) {
					h -= 360.0;
				}
			}

			h = Math.round(h);
			s = Math.round(s * 255.0);
			v = Math.round(v);

			/* avoid the ambiguity of returning different values for the same color */
			if (h == 360) {
				h = 0;
			}

			return {
				h: h,
				s: s,
				v: v
			};
		}
	}, {
		key: "hsv2rgb",
		value: function hsv2rgb() {
			var hue = void 0,
			    saturation = void 0,
			    value = void 0;

			if (arguments.length === 1) {
				hue = arguments[0].h;
				saturation = arguments[0].s;
				value = arguments[0].v;
			} else {
				hue = arguments[0];
				saturation = arguments[1];
				value = arguments[2];
			}

			var h = void 0,
			    s = void 0,
			    v = void 0,
			    h_temp = void 0,
			    f = void 0,
			    p = void 0,
			    q = void 0,
			    t = void 0,
			    i = void 0;

			if (saturation === 0) {
				hue = value;
				saturation = value;
				value = value;
			} else {
				h = hue;
				s = saturation / 255.0;
				v = value / 255.0;

				h_temp = h == 360 ? 0 : h / 60;
				i = Math.floor(h_temp);
				f = h_temp - i;
				/*
    p = v * (1.0 - s);
    q = v * (1.0 - (s * f));
    t = v * (1.0 - (s * (1.0 - f)));
    */
				var vs = v * s;
				p = value - value * s;

				switch (i) {
					case 0:
						t = v - vs * (1 - f);
						hue = Math.round(value);
						saturation = Math.round(t * 255.0);
						value = Math.round(p);
						break;
					case 1:
						q = v - vs * f;
						hue = Math.round(q * 255.0);
						saturation = Math.round(value);
						value = Math.round(p);
						break;
					case 2:
						t = v - vs * (1 - f);
						hue = Math.round(p);
						saturation = Math.round(value);
						value = Math.round(t * 255.0);
						break;
					case 3:
						q = v - vs * f;
						hue = Math.round(p);
						saturation = Math.round(q * 255.0);
						value = Math.round(value);
						break;
					case 4:
						t = v - vs * (1 - f);
						hue = Math.round(t * 255.0);
						saturation = Math.round(p);
						value = Math.round(value);
						break;
					case 5:
						q = v - vs * f;
						hue = Math.round(value);
						saturation = Math.round(p);
						value = Math.round(q * 255.0);
						break;
				}
			}
			return {
				r: hue,
				g: saturation,
				b: value
			};
		}
	}, {
		key: "hex",
		value: function hex(c) {
			c = parseInt(c).toString(16);
			return c.length < 2 ? "0" + c : c;
		}
	}, {
		key: "RGB2HEX",
		value: function RGB2HEX(rgb) {
			return this.hex(rgb.r) + this.hex(rgb.g) + this.hex(rgb.b);
		}
	}, {
		key: "parseColor",
		value: function parseColor(colorText) {
			var sType = typeof colorText === "undefined" ? "undefined" : _typeof(colorText);
			if (sType == "string") {
				if (/^\#?[0-9A-F]{6}$/i.test(colorText)) {
					return {
						r: function () {
							return "0x" + colorText.substr(colorText.length == 6 ? 0 : 1, 2);
						}(),
						g: function () {
							return "0x" + colorText.substr(colorText.length == 6 ? 2 : 3, 2);
						}(),
						b: function () {
							return "0x" + colorText.substr(colorText.length == 6 ? 4 : 5, 2);
						}(),
						a: 255
					};
				}
			} else if (sType == "object") {
				if (colorText.hasOwnProperty("r") && colorText.hasOwnProperty("g") && colorText.hasOwnProperty("b")) {
					return colorText;
				}
			}
			return null;
		}
	}, {
		key: "rgb2ymck",
		value: function rgb2ymck(rgb) {
			var r = rgb.r / 255,
			    g = rgb.g / 255,
			    b = rgb.b / 255,
			    c = void 0,
			    m = void 0,
			    y = void 0,
			    k = void 0;

			k = Math.min(1 - r, 1 - g, 1 - b);
			if (1 - k === 0) {
				c = 0;
				m = 0;
				y = 0;
			} else {
				c = (1 - r - k) / (1 - k);
				m = (1 - g - k) / (1 - k);
				y = (1 - b - k) / (1 - k);
			}
			c = Math.round(c * 100);
			m = Math.round(m * 100);
			y = Math.round(y * 100);
			k = Math.round(k * 100);

			return {
				y: y,
				m: m,
				c: c,
				k: k
			};
		}
	}, {
		key: "ymck2rgb",
		value: function ymck2rgb(ymck) {
			var r = void 0,
			    g = void 0,
			    b = void 0,
			    c = ymck.c / 100,
			    m = ymck.m / 100,
			    y = ymck.y / 100,
			    k = ymck.k / 100;

			r = 1 - Math.min(1, c * (1 - k) + k);
			g = 1 - Math.min(1, m * (1 - k) + k);
			b = 1 - Math.min(1, y * (1 - k) + k);

			r = Math.round(r * 255);
			g = Math.round(g * 255);
			b = Math.round(b * 255);
			return {
				r: r,
				g: g,
				b: b
			};
		}
	}]);

	return ColorSpace;
}();

exports.default = ColorSpace;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

var aPMS = ["Black 0961 C", "Black C", "Blue 072 C", "Blue 0821 C", "Bright Green C", "Bright Orange C", "Bright Red C", "Dark Blue C", "Green 0921 C", "Green C", "Magenta 0521 C", "Medium Blue C", "Medium Purple C", "Medium Yellow C", "Neutral Black C", "Orange 021 C", "Pink C", "Process Blue C", "Purple C", "Red 032 C", "Red 0331 C", "Reflex Blue C", "Rhodamine Red C", "Rubine Red C", "Strong Red C", "Violet 0631 C", "Violet C", "Warm Red C", "Yellow 012 C", "Yellow 0131 C", "Yellow C", "100 C", "101 C", "102 C", "103 C", "104 C", "105 C", "106 C", "107 C", "108 C", "109 C", "110 C", "111 C", "112 C", "113 C", "114 C", "115 C", "116 C", "117 C", "118 C", "119 C", "120 C", "121 C", "122 C", "123 C", "124 C", "125 C", "126 C", "127 C", "128 C", "129 C", "130 C", "131 C", "132 C", "133 C", "134 C", "135 C", "136 C", "137 C", "138 C", "139 C", "140 C", "141 C", "142 C", "143 C", "144 C", "145 C", "146 C", "147 C", "148 C", "149 C", "150 C", "151 C", "152 C", "153 C", "154 C", "155 C", "156 C", "157 C", "158 C", "159 C", "160 C", "161 C", "162 C", "163 C", "164 C", "165 C", "166 C", "167 C", "168 C", "169 C", "170 C", "171 C", "172 C", "173 C", "174 C", "175 C", "176 C", "177 C", "178 C", "179 C", "180 C", "181 C", "182 C", "183 C", "184 C", "185 C", "186 C", "187 C", "188 C", "189 C", "190 C", "191 C", "192 C", "193 C", "194 C", "195 C", "196 C", "197 C", "198 C", "199 C", "200 C", "201 C", "202 C", "203 C", "204 C", "205 C", "206 C", "207 C", "208 C", "209 C", "210 C", "211 C", "212 C", "213 C", "214 C", "215 C", "216 C", "217 C", "218 C", "219 C", "220 C", "221 C", "222 C", "223 C", "224 C", "225 C", "226 C", "227 C", "228 C", "229 C", "230 C", "231 C", "232 C", "233 C", "234 C", "235 C", "236 C", "237 C", "238 C", "239 C", "240 C", "241 C", "242 C", "243 C", "244 C", "245 C", "246 C", "247 C", "248 C", "249 C", "250 C", "251 C", "252 C", "253 C", "254 C", "255 C", "256 C", "257 C", "258 C", "259 C", "260 C", "261 C", "262 C", "263 C", "264 C", "265 C", "266 C", "267 C", "268 C", "269 C", "270 C", "271 C", "272 C", "273 C", "274 C", "275 C", "276 C", "277 C", "278 C", "279 C", "280 C", "281 C", "282 C", "283 C", "284 C", "285 C", "286 C", "287 C", "288 C", "289 C", "290 C", "291 C", "292 C", "293 C", "294 C", "295 C", "296 C", "297 C", "298 C", "299 C", "300 C", "301 C", "302 C", "303 C", "304 C", "305 C", "306 C", "307 C", "308 C", "309 C", "310 C", "311 C", "312 C", "313 C", "314 C", "315 C", "316 C", "317 C", "318 C", "319 C", "320 C", "321 C", "322 C", "323 C", "324 C", "325 C", "326 C", "327 C", "328 C", "329 C", "330 C", "331 C", "332 C", "333 C", "334 C", "335 C", "336 C", "337 C", "338 C", "339 C", "340 C", "341 C", "342 C", "343 C", "344 C", "345 C", "346 C", "347 C", "348 C", "349 C", "350 C", "351 C", "352 C", "353 C", "354 C", "355 C", "356 C", "357 C", "358 C", "359 C", "360 C", "361 C", "362 C", "363 C", "364 C", "365 C", "366 C", "367 C", "368 C", "369 C", "370 C", "371 C", "372 C", "373 C", "374 C", "375 C", "376 C", "377 C", "378 C", "379 C", "380 C", "381 C", "382 C", "383 C", "384 C", "385 C", "386 C", "387 C", "388 C", "389 C", "390 C", "391 C", "392 C", "393 C", "394 C", "395 C", "396 C", "397 C", "398 C", "399 C", "400 C", "401 C", "402 C", "403 C", "404 C", "405 C", "406 C", "407 C", "408 C", "409 C", "410 C", "411 C", "412 C", "413 C", "414 C", "415 C", "416 C", "417 C", "418 C", "419 C", "420 C", "421 C", "422 C", "423 C", "424 C", "425 C", "426 C", "427 C", "428 C", "429 C", "430 C", "431 C", "432 C", "433 C", "434 C", "435 C", "436 C", "437 C", "438 C", "439 C", "440 C", "441 C", "442 C", "443 C", "444 C", "445 C", "446 C", "447 C", "448 C", "449 C", "450 C", "451 C", "452 C", "453 C", "454 C", "455 C", "456 C", "457 C", "458 C", "459 C", "460 C", "461 C", "462 C", "463 C", "464 C", "465 C", "466 C", "467 C", "468 C", "469 C", "470 C", "471 C", "472 C", "473 C", "474 C", "475 C", "476 C", "477 C", "478 C", "479 C", "480 C", "481 C", "482 C", "483 C", "484 C", "485 C", "486 C", "487 C", "488 C", "489 C", "490 C", "491 C", "492 C", "493 C", "494 C", "495 C", "496 C", "497 C", "498 C", "499 C", "500 C", "501 C", "502 C", "503 C", "504 C", "505 C", "506 C", "507 C", "508 C", "509 C", "510 C", "511 C", "512 C", "513 C", "514 C", "515 C", "516 C", "517 C", "518 C", "519 C", "520 C", "521 C", "522 C", "523 C", "524 C", "525 C", "526 C", "527 C", "528 C", "529 C", "530 C", "531 C", "532 C", "533 C", "534 C", "535 C", "536 C", "537 C", "538 C", "539 C", "540 C", "541 C", "542 C", "543 C", "544 C", "545 C", "546 C", "547 C", "548 C", "549 C", "550 C", "551 C", "552 C", "553 C", "554 C", "555 C", "556 C", "557 C", "558 C", "559 C", "560 C", "561 C", "562 C", "563 C", "564 C", "565 C", "566 C", "567 C", "568 C", "569 C", "570 C", "571 C", "572 C", "573 C", "574 C", "575 C", "576 C", "577 C", "578 C", "579 C", "580 C", "581 C", "582 C", "583 C", "584 C", "585 C", "586 C", "587 C", "600 C", "601 C", "602 C", "603 C", "604 C", "605 C", "606 C", "607 C", "608 C", "609 C", "610 C", "611 C", "612 C", "613 C", "614 C", "615 C", "616 C", "617 C", "618 C", "619 C", "620 C", "621 C", "622 C", "623 C", "624 C", "625 C", "626 C", "627 C", "628 C", "629 C", "630 C", "631 C", "632 C", "633 C", "634 C", "635 C", "636 C", "637 C", "638 C", "639 C", "640 C", "641 C", "642 C", "643 C", "644 C", "645 C", "646 C", "647 C", "648 C", "649 C", "650 C", "651 C", "652 C", "653 C", "654 C", "655 C", "656 C", "657 C", "658 C", "659 C", "660 C", "661 C", "662 C", "663 C", "664 C", "665 C", "666 C", "667 C", "668 C", "669 C", "670 C", "671 C", "672 C", "673 C", "674 C", "675 C", "676 C", "677 C", "678 C", "679 C", "680 C", "681 C", "682 C", "683 C", "684 C", "685 C", "686 C", "687 C", "688 C", "689 C", "690 C", "691 C", "692 C", "693 C", "694 C", "695 C", "696 C", "697 C", "698 C", "699 C", "700 C", "701 C", "702 C", "703 C", "704 C", "705 C", "706 C", "707 C", "708 C", "709 C", "710 C", "711 C", "712 C", "713 C", "714 C", "715 C", "716 C", "717 C", "718 C", "719 C", "720 C", "721 C", "722 C", "723 C", "724 C", "725 C", "726 C", "727 C", "728 C", "729 C", "730 C", "731 C", "732 C", "801 C", "802 C", "803 C", "804 C", "805 C", "806 C", "807 C", "871 C", "872 C", "873 C", "874 C", "875 C", "876 C", "877 C", "1205 C", "1215 C", "1225 C", "1235 C", "1245 C", "1255 C", "1265 C", "1345 C", "1355 C", "1365 C", "1375 C", "1385 C", "1395 C", "1405 C", "1485 C", "1495 C", "1505 C", "1525 C", "1535 C", "1545 C", "1555 C", "1565 C", "1575 C", "1585 C", "1595 C", "1605 C", "1615 C", "1625 C", "1635 C", "1645 C", "1655 C", "1665 C", "1675 C", "1685 C", "1765 C", "1767 C", "1775 C", "1777 C", "1785 C", "1787 C", "1788 C", "1795 C", "1797 C", "1805 C", "1807 C", "1815 C", "1817 C", "1895 C", "1905 C", "1915 C", "1925 C", "1935 C", "1945 C", "1955 C", "2001 C", "2002 C", "2003 C", "2004 C", "2005 C", "2006 C", "2007 C", "2008 C", "2009 C", "2010 C", "2011 C", "2012 C", "2013 C", "2014 C", "2015 C", "2016 C", "2017 C", "2018 C", "2019 C", "2020 C", "2021 C", "2022 C", "2023 C", "2024 C", "2025 C", "2026 C", "2027 C", "2028 C", "2029 C", "2030 C", "2031 C", "2032 C", "2033 C", "2034 C", "2035 C", "2036 C", "2037 C", "2038 C", "2039 C", "2040 C", "2041 C", "2042 C", "2043 C", "2044 C", "2045 C", "2046 C", "2047 C", "2048 C", "2049 C", "2050 C", "2051 C", "2052 C", "2053 C", "2054 C", "2055 C", "2056 C", "2057 C", "2058 C", "2059 C", "2060 C", "2061 C", "2062 C", "2063 C", "2064 C", "2065 C", "2066 C", "2067 C", "2068 C", "2069 C", "2070 C", "2071 C", "2072 C", "2073 C", "2074 C", "2075 C", "2076 C", "2077 C", "2078 C", "2079 C", "2080 C", "2081 C", "2082 C", "2083 C", "2084 C", "2085 C", "2086 C", "2087 C", "2088 C", "2089 C", "2090 C", "2091 C", "2092 C", "2093 C", "2094 C", "2095 C", "2096 C", "2097 C", "2098 C", "2099 C", "2100 C", "2101 C", "2102 C", "2103 C", "2104 C", "2105 C", "2106 C", "2107 C", "2108 C", "2109 C", "2110 C", "2111 C", "2112 C", "2113 C", "2114 C", "2115 C", "2116 C", "2117 C", "2118 C", "2119 C", "2120 C", "2121 C", "2122 C", "2123 C", "2124 C", "2125 C", "2126 C", "2127 C", "2128 C", "2129 C", "2130 C", "2131 C", "2132 C", "2133 C", "2134 C", "2135 C", "2136 C", "2137 C", "2138 C", "2139 C", "2140 C", "2141 C", "2142 C", "2143 C", "2144 C", "2145 C", "2146 C", "2147 C", "2148 C", "2149 C", "2150 C", "2151 C", "2152 C", "2153 C", "2154 C", "2155 C", "2156 C", "2157 C", "2158 C", "2159 C", "2160 C", "2161 C", "2162 C", "2163 C", "2164 C", "2165 C", "2166 C", "2167 C", "2168 C", "2169 C", "2170 C", "2171 C", "2172 C", "2173 C", "2174 C", "2175 C", "2176 C", "2177 C", "2178 C", "2179 C", "2180 C", "2181 C", "2182 C", "2183 C", "2184 C", "2185 C", "2186 C", "2187 C", "2188 C", "2189 C", "2190 C", "2191 C", "2192 C", "2193 C", "2194 C", "2195 C", "2196 C", "2197 C", "2198 C", "2199 C", "2200 C", "2201 C", "2202 C", "2203 C", "2204 C", "2205 C", "2206 C", "2207 C", "2208 C", "2209 C", "2210 C", "2211 C", "2212 C", "2213 C", "2214 C", "2215 C", "2216 C", "2217 C", "2218 C", "2219 C", "2220 C", "2221 C", "2222 C", "2223 C", "2224 C", "2225 C", "2226 C", "2227 C", "2228 C", "2229 C", "2230 C", "2231 C", "2232 C", "2233 C", "2234 C", "2235 C", "2236 C", "2237 C", "2238 C", "2239 C", "2240 C", "2241 C", "2242 C", "2243 C", "2244 C", "2245 C", "2246 C", "2247 C", "2248 C", "2249 C", "2250 C", "2251 C", "2252 C", "2253 C", "2254 C", "2255 C", "2256 C", "2257 C", "2258 C", "2259 C", "2260 C", "2261 C", "2262 C", "2263 C", "2264 C", "2265 C", "2266 C", "2267 C", "2268 C", "2269 C", "2270 C", "2271 C", "2272 C", "2273 C", "2274 C", "2275 C", "2276 C", "2277 C", "2278 C", "2279 C", "2280 C", "2281 C", "2282 C", "2283 C", "2284 C", "2285 C", "2286 C", "2287 C", "2288 C", "2289 C", "2290 C", "2291 C", "2292 C", "2293 C", "2294 C", "2295 C", "2296 C", "2297 C", "2298 C", "2299 C", "2300 C", "2301 C", "2302 C", "2303 C", "2304 C", "2305 C", "2306 C", "2307 C", "2308 C", "2309 C", "2310 C", "2311 C", "2312 C", "2313 C", "2314 C", "2315 C", "2316 C", "2317 C", "2318 C", "2319 C", "2320 C", "2321 C", "2322 C", "2323 C", "2324 C", "2325 C", "2326 C", "2327 C", "2328 C", "2329 C", "2330 C", "2331 C", "2332 C", "2333 C", "2334 C", "2335 C", "2336 C", "2337 C", "2338 C", "2339 C", "2340 C", "2341 C", "2342 C", "2343 C", "2344 C", "2345 C", "2346 C", "2347 C", "2348 C", "2349 C", "2350 C", "2351 C", "2352 C", "2353 C", "2354 C", "2355 C", "2356 C", "2357 C", "2358 C", "2359 C", "2360 C", "2361 C", "2362 C", "2363 C", "2364 C", "2365 C", "2366 C", "2367 C", "2368 C", "2369 C", "2370 C", "2371 C", "2372 C", "2373 C", "2374 C", "2375 C", "2376 C", "2377 C", "2378 C", "2379 C", "2380 C", "2381 C", "2382 C", "2383 C", "2384 C", "2385 C", "2386 C", "2387 C", "2388 C", "2389 C", "2390 C", "2391 C", "2392 C", "2393 C", "2394 C", "2395 C", "2396 C", "2397 C", "2398 C", "2399 C", "2400 C", "2401 C", "2402 C", "2403 C", "2404 C", "2405 C", "2406 C", "2407 C", "2408 C", "2409 C", "2410 C", "2411 C", "2412 C", "2413 C", "2414 C", "2415 C", "2416 C", "2417 C", "2418 C", "2419 C", "2420 C", "2421 C", "2422 C", "2423 C", "2424 C", "2425 C", "2426 C", "2427 C", "2562 C", "2563 C", "2567 C", "2572 C", "2573 C", "2577 C", "2582 C", "2583 C", "2587 C", "2592 C", "2593 C", "2597 C", "2602 C", "2603 C", "2607 C", "2612 C", "2613 C", "2617 C", "2622 C", "2623 C", "2627 C", "2635 C", "2645 C", "2655 C", "2665 C", "2685 C", "2695 C", "2705 C", "2706 C", "2707 C", "2708 C", "2715 C", "2716 C", "2717 C", "2718 C", "2725 C", "2726 C", "2727 C", "2728 C", "2735 C", "2736 C", "2738 C", "2745 C", "2746 C", "2747 C", "2748 C", "2755 C", "2756 C", "2757 C", "2758 C", "2765 C", "2766 C", "2767 C", "2768 C", "2905 C", "2915 C", "2925 C", "2935 C", "2945 C", "2955 C", "2965 C", "2975 C", "2985 C", "2995 C", "3005 C", "3015 C", "3025 C", "3035 C", "3105 C", "3115 C", "3125 C", "3135 C", "3145 C", "3155 C", "3165 C", "3242 C", "3245 C", "3248 C", "3252 C", "3255 C", "3258 C", "3262 C", "3265 C", "3268 C", "3272 C", "3275 C", "3278 C", "3282 C", "3285 C", "3288 C", "3292 C", "3295 C", "3298 C", "3302 C", "3305 C", "3308 C", "3375 C", "3385 C", "3395 C", "3405 C", "3415 C", "3425 C", "3435 C", "3935 C", "3945 C", "3955 C", "3965 C", "3975 C", "3985 C", "3995 C", "4485 C", "4495 C", "4505 C", "4515 C", "4525 C", "4535 C", "4545 C", "4625 C", "4635 C", "4645 C", "4655 C", "4665 C", "4675 C", "4685 C", "4695 C", "4705 C", "4715 C", "4725 C", "4735 C", "4745 C", "4755 C", "4975 C", "4985 C", "4995 C", "5005 C", "5015 C", "5025 C", "5035 C", "5115 C", "5125 C", "5135 C", "5145 C", "5155 C", "5165 C", "5175 C", "5185 C", "5195 C", "5205 C", "5215 C", "5225 C", "5235 C", "5245 C", "5255 C", "5265 C", "5275 C", "5285 C", "5295 C", "5305 C", "5315 C", "5395 C", "5405 C", "5415 C", "5425 C", "5435 C", "5445 C", "5455 C", "5463 C", "5467 C", "5473 C", "5477 C", "5483 C", "5487 C", "5493 C", "5497 C", "5503 C", "5507 C", "5513 C", "5517 C", "5523 C", "5527 C", "5535 C", "5545 C", "5555 C", "5565 C", "5575 C", "5585 C", "5595 C", "5605 C", "5615 C", "5625 C", "5635 C", "5645 C", "5655 C", "5665 C", "5743 C", "5747 C", "5753 C", "5757 C", "5763 C", "5767 C", "5773 C", "5777 C", "5783 C", "5787 C", "5793 C", "5797 C", "5803 C", "5807 C", "5815 C", "5825 C", "5835 C", "5845 C", "5855 C", "5865 C", "5875 C", "7401 C", "7402 C", "7403 C", "7404 C", "7405 C", "7406 C", "7407 C", "7408 C", "7409 C", "7410 C", "7411 C", "7412 C", "7413 C", "7414 C", "7415 C", "7416 C", "7417 C", "7418 C", "7419 C", "7420 C", "7421 C", "7422 C", "7423 C", "7424 C", "7425 C", "7426 C", "7427 C", "7428 C", "7429 C", "7430 C", "7431 C", "7432 C", "7433 C", "7434 C", "7435 C", "7436 C", "7437 C", "7438 C", "7439 C", "7440 C", "7441 C", "7442 C", "7443 C", "7444 C", "7445 C", "7446 C", "7447 C", "7448 C", "7449 C", "7450 C", "7451 C", "7452 C", "7453 C", "7454 C", "7455 C", "7456 C", "7457 C", "7458 C", "7459 C", "7460 C", "7461 C", "7462 C", "7463 C", "7464 C", "7465 C", "7466 C", "7467 C", "7468 C", "7469 C", "7470 C", "7471 C", "7472 C", "7473 C", "7474 C", "7475 C", "7476 C", "7477 C", "7478 C", "7479 C", "7480 C", "7481 C", "7482 C", "7483 C", "7484 C", "7485 C", "7486 C", "7487 C", "7488 C", "7489 C", "7490 C", "7491 C", "7492 C", "7493 C", "7494 C", "7495 C", "7496 C", "7497 C", "7498 C", "7499 C", "7500 C", "7501 C", "7502 C", "7503 C", "7504 C", "7505 C", "7506 C", "7507 C", "7508 C", "7509 C", "7510 C", "7511 C", "7512 C", "7513 C", "7514 C", "7515 C", "7516 C", "7517 C", "7518 C", "7519 C", "7520 C", "7521 C", "7522 C", "7523 C", "7524 C", "7525 C", "7526 C", "7527 C", "7528 C", "7529 C", "7530 C", "7531 C", "7532 C", "7533 C", "7534 C", "7535 C", "7536 C", "7537 C", "7538 C", "7539 C", "7540 C", "7541 C", "7542 C", "7543 C", "7544 C", "7545 C", "7546 C", "7547 C", "7548 C", "7549 C", "7550 C", "7551 C", "7552 C", "7553 C", "7554 C", "7555 C", "7556 C", "7557 C", "7558 C", "7559 C", "7560 C", "7561 C", "7562 C", "7563 C", "7564 C", "7565 C", "7566 C", "7567 C", "7568 C", "7569 C", "7570 C", "7571 C", "7572 C", "7573 C", "7574 C", "7575 C", "7576 C", "7577 C", "7578 C", "7579 C", "7580 C", "7581 C", "7582 C", "7583 C", "7584 C", "7585 C", "7586 C", "7587 C", "7588 C", "7589 C", "7590 C", "7591 C", "7592 C", "7593 C", "7594 C", "7595 C", "7596 C", "7597 C", "7598 C", "7599 C", "7600 C", "7601 C", "7602 C", "7603 C", "7604 C", "7605 C", "7606 C", "7607 C", "7608 C", "7609 C", "7610 C", "7611 C", "7612 C", "7613 C", "7614 C", "7615 C", "7616 C", "7617 C", "7618 C", "7619 C", "7620 C", "7621 C", "7622 C", "7623 C", "7624 C", "7625 C", "7626 C", "7627 C", "7628 C", "7629 C", "7630 C", "7631 C", "7632 C", "7633 C", "7634 C", "7635 C", "7636 C", "7637 C", "7638 C", "7639 C", "7640 C", "7641 C", "7642 C", "7643 C", "7644 C", "7645 C", "7646 C", "7647 C", "7648 C", "7649 C", "7650 C", "7651 C", "7652 C", "7653 C", "7654 C", "7655 C", "7656 C", "7657 C", "7658 C", "7659 C", "7660 C", "7661 C", "7662 C", "7663 C", "7664 C", "7665 C", "7666 C", "7667 C", "7668 C", "7669 C", "7670 C", "7671 C", "7672 C", "7673 C", "7674 C", "7675 C", "7676 C", "7677 C", "7678 C", "7679 C", "7680 C", "7681 C", "7682 C", "7683 C", "7684 C", "7685 C", "7686 C", "7687 C", "7688 C", "7689 C", "7690 C", "7691 C", "7692 C", "7693 C", "7694 C", "7695 C", "7696 C", "7697 C", "7698 C", "7699 C", "7700 C", "7701 C", "7702 C", "7703 C", "7704 C", "7705 C", "7706 C", "7707 C", "7708 C", "7709 C", "7710 C", "7711 C", "7712 C", "7713 C", "7714 C", "7715 C", "7716 C", "7717 C", "7718 C", "7719 C", "7720 C", "7721 C", "7722 C", "7723 C", "7724 C", "7725 C", "7726 C", "7727 C", "7728 C", "7729 C", "7730 C", "7731 C", "7732 C", "7733 C", "7734 C", "7735 C", "7736 C", "7737 C", "7738 C", "7739 C", "7740 C", "7741 C", "7742 C", "7743 C", "7744 C", "7745 C", "7746 C", "7747 C", "7748 C", "7749 C", "7750 C", "7751 C", "7752 C", "7753 C", "7754 C", "7755 C", "7756 C", "7757 C", "7758 C", "7759 C", "7760 C", "7761 C", "7762 C", "7763 C", "7764 C", "7765 C", "7766 C", "7767 C", "7768 C", "7769 C", "7770 C", "7771 C", "Black 2 C", "Black 3 C", "Black 4 C", "Black 5 C", "Black 6 C", "Black 7 C", "Cool Gray 1 C", "Cool Gray 2 C", "Cool Gray 3 C", "Cool Gray 4 C", "Cool Gray 5 C", "Cool Gray 6 C", "Cool Gray 7 C", "Cool Gray 8 C", "Cool Gray 9 C", "Warm Gray 1 C", "Warm Gray 2 C", "Warm Gray 3 C", "Warm Gray 4 C", "Warm Gray 5 C", "Warm Gray 6 C", "Warm Gray 7 C", "Warm Gray 8 C", "Warm Gray 9 C", "Cool Gray 10 C", "Cool Gray 11 C", "Warm Gray 10 C", "Warm Gray 11 C"],
    aRGB = ["9E978E", "2D2926", "10069F", "74D1EA", "00B08B", "FF5E00", "F93822", "00239C", "9DE7D7", "00AB84", "F1B2DC", "0084CA", "4E008E", "FFD900", "222223", "FE5000", "D62598", "0085CA", "BB29BB", "EF3340", "FCAEBB", "001489", "E10098", "CE0058", "CE0056", "BF9BDE", "440099", "F9423A", "FFD700", "F2F0A1", "FEDD00", "F6EB61", "F7EA48", "FCE300", "C5A900", "AF9800", "897A27", "F9E547", "FBE122", "FEDB00", "FFD100", "DAAA00", "AA8A00", "9C8412", "FAE053", "FBDD40", "FDDA24", "FFCD00", "C99700", "AC8400", "897322", "FBDB65", "FDD757", "FED141", "FFC72C", "EAAA00", "B58500", "9A7611", "F3DD6D", "F3D54E", "F3D03E", "F2A900", "CC8A00", "A07400", "6C571B", "FDD26E", "FFC658", "FFBF3F", "FFA300", "DE7C00", "AF6D04", "74531C", "F2C75C", "F1BE48", "F1B434", "ED8B00", "CF7F00", "A76D11", "715C2A", "FECB8B", "FFC27B", "FFB25B", "FF8200", "E57200", "BE6A14", "9B5A1A", "EFD19F", "EFBE7D", "ECA154", "E87722", "CB6015", "A1561C", "603D20", "FFBE9F", "FF9D6E", "FF7F41", "FF671F", "E35205", "BE531C", "73381D", "FFB3AB", "FF8674", "FF5C39", "FA4616", "CF4520", "963821", "6B3529", "FFB1BB", "FF808B", "FF585D", "E03C31", "BE3A34", "81312F", "FABBCB", "FC9BB3", "F65275", "E4002B", "C8102E", "A6192E", "76232F", "F8A3BC", "F67599", "EF426F", "E40046", "BF0D3E", "9B2743", "782F40", "ECC7CD", "E89CAE", "DF4661", "D50032", "BA0C2F", "9D2235", "862633", "ECB3CB", "E782A9", "E0457B", "CE0037", "A50034", "861F41", "6F263D", "F99FC9", "F57EB6", "F04E98", "E31C79", "CE0F69", "AC145A", "7D2248", "EABEDB", "E56DB1", "DA1884", "A50050", "910048", "6C1D45", "EF95CF", "EB6FBD", "DF1995", "D0006F", "AA0061", "890C58", "672146", "F4A6D7", "F277C6", "E93CAC", "C6007E", "A20067", "840B55", "F1A7DC", "EC86D0", "E45DBF", "DB3EB1", "C5299B", "AF1685", "80225F", "EAB8E4", "E59BDC", "DD7FD3", "C724B1", "BB16A3", "A51890", "80276C", "E7BAE4", "DD9CDF", "C964CF", "AD1AAC", "981D97", "72246C", "D6BFDD", "C6A1CF", "8C4799", "6D2077", "642667", "5D285F", "51284F", "D7C6E6", "C1A7E2", "9063CD", "753BBD", "5F259F", "582C83", "512D6D", "B4B5DF", "9595D2", "7474C1", "24135F", "211551", "201747", "221C35", "ABCAE9", "8BB8E8", "418FDE", "012169", "00205B", "041E42", "92C1E9", "6CACE4", "0072CE", "0033A0", "003087", "002D72", "0C2340", "B9D9EB", "9BCBEB", "69B3E7", "003DA5", "002F6C", "002855", "041C2C", "71C5E8", "41B6E6", "00A3E0", "005EB8", "004B87", "003B5C", "002A3A", "9ADBE8", "59CBE8", "00B5E2", "006BA6", "00587C", "003B49", "6AD1E3", "05C3DE", "00A9CE", "0092BC", "007FA3", "00677F", "004851", "B1E4E3", "88DBDF", "2DCCD3", "009CA6", "008C95", "007377", "005F61", "9CDBD9", "64CCC9", "00B2A9", "008675", "007367", "00685E", "00534C", "A7E6D7", "8CE2D0", "3CDBC0", "009775", "007B5F", "00664F", "8FD6BD", "6ECEB2", "00B388", "00965E", "007A53", "006747", "115740", "A0DAB3", "91D6AC", "71CC98", "009A44", "00843D", "046A38", "2C5234", "A2E4B8", "8FE2B0", "80E0A7", "00B140", "009639", "007A33", "215732", "ADDC91", "A1D884", "6CC24A", "43B02A", "509E2F", "4C8C2B", "4A7729", "C2E189", "B7DD79", "A4D65E", "78BE20", "64A70B", "658D1B", "546223", "D4EB8E", "CDEA80", "C5E86C", "97D700", "84BD00", "7A9A01", "59621D", "E2E868", "DBE442", "CEDC00", "C4D600", "A8AD00", "949300", "787121", "E9EC6B", "E3E935", "E0E721", "D0DF00", "B5BD00", "9A9500", "827A04", "F0EC74", "EDE939", "ECE81A", "E1E000", "BFB800", "ADA400", "A09200", "C4BFB6", "AFA9A0", "9D968D", "8C857B", "776E64", "696158", "C4BCB7", "B2A8A2", "978C87", "857874", "746661", "5E514D", "382F2D", "BABBB1", "A8A99E", "919388", "7E7F74", "65665C", "51534A", "212322", "C7C9C7", "B2B4B2", "9EA2A2", "898D8D", "707372", "54585A", "25282A", "D0D3D4", "C1C6C8", "A2AAAD", "7C878E", "5B6770", "333F48", "1D252D", "D0C4C5", "C1B2B6", "AB989D", "7B6469", "584446", "453536", "382E2C", "BEC6C4", "A2ACAB", "919D9D", "717C7D", "505759", "3F4444", "373A36", "4A412A", "524727", "594A25", "9B945F", "B0AA7E", "BFBB98", "CAC7A7", "695B24", "A28E2A", "B89D18", "D9C756", "DECD63", "E4D77E", "E9DF97", "5C462B", "744F28", "8B5B29", "B9975B", "C6AA76", "D3BC8D", "DDCBA4", "693F23", "A45A2A", "B86125", "E59E6D", "F0BF9B", "F1C6A7", "F3CFB3", "4E3629", "623B2A", "703F2A", "AA8066", "C6A992", "D3BBA8", "DBC8B6", "653024", "9A3324", "DA291C", "E8927C", "EAA794", "ECBAA8", "ECC3B2", "5D2A2C", "7F3035", "8F3237", "DC8699", "E9A2B2", "F1BDC8", "F2C6CF", "512F2E", "6A3735", "7A3E3A", "C6858F", "DAA5AD", "E5BAC1", "E9C4C7", "572932", "6F2C3F", "84344E", "D592AA", "E4A9BB", "E8B3C3", "EBBECB", "612C51", "833177", "93328E", "D48BC8", "E2ACD7", "E6BEDD", "EBC6DF", "4B3048", "59315F", "642F6C", "A57FB2", "BA9CC5", "C9B1D0", "D5C2D8", "572C5F", "702F8A", "8031A7", "B580D1", "CAA2DD", "D7B9E4", "DFC8E7", "1C1F2A", "1F2A44", "1B365D", "8E9FBC", "A2B2C8", "BBC7D6", "C5CFDA", "00263A", "003057", "003C71", "7BAFD4", "A4C8E1", "BDD6E6", "C6DAE7", "072B31", "00313C", "003D4C", "6BA4B8", "8DB9CA", "A3C7D2", "B9D3DC", "284734", "205C40", "28724F", "6FA287", "85B09A", "9ABEAA", "ADCAB8", "1D3C34", "00594C", "006F62", "6BBBAE", "86C8BC", "A1D6CA", "B9DCD2", "173F35", "006C5B", "00816D", "6BCABA", "98DBCE", "A5DFD3", "B5E3D8", "4E5B31", "67823A", "789D4A", "A9C47F", "B7CE95", "BCD19B", "C4D6A4", "625D20", "8E8C13", "B7BF10", "D2D755", "DBDE70", "E0E27C", "E3E48D", "F1EB9C", "F0E991", "F0E87B", "EDE04B", "EADA24", "E1CD00", "CFB500", "EBE49A", "E9E186", "E6DE77", "E1D555", "D7C826", "C4B000", "B39B00", "DCD59A", "D6CF8D", "D0C883", "C0B561", "AC9F3C", "9F912A", "8A7B19", "D1E0D7", "B7CDC2", "9AB9AD", "789F90", "507F70", "285C4D", "13322B", "B8DDE1", "9BD3DD", "77C5D5", "3EB1C8", "0093B2", "007396", "005F83", "A4DBE8", "8BD3E6", "4EC3E0", "00AFD7", "0095C8", "0082BA", "0067A0", "D1DDE6", "C6D6E3", "9BB8D3", "7DA1C4", "5E8AB4", "236192", "002E5D", "DBE2E9", "CED9E5", "A7BCD6", "7D9BC1", "326295", "003A70", "002554", "DDE5ED", "C8D8EB", "B1C9E8", "7BA4DB", "407EC9", "003594", "001A70", "E5E1E6", "E0DBE3", "C6BCD0", "A192B2", "7C6992", "614B79", "3F2A56", "EAD3E2", "E6BCD8", "DFA0C9", "D986BA", "C6579A", "AE2573", "960051", "E5CEDB", "E3C8D8", "DEBED2", "C996B6", "B06C96", "994878", "7C2855", "E4C6D4", "DCB6C9", "D0A1BA", "BE84A3", "A76389", "893B67", "612141", "E9CDD0", "E4BEC3", "D7A3AB", "C48490", "B46B7A", "984856", "893C47", "F2D4D7", "F4C3CC", "F2ACB9", "E68699", "D25B73", "B83A4B", "9E2A2F", "F5DADF", "F7CED7", "F9B5C4", "F890A5", "EF6079", "E03E52", "CB2C30", "FCC89B", "FDBE87", "FDAA63", "F68D2E", "EA7600", "D45D00", "BE4D00", "EDC8A3", "E7B78A", "DDA46F", "C88242", "B36924", "934D11", "7D3F16", "E0C09F", "D9B48F", "CDA077", "B58150", "9E652E", "774212", "623412", "009ACE", "44D62C", "FFE900", "FFAA4D", "FF7276", "FF3EB5", "EA27C2", "84754E", "85714D", "866D4B", "8B6F4E", "87674F", "8B634B", "8A8D8F", "F8E08E", "FBD872", "FFC845", "FFB81C", "C69214", "AD841F", "886B25", "FDD086", "FFC56E", "FFB549", "FF9E1B", "D57800", "996017", "6E4C1E", "FFAE62", "FF8F1C", "FF6900", "B94700", "94450B", "653819", "FFB990", "FFA06A", "FF7F32", "FF6A13", "D86018", "A65523", "8B4720", "FFA38B", "FF8D6D", "FF6A39", "FC4C02", "DC4405", "A9431E", "833921", "FFA3B5", "FCAFC0", "FF8DA1", "FB637E", "F8485E", "F4364C", "EE2737", "D22630", "CB333B", "AF272F", "A4343A", "7C2529", "643335", "F5B6CD", "F59BBB", "EF4A81", "E0004D", "C5003E", "A6093D", "8A1538", "F8E59A", "F9E17D", "F9E267", "FBDD7A", "FED880", "EBBC4E", "E0A526", "EFC06E", "EFB661", "FFAD00", "ED9B33", "EF9600", "FF9800", "B97000", "F8CFA9", "FFB673", "F8AD6D", "FF7500", "D76B00", "BE5400", "9D4815", "FAAA8D", "FA9370", "F87C56", "FF8A3D", "F4633A", "EE5340", "EB3300", "F2827F", "DD7975", "D66965", "D05A57", "C54644", "E73C3E", "D6001C", "F8BED6", "F395C7", "EF60A3", "E63888", "DB0A5B", "A1224E", "70273D", "EAC4D2", "E793B7", "DD74A1", "CF578A", "A54570", "973961", "852C4D", "EFD7E5", "DDC2CF", "C89FB6", "B3809D", "9E708B", "905F7B", "7E4966", "CF92B7", "BB85AB", "B87BA1", "C86BA8", "AD5389", "B4458D", "A5307C", "E0A2D4", "DEA8DD", "D28DD3", "C069C2", "B14EB5", "A438A8", "8F1A95", "C7B2DE", "B896D4", "AF95D3", "9569BE", "8866BC", "8659B5", "6E3FA3", "B59DBB", "9B7EA4", "9873AC", "865E9C", "784E90", "965EC8", "7F35B2", "DECDE7", "A08BCB", "9B7DD4", "825DC7", "7248BD", "6638B6", "4C12A1", "B8ACD6", "A699C1", "8E7FAE", "7965B2", "654EA3", "6244BB", "4A25AA", "B1A2CA", "9F8FCA", "8A75D1", "6558B1", "5949A7", "483698", "39207C", "B1B5CE", "9099BA", "777FA8", "676D99", "5B618F", "464E7E", "351F65", "A5B0E3", "838DC8", "6F79BD", "6068B2", "44499C", "343579", "2C2D65", "BECAEA", "8FACD9", "9BAEE4", "7A93DC", "6F7BD4", "5461C8", "303AB2", "B8C9E1", "98B6E4", "5F8DDA", "5576D1", "365ABD", "0957C3", "1C57A5", "93A5CF", "758CC0", "8394B8", "6E80A9", "647692", "4D6995", "3A5382", "8BBEE8", "7FADE3", "3E87CB", "0067B9", "004EA8", "00358E", "002677", "6191B4", "4B82A8", "36749D", "256BA2", "1A658F", "00567E", "004680", "9EB5CB", "8BA6C1", "7594B3", "5C82A5", "4E769C", "3E6991", "285780", "9EA6B4", "869CAE", "7E93A7", "688197", "57728B", "506D85", "254A5D", "81B0D2", "5F9BC6", "489FDF", "147BD1", "0084D5", "0076CE", "006AC6", "A6B8C1", "7FA0AC", "6B8F9C", "527A8A", "3F6C7D", "2A5B6C", "174A5B", "0092BD", "0084D4", "0076A5", "004986", "004677", "00426A", "003349", "56B7E6", "00A3E1", "0091DA", "0090DA", "0086D6", "0076CF", "0069B1", "74D2E7", "4AC9E3", "00BBDC", "04A9C7", "00AED6", "00A5DF", "0087AE", "AFCDD7", "89B2C4", "779FB5", "659AB1", "5489A3", "4986A0", "074F71", "6F9BA4", "508590", "337079", "2F6F7A", "2E5665", "2E4D58", "003A40", "72B0BD", "5CA3B3", "4797A8", "2D8C9E", "1D8296", "00788D", "006980", "78D5E1", "3CCBDA", "59BEC9", "00A5BD", "009CB6", "008CA0", "007C91", "71B0B4", "58A7AF", "4F9FA6", "28939D", "2C9199", "05868E", "006975", "00CFB4", "00C19F", "58A291", "00A376", "00957A", "1B806D", "008655", "A8D5BA", "77C19A", "71B790", "5CAA7F", "00B373", "00AD6F", "00A74A", "BDE9C9", "ADDFB3", "86D295", "56C271", "00AD50", "008522", "027223", "B6CFAE", "9ABB91", "8CAC89", "74956C", "6B9560", "5C7E51", "335525", "9BE198", "79D97C", "7CCC6C", "2DC84D", "00BB31", "009A17", "257226", "CFDCB1", "C3DC93", "89A84F", "55951B", "4E801F", "5E7E29", "4A6A1D", "D9EA9A", "C7E995", "A7E163", "B3D57D", "93DA49", "7ACC00", "5BC500", "C8E379", "C5D97A", "AADB1E", "A7D500", "93C90E", "8BC400", "78AA00", "E0EC89", "D6E865", "C0DF16", "B7DB57", "A4D233", "A9C23F", "8FAD15", "AEB862", "9EB356", "A0AB4D", "9EA700", "808C24", "686F12", "5D551D", "E7CEB5", "D9C0A9", "CDA786", "B79A81", "C39367", "AC7644", "914910", "BD9A7A", "B4875E", "A47449", "8C5C30", "714623", "6F5137", "4E3524", "B8B298", "B2A384", "A09074", "8B7C5E", "837958", "786748", "68593C", "CFCDC9", "AEA8A5", "8C8985", "716E6A", "6C6463", "5E4F47", "4E4B48", "F8C1B8", "DEA39C", "F09491", "CF6F77", "B66C6D", "B65A65", "A85566", "F18070", "FF6D6A", "FF5869", "E10600", "E5554F", "CA3604", "AF231C", "BD7AB3", "B565A7", "BF4DA5", "924E8C", "87027B", "720062", "621244", "ADA4AE", "7F7384", "7B798E", "70708D", "6C6A81", "605D75", "66596C", "EFBAE1", "6A6DCD", "4F4CB1", "4D49BE", "3B3FB6", "2F2A95", "33058D", "281E78", "72829F", "4D5F80", "E277CD", "4E5B73", "315470", "384967", "3B4559", "28334A", "5E93DB", "008AD8", "2774AE", "0061A0", "D539B5", "2D68C4", "0762C8", "0050B5", "4C9FC8", "077CAB", "0081A6", "166886", "0092CB", "008BCE", "C800A1", "0099B2", "00B7BD", "00BAB3", "00ACA0", "00B097", "34A798", "009D85", "00897B", "A5B99C", "B0008E", "819E87", "6B8D73", "497B55", "4E6548", "445A3E", "1C4220", "48D597", "34B78F", "00BB7E", "9E007E", "00B176", "249E6B", "00873E", "007C58", "00C65E", "31B700", "00A82D", "00AA13", "279F00", "830065", "008C15", "035F1D", "D7A9E3", "CBA3D8", "C1A0DA", "C98BDB", "B884CB", "A77BCA", "AC4FC6", "A05EB5", "8246AF", "9B26B6", "84329B", "5C068C", "87189D", "702082", "500778", "772583", "671E75", "470A68", "653165", "5F2167", "3C1053", "C5B4E3", "AD96DC", "9678D3", "7D55C7", "330072", "2E1A47", "A7A4E0", "CBD3EB", "C3D7EE", "B8CCEA", "8B84D7", "9FAEE5", "A7C6ED", "5C88DA", "685BC7", "485CC7", "307FE2", "0047BB", "2E008B", "1E22AA", "06038D", "280071", "171C8F", "001A72", "001871", "250E62", "151F6D", "001E60", "001E62", "201547", "141B4D", "13294B", "071D49", "8DC8E8", "62B5E5", "009CDE", "0057B8", "004C97", "003865", "00263E", "99D6EA", "5BC2E7", "00A9E0", "0077C8", "00629B", "004F71", "003E51", "68D2DF", "00C1D5", "00AEC7", "008EAA", "00778B", "006272", "004F59", "71DBD4", "7CE0D3", "6DCDB8", "2AD2C9", "2CD5C4", "49C5B1", "00BFB3", "00C7B1", "00AB8E", "00A499", "00B398", "009B77", "008578", "009681", "008264", "00594F", "007864", "006A52", "004C45", "004E42", "034638", "7AE1BF", "47D7AC", "00C389", "00AF66", "007749", "006341", "154734", "F3EA5D", "F3E500", "EFDF00", "EEDC00", "BBA600", "9A8700", "685C20", "614F25", "8C7732", "998542", "B3A369", "C5B783", "CFC493", "D5CB9F", "4F2C1D", "946037", "AD7C59", "BF9474", "CDA788", "DCBFA6", "E0C6AD", "5B3427", "7C4D3A", "956C58", "AE8A79", "C0A392", "CDB5A7", "D7C4B7", "3F2021", "874B52", "9C6169", "B07C83", "CCA1A6", "DBB7BB", "DFC2C3", "512A44", "693C5E", "7E5475", "9B7793", "BFA5B8", "D3C0CD", "D8C8D1", "4A3041", "66435A", "86647A", "AF95A6", "C6B0BC", "D0BEC7", "DBCDD3", "1E1A34", "403A60", "595478", "8D89A5", "B3B0C4", "C6C4D2", "D8D7DF", "081F2C", "4F758B", "5B7F95", "7A99AC", "A6BBC8", "B7C9D3", "BFCED6", "07272D", "18332F", "115E67", "3E5D58", "4F868E", "5D7975", "7FA9AE", "829995", "94B7BB", "9DB0AC", "ABC7CA", "B1C0BC", "B6CFD0", "BCC9C5", "183028", "43695B", "5C7F71", "7F9C90", "92ACA0", "A7BDB1", "BFCEC2", "22372B", "5E7461", "708573", "94A596", "A3B2A4", "B0BDB0", "BAC5B9", "3E4827", "3D441E", "5E6738", "6D712E", "737B4C", "8A8D4A", "899064", "A2A569", "A3AA83", "BABD8B", "B3B995", "C6C89B", "C3C6A8", "D0D1AB", "555025", "89813D", "A09958", "AFA96E", "C0BB87", "CBC793", "D2CE9E", "F5E1A4", "ECD898", "EED484", "F4DA40", "F2CD00", "F1C400", "CBA052", "F6BE00", "F0B323", "FEAD77", "E6A65D", "D38235", "DC8633", "C16C18", "E6BAA8", "E56A54", "E04E39", "CD545B", "B04A5A", "9B2242", "651D32", "F4CDD4", "E06287", "E24585", "B52555", "A4123F", "971B2F", "6A2C3E", "E2BCCB", "DCA9BF", "C9809E", "B55C80", "A73A64", "9B3259", "872651", "EEDAEA", "CCAED0", "D59ED7", "B288B9", "A277A6", "9F5CC0", "963CBD", "DDDAE8", "B6B8DC", "A7A2C3", "8986CA", "5D4777", "4B384C", "41273B", "BDC5DB", "89ABE3", "8094DD", "7BA6DE", "5F8FB4", "3A5DAE", "606EB2", "BBDDE6", "71B2C9", "4298B5", "0086BF", "007DBA", "00558C", "002B49", "A0D1CA", "40C1AC", "00B0B9", "00A3AD", "007398", "005F86", "005A70", "7EDDD3", "5CB8B2", "279989", "007681", "487A7B", "0D5257", "244C5A", "9BE3BF", "26D07C", "00BF6F", "00B74F", "009F4D", "275D38", "00573F", "D0DEBB", "BCE194", "8EDD65", "78D64B", "74AA50", "719949", "79863C", "BFCC80", "BBC592", "9CAF88", "8F993E", "76881D", "7A7256", "5B6236", "F1E6B2", "DFD1A7", "D9C89E", "CEB888", "A89968", "94795D", "816040", "EFDBB2", "FCD299", "E1B87F", "D6A461", "C6893F", "B77729", "A6631B", "E1B7A7", "D5A286", "C58B68", "99552B", "85431E", "6D4F47", "5E4B3C", "EABEB0", "C09C83", "B46A55", "AB5C57", "A45248", "9A6A4F", "8A391B", "D6D2C4", "C5B9AC", "B7A99A", "A39382", "7A6855", "63513D", "473729", "D1CCBD", "B7B09C", "A69F88", "A7ACA2", "949A90", "8E9089", "4B4F54", "D9E1E2", "A4BCC2", "98A4AE", "768692", "425563", "253746", "131E29", "FFC600", "FFB500", "D19000", "B47E00", "73531D", "5A4522", "4B3D2A", "D29F13", "B78B20", "9F7D23", "967126", "8F6A2A", "7D622E", "6C5D34", "BD9B60", "D69A2D", "DB8A06", "CD7925", "AD6433", "89532F", "775135", "D78825", "D3832B", "C67D30", "B67233", "A7662B", "9E6A38", "835D32", "DB864E", "E07E3C", "DC6B2F", "DC582A", "C05131", "864A33", "674736", "C4622D", "BA5826", "AF5C37", "9E5330", "924C2E", "7B4D35", "5C4738", "D4B59E", "C07D59", "B15533", "9D432C", "7C3A2D", "6B3D2E", "5C3D31", "D14124", "BD472A", "B33D26", "8D3F2B", "83412C", "7B4931", "674230", "E4D5D3", "E1BBB4", "D6938A", "C26E60", "A4493D", "823B34", "683431", "DDBCB0", "CA9A8E", "BC8A7E", "A37F74", "866761", "6B4C4C", "583D3E", "C66E4E", "C04C36", "B7312C", "AB2328", "93272C", "8A2A2B", "802F2D", "E1523D", "C63527", "A72B2A", "9E2A2B", "6D3332", "633231", "572D2D", "D6C9CA", "C4A4A7", "C16784", "C63663", "BC204B", "912F46", "7E2D40", "936D73", "934054", "8E2C48", "732E4A", "672E45", "582D40", "502B3A", "A56E87", "A83D72", "991E66", "8A1B61", "722257", "6A2A5B", "5E2751", "948794", "A2789C", "A15A95", "8E3A80", "6E2B62", "6A3460", "5D3754", "9991A4", "8D6E97", "7A4183", "6B3077", "653279", "5E366E", "5C4E63", "6E7CA0", "686E9F", "615E9B", "565294", "514689", "4C4184", "535486", "878CB4", "7C7FAB", "7566A0", "6F5091", "68478D", "563D82", "523178", "94A9CB", "6787B7", "426DA9", "385E9D", "2C5697", "1D4F91", "1D428A", "4698CB", "298FC2", "0076A8", "006298", "005587", "004976", "01426A", "7BA7BC", "6399AE", "4E87A0", "41748D", "34657F", "165C7D", "005776", "48A9C5", "009CBD", "0085AD", "007096", "006A8E", "00617F", "005670", "63B1BC", "00A7B5", "0097A9", "00859B", "007D8A", "007680", "006269", "00968F", "00857D", "007672", "006D68", "00635B", "005E5D", "005151", "50A684", "00966C", "008755", "007B4B", "006F44", "006845", "005844", "4B9560", "228848", "007A3E", "007041", "286140", "36573B", "395542", "6BA539", "48A23F", "319B42", "3A913F", "44883E", "4A773C", "44693D", "BABC16", "ABAD23", "999B30", "888D30", "7C8034", "727337", "656635", "CAB64B", "CFB023", "C1A01E", "A08629", "897630", "736635", "675E33", "D4C304", "C4B200", "91852C", "747136", "5D6439", "585C3B", "535435", "BBB323", "B4A91F", "AA9D2E", "8F7E35", "716135", "635939", "4E4934", "332F21", "212721", "31261D", "3E2B2E", "101820", "3D3935", "D9D9D6", "D0D0CE", "C8C9C7", "BBBCBC", "B1B3B3", "A7A8AA", "97999B", "888B8D", "75787B", "D7D2CB", "CBC4BC", "BFB8AF", "B6ADA5", "ACA39A", "A59C94", "968C83", "8C8279", "83786F", "63666A", "53565A", "796E65", "6E6259"],
    MIN_PMSColorMatching = 360;

var PMS = function () {
	function PMS() {
		_classCallCheck(this, PMS);

		this.aDis = [];
	}

	_createClass(PMS, [{
		key: "PMS2RGB",
		value: function PMS2RGB(pms) {
			var i = aPMS.indexOf(pms);
			return i >= 0 ? aRGB[i] : "";
		}
	}, {
		key: "RGB2PMS",
		value: function RGB2PMS(rgb) {
			var i = aRGB.indexOf(rgb);
			return i >= 0 ? aPMS[i] : "";
		}
	}, {
		key: "GetDistance",
		value: function GetDistance(pms) {
			// must call after PMSColorMatching()
			var i = aPMS.indexOf(pms);
			return i >= 0 ? this.aDis[i] : 0;
		}
	}, {
		key: "pmsMinDistance",
		value: function pmsMinDistance() {
			// must call after PMSColorMatching()
			return this.aDis.min();
		}
	}, {
		key: "PMSColorMatching",
		value: function PMSColorMatching(rgb, distance) {
			if (distance === undefined) {
				distance = 32;
			}
			var a = [],
			    m = this.RGB2PMS(rgb);
			//exact pms
			if (m !== "") {
				a.push(m);
			}
			//search near color
			var r = parseInt(rgb.substr(0, 2), 16),
			    g = parseInt(rgb.substr(2, 2), 16),
			    b = parseInt(rgb.substr(4, 2), 16);

			for (var i = 0; i < aRGB.length; i++) {
				var rgb1 = aRGB[i],
				    r1 = parseInt(rgb1.substr(0, 2), 16),
				    g1 = parseInt(rgb1.substr(2, 2), 16),
				    b1 = parseInt(rgb1.substr(4, 2), 16);

				//3D distense
				this.aDis[i] = Math.sqrt(Math.pow(r - r1, 2) + Math.pow(g - g1, 2) + Math.pow(b - b1, 2));
			}
			MIN_PMSColorMatching = Math.min.apply(Math, this.aDis);

			for (var _i = 0; _i < this.aDis.length; _i++) {
				if (this.aDis[_i] <= distance) {
					if (a.indexOf(aPMS[_i]) == -1) {
						a.push(aPMS[_i]);
					}
				}
			}

			return a;
		}
	}, {
		key: "dec2hex",
		value: function dec2hex(i) {
			var result = "00";
			if (i >= 0 && i <= 15) {
				result = "0" + i.toString(16);
			} else if (i >= 16 && i <= 255) {
				result = i.toString(16);
			}
			return result;
		}
	}]);

	return PMS;
}();

exports.default = PMS;

},{}]},{},[1]);
