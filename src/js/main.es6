/* jshint esversion: 6 */
"strict mode";

import ColorSpace from "../../src/js/ColorSpace.es6";
// import ColorCanvas from "../../src/js/ColorCanvas.es6";
import ColorPicker from "../../src/js/ColorPicker.es6";
import pms from "../../src/js/PMS.es6";

var COLOR_SPACE = new ColorSpace(),
	PMS = new pms();

$(document).ready(function(){
	var cp = new ColorPicker({
		linkedElement: $("#color-picker"),
		flat: true,
		width: 600,
		initialColor: {
			r: 0,
			g: 0,
			b: 0
		},
		onColorChange: (rgb, hsb) => {
			let hex = COLOR_SPACE.RGB2HEX(rgb),
				cmyk = COLOR_SPACE.rgb2ymck(rgb),
				p = cp.getProximity(),
				m = PMS.PMSColorMatching(hex, p),
				l = rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.114,
				inverted_color = "#" + ((l < 128) ? COLOR_SPACE.RGB2HEX({r: 255, g: 255, b: 255}) : COLOR_SPACE.RGB2HEX({r: 0, g: 0, b: 0})),
				$table = $("<table>", {
					"border": "0",
					"cellpadding": "0",
					"style": "font-family: arial; font-size: 12px; font-weight: bold"
				});

			$("#matching").html("").append("PANTONE<sup>®</sup> colors close to RGB color ").append(
				$("<code>", {
					"id": "color_sample",
					"style": "background-color: #" + hex + "; color: " + inverted_color
				}).text("#" + hex)
			).append(
				$("<br />")
			).append("Max color distance: " + p);
			if((m.length) > 0) {
				let ipms = 0;

				for(let i = 0; i < Math.ceil(m.length / 5); i++) {
					let $tr = $("<tr>", {"align": "center"});
					for(var j = 0; j < 5; j++) {
						let $td = $("<td>");
						if(ipms < m.length) {
							let rgbcode = PMS.PMS2RGB(m[ipms]).toLowerCase();
							$td.append(
								$("<a>", {
									"href": "javascript:;",
									"title": "Use this color"
								}).append(m[ipms]).append(
									$("<div>", {
										"style": "background-color: #" + rgbcode + ";"
									})
								).on("click", () => {
									$("#HEX").val(rgbcode);
									cp.changeColor(COLOR_SPACE.parseColor(rgbcode));
								})
							);
							ipms = ipms + 1;
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
