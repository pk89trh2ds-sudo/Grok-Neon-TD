import { workshopRank, type InRunId, type PlayerProfile, type WorkshopId } from "./types";

export const IN_RUN_IDS: InRunId[] = ["dmg", "rng", "rate", "bounty", "income", "repair"];

export const WORKSHOP: Record<
  WorkshopId,
  { label: string; detail: (rank: number) => string; base: number; per: string }
> = {
  attack: {
    label: "Attack",
    detail: (r) => `+${(r * 2).toFixed(0)}% tower damage`,
    base: 40,
    per: "+2% damage / lvl",
  },
  defense: {
    label: "Core plating",
    detail: (r) => `+${r} core integrity`,
    base: 50,
    per: "+1 core / lvl",
  },
  cash: {
    label: "Starting scrap",
    detail: (r) => `+${r * 18} scrap at deploy`,
    base: 35,
    per: "+18 scrap / lvl",
  },
  coins: {
    label: "Coin bonus",
    detail: (r) => `+${(r * 5).toFixed(0)}% banked after a run`,
    base: 55,
    per: "+5% coins / lvl",
  },
  range: {
    label: "Range",
    detail: (r) => `+${(r * 1.5).toFixed(1)}% tower range`,
    base: 45,
    per: "+1.5% range / lvl",
  },
  cooldown: {
    label: "Fire rate",
    detail: (r) => `+${(r * 1.5).toFixed(1)}% fire rate`,
    base: 45,
    per: "+1.5% fire / lvl",
  },
  drop: {
    label: "Glyph drop",
    detail: (r) => `+${(r * 4).toFixed(0)}% glyph find`,
    base: 70,
    per: "+4% drop / lvl",
  },
};

export const IN_RUN: Record<
  InRunId,
  { label: string; detail: string; base: number; step: number }
> = {
  dmg: { label: "Overload", detail: "+4% damage this run", base: 22, step: 0.04 },
  rng: { label: "Longscan", detail: "+3% range this run", base: 20, step: 0.03 },
  rate: { label: "Coolant", detail: "+4% fire rate this run", base: 24, step: 0.04 },
  bounty: { label: "Bounty", detail: "+5% kill scrap this run", base: 18, step: 0.05 },
  income: { label: "Income", detail: "+8 scrap each wave", base: 16, step: 8 },
  repair: { label: "Patch", detail: "+4 core integrity", base: 28, step: 4 },
};

export function workshopCost(p: PlayerProfile, id: WorkshopId): number {
  const rank = workshopRank(p, id);
  return Math.floor(WORKSHOP[id].base * Math.pow(1.085, rank));
}

export function buyWorkshop(p: PlayerProfile, id: WorkshopId): boolean {
  const cost = workshopCost(p, id);
  if (p.bankScrap < cost) return false;
  p.bankScrap -= cost;
  p.workshop[id] = workshopRank(p, id) + 1;
  return true;
}

export function inRunCost(bought: number, id: InRunId, wave: number): number {
  return Math.floor(IN_RUN[id].base * Math.pow(1.16, bought) + wave * 0.6);
}
