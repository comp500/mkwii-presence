
const updateTime = 100; // in seconds

const request = require("request");
const url = `https://wiimmfi.de/mkw/room/p${playerID}?m=json`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: 'ipc'
});

rpc.login(discordID).catch(console.error);

let getData = () => {
	request(url, (err, data) => {
		let parsed = JSON.parse(data.body);
		if (parsed == null) throw new Error("Cannot find data!");

		let user = parsed[1].members.find((userTest) => {
			return userTest.pid == playerID;
		});

		if (user == null) throw new Error("Cannot find user!");

		let points = user.rk == "bt" ? user.eb : user.ev;

		rpc.setActivity({
			details: `${user.names[0]} (${user.fc})`,
			state: `${points} points`,
			startTimestamp: Date.now(),
			largeImageKey: 'wiimmfi_large',
			largeImageText: "Wiimmfi",
			instance: false,
		});

		console.log("Updated activity!");
	});
};

rpc.on('ready', () => {
	console.log(`Connected to discord with id ${discordID}`);
	getData();

	setInterval(getData, 1000 * updateTime);
});