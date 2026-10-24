import { PlatinumTrophy } from "@/features/library/components/platinum-trophy";

type TrophyTitle = {
  id: string;
  name: string;
  platforms: string[];
  progress: number;
  play_duration_seconds: number | null;
  defined_bronze: number;
  defined_silver: number;
  defined_gold: number;
  defined_platinum: number;
  earned_bronze: number;
  earned_silver: number;
  earned_gold: number;
  earned_platinum: number;
};

const GRADES = [
  { key: "platinum", label: "Platina", color: "text-platinum" },
  { key: "gold", label: "Ouro", color: "text-amber-400" },
  { key: "silver", label: "Prata", color: "text-zinc-400" },
  { key: "bronze", label: "Bronze", color: "text-orange-700" },
] as const;

export function formatPlaytime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

export function TrophyProgress({ title }: { title: TrophyTitle }) {
  return (
    <div className="flex flex-col gap-2 rounded-card bg-surface-raised p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{title.platforms.join(" / ")}</span>
        {title.play_duration_seconds !== null && (
          <span className="text-muted">{formatPlaytime(title.play_duration_seconds)} jogadas</span>
        )}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={title.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de troféus"
      >
        <div className="h-full bg-accent" style={{ width: `${title.progress}%` }} />
      </div>
      <dl className="flex flex-wrap gap-x-4 gap-y-1">
        {GRADES.filter(({ key }) => title[`defined_${key}`] > 0).map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1">
            <dt className={color}>
              <PlatinumTrophy className="size-3.5" />
              <span className="sr-only">{label}</span>
            </dt>
            <dd>
              {title[`earned_${key}`]}/{title[`defined_${key}`]}
            </dd>
          </div>
        ))}
        <div className="ml-auto text-muted">{title.progress}%</div>
      </dl>
    </div>
  );
}
