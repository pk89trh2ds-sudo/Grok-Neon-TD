import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Cog,
  Cpu,
  FastForward,
  FlaskConical,
  Hammer,
  Hexagon,
  Lock,
  Pause,
  Play,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { bindEngine, GameEngine, getEngine } from "@/lib/game/engine";
import { shopForDay } from "@/lib/game/meta";
import { CHASSIS, CIPHERS, GLYPH, prefixCipher, recipeHint } from "@/lib/game/ciphers";
import { IN_RUN, IN_RUN_IDS, WORKSHOP, inRunCost, workshopCost } from "@/lib/game/workshop";
import { useGame } from "@/lib/game/store";
import {
  DIFFICULTIES,
  DIFFICULTY_MOD,
  GLYPH_IDS,
  MODULE,
  PASS_TRACK,
  SKILL,
  SKILL_IDS,
  TOWER,
  TOWER_KINDS,
  WORKSHOP_IDS,
  dayStamp,
  difficultyUnlocked,
  formatHMS,
  msUntilMidnight,
  passLevel,
  rewardLabel,
  workshopRank,
  type GlyphId,
  type ModuleId,
  type Screen,
  type SkillId,
  type TowerKind,
} from "@/lib/game/types";
import { Btn, Bar, Panel, Stat } from "./ui";
import { cn } from "@/lib/utils";

export function NeonApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screen = useGame((s) => s.screen);
  const toasts = useGame((s) => s.toasts);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas);
    bindEngine(engine);
    let dead = false;
    void engine.boot().then(() => {
      if (dead) return;
      engine.renderer.resize();
      engine.startLoop();
    });
    const onResize = () => engine.renderer.resize();
    const onKey = (e: KeyboardEvent) => {
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

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-fg">
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full touch-none",
          playing ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onPointerDown={(e) => {
          const g = getEngine();
          if (!g) return;
          const r = e.currentTarget.getBoundingClientRect();
          g.pointer(e.clientX - r.left, e.clientY - r.top, "down");
        }}
        onPointerMove={(e) => {
          const g = getEngine();
          if (!g) return;
          const r = e.currentTarget.getBoundingClientRect();
          g.pointer(e.clientX - r.left, e.clientY - r.top, "move");
        }}
      />
      {!playing && <MenuLayer />}
      {playing && <PlayHud />}
      <ToastStack toasts={toasts} />
    </main>
  );
}

function MenuLayer() {
  const screen = useGame((s) => s.screen);
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url(/textures/menu.jpg)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/75 to-ink" />
      <div className="relative mx-auto flex min-h-full max-w-lg flex-col px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {screen === "boot" && <BootCard />}
        {screen === "menu" && <MenuHome />}
        {screen === "skills" && <SkillsPane />}
        {screen === "workshop" && <WorkshopPane />}
        {screen === "forge" && <ForgePane />}
        {screen === "modules" && <ModulesPane />}
        {screen === "pass" && <PassPane />}
        {screen === "shop" && <ShopPane />}
        {screen === "settings" && <SettingsPane />}
        {screen === "ops" && <OpsPane />}
      </div>
    </div>
  );
}

function BootCard() {
  return (
    <div className="flex min-h-[72dvh] flex-col items-center justify-center gap-8 text-center">
      <div className="enter-rise space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">Grid online</p>
        <h1 className="font-display text-6xl font-semibold leading-none tracking-[0.18em] text-ice">
          NEON
        </h1>
        <p className="font-display text-2xl leading-none tracking-[0.32em] text-cyan">TOWER DEFENSE</p>
      </div>
      <Btn variant="primary" className="min-w-48" onClick={() => getEngine()?.enterMenu()}>
        Enter grid
      </Btn>
    </div>
  );
}

function MenuHome() {
  const p = useGame((s) => s.profile);
  const hasRun = useGame((s) => s.hasSavedRun);
  const crate = useGame((s) => s.crateReady);
  const difficulty = useGame((s) => s.difficulty);
  const briefing = useGame((s) => s.briefing);
  const missions = p.missions;
  const nextMilestone = [10, 25, 50].find((w) => p.highestWaveReached < w) ?? 50;

  return (
    <div className="flex flex-col gap-5 py-4">
      <header className="enter-rise pt-4">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Operator {p.displayName}</p>
        <h1 className="font-display text-5xl font-semibold tracking-[0.16em] text-ice">NEON TD</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Endless circuit. Cash upgrades in-run, bank coins into the Workshop, socket glyphs into Cipher Words.
        </p>
      </header>

      <Panel className="flex items-center justify-between gap-3">
        <Stat label="Wave" value={p.highestWaveReached} />
        <Stat label="Prestige" value={p.prestigeLevel} />
        <Stat label="Streak" value={p.loginStreak} />
        <Stat label="Bank" value={p.bankScrap} />
      </Panel>

      {briefing && (
        <Panel className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan">Field briefing</p>
          <p className="text-sm text-muted">
            Tap dark tiles to deploy Pulse. Waves never end. Spend scrap in the Lab during a run. After you
            fall or bank, spend coins on permanent Workshop ranks. Socket glyphs in the Forge like rune words.
          </p>
          <Btn variant="quiet" onClick={() => getEngine()?.finishTutorial()}>
            Mark as read
          </Btn>
        </Panel>
      )}

      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => {
          const open = difficultyUnlocked(p, d);
          const spec = DIFFICULTY_MOD[d];
          return (
            <button
              key={d}
              disabled={!open}
              onClick={() => open && getEngine()?.setDifficulty(d)}
              className={cn(
                "min-h-11 flex-1 rounded-md border text-xs uppercase tracking-wider",
                difficulty === d
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-line text-muted hover:text-fg",
                !open && "opacity-40",
              )}
            >
              {open ? spec.label : <Lock className="mx-auto size-3.5" />}
            </button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-faint">
        {DIFFICULTY_MOD[difficulty].label} · HP {DIFFICULTY_MOD[difficulty].hp}x · coins{" "}
        {DIFFICULTY_MOD[difficulty].reward}x
        {DIFFICULTIES.filter((d) => !difficultyUnlocked(p, d)).length > 0 &&
          ` · unlocks at wave ${DIFFICULTIES.filter((d) => !difficultyUnlocked(p, d)).map((d) => DIFFICULTY_MOD[d].unlock).join("/")}`}
      </p>

      <Btn variant="primary" onClick={() => getEngine()?.startGame(difficulty)}>
        <Play className="size-4" />
        Start new run
      </Btn>
      {hasRun && (
        <Btn onClick={() => getEngine()?.continueRun()}>
          Continue run
        </Btn>
      )}

      <Panel className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Daily ops</p>
          <span className="text-xs text-faint">Resets {formatHMS(msUntilMidnight())}</span>
        </div>
        {missions.map((m) => (
          <div key={m.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{m.description}</span>
              <span className="tabular text-muted">
                {m.progress}/{m.target}
              </span>
            </div>
            <Bar value={m.progress} max={m.target} />
            <div className="flex justify-end gap-2">
              {m.claimed && !m.adBoosted && (
                <Btn
                  variant="quiet"
                  className="min-h-9 px-3 text-xs"
                  onClick={() => getEngine()?.claimMissionBonusAd(m.id)}
                >
                  Watch ad: double
                </Btn>
              )}
              <Btn
                variant="quiet"
                className="min-h-9 px-3 text-xs"
                disabled={m.claimed || m.progress < m.target}
                onClick={() => getEngine()?.claimMissionId(m.id)}
              >
                {m.claimed ? "Claimed" : "Claim"}
              </Btn>
            </div>
          </div>
        ))}
        {crate && (
          <Btn variant="primary" onClick={() => getEngine()?.claimCrate()}>
            Claim daily crate
          </Btn>
        )}
        {!crate && p.dailyCrateDay === dayStamp() && p.dailyCrateAdBonusDay !== dayStamp() && (
          <Btn variant="quiet" onClick={() => getEngine()?.claimCrateBonusAd()}>
            Watch ad: double crate
          </Btn>
        )}
      </Panel>

      <p className="text-center text-xs text-faint">
        Endless waves · Next milestone {nextMilestone} · Pass lvl {passLevel(p.battlePassXP)}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <NavTile icon={<Hammer className="size-4" />} label="Workshop" to="workshop" />
        <NavTile icon={<Hexagon className="size-4" />} label="Forge" to="forge" />
        <NavTile icon={<Sparkles className="size-4" />} label="Skills" to="skills" />
        <NavTile icon={<Cpu className="size-4" />} label="Modules" to="modules" />
        <NavTile icon={<Trophy className="size-4" />} label="Battle pass" to="pass" />
        <NavTile icon={<ShoppingBag className="size-4" />} label="Shop" to="shop" />
        <NavTile icon={<ClipboardList className="size-4" />} label="Ops log" to="ops" />
        <NavTile icon={<Cog className="size-4" />} label="Settings" to="settings" />
      </div>
    </div>
  );
}

function NavTile({
  icon,
  label,
  to,
}: {
  icon: ReactNode;
  label: string;
  to: Screen;
}) {
  return (
    <button
      onClick={() => {
        getEngine();
        useGame.getState().patch({ screen: to });
      }}
      className="flex min-h-14 items-center gap-3 rounded-lg border border-line bg-panel px-4 text-left text-sm hover:border-line-strong"
    >
      <span className="text-cyan">{icon}</span>
      {label}
    </button>
  );
}

function Back() {
  return (
    <Btn variant="quiet" className="self-start" onClick={() => useGame.getState().patch({ screen: "menu" })}>
      Back
    </Btn>
  );
}

function SkillsPane() {
  const p = useGame((s) => s.profile);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Skills</h2>
      <p className="text-sm text-muted">Points {p.skillPoints}</p>
      {SKILL_IDS.map((id: SkillId) => {
        const spec = SKILL[id];
        const rank = p.skillRanks[id] ?? 0;
        const cost = spec.cost * (rank + 1);
        return (
          <Panel key={id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{spec.label}</div>
              <div className="text-xs text-muted">
                {spec.detail} · {rank}/{spec.max}
              </div>
            </div>
            <Btn
              variant="primary"
              className="min-h-10"
              disabled={rank >= spec.max || p.skillPoints < cost}
              onClick={() => getEngine()?.buySkill(id)}
            >
              {rank >= spec.max ? "Max" : `${cost} pts`}
            </Btn>
          </Panel>
        );
      })}
    </div>
  );
}

function WorkshopPane() {
  const p = useGame((s) => s.profile);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Workshop</h2>
      <p className="text-sm text-muted">
        Permanent ranks. Bank coins from every run. Coins {p.bankScrap}
      </p>
      {WORKSHOP_IDS.map((id) => {
        const spec = WORKSHOP[id];
        const rank = workshopRank(p, id);
        const cost = workshopCost(p, id);
        return (
          <Panel key={id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{spec.label}</div>
              <div className="text-xs text-muted">
                Lv {rank} · {spec.detail(rank)} · {spec.per}
              </div>
            </div>
            <Btn
              variant="primary"
              className="min-h-10"
              disabled={p.bankScrap < cost}
              onClick={() => getEngine()?.buyWorkshopId(id)}
            >
              {cost}
            </Btn>
          </Panel>
        );
      })}
    </div>
  );
}

function ForgePane() {
  const p = useGame((s) => s.profile);
  const [pick, setPick] = useState<GlyphId | null>(null);
  const equipped = p.chassis.find((c) => c.id === p.equippedChassisId) ?? p.chassis[0];
  const word = equipped ? prefixCipher(equipped.sockets) : null;
  const complete = equipped ? equipped.sockets.every((s) => s) && word && word.have === equipped.sockets.length : false;

  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Forge</h2>
      <p className="text-sm text-muted">
        Socket glyphs in order. A complete sequence becomes a Cipher Word and replaces the individual bonuses.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {p.chassis.map((ch) => (
          <button
            key={ch.id}
            onClick={() => getEngine()?.equipChassis(ch.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-md border px-3 text-xs uppercase tracking-wider",
              ch.id === equipped?.id ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-muted",
            )}
          >
            {CHASSIS[ch.kind].label}
          </button>
        ))}
      </div>

      {equipped && (
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {CHASSIS[equipped.kind].sockets} sockets
            </span>
            {complete && word && (
              <span className="font-display text-lg tracking-widest text-cyan">{word.cipher.name}</span>
            )}
            {!complete && word && (
              <span className="text-xs text-muted">
                Building {word.cipher.name} {word.have}/{equipped.sockets.length}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {equipped.sockets.map((g, i) => (
              <button
                key={i}
                onClick={() => {
                  if (pick) getEngine()?.socket(equipped.id, i, pick);
                  else if (g) getEngine()?.unsocketSlot(equipped.id, i);
                }}
                className={cn(
                  "grid size-14 place-items-center rounded-md border font-mono text-xs tracking-wider",
                  g ? "border-cyan bg-cyan/10 text-ice" : "border-line text-faint",
                )}
              >
                {g ? GLYPH[g].mark : i + 1}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-faint">Tap a glyph, then a socket. Empty socket tap unsockets.</p>
        </Panel>
      )}

      <Panel className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Glyph rack</p>
        <div className="grid grid-cols-4 gap-2">
          {GLYPH_IDS.map((id) => {
            const n = p.glyphs[id] ?? 0;
            const spec = GLYPH[id];
            return (
              <button
                key={id}
                disabled={n <= 0}
                onClick={() => setPick(pick === id ? null : id)}
                className={cn(
                  "rounded-md border px-2 py-2 text-left disabled:opacity-30",
                  pick === id ? "border-cyan bg-cyan/15" : "border-line",
                )}
              >
                <div className="font-mono text-xs text-cyan">{spec.mark}</div>
                <div className="text-[11px] text-muted">
                  {spec.label} · {n}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Cipher codex</p>
        {CIPHERS.map((c) => {
          const known = p.discoveredCiphers.includes(c.id);
          return (
            <div key={c.id} className="flex items-start justify-between gap-2 text-sm">
              <div>
                <div className={known ? "text-ice" : "text-muted"}>{known ? c.name : "????"}</div>
                <div className="text-[11px] text-faint">{recipeHint(c, known)}</div>
              </div>
              <div className="text-[11px] text-muted">{c.recipe.length}s</div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

function ModulesPane() {
  const p = useGame((s) => s.profile);
  const pulls = useGame((s) => s.pulls);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Modules</h2>
      <p className="text-sm text-muted">
        Pulls {pulls} · Equipped {p.equippedModules.length}/3
      </p>
      <Btn variant="primary" disabled={pulls <= 0} onClick={() => getEngine()?.spendPull()}>
        Spend pull
      </Btn>
      {p.ownedModules.length === 0 && (
        <p className="text-sm text-muted">No modules yet. Clear wave 10 or spend a pull.</p>
      )}
      {p.ownedModules.map((id: ModuleId) => {
        const spec = MODULE[id];
        const on = p.equippedModules.includes(id);
        return (
          <Panel key={id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{spec.label}</div>
              <div className="text-xs text-muted">{spec.detail}</div>
            </div>
            <Btn onClick={() => getEngine()?.equip(id)}>{on ? "Unequip" : "Equip"}</Btn>
          </Panel>
        );
      })}
    </div>
  );
}

function PassPane() {
  const p = useGame((s) => s.profile);
  const lvl = passLevel(p.battlePassXP);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Battle pass</h2>
      <p className="text-sm text-muted">
        Level {lvl} · {p.battlePassXP} XP
      </p>
      <Bar value={p.battlePassXP % 100} max={100} />
      {p.dailyPassAdBonusDay !== dayStamp() && (
        <Btn variant="quiet" onClick={() => getEngine()?.claimPassBonusAd()}>
          Watch ad: +40 XP
        </Btn>
      )}
      {PASS_TRACK.map((t) => {
        const claimed = p.battlePassClaimed.includes(t.level);
        return (
          <Panel key={t.level} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">Tier {t.level}</div>
              <div className="text-xs text-muted">{rewardLabel(t.reward)}</div>
            </div>
            <Btn
              variant="primary"
              disabled={claimed || lvl < t.level}
              onClick={() => getEngine()?.claimPassLevel(t.level)}
            >
              {claimed ? "Claimed" : "Claim"}
            </Btn>
          </Panel>
        );
      })}
    </div>
  );
}

function ShopPane() {
  const p = useGame((s) => s.profile);
  const items = shopForDay(p.dailyShopDay || dayStamp());
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Night market</h2>
      <p className="text-sm text-muted">Bank {p.bankScrap} · Rotates at midnight</p>
      {p.dailyShopAdBonusDay !== dayStamp() && (
        <Btn variant="quiet" onClick={() => getEngine()?.claimShopBonusAd()}>
          Watch ad: free item
        </Btn>
      )}
      {items.map((item) => {
        const bought = p.dailyShopBought.includes(item.id);
        return (
          <Panel key={item.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted">{item.detail}</div>
            </div>
            <Btn
              variant="primary"
              disabled={bought || p.bankScrap < item.cost}
              onClick={() => getEngine()?.buy(item)}
            >
              {bought ? "Sold" : `${item.cost}`}
            </Btn>
          </Panel>
        );
      })}
    </div>
  );
}

function OpsPane() {
  const p = useGame((s) => s.profile);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Ops log</h2>
      <Panel>
        <Stat label="Runs" value={p.totalRunsCompleted} />
        <div className="mt-3 text-sm text-muted">
          Kills {p.lifetimeKills} · Achievements {p.achievementsClaimed.length}/12 · Ciphers{" "}
          {p.discoveredCiphers.length}
        </div>
      </Panel>
      <Panel className="space-y-2">
        {p.achievementsClaimed.length === 0 && (
          <p className="text-sm text-muted">No seals yet. Clear waves to stamp the log.</p>
        )}
        {p.achievementsClaimed.map((id) => (
          <div key={id} className="text-sm capitalize text-cyan">
            {id.replace("-", " ")}
          </div>
        ))}
      </Panel>
    </div>
  );
}

function SettingsPane() {
  const p = useGame((s) => s.profile);
  const [name, setName] = useState(p.displayName);
  return (
    <div className="flex flex-col gap-4 py-4">
      <Back />
      <h2 className="font-display text-3xl">Settings</h2>
      <Panel className="space-y-3">
        <label className="text-xs uppercase tracking-[0.2em] text-muted">Callsign</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-md border border-line bg-ink px-3 text-fg outline-none focus:border-cyan"
        />
        <Btn onClick={() => getEngine()?.rename(name)}>Save name</Btn>
      </Panel>
      <Panel className="space-y-3">
        <Toggle
          label="Music"
          on={p.musicEnabled}
          onChange={(v) => getEngine()?.setSetting("musicEnabled", v)}
        />
        <Toggle
          label="Effects"
          on={p.sfxEnabled}
          onChange={(v) => getEngine()?.setSetting("sfxEnabled", v)}
        />
        <Toggle
          label="Screen shake"
          on={p.shakeEnabled}
          onChange={(v) => getEngine()?.setSetting("shakeEnabled", v)}
        />
        <Toggle
          label="Reduce motion"
          on={p.reducedMotion}
          onChange={(v) => getEngine()?.setSetting("reducedMotion", v)}
        />
        <Slider
          label="Music level"
          value={p.musicVol}
          onChange={(v) => getEngine()?.setSetting("musicVol", v)}
        />
        <Slider
          label="Effects level"
          value={p.sfxVol}
          onChange={(v) => getEngine()?.setSetting("sfxVol", v)}
        />
      </Panel>
      <Btn
        variant="primary"
        disabled={p.highestWaveReached < 50}
        onClick={() => getEngine()?.doPrestige()}
      >
        Prestige (+5 skill points)
      </Btn>
      <p className="text-xs text-faint">Unlocks after wave 50. Keeps skills, modules, workshop, and forge.</p>
      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Operator save</p>
        <Btn onClick={() => getEngine()?.downloadSave()}>Download save file</Btn>
        <label className="flex min-h-11 items-center justify-center rounded-md border border-line bg-panel text-sm">
          Import save
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then((t) => getEngine()?.importSave(t));
              e.target.value = "";
            }}
          />
        </label>
      </Panel>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className="flex min-h-11 w-full items-center justify-between"
      onClick={() => onChange(!on)}
    >
      <span>{label}</span>
      <span
        className={cn(
          "h-6 w-10 rounded-full p-0.5 transition-colors",
          on ? "bg-cyan" : "bg-panel-2",
        )}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full bg-ink transition-transform",
            on && "translate-x-4",
          )}
        />
      </span>
    </button>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted">{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan"
      />
    </label>
  );
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

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-2 rounded-lg border border-line hud-panel px-3 py-2">
          <div className="font-mono text-xs tracking-widest text-cyan">WAVE {wave}</div>
          <div className="text-[11px] uppercase text-muted">endless</div>
          {cipher && <div className="hidden font-mono text-[11px] tracking-widest text-ok sm:block">{cipher}</div>}
          <div className="ml-auto flex items-center gap-3 font-mono text-xs">
            <span className="text-ice tabular">{scrap} SCRAP</span>
            <span className={cn("flex items-center gap-1 tabular", core <= 5 ? "text-signal" : "text-ok")}>
              <Shield className="size-3.5" />
              {core}/{maxCore}
            </span>
          </div>
          <button
            className="grid size-11 place-items-center rounded-md text-fg"
            onClick={() => getEngine()?.pauseToggle()}
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button
            className="grid size-11 place-items-center rounded-md text-muted"
            onClick={() => getEngine()?.setSpeed(speed === 3 ? 1 : ((speed + 1) as 1 | 2 | 3))}
            aria-label="Speed"
          >
            <FastForward className="size-4" />
          </button>
          <span className="hidden text-[11px] text-faint sm:inline">{speed}x</span>
        </div>
        <div className="mx-auto mt-2 max-w-4xl px-1 font-mono text-[11px] text-muted">
          {log} · {alive} live · {pending} inbound
          {cipher && <span className="sm:hidden"> · {cipher}</span>}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {labOpen && phase !== "gameOver" && (
          <div className="mx-auto mb-2 grid max-w-4xl grid-cols-3 gap-2 rounded-lg border border-line hud-panel p-2">
            {IN_RUN_IDS.map((id) => {
              const spec = IN_RUN[id];
              const bought = inRun[id] ?? 0;
              const cost = inRunCost(bought, id, wave);
              return (
                <button
                  key={id}
                  onClick={() => getEngine()?.buyInRun(id)}
                  disabled={scrap < cost}
                  className="rounded-md border border-line bg-panel px-2 py-2 text-left disabled:opacity-40"
                >
                  <div className="text-xs font-medium">{spec.label}</div>
                  <div className="font-mono text-[11px] text-cyan">
                    {cost} · {id === "repair" ? "heal" : `x${bought}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {selectedCoord && (
          <div className="mx-auto mb-2 flex max-w-4xl items-center gap-2 rounded-lg border border-line hud-panel px-3 py-2">
            <span className="flex-1 font-mono text-xs text-muted">{inspect}</span>
            <Btn className="min-h-10" onClick={() => getEngine()?.rankSelected()}>
              Rank
            </Btn>
            <Btn className="min-h-10" onClick={() => getEngine()?.sellSelected()}>
              Sell
            </Btn>
          </div>
        )}
        <div className="mx-auto grid max-w-4xl grid-cols-5 gap-2">
          <button
            onClick={() => getEngine()?.toggleLab()}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2",
              labOpen ? "border-cyan bg-cyan/15" : "border-line hud-panel",
            )}
          >
            <FlaskConical className="size-4 text-cyan" />
            <span className="text-xs">Lab</span>
            <span className="font-mono text-[11px] text-muted">cash</span>
          </button>
          {TOWER_KINDS.map((kind: TowerKind) => {
            const spec = TOWER[kind];
            const on = selected === kind;
            const afford = scrap >= spec.cost;
            return (
              <button
                key={kind}
                onClick={() => getEngine()?.selectTower(kind)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2",
                  on ? "border-cyan bg-cyan/15" : "border-line hud-panel",
                  !afford && "opacity-50",
                )}
              >
                <Zap className="size-4 text-cyan" />
                <span className="text-xs">{spec.label}</span>
                <span className="font-mono text-[11px] text-muted">{spec.cost}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tutorial > 0 && tutorial < 4 && phase === "combat" && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center px-4">
          <div className="pointer-events-auto max-w-sm rounded-lg border border-line hud-panel px-4 py-3 text-sm">
            {tutorial === 1 && "Tap a dark tile beside the circuit to deploy Pulse."}
            {tutorial === 2 && "Hostiles leak into the vault if they finish the lane. Keep fire on the front."}
            {tutorial === 3 && "Wave clear. Install an upgrade, then launch the next wave."}
            <div className="mt-2 flex justify-end">
              <Btn variant="quiet" className="min-h-9" onClick={() => getEngine()?.finishTutorial()}>
                Dismiss
              </Btn>
            </div>
          </div>
        </div>
      )}

      {paused && phase === "combat" && (
        <CenterCard>
          <h2 className="font-display text-3xl">Paused</h2>
          <Btn variant="primary" onClick={() => getEngine()?.pauseToggle()}>
            Resume
          </Btn>
          <Btn onClick={() => getEngine()?.returnToMenu()}>Abort to menu</Btn>
        </CenterCard>
      )}

      {phase === "upgrade" && <UpgradeCard />}
      {phase === "gameOver" && <GameOverCard />}
    </>
  );
}

function CenterCard({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-ink/70 p-4">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-panel p-6">
        {children}
      </div>
    </div>
  );
}

function UpgradeCard() {
  const wave = useGame((s) => s.wave);
  const scrap = useGame((s) => s.scrap);
  const core = useGame((s) => s.coreHP);
  const offers = useGame((s) => s.offers);
  return (
    <CenterCard>
      <h2 className="font-display text-2xl tracking-wide text-cyan">Wave {wave} cleared</h2>
      <p className="text-sm text-muted">
        Scrap {scrap} · Core {core}
      </p>
      {offers.map((o) => (
        <button
          key={o.id}
          disabled={o.cost > 0 && scrap < o.cost}
          onClick={() => getEngine()?.buyOffer(o)}
          className="rounded-lg border border-line bg-panel-2 p-3 text-left disabled:opacity-40"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{o.title}</span>
            <span className="font-mono text-sm text-cyan">{o.cost === 0 ? "FREE" : o.cost}</span>
          </div>
          <div className="text-xs text-muted">{o.detail}</div>
        </button>
      ))}
      <Btn variant="primary" onClick={() => getEngine()?.startNextWave()}>
        Next wave
      </Btn>
      <Btn onClick={() => getEngine()?.cashOut()}>Bank coins to Workshop</Btn>
      <Btn variant="quiet" onClick={() => getEngine()?.returnToMenu()}>
        Abort (half coins)
      </Btn>
    </CenterCard>
  );
}

function GameOverCard() {
  const wave = useGame((s) => s.wave);
  const core = useGame((s) => s.coreHP);
  const p = useGame((s) => s.profile);
  const recap = p.lastRecap;
  const engine = getEngine();
  const canPatch = engine ? !engine.corePatchUsed && core <= 0 && (p.bankScrap >= 80 || useGame.getState().scrap >= 80) : false;
  const canRevive = engine ? !engine.reviveAdUsed && core <= 0 : false;
  return (
    <CenterCard>
      <h2 className={cn("font-display text-3xl", core > 0 ? "text-cyan" : "text-signal")}>
        {core > 0 ? "Run banked" : "Core offline"}
      </h2>
      <p className="text-sm text-muted">Reached wave {wave} · {DIFFICULTY_MOD[p.difficulty].label}</p>
      {recap && (
        <Panel className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Coins banked</span>
            <span className="tabular text-cyan">{recap.banked}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Kills</span>
            <span className="tabular">{recap.kills}</span>
          </div>
          {recap.cipherName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Cipher</span>
              <span className="tracking-widest text-cyan">{recap.cipherName}</span>
            </div>
          )}
          {recap.glyphs.length > 0 && (
            <div className="text-xs text-muted">Glyphs {recap.glyphs.map((g) => g.toUpperCase()).join(" · ")}</div>
          )}
        </Panel>
      )}
      {canRevive && (
        <Btn variant="primary" onClick={() => getEngine()?.watchReviveAd()}>
          Watch ad to continue
        </Btn>
      )}
      {canPatch && (
        <Btn onClick={() => getEngine()?.corePatch()}>Emergency patch (80 scrap)</Btn>
      )}
      <Btn variant="primary" onClick={() => getEngine()?.retry()}>
        Retry
      </Btn>
      <Btn onClick={() => getEngine()?.exitTo("workshop")}>Open Workshop</Btn>
      <Btn onClick={() => getEngine()?.exitTo("forge")}>Open Forge</Btn>
      <Btn variant="quiet" onClick={() => getEngine()?.returnToMenu()}>
        Menu
      </Btn>
    </CenterCard>
  );
}

function ToastStack({
  toasts,
}: {
  toasts: Array<{ id: number; title: string; detail: string; tone: string }>;
}) {
  useEffect(() => {
    if (!toasts.length) return;
    const id = toasts[toasts.length - 1]!.id;
    const t = window.setTimeout(() => useGame.getState().dismissToast(id), 3200);
    return () => window.clearTimeout(t);
  }, [toasts]);
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex w-64 flex-col gap-2 pt-[env(safe-area-inset-top)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2 rounded-md border border-line bg-panel px-3 py-2"
        >
          <div className="flex-1">
            <div className="text-sm font-medium">{t.title}</div>
            <div className="text-xs text-muted">{t.detail}</div>
          </div>
          <button onClick={() => useGame.getState().dismissToast(t.id)} className="text-faint">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
