"use strict";
const SteamCMD = require("./lib/steamcmd.js");
Main().catch(console.error);

async function Main()
{
	var s = new SteamCMD();
	s.sayHello();
	//await s.download("https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz", "./steamcmd/steamcmd_linux.tar.gz");
	//await s.download("https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip", "./steamcmd/steamcmd.zip");
	
}