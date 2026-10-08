import { HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { Bell, ChevronDown, Heart, MessageCircle, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AppBar,
  AppBarIconButton,
  AppBarLeft,
  AppBarMain,
  AppBarRight,
} from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Badge } from "seed-design/ui/badge";
import { Chip } from "seed-design/ui/chip";
import { getCategories, getListings, formatPrice, timeAgo, STATUS_LABEL } from "../api/client";
import type { Category, Listing } from "../api/types";
import { ListingThumb } from "../components/ListingThumb";

declare module "@stackflow/config" {
  interface Register {
    FeedActivity: {};
  }
}

const FeedActivity: ActivityComponentType<"FeedActivity"> = () => {
  const { push } = useFlow();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [items, setItems] = useState<Listing[] | null>(null);

  const load = async () => setItems(await getListings({ categoryId }));

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setItems(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <button type="button" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Text textStyle="t6Bold" color="fg.neutral">
              Yunusobod-4
            </Text>
            <ChevronDown size={18} />
          </button>
        </AppBarLeft>
        <AppBarMain />
        <AppBarRight>
          <AppBarIconButton aria-label="Qidirish">
            <Search />
          </AppBarIconButton>
          <AppBarIconButton aria-label="Bildirishnomalar">
            <Bell />
          </AppBarIconButton>
        </AppBarRight>
      </AppBar>

      <AppScreenContent ptr onPtrRefresh={load}>
        <VStack gap="x3" pt="x3" pb="x20">
          <HStack gap="x2" px="spacingX.globalGutter" style={{ overflowX: "auto" }}>
            <Chip.Toggle
              variant="outlineStrong"
              checked={categoryId === undefined}
              onCheckedChange={() => setCategoryId(undefined)}
            >
              <Chip.Label>Hammasi</Chip.Label>
            </Chip.Toggle>
            {categories.map((c) => (
              <Chip.Toggle
                key={c.id}
                variant="outlineStrong"
                checked={categoryId === c.id}
                onCheckedChange={(on) => setCategoryId(on ? c.id : undefined)}
              >
                <Chip.Label>{c.name}</Chip.Label>
              </Chip.Toggle>
            ))}
          </HStack>

          {items === null ? (
            <Text textStyle="t4Regular" color="fg.neutralMuted" style={{ padding: 16 }}>
              Yuklanmoqda…
            </Text>
          ) : items.length === 0 ? (
            <VStack align="center" py="x16" gap="x2">
              <Text textStyle="t5Bold">Bu bo'limda hozircha e'lon yo'q</Text>
              <Text textStyle="t4Regular" color="fg.neutralMuted">
                Birinchi bo'lib e'lon joylang!
              </Text>
            </VStack>
          ) : (
            <ul>
              {items.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => push("ListingActivity", { listingId: l.id })}
                    style={{
                      display: "flex",
                      gap: 16,
                      width: "100%",
                      textAlign: "start",
                      padding: "16px var(--seed-dimension-spacing-x-global-gutter)",
                      borderBottom: "1px solid var(--seed-color-stroke-neutral-muted)",
                    }}
                  >
                    <ListingThumb
                      imageUrl={l.imageUrl}
                      categoryId={l.categoryId}
                      size={108}
                      dimmed={l.status === "SOLD"}
                    />
                    <VStack gap="x1" flexGrow={1} style={{ minWidth: 0 }}>
                      <Text textStyle="t5Regular" color="fg.neutral" maxLines={2}>
                        {l.title}
                      </Text>
                      <Text textStyle="t3Regular" color="fg.neutralSubtle">
                        {l.mahalla} · {timeAgo(l.createdAt)}
                      </Text>
                      <HStack gap="x1_5" align="center">
                        {STATUS_LABEL[l.status] && (
                          <Badge
                            size="medium"
                            variant="weak"
                            tone={l.status === "RESERVED" ? "positive" : "neutral"}
                          >
                            {STATUS_LABEL[l.status]}
                          </Badge>
                        )}
                        <Text textStyle="t5Bold" color="fg.neutral">
                          {formatPrice(l)}
                        </Text>
                      </HStack>
                      <HStack gap="x2" justify="flex-end" mt="auto" color="fg.neutralSubtle">
                        {l.chatCount > 0 && (
                          <HStack gap="x0_5" align="center">
                            <MessageCircle size={14} />
                            <Text textStyle="t3Regular" color="fg.neutralSubtle">
                              {l.chatCount}
                            </Text>
                          </HStack>
                        )}
                        {l.likeCount > 0 && (
                          <HStack gap="x0_5" align="center">
                            <Heart size={14} />
                            <Text textStyle="t3Regular" color="fg.neutralSubtle">
                              {l.likeCount}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </VStack>
      </AppScreenContent>

      <button
        type="button"
        onClick={() => push("NewListingActivity", {})}
        style={{
          position: "absolute",
          right: 16,
          bottom: "calc(20px + var(--seed-safe-area-bottom))",
          zIndex: "var(--z-index-app-bar)" as unknown as number, // SEED stackflow z-index tizimiga moslash
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 18px",
          borderRadius: 999,
          background: "var(--seed-color-bg-brand-solid)",
          color: "var(--seed-color-fg-on-brand-solid, #fff)",
          boxShadow: "0 4px 14px rgba(0,0,0,.18)",
          fontWeight: 700,
        }}
      >
        <Plus size={20} /> E'lon berish
      </button>
    </AppScreen>
  );
};

export default FeedActivity;
