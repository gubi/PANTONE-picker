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
	/**
  * Class constructor
  * @param  object 							options   						The options object
  */
	function ColorPicker(options) {
		_classCallCheck(this, ColorPicker);

		var settings = {
			targetObject: this,
			flat: true,
			width: 600,
			height: 250,
			showColor: true,
			showRGBA: false,
			showHSB: false,
			showPreview: true,
			initialColor: {
				r: 64,
				g: 128,
				b: 128,
				a: 100
			},
			onColorChange: function onColorChange(rgba, hsb) {},
			drawColorMapPointer: null,
			drawHueMapPointer: null,
			fnDrawPointer1: true,
			fnDrawPointer2: true,
			fnDrawPointer3: true
		};
		if (options) {
			$.extend(settings, options);
		}
		Object.assign(this, settings);
		// this.element = this.element.width();

		$(settings.targetObject).width(settings.width);
		$(settings.targetObject).height(settings.height);
		// Fix the default alpha value
		settings.initialColor.a = COLOR_SPACE.fixDefaultNumericValue(settings.initialColor.a, 100);
		this.currentAlpha = 100;
		// ACTIONS
		if (this.flat) {
			this._buildUI(settings.targetObject);
		} else {
			this._buildUI();
		}
		$(settings.targetObject).find("canvas").each(function (k, item) {
			var $canvas_container = $(item).closest(".canvas-container"),
			    w = $canvas_container.width(),
			    h = $canvas_container.height();
			if ($canvas_container.hasClass("color-map")) {
				$(item).attr("width", w);
			} else {
				$(item).attr("width", w);
			}
			$(item).attr("height", h);
		});
		this.canvasMap = $(".color-map canvas")[0];
		this.canvasBar = $(".color-bar canvas")[0];
		this.canvasAlpha = $(".alpha-bar canvas")[0];
		// ColorMap
		this.colorMap = new _ColorCanvas2.default(this.canvasMap, false, false);
		if (settings.fnDrawPointer1) {
			this.colorMap.drawPointer = settings.fnDrawPointer1;
		}
		// ColorBar
		this.colorBar = new _ColorCanvas2.default(this.canvasBar, true, false);
		if (settings.fnDrawPointer2) {
			this.colorBar.drawPointer = settings.fnDrawPointer2;
		}
		// AlphaBar
		this.alphaBar = new _ColorCanvas2.default(this.canvasAlpha, false, true);
		if (settings.fnDrawPointer3) {
			this.alphaBar.drawPointer = settings.fnDrawPointer3;
		}

		this.setInitialColor(settings.initialColor);
		this._showHEXInput(settings.showColor);
		this._showPreviewBox(settings.showPreview);
		// console.log(this.colorBar);
		$(this.canvasMap).data({ "ME": this.colorMap, "YOU": this.colorBar });
		$(this.canvasBar).data({ "YOU": this.colorMap, "ME": this.colorBar });
		this.currentAlpha = $("#alpha").val();

		this._registerEvent();

		//	 // this.setColor({r: 64, g: 128, b: 128});
		if (this._isInput()) {
			var val = $(this.targetObject).val();
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
			return this.targetObject && this.targetObject[0].nodeName.toLowerCase() === "input" && $(this.targetObject).attr("type") === "text";
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
		value: function _restoreToInitial(color) {
			if (color === undefined) {
				color = this.initialColor;
			}
			// if(this._isInput()) {
			// 	$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(this.initialColor));
			// } else {
			// 	$(".cur-color").css("background-color", "rgba(" + this.initialColor.r + ", " + this.initialColor.g + ", " + this.initialColor.b + ", " + this.initialColor.a + ")");
			// }
			// this.currentAlpha = 100;
			this.colorChanged(color);
			this.setColor(color);
		}
	}, {
		key: "_registerEvent",
		value: function _registerEvent() {
			var _this2 = this;

			var _this = this;
			this.mouseStarted = false;

			if (this._isInput()) {
				$(this.targetObject).on("focus", function () {
					// _this.show();
				});
			} else {
				$(".canvas-container").on("mousedown", function (event) {
					_this2.isAlphaBar = $(event.target).hasClass("alphabar");
					_this2.isHueBar = $(event.target).hasClass("huebar");
					_this2.isColorMap = $(event.target).hasClass("alphabar");
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
					} else {
						_this2.isAlphaBar = false;
						_this2.isHueBar = false;
						_this2.isColorMap = false;
					}
				}).on("mouseup mouseout", function () {
					_this2.mouseStarted = false;
					_this2.isAlphaBar = false;
					_this2.isHueBar = false;
					_this2.isColorMap = false;
				});
			}
			$(".old-color").on("click", function (event) {
				_this2._restoreToInitial(COLOR_SPACE.RGBAstring2RGBA($(event.target).css("backgroundColor")));
			});
			$(".cur-color").click(function () {
				_this.initialColor = _this2.currentColor;
				_this.currentColor.a = parseInt($("#alpha").val());
				$(".old-color").css("background-color", "rgba(" + _this.initialColor.r + ", " + _this.initialColor.g + ", " + _this.initialColor.b + ", " + _this.initialColor.a / 100 + ")");
			});

			$("input[name=R], input[name=G], input[name=B], input[name=A]").on("keyup", function (event) {
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
						case "A":
							_this2.currentColor.a = $("#alpha").val();break;
					}
					_this2.setColor(_this2.currentColor);
					_this2.colorChanged(_this2.currentColor);
				} else {
					_this2.currentColor.a = $("#alpha").val();
					_this2.setColor(_this2.currentColor);
				}
			});

			$("input[name=H], input[name=S], input[name=Br]").on("keyup", function (event) {
				var v = $(event.target).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var hsb = COLOR_SPACE.RGBA2HSB(_this2.currentColor);
					// hsb.s = parseInt((hsb.s / 255 * 100).toFixed(0));
					// hsb.v = parseInt((hsb.v / 255 * 100).toFixed(0));
					v = parseFloat(v);
					switch (event.target.name) {
						case "H":
							v = _this2.CLAMP(v, 0, 359);hsb.h = v;break;
						case "S":
							v = _this2.CLAMP(v, 0, 100);hsb.s = v * 255 / 100;break;
						case "V":
							v = _this2.CLAMP(v, 0, 100);hsb.v = v * 255 / 100;break;
					}
					_this2.currentColor = COLOR_SPACE.HSB2RGBA(hsb);
					_this2.currentColor.a = $("#alpha").val();
					_this2.setColor(_this2.currentColor);
					_this2.colorChanged(_this2.currentColor);
				} else {
					_this2.currentColor.a = $("#alpha").val();
					_this2.setColor(_this2.currentColor);
				}
			});

			$("input[name=C], input[name=M], input[name=Y], input[name=K]").on("keyup", function (event) {
				var v = $(event.target).val();
				if (!isNaN(parseFloat(v)) && isFinite(v)) {
					var cmyk = COLOR_SPACE.RGBA2CMYK(_this2.currentColor);
					switch (event.target.name) {
						case "C":
							v = _this2.CLAMP(v, 0, 100);cmyk.c = v;break;
						case "M":
							v = _this2.CLAMP(v, 0, 100);cmyk.m = v;break;
						case "Y":
							v = _this2.CLAMP(v, 0, 100);cmyk.y = v;break;
						case "K":
							v = _this2.CLAMP(v, 0, 100);cmyk.k = v;break;
					}
					_this2.currentColor = COLOR_SPACE.CMYK2RGBA(cmyk);
					_this2.currentColor.a = $("#alpha").val();
					_this2.setColor(_this2.currentColor);
					_this2.colorChanged(_this2.currentColor);
				} else {
					_this.setColor(_this2.currentColor);
				}
			});

			$("input[name=HEX]").on("change", function (event) {
				var color = COLOR_SPACE.parseColor($(event.target).val());
				color.a = $("#alpha").val();
			}).on("focus", function (event) {
				$(event.target).select();
			}).on("keyup", function (event) {
				if ($(event.target).val().length == 6) {
					var color = COLOR_SPACE.parseColor($(event.target).val());
					color.a = $("#alpha").val();
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
			$(".old-color").css("backgroundColor", COLOR_SPACE.RGBA2HEX(color));
			this.setColor(color);
		}
	}, {
		key: "setColor",
		value: function setColor(color) {
			this.currentColor = color;
			if (this.currentColor.a === undefined) {
				this.currentColor.a = this.currentAlpha;
			}
			this.setColorText(this.currentColor);
			this.colorMap.setColor(this.currentColor);
			this.colorBar.setColor(this.currentColor);
		}
	}, {
		key: "_trackChanging",
		value: function _trackChanging(x, y, canvas) {
			var x1 = this.CLAMP(x * 255 / canvas.width(), 0, 255),
			    y1 = this.CLAMP(y * 255 / canvas.height(), 0, 255),
			    alpha = this.isAlphaBar ? Math.round((canvas.height() - y) / canvas.height() * 100) : $("#alpha").val();
			if (this.isAlphaBar) {
				this.currentAlpha = alpha;
				this.currentColor.a = this.currentAlpha;
				this.changeColor(this.currentColor);
				$("#alpha").val(this.currentAlpha);
			}

			if (canvas.data("ME") !== undefined) {
				var color = canvas.data("ME").getColor();
				canvas.data("ME").setXY(x1, y1);
				canvas.data("YOU").setColor(color);
				if (color) {
					this.colorChanged(color);
				}
			}
			//
		}
	}, {
		key: "colorChanged",
		value: function colorChanged(color) {
			this.currentColor = color;
			if (this.currentColor.a === undefined) {
				this.currentColor.a = parseInt(this.currentAlpha);
			}
			this.setColorText(this.currentColor);

			if (this._isInput()) {
				$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(color));
			} else {
				$(".cur-color").css("background-color", "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a / 100 + ")");
			}

			if (this.onColorChange) {
				this.onColorChange(color, COLOR_SPACE.RGBA2HSB(color));
			}
		}
	}, {
		key: "alphaChanged",
		value: function alphaChanged(alpha) {
			if (this._isInput()) {
				$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(this.currentColor));
			} else {
				$(".cur-color").css("background-color", "rgba(" + this.currentColor.r + ", " + this.currentColor.g + ", " + this.currentColor.b + ", " + alpha / 100 + ")");
			}

			if (this.onColorChange) {
				this.onColorChange(this.currentColor, COLOR_SPACE.RGBA2HSB(this.currentColor));
			}
		}
	}, {
		key: "setColorText",
		value: function setColorText(color) {
			var hsb = COLOR_SPACE.RGBA2HSB(color),
			    cmyk = COLOR_SPACE.RGBA2CMYK(color);
			hsb.s = (hsb.s / 255 * 100).toFixed(0);
			hsb.b = (hsb.b / 255 * 100).toFixed(0);
			$("input[name=HEX]").val(COLOR_SPACE.RGBA2HEX(color));
			$("input[name=R]").val(color.r);
			$("input[name=G]").val(color.g);
			$("input[name=B]").val(color.b);
			$("input[name=A]").val(color.a);

			$("input[name=H]").val(hsb.h);
			$("input[name=S]").val(hsb.s);
			$("input[name=Br]").val(hsb.b);

			$("input[name=C]").val(cmyk.c);
			$("input[name=M]").val(cmyk.m);
			$("input[name=Y]").val(cmyk.y);
			$("input[name=K]").val(cmyk.k);

			$(".preview .cur-color").css("background-color", "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a / 100 + ")");
			$(this.targetObject).data("current_color", color);
		}
	}, {
		key: "getColor",
		value: function getColor() {
			return this.currentColor;
		}
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
			}).css(this.css).append($("<div>", { "class": "color-map canvas-container" }).append($("<canvas>", { "class": "colormap" }))).append($("<div>", { "class": "color-bar canvas-container" }).append($("<canvas>", { "class": "huebar" }))).append($("<div>", { "class": "alpha-bar canvas-container" }).append($("<canvas>", { "class": "alphabar" }))).append($("<div>", { "class": "preview" }).append($("<div>", { "class": "cur-color" })).append($("<div>", { "class": "old-color" }))).append($("<div>", { "class": "form" }).append($("<div>", { "class": "hor-div" }).append($("<div>", { "class": "hsb" }).append($("<label>").append("H:").append($("<input>", { "type": "text", "name": "H", "size": "3", "maxlength": "3" })).append("&deg;")).append($("<label>").append("S:").append($("<input>", { "type": "text", "name": "S", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("B:").append($("<input>", { "type": "text", "name": "Br", "size": "3", "maxlength": "3" })).append("%"))).append($("<div>", { "class": "rgba" }).append($("<label>").append("R:").append($("<input>", { "type": "text", "name": "R", "size": "3", "maxlength": "3" }))).append($("<label>").append("G:").append($("<input>", { "type": "text", "name": "G", "size": "3", "maxlength": "3" }))).append($("<label>").append("B:").append($("<input>", { "type": "text", "name": "B", "size": "3", "maxlength": "3" })))).append($("<div>", { "class": "cmyk" }).append($("<label>").append("C:").append($("<input>", { "type": "text", "name": "C", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("M:").append($("<input>", { "type": "text", "name": "M", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("Y:").append($("<input>", { "type": "text", "name": "Y", "size": "3", "maxlength": "3" })).append("%")).append($("<label>").append("K:").append($("<input>", { "type": "text", "name": "K", "size": "3", "maxlength": "3" })).append("%")))).append($("<div>", { "class": "color" }).append($("<label>").append("Alpha:").append($("<input>", { "type": "number", "name": "A", "id": "alpha", "min": "0", "max": "100", "size": "3", "maxlength": "3" }))).append($("<label>").append("HEX: #").append($("<input>", { "type": "text", "name": "HEX", "id": "HEX", "size": "6", "maxlength": "6" })))).append($("<div>", { "class": "proximity" }).append($("<label>").append("Color distance:").append($("<select>", { "id": "proximity" }).append($.map(options, function (v) {
				return $("<option>", { "value": v, "selected": v == 32 ? "selected" : null }).append(v);
			})))))).each(function () {
				_this3.element = $(_this3);
			}));
		}
	}, {
		key: "_showRGBAInput",
		value: function _showRGBAInput(flag) {
			if (flag) {
				$(".form .rgba").show();
			} else {
				$(".form .rgba").hide();
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
			$(".alphabar").width(w).height(h);
			if (h < 150) {
				this._showRGBAInput(false)._showHSBInput(false);
			}
			if (h < 100) {
				this.showPreview(false)._showHEXInput(false);
			}
			if (w < 200) {
				this._showRGBAInput(false)._showHSBInput(false).showPreview(false)._showHEXInput(false);
			}
			this._rearrange();
		}
	}, {
		key: "_rearrange",
		value: function _rearrange() {
			var w = this.element.width(),
			    h = this.element.height();
			if (h < 200) {
				this._showRGBAInput(false);
				this._showHSBInput(false);
			}
			$(".colormap").attr({
				"width": $(".color-map").width(),
				"height": $(".color-map").height()
			});
			$(".huebar").attr("height", $(".color-bar").height());
			$(".colorbar").attr("height", $(".color-bar").height());

			var rgba = $(".form .rgba"),
			    hsb = $(".form .hsb"),
			    clr = $(".form .color"),
			    btns = $(".buttons"),
			    preview = $(".preview");

			if (rgba.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none" && btns.css("display") == "none" && preview.css("display") == "none") {
				$(".color-map").css("right", "30px");
				$(".color-bar").css("right", "5px");

				$(".colormap").attr({
					"width": $(".color-map").width(),
					"height": $(".color-map").height()
				});
			}

			if (rgba.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none") {
				$(".form").hide();
			} else {
				$(".form").show();
			}

			if (rgba.css("display") == "none" && hsb.css("display") == "none") {
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
