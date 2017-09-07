/* jshint esversion: 6 */

import ColorSpace from "./ColorSpace.es6";
import ColorCanvas from "./ColorCanvas.es6";

var COLOR_SPACE = new ColorSpace();

class ColorPicker {
	/**
	 * Class constructor
	 * @param  object 							options   						The options object
	 */
	constructor(options) {
		let settings = {
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
			onColorChange: function(rgba, hsb) {},
			drawColorMapPointer: null,
			drawHueMapPointer: null,
			fnDrawPointer1: true,
			fnDrawPointer2: true,
			fnDrawPointer3: true
		};
		if(options) {
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
		if(this.flat) {
			this._buildUI(settings.targetObject);
		} else {
			this._buildUI();
		}
		$(settings.targetObject).find("canvas").each((k, item) => {
			let $canvas_container = $(item).closest(".canvas-container"),
				w = $canvas_container.width(),
				h = $canvas_container.height();
			if($canvas_container.hasClass("color-map")) {
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
		this.colorMap = new ColorCanvas(this.canvasMap, false, false);
		if(settings.fnDrawPointer1) {
			this.colorMap.drawPointer = settings.fnDrawPointer1;
		}
		// ColorBar
		this.colorBar = new ColorCanvas(this.canvasBar, true, false);
		if(settings.fnDrawPointer2) {
			this.colorBar.drawPointer = settings.fnDrawPointer2;
		}
		// AlphaBar
		this.alphaBar = new ColorCanvas(this.canvasAlpha, false, true);
		if(settings.fnDrawPointer3) {
			this.alphaBar.drawPointer = settings.fnDrawPointer3;
		}

		this.setInitialColor(settings.initialColor);
		this._showHEXInput(settings.showColor);
		this._showPreviewBox(settings.showPreview);
		// console.log(this.colorBar);
		$(this.canvasMap).data({"ME": this.colorMap, "YOU": this.colorBar});
		$(this.canvasBar).data({"YOU": this.colorMap, "ME": this.colorBar});
		this.currentAlpha = $("#alpha").val();

		this._registerEvent();

		//	 // this.setColor({r: 64, g: 128, b: 128});
		if(this._isInput()) {
			let val = $(this.targetObject).val();
			if(val.length === 6) {
				this.currentColor = ColorSpace.parseColor(val);
				if(!this.currentColor) {
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

	_isInput() {
		return (this.targetObject && this.targetObject[0].nodeName.toLowerCase() === "input" && $(this.targetObject).attr("type") === "text");
	}

	CLAMP(c, min, max) {
		min = min || 0; max = max || 255;
		if(c < min) { c = min; }
		if(c > max) { c = max; }
		return Math.round(c);
	}

	_restoreToInitial(color) {
		if(color === undefined) { color = this.initialColor; }
		// if(this._isInput()) {
		// 	$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(this.initialColor));
		// } else {
		// 	$(".cur-color").css("background-color", "rgba(" + this.initialColor.r + ", " + this.initialColor.g + ", " + this.initialColor.b + ", " + this.initialColor.a + ")");
		// }
		// this.currentAlpha = 100;
		this.colorChanged(color);
		this.setColor(color);
	}

	_registerEvent() {
		let _this = this;
		this.mouseStarted = false;

		if(this._isInput()) {
			$(this.targetObject).on("focus", () => {
				// _this.show();
			});
		} else {
			$(".canvas-container").on("mousedown", (event) => {
				this.isAlphaBar = $(event.target).hasClass("alphabar");
				this.isHueBar = $(event.target).hasClass("huebar");
				this.isColorMap = $(event.target).hasClass("alphabar");
				// _this.show();
				this.mouseStarted = true;
				let offset = $(event.target).offset(),
					x = event.pageX - offset.left,
					y = event.pageY - offset.top;
				this._trackChanging(x, y, $(event.target));
			}).on("mousemove", (event) => {
				if(this.mouseStarted) {
					let offset = $(event.target).offset(),
						x = event.pageX - offset.left,
						y = event.pageY - offset.top;
					this._trackChanging(x, y, $(event.target));
				} else {
					this.isAlphaBar = false;
					this.isHueBar = false;
					this.isColorMap = false;
				}
			}).on("mouseup mouseout", () => {
				this.mouseStarted = false;
				this.isAlphaBar = false;
				this.isHueBar = false;
				this.isColorMap = false;
			});
		}
		$(".old-color").on("click", (event) => {
			this._restoreToInitial(COLOR_SPACE.RGBAstring2RGBA($(event.target).css("backgroundColor")));
		});
		$(".cur-color").click(() => {
			_this.initialColor = this.currentColor;
			_this.currentColor.a = parseInt($("#alpha").val());
			$(".old-color").css("background-color", "rgba(" + _this.initialColor.r + ", " + _this.initialColor.g + ", " + _this.initialColor.b + ", " + (_this.initialColor.a/100) + ")");
		});

		$("input[name=R], input[name=G], input[name=B], input[name=A]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				v = this.CLAMP(v, 0, 255);
				switch(event.target.name) {
					case "R": this.currentColor.r = v; break;
					case "G": this.currentColor.g = v; break;
					case "B": this.currentColor.b = v; break;
					case "A": this.currentColor.a = $("#alpha").val(); break;
				}
				this.setColor(this.currentColor);
				this.colorChanged(this.currentColor);
			} else {
				this.currentColor.a = $("#alpha").val();
				this.setColor(this.currentColor);
			}
		});

		$("input[name=H], input[name=S], input[name=Br]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				var hsb = COLOR_SPACE.RGBA2HSB(this.currentColor);
				// hsb.s = parseInt((hsb.s / 255 * 100).toFixed(0));
				// hsb.v = parseInt((hsb.v / 255 * 100).toFixed(0));
				v = parseFloat(v);
				switch(event.target.name) {
					case "H": v = this.CLAMP(v, 0, 359); hsb.h = v;					break;
					case "S": v = this.CLAMP(v, 0, 100); hsb.s = (v * 255 / 100);	break;
					case "V": v = this.CLAMP(v, 0, 100); hsb.v = (v * 255 / 100);	break;
				}
				this.currentColor = COLOR_SPACE.HSB2RGBA(hsb);
				this.currentColor.a = $("#alpha").val();
				this.setColor(this.currentColor);
				this.colorChanged(this.currentColor);
			} else {
				this.currentColor.a = $("#alpha").val();
				this.setColor(this.currentColor);
			}
		});

		$("input[name=C], input[name=M], input[name=Y], input[name=K]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				var cmyk = COLOR_SPACE.RGBA2CMYK(this.currentColor);
				switch(event.target.name) {
					case "C": v = this.CLAMP(v, 0, 100); cmyk.c = v; break;
					case "M": v = this.CLAMP(v, 0, 100); cmyk.m = v; break;
					case "Y": v = this.CLAMP(v, 0, 100); cmyk.y = v; break;
					case "K": v = this.CLAMP(v, 0, 100); cmyk.k = v; break;
				}
				this.currentColor = COLOR_SPACE.CMYK2RGBA(cmyk);
				this.currentColor.a = $("#alpha").val();
				this.setColor(this.currentColor);
				this.colorChanged(this.currentColor);
			} else {
				_this.setColor(this.currentColor);
			}
		});

		$("input[name=HEX]").on("change", (event) => {
			let color = COLOR_SPACE.parseColor($(event.target).val());
			color.a = $("#alpha").val();
		}).on("focus", (event) => {
			$(event.target).select();
		}).on("keyup", (event) => {
			if($(event.target).val().length == 6) {
				let color = COLOR_SPACE.parseColor($(event.target).val());
				color.a = $("#alpha").val();
				this.changeColor(color);
			}
		});
	}

	changeColor(color) {
		if(color) {
			this.setColor(color);
			this.colorChanged(color);
		}
	}

	setInitialColor(color) {
		this.initialColor = color;
		$(".old-color").css("backgroundColor", COLOR_SPACE.RGBA2HEX(color));
		this.setColor(color);
	}

	setColor(color) {
		this.currentColor = color;
		if(this.currentColor.a === undefined) {
			this.currentColor.a = this.currentAlpha;
		}
		this.setColorText(this.currentColor);
		this.colorMap.setColor(this.currentColor);
		this.colorBar.setColor(this.currentColor);
	}

	_trackChanging(x, y, canvas) {
		let x1 = this.CLAMP(((x * 255) / canvas.width()), 0, 255),
			y1 = this.CLAMP(((y * 255) / canvas.height()), 0, 255),
			alpha = (this.isAlphaBar) ? Math.round(((canvas.height() - y) / canvas.height()) * 100) : $("#alpha").val();
		if(this.isAlphaBar) {
			this.currentAlpha = alpha;
			this.currentColor.a = this.currentAlpha;
			this.changeColor(this.currentColor);
			$("#alpha").val(this.currentAlpha);
		}

		if(canvas.data("ME") !== undefined) {
			let color = canvas.data("ME").getColor();
			canvas.data("ME").setXY(x1, y1);
			canvas.data("YOU").setColor(color);
			if(color) {
				this.colorChanged(color);
			}
		}
		//
	}

	colorChanged(color) {
		this.currentColor = color;
		if(this.currentColor.a === undefined) {
			this.currentColor.a = parseInt(this.currentAlpha);
		}
		this.setColorText(this.currentColor);

		if(this._isInput()) {
			$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(color));
		} else {
			$(".cur-color").css("background-color", "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + (color.a/100) + ")");
		}

		if(this.onColorChange) {
			this.onColorChange(color, COLOR_SPACE.RGBA2HSB(color));
		}
	}

	alphaChanged(alpha) {
		if(this._isInput()) {
			$(this.targetObject).val(COLOR_SPACE.RGBA2HEX(this.currentColor));
		} else {
			$(".cur-color").css("background-color", "rgba(" + this.currentColor.r + ", " + this.currentColor.g + ", " + this.currentColor.b + ", " + (alpha/100) + ")");
		}

		if(this.onColorChange) {
			this.onColorChange(this.currentColor, COLOR_SPACE.RGBA2HSB(this.currentColor));
		}
	}

	setColorText(color) {
		let hsb = COLOR_SPACE.RGBA2HSB(color),
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

		$(".preview .cur-color").css("background-color", "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + (color.a/100) + ")");
		$(this.targetObject).data("current_color", color);
	}

	getColor() {
		return this.currentColor;
	}

	_buildUI(element) {
		let idext = Math.round(Math.random() * 1000000 * (new Date())),
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

		for(let i = 4; i <= 64; i*=2) {
			options.push(i);
		}
		if(element) {
			e = $(element);
			let w = e.width(),
				h = e.height();
			if(e.css("position") == "relative" || e.css("position") == "absolute") {
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
				$("<div></div>")
					.attr("id", "cp-mask-" + idext)
					.css({
						position: "absolute",
						left: "0px",
						top: "0px",
						width: $(document).width() + "px",
						height: $(document).height() + "px",
						zIndex: 10000,
						opacity: 0.01,
						display: "none"
					}).each(() => {
						cp._mask = $(this);
					}).bind("mousedown", () => {
						cp.hide();
					})
			);
		}
		e.append(
			$("<div>", {
				"class": "canvas-color-picker" + cls,
				"id": "cp-" + idext
			})
			.css(this.css)
			.append(
				$("<div>", {"class": "color-map canvas-container"}).append(
					$("<canvas>", {"class": "colormap"})
				)
			).append(
				$("<div>", {"class": "color-bar canvas-container"}).append(
					$("<canvas>", {"class": "huebar"})
				)
			).append(
				$("<div>", {"class": "alpha-bar canvas-container"}).append(
					$("<canvas>", {"class": "alphabar"})
				)
			).append(
				$("<div>", {"class": "preview"}).append(
					$("<div>", {"class": "cur-color"})
				).append(
					$("<div>", {"class": "old-color"})
				)
			).append(
				$("<div>", {"class": "form"}).append(
					$("<div>", {"class": "hor-div"}).append(
						$("<div>", {"class": "hsb"}).append(
							$("<label>").append("H:").append($("<input>", {"type": "text", "name": "H", "size": "3", "maxlength": "3"})).append("&deg;")
						).append(
							$("<label>").append("S:").append($("<input>", {"type": "text", "name": "S", "size": "3", "maxlength": "3"})).append("%")
						).append(
							$("<label>").append("B:").append($("<input>", {"type": "text", "name": "Br", "size": "3", "maxlength": "3"})).append("%")
						)
					).append(
						$("<div>", {"class": "rgba"}).append(
							$("<label>").append("R:").append($("<input>", {"type": "text", "name": "R", "size": "3", "maxlength": "3"}))
						).append(
							$("<label>").append("G:").append($("<input>", {"type": "text", "name": "G", "size": "3", "maxlength": "3"}))
						).append(
							$("<label>").append("B:").append($("<input>", {"type": "text", "name": "B", "size": "3", "maxlength": "3"}))
						)
					)
					.append(
						$("<div>", {"class": "cmyk"}).append(
							$("<label>").append("C:").append($("<input>", {"type": "text", "name": "C", "size": "3", "maxlength": "3"})).append("%")
						).append(
							$("<label>").append("M:").append($("<input>", {"type": "text", "name": "M", "size": "3", "maxlength": "3"})).append("%")
						).append(
							$("<label>").append("Y:").append($("<input>", {"type": "text", "name": "Y", "size": "3", "maxlength": "3"})).append("%")
						).append(
							$("<label>").append("K:").append($("<input>", {"type": "text", "name": "K", "size": "3", "maxlength": "3"})).append("%")
						)
					)
				).append(
					$("<div>", {"class": "color"}).append(
						$("<label>").append("Alpha:").append($("<input>", {"type": "number", "name": "A", "id": "alpha", "min": "0", "max": "100", "size": "3", "maxlength": "3"}))
					).append(
						$("<label>").append("HEX: #").append($("<input>", {"type": "text", "name": "HEX", "id": "HEX", "size": "6", "maxlength": "6"}))
					)
				).append(
					$("<div>", {"class": "proximity"}).append(
						$("<label>").append("Color distance:").append(
							$("<select>", {"id": "proximity"}).append(
								$.map(options, (v) => {
									return $("<option>", {"value": v, "selected": ((v == 32) ? "selected" : null)}).append(v);
								})
							)
						)
					)
				)
			).each(() => {
				this.element = $(this);
			})
		);
	}

	_showRGBAInput(flag) {
		if(flag) {
			$(".form .rgba").show();
		} else {
			$(".form .rgba").hide();
		}
	}

	_showHSBInput(flag) {
		if(flag) {
			$(".form .hsb").show();
		} else {
			$(".form .hsb").hide();
		}
	}

	_showHEXInput(flag) {
		if(flag) {
			$(".form .color").show();
		} else {
			$(".form .color").hide();
		}
	}

	_showPreviewBox(flag) {
		if(flag) {
			$(".preview").show();
		} else {
			$(".preview").hide();
		}
	}

	getProximity() {
		return $("#proximity").val();
	}

	sizeTo(w, h) {
		// console.error(w, h);
		if(w < 60) { w = 60; }
		if(h < 30) { h = 30; }
		this.element.width(w);
		$(".colormap").width(w).height(h);
		$(".huebar").width(w).height(h);
		$(".alphabar").width(w).height(h);
		if(h < 150) {
			this._showRGBAInput(false)._showHSBInput(false);
		}
		if(h < 100) {
			this.showPreview(false)._showHEXInput(false);
		}
		if(w < 200) {
			this._showRGBAInput(false)._showHSBInput(false).showPreview(false)._showHEXInput(false);
		}
		this._rearrange();
	}

	_rearrange() {
		let w = this.element.width(),
			h = this.element.height();
		if(h < 200) {
			this._showRGBAInput(false);
			this._showHSBInput(false);
		}
		$(".colormap").attr({
			"width": $(".color-map").width(),
			"height": $(".color-map").height()
		});
		$(".huebar").attr("height", $(".color-bar").height());
		$(".colorbar").attr("height", $(".color-bar").height());

		let rgba = $(".form .rgba"),
			hsb = $(".form .hsb"),
			clr = $(".form .color"),
			btns = $(".buttons"),
			preview = $(".preview");

		if(rgba.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none" && btns.css("display") == "none" && preview.css("display") == "none") {
			$(".color-map").css("right", "30px");
			$(".color-bar").css("right", "5px");

			$(".colormap").attr({
				"width": $(".color-map").width(),
				"height": $(".color-map").height()
			});
		}

		if(rgba.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none") {
			$(".form").hide();
		} else {
			$(".form").show();
		}

		if(rgba.css("display") == "none" && hsb.css("display") == "none") {
			$(".buttons").css("height", "50px");
			$(".buttons button").css("width", "110px");
		} else {
			$(".buttons").css("height", "25px");
			$(".buttons button").css("width", "55px");
		}

		this.colorMap.repaint();
		this.colorBar.repaint();
	}
}

export default ColorPicker;
