const fetch = require("node-fetch").default;
const version = "v1.0.0"

fetch(`https://api.github.com/repos/gabe4278/mcChat/releases`)
.then(res => res.json())
.then(resJson => {
	if (resJson.tag_name !== version) {
		console.log("A new update is available.");
		console.log(`Current version: ${version}`);
		console.log(`New version: ${resJson.tag_name}`);
	}
})
.catch(() => {
	console.warn("Unable to check for updates.");
});
