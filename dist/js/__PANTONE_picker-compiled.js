"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion: 6 */

// var COLOR_SPACE = {};

var COLOR_SPACE = function () {
	function COLOR_SPACE() {
		_classCallCheck(this, COLOR_SPACE);
	}

	_createClass(COLOR_SPACE, [{
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
			return (this.hex(rgb.r) + this.hex(rgb.g) + this.hex(rgb.b)).toUpperCase();
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

	return COLOR_SPACE;
}();

var ColorCanvas = function () {
	function ColorCanvas() {
		_classCallCheck(this, ColorCanvas);
	}

	_createClass(ColorCanvas, [{
		key: "_construct",
		value: function _construct(canvas, hueBar) {
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
	}, {
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
				this.drawPointer(ctx, w, h, x, y, l);
			} else {
				this.drawDefaultPointer(ctx, w, h, x, y, l);
			}
		}
	}, {
		key: "drawDefaultPointer",
		value: function drawDefaultPointer(ctx, w, h, x, y, l, isHueBar) {
			ctx.beginPath();
			ctx.lineWidth = 1;
			if (l < 128) {
				ctx.strokeStyle = "rgb(255,255,255)";
			} else {
				ctx.strokeStyle = "rgb(0,0,0)";
			}
			var radius = 6;
			ctx.arc(x + 0.5, y + 0.5, radius, 0, Math.PI * 2, true);

			radius += 2;
			ctx.moveTo(x - radius + 0.5, y + 0.5);
			ctx.lineTo(x + radius + 0.5, y + 0.5);
			ctx.moveTo(x + 0.5, y - radius + 0.5);
			ctx.lineTo(x + 0.5, y + radius + 0.5);
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
					    rgb = this.hsv2rgb(hue, sat * 255, bri * 255);
					//rgb = this.getWebSafeColor(rgb);
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
			var hsb = this.rgb2hsv(c.r, c.g, c.b);
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
			return this.hsv2rgb(h, s, 255 - v);
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

var PANTONE_picker = function () {
	function PANTONE_picker() {
		_classCallCheck(this, PANTONE_picker);
	}

	_createClass(PANTONE_picker, [{
		key: "ColorPicker",
		value: function ColorPicker($2) {
			this.currentColor = { r: 0, g: 0, b: 0 };
		}
	}, {
		key: "init",
		value: function init(linkedElement, flat, onColorChange, fnDrawPointer1, fnDrawPointer2) {
			var _this2 = this;

			this.onColorChange = onColorChange ? onColorChange : function () {};
			this.flat = typeof flat === "boolean" ? flat : true;
			if (this.flat) {
				this._buildUI(linkedElement);
			} else {
				this.linkedElement = linkedElement;
				this._buildUI();
			}

			this.element.find("canvas").each(function () {
				var w = $(_this2).parent().width(),
				    h = $(_this2).parent().height();
				$(_this2).attr("width", w);
				$(_this2).attr("height", h);
			});

			this.canvasMap = this.element.find(".color-map canvas")[0];
			this.canvasBar = this.element.find(".color-bar canvas")[0];
			this.colorMap = new this.ColorCanvas(this.canvasMap, false);
			this.colorBar = new this.ColorCanvas(this.canvasBar, true);

			if (fnDrawPointer1) {
				this.colorMap.drawPointer = fnDrawPointer1;
			}
			if (fnDrawPointer2) {
				this.colorBar.drawPointer = fnDrawPointer2;
			}

			$(this.canvasMap).data("ME", this.colorMap).data("YOU", this.colorBar);
			$(this.canvasBar).data("YOU", this.colorMap).data("ME", this.colorBar);

			this._registerEvent();

			this.setColor({ r: 64, g: 128, b: 128 });

			if (this._isInput()) {
				var val = $(this.linkedElement).val();
				if (val.length === 6) {
					this.currentColor = COLOR_SPACE.parseColor(val);
					if (!this.currentColor) {
						this.currentColor = { r: 64, g: 128, b: 128 };
					}
				}
			}
			return this;
		}
	}, {
		key: "_isInput",
		value: function _isInput() {
			return this.linkedElement && this.linkedElement.nodeName.toLowerCase() === "input" && $(this.linkedElement).attr("type") === "text";
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
			var color = this.initialColor;
			if (this._isInput()) {
				$(this.linkedElement).val(COLOR_SPACE.RGB2HEX(color));
			} else {
				$(this.linkedElement).css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
			}
			this.colorChanged(color);
		}
	}, {
		key: "_registerEvent",
		value: function _registerEvent() {
			var _this3 = this;

			var _this = this;
			this.mouseStarted = false;

			if (this._isInput()) {
				$(this.linkedElement).bind("focus", function () {
					_this.show();
				});
			} else {
				$(this.linkedElement).bind("mousedown", function () {
					_this.show();
				});
			}
			this.element.find(".old-color").click(function () {
				_this._restoreToInitial();
			});
			this.element.find(".cur-color").click(function () {
				_this.initialColor = _this.currentColor;
				_this.element.find(".old-color").css("background-color", "rgb(" + _this.initialColor.r + "," + _this.initialColor.g + "," + _this.initialColor.b + ")");
			});
			$(this.canvasBar).add(this.canvasMap).bind("mousedown", function (event) {
				_this.mouseStarted = true;
				var offset = $(_this3).offset(),
				    x = event.pageX - offset.left,
				    y = event.pageY - offset.top;
				_this._trackChanging(x, y, _this3);
			}).bind("mouseup", function () {
				_this.mouseStarted = false;
			}).bind("mouseout", function () {
				_this.mouseStarted = false;
			}).bind("mousemove", function (event) {
				if (_this.mouseStarted) {
					var offset = $(_this3).offset(),
					    x = event.pageX - offset.left,
					    y = event.pageY - offset.top;
					_this._trackChanging(x, y, _this3);
				}
			});

			this.element.find("input[name=R],input[name=G],input[name=B]").bind("keyup", function () {
				var v = $(_this3).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					v = _this.CLAMP(v, 0, 255);
					switch (_this3.name) {
						case "R":
							_this.currentColor.r = v;break;
						case "G":
							_this.currentColor.g = v;break;
						case "B":
							_this.currentColor.b = v;break;
					}
					_this.setColor(_this.currentColor);
					_this.colorChanged(_this.currentColor);
				} else {
					//_this.setColor(_this.currentColor);
					return false;
				}
			});

			this.element.find("input[name=H],input[name=S],input[name=V]").bind("keyup", function () {
				var v = $(_this3).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var hsv = COLOR_SPACE.rgb2hsv(_this.currentColor);
					// hsv.s = parseInt((hsv.s / 255 * 100).toFixed(0));
					// hsv.v = parseInt((hsv.v / 255 * 100).toFixed(0));
					v = parseFloat(v);
					switch (_this3.name) {
						case "H":
							v = _this.CLAMP(v, 0, 359);hsv.h = v;break;
						case "S":
							v = _this.CLAMP(v, 0, 100);hsv.s = v * 255 / 100;break;
						case "V":
							v = _this.CLAMP(v, 0, 100);hsv.v = v * 255 / 100;break;
					}
					_this.currentColor = COLOR_SPACE.hsv2rgb(hsv);
					_this.setColor(_this.currentColor);
					_this.colorChanged(_this.currentColor);
				} else {
					// _this.setColor(_this.currentColor);
				}
			});

			this.element.find("input[name=Y],input[name=M],input[name=C],input[name=K]").bind("keyup", function () {
				var v = $(_this3).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var ymck = COLOR_SPACE.rgb2ymck(_this.currentColor);
					switch (_this3.name) {
						case "C":
							v = _this.CLAMP(v, 0, 100);ymck.c = v;break;
						case "M":
							v = _this.CLAMP(v, 0, 100);ymck.m = v;break;
						case "Y":
							v = _this.CLAMP(v, 0, 100);ymck.y = v;break;
						case "K":
							v = _this.CLAMP(v, 0, 100);ymck.k = v;break;
					}
					_this.currentColor = COLOR_SPACE.ymck2rgb(ymck);
					_this.setColor(_this.currentColor);
					_this.colorChanged(_this.currentColor);
				} else {
					// _this.setColor(_this.currentColor);
				}
			});

			this.element.find("input[name=RGB]").bind("change", function () {
				var color = COLOR_SPACE.parseColor($(_this3).val());
				if (color) {
					_this.setColor(color);
					_this.colorChanged(color);
				}
			}).focus(function () {
				$(_this3).select();
			});

			this.element.find("input[name=RGB]").bind("keyup", function () {
				if ($(_this3).val().length == 6) {
					var color = COLOR_SPACE.parseColor($(_this3).val());
					if (color) {
						_this.setColor(color);
						_this.colorChanged(color);
					}
				}
			});
		}
	}, {
		key: "setInitialColor",
		value: function setInitialColor(color) {
			this.initialColor = color;
			this.element.find(".old-color").css("backgroundColor", COLOR_SPACE.RGB2HEX(color));
			return this.setColor(color);
		}
	}, {
		key: "setColor",
		value: function setColor(color) {
			this.currentColor = color;
			this.setColorText(this.currentColor);
			this.colorMap.setColor(this.currentColor);
			this.colorBar.setColor(this.currentColor);
			return this;
		}
	}, {
		key: "_trackChanging",
		value: function _trackChanging(x, y, canvas) {
			var x1 = this.CLAMP(x * 255 / canvas.width, 0, 255),
			    y1 = this.CLAMP(y * 255 / canvas.height, 0, 255);
			$(canvas).data("ME").setXY(x1, y1);

			var color = $(canvas).data("ME").getColor();
			$(canvas).data("YOU").setColor(color);

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
				$(this.linkedElement).css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
			}

			if (this.onColorChange) {
				this.onColorChange(color, COLOR_SPACE.rgb2hsv(color));
			}
		}
	}, {
		key: "setColorText",
		value: function setColorText(color) {
			this.element.find("input[name=RGB]").val(COLOR_SPACE.RGB2HEX(color));
			this.element.find("input[name=R]").val(color.r);
			this.element.find("input[name=G]").val(color.g);
			this.element.find("input[name=B]").val(color.b);
			var hsv = COLOR_SPACE.rgb2hsv(color);
			hsv.s = (hsv.s / 255 * 100).toFixed(0);
			hsv.v = (hsv.v / 255 * 100).toFixed(0);
			this.element.find("input[name=H]").val(hsv.h);
			this.element.find("input[name=S]").val(hsv.s);
			this.element.find("input[name=V]").val(hsv.v);
			var ymck = COLOR_SPACE.rgb2ymck(color);
			this.element.find("input[name=Y]").val(ymck.y);
			this.element.find("input[name=M]").val(ymck.m);
			this.element.find("input[name=C]").val(ymck.c);
			this.element.find("input[name=K]").val(ymck.k);

			this.element.find(".preview .cur-color").css("background-color", "rgb(" + color.r + "," + color.g + "," + color.b + ")");
			$(this.linkedElement).data("current_color", color);
		}
	}, {
		key: "getColor",
		value: function getColor() {
			return this.currentColor;
		}
	}, {
		key: "show",
		value: function show() {
			if (this.element.css("visibility") == "hidden") {
				var off = $(this.linkedElement).offset();
				var left = off.left,
				    top = off.top + $(this.linkedElement).outerHeight();
				if (left + this.element.width() > $(window).width() + $("body").scrollLeft()) {
					left = $(window).width() + $("body").scrollLeft() - this.element.width() - 10;
				}

				if (top + this.element.height() > $(window).height() + $(window).scrollTop()) {
					top = off.top - this.element.height() - 10;
				}

				this._mask.css("display", "");
				this.element.css({
					"visibility": "visible",
					"left": left + "px",
					"top": top + "px"
				}).animate({
					opacity: 1
				}, 300);
				var color = $(this.linkedElement).data("current_color");
				if (this.linkedElement.nodeName.toLowerCase() === "input" && $(this.linkedElement).attr("type") === "text") {
					var val = $(this.linkedElement).val();
					if (val.length === 7 && val.charAt(0) === "#") {
						color = COLOR_SPACE.parseColor(val);
					}
				}

				if (color) {
					this.setInitialColor(color);
				}
			}
			return this;
		}
	}, {
		key: "hide",
		value: function hide() {
			if (this.element.css("visibility") !== "hidden") {
				this._mask.css("display", "none");
				this.element.animate({
					opacity: 0
				}, 300, function () {
					$(this).css("visibility", "hidden");
				});
			}
			return this;
		}
	}, {
		key: "_buildUI",
		value: function _buildUI(element) {
			var _this4 = this;

			var idext = Math.round(Math.random() * 1000000 * new Date()),
			    cp = this,
			    css = {
				position: "absolute",
				left: "0px",
				top: "0px",
				visibility: "hidden",
				zIndex: 10001
			},
			    e = $("body"),
			    cls = " popup";
			if (element) {
				e = $(element);
				var w = e.width(),
				    h = e.height();
				if (e.css("position") == "relative" || e.css("position") == "absolute") {
					css = {
						position: "absolute",
						left: "0px",
						top: "0px",
						visibility: "visible",
						width: w + "px",
						height: h + "px"
					};
				} else {
					e.css("position", "relative");
					css = {
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
					cp._mask = $(_this4);
				}).bind("mousedown", function () {
					cp.hide();
				}));
			}
			e.append($("<div class=\"canvas-color-picker" + cls + "\"></div>").attr("id", "cp-" + idext).css(css).append("<div class=\"color-map\"><canvas name=\"colormap\"></canvas></div>").append("<div class=\"color-bar\"><canvas name=\"huebar\"></canvas></div>").append("<div class=\"preview\"><div class=\"cur-color\"></div><div class=\"old-color\"></div></div>").append($("<div class=\"form\"></div>").append($("<div class=\"hor-div\"></div>").append($("<div class=\"hsb\"></div>").append("<label>H:</label><input type=\"text\" name=\"H\" size=\"3\" maxlength=\"3\">&deg;<br>").append("<label>S:</label><input type=\"text\" name=\"S\" size=\"3\" maxlength=\"3\">%<br>").append("<label>V:</label><input type=\"text\" name=\"V\" size=\"3\" maxlength=\"3\">%<br>")).append($("<div class=\"rgb\"></div>").append("<label>R:</label><input type=\"text\" name=\"R\" size=\"3\" maxlength=\"3\"><br>").append("<label>G:</label><input type=\"text\" name=\"G\" size=\"3\" maxlength=\"3\"><br>").append("<label>B:</label><input type=\"text\" name=\"B\" size=\"3\" maxlength=\"3\"><br>")).append($("<div class=\"ymck\"></div>").append("<label>C:</label><input type=\"text\" name=\"C\" size=\"3\" maxlength=\"3\">%<br>").append("<label>M:</label><input type=\"text\" name=\"M\" size=\"3\" maxlength=\"3\">%<br>").append("<label>Y:</label><input type=\"text\" name=\"Y\" size=\"3\" maxlength=\"3\">%<br>").append("<label>K:</label><input type=\"text\" name=\"K\" size=\"3\" maxlength=\"3\">%<br>"))).append("<div class=\"color\">HEX #: <input type=\"text\" id=\"RGB\" name=\"RGB\" size=\"6\" maxlength=\"6\"/></div>").append("<div class=\"proximity\">Color distance : <select id=\"proximity\"><option value=\"16\">16</option><option value=\"32\" selected>32</option><option value=\"48\">48</option><option value=\"64\">64</option><option value=\"80\">80</option><option value=\"96\">96</option></select></div>")).each(function () {
				cp.element = $(_this4);
			}));
		}
	}, {
		key: "showRGB",
		value: function showRGB(flag) {
			var rgb = this.element.find(".form .rgb");
			if (flag) {
				rgb.show();
			} else {
				rgb.hide();
			}
			return this;
		}
	}, {
		key: "showHSB",
		value: function showHSB(flag) {
			var hsb = this.element.find(".form .hsb");
			if (flag) {
				hsb.show();
			} else {
				hsb.hide();
			}
			return this;
		}
	}, {
		key: "showColor",
		value: function showColor(flag) {
			var clr = this.element.find(".form .color");
			if (flag) {
				clr.show();
			} else {
				clr.hide();
			}
			return this;
		}
	}, {
		key: "showPreview",
		value: function showPreview(flag) {
			var e = this.element.find(".preview");
			if (flag) {
				e.show();
			} else {
				e.hide();
			}
			return this;
		}
	}, {
		key: "getProximity",
		value: function getProximity() {
			return $("#proximity").val();
		}
	}, {
		key: "sizeTo",
		value: function sizeTo(w, h) {
			if (w < 60) {
				w = 60;
			}
			if (h < 30) {
				h = 30;
			}
			this.element.width(w).height(h);
			if (h < 150) {
				this.showRGB(false).showHSB(false);
			}
			if (h < 100) {
				this.showPreview(false).showColor(false);
			}
			if (w < 200) {
				this.showRGB(false).showHSB(false).showPreview(false).showColor(false);
			}
			this._rearrange();
			return this;
		}
	}, {
		key: "_rearrange",
		value: function _rearrange() {
			var w = this.element.width(),
			    h = this.element.height();
			if (h < 200) {
				this.showRGB(false);
				this.showHSB(false);
			}
			this.element.find("canvas[name=colormap]").attr({
				"width": this.element.find(".color-map").width(),
				"height": this.element.find(".color-map").height()
			});
			this.element.find("canvas[name=huebar]").attr("height", this.element.find(".color-bar").height());

			var rgb = this.element.find(".form .rgb"),
			    hsb = this.element.find(".form .hsb"),
			    clr = this.element.find(".form .color"),
			    btns = this.element.find(".buttons"),
			    preview = this.element.find(".preview");

			if (rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none" && btns.css("display") == "none" && preview.css("display") == "none") {
				this.element.find(".color-map").css("right", "30px");
				this.element.find(".color-bar").css("right", "5px");

				this.element.find("canvas[name=colormap]").attr({
					"width": this.element.find(".color-map").width(),
					"height": this.element.find(".color-map").height()
				});
			}

			if (rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none") {
				this.element.find(".form").hide();
			} else {
				this.element.find(".form").show();
			}

			if (rgb.css("display") == "none" && hsb.css("display") == "none") {
				this.element.find(".buttons").css("height", "50px");
				this.element.find(".buttons button").css("width", "110px");
			} else {
				this.element.find(".buttons").css("height", "25px");
				this.element.find(".buttons button").css("width", "55px");
			}

			this.colorMap.repaint();
			this.colorBar.repaint();
		}
	}]);

	return PANTONE_picker;
}();

exports.default = PANTONE_picker;

// (function($){
// 	$.fn.CanvasColorPicker(options) {
// 		addStyle();
// 		let settings = {
// 			flat : false,
// 			width : 480,
// 			height : 240,
// 			showColor : true,
// 			showRGB : true,
// 			showHSB : true,
// 			showPreview : true,
// 			color : {r:0,g:0,b:0},
// 			onColorChange : function(rgb,hsv){},
// 			drawColorMapPointer : null,
// 			drawHueMapPointer : null
// 		}
//
// 		return this.each(function(){
// 			if ( options ) {
// 				$.extend( settings, options );
// 				settings.color = checkColor(settings.color);
// 			}
// 			if ( !$(this).data("canvas-color-picker") ){
// 				let cp = new ColorPicker()
//	  .init(
//		this,
//		settings.flat,
//		settings.onColorChange,
//		settings.drawColorMapPointer,
//		settings.drawHueMapPointer
//	  )
//	  .setInitialColor(settings.color)
//	  .showRGB(settings.showRGB)
//	  .showHSB(settings.showHSB)
//	  .showColor(settings.showColor)
//	  .showPreview(settings.showPreview);
//
// 				if ( settings.flat ){
// 					cp.sizeTo($(this).width(),$(this).height());
// 				} else {
// 					cp.sizeTo(settings.width,settings.height);
// 				}
// 				!$(this).data("canvas-color-picker",cp);
// 			}
// 		});
//
// 		checkColor(color) {
// 			if ( typeof(color) === "object" &&
//	   color.hasOwnProperty("r") &&
//	   color.hasOwnProperty("g") &&
//	   color.hasOwnProperty("b") ){
// 				color.r = (color.r < 0)?0:((color.r > 255)?255:color.r);
// 				color.g = (color.g < 0)?0:((color.g > 255)?255:color.g);
// 				color.b = (color.b < 0)?0:((color.b > 255)?255:color.b);
// 			} else {
// 				color = {r:0,g:0,b:0};
// 			}
// 			return color;
// 		}
// 		addStyle($2) {
// 			if ( $.fn.CanvasColorPicker.StyleReady ){
// 				return;
// 			}
// 			$.fn.CanvasColorPicker.StyleReady = true;
// 			let arrStyle = [
// 				"<style type='text/css'>",
// 				".canvas-color-picker{position:relative;width:400px;height:260px;background:transparent;}",
// 				".canvas-color-picker.popup{background: -webkit-gradient(linear, 0 0, 0 bottom, from(#efefef), to(#dddddd));background: -moz-linear-gradient(#efefef, #dddddd);background: linear-gradient(#efefef, #dddddd);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, startColorstr=#efefef,endColorstr=#dddddd);box-shadow:3px 2px 5px #888888;-moz-box-shadow: 3px 2px 10px #888888;-webkit-box-shadow: 3px 2px 5px #888888; border:1px solid #eeeeee;}",
// 				".canvas-color-picker .color-map{position:absolute;left:5px;top:5px;bottom:5px;right:225px;}",
// 				".canvas-color-picker .color-bar{position:absolute;width:20px;right:200px;top:5px;bottom:5px;}",
// 				".canvas-color-picker .preview {position:absolute;top:5px;right:10px;width:180px;height:55px;border:1px solid black;border-right:1px solid white;border-bottom:1px solid white;}",
// 				".canvas-color-picker .preview .cur-color{float:left;position:relative;height:55px;width:90px;background:blue;}",
// 				".canvas-color-picker .preview .old-color{float:right;height:55px;width:89px;background-color:#888844;}",
// 				".canvas-color-picker .form{position:absolute;padding:0px;margin:0px;top:70px;right:5px;width:192px;height:85px;text-align:left;font-style:arial;}",
// 				".canvas-color-picker .form br{clear:both;}",
// 				".canvas-color-picker .form .hor-div {padding:2px;width:100%;}",
// 				".canvas-color-picker .form .hsb{top:0px;width:65px;height:105px;position:relative;float:left;}",
// 				".canvas-color-picker .form .rgb{top:0px;width:55px;height:105px;position:relative;float:left;border-left:1px solid #999999;border-right:1px solid #999999;padding-left:2px;}",
// 				".canvas-color-picker .form .ymck{top:0px;width:65px;height:105px;position:relative;float:left;padding-left:2px;}",
// 				".canvas-color-picker .form .color{clear:both;position:relative;top:5px;width:100%}",
// 				".canvas-color-picker .form label{width:17px;display:block;float:left;}",
// 				".canvas-color-picker .form input{width:25px;display:block;float:left;}",
// 				".canvas-color-picker .form .color input{width:58px;float:none;display:inline}",
// 				".canvas-color-picker .form .proximity {clear:both;position:relative;top:10px;left:0px;}",
// 				"</style>"
// 			];
// 			$(arrStyle.join("")).appendTo("head");
// 		}
// 	};
// })(jQuery);
