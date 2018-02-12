const playerID = "";
const discordID = "";

const request = require("request");
const client = require("discord-rich-presence")(discordID);
const url = `https://wiimmfi.de/mkw/list/${playerID}?m=json`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: 'ipc'
});

rpc.setActivity({
	details: `9000 battle points`,
	state: `Game mode`,
	startTimestamp: Date.now(),
	endTimestamp: Date.now() + 10,
	largeImageKey: 'test_falcon',
	largeImageText: "Moo Moo Meadows",
	smallImageKey: 'test_falcon',
	smallImageText: "Worldwide",
	instance: false,
});

/*request(url, (data) => {

});*/