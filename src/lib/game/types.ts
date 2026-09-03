export type GamePhase = "menu" | "combat" | "upgrade" | "gameOver";
export type Screen =
  | "boot"
  | "menu"
  | "play"
  | "skills"
  | "modules"
  | "pass"
  | "settings"
  | "shop"
  | "ops"
  | "workshop"
  | "forge";
export type DifficultyTier = "normal" | "hard" | "nightmare" | "insane";
export type EnemyKind = "bit" | "virus" | "tank" | "boss";
export type TowerKind = "pulse" | "beam" | "nova" | "tesla";
export type SkillId =
  | "scrapCache"
  | "coreShield"
  | "overclock"
  | "rangeAmp"
  | "bountyProtocol";
export type ModuleId =
  | "focusingLens"
  | "coolantLoop"
  | "rippleCapacitor"
  | "targetingAI";
export type WorkshopId =
  | "attack"
  | "defense"
  | "cash"
  | "coins"
  | "range"
  | "cooldown"
  | "drop";
export type InRunId = "dmg" | "rng" | "rate" | "bounty" | "repair" | "income";
export type GlyphId =
  | "spark"
  | "ion"
  | "hex"
  | "volt"
  | "node"
  | "flux"
  | "coil"
  | "arc"
  | "surge"
  | "kernel"
  | "nulls"
  | "apex"
  | "prism"
  | "voids"
  | "sigma"
  | "zenith";
export type ChassisKind = "dual" | "tri" | "quad" | "hex";
export type CipherId =
  | "ignite"
  | "static"
  | "drift"
  | "lash"
  | "insight"
  | "haste"
  | "bulwark"
  | "reaper"
  | "spirit"
  | "fortitude"
  | "enigma"
  | "infinity"
  | "grief"
  | "lastWish"
  | "phoenix";
export type Reward =
  | { type: "currency"; amount: number }
  | { type: "gachaPull" }
  | { type: "rareUpgrade" }
  | { type: "battlePassXP"; amount: number }
  | { type: "skillPoints"; amount: number }
  | { type: "glyph"; id: GlyphId }
  | { type: "chassis"; kind: ChassisKind };

export type GridCoord = { x: number; y: number };

export type EnemyState = {
  id: number;
  kind: EnemyKind;
  health: number;
  maxHealth: number;
  pathIndex: number;
  alive: boolean;
  hitFlash: number;
};

export type TowerState = {
  id: number;
  kind: TowerKind;
  coord: GridCoord;
  cooldown: number;
  rank: number;
  facing: number;
  invested: number;
};

export type ProjectileState = {
  id: number;
  ox: number;
  oy: number;
  targetId: number;
  damage: number;
  kind: TowerKind;
  travel: number;
  splash: boolean;
};

export type UpgradeEffect =
  | { type: "damage"; v: number }
  | { type: "range"; v: number }
  | { type: "fireRate"; v: number }
  | { type: "core"; v: number }
  | { type: "scrap"; v: number }
  | { type: "rare" };

export type UpgradeOffer = {
  id: number;
  title: string;
  detail: string;
  cost: number;
  apply: UpgradeEffect;
};

export type DailyMission = {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: Reward;
  claimed: boolean;
  /** True once the player watched a rewarded ad to double this mission's
   *  reward. Resets naturally with the daily mission refresh. */
  adBoosted: boolean;
};

export type ShopItem = {
  id: string;
  title: string;
  detail: string;
  cost: number;
  kind: "pull" | "skill" | "rare" | "patch" | "chip" | "glyph";
};

export type AchievementId =
  | "first-clear"
  | "wave-10"
  | "wave-25"
  | "wave-50"
  | "prestige"
  | "collector"
  | "streak-7"
  | "specialist"
  | "century"
  | "cipher"
  | "wave-100"
  | "insane-20";

export type Toast = {
  id: number;
  title: string;
  detail: string;
  tone: "info" | "ok" | "danger";
};

export type ChassisInstance = {
  id: string;
  kind: ChassisKind;
  sockets: Array<GlyphId | null>;
};

export type RunRecap = {
  wave: number;
  difficulty: DifficultyTier;
  banked: number;
  glyphs: GlyphId[];
  chassis: ChassisKind | null;
  kills: number;
  cipherName: string | null;
};

export type CombatMods = {
  damage: number;
  range: number;
  fireRate: number;
  bounty: number;
  splashAdd: number;
  splashConvert: number;
  execute: number;
  coreOnKill: number;
  corePerWave: number;
};

export type PlayerProfile = {
  version: number;
  displayName: string;
  highestWaveReached: number;
  prestigeLevel: number;
  totalRunsCompleted: number;
  skillPoints: number;
  skillRanks: Partial<Record<SkillId, number>>;
  ownedModules: ModuleId[];
  equippedModules: ModuleId[];
  battlePassXP: number;
  battlePassClaimed: number[];
  isEndlessUnlocked: boolean;
  lastMissionResetDay: string;
  missions: DailyMission[];
  difficulty: DifficultyTier;
  bankScrap: number;
  inventoryPulls: number;
  pendingRareUpgrades: number;
  loginStreak: number;
  lastLoginDay: string;
  lastSeenAt: number;
  lifetimeKills: number;
  achievementsClaimed: AchievementId[];
  tutorialDone: boolean;
  dailyCrateDay: string;
  dailyShopBought: string[];
  dailyShopDay: string;
  /** Rewarded-ad bonus placements, each capped to once per calendar day. */
  dailyCrateAdBonusDay: string;
  dailyShopAdBonusDay: string;
  dailyPassAdBonusDay: string;
  nextRunCoreBonus: number;
  nextRunDamageBonus: number;
  reducedMotion: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVol: number;
  sfxVol: number;
  shakeEnabled: boolean;
  workshop: Partial<Record<WorkshopId, number>>;
  glyphs: Partial<Record<GlyphId, number>>;
  chassis: ChassisInstance[];
  equippedChassisId: string | null;
  discoveredCiphers: CipherId[];
  lastRecap: RunRecap | null;
  highestByDifficulty: Partial<Record<DifficultyTier, number>>;
  /** Set when a loaded/imported save's economy fields don't match its
   *  checksum (see meta.ts) — e.g. hand-edited JSON. Excluded from
   *  analytics and, later, from leaderboards/IAP-adjacent logic. */
  tamperFlag: boolean;
};

export type RunSnapshot = {
  schemaVersion: number;
  seed: number;
  wave: number;
  phase: GamePhase;
  coreHP: number;
  scrap: number;
  claimedMilestones: number[];
  isEndlessUnlocked: boolean;
  difficulty: DifficultyTier;
  towers: Array<{ kind: TowerKind; coord: GridCoord; rank: number; invested: number }>;
  runDamageBonus: number;
  runRangeBonus: number;
  runFireRateBonus: number;
  runBountyBonus: number;
  corePatchUsed: boolean;
  reviveAdUsed: boolean;
  inRun: Partial<Record<InRunId, number>>;
  runKills: number;
};

export type SimEvent =
  | { t: "spawn"; kind: EnemyKind }
  | { t: "fire"; kind: TowerKind; x: number; y: number; tx: number; ty: number }
  | { t: "hit"; x: number; y: number; dmg: number; kind: TowerKind }
  | { t: "kill"; x: number; y: number; kind: EnemyKind }
  | { t: "leak"; kind: EnemyKind; dmg: number }
  | { t: "execute"; x: number; y: number };

export const DIFFICULTIES: DifficultyTier[] = ["normal", "hard", "nightmare", "insane"];
export const ENEMY_KINDS: EnemyKind[] = ["bit", "virus", "tank", "boss"];
export const TOWER_KINDS: TowerKind[] = ["pulse", "beam", "nova", "tesla"];
export const SKILL_IDS: SkillId[] = [
  "scrapCache",
  "coreShield",
  "overclock",
  "rangeAmp",
  "bountyProtocol",
];
export const MODULE_IDS: ModuleId[] = [
  "focusingLens",
  "coolantLoop",
  "rippleCapacitor",
  "targetingAI",
];
export const WORKSHOP_IDS: WorkshopId[] = [
  "attack",
  "defense",
  "cash",
  "coins",
  "range",
  "cooldown",
  "drop",
];
export const IN_RUN_IDS: InRunId[] = ["dmg", "rng", "rate", "bounty", "income", "repair"];
export const GLYPH_IDS: GlyphId[] = [
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
  "zenith",
];

export const DIFFICULTY_MOD: Record<
  DifficultyTier,
  { hp: number; reward: number; speed: number; leak: number; drop: number; label: string; unlock: number }
> = {
  normal: { hp: 1, reward: 1, speed: 1, leak: 1, drop: 1, label: "Normal", unlock: 0 },
  hard: { hp: 1.4, reward: 1.3, speed: 1.08, leak: 1, drop: 1.25, label: "Hard", unlock: 15 },
  nightmare: { hp: 2.1, reward: 1.65, speed: 1.16, leak: 1.2, drop: 1.6, label: "Nightmare", unlock: 30 },
  insane: { hp: 3.2, reward: 2.2, speed: 1.25, leak: 1.4, drop: 2.2, label: "Insane", unlock: 50 },
};

export const ENEMY: Record<
  EnemyKind,
  { health: number; speed: number; bounty: number; core: number; label: string }
> = {
  bit: { health: 18, speed: 1.55, bounty: 6, core: 1, label: "Bit" },
  virus: { health: 32, speed: 2.15, bounty: 9, core: 1, label: "Virus" },
  tank: { health: 90, speed: 0.95, bounty: 16, core: 2, label: "Tank" },
  boss: { health: 280, speed: 0.72, bounty: 60, core: 5, label: "Prime" },
};

export const TOWER: Record<
  TowerKind,
  {
    cost: number;
    range: number;
    fire: number;
    damage: number;
    label: string;
    blurb: string;
  }
> = {
  pulse: {
    cost: 40,
    range: 2.35,
    fire: 0.55,
    damage: 14,
    label: "Pulse",
    blurb: "Balanced node. First buy.",
  },
  beam: {
    cost: 65,
    range: 3.1,
    fire: 0.28,
    damage: 7,
    label: "Beam",
    blurb: "Long rail. Fast ticks.",
  },
  nova: {
    cost: 80,
    range: 1.8,
    fire: 1.15,
    damage: 18,
    label: "Nova",
    blurb: "Short mortar. Splash.",
  },
  tesla: {
    cost: 110,
    range: 2.6,
    fire: 0.85,
    damage: 12,
    label: "Tesla",
    blurb: "Arc coils. Splash chain.",
  },
};

export const SKILL: Record<
  SkillId,
  { label: string; detail: string; max: number; cost: number }
> = {
  scrapCache: { label: "Scrap Cache", detail: "+25 starting scrap / rank", max: 5, cost: 1 },
  coreShield: { label: "Core Shield", detail: "+4 core integrity / rank", max: 5, cost: 1 },
  overclock: { label: "Overclock", detail: "+8% tower damage / rank", max: 5, cost: 2 },
  rangeAmp: { label: "Range Amp", detail: "+6% tower range / rank", max: 5, cost: 2 },
  bountyProtocol: { label: "Bounty Protocol", detail: "+10% kill bounty / rank", max: 5, cost: 2 },
};

export const MODULE: Record<ModuleId, { label: string; detail: string }> = {
  focusingLens: { label: "Focusing Lens", detail: "Towers deal +12% damage" },
  coolantLoop: { label: "Coolant Loop", detail: "Towers fire 12% faster" },
  rippleCapacitor: { label: "Ripple Capacitor", detail: "Nova and Tesla splash +1 tile" },
  targetingAI: { label: "Targeting AI", detail: "Towers prioritize highest HP" },
};

export const COLS = 12;
export const ROWS = 8;
export const TICK = 1 / 60;
export const MAX_CATCHUP = 8;
export const BASE_CORE = 20;
export const BASE_SCRAP = 80;
export const ENDLESS_WAVE = 50;
export const SCHEMA = 3;
export const SAVE_KEY = "neontd.profile.v3";
export const SAVE_KEY_LEGACY = "neontd.profile.v2";
export const RUN_KEY = "neontd.run.v3";
export const MAX_RANK = 5;
export const EQUIP_SLOTS = 3;

export const MILESTONES: Array<{ wave: number; reward: Reward }> = [
  { wave: 10, reward: { type: "currency", amount: 100 } },
  { wave: 25, reward: { type: "gachaPull" } },
  { wave: 50, reward: { type: "rareUpgrade" } },
  { wave: 75, reward: { type: "gachaPull" } },
  { wave: 100, reward: { type: "chassis", kind: "hex" } },
];

export const PASS_TRACK: Array<{ level: number; reward: Reward }> = [
  { level: 1, reward: { type: "currency", amount: 50 } },
  { level: 3, reward: { type: "gachaPull" } },
  { level: 5, reward: { type: "currency", amount: 120 } },
  { level: 8, reward: { type: "rareUpgrade" } },
  { level: 10, reward: { type: "currency", amount: 200 } },
  { level: 12, reward: { type: "skillPoints", amount: 2 } },
  { level: 15, reward: { type: "gachaPull" } },
  { level: 20, reward: { type: "rareUpgrade" } },
  { level: 25, reward: { type: "currency", amount: 400 } },
  { level: 30, reward: { type: "skillPoints", amount: 5 } },
];

export function emptyMods(): CombatMods {
  return {
    damage: 0,
    range: 0,
    fireRate: 0,
    bounty: 0,
    splashAdd: 0,
    splashConvert: 0,
    execute: 0,
    coreOnKill: 0,
    corePerWave: 0,
  };
}

export function endlessScaling(wave: number): number {
  const early = 1 + Math.log(Math.max(wave, 1)) * 0.48;
  const late = wave <= 40 ? 0 : Math.pow((wave - 40) / 16, 1.28);
  return early + late;
}

export function enemyHealth(kind: EnemyKind, wave: number, tier: DifficultyTier): number {
  return ENEMY[kind].health * DIFFICULTY_MOD[tier].hp * endlessScaling(wave);
}

export function killBounty(kind: EnemyKind, tier: DifficultyTier, bountyBonus: number): number {
  return Math.max(
    1,
    Math.round(ENEMY[kind].bounty * DIFFICULTY_MOD[tier].reward * (1 + bountyBonus)),
  );
}

export function skillRank(p: PlayerProfile, id: SkillId): number {
  return Math.min(SKILL[id].max, p.skillRanks[id] ?? 0);
}

export function workshopRank(p: PlayerProfile, id: WorkshopId): number {
  return Math.max(0, Math.floor(p.workshop[id] ?? 0));
}

export function startingScrap(p: PlayerProfile): number {
  return BASE_SCRAP + skillRank(p, "scrapCache") * 25 + workshopRank(p, "cash") * 18;
}

export function startingCore(p: PlayerProfile): number {
  return BASE_CORE + skillRank(p, "coreShield") * 4 + workshopRank(p, "defense") + (p.nextRunCoreBonus || 0);
}

export function damageBonus(p: PlayerProfile): number {
  return skillRank(p, "overclock") * 0.08 + workshopRank(p, "attack") * 0.02 + p.prestigeLevel * 0.02 + (p.nextRunDamageBonus || 0);
}

export function rangeBonus(p: PlayerProfile): number {
  return skillRank(p, "rangeAmp") * 0.06 + workshopRank(p, "range") * 0.015 + p.prestigeLevel * 0.01;
}

export function fireRateBonus(p: PlayerProfile): number {
  return workshopRank(p, "cooldown") * 0.015 + p.prestigeLevel * 0.01;
}

export function bountyBonus(p: PlayerProfile): number {
  return skillRank(p, "bountyProtocol") * 0.1;
}

export function coinBonus(p: PlayerProfile): number {
  return workshopRank(p, "coins") * 0.05 + p.prestigeLevel * 0.03;
}

export function dropBonus(p: PlayerProfile): number {
  return workshopRank(p, "drop") * 0.04;
}

export function passLevel(xp: number): number {
  return Math.max(1, 1 + Math.floor(xp / 100));
}

export function difficultyUnlocked(p: PlayerProfile, d: DifficultyTier): boolean {
  return p.highestWaveReached >= DIFFICULTY_MOD[d].unlock;
}

export function rewardLabel(r: Reward): string {
  switch (r.type) {
    case "currency":
      return `${r.amount} scrap`;
    case "gachaPull":
      return "Module pull";
    case "rareUpgrade":
      return "Rare overclock";
    case "battlePassXP":
      return `${r.amount} pass XP`;
    case "skillPoints":
      return `${r.amount} skill pts`;
    case "glyph":
      return `Glyph ${r.id}`;
    case "chassis":
      return `${r.kind} chassis`;
  }
}

export function dayStamp(ms = Date.now()): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function msUntilMidnight(ms = Date.now()): number {
  const d = new Date(ms);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.getTime() - ms;
}

export function formatHMS(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export function newChassisId(): string {
  return `ch-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function emptyChassis(kind: ChassisKind): ChassisInstance {
  const n = kind === "dual" ? 2 : kind === "tri" ? 3 : kind === "quad" ? 4 : 6;
  return { id: newChassisId(), kind, sockets: Array.from({ length: n }, () => null) };
}

export function defaultProfile(): PlayerProfile {
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
    dailyCrateAdBonusDay: "",
    dailyShopAdBonusDay: "",
    dailyPassAdBonusDay: "",
    nextRunCoreBonus: 0,
    nextRunDamageBonus: 0,
    reducedMotion: false,
    musicEnabled: true,
    sfxEnabled: true,
    musicVol: 0.55,
    sfxVol: 0.8,
    shakeEnabled: true,
    workshop: {},
    glyphs: { spark: 2, ion: 2, hex: 1, volt: 1 },
    chassis: [starter],
    equippedChassisId: starter.id,
    discoveredCiphers: [],
    lastRecap: null,
    highestByDifficulty: {},
    tamperFlag: false,
  };
}
