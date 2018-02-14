// CHANGE THESE
const playerID = 0;
const discordID = "";

// MAYBE CHANGE THIS
const updateTime = 20; // in seconds

// DON'T CHANGE BELOW HERE
const request = require("request");
const url = `https://wiimmfi.de/mkw/room/p${playerID}?m=json`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: "ipc"
});
const fs = require("fs");

rpc.login(discordID).catch(console.error);

let cached = null;
let pointsBegin = 0;
let pointsPrevious = 0;
let endMatch = false;
let previousTime = 0;

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
				// let points = user.rk == "bt" ? user.eb : user.ev;

				rpc.setActivity({
					details: `${user.names[0]} (${user.fc})`,
					state: `In lobby`,
					largeImageKey: "mkwii_large",
					largeImageText: "Mario Kart Wii",
					smallImageKey: "wiimmfi_small",
					smallImageText: `Wiimmfi`,
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
			fs.writeFile("./cache.json", JSON.stringify(parsed), (err2) => {
				if (err2) {
					console.error(err2);
				} else {
					console.log("Saved to cache");
				}
			});

			let points = user.rk == "bt" ? user.eb : user.ev;
			let pointsAcr = user.rk == "bt" ? "BR" : "VR";
			let raceStart = new Date((parsed[1].race_start + 2) * 1000);
			let pointsDiscr = 0;

			let gameRegion = user.rk;
			let regionSplit = gameRegion.split("_");
			let regionNumber = regionSplit.length > 1 ? parseInt(regionSplit[1]) : null;
			if (regionSplit[0] == "vs") {
				if (regionSplit.length < 2) {
					gameRegion = "Worldwide VS Race";
				} else {
					if (regionNumber <= 6) {
						gameRegion = [
							"Japanese VS Race",
							"North American VS Race",
							"European VS Race",
							"Australian VS Race",
							"Taiwanese VS Race",
							"Korean VS Race",
							"Chinese VS Race"
						][regionNumber];
					} else {
						if (regionNumber >= 22 && regionNumber <= 59) {
							gameRegion = "CT Worldwide";
						}
					}
				}
			} else if (regionSplit[0] == "bt") {
				if (regionSplit.length < 2) {
					gameRegion = "Worldwide Battle";
				} else {
					if (regionNumber <= 6) {
						gameRegion = [
							"Japanese Battle",
							"North American Battle",
							"European Battle",
							"Australian Battle",
							"Taiwanese Battle",
							"Korean Battle",
							"Chinese Battle"
						][regionNumber];
					}
				}
			} else if (regionSplit[0] == "cd") {
				if (regionSplit.length > 1 && regionNumber >= 22 && regionNumber <= 59) {
					gameRegion = "Countdown Mode";
				}
			}

			// Work out point discrepancy
			if (pointsBegin == 0) {
				pointsBegin = points;
			} else {
				pointsDiscr = points - pointsBegin;
			}

			if (points != pointsPrevious && pointsPrevious != 0) {
				// Match ended
				endMatch = true;
				previousTime = parsed[1].race_start;
			}
			pointsPrevious = points;

			// Another match started
			if (endMatch && previousTime != (parsed[1].race_start)) {
				endMatch = false;
			}

			// Add + to start if > 0
			let pointsDiscrString = pointsDiscr > 0 ? ` (+${pointsDiscr})` : ` (${pointsDiscr})`;
			if (pointsDiscr == 0) {
				pointsDiscrString = "";
			}

			if (endMatch) {
				// If match ended, don't show timestamp
				rpc.setActivity({
					details: `${user.names[0]} (${user.fc})`,
					state: `${points} ${pointsAcr}${pointsDiscrString}`,
					largeImageKey: "mkwii_large",
					largeImageText: "Mario Kart Wii",
					smallImageKey: "wiimmfi_small",
					smallImageText: `Wiimmfi (${gameRegion})`,
					instance: false
				});
			} else {
				rpc.setActivity({
					details: `${user.names[0]} (${user.fc})`,
					state: `${points} ${pointsAcr}${pointsDiscrString}`,
					startTimestamp: raceStart,
					largeImageKey: "mkwii_large",
					largeImageText: "Mario Kart Wii",
					smallImageKey: "wiimmfi_small",
					smallImageText: `Wiimmfi (${gameRegion})`,
					instance: false
				});
			}
		}

		console.log("Updated activity!");
	});
};

rpc.on("ready", () => {
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
