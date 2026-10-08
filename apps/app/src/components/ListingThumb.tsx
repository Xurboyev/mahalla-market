import {
  Armchair,
  Baby,
  BookOpen,
  Dumbbell,
  Gift,
  type LucideIcon,
  Shirt,
  Smartphone,
  Sofa,
} from "lucide-react";

const ICONS: Record<number, LucideIcon> = {
  1: Smartphone,
  2: Armchair,
  3: Shirt,
  4: Baby,
  5: Sofa,
  6: Dumbbell,
  7: BookOpen,
  8: Gift,
};

/** Rasm bo'lmasa kategoriya ikonkasi bilan joy to'ldiruvchi. */
export function ListingThumb({
  imageUrl,
  categoryId,
  size,
  radius = 8,
  dimmed = false,
}: {
  imageUrl?: string | null;
  categoryId: number;
  size: number | "100%";
  radius?: number;
  dimmed?: boolean;
}) {
  const Icon = ICONS[categoryId] ?? Gift;
  const box: React.CSSProperties = {
    width: size,
    height: size === "100%" ? undefined : size,
    aspectRatio: size === "100%" ? "1 / 1" : undefined,
    borderRadius: radius,
    flexShrink: 0,
    overflow: "hidden",
    opacity: dimmed ? 0.55 : 1,
    background: "var(--seed-color-bg-brand-weak)",
    color: "var(--seed-color-fg-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (imageUrl) {
    return (
      <div style={box}>
        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={box} aria-hidden>
      <Icon size={typeof size === "number" ? size * 0.38 : 96} strokeWidth={1.4} />
    </div>
  );
}
