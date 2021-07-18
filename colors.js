const colors = require("colors");

module.exports = function(color) {
	switch (color) {
		case "black":
		return colors.black;

		case "dark_blue":
		return colors.blue;

		case "dark_green":
		return colors.green;

		case "dark_cyan":
		return colors.cyan;

		case "dark_aqua":
		return colors.cyan;

		case "dark_red":
		return colors.red;

		case "dark_purple":
		return colors.magenta;

		case "gold":
		return colors.yellow;

		case "gray":
		return colors.gray;

		case "dark_gray":
		return colors.gray;

		case "blue":
		return colors.brightBlue;

		case "green":
		return colors.brightGreen;

		case "aqua":
		return colors.brightCyan;

		case "red":
		return colors.brightRed;

		case "light_purple":
		return colors.brightMagenta;

		case "yellow":
		return colors.brightYellow;

		case "white":
		return colors.white;

		default:
		return colors.reset;
	}
}
