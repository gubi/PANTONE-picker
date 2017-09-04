/* jshint esversion: 6 */

import ColorSpace from "./ColorSpace.es6";

var COLOR_SPACE = new ColorSpace();

class ColorCanvas {
	constructor(canvas, hueBar) {
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

	paint() {
		let w = this.image.width,
			h = this.image.height;
		if(w === 0 || h === 0){
			return;
		}

		var x = Math.round((this.selX * w) / this.maxX);
		var y = Math.round((this.selY * h) / this.maxY);

		if (this.newImage || !this.image){
			this.makeImage(this.selZ, w, h);
		}
		let ctx = this.image.getContext("2d");
		ctx.putImageData(this.ImageData, 0, 0);

		let color = this.getColor(),
			l = color.r * 0.3 + color.g * 0.59 + color.b * 0.114;

		if(this.drawPointer) {
			this.drawDefaultPointer(ctx, w, h, x, y, l);
		} else {
			this.drawDefaultPointer(ctx, w, h, x, y, l);
		}
	}

	drawDefaultPointer(ctx, w, h, x, y, l, isHueBar) {
		let radius = 6, color;
		ctx.beginPath();
		ctx.lineWidth = 1;
		color = (l < 128) ? {r: 255, g: 255, b: 255} : {r: 0, g: 0, b: 0};
		ctx.strokeStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
		ctx.arc(x + 0.5, y + 0.5, radius, 0, Math.PI * 2, true);
		radius += 2;
		// ctx.moveTo(x - radius + 0.5, y + 0.5);
		// ctx.lineTo(x + radius + 0.5, y + 0.5);
		// ctx.moveTo(x + 0.5, y - radius + 0.5);
		// ctx.lineTo(x + 0.5, y + radius + 0.5);
		ctx.stroke();
	}

	makeImage(b, w, h) {
		if (!this.image) {
			this.image = document.createElement("canvas");
			this.image.width = w;
			this.image.height = h;
		}

		let imgData;
		if(this.hueBar) {
			imgData = this._makeHueMap(b, w, h);
		} else {
			imgData = this._makeColorMap(b, w, h);
		}

		this.newImage = false;
		this.image.getContext("2d").putImageData(imgData, 0, 0);
		this.ImageData = imgData;
	}

	_makeColorMap(b, w, h) {
		let imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			index = 0,
			hue = 0.0,
			sat = 0.0,
			bri = 0.0,
			x, y;
		hue = (b - Math.floor(b)) * 360;

		for(y = 0; y < h; y++) {
			bri = 1 - y / h;
			for(x = 0; x < w; x++) {
				sat = x / w;
				let rgb = COLOR_SPACE.hsb2rgb(hue, sat * 255, bri * 255);
				//rgb = COLOR_SPACE.getWebSafeColor(rgb);
				imgData.data[index++] = rgb.r;
				imgData.data[index++] = rgb.g;
				imgData.data[index++] = rgb.b;
				imgData.data[index++] = 255;
			}
		}
		return imgData;
	}

	_makeHueMap(b, w, h) {
		let imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			index = 0,
			hue = 0.0,
			sat = 1,
			x, y;

		for(y = h-1; y >= 0; y--){
			hue = y / h;
			hue = (hue - Math.floor(hue)) * 360;

			for(x = 0; x < w; x++){
				let bri = 1 - x / w,
					rgb = COLOR_SPACE.hsb2rgb(hue, sat * 255, bri * 255);
				//rgb = COLOR_SPACE.getWebSafeColor(rgb);
				imgData.data[index++] = rgb.r;
				imgData.data[index++] = rgb.g;
				imgData.data[index++] = rgb.b;
				imgData.data[index++] = 255;
			}
		}
		return imgData;
	}

	setXY(x, y) {
		this.selX = x; this.selY = y;
		this.paint();
	}

	setColor(c) {
		let hsb = COLOR_SPACE.rgb2hsb(c.r, c.g, c.b);
		if(this.hueBar) {
			this.selZ = hsb.s / 255;
			this.setXY(255 - hsb.v, 255 - (hsb.h/360) * 255);
		} else {
			this.selZ = hsb.h / 360;
			this.setXY(hsb.s,255 - hsb.v);
		}
		this.repaint();
	}

	getColor() {
		let h = (this.hueBar) ? 1 - this.selY/255 : this.selZ,
			s = (this.hueBar) ? 255 : this.selX,
			v = (this.hueBar) ? this.selX : this.selY;
		h = (h - Math.floor(h)) * 360;
		return COLOR_SPACE.hsb2rgb(h, s, 255 - v);
	}

	repaint() {
		this.newImage = true;
		this.paint();
	}
}

export default ColorCanvas;
