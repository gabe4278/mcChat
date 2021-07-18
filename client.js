const mineflayer = require("mineflayer");
const getColor = require("./colors");
const colors = require("colors");
const fs = require("fs");

module.exports = function (host, port, version) {
	let creditionals = JSON.parse(fs.readFileSync(`${__dirname}/creditionals.json`));

	let bot = mineflayer.createBot({
		host: host,
		port: port,
		version: version,
		username: creditionals.username,
		password: creditionals.password,
		auth: creditionals.auth
	});

	const parser = require("minecraft-protocol-chat-parser")(bot.protocolVersion);
	const mcData = require("minecraft-data")(bot.version);

	require("./commands")(bot);

	bot.on("message", jsonMsg => {
		var text = "";
		function compress (extra) {
			for (let i in extra) {
				text += getColor(extra[i].color)(extra[i].text);
				if (extra[i].extra) compress(extra[i].extra);
			}
		};
		if (jsonMsg.text && jsonMsg.text.includes("\u00A7")) compress([parser.parseString(jsonMsg.text)]);
		else compress([jsonMsg]);
		if (text.includes("\u00A7")) {
			let txt = text;
			text = "";
			compress([parser.parseString(txt)]);
		}
		console.log(text, "Chat");
	});

	bot.on("kicked", reason => {
		var text = "";
		function compress (extra) {
			for (let i in extra) {
				text += getColor(extra[i].color)(extra[i].text);
				if (extra[i].extra) compress(extra[i].extra);
			}
		}
		let jsonMsg = JSON.parse(reason);
		if (jsonMsg.text && jsonMsg.text.includes("\u00A7")) compress([parser.parseString(jsonMsg.text)]);
		else compress([jsonMsg]);
		console.log(text, "Kicked message");
	});

	bot.on("error", err => console.error(colors.red(`An error has occurred: ${err}`)));

	bot.once("login", () => {
		console.log("Connected to server.");
	});

	return bot;
};
