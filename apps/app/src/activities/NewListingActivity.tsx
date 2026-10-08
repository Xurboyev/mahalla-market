import { HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { AppBar, AppBarCloseButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { ActionButton } from "seed-design/ui/action-button";
import { Chip } from "seed-design/ui/chip";
import { TextField, TextFieldInput, TextFieldTextarea } from "seed-design/ui/text-field";
import { getCategories } from "../api/client";
import type { Category } from "../api/types";

declare module "@stackflow/config" {
  interface Register {
    NewListingActivity: {};
  }
}

// TODO: POST /api/listings (auth) va rasm yuklash (presigned URL) — Sprint 1
const NewListingActivity: ActivityComponentType<"NewListingActivity"> = () => {
  const { pop } = useFlow();
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const valid = title.trim().length >= 3 && categoryId !== null && (isFree || price !== "");

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarCloseButton />
        </AppBarLeft>
        <AppBarMain title="Yangi e'lon" />
      </AppBar>
      <AppScreenContent>
        <VStack gap="x6" px="spacingX.globalGutter" py="x4" pb="x24">
          <button
            type="button"
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              border: "1px solid var(--seed-color-stroke-neutral-weak, #ddd)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              color: "var(--seed-color-fg-neutral-subtle)",
            }}
          >
            <Camera size={22} />
            <span style={{ fontSize: 12 }}>0/10</span>
          </button>

          <TextField label="Sarlavha" value={title} onValueChange={({ value }) => setTitle(value)}>
            <TextFieldInput placeholder="Masalan: Bolalar velosipedi" />
          </TextField>

          <VStack gap="x2">
            <Text textStyle="t4Bold">Kategoriya</Text>
            <HStack gap="x2" wrap>
              {categories.filter((c) => c.slug !== "tekin").map((c) => (
                <Chip.Toggle
                  key={c.id}
                  variant="outlineStrong"
                  checked={categoryId === c.id}
                  onCheckedChange={(on) => setCategoryId(on ? c.id : null)}
                >
                  <Chip.Label>{c.name}</Chip.Label>
                </Chip.Toggle>
              ))}
            </HStack>
          </VStack>

          <VStack gap="x2">
            <HStack gap="x2">
              <Chip.Toggle variant="solid" checked={!isFree} onCheckedChange={() => setIsFree(false)}>
                <Chip.Label>Sotaman</Chip.Label>
              </Chip.Toggle>
              <Chip.Toggle variant="solid" checked={isFree} onCheckedChange={() => setIsFree(true)}>
                <Chip.Label>Tekin beraman</Chip.Label>
              </Chip.Toggle>
            </HStack>
            {!isFree && (
              <TextField
                label="Narx"
                suffix="so'm"
                value={price}
                onValueChange={({ value }) => setPrice(value.replace(/\D/g, ""))}
              >
                <TextFieldInput inputMode="numeric" placeholder="0" />
              </TextField>
            )}
          </VStack>

          <TextField
            label="Batafsil"
            description="Holati, qachon olingani, qayerda uchrashish mumkinligi"
            value={description}
            onValueChange={({ value }) => setDescription(value)}
          >
            <TextFieldTextarea placeholder="Mahalladoshlaringizga buyum haqida yozing" autoresize />
          </TextField>

          <ActionButton size="large" variant="brandSolid" disabled={!valid} onClick={() => pop()}>
            Joylash
          </ActionButton>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};

export default NewListingActivity;
