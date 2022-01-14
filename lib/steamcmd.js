"use strict";
const
	child_process = require("child_process"),
	fs = require("fs"),
	https = require("https"),
	os = require("os"),
	path = require("path");
const
	AdmZip = require("adm-zip"),
	tar = require("tar");

module.exports = class SteamCMD
{
	// https://developer.valvesoftware.com/wiki/SteamCMD
	#cfg =
	{
		steamCDN: "https://steamcdn-a.akamaihd.net/client/installer/",
		steamPath: "./steamcmd"
	};

	constructor(cfg)
	{
		if (typeof cfg == "string") cfg = {steamPath: cfg};
		Object.assign(this.#cfg, cfg);
	}

	async sayHello()
	{

		await this.#checkInstall();

		
	}

	async installApp(appId, appPath)
	{
		await fs.promises.mkdir(appPath, {recursive: true});
		var res = await this.exec(
		[
			"force_install_dir", appPath,
			"+login", "anonymous",
			"app_update", appId, "validate",
			"+quit"
		],
		d =>
		{
			console.log(`data: ${d}`);
		},
		e =>
		{
			console.log(`error: ${e}`);
		});

		console.log(`responseCode: ${res}`)
	}

	// Valheim: 896660
	// Ark: 376030

	async exec(p, f, e)
	{
		await this.#checkInstall();
		var scp = path.join(this.steamPath, os.platform() == "win32" ? "steamcmd.exe" : "steamcmd.sh");
		const ls = child_process.spawn(scp, p);
		ls.stdout.on("data", f);
		ls.stderr.on("data", e);
		return await new Promise(r=>ls.on("close", r));
	}
	
	async #checkInstall()
	{

		if (await new Promise(r=> fs.access(this.#cfg.steamPath, e => r(e == undefined)))) return;
		await fs.promises.mkdir(this.#cfg.steamPath, {recursive: true});
		switch (os.platform())
		{
			case "win32":
				new AdmZip(await this.#download(this.#cfg.steamCDN + "steamcmd.zip")).extractAllTo(this.#cfg.steamPath);
				break;
			case "linux":
				await new Promise((r, e) => this.#download(this.#cfg.steamCDN + "steamcmd_linux.tar.gz").then(res => tar.x({C: this.#cfg.steamPath}).on("error", e).on("end", r).end(res)));
				break;
			default:
				throw new Error("unsupported platform");
		}
	}

	#download(u)
	{
		return new Promise((r, e) => https.get(u, res =>
		{
			if (res.statusCode != 200) return e(new Error(`response code ${res.statusCode} downloading ${u}`));
			var body = [];
			res.on("error", e).on("data", chunk => body.push(chunk)).on("end", () => r(Buffer.concat(body)));
		}));
	}
}