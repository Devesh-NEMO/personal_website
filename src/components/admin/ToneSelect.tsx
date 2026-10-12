import { Select } from "@/components/admin/Select";
import { cn } from "@/lib/cn";
import { toneBackground, toneOrder } from "@/lib/tone";
import type { CardTone } from "@/types";

const toneLabels: Record<CardTone, string> = {
  mint: "Mint",
  peach: "Peach",
  periwinkle: "Periwinkle",
  pink: "Pink",
};

type ToneSelectProps = {
  name?: string;
  id?: string;
  defaultValue?: CardTone;
  /** Controlled mode: pass both `value` and `onChange` to drive a live preview. */
  value?: CardTone;
  onChange?: (tone: CardTone) => void;
};

/**
 * Picks one of the four card tones, with a swatch that updates as you choose so
 * the effect of the colour is visible before saving.
 */
export function ToneSelect({
  name = "tone",
  id,
  defaultValue = "mint",
  value,
  onChange,
}: ToneSelectProps) {
  const swatch = value ?? defaultValue;

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "brutal-border size-9 shrink-0 rounded-[10px] shadow-[3px_3px_0_var(--shadow-color)]",
          toneBackground[swatch],
        )}
        aria-hidden="true"
      />
      <Select
        id={id}
        name={name}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (event) => onChange(event.target.value as CardTone) : undefined}
      >
        {toneOrder.map((tone) => (
          <option key={tone} value={tone}>
            {toneLabels[tone]}
          </option>
        ))}
      </Select>
    </div>
  );
}