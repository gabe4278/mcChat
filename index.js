const auth = require("./auth");
const input = require("input");
const fs = require("fs");
const { scanLAN } = require("minecraft-server-util");
const mcData = require("minecraft-data");
var lastLogin = {
	address: null,
	port: null,
	version: null
}

function displayServers() {
	var serverList = JSON.parse(fs.readFileSync(`${__dirname}/servers.json`));
	if (serverList.length == 0) {
		console.log(`You have no servers!`);
		console.log(`To add a server, you can select 'Add a server'. Once you add it, it will appear in the server list.`);
		start();
	}
	else {
		var servers = [];
		for (let i in serverList) servers.push(serverList[i].name);
		servers.push("Back");
		input.select("What server do you want to go on?", servers).then(srvName => {
			if (srvName == "Back") return start();
			for (let i in servers) {
				if (servers[i] == srvName) {
					input.select("What do you want to do with it?", ["Join this server", "Rename this server", "Change server address", "Change server version", "Delete this server", "Go back"]).then(selection => {
						switch (selection) {
							case "Join this server":
								let addr = serverList[i].address.split(":");
								let a = addr[0];
								var p = Number(addr[1]);
								if (Number.isNaN(p)) p = 25565;
								lastLogin.address = a;
								lastLogin.port = p;
								lastLogin.version = serverList[i].version;
								let bot = require("./client")(a, p, serverList[i].version);
								bot.on("end", () => {
									console.log("Disconnected from server.");
									start();
								});
							break;

							case "Rename this server":
								input.text("Enter server name:").then(newName => {
									serverList[i].name = newName;
									fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(serverList));
									displayServers();
								});
							break;

							case "Change server address":
								input.text("Enter server address:").then(newAddress => {
									serverList[i].address = newAddress;
									fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(serverList));
									displayServers();
								});
							break;

							case "Change server version":
								input.text("Enter version (Leave blank for automatic):").then(newVersion => {
									if (newVersion.split("") !== "") {
										if (!mcData(newVersion)) {
											console.error(`Unsupported protocol version: ${newVersion}`);
											return displayServers();
										}
									}
									serverList[i].version = newVersion;
									fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(serverList));
									displayServers();
								});
							break;

							case "Delete this server":
								input.select(`Are you sure you want to delete "${serverList[i].name}"? This will be lost forever (A long time!)`, ["Delete this server", "Cancel"]).then(sel => {
									switch (sel) {
										case "Delete this server":
											var newList = [];
											for (let j in serverList) {
												if (serverList[j].name !== serverList[i].name) {
													newList.push(serverList[j]);
												}
											}
											serverList = newList;
											fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(serverList));
											start();
										break;

										case "Cancel":
											displayServers();
										break;
									}
								});
							break;

							case "Go back":
								displayServers();
							break;
						}
					});
				}
			}
		});
	}
}

function start() {
	if (!fs.existsSync(`${__dirname}/servers.json`)) {
		fs.writeFileSync(`${__dirname}/servers.json`, "[]");
	}

	input.select("What do you want to do?", ["Add a server", "Display server list", "Direct Connection", "Connect from a local network", "Reconnect from previous session", "Exit", "Logout"]).then(sel => {
		if (sel == "Add a server") {
			input.text("Enter server name:").then(name => {
				if (name.trim() == "") {
					console.error("This field is required.");
					return start();
				}
				input.text("Enter server address:").then(address => {
					if (address.trim() == "") {
						console.error("This field is required.");
						return start();
					}
					input.text("Enter version (Leave blank for automatic):").then(version => {
						if (version.trim() !== "") {
							if (!mcData(version)) {
								console.error(`Unsupported protocol version: ${version}`);
								return start();
							}
						}
						var serverList = JSON.parse(fs.readFileSync(`${__dirname}/servers.json`));
						serverList.push({name: name, address: address, version: version});
						fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(serverList));
						start();
					});
				});
			});
		}
		else if (sel == "Display server list") {
			displayServers();
		}
		else if (sel == "Direct Connection") {
			input.text("Enter server address:").then(address => {
				if (address.trim() == "") {
					console.error("This field is required.");
					return start();
				}
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
		else if (sel == "Connect from a local network") {
			console.log("Scanning for Minecraft server instances on your local network connection...");
			scanLAN().then(res => {
				if (res.servers.length == 0) {
					console.log(`There are no Minecraft server instances found on your local network connection.`);
					return start();
				}
				return console.log(`There are Minecraft server instances found on your local network, coming soon!`);
				var localServers = [];
				for (let i in res.servers) {
					// work in progress
				}
				localServers.push("Back");
			})
			.catch(err => console.error(`Couldn't scan for Minecraft server instances: ${err}`));
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
