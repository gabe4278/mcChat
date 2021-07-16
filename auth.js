const yggdrasil = require("yggdrasil")();
const xboxAuth = require("@xboxreplay/xboxlive-auth");
const fs = require("fs");
const { EventEmitter } = require("events");
const event = new EventEmitter();
const input = require("input");

function requestLogin() {
	input.select("Enter login method:", ["Microsoft", "Mojang", "Cracked", "Exit"]).then(loginMethod => {
		if (loginMethod == "Microsoft") {
			input.text("Enter E-mail address, phone number, or Skype username:").then(username => {
				if (username.trim() == "") return console.error("This field is required");
				input.password("Password:").then(password => {
					if (password.trim() == "") return console.error("This field is required");
					console.log(`Attempting to login with valid creditionals...`);
					xboxAuth.authenticate(username, password)
					.then(res => {
						console.log("Successfully logged in");
						event.emit("login");
					})
					.catch(err => {
						console.error(`Login falied: ${err.message}`);
						requestLogin();
					});
				});
			});
		}
		else if (loginMethod == "Mojang") {
			input.text("E-mail address or Username:").then(username => {
				if (username.trim() == "") return console.error("This field is required");
				input.password("Password:").then(password => {
					if (password.trim() == "") return console.error("This field is required");
					console.log(`Attempting to login with valid creditionals...`);
					yggdrasil.auth({
						user: username,
						pass: password
					})
					.then(user => {
						console.log(`Welcome, ${user.selectedProfile.name}`);
						fs.writeFileSync(`${__dirname}/creditionals.json`, JSON.stringify({username: username, password: password}));
						event.emit("login");
					})
					.catch(err => {
						console.error(`Login failed: ${err.message}`);
						requestLogin();
					});
				});
			});
		}
		else if (loginMethod == "Cracked") {
			input.text("Enter username:").then(username => {
				fs.writeFileSync(`${__dirname}/creditionals.json`, JSON.stringify({username: username}));
				console.log(`Welcome, ${username}`);
				event.emit("login");
			});
		}
		else if (loginMethod == "Exit") process.exit();
	});
}

if (!fs.existsSync(`${__dirname}/creditionals.json`)) requestLogin();
else {
	let user = require(`${__dirname}/creditionals.json`);
	if (user.password) yggdrasil.auth({user: user.username, pass: user.password}).then(usr => {
		console.log(`Welcome back, ${usr.selectedProfile.name}`);
		event.emit("login");
	}).catch(err => {
		console.log("Your creditionals have been changed, log in again");
		requestLogin();
	});
	else setTimeout(() => {
		console.log(`Welcome back, ${user.username}`);
		event.emit("login");
	}, 500);
}

event.on("requestLogin", requestLogin);

module.exports = event;
