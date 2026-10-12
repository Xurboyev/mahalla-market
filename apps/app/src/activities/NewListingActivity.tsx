import { HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppBar, AppBarCloseButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { ActionButton } from "seed-design/ui/action-button";
import { Chip } from "seed-design/ui/chip";
import { TextField, TextFieldInput, TextFieldTextarea } from "seed-design/ui/text-field";
import { useAuth } from "../auth/AuthContext";
import { createListing, getCategories, uploadListingImage } from "../api/client";
import type { Category } from "../api/types";

declare module "@stackflow/config" {
  interface Register {
    NewListingActivity: {};
  }
}

const MAX_IMAGES = 10;

type ImageSlot = { id: string; previewUrl: string; publicUrl?: string; uploading: boolean; error?: string };

const NewListingActivity: ActivityComponentType<"NewListingActivity"> = () => {
  const { pop, push } = useFlow();
  const { token, user } = useAuth();

  // Token yo'q bo'lsa — login qildirib, keyin shu formaga qaytaramiz
  useEffect(() => {
    if (!token) {
      push("LoginActivity", {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageSlot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadingCount = images.filter((i) => i.uploading).length;
  const valid =
    title.trim().length >= 3 && categoryId !== null && (isFree || price !== "") && uploadingCount === 0;

  const onFilesSelected = (files: FileList | null) => {
    if (!files || !token) return;
    const remaining = MAX_IMAGES - images.length;
    const picked = Array.from(files).slice(0, remaining);
    for (const file of picked) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id, previewUrl, uploading: true }]);
      uploadListingImage(token, file)
        .then((publicUrl) => {
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, publicUrl, uploading: false } : img)));
        })
        .catch((e) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === id
                ? { ...img, uploading: false, error: e instanceof Error ? e.message : "Yuklanmadi" }
                : img,
            ),
          );
        });
    }
  };

  const removeImage = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id));

  const submit = async () => {
    if (!valid || !token || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const imageUrls = images.map((i) => i.publicUrl).filter((u): u is string => !!u);
      await createListing(token, {
        title: title.trim(),
        categoryId: categoryId!,
        description: description.trim() || undefined,
        isFree,
        price: isFree ? undefined : Number(price),
        regionId: user?.regionId ?? undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      });
      pop();
    } catch (e) {
      setError(e instanceof Error ? e.message : "E'lon joylashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

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
          <HStack gap="x2" style={{ overflowX: "auto" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => {
                onFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
            {images.map((img) => (
              <div key={img.id} style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                <img
                  src={img.previewUrl}
                  alt=""
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    objectFit: "cover",
                    opacity: img.uploading ? 0.5 : img.error ? 0.4 : 1,
                  }}
                />
                {img.uploading && (
                  <Text
                    textStyle="t2Regular"
                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    …
                  </Text>
                )}
                <button
                  type="button"
                  aria-label="O'chirish"
                  onClick={() => removeImage(img.id)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.65)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
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
                <span style={{ fontSize: 12 }}>
                  {images.length}/{MAX_IMAGES}
                </span>
              </button>
            )}
          </HStack>

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

          {error && (
            <Text textStyle="t4Regular" color="fg.negative">
              {error}
            </Text>
          )}

          <ActionButton size="large" variant="brandSolid" disabled={!valid} loading={submitting} onClick={submit}>
            Joylash
          </ActionButton>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};

export default NewListingActivity;
