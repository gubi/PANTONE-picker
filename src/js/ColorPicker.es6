/* jshint esversion: 6 */

import ColorSpace from "./ColorSpace.es6";
import ColorCanvas from "./ColorCanvas.es6";

var COLOR_SPACE = new ColorSpace();

class ColorPicker {
	constructor(options) {
		let settings = {
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
			onColorChange: function(rgb, hsv) {},
			drawColorMapPointer: null,
			drawHueMapPointer: null,
			fnDrawPointer1: true,
			fnDrawPointer2: true
		};
		if(options) {
			$.extend(settings, options);
		}
		Object.assign(this, settings);
		// this.element = this.element.width();

		$(settings.linkedElement).width(settings.width);
		$(settings.linkedElement).height(settings.height);
		// ACTIONS
		if(this.flat) {
			this._buildUI(settings.linkedElement);
		} else {
			this._buildUI();
		}
		$(settings.linkedElement).find("canvas").each((k, item) => {
			let $canvas_container = $(item).closest(".canvas-container"),
				w = $canvas_container.width(),
				h = $canvas_container.height();
			if($canvas_container.hasClass("color-map")) {
				$(item).attr("width", w - 25);
			} else {
				$(item).attr("width", w);
			}
			$(item).attr("height", h);
		});
		this.canvasMap = $(".color-map canvas")[0];
		this.canvasBar = $(".color-bar canvas")[0];
		// ColorMap
		this.colorMap = new ColorCanvas(this.canvasMap, false);
		if(settings.fnDrawPointer1) {
			this.colorMap.drawPointer = settings.fnDrawPointer1;
		}
		// ColorBar
		this.colorBar = new ColorCanvas(this.canvasBar, true);
		if(settings.fnDrawPointer2) {
			this.colorBar.drawPointer = settings.fnDrawPointer2;
		}
		this.setInitialColor(settings.initialColor);
		this._showHEXInput(settings.showColor);
		this._showPreviewBox(settings.showPreview);
		$(this.canvasMap).data({"ME": this.colorMap, "YOU": this.colorBar});
		$(this.canvasBar).data({"YOU": this.colorMap, "ME": this.colorBar});

		this._registerEvent();

		//	 // this.setColor({r: 64, g: 128, b: 128});
		if(this._isInput()) {
			let val = $(this.linkedElement).val();
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
		return (this.linkedElement && this.linkedElement[0].nodeName.toLowerCase() === "input" && $(this.linkedElement).attr("type") === "text");
	}

	CLAMP(c, min, max) {
		min = min || 0; max = max || 255;
		if(c < min) { c = min; }
		if(c > max) { c = max; }
		return Math.round(c);
	}

	_restoreToInitial() {
		// if(this._isInput()) {
		// 	$(this.linkedElement).val(COLOR_SPACE.RGB2HEX(this.initialColor));
		// } else {
		// 	$(".cur-color").css("background-color","rgb(" + this.initialColor.r + "," + this.initialColor.g + "," + this.initialColor.b + ")");
		// }
		this.colorChanged(this.initialColor);
	}

	_registerEvent() {
		let _this = this;
		this.mouseStarted = false;

		if(this._isInput()) {
			$(this.linkedElement).on("focus", () => {
				// _this.show();
			});
		} else {
			$(".canvas-container").on("mousedown", (event) => {
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
				}
			}).on("mouseup mouseout", () => {
				this.mouseStarted = false;
			});
		}
		$(".old-color").on("click", () => {
			this._restoreToInitial();
		});
		$(".cur-color").click(() => {
			this.initialColor = this.currentColor;
			$(".old-color").css("background-color","rgb(" + _this.initialColor.r + "," + _this.initialColor.g + "," + _this.initialColor.b +")");
		});

		$("input[name=R], input[name=G], input[name=B]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				v = this.CLAMP(v, 0, 255);
				switch(event.target.name) {
					case "R": this.currentColor.r = v; break;
					case "G": this.currentColor.g = v; break;
					case "B": this.currentColor.b = v; break;
				}
				this.setColor(this.currentColor);
				this.colorChanged(this.currentColor);
			} else {
				this.setColor(this.currentColor);
			}
		});

		$("input[name=H], input[name=S], input[name=V]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				var hsv = COLOR_SPACE.rgb2hsv(this.currentColor);
				// hsv.s = parseInt((hsv.s / 255 * 100).toFixed(0));
				// hsv.v = parseInt((hsv.v / 255 * 100).toFixed(0));
				v = parseFloat(v);
				switch(event.target.name) {
					case "H": v = this.CLAMP(v, 0, 359); hsv.h = v;					break;
					case "S": v = this.CLAMP(v, 0, 100); hsv.s = (v * 255 / 100);	break;
					case "V": v = this.CLAMP(v, 0, 100); hsv.v = (v * 255 / 100);	break;
				}
				this.currentColor = COLOR_SPACE.hsv2rgb(hsv);
				this.setColor(_this.currentColor);
				this.colorChanged(_this.currentColor);
			} else {
				this.setColor(this.currentColor);
			}
		});

		$("input[name=Y], input[name=M], input[name=C], input[name=K]").on("keyup", (event) => {
			let v = $(event.target).val();
			if(!isNaN(parseFloat(v)) && isFinite(v)) {
				var ymck = COLOR_SPACE.rgb2ymck(this.currentColor);
				switch(event.target.name) {
					case "C": v = this.CLAMP(v, 0, 100); ymck.c = v; break;
					case "M": v = this.CLAMP(v, 0, 100); ymck.m = v; break;
					case "Y": v = this.CLAMP(v, 0, 100); ymck.y = v; break;
					case "K": v = this.CLAMP(v, 0, 100); ymck.k = v; break;
				}
				this.currentColor = COLOR_SPACE.ymck2rgb(ymck);
				this.setColor(this.currentColor);
				this.colorChanged(this.currentColor);
			} else {
				_this.setColor(_this.currentColor);
			}
		});

		$("input[name=HEX]").on("change", (event) => {
			let color = COLOR_SPACE.parseColor($(event.target).val());
		}).on("focus", (event) => {
			$(event.target).select();
		}).on("keyup", (event) => {
			if($(event.target).val().length == 6) {
				let color = COLOR_SPACE.parseColor($(event.target).val());
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
		$(".old-color").css("backgroundColor", COLOR_SPACE.RGB2HEX(color));
		this.setColor(color);
	}

	setColor(color) {
		this.currentColor = color;
		this.setColorText(this.currentColor);
		this.colorMap.setColor(this.currentColor);
		this.colorBar.setColor(this.currentColor);
	}

	_trackChanging(x, y, canvas) {
		let x1 = this.CLAMP(((x * 255) / canvas.width()), 0, 255),
			y1 = this.CLAMP(((y * 255) / canvas.height()), 0, 255);
		canvas.data("ME").setXY(x1, y1);
		//
		let color = canvas.data("ME").getColor();
		canvas.data("YOU").setColor(color);
		//
		if(color) {
			this.colorChanged(color);
		}
	}

	colorChanged(color) {
		this.currentColor = color;
		this.setColorText(color);

		if(this._isInput()) {
			$(this.linkedElement).val(COLOR_SPACE.RGB2HEX(color));
		} else {
			$(".cur-color").css("background-color","rgb(" + color.r + "," + color.g + "," + color.b + ")");
		}

		if(this.onColorChange) {
			this.onColorChange(color,COLOR_SPACE.rgb2hsv(color));
		}
	}

	setColorText(color) {
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

		$(".preview .cur-color").css("background-color","rgb(" + color.r + "," + color.g + "," + color.b + ")");
		$(this.linkedElement).data("current_color",color);
	}

	getColor() {
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
				e.css("position","relative");
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
					.attr("id","cp-mask-" + idext)
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
							$("<label>").append("B:").append($("<input>", {"type": "text", "name": "V", "size": "3", "maxlength": "3"})).append("%")
						)
					).append(
						$("<div>", {"class": "rgb"}).append(
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

	_showRGBInput(flag) {
		if(flag) {
			$(".form .rgb").show();
		} else {
			$(".form .rgb").hide();
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
		if(h < 150) {
			this._showRGBInput(false)._showHSBInput(false);
		}
		if(h < 100) {
			this.showPreview(false)._showHEXInput(false);
		}
		if(w < 200) {
			this._showRGBInput(false)._showHSBInput(false).showPreview(false)._showHEXInput(false);
		}
		this._rearrange();
	}

	_rearrange() {
		let w = this.element.width(),
			h = this.element.height();
		if(h < 200) {
			this._showRGBInput(false);
			this._showHSBInput(false);
		}
		$(".colormap").attr({
			"width": $(".color-map").width(),
			"height": $(".color-map").height()
		});
		$(".huebar").attr("height", $(".color-bar").height());

		let rgb = $(".form .rgb"),
			hsb = $(".form .hsb"),
			clr = $(".form .color"),
			btns = $(".buttons"),
			preview = $(".preview");

		if(rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none" && btns.css("display") == "none" && preview.css("display") == "none") {
			$(".color-map").css("right", "30px");
			$(".color-bar").css("right", "5px");

			$(".colormap").attr({
				"width": $(".color-map").width(),
				"height": $(".color-map").height()
			});
		}

		if(rgb.css("display") == "none" && hsb.css("display") == "none" && clr.css("display") == "none") {
			$(".form").hide();
		} else {
			$(".form").show();
		}

		if(rgb.css("display") == "none" && hsb.css("display") == "none") {
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
