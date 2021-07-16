const readline = require("readline");
const prefix = ".";
const baritonePrefix = "#";
const colors = require("colors");
const { writer } = require("repl");

module.exports = function(bot) {
	require("./baritone")(bot);
	bot.commands = {};
	bot.commandPrefix = prefix;

	let cLog = console.log;
	let cError = console.error;

	let interface = readline.createInterface(process.stdin, process.stdout);

	global.console.log = function (data, type) {
		if (!type) type = "Main";
		let date = new Date();
		var time = date.getHours().toString();
		if (date.getMinutes().toString().length == 1) time += `:0${date.getMinutes()}`;
		else time += `:${date.getMinutes()}`;
		interface.pause();
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`[${time}] [${type}] ${data}` + "\n" + interface.line);
		process.stdout.cursorTo(interface.cursor);
		interface.resume();
	};

	global.console.error = function (data, type) {
		if (!type) type = "Main";
		let date = new Date();
		var time = date.getHours().toString();
		if (date.getMinutes().toString().length == 1) time += `:0${date.getMinutes()}`;
		else time += `:${date.getMinutes()}`;
		interface.pause();
		process.stderr.clearLine();
		process.stderr.cursorTo(0);
		process.stderr.write(`[${time}] [${type}] ${data}` + "\n" + interface.line);
		process.stderr.cursorTo(interface.cursor);
		interface.resume();
	}

	bot.registerCommand = function (command, description, usage, cb) {
		bot.commands[command] = {
			description: description,
			usage: usage,
			callback: cb
		};
	};

	function inp () {
		interface.question("", data => {
			process.stdout.moveCursor(0, -1);
			process.stdout.clearLine();
			if (data.startsWith(baritonePrefix)) {
				// coming soon
			}
			else if (data.startsWith(prefix)) {
				let args = data.slice(prefix.length).trim().split(" ");
				let command = args.shift().toLowerCase();
				if (bot.commands[command]) {
					try {
						bot.commands[command].callback(args);
					}
					catch (e) {
						console.error(colors.red("An internal error has occurred whilst executing this command"));
						console.error(e);
					}
					return inp();
				}
				else console.log(`Unknown command. Type "${prefix}help" for a list of available commands.`);
			}
			else bot.chat(data);
			inp();
		});
	};

	bot.on("error", err => {
		console.error(colors.red(`An error has occurred: ${err}`));
	});

	bot.on("end", () => {
		global.console.log = cLog;
		global.console.error = cError;
		interface.close();
	});

	bot.on("login", inp);

	bot.registerCommand("help", "Shows the help menu.", "help", () => {
		for (let i in bot.commands) {
			console.log(`${prefix}${bot.commands[i].usage} - ${bot.commands[i].description}`);
		}
	});

	bot.registerCommand("say", "Sends a chat message", "say <message...>", args => {
		if (args.length == 0) return console.log(colors.red(`Usage: ${prefix}say <message...>`));
		bot.chat(args.join(" "));
	});

	bot.registerCommand("coords", "Gets the coordinates of an entity.", "coords", () => {
		let coords = {
			x: Math.floor(bot.entity.position.x),
			y: Math.floor(bot.entity.position.y),
			z: Math.floor(bot.entity.position.z)
		}
		console.log(`Current coords: x:${coords.x} y:${coords.y} z:${coords.z}`);
	});

	bot.registerCommand("forward", "Makes an entity go forward.", "forward <ms>", args => {
		if (Number.isNaN(Number(args[0]))) return console.error("Expected number");
		console.log("Started moving forward");
		bot.setControlState("forward", true);
		setTimeout(() => {
			console.log("Finished moving forward");
			bot.setControlState("forward", false);
		}, parseInt(args[0]))
	});

	bot.registerCommand("back", "Makes an entity go back.", "back <ms>", args => {
		if (Number.isNaN(Number(args[0]))) return console.error("Expected number");
		console.log("Started moving back");
		bot.setControlState("back", true);
		setTimeout(() => {
			console.log("Finished moving back");
			bot.setControlState("back", false);
		}, parseInt(args[0]))
	});

	bot.registerCommand("left", "Makes an entity go left.", "left <ms>", args => {
		if (Number.isNaN(Number(args[0]))) return console.error("Expected number");
		console.log("Started moving left");
		bot.setControlState("left", true);
		setTimeout(() => {
			console.log("Finished moving left");
			bot.setControlState("left", false);
		}, parseInt(args[0]))
	});

	bot.registerCommand("right", "Makes an entity go right.", "right <ms>", args => {
		if (Number.isNaN(Number(args[0]))) return console.error("Expected number");
		console.log("Started moving right");
		bot.setControlState("right", true);
		setTimeout(() => {
			console.log("Finished moving right");
			bot.setControlState("right", false);
		}, parseInt(args[0]))
	});

	bot.registerCommand("jump", "Makes an entity jump.", "jump <ms>", args => {
		if (Number.isNaN(Number(args[0]))) return console.error("Expected number");
		console.log("Started jumping");
		bot.setControlState("jump", true);
		setTimeout(() => {
			console.log("Finished jumping");
			bot.setControlState("jump", false);
		}, parseInt(args[0]))
	});

	bot.registerCommand("togglesprint", "Toggles sprinting.", "togglesprint", () => {
		if (bot.getControlState("sprint")) {
			bot.setControlState("sprint", false);
			console.log("Sprinting disabled.");
		}
		else {
			bot.setControlState("sprint", true);
			console.log("Sprinting enabled.");
		}
	});

	bot.registerCommand("eval", "Evaluates a JavaScript code.", "eval <code...>", args => {
		try {
			let x = eval(args.join(" "));
			console.log(writer(x), "Evaluation thread");
		}
		catch (e) {
			console.error(e, "Evaluation thread");
		}
	});

	bot.registerCommand("list", "Gets the player list.", "list", () => {
		console.log(`There are ${Object.entries(bot.players).length} players online`);
		var players = [];
		for (let i in bot.players) players.push(bot.players[i].username);
		console.log(players.join(", "));
	});

	bot.registerCommand("disconnect", "Disconnects to the server.", "disconnect", () => {
		bot.end();
	});
}
