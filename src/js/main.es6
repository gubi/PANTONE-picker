/* jshint esversion: 6 */
"strict mode";

import ColorSpace from "../../src/js/ColorSpace.es6";
// import ColorCanvas from "../../src/js/ColorCanvas.es6";
import ColorPicker from "../../src/js/ColorPicker.es6";
import pms from "../../src/js/PANTONE.es6";

var COLOR_SPACE = new ColorSpace(),
	PANTONE = new pms();

$(document).ready(function(){
	var cp = new ColorPicker({
		targetObject: $("#color-picker"),
		flat: true,
		width: 600,
		initialColor: {
			r: 0,
			g: 0,
			b: 0,
			a: "a"
		},
		onColorChange: (rgba, hsb) => {
			let hex = COLOR_SPACE.RGBA2HEX(rgba),
				rgba_value = rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + (rgba.a/100),
				rgba_bg = "rgba(" + rgba_value + ")",
				p = cp.getProximity(),
				m = PANTONE.Match(hex, p),
				l = rgba.r * 0.3 + rgba.g * 0.59 + rgba.b * 0.114,
				inverted_color = "#" + ((l >= 128 || rgba.a < 60) ? COLOR_SPACE.RGBA2HEX({r: 0, g: 0, b: 0, a: 100}) : COLOR_SPACE.RGBA2HEX({r: 255, g: 255, b: 255, a: 100})),
				$table = $("<table>", {
					"border": "0",
					"cellpadding": "0",
					"style": "font-family: arial; font-size: 12px; font-weight: bold"
				});
			$(".cur-color").css({"background-color": rgba_bg});
			$("#matching").html("").append(
				"PANTONE<sup>®</sup> colors similar to HEX color ").append(
				$("<code>", {
					"id": "color_sample",
					"style": "background-color: " + rgba_bg + "; color: " + inverted_color
				}).text("#" + hex)
			).append(
				$("<br />")
			).append("Max color distance: " + p);

			if((m.length) > 0) {
				let ipms = 0;

				for(let i = 0; i < Math.ceil(m.length / 5); i++) {
					let $tr = $("<tr>");
					for(var j = 0; j < 5; j++) {
						let $td = $("<td>");
						if(ipms < m.length) {
							let pantone_code = m[ipms],
								hex_value = PANTONE.PANTONE2HEX(pantone_code),
								rgba = COLOR_SPACE.HEX2RGBA(hex_value),
								cmyk = COLOR_SPACE.RGBA2CMYK(rgba),
								cmyk_value = cmyk.c + ", " + cmyk.m + ", " + cmyk.y + ", " + cmyk.k,
								hsb = COLOR_SPACE.RGBA2HSB(rgba),
								hsb_value = hsb.h + ", " + hsb.s + ", " + hsb.b;

							$td.append(
								$("<a>", {
									"href": "javascript:;",
									"title": "Use this color"
								}).append(
									$("<div>", {
										"class": "pantone-sample",
										"data-rgba": rgba_value,
										"data-cmyk": cmyk_value,
										"data-hex": hex_value,
										"data-hsb": hsb_value,
										"data-alpha": $("#alpha").val(),
										"data-color-code": pantone_code,
										"style": "background-color: #" + hex_value + "; opacity: " + (rgba.a/100)
									})
								).append(
									$("<div>", {
										"class": "pantone-data"
									}).append(
										"PANTONE<span class=\"reg\">&reg;</span><br />" + pantone_code + ((rgba.a < 100) ? "<br /><span class=\"alpha\">Alpha " + $("#alpha").val() + "</span>" : "")
									)
								).on("click", () => {
									$("#HEX").val(hex_value);
									cp.changeColor(COLOR_SPACE.parseColor(rgba));
								})
							);
							ipms = ipms + 1;
						}
						$tr.append($td);
					}
					$table.append($tr);
				}
			}
			$("#PANTONEcolors").html($table);
		}
	});
});
