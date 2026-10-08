import { Divider, HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AppBar,
  AppBarBackButton,
  AppBarIconButton,
  AppBarLeft,
  AppBarRight,
} from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { ActionButton } from "seed-design/ui/action-button";
import { Avatar } from "seed-design/ui/avatar";
import { Badge } from "seed-design/ui/badge";
import { Chip } from "seed-design/ui/chip";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { MannerTemp } from "seed-design/ui/manner-temp";
import { useAuth } from "../auth/AuthContext";
import { formatPrice, getCategories, getListing, setListingStatus, STATUS_LABEL, timeAgo } from "../api/client";
import type { Category, Listing } from "../api/types";
import { ListingThumb } from "../components/ListingThumb";

declare module "@stackflow/config" {
  interface Register {
    ListingActivity: { listingId: string };
  }
}

const ListingActivity: ActivityComponentType<"ListingActivity"> = ({ params }) => {
  const { push } = useFlow();
  const { token, user } = useAuth();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    getListing(params.listingId).then(setListing);
  }, [params.listingId]);

  const isOwner = !!user && !!listing && listing.seller.id === user.id;

  const changeStatus = async (status: "ACTIVE" | "RESERVED" | "SOLD") => {
    if (!token || !listing || statusBusy) return;
    setStatusBusy(true);
    try {
      const updated = await setListingStatus(token, listing.id, status);
      setListing(updated);
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <AppScreen layerOffsetTop="none" tone="transparent">
      <AppBar tone="transparent">
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarRight>
          <AppBarIconButton aria-label="Ulashish">
            <Share2 />
          </AppBarIconButton>
        </AppBarRight>
      </AppBar>

      <AppScreenContent>
        {listing === undefined ? null : listing === null ? (
          <VStack py="x20" align="center">
            <Text textStyle="t5Bold">E'lon topilmadi</Text>
          </VStack>
        ) : (
          <VStack pb="x24">
            <ListingThumb
              imageUrl={listing.imageUrl}
              categoryId={listing.categoryId}
              size="100%"
              radius={0}
            />

            {/* Sotuvchi */}
            <HStack px="spacingX.globalGutter" py="x4" gap="x3" align="center">
              <Avatar fallback={<IdentityPlaceholder identity="person" />} size="42" />
              <VStack flexGrow={1} gap="x0_5">
                <Text textStyle="t5Bold">{listing.seller.name}</Text>
                <Text textStyle="t3Regular" color="fg.neutralSubtle">
                  {listing.seller.mahalla}
                </Text>
              </VStack>
              <VStack align="flex-end" gap="x0_5">
                <MannerTemp temperature={listing.seller.temperature} />
                <Text textStyle="t2Regular" color="fg.neutralSubtle">
                  Mahalla harorati
                </Text>
              </VStack>
            </HStack>
            <Divider />

            {/* Tavsif */}
            <VStack px="spacingX.globalGutter" py="x5" gap="x2" align="flex-start">
              {STATUS_LABEL[listing.status] && (
                <Badge size="large" variant="weak" tone="positive">
                  {STATUS_LABEL[listing.status]}
                </Badge>
              )}
              <Text as="h1" textStyle="t7Bold">
                {listing.title}
              </Text>
              <Text textStyle="t3Regular" color="fg.neutralSubtle">
                {categories.find((c) => c.id === listing.categoryId)?.name} ·{" "}
                {timeAgo(listing.createdAt)}
              </Text>
              <Text
                as="p"
                textStyle="articleBody"
                color="fg.neutral"
                style={{ whiteSpace: "pre-wrap", marginTop: 8 }}
              >
                {listing.description}
              </Text>
              <Text textStyle="t3Regular" color="fg.neutralSubtle" style={{ marginTop: 8 }}>
                Chat {listing.chatCount} · Tanlangan {listing.likeCount + (liked ? 1 : 0)}
              </Text>
            </VStack>
          </VStack>
        )}
      </AppScreenContent>

      {listing && (
        <HStack
          gap="x4"
          align="center"
          px="spacingX.globalGutter"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: "var(--z-index-app-bar)" as unknown as number, // SEED stackflow z-index tizimiga moslash
            paddingTop: 12,
            paddingBottom: "calc(12px + var(--seed-safe-area-bottom))",
            background: "var(--seed-color-bg-layer-default)",
            borderTop: "1px solid var(--seed-color-stroke-neutral-muted)",
          }}
        >
          {isOwner ? (
            <VStack flexGrow={1} gap="x2">
              <Text textStyle="t3Regular" color="fg.neutralSubtle">
                Bu sizning e'loningiz — holatini boshqaring
              </Text>
              <HStack gap="x2" wrap>
                <Chip.Toggle
                  variant="solid"
                  checked={listing.status === "ACTIVE"}
                  disabled={statusBusy}
                  onCheckedChange={() => changeStatus("ACTIVE")}
                >
                  <Chip.Label>Faol</Chip.Label>
                </Chip.Toggle>
                <Chip.Toggle
                  variant="solid"
                  checked={listing.status === "RESERVED"}
                  disabled={statusBusy}
                  onCheckedChange={() => changeStatus("RESERVED")}
                >
                  <Chip.Label>Band qilingan</Chip.Label>
                </Chip.Toggle>
                <Chip.Toggle
                  variant="solid"
                  checked={listing.status === "SOLD"}
                  disabled={statusBusy}
                  onCheckedChange={() => changeStatus("SOLD")}
                >
                  <Chip.Label>Sotildi</Chip.Label>
                </Chip.Toggle>
              </HStack>
            </VStack>
          ) : (
            <>
              <button
                type="button"
                aria-label="Tanlanganlarga qo'shish"
                aria-pressed={liked}
                onClick={() => setLiked((v) => !v)}
                style={{ color: liked ? "var(--seed-color-fg-brand)" : "var(--seed-color-fg-neutral-subtle)" }}
              >
                <Heart size={24} fill={liked ? "currentColor" : "none"} />
              </button>
              <div
                style={{ width: 1, alignSelf: "stretch", background: "var(--seed-color-stroke-neutral-muted)" }}
              />
              <VStack flexGrow={1}>
                <Text textStyle="t6Bold">{formatPrice(listing)}</Text>
                <Text textStyle="t2Regular" color="fg.neutralSubtle">
                  Narx kelishiladi
                </Text>
              </VStack>
              <ActionButton
                size="medium"
                variant="brandSolid"
                disabled={listing.status === "SOLD"}
                onClick={() => push("ChatActivity", { listingId: listing.id })}
              >
                Chatda yozish
              </ActionButton>
            </>
          )}
        </HStack>
      )}
    </AppScreen>
  );
};

export default ListingActivity;
