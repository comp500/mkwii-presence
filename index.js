// CHANGE THESE
const playerID = 0;
const discordID = "";

// MAYBE CHANGE THIS
const updateTime = 5; // in seconds

// DON'T CHANGE BELOW HERE
const request = require("request");
const url = `https://wiimmfi.de/mkw/room/p${playerID}?m=json`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: 'ipc'
});
const fs = require("fs");

rpc.login(discordID).catch(console.error);

let cached = null;
let pointsBegin = 0;

let getData = () => {
	request(url, (err, data) => {
		let parsed = JSON.parse(data.body);
		if (!parsed || !parsed[1] || !parsed[1].members) {
			if (cached) {
				parsed = cached;
				console.log("Data is null, using cache");

				let user = parsed[1].members.find((userTest) => {
					return userTest.pid == playerID;
				});
				if (!user) throw new Error("Cannot find user!");
				//let points = user.rk == "bt" ? user.eb : user.ev;

				rpc.setActivity({
					details: `${user.names[0]} (${user.fc})`,
					state: `In lobby`,
					largeImageKey: "mkwii_large",
					largeImageText: "Mario Kart Wii",
					smallImageKey: "wiimmfi_small",
					smallImageText: `Wiimmfi (${user.region})`,
					instance: false
				});
			} else {
				console.log("Data is null, no cache available");

				rpc.setActivity({
					details: `Wiimmfi`,
					state: `In lobby`,
					largeImageKey: "mkwii_large",
					largeImageText: "Mario Kart Wii",
					smallImageKey: "wiimmfi_small",
					smallImageText: `Wiimmfi`,
					instance: false
				});
			}
		} else {
			let user = parsed[1].members.find((userTest) => {
				return userTest.pid == playerID;
			});
	
			if (!user) throw new Error("Cannot find user!");
	
			// Write to cache
			fs.writeFile("./cache.json", JSON.stringify(parsed), (err) => {
				if (err) {
					console.error(err);
				} else {
					console.log("Saved to cache");
				}
			});

			let points = user.rk == "bt" ? user.eb : user.ev;
			let pointsAcr = user.rk == "bt" ? "BR" : "VR";
			let raceStart = new Date((parsed[1].race_start + 2) * 1000);
			let pointsDiscr = 0;

			// Work out point discrepancy
			if (pointsBegin == 0) {
				pointsBegin = points;
			} else {
				pointsDiscr = points - pointsBegin;
			}
	
			rpc.setActivity({
				details: `${user.names[0]} (${user.fc})`,
				state: `${points} ${pointsAcr} (${pointsDiscr})`,
				startTimestamp: raceStart,
				largeImageKey: "mkwii_large",
				largeImageText: "Mario Kart Wii",
				smallImageKey: "wiimmfi_small",
				smallImageText: `Wiimmfi (${user.region})`,
				instance: false
			});
		}

		console.log("Updated activity!");
	});
};

rpc.on('ready', () => {
	console.log(`Connected to discord with id ${discordID}`);
	getData();

	setInterval(getData, 1000 * updateTime);
});

fs.readFile("./cache.json", (err, data) => {
	if (err) return;
	if (data && cached == null) {
		cached = JSON.parse(data);
	}
});
