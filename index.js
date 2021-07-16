require("./updates") // Check for updates
const auth = require("./auth");
const input = require("input");
const fs = require("fs");
var lastLogin = {
	address: null,
	port: null,
	version: null
}

function start() {
	input.select("What do you want to do?", ["Join a server", "Reconnect from previous session", "Exit", "Logout"]).then(sel => {
		if (sel == "Join a server") {
			input.text("Enter server address:").then(address => {
				input.text("Enter version (Leave blank for automatic):").then(version => {
					let addr = address.split(":");
					let a = addr[0];
					var p = Number(addr[1]);
					if (Number.isNaN(p)) p = 25565;
					lastLogin.address = a;
					lastLogin.port = p;
					lastLogin.version = version;
					let bot = require("./client")(a, p, version);
					bot.on("end", () => {
						console.log("Disconnected from server.");
						start();
					});
				});
			});
		}
		else if (sel == "Reconnect from previous session") {
			if (lastLogin.address && lastLogin.port) {
				let bot = require("./client")(lastLogin.address, lastLogin.port, lastLogin.version);
				bot.on("end", start);
			}
			else {
				console.log("You have not yet disconnected from the previous session.");
				start();
			}
		}
		else if (sel == "Exit") process.exit();
		else if (sel == "Logout") {
			fs.unlinkSync(`${__dirname}/creditionals.json`);
			console.log("You have logged out of your account.");
			auth.emit("requestLogin");
		}
	});
};

auth.on("login", start);
