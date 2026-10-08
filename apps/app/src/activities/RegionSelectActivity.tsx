import { HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AppBar,
  AppBarBackButton,
  AppBarIconButton,
  AppBarLeft,
  AppBarMain,
} from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { useAuth } from "../auth/AuthContext";
import { getRegions } from "../api/client";
import type { Region } from "../api/types";

declare module "@stackflow/config" {
  interface Register {
    RegionSelectActivity: {};
  }
}

const LEVEL_TITLE: Record<Region["level"], string> = {
  VILOYAT: "Viloyatni tanlang",
  TUMAN: "Tuman/shaharni tanlang",
  MFY: "Mahallani (MFY) tanlang",
};

/** Viloyat → tuman → MFY bosqichma-bosqich tanlash (Daangn'dagi 동네 인증 analogi). */
const RegionSelectActivity: ActivityComponentType<"RegionSelectActivity"> = () => {
  const { pop } = useFlow();
  const { updateRegion } = useAuth();

  // Tanlash yo'li: har bosqichda tanlangan ota hudud ro'yxati (breadcrumb)
  const [path, setPath] = useState<Region[]>([]);
  const [items, setItems] = useState<Region[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parent = path[path.length - 1];

  useEffect(() => {
    setItems(null);
    getRegions(parent?.id).then(setItems);
  }, [parent?.id]);

  const selectItem = async (region: Region) => {
    if (region.level !== "MFY") {
      setPath((p) => [...p, region]);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateRegion(region.id);
      pop();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlashda xatolik yuz berdi");
      setSaving(false);
    }
  };

  const goBackStep = () => setPath((p) => p.slice(0, -1));
  const currentLevel: Region["level"] = parent ? (parent.level === "VILOYAT" ? "TUMAN" : "MFY") : "VILOYAT";

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          {path.length > 0 ? (
            <AppBarIconButton aria-label="Oldingi bosqich" onClick={goBackStep}>
              <ChevronLeft />
            </AppBarIconButton>
          ) : (
            <AppBarBackButton />
          )}
        </AppBarLeft>
        <AppBarMain title={LEVEL_TITLE[currentLevel]} />
      </AppBar>
      <AppScreenContent>
        {path.length > 0 && (
          <HStack gap="x1" px="spacingX.globalGutter" py="x3" style={{ flexWrap: "wrap" }}>
            <Text textStyle="t3Regular" color="fg.neutralSubtle">
              {path.map((p) => p.name).join(" › ")}
            </Text>
          </HStack>
        )}

        {error && (
          <Text textStyle="t4Regular" color="fg.negative" style={{ padding: "0 16px 8px" }}>
            {error}
          </Text>
        )}

        {items === null ? (
          <Text textStyle="t4Regular" color="fg.neutralMuted" style={{ padding: 16 }}>
            Yuklanmoqda…
          </Text>
        ) : items.length === 0 ? (
          <VStack align="center" py="x16" gap="x2">
            <Text textStyle="t5Bold">Bu hududda ro'yxat topilmadi</Text>
          </VStack>
        ) : (
          <ul>
            {items.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => selectItem(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "start",
                    padding: "14px var(--seed-dimension-spacing-x-global-gutter)",
                    borderBottom: "1px solid var(--seed-color-stroke-neutral-muted)",
                  }}
                >
                  <Text textStyle="t5Regular">{r.name}</Text>
                  {r.level !== "MFY" && <ChevronRight size={18} color="var(--seed-color-fg-neutral-subtle)" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </AppScreenContent>
    </AppScreen>
  );
};

export default RegionSelectActivity;
