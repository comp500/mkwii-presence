const playerID = "";
const discordID = "";

const request = require("request");
const url = `https://wiimmfi.de/mkw/list/${playerID}?m=json`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: 'ipc'
});

rpc.login(discordID).catch(console.error);

rpc.on('ready', () => {
	console.log(`Connected to discord with id ${discordID}`);
	rpc.setActivity({
		details: `9000 battle points`,
		state: `6000 versus points`,
		startTimestamp: Date.now(),
		endTimestamp: Date.now() + 10,
		largeImageKey: 'test_falcon',
		largeImageText: "Moo Moo Meadows",
		smallImageKey: 'test_falcon',
		smallImageText: "Worldwide",
		instance: false,
	});
});// fc, ev, eb, names, 
// rk,

/*request(url, (data) => {

});*/