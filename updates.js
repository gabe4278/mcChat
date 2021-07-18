const fetch = require("node-fetch").default;
const version = "v1.1.3"; // Don't change this

fetch(`https://api.github.com/repos/gabe4278/mcChat/releases`)
.then(res => res.json())
.then(resJson => {
	if (resJson[0].tag_name !== version) {
		console.log("A new update is currently available.");
		console.log(`Current version: ${version}`);
		console.log(`New version: ${resJson[0].tag_name}\n`);
	}
	require("./index");
})
.catch(() => {
	console.warn("Unable to check for updates.");
	require("./index");
});
