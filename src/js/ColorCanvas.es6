/* jshint esversion: 6 */

import ColorSpace from "./ColorSpace.es6";

var COLOR_SPACE = new ColorSpace();

class ColorCanvas {
	/**
	 * Class constructor
	 * @param  object 							canvas   						The canvas object
	 * @param  bool 							hueBar							Render the hue bar?
	 * @param  bool 							alphaBar 						Render the alpha bar?
	 */
	constructor(canvas, hueBar, alphaBar) {
		this.newImage = true;
		this.maxX = 255;
		this.maxY = 255;

		this.selX = 128; /* value range 0 - 255 */
		this.selY = 128; /* value range 0 - 255 */
		this.selZ = 1.0;

		this.hueBar = hueBar;
		this.alphaBar = alphaBar;
		this.image = canvas; //canvas
		this.ImageData = null;
		this.paint();
	}

	/**
	 * Generate color palette
	 */
	paint() {
		let w = this.image.width,
			h = this.image.height;

		if(w === 0 || h === 0){ return; }

		let x = Math.round((this.selX * w) / this.maxX),
			y = Math.round((this.selY * h) / this.maxY);

		if(this.newImage || !this.image) {
			this.makeImage(this.selZ, w, h);
		}
		let ctx = this.image.getContext("2d"),
			color = this.getColor(),
			l = color.r * 0.3 + color.g * 0.59 + color.b * 0.114;
		if(!this.alphaBar) {
			ctx.putImageData(this.ImageData, 0, 0);
		} else {
			this._makeAlphaMap(ctx, w, h);
		}
		// Draw the pointer
		this.drawCursor(ctx, w, h, x, y, l, this.hueBar);
	}

	/**
	 * Draw the cursor pointer
	 * @param  object							ctx								The canvas object
	 * @param  integer							w								The image width
	 * @param  integer							h								The image height
	 * @param  integer							x								The image x position
	 * @param  integer							y								The image y position
	 * @param  {[type]}  l        [description]
	 * @param  bool 							isHueBar						This is the hue bar? Default false
	 */
	drawCursor(ctx, w, h, x, y, l, isHueBar) {
		let radius = 9,
			color;

		ctx.beginPath();
		ctx.lineWidth = 1;
		color = (l < 128) ? {r: 255, g: 255, b: 255} : {r: 0, g: 0, b: 0};
		ctx.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0.35)";
		ctx.arc(x + 0.5, y + 0.5, radius, 0, Math.PI * 2, true);
		// ctx.moveTo(x - radius + 0.5, y + 0.5);
		// ctx.lineTo(x + radius + 0.5, y + 0.5);
		// ctx.moveTo(x + 0.5, y - radius + 0.5);
		// ctx.lineTo(x + 0.5, y + radius + 0.5);
		ctx.lineWidth = 3.5;
		ctx.stroke();
	}

	/**
	 * Make the image
	 * @param  float 							b								The brightness point
	 * @param  integer							w								The image width
	 * @param  integer							h								The image height
	 */
	makeImage(b, w, h) {
		if(!this.image) {
			this.image = document.createElement("canvas");
			this.image.width = w;
			this.image.height = h;
		}

		let imgData;
		if(this.alphaBar) {
			// this._makeAlphaMap(b, w, h);
		} else {
			if(this.hueBar) {
				imgData = this._makeHueMap(w, h);
			} else {
				imgData = this._makeColorMap(b, w, h);
			}

			this.newImage = false;
			this.image.getContext("2d").putImageData(imgData, 0, 0);
			this.ImageData = imgData;
		}
	}

	/**
	 * Generate the color map image
	 * @param  float 							b								The brightness point
	 * @param  integer							w								The image width
	 * @param  integer							h								The image height
	 * @return object							imgData							An object with image data to renderize
	 */
	_makeColorMap(b, w, h) {
		let imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			index = 0,
			hue = 0.0,
			saturation = 0.0,
			brightness = 0.0,
			x, y;
		hue = (b - Math.floor(b)) * 360;

		for(y = 0; y < h; y++) {
			brightness = 1 - y / h;
			for(x = 0; x < w; x++) {
				saturation = x / w;
				let rgba = COLOR_SPACE.HSB2RGBA(hue, saturation * 255, brightness * 255);
				//rgba = COLOR_SPACE.getWebSafeColor(rgba);
				imgData.data[index++] = rgba.r;
				imgData.data[index++] = rgba.g;
				imgData.data[index++] = rgba.b;
				imgData.data[index++] = 255;
			}
		}
		return imgData;
	}

	/**
	 * Generate the hue map image
	 * @param  integer							w								The image width
	 * @param  integer							h								The image height
	 * @return object							imgData							An object with image data to renderize
	 */
	_makeHueMap(w, h) {
		let imgData = this.image.getContext("2d").getImageData(0, 0, w, h),
			index = 0,
			hue = 0.0,
			saturation = 1,
			x, y;

		for(y = h-1; y >= 0; y--){
			hue = y / h;
			hue = (hue - Math.floor(hue)) * 360;

			for(x = 0; x < w; x++){
				let brightness = 1 - x / w,
					rgba = COLOR_SPACE.HSB2RGBA(hue, saturation * 255, brightness * 255);
				//rgba = COLOR_SPACE.getWebSafeColor(rgba);
				imgData.data[index++] = rgba.r;
				imgData.data[index++] = rgba.g;
				imgData.data[index++] = rgba.b;
				imgData.data[index++] = 255;
			}
		}
		return imgData;
	}

	/**
	 * Generate the alpha map image
	 * @param  integer							w								The image width
	 * @param  integer							h								The image height
	 * @return {[type]}   [description]
	 */
	_makeAlphaMap(ctx, w, h) {
		let canvas = $(this.image),
			alpha = ctx.createLinearGradient(0, 0, 0, h*4),
			radius = 9,
			x = w/2,
			y = h/2;
		this.mouseStarted = false;

		alpha.addColorStop(0, "rgba(255, 255, 255, 1)");
		alpha.addColorStop(1, "rgba(255, 255, 255, 0)");

		ctx.fillStyle = alpha;
		ctx.fillRect(0, 0, w, h);


		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
		// ctx.arc(w/2, h/2, radius, 0, Math.PI * 2, true);
		// ctx.arc(0, y + 0.5, radius, 0, Math.PI * 2, true);
		canvas.on("mousedown", (event) => {
			this.mouseStarted = true;
		}).on("mousemove", (event) => {
			if(this.mouseStarted) {
				let canvas = $(this.image);
				// console.log(y);
				y = event.clientY;
				// y = Math.round(((canvas.height() - event.clientY) / canvas.height()) * 100);
				// console.log(Math.round(((canvas.height() - y) / canvas.height()) * 100));
				// console.log(this.image, ctx);
			}
		}).on("mouseup mouseout", (event) => {
			this.mouseStarted = false;
		});
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		radius += 2;
		// ctx.moveTo(x - radius + 0.5, y + 0.5);
		// ctx.lineTo(x + radius + 0.5, y + 0.5);
		// ctx.moveTo(x + 0.5, y - radius + 0.5);
		// ctx.lineTo(x + 0.5, y + radius + 0.5);
		ctx.lineWidth = 6;
		ctx.stroke();
		// 		let mouseY = e.clientY;
		// 		console.log(mouseY, y);
		// 	}, false);
		// };
	}

	/**
	 * Set the X and Y pointer position
	 * @param integer							x								The cursor x position
	 * @param integer							y								The cursor y position
	 */
	setXY(x, y) {
		this.selX = x;
		this.selY = y;
		this.paint();
	}

	/**
	 * Set the colour
	 * @param  object							c								The RGBA colour object
	 */
	setColor(c) {
		let hsb = COLOR_SPACE.RGBA2HSB(c.r, c.g, c.b);
		if(this.hueBar) {
			this.selZ = hsb.s / 255;
			this.setXY((255 - hsb.b), (255 - (hsb.h / 360) * 255));
		} else {
			this.selZ = hsb.h / 360;
			this.setXY(hsb.s, (255 - hsb.b));
		}
		this.repaint();
	}

	/**
	 * Get RGBA colours from HUE values
	 * @return object															The RGBA colour object
	 */
	getColor() {
		let h = (this.hueBar) ? 1 - this.selY/255 : this.selZ,
			s = (this.hueBar) ? 255 : this.selX,
			b = (this.hueBar) ? this.selX : this.selY;
		h = (h - Math.floor(h)) * 360;
		return COLOR_SPACE.HSB2RGBA(h, s, 255 - b);
	}

	/**
	 * Repaint the platform images
	 */
	repaint() {
		this.newImage = true;
		this.paint();
	}
}

export default ColorCanvas;
