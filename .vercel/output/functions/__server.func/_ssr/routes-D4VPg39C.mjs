import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ClipboardList, a as Sparkles, c as Play, d as Hexagon, f as Hammer, g as Cog, h as Cpu, l as Pause, m as FastForward, n as X, o as ShoppingBag, p as FlaskConical, r as Trophy, s as Shield, t as Zap, u as Lock } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D4VPg39C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AudioEngine = class {
	ctx = null;
	master = null;
	musicBus = null;
	sfxBus = null;
	noise = null;
	musicTimer = null;
	nextNote = 0;
	step = 0;
	voices = 0;
	unlocked = false;
	musicOn = true;
	sfxOn = true;
	musicVol = .5;
	sfxVol = .75;
	unlock() {
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!this.ctx) {
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.musicBus = this.ctx.createGain();
			this.sfxBus = this.ctx.createGain();
			this.musicBus.connect(this.master);
			this.sfxBus.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.noise = this.makeNoise();
			this.applyGains();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
		this.unlocked = true;
		this.startMusic();
		document.addEventListener("visibilitychange", this.onVis);
	}
	dispose() {
		document.removeEventListener("visibilitychange", this.onVis);
		this.stopMusic();
		this.ctx?.close();
	}
	configure(opts) {
		this.musicOn = opts.musicOn;
		this.sfxOn = opts.sfxOn;
		this.musicVol = opts.musicVol;
		this.sfxVol = opts.sfxVol;
		this.applyGains();
		if (this.musicOn) this.startMusic();
		else this.stopMusic();
	}
	play(name) {
		if (!this.unlocked || !this.sfxOn || !this.ctx || !this.sfxBus) return;
		if (this.voices > 18) return;
		const t = this.ctx.currentTime;
		const rate = 1 + (Math.random() * 2 - 1) * .08;
		switch (name) {
			case "ui":
				this.tone(880 * rate, t, .05, "sine", .08, .001, .04);
				break;
			case "place":
				this.tone(140, t, .12, "sine", .22, .001, .1);
				this.tone(620 * rate, t, .06, "triangle", .1, .001, .05);
				break;
			case "shoot-pulse":
				this.tone(420 * rate, t, .07, "sine", .12, .001, .05);
				this.tone(840 * rate, t, .04, "triangle", .06, 0, .03);
				break;
			case "shoot-beam":
				this.tone(1280 * rate, t, .05, "sawtooth", .05, 0, .04);
				break;
			case "shoot-nova":
				this.noiseBurst(t, .12, .12, 600);
				this.tone(180, t, .16, "sine", .18, .002, .12);
				break;
			case "shoot-tesla":
				this.noiseBurst(t, .06, .1, 1800);
				this.tone(1960 * rate, t, .04, "square", .05, 0, .03);
				break;
			case "hit":
				this.tone(240 * rate, t, .04, "triangle", .07, 0, .03);
				break;
			case "kill":
				this.tone(320, t, .1, "sine", .14, .001, .08);
				this.noiseBurst(t, .08, .08, 900);
				break;
			case "leak":
				this.tone(220, t, .28, "sawtooth", .12, .01, .22);
				this.tone(110, t + .04, .22, "sine", .16, .01, .18);
				break;
			case "wave":
				this.swell(t);
				break;
			case "clear":
				this.arpeggio(t, [
					523,
					659,
					784,
					1046
				], .09);
				break;
			case "upgrade":
				this.arpeggio(t, [
					392,
					523,
					659
				], .08);
				break;
			case "gameover":
				this.arpeggio(t, [
					392,
					311,
					247,
					196
				], .16);
				break;
			case "claim":
				this.arpeggio(t, [
					784,
					988,
					1174
				], .06);
				break;
			case "deny":
				this.tone(140, t, .12, "square", .08, 0, .1);
				break;
			case "socket":
				this.tone(520 * rate, t, .08, "triangle", .12, .001, .06);
				this.tone(780 * rate, t + .04, .07, "sine", .08, 0, .05);
				break;
			case "cipher":
				this.arpeggio(t, [
					523,
					659,
					784,
					1046,
					1318
				], .07);
				this.noiseBurst(t, .1, .08, 1200);
				break;
			case "coin":
				this.tone(988 * rate, t, .07, "sine", .1, .001, .05);
				this.tone(1318 * rate, t + .05, .08, "triangle", .08, 0, .06);
		}
	}
	onVis = () => {
		if (!this.ctx) return;
		if (document.hidden) return;
		if (this.ctx.state === "suspended") this.ctx.resume();
	};
	applyGains() {
		const now = this.ctx?.currentTime ?? 0;
		const curve = (v) => v * v;
		this.master?.gain.setTargetAtTime(1, now, .02);
		this.musicBus?.gain.setTargetAtTime(this.musicOn ? curve(this.musicVol) * .22 : 0, now, .05);
		this.sfxBus?.gain.setTargetAtTime(this.sfxOn ? curve(this.sfxVol) : 0, now, .02);
	}
	startMusic() {
		if (!this.ctx || !this.musicOn || this.musicTimer != null) return;
		this.nextNote = this.ctx.currentTime + .05;
		this.step = 0;
		const tick = () => {
			if (!this.ctx || !this.musicOn) return;
			const t = this.ctx.currentTime;
			while (this.nextNote < t + .18) this.scheduleBeat(this.nextNote);
			this.musicTimer = window.setTimeout(tick, 80);
		};
		tick();
	}
	stopMusic() {
		if (this.musicTimer != null) {
			clearTimeout(this.musicTimer);
			this.musicTimer = null;
		}
	}
	scheduleBeat(when) {
		if (!this.ctx || !this.musicBus) return;
		const spb = 60 / 92 / 2;
		const step = this.step % 16;
		const root = 55;
		const pad = [
			0,
			7,
			10,
			12
		];
		if (step === 0) for (const s of pad) this.padNote(root * 2 ** (s / 12), when, spb * 8);
		const arp = [
			0,
			7,
			12,
			15,
			12,
			7,
			10,
			7
		];
		const n = arp[step % arp.length];
		this.toneAt(this.musicBus, 220 * 2 ** (n / 12), when, .12, "triangle", .035, .01, .1);
		if (step % 8 === 0) this.toneAt(this.musicBus, root, when, .18, "sine", .05, .002, .14);
		this.nextNote = when + spb;
		this.step += 1;
	}
	padNote(freq, when, dur) {
		if (!this.musicBus) return;
		this.toneAt(this.musicBus, freq, when, dur, "sine", .03, .4, dur * .8);
		this.toneAt(this.musicBus, freq * 1.005, when, dur, "sine", .02, .4, dur * .8);
	}
	tone(freq, when, dur, type, gain, attack, release) {
		if (!this.sfxBus) return;
		this.toneAt(this.sfxBus, freq, when, dur, type, gain, attack, release);
	}
	toneAt(bus, freq, when, dur, type, gain, attack, release) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, when);
		g.gain.setValueAtTime(0, when);
		g.gain.linearRampToValueAtTime(gain, when + Math.max(.004, attack));
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur + release);
		osc.connect(g);
		g.connect(bus);
		osc.start(when);
		osc.stop(when + dur + release + .02);
		this.voices += 1;
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
			this.voices = Math.max(0, this.voices - 1);
		};
	}
	noiseBurst(when, dur, gain, hp) {
		if (!this.ctx || !this.sfxBus || !this.noise) return;
		const src = this.ctx.createBufferSource();
		src.buffer = this.noise;
		const filter = this.ctx.createBiquadFilter();
		filter.type = "highpass";
		filter.frequency.value = hp;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, when);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(this.sfxBus);
		src.start(when);
		src.stop(when + dur);
		this.voices += 1;
		src.onended = () => {
			src.disconnect();
			filter.disconnect();
			g.disconnect();
			this.voices = Math.max(0, this.voices - 1);
		};
	}
	swell(when) {
		this.tone(196, when, .4, "sine", .12, .05, .3);
		this.tone(392, when + .08, .32, "triangle", .08, .04, .24);
	}
	arpeggio(when, notes, gap) {
		notes.forEach((n, i) => this.tone(n, when + i * gap, .1, "sine", .1, .005, .08));
	}
	makeNoise() {
		const ctx = this.ctx;
		const buf = ctx.createBuffer(1, ctx.sampleRate * .4, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}
};
var audio = new AudioEngine();
var DIFFICULTIES = [
	"normal",
	"hard",
	"nightmare",
	"insane"
];
var TOWER_KINDS = [
	"pulse",
	"beam",
	"nova",
	"tesla"
];
var SKILL_IDS = [
	"scrapCache",
	"coreShield",
	"overclock",
	"rangeAmp",
	"bountyProtocol"
];
var MODULE_IDS = [
	"focusingLens",
	"coolantLoop",
	"rippleCapacitor",
	"targetingAI"
];
var WORKSHOP_IDS = [
	"attack",
	"defense",
	"cash",
	"coins",
	"range",
	"cooldown",
	"drop"
];
var GLYPH_IDS = [
	"spark",
	"ion",
	"hex",
	"volt",
	"node",
	"flux",
	"coil",
	"arc",
	"surge",
	"kernel",
	"nulls",
	"apex",
	"prism",
	"voids",
	"sigma",
	"zenith"
];
var DIFFICULTY_MOD = {
	normal: {
		hp: 1,
		reward: 1,
		speed: 1,
		leak: 1,
		drop: 1,
		label: "Normal",
		unlock: 0
	},
	hard: {
		hp: 1.4,
		reward: 1.3,
		speed: 1.08,
		leak: 1,
		drop: 1.25,
		label: "Hard",
		unlock: 15
	},
	nightmare: {
		hp: 2.1,
		reward: 1.65,
		speed: 1.16,
		leak: 1.2,
		drop: 1.6,
		label: "Nightmare",
		unlock: 30
	},
	insane: {
		hp: 3.2,
		reward: 2.2,
		speed: 1.25,
		leak: 1.4,
		drop: 2.2,
		label: "Insane",
		unlock: 50
	}
};
var ENEMY = {
	bit: {
		health: 18,
		speed: 1.55,
		bounty: 6,
		core: 1,
		label: "Bit"
	},
	virus: {
		health: 32,
		speed: 2.15,
		bounty: 9,
		core: 1,
		label: "Virus"
	},
	tank: {
		health: 90,
		speed: .95,
		bounty: 16,
		core: 2,
		label: "Tank"
	},
	boss: {
		health: 280,
		speed: .72,
		bounty: 60,
		core: 5,
		label: "Prime"
	}
};
var TOWER = {
	pulse: {
		cost: 40,
		range: 2.35,
		fire: .55,
		damage: 14,
		label: "Pulse",
		blurb: "Balanced node. First buy."
	},
	beam: {
		cost: 65,
		range: 3.1,
		fire: .28,
		damage: 7,
		label: "Beam",
		blurb: "Long rail. Fast ticks."
	},
	nova: {
		cost: 80,
		range: 1.8,
		fire: 1.15,
		damage: 18,
		label: "Nova",
		blurb: "Short mortar. Splash."
	},
	tesla: {
		cost: 110,
		range: 2.6,
		fire: .85,
		damage: 12,
		label: "Tesla",
		blurb: "Arc coils. Splash chain."
	}
};
var SKILL = {
	scrapCache: {
		label: "Scrap Cache",
		detail: "+25 starting scrap / rank",
		max: 5,
		cost: 1
	},
	coreShield: {
		label: "Core Shield",
		detail: "+4 core integrity / rank",
		max: 5,
		cost: 1
	},
	overclock: {
		label: "Overclock",
		detail: "+8% tower damage / rank",
		max: 5,
		cost: 2
	},
	rangeAmp: {
		label: "Range Amp",
		detail: "+6% tower range / rank",
		max: 5,
		cost: 2
	},
	bountyProtocol: {
		label: "Bounty Protocol",
		detail: "+10% kill bounty / rank",
		max: 5,
		cost: 2
	}
};
var MODULE = {
	focusingLens: {
		label: "Focusing Lens",
		detail: "Towers deal +12% damage"
	},
	coolantLoop: {
		label: "Coolant Loop",
		detail: "Towers fire 12% faster"
	},
	rippleCapacitor: {
		label: "Ripple Capacitor",
		detail: "Nova and Tesla splash +1 tile"
	},
	targetingAI: {
		label: "Targeting AI",
		detail: "Towers prioritize highest HP"
	}
};
var SAVE_KEY = "neontd.profile.v3";
var RUN_KEY = "neontd.run.v3";
var MILESTONES = [
	{
		wave: 10,
		reward: {
			type: "currency",
			amount: 100
		}
	},
	{
		wave: 25,
		reward: { type: "gachaPull" }
	},
	{
		wave: 50,
		reward: { type: "rareUpgrade" }
	},
	{
		wave: 75,
		reward: { type: "gachaPull" }
	},
	{
		wave: 100,
		reward: {
			type: "chassis",
			kind: "hex"
		}
	}
];
var PASS_TRACK = [
	{
		level: 1,
		reward: {
			type: "currency",
			amount: 50
		}
	},
	{
		level: 3,
		reward: { type: "gachaPull" }
	},
	{
		level: 5,
		reward: {
			type: "currency",
			amount: 120
		}
	},
	{
		level: 8,
		reward: { type: "rareUpgrade" }
	},
	{
		level: 10,
		reward: {
			type: "currency",
			amount: 200
		}
	},
	{
		level: 12,
		reward: {
			type: "skillPoints",
			amount: 2
		}
	},
	{
		level: 15,
		reward: { type: "gachaPull" }
	},
	{
		level: 20,
		reward: { type: "rareUpgrade" }
	},
	{
		level: 25,
		reward: {
			type: "currency",
			amount: 400
		}
	},
	{
		level: 30,
		reward: {
			type: "skillPoints",
			amount: 5
		}
	}
];
function emptyMods() {
	return {
		damage: 0,
		range: 0,
		fireRate: 0,
		bounty: 0,
		splashAdd: 0,
		splashConvert: 0,
		execute: 0,
		coreOnKill: 0,
		corePerWave: 0
	};
}
function endlessScaling(wave) {
	return 1 + Math.log(Math.max(wave, 1)) * .48 + (wave <= 40 ? 0 : Math.pow((wave - 40) / 16, 1.28));
}
function enemyHealth(kind, wave, tier) {
	return ENEMY[kind].health * DIFFICULTY_MOD[tier].hp * endlessScaling(wave);
}
function killBounty(kind, tier, bountyBonus) {
	return Math.max(1, Math.round(ENEMY[kind].bounty * DIFFICULTY_MOD[tier].reward * (1 + bountyBonus)));
}
function skillRank(p, id) {
	return Math.min(SKILL[id].max, p.skillRanks[id] ?? 0);
}
function workshopRank(p, id) {
	return Math.max(0, Math.floor(p.workshop[id] ?? 0));
}
function startingScrap(p) {
	return 80 + skillRank(p, "scrapCache") * 25 + workshopRank(p, "cash") * 18;
}
function startingCore(p) {
	return 20 + skillRank(p, "coreShield") * 4 + workshopRank(p, "defense") + (p.nextRunCoreBonus || 0);
}
function damageBonus(p) {
	return skillRank(p, "overclock") * .08 + workshopRank(p, "attack") * .02 + p.prestigeLevel * .02 + (p.nextRunDamageBonus || 0);
}
function rangeBonus(p) {
	return skillRank(p, "rangeAmp") * .06 + workshopRank(p, "range") * .015 + p.prestigeLevel * .01;
}
function fireRateBonus(p) {
	return workshopRank(p, "cooldown") * .015 + p.prestigeLevel * .01;
}
function bountyBonus(p) {
	return skillRank(p, "bountyProtocol") * .1;
}
function coinBonus(p) {
	return workshopRank(p, "coins") * .05 + p.prestigeLevel * .03;
}
function dropBonus(p) {
	return workshopRank(p, "drop") * .04;
}
function passLevel(xp) {
	return Math.max(1, 1 + Math.floor(xp / 100));
}
function difficultyUnlocked(p, d) {
	return p.highestWaveReached >= DIFFICULTY_MOD[d].unlock;
}
function rewardLabel(r) {
	switch (r.type) {
		case "currency": return `${r.amount} scrap`;
		case "gachaPull": return "Module pull";
		case "rareUpgrade": return "Rare overclock";
		case "battlePassXP": return `${r.amount} pass XP`;
		case "skillPoints": return `${r.amount} skill pts`;
		case "glyph": return `Glyph ${r.id}`;
		case "chassis": return `${r.kind} chassis`;
	}
}
function dayStamp(ms = Date.now()) {
	const d = new Date(ms);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function msUntilMidnight(ms = Date.now()) {
	const d = new Date(ms);
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - ms;
}
function formatHMS(ms) {
	const s = Math.max(0, Math.floor(ms / 1e3));
	return `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m`;
}
function newChassisId() {
	return `ch-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}
function emptyChassis(kind) {
	const n = kind === "dual" ? 2 : kind === "tri" ? 3 : kind === "quad" ? 4 : 6;
	return {
		id: newChassisId(),
		kind,
		sockets: Array.from({ length: n }, () => null)
	};
}
function defaultProfile() {
	const starter = emptyChassis("dual");
	return {
		version: 3,
		displayName: "Operator",
		highestWaveReached: 0,
		prestigeLevel: 0,
		totalRunsCompleted: 0,
		skillPoints: 0,
		skillRanks: {},
		ownedModules: [],
		equippedModules: [],
		battlePassXP: 0,
		battlePassClaimed: [],
		isEndlessUnlocked: true,
		lastMissionResetDay: "",
		missions: [],
		difficulty: "normal",
		bankScrap: 0,
		inventoryPulls: 0,
		pendingRareUpgrades: 0,
		loginStreak: 0,
		lastLoginDay: "",
		lastSeenAt: 0,
		lifetimeKills: 0,
		achievementsClaimed: [],
		tutorialDone: false,
		dailyCrateDay: "",
		dailyShopBought: [],
		dailyShopDay: "",
		nextRunCoreBonus: 0,
		nextRunDamageBonus: 0,
		reducedMotion: false,
		musicEnabled: true,
		sfxEnabled: true,
		musicVol: .55,
		sfxVol: .8,
		shakeEnabled: true,
		workshop: {},
		glyphs: {
			spark: 2,
			ion: 2,
			hex: 1,
			volt: 1
		},
		chassis: [starter],
		equippedChassisId: starter.id,
		discoveredCiphers: [],
		lastRecap: null,
		highestByDifficulty: {}
	};
}
var SplitMix64 = class {
	state;
	constructor(seed) {
		this.state = seed >>> 0 || 2654435769;
	}
	next() {
		this.state = this.state + 2654435769 >>> 0;
		let z = this.state;
		z = Math.imul(z ^ z >>> 16, 2246822507);
		z = Math.imul(z ^ z >>> 13, 3266489909);
		return (z ^ z >>> 16) >>> 0;
	}
	nextFloat() {
		return this.next() / 4294967296;
	}
	pick(arr) {
		return arr[this.next() % arr.length];
	}
};
function hashStr(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function keyOf(c) {
	return `${c.x},${c.y}`;
}
function makePath(columns = 12, rows = 8) {
	const coords = [];
	let y = 1;
	let goingRight = true;
	let x = 0;
	coords.push({
		x: 0,
		y
	});
	while (y < rows - 1) {
		if (goingRight) {
			x += 1;
			if (x >= columns - 1) {
				x = columns - 1;
				y += 2;
				goingRight = false;
			}
		} else {
			x -= 1;
			if (x <= 0) {
				x = 0;
				y += 2;
				goingRight = true;
			}
		}
		if (y >= rows) break;
		coords.push({
			x,
			y: Math.min(y, rows - 2)
		});
	}
	const last = coords[coords.length - 1];
	if (last && last.x !== columns - 1) {
		let lx = last.x;
		const ly = last.y;
		while (lx < columns - 1) {
			lx += 1;
			coords.push({
				x: lx,
				y: ly
			});
		}
	}
	return coords;
}
function makeBattlefield(columns = 12, rows = 8) {
	const path = makePath(columns, rows);
	const pathSet = new Set(path.map(keyOf));
	const buildable = /* @__PURE__ */ new Set();
	for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
		const k = `${x},${y}`;
		if (!pathSet.has(k)) buildable.add(k);
	}
	return {
		columns,
		rows,
		path,
		buildable,
		pathSet
	};
}
function positionAlong(map, pathIndex) {
	const path = map.path;
	if (path.length < 2) return {
		x: 0,
		y: 0
	};
	const maxIndex = path.length - 1;
	const clamped = Math.min(Math.max(pathIndex, 0), maxIndex);
	const i0 = Math.floor(clamped);
	const i1 = Math.min(i0 + 1, maxIndex);
	const t = clamped - i0;
	const a = path[i0];
	const b = path[i1];
	return {
		x: a.x + (b.x - a.x) * t,
		y: a.y + (b.y - a.y) * t
	};
}
function waveComposition(wave) {
	if (wave > 0 && wave % 10 === 0) return [
		["boss", 1 + Math.floor((wave - 10) / 50)],
		["tank", Math.min(18, 2 + Math.floor(wave / 12))],
		["virus", Math.min(22, 4 + Math.floor(wave / 8))]
	];
	const bits = Math.min(28, 6 + wave);
	const viruses = Math.min(22, Math.max(0, wave - 2));
	const tanks = Math.min(16, Math.max(0, Math.floor((wave - 5) / 2)));
	return [
		["bit", bits],
		["virus", viruses],
		["tank", tanks]
	].filter(([, n]) => n > 0);
}
var CombatSimulation = class {
	map;
	enemies = [];
	towers = [];
	projectiles = [];
	spawnQueue = [];
	spawnCooldown = 0;
	runDamageBonus = 0;
	runRangeBonus = 0;
	runFireRateBonus = 0;
	runBountyBonus = 0;
	mods = emptyMods();
	nextEnemyId = 1;
	nextTowerId = 1;
	nextProjectileId = 1;
	nextOfferId = 1;
	constructor(map = makeBattlefield()) {
		this.map = map;
	}
	resetCombatants() {
		this.enemies = [];
		this.projectiles = [];
		this.spawnQueue = [];
		this.spawnCooldown = 0;
	}
	resetRun() {
		this.resetCombatants();
		this.towers = [];
		this.runDamageBonus = 0;
		this.runRangeBonus = 0;
		this.runFireRateBonus = 0;
		this.runBountyBonus = 0;
		this.nextEnemyId = 1;
		this.nextTowerId = 1;
		this.nextProjectileId = 1;
	}
	restoreTowers(towers) {
		this.towers = towers.map((t, i) => ({
			id: i + 1,
			kind: t.kind,
			coord: t.coord,
			cooldown: 0,
			rank: t.rank,
			facing: 0,
			invested: t.invested
		}));
		this.nextTowerId = this.towers.length + 1;
	}
	canPlace(coord) {
		const k = keyOf(coord);
		return this.map.buildable.has(k) && !this.towers.some((t) => keyOf(t.coord) === k);
	}
	placeTower(kind, coord) {
		if (!this.canPlace(coord)) return false;
		this.towers.push({
			id: this.nextTowerId++,
			kind,
			coord: { ...coord },
			cooldown: 0,
			rank: 1,
			facing: 0,
			invested: TOWER[kind].cost
		});
		return true;
	}
	towerAt(coord) {
		const k = keyOf(coord);
		return this.towers.find((t) => keyOf(t.coord) === k);
	}
	rankUpCost(coord) {
		const t = this.towerAt(coord);
		if (!t || t.rank >= 5) return null;
		return TOWER[t.kind].cost * t.rank;
	}
	rankUp(coord) {
		const t = this.towerAt(coord);
		if (!t || t.rank >= 5) return false;
		const cost = TOWER[t.kind].cost * t.rank;
		t.rank += 1;
		t.invested += cost;
		return true;
	}
	sellRefund(coord) {
		const t = this.towerAt(coord);
		if (!t) return null;
		return Math.max(1, Math.floor(t.invested / 2));
	}
	sell(coord) {
		const refund = this.sellRefund(coord);
		if (refund == null) return null;
		const k = keyOf(coord);
		this.towers = this.towers.filter((t) => keyOf(t.coord) !== k);
		return refund;
	}
	queueWave(comp) {
		this.spawnQueue = [];
		for (const [kind, count] of comp) for (let i = 0; i < count; i++) this.spawnQueue.push(kind);
		this.spawnCooldown = .15;
	}
	pendingSpawns() {
		return this.spawnQueue.length;
	}
	waveCleared() {
		return this.spawnQueue.length === 0 && this.enemies.length === 0;
	}
	tick(dt, wave, tier, mods, preferHighest) {
		this.mods = mods;
		const result = {
			kills: [],
			scrap: 0,
			coreDamage: 0,
			coreHeal: 0,
			events: []
		};
		this.spawnCooldown -= dt;
		while (this.spawnCooldown <= 0 && this.spawnQueue.length) {
			const kind = this.spawnQueue.shift();
			this.spawn(kind, wave, tier);
			result.events.push({
				t: "spawn",
				kind
			});
			this.spawnCooldown += Math.max(.18, .42 - wave * .002);
		}
		const dmgMult = 1 + mods.damage;
		const rangeMult = 1 + mods.range;
		const fireMult = 1 + mods.fireRate;
		const bounty = mods.bounty;
		const splashR = 1.6 + mods.splashAdd;
		for (const tower of this.towers) {
			tower.cooldown -= dt;
			if (tower.cooldown > 0) continue;
			const spec = TOWER[tower.kind];
			let range = spec.range * rangeMult;
			if ((tower.kind === "nova" || tower.kind === "tesla") && mods.splashAdd > 0) range += Math.min(1.4, mods.splashAdd);
			const target = this.selectTarget(tower.coord, range, preferHighest);
			if (!target) continue;
			const pos = positionAlong(this.map, target.pathIndex);
			tower.facing = Math.atan2(pos.y - tower.coord.y, pos.x - tower.coord.x);
			tower.cooldown = Math.max(.08, spec.fire / fireMult);
			const dmg = spec.damage * tower.rank * dmgMult;
			const splash = tower.kind === "nova" || tower.kind === "tesla" || mods.splashConvert > 0 && Math.random() < mods.splashConvert;
			this.fire(tower, target.id, dmg, splash);
			result.events.push({
				t: "fire",
				kind: tower.kind,
				x: tower.coord.x,
				y: tower.coord.y,
				tx: pos.x,
				ty: pos.y
			});
		}
		const speed = (kind) => kind === "beam" ? 14 : kind === "pulse" ? 9 : 7;
		for (const shot of this.projectiles) shot.travel += dt * speed(shot.kind);
		for (const shot of this.projectiles) {
			if (shot.travel < 1) continue;
			this.applyHit(shot, wave, tier, bounty, splashR, result);
			shot.travel = 99;
		}
		this.projectiles = this.projectiles.filter((p) => p.travel < 1);
		const spd = DIFFICULTY_MOD[tier].speed;
		const leak = DIFFICULTY_MOD[tier].leak;
		for (const enemy of this.enemies) {
			if (enemy.hitFlash > 0) enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
			enemy.pathIndex += ENEMY[enemy.kind].speed * spd * dt;
			if (enemy.pathIndex >= this.map.path.length - 1) {
				enemy.alive = false;
				const dmg = Math.max(1, Math.round(ENEMY[enemy.kind].core * leak));
				result.coreDamage += dmg;
				result.events.push({
					t: "leak",
					kind: enemy.kind,
					dmg
				});
			}
		}
		this.enemies = this.enemies.filter((e) => e.alive);
		return result;
	}
	makeOffers(wave, rng) {
		const pool = [...[
			[
				"Overload",
				"+12% tower damage this run",
				50,
				{
					type: "damage",
					v: .12
				}
			],
			[
				"Longscan",
				"+10% tower range this run",
				45,
				{
					type: "range",
					v: .1
				}
			],
			[
				"Coolant",
				"+15% fire rate this run",
				55,
				{
					type: "fireRate",
					v: .15
				}
			],
			[
				"Patch Core",
				"+5 core integrity",
				40,
				{
					type: "core",
					v: 5
				}
			],
			[
				"Scrap Drop",
				"+40 scrap",
				0,
				{
					type: "scrap",
					v: 40
				}
			]
		]];
		const offers = [];
		for (let i = 0; i < 3 && pool.length; i++) {
			const idx = rng.next() % pool.length;
			const item = pool.splice(idx, 1)[0];
			offers.push({
				id: this.nextOfferId++,
				title: item[0],
				detail: item[1],
				cost: item[2] + wave,
				apply: item[3]
			});
		}
		return offers;
	}
	injectRareOffer(wave) {
		return {
			id: 9e3 + wave,
			title: "Rare Overclock",
			detail: "+20% damage, +10% range, +10% fire rate",
			cost: 0,
			apply: { type: "rare" }
		};
	}
	apply(effect, coreHP, scrapGrant) {
		switch (effect.type) {
			case "damage":
				this.runDamageBonus += effect.v;
				break;
			case "range":
				this.runRangeBonus += effect.v;
				break;
			case "fireRate":
				this.runFireRateBonus += effect.v;
				break;
			case "core":
				coreHP.v += effect.v;
				break;
			case "scrap":
				scrapGrant(effect.v);
				break;
			case "rare":
				this.runDamageBonus += .2;
				this.runRangeBonus += .1;
				this.runFireRateBonus += .1;
		}
	}
	spawn(kind, wave, tier) {
		const hp = enemyHealth(kind, wave, tier);
		this.enemies.push({
			id: this.nextEnemyId++,
			kind,
			health: hp,
			maxHealth: hp,
			pathIndex: 0,
			alive: true,
			hitFlash: 0
		});
	}
	selectTarget(coord, range, preferHighestHP) {
		const range2 = range * range;
		let best = null;
		for (const enemy of this.enemies) {
			if (!enemy.alive) continue;
			const pos = positionAlong(this.map, enemy.pathIndex);
			const dx = pos.x - coord.x;
			const dy = pos.y - coord.y;
			if (dx * dx + dy * dy > range2) continue;
			if (!best) best = enemy;
			else if (preferHighestHP) {
				if (enemy.health > best.health) best = enemy;
			} else if (enemy.pathIndex > best.pathIndex) best = enemy;
		}
		return best;
	}
	fire(tower, targetId, damage, splash) {
		this.projectiles.push({
			id: this.nextProjectileId++,
			ox: tower.coord.x,
			oy: tower.coord.y,
			targetId,
			damage,
			kind: tower.kind,
			travel: 0,
			splash
		});
	}
	applyHit(shot, wave, tier, bounty, splashR, result) {
		const idx = this.enemies.findIndex((e) => e.id === shot.targetId && e.alive);
		if (idx < 0) return;
		this.damageEnemy(idx, shot.damage, wave, tier, bounty, result, shot.kind);
		if (!shot.splash) return;
		const source = this.enemies[idx];
		if (!source) return;
		const center = positionAlong(this.map, source.pathIndex);
		for (let j = 0; j < this.enemies.length; j++) {
			const e = this.enemies[j];
			if (!e.alive || e.id === shot.targetId) continue;
			const p = positionAlong(this.map, e.pathIndex);
			const dx = p.x - center.x;
			const dy = p.y - center.y;
			if (dx * dx + dy * dy <= splashR * splashR) this.damageEnemy(j, shot.damage * .45, wave, tier, bounty, result, shot.kind);
		}
	}
	damageEnemy(index, amount, _wave, tier, bounty, result, kind) {
		const e = this.enemies[index];
		if (!e.alive) return;
		e.health -= amount;
		e.hitFlash = .08;
		const pos = positionAlong(this.map, e.pathIndex);
		result.events.push({
			t: "hit",
			x: pos.x,
			y: pos.y,
			dmg: amount,
			kind
		});
		if (this.mods.execute > 0 && e.health > 0 && e.health / e.maxHealth <= this.mods.execute) {
			e.health = 0;
			result.events.push({
				t: "execute",
				x: pos.x,
				y: pos.y
			});
		}
		if (e.health <= 0) {
			e.alive = false;
			result.kills.push(e.kind);
			result.scrap += killBounty(e.kind, tier, bounty);
			result.events.push({
				t: "kill",
				x: pos.x,
				y: pos.y,
				kind: e.kind
			});
			if (this.mods.coreOnKill > 0 && Math.random() < this.mods.coreOnKill) result.coreHeal += 1;
		}
	}
};
var CHASSIS = {
	dual: {
		label: "Circuit Board",
		sockets: 2,
		detail: "Two sockets. Starter frame."
	},
	tri: {
		label: "Lattice Frame",
		sockets: 3,
		detail: "Three sockets. Mid-run drop."
	},
	quad: {
		label: "Prime Chassis",
		sockets: 4,
		detail: "Four sockets. High-tier words."
	},
	hex: {
		label: "Overclock Array",
		sockets: 6,
		detail: "Six sockets. Endgame words."
	}
};
var GLYPH = {
	spark: {
		mark: "SP",
		label: "SPARK",
		tier: 1,
		solo: { damage: .02 },
		weight: 18,
		detail: "+2% damage"
	},
	ion: {
		mark: "IO",
		label: "ION",
		tier: 1,
		solo: { fireRate: .02 },
		weight: 18,
		detail: "+2% fire rate"
	},
	hex: {
		mark: "HX",
		label: "HEX",
		tier: 1,
		solo: { range: .02 },
		weight: 16,
		detail: "+2% range"
	},
	volt: {
		mark: "VO",
		label: "VOLT",
		tier: 1,
		solo: { bounty: .03 },
		weight: 16,
		detail: "+3% bounty"
	},
	node: {
		mark: "ND",
		label: "NODE",
		tier: 2,
		solo: { damage: .03 },
		weight: 12,
		detail: "+3% damage"
	},
	flux: {
		mark: "FX",
		label: "FLUX",
		tier: 2,
		solo: { range: .03 },
		weight: 12,
		detail: "+3% range"
	},
	coil: {
		mark: "CL",
		label: "COIL",
		tier: 2,
		solo: { fireRate: .03 },
		weight: 10,
		detail: "+3% fire rate"
	},
	arc: {
		mark: "AR",
		label: "ARC",
		tier: 2,
		solo: { splashAdd: .15 },
		weight: 10,
		detail: "+0.15 splash"
	},
	surge: {
		mark: "SG",
		label: "SURGE",
		tier: 3,
		solo: { damage: .04 },
		weight: 7,
		detail: "+4% damage"
	},
	kernel: {
		mark: "KR",
		label: "KERNEL",
		tier: 3,
		solo: { corePerWave: .4 },
		weight: 7,
		detail: "+0.4 core / wave"
	},
	nulls: {
		mark: "NL",
		label: "NULL",
		tier: 3,
		solo: { execute: .02 },
		weight: 6,
		detail: "Execute 2%"
	},
	apex: {
		mark: "AX",
		label: "APEX",
		tier: 3,
		solo: { fireRate: .04 },
		weight: 6,
		detail: "+4% fire rate"
	},
	prism: {
		mark: "PR",
		label: "PRISM",
		tier: 4,
		solo: { splashConvert: .05 },
		weight: 3,
		detail: "5% splash convert"
	},
	voids: {
		mark: "VD",
		label: "VOID",
		tier: 4,
		solo: { execute: .03 },
		weight: 3,
		detail: "Execute 3%"
	},
	sigma: {
		mark: "SM",
		label: "SIGMA",
		tier: 4,
		solo: { bounty: .08 },
		weight: 2,
		detail: "+8% bounty"
	},
	zenith: {
		mark: "ZN",
		label: "ZENITH",
		tier: 4,
		solo: { damage: .06 },
		weight: 2,
		detail: "+6% damage"
	}
};
var CIPHERS = [
	{
		id: "ignite",
		name: "IGNITE",
		recipe: ["spark", "ion"],
		detail: "+18% damage",
		mods: { damage: .18 }
	},
	{
		id: "static",
		name: "STATIC",
		recipe: ["hex", "volt"],
		detail: "+20% fire rate",
		mods: { fireRate: .2 }
	},
	{
		id: "drift",
		name: "DRIFT",
		recipe: ["node", "flux"],
		detail: "+16% range",
		mods: { range: .16 }
	},
	{
		id: "lash",
		name: "LASH",
		recipe: ["coil", "arc"],
		detail: "Splash +0.7",
		mods: { splashAdd: .7 }
	},
	{
		id: "insight",
		name: "INSIGHT",
		recipe: [
			"spark",
			"ion",
			"hex"
		],
		detail: "+30% bounty",
		mods: { bounty: .3 }
	},
	{
		id: "haste",
		name: "HASTE",
		recipe: [
			"volt",
			"node",
			"flux"
		],
		detail: "+22% fire rate, +10% range",
		mods: {
			fireRate: .22,
			range: .1
		}
	},
	{
		id: "bulwark",
		name: "BULWARK",
		recipe: [
			"coil",
			"arc",
			"surge"
		],
		detail: "+12% damage, +1 core / wave",
		mods: {
			damage: .12,
			corePerWave: 1
		}
	},
	{
		id: "reaper",
		name: "REAPER",
		recipe: [
			"kernel",
			"nulls",
			"apex"
		],
		detail: "Execute enemies below 12% HP",
		mods: { execute: .12 }
	},
	{
		id: "spirit",
		name: "SPIRIT",
		recipe: [
			"ion",
			"hex",
			"volt",
			"node"
		],
		detail: "+20% fire, +15% range, +12% damage",
		mods: {
			fireRate: .2,
			range: .15,
			damage: .12
		}
	},
	{
		id: "fortitude",
		name: "FORTITUDE",
		recipe: [
			"flux",
			"coil",
			"arc",
			"surge"
		],
		detail: "+35% damage, +1.5 core / wave",
		mods: {
			damage: .35,
			corePerWave: 1.5
		}
	},
	{
		id: "enigma",
		name: "ENIGMA",
		recipe: [
			"kernel",
			"nulls",
			"apex",
			"prism"
		],
		detail: "18% of hits splash, +15% range",
		mods: {
			splashConvert: .18,
			range: .15
		}
	},
	{
		id: "infinity",
		name: "INFINITY",
		recipe: [
			"voids",
			"sigma",
			"spark",
			"ion"
		],
		detail: "Splash +1.2, +18% damage",
		mods: {
			splashAdd: 1.2,
			damage: .18
		}
	},
	{
		id: "grief",
		name: "GRIEF",
		recipe: [
			"spark",
			"ion",
			"hex",
			"volt",
			"node",
			"flux"
		],
		detail: "+45% damage, execute 8%",
		mods: {
			damage: .45,
			execute: .08
		}
	},
	{
		id: "lastWish",
		name: "LAST WISH",
		recipe: [
			"coil",
			"arc",
			"surge",
			"kernel",
			"nulls",
			"apex"
		],
		detail: "+22% all combat, +2 core / wave",
		mods: {
			damage: .22,
			range: .22,
			fireRate: .22,
			corePerWave: 2
		}
	},
	{
		id: "phoenix",
		name: "PHOENIX",
		recipe: [
			"prism",
			"voids",
			"sigma",
			"zenith",
			"apex",
			"nulls"
		],
		detail: "18% kill heals core, +35% bounty",
		mods: {
			coreOnKill: .18,
			bounty: .35
		}
	}
];
function matchCipher(sockets) {
	if (sockets.some((s) => s == null)) return null;
	const seq = sockets;
	return CIPHERS.find((c) => c.recipe.length === seq.length && c.recipe.every((g, i) => g === seq[i])) ?? null;
}
function equippedChassis(p) {
	if (!p.equippedChassisId) return p.chassis[0] ?? null;
	return p.chassis.find((c) => c.id === p.equippedChassisId) ?? p.chassis[0] ?? null;
}
function addPartial(a, b) {
	return {
		damage: a.damage + (b.damage ?? 0),
		range: a.range + (b.range ?? 0),
		fireRate: a.fireRate + (b.fireRate ?? 0),
		bounty: a.bounty + (b.bounty ?? 0),
		splashAdd: a.splashAdd + (b.splashAdd ?? 0),
		splashConvert: a.splashConvert + (b.splashConvert ?? 0),
		execute: a.execute + (b.execute ?? 0),
		coreOnKill: a.coreOnKill + (b.coreOnKill ?? 0),
		corePerWave: a.corePerWave + (b.corePerWave ?? 0)
	};
}
function chassisMods(ch) {
	const mods = emptyMods();
	if (!ch) return {
		mods,
		cipher: null
	};
	const word = matchCipher(ch.sockets);
	if (word) return {
		mods: addPartial(mods, word.mods),
		cipher: word
	};
	for (const g of ch.sockets) if (g) addInto(mods, GLYPH[g].solo);
	return {
		mods,
		cipher: null
	};
}
function addInto(a, b) {
	a.damage += b.damage ?? 0;
	a.range += b.range ?? 0;
	a.fireRate += b.fireRate ?? 0;
	a.bounty += b.bounty ?? 0;
	a.splashAdd += b.splashAdd ?? 0;
	a.splashConvert += b.splashConvert ?? 0;
	a.execute += b.execute ?? 0;
	a.coreOnKill += b.coreOnKill ?? 0;
	a.corePerWave += b.corePerWave ?? 0;
}
function loadoutMods(p, run) {
	let mods = emptyMods();
	mods.damage += run.damage;
	mods.range += run.range;
	mods.fireRate += run.fireRate;
	mods.bounty += run.bounty;
	const equipped = new Set(p.equippedModules);
	if (equipped.has("focusingLens")) mods.damage += .12;
	if (equipped.has("coolantLoop")) mods.fireRate += .12;
	if (equipped.has("rippleCapacitor")) {
		mods.range += .08;
		mods.splashAdd += 1;
	}
	const { mods: cm, cipher } = chassisMods(equippedChassis(p));
	mods = addPartial(mods, cm);
	return {
		mods,
		cipher
	};
}
function addGlyph(p, id, n = 1) {
	p.glyphs[id] = (p.glyphs[id] ?? 0) + n;
}
function spendGlyph(p, id) {
	const n = p.glyphs[id] ?? 0;
	if (n <= 0) return false;
	p.glyphs[id] = n - 1;
	return true;
}
function socketGlyph(p, chassisId, slot, glyph) {
	const ch = p.chassis.find((c) => c.id === chassisId);
	if (!ch || slot < 0 || slot >= ch.sockets.length) return false;
	if (!spendGlyph(p, glyph)) return false;
	const prev = ch.sockets[slot];
	if (prev) addGlyph(p, prev);
	ch.sockets[slot] = glyph;
	maybeDiscover(p, ch);
	return true;
}
function unsocket(p, chassisId, slot) {
	const ch = p.chassis.find((c) => c.id === chassisId);
	if (!ch || slot < 0 || slot >= ch.sockets.length) return false;
	const g = ch.sockets[slot];
	if (!g) return false;
	ch.sockets[slot] = null;
	addGlyph(p, g);
	return true;
}
function maybeDiscover(p, ch) {
	const word = matchCipher(ch.sockets);
	if (word && !p.discoveredCiphers.includes(word.id)) p.discoveredCiphers.push(word.id);
}
function recipeHint(c, discovered) {
	if (discovered) return c.recipe.map((g) => GLYPH[g].label).join(" + ");
	return `${c.recipe.length}-socket · starts ${GLYPH[c.recipe[0]].label}`;
}
function prefixCipher(sockets) {
	let best = null;
	for (const c of CIPHERS) {
		if (c.recipe.length !== sockets.length) continue;
		let n = 0;
		for (let i = 0; i < sockets.length; i++) {
			const g = sockets[i];
			if (!g) break;
			if (g !== c.recipe[i]) {
				n = 0;
				break;
			}
			n++;
		}
		if (n > 0 && (!best || n > best.have)) best = {
			cipher: c,
			have: n
		};
	}
	return best;
}
function pickGlyph(wave, rng) {
	const maxTier = wave >= 80 ? 4 : wave >= 40 ? 3 : wave >= 18 ? 2 : 1;
	const pool = Object.keys(GLYPH).filter((id) => GLYPH[id].tier <= maxTier);
	let total = 0;
	for (const id of pool) total += GLYPH[id].weight;
	let roll = rng() * total;
	for (const id of pool) {
		roll -= GLYPH[id].weight;
		if (roll <= 0) return id;
	}
	return pool[0];
}
function pickChassis(wave, rng) {
	if (wave === 10) return "dual";
	if (wave === 25) return "tri";
	if (wave === 50) return "quad";
	if (wave === 100) return "hex";
	if (wave > 0 && wave % 10 === 0) {
		const r = rng();
		if (wave >= 80 && r < .12) return "hex";
		if (wave >= 40 && r < .18) return "quad";
		if (wave >= 20 && r < .28) return "tri";
		if (r < .2) return "dual";
	}
	return null;
}
var IN_RUN_IDS = [
	"dmg",
	"rng",
	"rate",
	"bounty",
	"income",
	"repair"
];
var WORKSHOP = {
	attack: {
		label: "Attack",
		detail: (r) => `+${(r * 2).toFixed(0)}% tower damage`,
		base: 40,
		per: "+2% damage / lvl"
	},
	defense: {
		label: "Core plating",
		detail: (r) => `+${r} core integrity`,
		base: 50,
		per: "+1 core / lvl"
	},
	cash: {
		label: "Starting scrap",
		detail: (r) => `+${r * 18} scrap at deploy`,
		base: 35,
		per: "+18 scrap / lvl"
	},
	coins: {
		label: "Coin bonus",
		detail: (r) => `+${(r * 5).toFixed(0)}% banked after a run`,
		base: 55,
		per: "+5% coins / lvl"
	},
	range: {
		label: "Range",
		detail: (r) => `+${(r * 1.5).toFixed(1)}% tower range`,
		base: 45,
		per: "+1.5% range / lvl"
	},
	cooldown: {
		label: "Fire rate",
		detail: (r) => `+${(r * 1.5).toFixed(1)}% fire rate`,
		base: 45,
		per: "+1.5% fire / lvl"
	},
	drop: {
		label: "Glyph drop",
		detail: (r) => `+${(r * 4).toFixed(0)}% glyph find`,
		base: 70,
		per: "+4% drop / lvl"
	}
};
var IN_RUN = {
	dmg: {
		label: "Overload",
		detail: "+4% damage this run",
		base: 22,
		step: .04
	},
	rng: {
		label: "Longscan",
		detail: "+3% range this run",
		base: 20,
		step: .03
	},
	rate: {
		label: "Coolant",
		detail: "+4% fire rate this run",
		base: 24,
		step: .04
	},
	bounty: {
		label: "Bounty",
		detail: "+5% kill scrap this run",
		base: 18,
		step: .05
	},
	income: {
		label: "Income",
		detail: "+8 scrap each wave",
		base: 16,
		step: 8
	},
	repair: {
		label: "Patch",
		detail: "+4 core integrity",
		base: 28,
		step: 4
	}
};
function workshopCost(p, id) {
	const rank = workshopRank(p, id);
	return Math.floor(WORKSHOP[id].base * Math.pow(1.085, rank));
}
function buyWorkshop(p, id) {
	const cost = workshopCost(p, id);
	if (p.bankScrap < cost) return false;
	p.bankScrap -= cost;
	p.workshop[id] = workshopRank(p, id) + 1;
	return true;
}
function inRunCost(bought, id, wave) {
	return Math.floor(IN_RUN[id].base * Math.pow(1.16, bought) + wave * .6);
}
function safeParse(raw) {
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function loadProfile() {
	if (typeof localStorage === "undefined") return defaultProfile();
	try {
		const data = safeParse(localStorage.getItem("neontd.profile.v3")) ?? safeParse(localStorage.getItem("neontd.profile.v2"));
		const base = defaultProfile();
		if (!data) return base;
		const merged = {
			...base,
			...data,
			version: 3,
			workshop: {
				...base.workshop,
				...data.workshop ?? {}
			},
			glyphs: {
				...base.glyphs,
				...data.glyphs ?? {}
			},
			chassis: Array.isArray(data.chassis) && data.chassis.length ? data.chassis : base.chassis,
			discoveredCiphers: data.discoveredCiphers ?? [],
			skillRanks: {
				...base.skillRanks,
				...data.skillRanks ?? {}
			},
			ownedModules: data.ownedModules ?? [],
			equippedModules: data.equippedModules ?? [],
			missions: data.missions ?? [],
			battlePassClaimed: data.battlePassClaimed ?? [],
			achievementsClaimed: data.achievementsClaimed ?? [],
			dailyShopBought: data.dailyShopBought ?? [],
			highestByDifficulty: {
				...base.highestByDifficulty,
				...data.highestByDifficulty ?? {}
			},
			isEndlessUnlocked: true
		};
		if (!merged.equippedChassisId && merged.chassis[0]) merged.equippedChassisId = merged.chassis[0].id;
		return merged;
	} catch {
		return defaultProfile();
	}
}
function saveProfile(p) {
	if (typeof localStorage === "undefined") return;
	try {
		const prev = localStorage.getItem(SAVE_KEY);
		if (prev) localStorage.setItem(SAVE_KEY + ".bak", prev);
		localStorage.setItem(SAVE_KEY, JSON.stringify(p));
	} catch {}
}
function exportProfileJson(p) {
	return JSON.stringify({
		...p,
		exportedAt: Date.now()
	}, null, 2);
}
function importProfileJson(raw) {
	const data = safeParse(raw);
	if (!data || typeof data !== "object") return null;
	const base = defaultProfile();
	return {
		...base,
		...data,
		version: 3,
		workshop: {
			...base.workshop,
			...data.workshop ?? {}
		},
		glyphs: {
			...base.glyphs,
			...data.glyphs ?? {}
		},
		chassis: Array.isArray(data.chassis) ? data.chassis : base.chassis,
		discoveredCiphers: data.discoveredCiphers ?? [],
		highestByDifficulty: {
			...base.highestByDifficulty,
			...data.highestByDifficulty ?? {}
		}
	};
}
function loadRun() {
	if (typeof localStorage === "undefined") return null;
	try {
		const data = safeParse(localStorage.getItem(RUN_KEY));
		if (!data || data.schemaVersion !== 3) return null;
		if (data.phase === "menu" || data.phase === "gameOver") return null;
		return data;
	} catch {
		return null;
	}
}
function saveRun(snap) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(RUN_KEY, JSON.stringify(snap));
	} catch {}
}
function clearRun() {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(RUN_KEY);
	} catch {}
}
function grantReward(p, r, runScrap) {
	switch (r.type) {
		case "currency":
			if (runScrap) runScrap.v += r.amount;
			else p.bankScrap += r.amount;
			break;
		case "gachaPull":
			p.inventoryPulls += 1;
			break;
		case "rareUpgrade":
			p.pendingRareUpgrades += 1;
			break;
		case "battlePassXP":
			p.battlePassXP += r.amount;
			break;
		case "skillPoints":
			p.skillPoints += r.amount;
			break;
		case "glyph":
			addGlyph(p, r.id);
			break;
		case "chassis": grantChassis(p, r.kind);
	}
}
function grantChassis(p, kind) {
	p.chassis.push(emptyChassis(kind));
}
function dailyMissions() {
	return [
		{
			id: "kill-30",
			description: "Eliminate 30 hostiles",
			target: 30,
			progress: 0,
			reward: {
				type: "currency",
				amount: 80
			},
			claimed: false
		},
		{
			id: "clear-3",
			description: "Clear 3 waves",
			target: 3,
			progress: 0,
			reward: {
				type: "battlePassXP",
				amount: 40
			},
			claimed: false
		},
		{
			id: "place-4",
			description: "Deploy 4 modules",
			target: 4,
			progress: 0,
			reward: { type: "gachaPull" },
			claimed: false
		}
	];
}
function refreshMissions(p) {
	const today = dayStamp();
	if (p.lastMissionResetDay === today && p.missions.length) return;
	p.lastMissionResetDay = today;
	p.missions = dailyMissions();
}
function progressMission(p, prefix, by) {
	for (const m of p.missions) if (m.description.startsWith(prefix)) m.progress = Math.min(m.target, m.progress + by);
}
function claimMission(p, id) {
	const m = p.missions.find((x) => x.id === id);
	if (!m || m.claimed || m.progress < m.target) return null;
	m.claimed = true;
	grantReward(p, m.reward);
	return m.reward;
}
function unlockSkill(p, id) {
	const spec = SKILL[id];
	const current = Math.min(spec.max, p.skillRanks[id] ?? 0);
	if (current >= spec.max) return false;
	const cost = spec.cost * (current + 1);
	if (p.skillPoints < cost) return false;
	p.skillPoints -= cost;
	p.skillRanks[id] = current + 1;
	return true;
}
function addModule(p, id) {
	if (p.ownedModules.includes(id)) return false;
	p.ownedModules.push(id);
	return true;
}
function toggleEquip(p, id) {
	if (!p.ownedModules.includes(id)) return false;
	const idx = p.equippedModules.indexOf(id);
	if (idx >= 0) {
		p.equippedModules.splice(idx, 1);
		return true;
	}
	if (p.equippedModules.length >= 3) return false;
	p.equippedModules.push(id);
	return true;
}
function rollModule(p) {
	const missing = MODULE_IDS.filter((id) => !p.ownedModules.includes(id));
	if (missing.length === 0) {
		p.bankScrap += 50;
		return {
			item: null,
			scrap: 50
		};
	}
	const item = missing[Math.floor(Math.random() * missing.length)];
	addModule(p, item);
	return {
		item,
		scrap: 0
	};
}
function consumePull(p) {
	if (p.inventoryPulls <= 0) return false;
	p.inventoryPulls -= 1;
	return true;
}
function consumeRare(p) {
	if (p.pendingRareUpgrades <= 0) return false;
	p.pendingRareUpgrades -= 1;
	return true;
}
function claimPass(p, level) {
	const track = PASS_TRACK.find((t) => t.level === level);
	if (!track) return null;
	if (passLevel(p.battlePassXP) < level) return null;
	if (p.battlePassClaimed.includes(level)) return null;
	p.battlePassClaimed.push(level);
	grantReward(p, track.reward);
	return track.reward;
}
function prestige(p) {
	if (p.highestWaveReached < 50) return false;
	p.prestigeLevel += 1;
	p.skillPoints += 5;
	p.bankScrap += 200;
	return true;
}
function applyLogin(p) {
	const today = dayStamp();
	refreshMissions(p);
	if (p.dailyShopDay !== today) {
		p.dailyShopDay = today;
		p.dailyShopBought = [];
	}
	let comeback = false;
	let streakUp = false;
	if (p.lastLoginDay !== today) {
		const yesterday = dayStamp(Date.now() - 864e5);
		if (p.lastLoginDay === yesterday) p.loginStreak = Math.min(30, (p.loginStreak || 0) + 1);
		else p.loginStreak = 1;
		streakUp = true;
		p.lastLoginDay = today;
		p.bankScrap += 10 + p.loginStreak * 4;
		if (p.loginStreak % 7 === 0) p.inventoryPulls += 1;
		if (p.lastSeenAt && Date.now() - p.lastSeenAt > 1296e5) {
			comeback = true;
			p.bankScrap += 60;
			p.inventoryPulls += 1;
		}
	}
	p.lastSeenAt = Date.now();
	if (!p.equippedChassisId && p.chassis[0]) p.equippedChassisId = p.chassis[0].id;
	const crateReady = p.dailyCrateDay !== today;
	return {
		profile: p,
		comeback,
		streakUp,
		crateReady
	};
}
function claimDailyCrate(p) {
	const today = dayStamp();
	if (p.dailyCrateDay === today) return null;
	p.dailyCrateDay = today;
	const reward = p.loginStreak >= 7 ? { type: "gachaPull" } : {
		type: "currency",
		amount: 25 + p.loginStreak * 5
	};
	grantReward(p, reward);
	if (p.loginStreak >= 3) {
		const glyphs = [
			"spark",
			"ion",
			"hex",
			"volt"
		];
		addGlyph(p, glyphs[p.loginStreak % glyphs.length]);
	}
	return reward;
}
function shopForDay(day) {
	const rng = new SplitMix64(hashStr(day + ":shop"));
	const pool = [...[
		{
			id: "pull",
			title: "Module crate",
			detail: "One gacha pull toward a missing chip",
			cost: 100,
			kind: "pull"
		},
		{
			id: "skill",
			title: "Protocol dump",
			detail: "+2 skill points",
			cost: 180,
			kind: "skill"
		},
		{
			id: "rare",
			title: "Rare overclock",
			detail: "Token for the next upgrade bay",
			cost: 220,
			kind: "rare"
		},
		{
			id: "patch",
			title: "Core patch",
			detail: "Next run starts with +8 core",
			cost: 70,
			kind: "patch"
		},
		{
			id: "chip",
			title: "Damage chip",
			detail: "Next run starts with +8% damage",
			cost: 150,
			kind: "chip"
		},
		{
			id: "glyph",
			title: "Loose glyph",
			detail: "A random tier-1 glyph for the forge",
			cost: 90,
			kind: "glyph"
		}
	]];
	const out = [];
	for (let i = 0; i < 3 && pool.length; i++) {
		const idx = rng.next() % pool.length;
		out.push(pool.splice(idx, 1)[0]);
	}
	return out;
}
function buyShop(p, item) {
	if (p.dailyShopBought.includes(item.id)) return false;
	if (p.bankScrap < item.cost) return false;
	p.bankScrap -= item.cost;
	p.dailyShopBought.push(item.id);
	switch (item.kind) {
		case "pull":
			p.inventoryPulls += 1;
			break;
		case "skill":
			p.skillPoints += 2;
			break;
		case "rare":
			p.pendingRareUpgrades += 1;
			break;
		case "patch":
			p.nextRunCoreBonus += 8;
			break;
		case "chip":
			p.nextRunDamageBonus += .08;
			break;
		case "glyph": {
			const t1 = [
				"spark",
				"ion",
				"hex",
				"volt"
			];
			addGlyph(p, t1[Math.floor(Math.random() * t1.length)]);
			break;
		}
	}
	return true;
}
var ACHIEVEMENTS = [
	{
		id: "first-clear",
		title: "Handshake",
		detail: "Clear wave 1",
		test: (p) => p.highestWaveReached >= 1,
		reward: {
			type: "currency",
			amount: 30
		}
	},
	{
		id: "wave-10",
		title: "Circuit steady",
		detail: "Reach wave 10",
		test: (p) => p.highestWaveReached >= 10,
		reward: { type: "gachaPull" }
	},
	{
		id: "wave-25",
		title: "Deep grid",
		detail: "Reach wave 25",
		test: (p) => p.highestWaveReached >= 25,
		reward: {
			type: "currency",
			amount: 150
		}
	},
	{
		id: "wave-50",
		title: "Endless protocol",
		detail: "Reach wave 50",
		test: (p) => p.highestWaveReached >= 50,
		reward: { type: "rareUpgrade" }
	},
	{
		id: "wave-100",
		title: "Century circuit",
		detail: "Reach wave 100",
		test: (p) => p.highestWaveReached >= 100,
		reward: {
			type: "chassis",
			kind: "hex"
		}
	},
	{
		id: "prestige",
		title: "Reboot authority",
		detail: "Prestige once",
		test: (p) => p.prestigeLevel >= 1,
		reward: {
			type: "skillPoints",
			amount: 3
		}
	},
	{
		id: "collector",
		title: "Full rack",
		detail: "Own every module",
		test: (p) => p.ownedModules.length >= 4,
		reward: {
			type: "currency",
			amount: 200
		}
	},
	{
		id: "streak-7",
		title: "Seven-cycle",
		detail: "7-day login streak",
		test: (p) => p.loginStreak >= 7,
		reward: { type: "gachaPull" }
	},
	{
		id: "specialist",
		title: "Max protocol",
		detail: "Max any skill",
		test: (p) => Object.values(p.skillRanks).some((r) => (r ?? 0) >= 5),
		reward: {
			type: "skillPoints",
			amount: 2
		}
	},
	{
		id: "century",
		title: "Century cull",
		detail: "100 lifetime kills",
		test: (p) => p.lifetimeKills >= 100,
		reward: {
			type: "currency",
			amount: 80
		}
	},
	{
		id: "cipher",
		title: "Word spoken",
		detail: "Complete a cipher word",
		test: (p) => p.discoveredCiphers.length >= 1,
		reward: {
			type: "currency",
			amount: 120
		}
	},
	{
		id: "insane-20",
		title: "Insane hold",
		detail: "Reach wave 20 on Insane",
		test: (p) => (p.highestByDifficulty.insane ?? 0) >= 20,
		reward: { type: "gachaPull" }
	}
];
function checkAchievements(p) {
	const unlocked = [];
	for (const a of ACHIEVEMENTS) {
		if (p.achievementsClaimed.includes(a.id)) continue;
		if (!a.test(p)) continue;
		p.achievementsClaimed.push(a.id);
		grantReward(p, a.reward);
		unlocked.push(a);
	}
	return unlocked;
}
var TOWER_COLOR = {
	pulse: "#3ee8ff",
	beam: "#7ec8ff",
	nova: "#d7f7ff",
	tesla: "#9dffef"
};
var ENEMY_COLOR = {
	bit: "#3ee8ff",
	virus: "#5dffb0",
	tank: "#ff8a4c",
	boss: "#ff4d6d"
};
function load(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(img);
		img.src = src;
	});
}
var Renderer = class {
	canvas;
	ctx;
	images = {};
	floorPat = null;
	pathPat = null;
	particles = [];
	floaters = [];
	time = 0;
	shakeX = 0;
	shakeY = 0;
	trauma = 0;
	flash = 0;
	hover = null;
	reduced = false;
	cell = 48;
	ox = 0;
	oy = 0;
	ready = false;
	pool = [];
	constructor(canvas) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) throw new Error("Canvas 2D unavailable");
		this.ctx = ctx;
	}
	async load() {
		await Promise.all([
			"pulse",
			"beam",
			"nova",
			"tesla",
			"bit",
			"virus",
			"tank",
			"boss",
			"core",
			"pad"
		].map(async (n) => {
			this.images[n] = await load(`/sprites/${n}.png`);
		}));
		const floor = await load("/textures/floor.jpg");
		const path = await load("/textures/path.jpg");
		if (floor.width) this.floorPat = this.ctx.createPattern(floor, "repeat");
		if (path.width) this.pathPat = this.ctx.createPattern(path, "repeat");
		this.ready = true;
	}
	resize() {
		const parent = this.canvas.parentElement;
		const w = parent?.clientWidth ?? 800;
		const h = parent?.clientHeight ?? 480;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.canvas.width = Math.floor(w * dpr);
		this.canvas.height = Math.floor(h * dpr);
		this.canvas.style.width = `${w}px`;
		this.canvas.style.height = `${h}px`;
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	layout(map) {
		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;
		const cell = Math.floor(Math.min(w / map.columns, h / map.rows) * .94);
		this.cell = Math.max(28, cell);
		this.ox = (w - map.columns * this.cell) / 2;
		this.oy = (h - map.rows * this.cell) / 2;
	}
	screenToCell(sx, sy, map) {
		const x = Math.floor((sx - this.ox) / this.cell);
		const y = Math.floor((sy - this.oy) / this.cell);
		if (x < 0 || y < 0 || x >= map.columns || y >= map.rows) return null;
		return {
			x,
			y
		};
	}
	addTrauma(v) {
		if (this.reduced) return;
		this.trauma = Math.min(1, this.trauma + v);
	}
	burst(x, y, color, n = 10, speed = 40) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = speed * (.4 + Math.random());
			const p = this.pool.pop() ?? {};
			p.x = x;
			p.y = y;
			p.vx = Math.cos(a) * s;
			p.vy = Math.sin(a) * s;
			p.life = p.max = .35 + Math.random() * .35;
			p.size = 1.4 + Math.random() * 2.2;
			p.color = color;
			this.particles.push(p);
		}
	}
	float(x, y, text, color) {
		this.floaters.push({
			x,
			y,
			text,
			life: .7,
			color
		});
	}
	draw(sim, dt, opts) {
		this.time += dt;
		this.layout(sim.map);
		const ctx = this.ctx;
		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;
		this.trauma = Math.max(0, this.trauma - dt * 1.8);
		const shake = this.trauma * this.trauma;
		this.shakeX = this.reduced ? 0 : (Math.random() * 2 - 1) * shake * 10;
		this.shakeY = this.reduced ? 0 : (Math.random() * 2 - 1) * shake * 10;
		this.flash = Math.max(0, this.flash - dt * 3);
		ctx.fillStyle = "#07090e";
		ctx.fillRect(0, 0, w, h);
		ctx.save();
		ctx.translate(this.ox + this.shakeX, this.oy + this.shakeY);
		this.drawBoard(sim, opts);
		this.drawTowers(sim, opts);
		this.drawEnemies(sim);
		this.drawProjectiles(sim);
		this.drawCore(sim);
		this.updateFx(dt);
		ctx.restore();
		if (this.flash > 0) {
			ctx.fillStyle = `rgba(255,77,109,${this.flash * .18})`;
			ctx.fillRect(0, 0, w, h);
		}
		const g = ctx.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .72);
		g.addColorStop(0, "rgba(0,0,0,0)");
		g.addColorStop(1, "rgba(0,0,0,0.42)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}
	drawBoard(sim, opts) {
		const ctx = this.ctx;
		const { columns, rows } = sim.map;
		const cell = this.cell;
		ctx.fillStyle = "#0b0e14";
		ctx.fillRect(-2, -2, columns * cell + 4, rows * cell + 4);
		for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
			const k = `${x},${y}`;
			const px = x * cell;
			const py = y * cell;
			if (sim.map.pathSet.has(k)) {
				if (this.pathPat) {
					ctx.save();
					ctx.translate(px, py);
					ctx.fillStyle = this.pathPat;
					ctx.globalAlpha = .9;
					ctx.fillRect(0, 0, cell, cell);
					ctx.restore();
				} else {
					ctx.fillStyle = "#10222a";
					ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
				}
			} else if (this.floorPat) {
				ctx.save();
				ctx.translate(px, py);
				ctx.fillStyle = this.floorPat;
				ctx.globalAlpha = .7;
				ctx.fillRect(0, 0, cell, cell);
				ctx.restore();
			} else {
				ctx.fillStyle = (x + y) % 2 === 0 ? "#10141b" : "#0d1118";
				ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
			}
		}
		ctx.save();
		ctx.strokeStyle = "rgba(62,232,255,0.55)";
		ctx.lineWidth = Math.max(2, cell * .12);
		ctx.shadowColor = "#3ee8ff";
		ctx.shadowBlur = 12;
		ctx.lineJoin = "round";
		ctx.beginPath();
		sim.map.path.forEach((c, i) => {
			const px = c.x * cell + cell / 2;
			const py = c.y * cell + cell / 2;
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		});
		ctx.stroke();
		ctx.restore();
		const dash = this.time * 40 % 80 / 80;
		ctx.save();
		ctx.strokeStyle = "rgba(232,251,255,0.7)";
		ctx.lineWidth = 1.5;
		ctx.setLineDash([8, 12]);
		ctx.lineDashOffset = -dash * 40;
		ctx.beginPath();
		sim.map.path.forEach((c, i) => {
			const px = c.x * cell + cell / 2;
			const py = c.y * cell + cell / 2;
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		});
		ctx.stroke();
		ctx.restore();
		if (this.hover) {
			const hx = this.hover.x * cell;
			const hy = this.hover.y * cell;
			const buildable = sim.map.buildable.has(keyOf(this.hover));
			const occupied = !!sim.towerAt(this.hover);
			ctx.fillStyle = occupied ? "rgba(62,232,255,0.12)" : buildable ? "rgba(62,232,255,0.16)" : "rgba(255,77,109,0.12)";
			ctx.fillRect(hx, hy, cell, cell);
			if (buildable && !occupied) this.rangeRing(this.hover.x, this.hover.y, TOWER[opts.hoverKind].range, TOWER_COLOR[opts.hoverKind]);
		}
		if (opts.selected) {
			const t = sim.towerAt(opts.selected);
			if (t) {
				this.rangeRing(t.coord.x, t.coord.y, TOWER[t.kind].range, TOWER_COLOR[t.kind]);
				ctx.strokeStyle = "rgba(62,232,255,0.9)";
				ctx.lineWidth = 2;
				ctx.strokeRect(t.coord.x * cell + 2, t.coord.y * cell + 2, cell - 4, cell - 4);
			}
		}
	}
	rangeRing(cx, cy, range, color) {
		const ctx = this.ctx;
		const cell = this.cell;
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx * cell + cell / 2, cy * cell + cell / 2, range * cell, 0, Math.PI * 2);
		ctx.strokeStyle = color;
		ctx.globalAlpha = .35;
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.restore();
	}
	drawTowers(sim, _opts) {
		const ctx = this.ctx;
		const cell = this.cell;
		for (const t of sim.towers) {
			const cx = t.coord.x * cell + cell / 2;
			const cy = t.coord.y * cell + cell / 2;
			const img = this.images[t.kind];
			const pad = this.images.pad;
			if (pad?.width) {
				const s = cell * .92;
				ctx.drawImage(pad, cx - s / 2, cy - s / 2, s, s);
			}
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(t.facing);
			const size = cell * (.78 + t.rank * .04);
			if (img?.width) ctx.drawImage(img, -size / 2, -size / 2, size, size);
			else {
				ctx.fillStyle = TOWER_COLOR[t.kind];
				ctx.beginPath();
				ctx.arc(0, 0, size * .28, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
			if (t.rank > 1) {
				ctx.fillStyle = "#e8eef4";
				ctx.font = `600 ${Math.max(9, cell * .22)}px "IBM Plex Mono", monospace`;
				ctx.textAlign = "right";
				ctx.fillText(String(t.rank), t.coord.x * cell + cell - 4, t.coord.y * cell + 12);
			}
		}
	}
	drawEnemies(sim) {
		const ctx = this.ctx;
		const cell = this.cell;
		for (const e of sim.enemies) {
			const p = positionAlong(sim.map, e.pathIndex);
			const x = p.x * cell + cell / 2;
			const y = p.y * cell + cell / 2 + Math.sin(this.time * 4 + e.id) * 1.2;
			const img = this.images[e.kind];
			const size = cell * (e.kind === "boss" ? .92 : e.kind === "tank" ? .78 : .62);
			ctx.save();
			if (e.hitFlash > 0) ctx.globalCompositeOperation = "lighter";
			if (img?.width) ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
			else {
				ctx.fillStyle = ENEMY_COLOR[e.kind];
				ctx.beginPath();
				ctx.arc(x, y, size * .28, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
			const pct = Math.max(0, e.health / e.maxHealth);
			const bw = cell * .46;
			ctx.fillStyle = "rgba(0,0,0,0.55)";
			ctx.fillRect(x - bw / 2, y - size / 2 - 6, bw, 3);
			ctx.fillStyle = pct < .3 ? "#ff4d6d" : "#5dffb0";
			ctx.fillRect(x - bw / 2, y - size / 2 - 6, bw * pct, 3);
		}
	}
	drawProjectiles(sim) {
		const ctx = this.ctx;
		const cell = this.cell;
		for (const shot of sim.projectiles) {
			const target = sim.enemies.find((e) => e.id === shot.targetId);
			if (!target) continue;
			const to = positionAlong(sim.map, target.pathIndex);
			const t = Math.min(Math.max(shot.travel, 0), 1);
			const x = (shot.ox + (to.x - shot.ox) * t) * cell + cell / 2;
			const y = (shot.oy + (to.y - shot.oy) * t) * cell + cell / 2;
			const color = TOWER_COLOR[shot.kind];
			if (shot.kind === "beam") {
				ctx.save();
				ctx.strokeStyle = color;
				ctx.globalAlpha = .7;
				ctx.lineWidth = 2;
				ctx.shadowColor = color;
				ctx.shadowBlur = 8;
				ctx.beginPath();
				ctx.moveTo(shot.ox * cell + cell / 2, shot.oy * cell + cell / 2);
				ctx.lineTo(to.x * cell + cell / 2, to.y * cell + cell / 2);
				ctx.stroke();
				ctx.restore();
			} else if (shot.kind === "tesla") {
				ctx.save();
				ctx.strokeStyle = color;
				ctx.globalAlpha = .85;
				ctx.lineWidth = 1.4;
				ctx.shadowColor = color;
				ctx.shadowBlur = 10;
				ctx.beginPath();
				const x0 = shot.ox * cell + cell / 2;
				const y0 = shot.oy * cell + cell / 2;
				const x1 = to.x * cell + cell / 2;
				const y1 = to.y * cell + cell / 2;
				ctx.moveTo(x0, y0);
				const segs = 6;
				for (let i = 1; i <= segs; i++) {
					const u = i / segs;
					const jx = (Math.random() - .5) * 10 * (1 - Math.abs(u - .5) * 2);
					const jy = (Math.random() - .5) * 10 * (1 - Math.abs(u - .5) * 2);
					ctx.lineTo(x0 + (x1 - x0) * u + jx, y0 + (y1 - y0) * u + jy);
				}
				ctx.stroke();
				ctx.restore();
			} else {
				ctx.save();
				ctx.fillStyle = color;
				ctx.shadowColor = color;
				ctx.shadowBlur = 10;
				ctx.beginPath();
				ctx.arc(x, y, shot.kind === "nova" ? 4.5 : 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
		}
	}
	drawCore(sim) {
		const last = sim.map.path[sim.map.path.length - 1];
		if (!last) return;
		const cell = this.cell;
		const x = last.x * cell + cell / 2;
		const y = last.y * cell + cell / 2;
		const img = this.images.core;
		const size = cell * 1.15;
		const pulse = 1 + Math.sin(this.time * 3) * .04;
		if (img?.width) this.ctx.drawImage(img, x - size * pulse / 2, y - size * pulse / 2, size * pulse, size * pulse);
		else {
			this.ctx.fillStyle = "#3ee8ff";
			this.ctx.beginPath();
			this.ctx.arc(x, y, cell * .32, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}
	updateFx(dt) {
		const ctx = this.ctx;
		const cell = this.cell;
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.life -= dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += 18 * dt;
			if (p.life <= 0) {
				this.particles.splice(i, 1);
				this.pool.push(p);
				continue;
			}
			ctx.globalAlpha = p.life / p.max;
			ctx.fillStyle = p.color;
			ctx.fillRect(p.x * cell + cell / 2, p.y * cell + cell / 2, p.size, p.size);
			ctx.globalAlpha = 1;
		}
		for (let i = this.floaters.length - 1; i >= 0; i--) {
			const f = this.floaters[i];
			f.life -= dt;
			f.y -= dt * .6;
			if (f.life <= 0) {
				this.floaters.splice(i, 1);
				continue;
			}
			ctx.globalAlpha = Math.min(1, f.life * 2);
			ctx.fillStyle = f.color;
			ctx.font = `600 ${Math.max(10, cell * .26)}px "IBM Plex Mono", monospace`;
			ctx.textAlign = "center";
			ctx.fillText(f.text, f.x * cell + cell / 2, f.y * cell + cell / 2);
			ctx.globalAlpha = 1;
		}
	}
};
var toastId = 1;
var useGame = create((set) => ({
	ready: false,
	screen: "boot",
	phase: "menu",
	wave: 1,
	scrap: 0,
	bankScrap: 0,
	coreHP: 20,
	maxCore: 20,
	paused: false,
	speed: 1,
	selectedTower: "pulse",
	selectedCoord: null,
	eventLog: "Ready.",
	offers: [],
	pendingRare: 0,
	pulls: 0,
	skillPoints: 0,
	difficulty: "normal",
	hasSavedRun: false,
	profile: defaultProfile(),
	toasts: [],
	briefing: false,
	showComeback: false,
	crateReady: false,
	tutorialStep: 0,
	enemiesAlive: 0,
	pendingSpawns: 0,
	inspectText: "",
	endless: true,
	inRun: {},
	cipherName: null,
	labOpen: false,
	recap: null,
	hydrate: (p, hasRun, extras) => set({
		ready: true,
		screen: "boot",
		profile: p,
		bankScrap: p.bankScrap,
		pulls: p.inventoryPulls,
		skillPoints: p.skillPoints,
		pendingRare: p.pendingRareUpgrades,
		difficulty: p.difficulty,
		hasSavedRun: hasRun,
		showComeback: extras.comeback,
		crateReady: extras.crateReady,
		briefing: !p.tutorialDone,
		recap: p.lastRecap
	}),
	patch: (partial) => set(partial),
	toast: (title, detail, tone = "info") => set((s) => ({ toasts: [...s.toasts.slice(-4), {
		id: toastId++,
		title,
		detail,
		tone
	}] })),
	dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
var GameEngine = class {
	sim = new CombatSimulation();
	renderer;
	profile;
	phase = "menu";
	wave = 1;
	coreHP = 20;
	maxCore = 20;
	scrap = 0;
	selectedTower = "pulse";
	selectedCoord = null;
	offers = [];
	paused = false;
	speed = 1;
	seed = 1;
	rng = new SplitMix64(1);
	claimed = /* @__PURE__ */ new Set();
	endless = false;
	eventLog = "Ready.";
	corePatchUsed = false;
	inRun = {};
	runKills = 0;
	runGlyphs = [];
	runChassisDrop = null;
	cipherName = null;
	labOpen = false;
	settled = false;
	mods = emptyMods();
	acc = 0;
	last = 0;
	raf = 0;
	running = false;
	persistAt = 0;
	pendingNotes = [];
	constructor(canvas) {
		this.renderer = new Renderer(canvas);
		this.profile = loadProfile();
	}
	async boot() {
		const login = applyLogin(this.profile);
		this.profile = login.profile;
		this.flushProfile();
		useGame.getState().hydrate(this.profile, !!loadRun(), {
			comeback: login.comeback,
			crateReady: login.crateReady
		});
		if (login.comeback) this.pendingNotes.push({
			title: "Operator returned",
			detail: "Comeback crate: +60 scrap and a pull",
			tone: "ok"
		});
		if (login.streakUp) this.pendingNotes.push({
			title: `Streak ${this.profile.loginStreak}`,
			detail: this.profile.loginStreak % 7 === 0 ? "Weekly crate: extra pull" : "Daily scrap banked",
			tone: "ok"
		});
		this.renderer.load();
		this.renderer.reduced = this.profile.reducedMotion;
		audio.configure({
			musicOn: this.profile.musicEnabled,
			sfxOn: this.profile.sfxEnabled,
			musicVol: this.profile.musicVol,
			sfxVol: this.profile.sfxVol
		});
		const persist = () => {
			this.flushProfile();
			if (this.phase === "combat" || this.phase === "upgrade") this.persistRun();
		};
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) persist();
		});
		window.addEventListener("pagehide", persist);
	}
	startLoop() {
		if (this.running) return;
		this.running = true;
		this.last = performance.now();
		const frame = (now) => {
			this.raf = requestAnimationFrame(frame);
			let dt = (now - this.last) / 1e3;
			this.last = now;
			if (dt > .25) dt = .25;
			this.step(dt);
		};
		this.raf = requestAnimationFrame(frame);
	}
	stopLoop() {
		this.running = false;
		cancelAnimationFrame(this.raf);
	}
	enterMenu() {
		audio.unlock();
		useGame.getState().patch({ screen: "menu" });
		audio.play("ui");
		for (const n of this.pendingNotes) useGame.getState().toast(n.title, n.detail, n.tone);
		this.pendingNotes = [];
	}
	startGame(difficulty) {
		audio.unlock();
		this.profile.difficulty = difficulty ?? this.profile.difficulty;
		this.sim.resetRun();
		this.seed = Math.random() * 4294967295 >>> 0 || 1;
		this.rng = new SplitMix64(this.seed);
		this.wave = 1;
		this.maxCore = startingCore(this.profile);
		this.coreHP = this.maxCore;
		this.scrap = startingScrap(this.profile);
		this.sim.runDamageBonus = this.profile.nextRunDamageBonus || 0;
		this.sim.runRangeBonus = 0;
		this.sim.runFireRateBonus = 0;
		this.sim.runBountyBonus = 0;
		this.profile.nextRunCoreBonus = 0;
		this.profile.nextRunDamageBonus = 0;
		this.claimed.clear();
		this.endless = true;
		this.offers = [];
		this.paused = false;
		this.speed = 1;
		this.corePatchUsed = false;
		this.selectedCoord = null;
		this.acc = 0;
		this.inRun = {};
		this.runKills = 0;
		this.runGlyphs = [];
		this.runChassisDrop = null;
		this.labOpen = false;
		this.settled = false;
		this.phase = "combat";
		this.refreshMods();
		this.beginWave();
		this.flushProfile();
		this.persistRun();
		useGame.getState().patch({
			screen: "play",
			tutorialStep: this.profile.tutorialDone ? 0 : 1
		});
		this.syncHud();
		audio.play("wave");
	}
	continueRun() {
		const snap = loadRun();
		if (!snap) {
			this.eventLog = "No valid run snapshot.";
			this.syncHud();
			return;
		}
		audio.unlock();
		this.seed = snap.seed || 1;
		this.rng = new SplitMix64(this.seed);
		this.wave = Math.max(1, snap.wave);
		this.coreHP = Math.max(1, snap.coreHP);
		this.maxCore = Math.max(this.coreHP, startingCore(this.profile));
		this.scrap = Math.max(0, snap.scrap);
		this.claimed = new Set(snap.claimedMilestones);
		this.endless = snap.isEndlessUnlocked;
		this.profile.difficulty = snap.difficulty;
		this.paused = false;
		this.corePatchUsed = snap.corePatchUsed;
		this.sim.resetRun();
		this.sim.runDamageBonus = snap.runDamageBonus;
		this.sim.runRangeBonus = snap.runRangeBonus;
		this.sim.runFireRateBonus = snap.runFireRateBonus;
		this.sim.runBountyBonus = snap.runBountyBonus;
		this.inRun = snap.inRun ?? {};
		this.runKills = snap.runKills ?? 0;
		this.runGlyphs = [];
		this.runChassisDrop = null;
		this.labOpen = false;
		this.settled = false;
		this.sim.restoreTowers(snap.towers ?? []);
		this.refreshMods();
		if (snap.phase === "upgrade") {
			this.offers = this.sim.makeOffers(this.wave, this.rng);
			if (this.profile.pendingRareUpgrades > 0) this.offers.unshift(this.sim.injectRareOffer(this.wave));
			this.phase = "upgrade";
		} else {
			this.offers = [];
			this.phase = "combat";
			this.sim.queueWave(waveComposition(this.wave));
		}
		this.eventLog = `Resumed wave ${this.wave}.`;
		useGame.getState().patch({ screen: "play" });
		this.syncHud();
		audio.play("ui");
	}
	returnToMenu() {
		this.exitTo("menu");
	}
	exitTo(screen) {
		if (!this.settled) this.settleRun(this.phase === "gameOver" ? "death" : "abort");
		this.phase = "menu";
		this.sim.resetRun();
		this.labOpen = false;
		useGame.getState().patch({
			screen,
			hasSavedRun: false,
			phase: "menu",
			labOpen: false
		});
		this.syncHud();
	}
	cashOut() {
		if (this.phase !== "upgrade") return;
		this.settleRun("cashout");
		this.phase = "gameOver";
		this.eventLog = `Banked at wave ${this.wave}.`;
		this.syncHud();
		audio.play("coin");
	}
	retry() {
		if (!this.settled && this.phase === "gameOver") this.settleRun("death");
		this.startGame(this.profile.difficulty);
	}
	pauseToggle() {
		if (this.phase !== "combat") return;
		this.paused = !this.paused;
		this.syncHud();
		audio.play("ui");
	}
	setSpeed(s) {
		this.speed = s;
		this.syncHud();
	}
	toggleLab() {
		this.labOpen = !this.labOpen;
		audio.play("ui");
		this.syncHud();
	}
	buyInRun(id) {
		if (this.phase !== "combat" && this.phase !== "upgrade") return;
		const bought = this.inRun[id] ?? 0;
		const cost = inRunCost(bought, id, this.wave);
		if (this.scrap < cost) {
			audio.play("deny");
			this.eventLog = `Need ${cost} scrap.`;
			this.syncHud();
			return;
		}
		this.scrap -= cost;
		if (id === "repair") {
			this.coreHP += IN_RUN.repair.step;
			this.maxCore = Math.max(this.maxCore, this.coreHP);
		} else {
			this.inRun[id] = bought + 1;
			this.refreshMods();
		}
		this.eventLog = `${IN_RUN[id].label} ${this.inRun[id] ?? "applied"}.`;
		audio.play("upgrade");
		this.persistRun();
		this.syncHud();
	}
	buyWorkshopId(id) {
		if (buyWorkshop(this.profile, id)) {
			audio.play("claim");
			this.afterMeta("Workshop rank up");
		} else audio.play("deny");
	}
	socket(chassisId, slot, glyph) {
		if (socketGlyph(this.profile, chassisId, slot, glyph)) {
			const ch = this.profile.chassis.find((c) => c.id === chassisId);
			const word = ch ? matchCipher(ch.sockets) : null;
			audio.play(word ? "cipher" : "socket");
			this.refreshMods();
			this.afterMeta(word ? `Cipher ${word.name}` : "Glyph socketed");
		} else audio.play("deny");
	}
	unsocketSlot(chassisId, slot) {
		if (unsocket(this.profile, chassisId, slot)) {
			audio.play("ui");
			this.refreshMods();
			this.afterMeta("Glyph returned");
		} else audio.play("deny");
	}
	equipChassis(id) {
		if (!this.profile.chassis.some((c) => c.id === id)) {
			audio.play("deny");
			return;
		}
		this.profile.equippedChassisId = id;
		audio.play("ui");
		this.refreshMods();
		this.afterMeta("Chassis equipped");
	}
	selectTower(kind) {
		this.selectedTower = kind;
		audio.play("ui");
		this.syncHud();
	}
	handleTile(coord) {
		if (this.phase !== "combat" && this.phase !== "upgrade") return;
		if (this.sim.towerAt(coord)) {
			this.selectedCoord = coord;
			this.eventLog = this.inspect(coord);
			this.syncHud();
			audio.play("ui");
			return;
		}
		this.place(coord);
	}
	place(coord) {
		if (!this.sim.canPlace(coord)) {
			audio.play("deny");
			return;
		}
		const cost = TOWER[this.selectedTower].cost;
		if (this.scrap < cost) {
			this.eventLog = `Need ${cost} scrap.`;
			audio.play("deny");
			this.syncHud();
			return;
		}
		if (!this.sim.placeTower(this.selectedTower, coord)) return;
		this.scrap -= cost;
		this.eventLog = `Deployed ${TOWER[this.selectedTower].label}.`;
		progressMission(this.profile, "Deploy", 1);
		this.renderer.burst(coord.x, coord.y, "#3ee8ff", 12, 50);
		audio.play("place");
		if (this.profile.tutorialDone === false && this.wave === 1) useGame.getState().patch({ tutorialStep: 2 });
		this.persistRun();
		this.flushProfile();
		this.syncHud();
	}
	rankSelected() {
		if (!this.selectedCoord) return;
		const cost = this.sim.rankUpCost(this.selectedCoord);
		if (cost == null) {
			this.eventLog = this.inspect(this.selectedCoord);
			this.syncHud();
			return;
		}
		if (this.scrap < cost) {
			this.eventLog = `Need ${cost} scrap to rank up.`;
			audio.play("deny");
			this.syncHud();
			return;
		}
		this.scrap -= cost;
		this.sim.rankUp(this.selectedCoord);
		this.eventLog = this.inspect(this.selectedCoord);
		audio.play("upgrade");
		this.persistRun();
		this.syncHud();
	}
	sellSelected() {
		if (!this.selectedCoord) return;
		const refund = this.sim.sell(this.selectedCoord);
		if (refund == null) return;
		this.scrap += refund;
		this.eventLog = `Sold module for ${refund} scrap.`;
		this.selectedCoord = null;
		audio.play("ui");
		this.persistRun();
		this.syncHud();
	}
	buyOffer(offer) {
		if (this.phase !== "upgrade") return;
		if (offer.cost > 0 && this.scrap < offer.cost) {
			this.eventLog = "Not enough scrap.";
			audio.play("deny");
			this.syncHud();
			return;
		}
		if (offer.cost > 0) this.scrap -= offer.cost;
		const core = { v: this.coreHP };
		if (offer.apply.type === "rare") consumeRare(this.profile);
		this.sim.apply(offer.apply, core, (n) => {
			this.scrap += n;
		});
		this.coreHP = core.v;
		this.maxCore = Math.max(this.maxCore, this.coreHP);
		this.refreshMods();
		this.eventLog = `Installed ${offer.title}.`;
		this.offers = this.offers.filter((o) => o.id !== offer.id);
		audio.play("upgrade");
		this.flushProfile();
		this.persistRun();
		this.syncHud();
	}
	startNextWave() {
		if (this.phase !== "upgrade") return;
		this.wave += 1;
		this.offers = [];
		this.phase = "combat";
		this.beginWave();
		this.persistRun();
		this.syncHud();
		audio.play("wave");
	}
	corePatch() {
		if (this.phase !== "gameOver" || this.corePatchUsed) return;
		const cost = 80;
		if (this.profile.bankScrap < cost && this.scrap < cost) {
			audio.play("deny");
			return;
		}
		if (this.profile.bankScrap >= cost) this.profile.bankScrap -= cost;
		else this.scrap -= cost;
		this.corePatchUsed = true;
		this.coreHP = 8;
		this.phase = "combat";
		this.sim.queueWave(waveComposition(this.wave));
		this.eventLog = "Emergency core patch applied.";
		this.flushProfile();
		this.persistRun();
		this.syncHud();
		audio.play("upgrade");
		useGame.getState().toast("Core patched", "One more hold", "ok");
	}
	setDifficulty(d) {
		this.profile.difficulty = d;
		this.flushProfile();
		this.syncHud();
	}
	rename(name) {
		const trimmed = name.trim().slice(0, 24);
		this.profile.displayName = trimmed || "Operator";
		this.flushProfile();
		this.syncHud();
	}
	buySkill(id) {
		if (unlockSkill(this.profile, id)) {
			audio.play("claim");
			this.afterMeta("Protocol upgraded");
		} else audio.play("deny");
	}
	equip(id) {
		if (toggleEquip(this.profile, id)) {
			audio.play("ui");
			this.afterMeta("Loadout updated");
		} else audio.play("deny");
	}
	spendPull() {
		if (!consumePull(this.profile)) {
			audio.play("deny");
			return;
		}
		const rolled = rollModule(this.profile);
		audio.play("claim");
		this.afterMeta(rolled.item ? `Acquired ${rolled.item}` : "+50 scrap (duplicate)");
	}
	claimMissionId(id) {
		const r = claimMission(this.profile, id);
		if (!r) {
			audio.play("deny");
			return;
		}
		audio.play("claim");
		this.afterMeta(rewardLabel(r));
	}
	claimPassLevel(level) {
		const r = claimPass(this.profile, level);
		if (!r) {
			audio.play("deny");
			return;
		}
		audio.play("claim");
		this.afterMeta(rewardLabel(r));
	}
	doPrestige() {
		if (!prestige(this.profile)) {
			audio.play("deny");
			return;
		}
		audio.play("clear");
		this.afterMeta("Prestige +5 skill points");
	}
	claimCrate() {
		const r = claimDailyCrate(this.profile);
		if (!r) {
			audio.play("deny");
			return;
		}
		audio.play("claim");
		useGame.getState().patch({ crateReady: false });
		this.afterMeta(rewardLabel(r));
	}
	buy(item) {
		if (!buyShop(this.profile, item)) {
			audio.play("deny");
			return;
		}
		audio.play("claim");
		this.afterMeta(`Purchased ${item.title}`);
	}
	finishTutorial() {
		this.profile.tutorialDone = true;
		this.flushProfile();
		useGame.getState().patch({
			tutorialStep: 0,
			briefing: false,
			profile: this.profile
		});
	}
	setSetting(key, value) {
		this.profile[key] = value;
		this.renderer.reduced = this.profile.reducedMotion;
		audio.configure({
			musicOn: this.profile.musicEnabled,
			sfxOn: this.profile.sfxEnabled,
			musicVol: this.profile.musicVol,
			sfxVol: this.profile.sfxVol
		});
		this.flushProfile();
		this.syncHud();
	}
	downloadSave() {
		const json = exportProfileJson(this.profile);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `neon-td-save-${this.profile.displayName}.json`;
		a.click();
		URL.revokeObjectURL(url);
		audio.play("claim");
	}
	importSave(raw) {
		const next = importProfileJson(raw);
		if (!next) {
			audio.play("deny");
			useGame.getState().toast("Import failed", "File was not a valid operator save", "danger");
			return;
		}
		this.profile = next;
		this.flushProfile();
		this.syncHud();
		audio.play("claim");
		useGame.getState().toast("Save loaded", "Operator profile restored", "ok");
	}
	pointer(sx, sy, kind) {
		const coord = this.renderer.screenToCell(sx, sy, this.sim.map);
		this.renderer.hover = coord;
		if (kind === "down" && coord) this.handleTile(coord);
	}
	step(dt) {
		if (this.phase === "combat" && !this.paused) {
			this.acc += dt * this.speed;
			let n = 0;
			while (this.acc >= 1 / 60 && n < 8) {
				this.tick(1 / 60);
				this.acc -= 1 / 60;
				n++;
			}
			if (n === 8) this.acc = 0;
		}
		this.renderer.reduced = this.profile.reducedMotion || !this.profile.shakeEnabled;
		if (this.phase === "combat" || this.phase === "upgrade" || this.phase === "gameOver") this.renderer.draw(this.sim, dt, {
			selected: this.selectedCoord,
			hoverKind: this.selectedTower,
			paused: this.paused,
			canPlace: true
		});
		if (performance.now() - this.persistAt > 400) {
			this.syncHudLight();
			this.persistAt = performance.now();
		}
	}
	tick(dt) {
		const equipped = new Set(this.profile.equippedModules);
		const result = this.sim.tick(dt, this.wave, this.profile.difficulty, this.mods, equipped.has("targetingAI"));
		if (result.scrap) this.scrap += result.scrap;
		if (result.coreHeal) {
			this.coreHP = Math.min(this.maxCore + 8, this.coreHP + result.coreHeal);
			this.maxCore = Math.max(this.maxCore, this.coreHP);
		}
		if (result.kills.length) {
			progressMission(this.profile, "Eliminate", result.kills.length);
			this.profile.lifetimeKills += result.kills.length;
			this.runKills += result.kills.length;
		}
		for (const ev of result.events) {
			if (ev.t === "fire") audio.play({
				pulse: "shoot-pulse",
				beam: "shoot-beam",
				nova: "shoot-nova",
				tesla: "shoot-tesla"
			}[ev.kind]);
			if (ev.t === "hit") this.renderer.float(ev.x, ev.y, `${Math.round(ev.dmg)}`, "#e8eef4");
			if (ev.t === "execute") {
				this.renderer.float(ev.x, ev.y, "EXEC", "#5dffb0");
				audio.play("kill");
			}
			if (ev.t === "kill") {
				audio.play("kill");
				const col = ev.kind === "boss" ? "#ff4d6d" : "#3ee8ff";
				this.renderer.burst(ev.x, ev.y, col, ev.kind === "boss" ? 22 : 10, 70);
				this.renderer.addTrauma(ev.kind === "boss" ? .45 : .12);
				this.maybeDropGlyph(ev.kind);
			}
			if (ev.t === "leak") {
				audio.play("leak");
				this.renderer.flash = 1;
				this.renderer.addTrauma(.55);
				this.eventLog = `Core -${ev.dmg}`;
			}
		}
		if (result.coreDamage > 0) {
			this.coreHP -= result.coreDamage;
			if (this.coreHP <= 0) {
				this.coreHP = 0;
				this.failRun();
				return;
			}
		}
		if (this.sim.waveCleared()) this.endWave();
	}
	beginWave() {
		this.sim.resetCombatants();
		this.sim.queueWave(waveComposition(this.wave));
		const income = (this.inRun.income ?? 0) * IN_RUN.income.step;
		if (income) this.scrap += income;
		if (this.mods.corePerWave > 0) {
			const heal = Math.floor(this.mods.corePerWave);
			this.coreHP = Math.min(this.maxCore + 12, this.coreHP + heal);
			this.maxCore = Math.max(this.maxCore, this.coreHP);
		}
		this.eventLog = `Wave ${this.wave} incoming.`;
	}
	endWave() {
		if (this.phase !== "combat") return;
		progressMission(this.profile, "Clear", 1);
		this.checkMilestones();
		this.endless = true;
		this.profile.isEndlessUnlocked = true;
		this.maybeDropChassis();
		this.rng = new SplitMix64(this.seed + this.wave * 997);
		this.offers = this.sim.makeOffers(this.wave, this.rng);
		if (this.profile.pendingRareUpgrades > 0) this.offers.unshift(this.sim.injectRareOffer(this.wave));
		this.noteWave(this.wave);
		this.profile.skillPoints += Math.max(1, Math.floor(this.wave / 5));
		this.profile.battlePassXP += this.wave * 8;
		this.phase = "upgrade";
		this.eventLog = `Wave ${this.wave} cleared. Lane holds.`;
		audio.play("clear");
		this.renderer.addTrauma(.2);
		this.flushProfile();
		this.persistRun();
		this.syncHud();
		if (!this.profile.tutorialDone) useGame.getState().patch({ tutorialStep: 3 });
	}
	failRun() {
		if (this.phase === "gameOver") return;
		this.noteWave(this.wave);
		this.phase = "gameOver";
		this.eventLog = `Core breached on wave ${this.wave}.`;
		this.profile.lastRecap = this.makeRecap("death");
		audio.play("gameover");
		this.flushProfile();
		this.persistRun();
		this.syncHud();
	}
	checkMilestones() {
		for (const m of MILESTONES) {
			if (m.wave !== this.wave || this.claimed.has(m.wave)) continue;
			this.claimed.add(m.wave);
			if (m.reward.type === "currency") this.scrap += m.reward.amount;
			else if (m.reward.type === "gachaPull") {
				this.profile.inventoryPulls += 1;
				this.rollDrop();
			} else if (m.reward.type === "rareUpgrade") this.profile.pendingRareUpgrades += 1;
			this.eventLog = `Milestone wave ${m.wave} claimed.`;
			useGame.getState().toast("Milestone", rewardLabel(m.reward), "ok");
		}
	}
	rollDrop() {
		const rolled = rollModule(this.profile);
		if (rolled.item) {
			this.eventLog = `Module acquired.`;
			useGame.getState().toast("Module drop", rolled.item, "ok");
		} else this.scrap += 50;
	}
	inspect(coord) {
		const t = this.sim.towerAt(coord);
		if (!t) return this.eventLog;
		const cost = this.sim.rankUpCost(coord);
		const sell = this.sim.sellRefund(coord) ?? 0;
		return `${TOWER[t.kind].label} R${t.rank}  next ${cost ?? "MAX"}  sell ${sell}`;
	}
	persistRun() {
		saveRun({
			schemaVersion: 3,
			seed: this.seed,
			wave: this.wave,
			phase: this.phase,
			coreHP: this.coreHP,
			scrap: this.scrap,
			claimedMilestones: [...this.claimed],
			isEndlessUnlocked: this.endless,
			difficulty: this.profile.difficulty,
			towers: this.sim.towers.map((t) => ({
				kind: t.kind,
				coord: t.coord,
				rank: t.rank,
				invested: t.invested
			})),
			runDamageBonus: this.sim.runDamageBonus,
			runRangeBonus: this.sim.runRangeBonus,
			runFireRateBonus: this.sim.runFireRateBonus,
			runBountyBonus: this.sim.runBountyBonus,
			corePatchUsed: this.corePatchUsed,
			inRun: { ...this.inRun },
			runKills: this.runKills
		});
	}
	refreshMods() {
		const run = {
			damage: damageBonus(this.profile) + this.sim.runDamageBonus + (this.inRun.dmg ?? 0) * IN_RUN.dmg.step,
			range: rangeBonus(this.profile) + this.sim.runRangeBonus + (this.inRun.rng ?? 0) * IN_RUN.rng.step,
			fireRate: fireRateBonus(this.profile) + this.sim.runFireRateBonus + (this.inRun.rate ?? 0) * IN_RUN.rate.step,
			bounty: bountyBonus(this.profile) + this.sim.runBountyBonus + (this.inRun.bounty ?? 0) * IN_RUN.bounty.step
		};
		const { mods, cipher } = loadoutMods(this.profile, run);
		this.mods = mods;
		this.cipherName = cipher?.name ?? null;
	}
	noteWave(wave) {
		this.profile.highestWaveReached = Math.max(this.profile.highestWaveReached, wave);
		const d = this.profile.difficulty;
		this.profile.highestByDifficulty[d] = Math.max(this.profile.highestByDifficulty[d] ?? 0, wave);
	}
	settleRun(reason) {
		if (this.settled) return;
		this.settled = true;
		this.noteWave(this.wave);
		this.profile.totalRunsCompleted += 1;
		this.profile.isEndlessUnlocked = true;
		const recap = this.makeRecap(reason);
		this.profile.lastRecap = recap;
		this.profile.bankScrap += recap.banked;
		clearRun();
		this.flushProfile();
		const title = reason === "cashout" ? "Coins banked" : reason === "abort" ? "Run aborted" : "Core offline";
		useGame.getState().toast(title, `+${recap.banked} coins · wave ${this.wave}`, reason === "death" ? "danger" : "ok");
	}
	makeRecap(reason) {
		const diff = DIFFICULTY_MOD[this.profile.difficulty];
		const mult = (reason === "abort" ? .5 : 1) * diff.reward * (1 + coinBonus(this.profile));
		const raw = this.wave * 12 + this.runKills * .4 + this.scrap * .12;
		const banked = Math.max(0, Math.floor(raw * mult));
		const ch = equippedChassis(this.profile);
		const word = ch ? matchCipher(ch.sockets) : null;
		return {
			wave: this.wave,
			difficulty: this.profile.difficulty,
			banked,
			glyphs: [...this.runGlyphs],
			chassis: this.runChassisDrop,
			kills: this.runKills,
			cipherName: word?.name ?? this.cipherName
		};
	}
	maybeDropGlyph(kind) {
		const drop = (1 + dropBonus(this.profile)) * DIFFICULTY_MOD[this.profile.difficulty].drop;
		const chance = kind === "boss" ? 1 : kind === "tank" ? .1 * drop : .022 * drop;
		if (this.rng.nextFloat() > chance) return;
		const g = pickGlyph(this.wave, () => this.rng.nextFloat());
		addGlyph(this.profile, g);
		this.runGlyphs.push(g);
		useGame.getState().toast("Glyph drop", g.toUpperCase(), "ok");
	}
	maybeDropChassis() {
		const kind = pickChassis(this.wave, () => this.rng.nextFloat());
		if (!kind) return;
		this.profile.chassis.push(emptyChassis(kind));
		this.runChassisDrop = kind;
		useGame.getState().toast("Chassis recovered", kind, "ok");
	}
	afterMeta(msg) {
		this.flushProfile();
		this.syncHud();
		useGame.getState().toast("Ops", msg, "ok");
	}
	flushProfile() {
		const unlocked = checkAchievements(this.profile);
		saveProfile(this.profile);
		for (const a of unlocked) useGame.getState().toast(a.title, a.detail, "ok");
	}
	syncHud() {
		useGame.getState().patch({
			phase: this.phase,
			wave: this.wave,
			scrap: this.scrap,
			bankScrap: this.profile.bankScrap,
			coreHP: this.coreHP,
			maxCore: this.maxCore,
			paused: this.paused,
			speed: this.speed,
			selectedTower: this.selectedTower,
			selectedCoord: this.selectedCoord,
			eventLog: this.eventLog,
			offers: this.offers,
			pendingRare: this.profile.pendingRareUpgrades,
			pulls: this.profile.inventoryPulls,
			skillPoints: this.profile.skillPoints,
			difficulty: this.profile.difficulty,
			hasSavedRun: !!loadRun(),
			profile: {
				...this.profile,
				missions: this.profile.missions.map((m) => ({ ...m }))
			},
			enemiesAlive: this.sim.enemies.length,
			pendingSpawns: this.sim.pendingSpawns(),
			inspectText: this.selectedCoord ? this.inspect(this.selectedCoord) : "",
			endless: true,
			inRun: { ...this.inRun },
			cipherName: this.cipherName,
			labOpen: this.labOpen,
			recap: this.profile.lastRecap
		});
	}
	syncHudLight() {
		if (this.phase !== "combat") return;
		useGame.getState().patch({
			scrap: this.scrap,
			coreHP: this.coreHP,
			enemiesAlive: this.sim.enemies.length,
			pendingSpawns: this.sim.pendingSpawns(),
			eventLog: this.eventLog
		});
	}
};
var engine = null;
function getEngine() {
	return engine;
}
function bindEngine(e) {
	engine = e;
	if (typeof window !== "undefined") window.__neonTD = e;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Btn({ variant = "ghost", className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium tracking-wide transition-transform duration-150 ease-out", "disabled:cursor-not-allowed disabled:opacity-40", "active:enabled:scale-[0.98]", variant === "primary" && "bg-cyan text-cyan-fg hover:brightness-110", variant === "ghost" && "border border-line bg-panel text-fg hover:border-line-strong", variant === "quiet" && "bg-panel-2 text-muted hover:text-fg", variant === "danger" && "border border-signal/40 text-signal hover:bg-signal/10", className),
		...props,
		children
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-line bg-panel p-4", className),
		children
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-[0.14em] text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-display text-xl font-semibold tabular text-ice",
			children: value
		})]
	});
}
function Bar({ value, max }) {
	const pct = max <= 0 ? 0 : Math.min(100, value / max * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 overflow-hidden rounded-full bg-panel-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-cyan",
			style: { width: `${pct}%` }
		})
	});
}
function NeonApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const screen = useGame((s) => s.screen);
	const toasts = useGame((s) => s.toasts);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new GameEngine(canvas);
		bindEngine(engine);
		let dead = false;
		engine.boot().then(() => {
			if (dead) return;
			engine.renderer.resize();
			engine.startLoop();
		});
		const onResize = () => engine.renderer.resize();
		const onKey = (e) => {
			const g = getEngine();
			if (!g) return;
			if (e.key === " ") {
				e.preventDefault();
				g.pauseToggle();
			}
			if (e.key === "1") g.selectTower("pulse");
			if (e.key === "2") g.selectTower("beam");
			if (e.key === "3") g.selectTower("nova");
			if (e.key === "4") g.selectTower("tesla");
			if (e.key === "Escape") {
				if (useGame.getState().screen === "play") g.pauseToggle();
				else useGame.getState().patch({ screen: "menu" });
			}
		};
		window.addEventListener("resize", onResize);
		window.addEventListener("keydown", onKey);
		return () => {
			dead = true;
			engine.stopLoop();
			window.removeEventListener("resize", onResize);
			window.removeEventListener("keydown", onKey);
		};
	}, []);
	const playing = screen === "play";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-ink text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: cn("absolute inset-0 h-full w-full touch-none", playing ? "opacity-100" : "pointer-events-none opacity-0"),
				onPointerDown: (e) => {
					const g = getEngine();
					if (!g) return;
					const r = e.currentTarget.getBoundingClientRect();
					g.pointer(e.clientX - r.left, e.clientY - r.top, "down");
				},
				onPointerMove: (e) => {
					const g = getEngine();
					if (!g) return;
					const r = e.currentTarget.getBoundingClientRect();
					g.pointer(e.clientX - r.left, e.clientY - r.top, "move");
				}
			}),
			!playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuLayer, {}),
			playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayHud, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastStack, { toasts })
		]
	});
}
function MenuLayer() {
	const screen = useGame((s) => s.screen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 bg-cover bg-center opacity-50",
				style: { backgroundImage: "url(/textures/menu.jpg)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/75 to-ink" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-full max-w-lg flex-col px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]",
				children: [
					screen === "boot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootCard, {}),
					screen === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuHome, {}),
					screen === "skills" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillsPane, {}),
					screen === "workshop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkshopPane, {}),
					screen === "forge" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgePane, {}),
					screen === "modules" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulesPane, {}),
					screen === "pass" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassPane, {}),
					screen === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopPane, {}),
					screen === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPane, {}),
					screen === "ops" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsPane, {})
				]
			})
		]
	});
}
function BootCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[72dvh] flex-col items-center justify-center gap-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "enter-rise space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.4em] text-muted",
					children: "Grid online"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-6xl font-semibold leading-none tracking-[0.18em] text-ice",
					children: "NEON"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl leading-none tracking-[0.32em] text-cyan",
					children: "TOWER DEFENSE"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "primary",
			className: "min-w-48",
			onClick: () => getEngine()?.enterMenu(),
			children: "Enter grid"
		})]
	});
}
function MenuHome() {
	const p = useGame((s) => s.profile);
	const hasRun = useGame((s) => s.hasSavedRun);
	const crate = useGame((s) => s.crateReady);
	const difficulty = useGame((s) => s.difficulty);
	const briefing = useGame((s) => s.briefing);
	const missions = p.missions;
	const nextMilestone = [
		10,
		25,
		50
	].find((w) => p.highestWaveReached < w) ?? 50;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "enter-rise pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs uppercase tracking-[0.35em] text-muted",
						children: ["Operator ", p.displayName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl font-semibold tracking-[0.16em] text-ice",
						children: "NEON TD"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-sm text-sm text-muted",
						children: "Endless circuit. Cash upgrades in-run, bank coins into the Workshop, socket glyphs into Cipher Words."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Wave",
						value: p.highestWaveReached
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Prestige",
						value: p.prestigeLevel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Streak",
						value: p.loginStreak
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Bank",
						value: p.bankScrap
					})
				]
			}),
			briefing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-cyan",
						children: "Field briefing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Tap dark tiles to deploy Pulse. Waves never end. Spend scrap in the Lab during a run. After you fall or bank, spend coins on permanent Workshop ranks. Socket glyphs in the Forge like rune words."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "quiet",
						onClick: () => getEngine()?.finishTutorial(),
						children: "Mark as read"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: DIFFICULTIES.map((d) => {
					const open = difficultyUnlocked(p, d);
					const spec = DIFFICULTY_MOD[d];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !open,
						onClick: () => open && getEngine()?.setDifficulty(d),
						className: cn("min-h-11 flex-1 rounded-md border text-xs uppercase tracking-wider", difficulty === d ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-muted hover:text-fg", !open && "opacity-40"),
						children: open ? spec.label : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto size-3.5" })
					}, d);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-[11px] text-faint",
				children: [
					DIFFICULTY_MOD[difficulty].label,
					" · HP ",
					DIFFICULTY_MOD[difficulty].hp,
					"x · coins",
					" ",
					DIFFICULTY_MOD[difficulty].reward,
					"x",
					DIFFICULTIES.filter((d) => !difficultyUnlocked(p, d)).length > 0 && ` · unlocks at wave ${DIFFICULTIES.filter((d) => !difficultyUnlocked(p, d)).map((d) => DIFFICULTY_MOD[d].unlock).join("/")}`
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "primary",
				onClick: () => getEngine()?.startGame(difficulty),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Start new run"]
			}),
			hasRun && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => getEngine()?.continueRun(),
				children: "Continue run"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.2em] text-muted",
							children: "Daily ops"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-faint",
							children: ["Resets ", formatHMS(msUntilMidnight())]
						})]
					}),
					missions.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.description }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular text-muted",
									children: [
										m.progress,
										"/",
										m.target
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								value: m.progress,
								max: m.target
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									variant: "quiet",
									className: "min-h-9 px-3 text-xs",
									disabled: m.claimed || m.progress < m.target,
									onClick: () => getEngine()?.claimMissionId(m.id),
									children: m.claimed ? "Claimed" : "Claim"
								})
							})
						]
					}, m.id)),
					crate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "primary",
						onClick: () => getEngine()?.claimCrate(),
						children: "Claim daily crate"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-xs text-faint",
				children: [
					"Endless waves · Next milestone ",
					nextMilestone,
					" · Pass lvl ",
					passLevel(p.battlePassXP)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "size-4" }),
						label: "Workshop",
						to: "workshop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hexagon, { className: "size-4" }),
						label: "Forge",
						to: "forge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
						label: "Skills",
						to: "skills"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "size-4" }),
						label: "Modules",
						to: "modules"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" }),
						label: "Battle pass",
						to: "pass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
						label: "Shop",
						to: "shop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "size-4" }),
						label: "Ops log",
						to: "ops"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavTile, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cog, { className: "size-4" }),
						label: "Settings",
						to: "settings"
					})
				]
			})
		]
	});
}
function NavTile({ icon, label, to }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => {
			useGame.getState().patch({ screen: to });
		},
		className: "flex min-h-14 items-center gap-3 rounded-lg border border-line bg-panel px-4 text-left text-sm hover:border-line-strong",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-cyan",
			children: icon
		}), label]
	});
}
function Back() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
		variant: "quiet",
		className: "self-start",
		onClick: () => useGame.getState().patch({ screen: "menu" }),
		children: "Back"
	});
}
function SkillsPane() {
	const p = useGame((s) => s.profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Skills"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Points ", p.skillPoints]
			}),
			SKILL_IDS.map((id) => {
				const spec = SKILL[id];
				const rank = p.skillRanks[id] ?? 0;
				const cost = spec.cost * (rank + 1);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: spec.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							spec.detail,
							" · ",
							rank,
							"/",
							spec.max
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "primary",
						className: "min-h-10",
						disabled: rank >= spec.max || p.skillPoints < cost,
						onClick: () => getEngine()?.buySkill(id),
						children: rank >= spec.max ? "Max" : `${cost} pts`
					})]
				}, id);
			})
		]
	});
}
function WorkshopPane() {
	const p = useGame((s) => s.profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Workshop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Permanent ranks. Bank coins from every run. Coins ", p.bankScrap]
			}),
			WORKSHOP_IDS.map((id) => {
				const spec = WORKSHOP[id];
				const rank = workshopRank(p, id);
				const cost = workshopCost(p, id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: spec.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							"Lv ",
							rank,
							" · ",
							spec.detail(rank),
							" · ",
							spec.per
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "primary",
						className: "min-h-10",
						disabled: p.bankScrap < cost,
						onClick: () => getEngine()?.buyWorkshopId(id),
						children: cost
					})]
				}, id);
			})
		]
	});
}
function ForgePane() {
	const p = useGame((s) => s.profile);
	const [pick, setPick] = (0, import_react.useState)(null);
	const equipped = p.chassis.find((c) => c.id === p.equippedChassisId) ?? p.chassis[0];
	const word = equipped ? prefixCipher(equipped.sockets) : null;
	const complete = equipped ? equipped.sockets.every((s) => s) && word && word.have === equipped.sockets.length : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Forge"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Socket glyphs in order. A complete sequence becomes a Cipher Word and replaces the individual bonuses."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: p.chassis.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => getEngine()?.equipChassis(ch.id),
					className: cn("min-h-11 shrink-0 rounded-md border px-3 text-xs uppercase tracking-wider", ch.id === equipped?.id ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-muted"),
					children: CHASSIS[ch.kind].label
				}, ch.id))
			}),
			equipped && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs uppercase tracking-[0.2em] text-muted",
								children: [CHASSIS[equipped.kind].sockets, " sockets"]
							}),
							complete && word && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg tracking-widest text-cyan",
								children: word.cipher.name
							}),
							!complete && word && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"Building ",
									word.cipher.name,
									" ",
									word.have,
									"/",
									equipped.sockets.length
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: equipped.sockets.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								if (pick) getEngine()?.socket(equipped.id, i, pick);
								else if (g) getEngine()?.unsocketSlot(equipped.id, i);
							},
							className: cn("grid size-14 place-items-center rounded-md border font-mono text-xs tracking-wider", g ? "border-cyan bg-cyan/10 text-ice" : "border-line text-faint"),
							children: g ? GLYPH[g].mark : i + 1
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-faint",
						children: "Tap a glyph, then a socket. Empty socket tap unsockets."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Glyph rack"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-2",
					children: GLYPH_IDS.map((id) => {
						const n = p.glyphs[id] ?? 0;
						const spec = GLYPH[id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: n <= 0,
							onClick: () => setPick(pick === id ? null : id),
							className: cn("rounded-md border px-2 py-2 text-left disabled:opacity-30", pick === id ? "border-cyan bg-cyan/15" : "border-line"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xs text-cyan",
								children: spec.mark
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted",
								children: [
									spec.label,
									" · ",
									n
								]
							})]
						}, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Cipher codex"
				}), CIPHERS.map((c) => {
					const known = p.discoveredCiphers.includes(c.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: known ? "text-ice" : "text-muted",
							children: known ? c.name : "????"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-faint",
							children: recipeHint(c, known)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted",
							children: [c.recipe.length, "s"]
						})]
					}, c.id);
				})]
			})
		]
	});
}
function ModulesPane() {
	const p = useGame((s) => s.profile);
	const pulls = useGame((s) => s.pulls);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Modules"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Pulls ",
					pulls,
					" · Equipped ",
					p.equippedModules.length,
					"/3"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "primary",
				disabled: pulls <= 0,
				onClick: () => getEngine()?.spendPull(),
				children: "Spend pull"
			}),
			p.ownedModules.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No modules yet. Clear wave 10 or spend a pull."
			}),
			p.ownedModules.map((id) => {
				const spec = MODULE[id];
				const on = p.equippedModules.includes(id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: spec.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: spec.detail
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => getEngine()?.equip(id),
						children: on ? "Unequip" : "Equip"
					})]
				}, id);
			})
		]
	});
}
function PassPane() {
	const p = useGame((s) => s.profile);
	const lvl = passLevel(p.battlePassXP);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Battle pass"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Level ",
					lvl,
					" · ",
					p.battlePassXP,
					" XP"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
				value: p.battlePassXP % 100,
				max: 100
			}),
			PASS_TRACK.map((t) => {
				const claimed = p.battlePassClaimed.includes(t.level);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-medium",
						children: ["Tier ", t.level]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: rewardLabel(t.reward)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "primary",
						disabled: claimed || lvl < t.level,
						onClick: () => getEngine()?.claimPassLevel(t.level),
						children: claimed ? "Claimed" : "Claim"
					})]
				}, t.level);
			})
		]
	});
}
function ShopPane() {
	const p = useGame((s) => s.profile);
	const items = shopForDay(p.dailyShopDay || dayStamp());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Night market"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Bank ",
					p.bankScrap,
					" · Rotates at midnight"
				]
			}),
			items.map((item) => {
				const bought = p.dailyShopBought.includes(item.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: item.detail
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "primary",
						disabled: bought || p.bankScrap < item.cost,
						onClick: () => getEngine()?.buy(item),
						children: bought ? "Sold" : `${item.cost}`
					})]
				}, item.id);
			})
		]
	});
}
function OpsPane() {
	const p = useGame((s) => s.profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Ops log"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Runs",
				value: p.totalRunsCompleted
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 text-sm text-muted",
				children: [
					"Kills ",
					p.lifetimeKills,
					" · Achievements ",
					p.achievementsClaimed.length,
					"/12 · Ciphers",
					" ",
					p.discoveredCiphers.length
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-2",
				children: [p.achievementsClaimed.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No seals yet. Clear waves to stamp the log."
				}), p.achievementsClaimed.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm capitalize text-cyan",
					children: id.replace("-", " ")
				}, id))]
			})
		]
	});
}
function SettingsPane() {
	const p = useGame((s) => s.profile);
	const [name, setName] = (0, import_react.useState)(p.displayName);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Back, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Callsign"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => setName(e.target.value),
						className: "h-11 w-full rounded-md border border-line bg-ink px-3 text-fg outline-none focus:border-cyan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => getEngine()?.rename(name),
						children: "Save name"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Music",
						on: p.musicEnabled,
						onChange: (v) => getEngine()?.setSetting("musicEnabled", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Effects",
						on: p.sfxEnabled,
						onChange: (v) => getEngine()?.setSetting("sfxEnabled", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Screen shake",
						on: p.shakeEnabled,
						onChange: (v) => getEngine()?.setSetting("shakeEnabled", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Reduce motion",
						on: p.reducedMotion,
						onChange: (v) => getEngine()?.setSetting("reducedMotion", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Music level",
						value: p.musicVol,
						onChange: (v) => getEngine()?.setSetting("musicVol", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Effects level",
						value: p.sfxVol,
						onChange: (v) => getEngine()?.setSetting("sfxVol", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "primary",
				disabled: p.highestWaveReached < 50,
				onClick: () => getEngine()?.doPrestige(),
				children: "Prestige (+5 skill points)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-faint",
				children: "Unlocks after wave 50. Keeps skills, modules, workshop, and forge."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Operator save"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => getEngine()?.downloadSave(),
						children: "Download save file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center justify-center rounded-md border border-line bg-panel text-sm",
						children: ["Import save", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "application/json",
							className: "hidden",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								file.text().then((t) => getEngine()?.importSave(t));
								e.target.value = "";
							}
						})]
					})
				]
			})
		]
	});
}
function Toggle({ label, on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: "flex min-h-11 w-full items-center justify-between",
		onClick: () => onChange(!on),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("h-6 w-10 rounded-full p-0.5 transition-colors", on ? "bg-cyan" : "bg-panel-2"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block h-5 w-5 rounded-full bg-ink transition-transform", on && "translate-x-4") })
		})]
	});
}
function Slider({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max: 1,
			step: .01,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "w-full accent-cyan"
		})]
	});
}
function PlayHud() {
	const phase = useGame((s) => s.phase);
	const wave = useGame((s) => s.wave);
	const scrap = useGame((s) => s.scrap);
	const core = useGame((s) => s.coreHP);
	const maxCore = useGame((s) => s.maxCore);
	const paused = useGame((s) => s.paused);
	const speed = useGame((s) => s.speed);
	const selected = useGame((s) => s.selectedTower);
	const inspect = useGame((s) => s.inspectText);
	const selectedCoord = useGame((s) => s.selectedCoord);
	const log = useGame((s) => s.eventLog);
	const pending = useGame((s) => s.pendingSpawns);
	const alive = useGame((s) => s.enemiesAlive);
	const tutorial = useGame((s) => s.tutorialStep);
	const cipher = useGame((s) => s.cipherName);
	const labOpen = useGame((s) => s.labOpen);
	const inRun = useGame((s) => s.inRun);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-x-0 top-0 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mx-auto flex max-w-4xl items-center gap-2 rounded-lg border border-line hud-panel px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-xs tracking-widest text-cyan",
						children: ["WAVE ", wave]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] uppercase text-muted",
						children: "endless"
					}),
					cipher && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden font-mono text-[11px] tracking-widest text-ok sm:block",
						children: cipher
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-3 font-mono text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-ice tabular",
							children: [scrap, " SCRAP"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("flex items-center gap-1 tabular", core <= 5 ? "text-signal" : "text-ok"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }),
								core,
								"/",
								maxCore
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "grid size-11 place-items-center rounded-md text-fg",
						onClick: () => getEngine()?.pauseToggle(),
						"aria-label": paused ? "Resume" : "Pause",
						children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "grid size-11 place-items-center rounded-md text-muted",
						onClick: () => getEngine()?.setSpeed(speed === 3 ? 1 : speed + 1),
						"aria-label": "Speed",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastForward, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden text-[11px] text-faint sm:inline",
						children: [speed, "x"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto mt-2 max-w-4xl px-1 font-mono text-[11px] text-muted",
				children: [
					log,
					" · ",
					alive,
					" live · ",
					pending,
					" inbound",
					cipher && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "sm:hidden",
						children: [" · ", cipher]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 bottom-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
			children: [
				labOpen && phase !== "gameOver" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-2 grid max-w-4xl grid-cols-3 gap-2 rounded-lg border border-line hud-panel p-2",
					children: IN_RUN_IDS.map((id) => {
						const spec = IN_RUN[id];
						const bought = inRun[id] ?? 0;
						const cost = inRunCost(bought, id, wave);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => getEngine()?.buyInRun(id),
							disabled: scrap < cost,
							className: "rounded-md border border-line bg-panel px-2 py-2 text-left disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-medium",
								children: spec.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[11px] text-cyan",
								children: [
									cost,
									" · ",
									id === "repair" ? "heal" : `x${bought}`
								]
							})]
						}, id);
					})
				}),
				selectedCoord && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mb-2 flex max-w-4xl items-center gap-2 rounded-lg border border-line hud-panel px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 font-mono text-xs text-muted",
							children: inspect
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							className: "min-h-10",
							onClick: () => getEngine()?.rankSelected(),
							children: "Rank"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							className: "min-h-10",
							onClick: () => getEngine()?.sellSelected(),
							children: "Sell"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-4xl grid-cols-5 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => getEngine()?.toggleLab(),
						className: cn("flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2", labOpen ? "border-cyan bg-cyan/15" : "border-line hud-panel"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-4 text-cyan" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs",
								children: "Lab"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] text-muted",
								children: "cash"
							})
						]
					}), TOWER_KINDS.map((kind) => {
						const spec = TOWER[kind];
						const on = selected === kind;
						const afford = scrap >= spec.cost;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => getEngine()?.selectTower(kind),
							className: cn("flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2", on ? "border-cyan bg-cyan/15" : "border-line hud-panel", !afford && "opacity-50"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-cyan" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs",
									children: spec.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[11px] text-muted",
									children: spec.cost
								})
							]
						}, kind);
					})]
				})
			]
		}),
		tutorial > 0 && tutorial < 4 && phase === "combat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 top-24 flex justify-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto max-w-sm rounded-lg border border-line hud-panel px-4 py-3 text-sm",
				children: [
					tutorial === 1 && "Tap a dark tile beside the circuit to deploy Pulse.",
					tutorial === 2 && "Hostiles leak into the vault if they finish the lane. Keep fire on the front.",
					tutorial === 3 && "Wave clear. Install an upgrade, then launch the next wave.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "quiet",
							className: "min-h-9",
							onClick: () => getEngine()?.finishTutorial(),
							children: "Dismiss"
						})
					})
				]
			})
		}),
		paused && phase === "combat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CenterCard, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Paused"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "primary",
				onClick: () => getEngine()?.pauseToggle(),
				children: "Resume"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => getEngine()?.returnToMenu(),
				children: "Abort to menu"
			})
		] }),
		phase === "upgrade" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradeCard, {}),
		phase === "gameOver" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverCard, {})
	] });
}
function CenterCard({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 grid place-items-center bg-ink/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex max-h-[85dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-panel p-6",
			children
		})
	});
}
function UpgradeCard() {
	const wave = useGame((s) => s.wave);
	const scrap = useGame((s) => s.scrap);
	const core = useGame((s) => s.coreHP);
	const offers = useGame((s) => s.offers);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CenterCard, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "font-display text-2xl tracking-wide text-cyan",
			children: [
				"Wave ",
				wave,
				" cleared"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				"Scrap ",
				scrap,
				" · Core ",
				core
			]
		}),
		offers.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			disabled: o.cost > 0 && scrap < o.cost,
			onClick: () => getEngine()?.buyOffer(o),
			className: "rounded-lg border border-line bg-panel-2 p-3 text-left disabled:opacity-40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: o.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm text-cyan",
					children: o.cost === 0 ? "FREE" : o.cost
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted",
				children: o.detail
			})]
		}, o.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "primary",
			onClick: () => getEngine()?.startNextWave(),
			children: "Next wave"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			onClick: () => getEngine()?.cashOut(),
			children: "Bank coins to Workshop"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "quiet",
			onClick: () => getEngine()?.returnToMenu(),
			children: "Abort (half coins)"
		})
	] });
}
function GameOverCard() {
	const wave = useGame((s) => s.wave);
	const core = useGame((s) => s.coreHP);
	const p = useGame((s) => s.profile);
	const recap = p.lastRecap;
	const engine = getEngine();
	const canPatch = engine ? !engine.corePatchUsed && core <= 0 && (p.bankScrap >= 80 || useGame.getState().scrap >= 80) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CenterCard, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: cn("font-display text-3xl", core > 0 ? "text-cyan" : "text-signal"),
			children: core > 0 ? "Run banked" : "Core offline"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				"Reached wave ",
				wave,
				" · ",
				DIFFICULTY_MOD[p.difficulty].label
			]
		}),
		recap && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "space-y-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Coins banked"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular text-cyan",
						children: recap.banked
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Kills"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular",
						children: recap.kills
					})]
				}),
				recap.cipherName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Cipher"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tracking-widest text-cyan",
						children: recap.cipherName
					})]
				}),
				recap.glyphs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted",
					children: ["Glyphs ", recap.glyphs.map((g) => g.toUpperCase()).join(" · ")]
				})
			]
		}),
		canPatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			onClick: () => getEngine()?.corePatch(),
			children: "Emergency patch (80 scrap)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "primary",
			onClick: () => getEngine()?.retry(),
			children: "Retry"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			onClick: () => getEngine()?.exitTo("workshop"),
			children: "Open Workshop"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			onClick: () => getEngine()?.exitTo("forge"),
			children: "Open Forge"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "quiet",
			onClick: () => getEngine()?.returnToMenu(),
			children: "Menu"
		})
	] });
}
function ToastStack({ toasts }) {
	(0, import_react.useEffect)(() => {
		if (!toasts.length) return;
		const id = toasts[toasts.length - 1].id;
		const t = window.setTimeout(() => useGame.getState().dismissToast(id), 3200);
		return () => window.clearTimeout(t);
	}, [toasts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute right-3 top-3 z-20 flex w-64 flex-col gap-2 pt-[env(safe-area-inset-top)]",
		children: toasts.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex items-start gap-2 rounded-md border border-line bg-panel px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: t.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted",
					children: t.detail
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => useGame.getState().dismissToast(t.id),
				className: "text-faint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}, t.id))
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonApp, {});
}
//#endregion
export { Home as component };
