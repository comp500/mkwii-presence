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
let gameRegion = "";

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

			// Work out what region they are playing in. Ugly code, if you can make it nicer please do! lol
			switch (user.rk) {
			case "vs":
				gameRegion = "Worldwide VS Race";
				break;
			case "vs_0":
				gameRegion = "Japanese VS Race";
				break;
			case "vs_1":
				gameRegion = "North American VS Race";
				break;
			case "vs_2":
				gameRegion = "European VS Race";
				break;
			case "vs_3":
				gameRegion = "Australian VS Race";
				break;
			case "vs_4":
				gameRegion = "Taiwanese VS Race";
				break;
			case "vs_5":
				gameRegion = "Korean VS Race";
				break;
			case "vs_6":
				gameRegion = "Chinese VS Race";
				break;
			case "bt":
				gameRegion = "Worldwide Battle";
				break;
			case "bt_0":
				gameRegion = "Japanese Battle";
				break;
			case "bt_1":
				gameRegion = "North American Battle";
				break;
			case "bt_2":
				gameRegion = "European Battle";
				break;
			case "bt_3":
				gameRegion = "Australian Battle";
				break;
			case "bt_4":
				gameRegion = "Taiwanese Battle";
				break;
			case "bt_5":
				gameRegion = "Korean Battle";
				break;
			case "bt_6":
				gameRegion = "Chinese Battle";
				break;
			case "vs_22":
			case "vs_23":
			case "vs_24":
			case "vs_25":
			case "vs_26":
			case "vs_27":
			case "vs_28":
			case "vs_29":
			case "vs_30":
			case "vs_31":
			case "vs_32":
			case "vs_33":
			case "vs_34":
			case "vs_35":
			case "vs_36":
			case "vs_37":
			case "vs_38":
			case "vs_39":
			case "vs_40":
			case "vs_41":
			case "vs_42":
			case "vs_43":
			case "vs_44":
			case "vs_45":
			case "vs_46":
			case "vs_47":
			case "vs_48":
			case "vs_49":
			case "vs_50":
			case "vs_51":
			case "vs_52":
			case "vs_53":
			case "vs_54":
			case "vs_55":
			case "vs_56":
			case "vs_57":
			case "vs_58":
			case "vs_59":
				gameRegion = "CT Worldwide";
				break;
			case "cd_22":
			case "cd_23":
			case "cd_24":
			case "cd_25":
			case "cd_26":
			case "cd_27":
			case "cd_28":
			case "cd_29":
			case "cd_30":
			case "cd_31":
			case "cd_32":
			case "cd_33":
			case "cd_34":
			case "cd_35":
			case "cd_36":
			case "cd_37":
			case "cd_38":
			case "cd_39":
			case "cd_40":
			case "cd_41":
			case "cd_42":
			case "cd_43":
			case "cd_44":
			case "cd_45":
			case "cd_46":
			case "cd_47":
			case "cd_48":
			case "cd_49":
			case "cd_50":
			case "cd_51":
			case "cd_52":
			case "cd_53":
			case "cd_54":
			case "cd_55":
			case "cd_56":
			case "cd_57":
			case "cd_58":
			case "cd_59":
				gameRegion = "Countdown Mode";
				break;
			default:
				gameRegion = user.rk;
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
