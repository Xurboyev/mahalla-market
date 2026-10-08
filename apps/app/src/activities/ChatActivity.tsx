import { HStack, Text, VStack } from "@seed-design/react";
import type { ActivityComponentType } from "@stackflow/react";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { MannerTemp } from "seed-design/ui/manner-temp";
import { useAuth } from "../auth/AuthContext";
import { formatPrice, getChatHistory, getListing, markChatRead, openChatRoom, SOCKET_URL } from "../api/client";
import type { ChatMessage, Listing } from "../api/types";
import { ListingThumb } from "../components/ListingThumb";

declare module "@stackflow/config" {
  interface Register {
    ChatActivity: { listingId: string };
  }
}

const QUICK_REPLIES = ["Hali sotuvdami?", "Narxi kelishiladimi?", "Qachon ko'rsa bo'ladi?"];
const SAFETY_NOTE = "Xavfsiz bitim uchun uchrashuvni gavjum, yorug' joyda belgilang.\nOldindan pul o'tkazmang.";

const ChatActivity: ActivityComponentType<"ChatActivity"> = ({ params }) => {
  const { token, user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getListing(params.listingId).then(setListing);
  }, [params.listingId]);

  // Chat xonasini ochish + tarixni yuklash + Socket.IO ulanish
  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const room = await openChatRoom(token, params.listingId);
        if (!active) return;
        setRoomId(room.id);
        const history = await getChatHistory(token, room.id);
        if (!active) return;
        setMessages(history);
        markChatRead(token, room.id).catch(() => {});

        const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
        socketRef.current = socket;
        socket.on("connect", () => {
          setConnected(true);
          socket.emit("room:join", { roomId: room.id });
        });
        socket.on("disconnect", () => setConnected(false));
        socket.on("message:new", (msg: ChatMessage) => {
          if (msg.roomId !== room.id) return;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.senderId !== user?.id) markChatRead(token, room.id).catch(() => {});
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chat ochilmadi");
      }
    })();
    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.listingId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed || !roomId || !socketRef.current) return;
    socketRef.current.emit("message:send", { roomId, body: trimmed }, (msg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    setText("");
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain>
          <HStack gap="x1_5" align="center" justify="center">
            <Text textStyle="t5Bold">{listing?.seller.name ?? ""}</Text>
            {listing && <MannerTemp temperature={listing.seller.temperature} />}
            {!connected && roomId && (
              <Text textStyle="t2Regular" color="fg.neutralSubtle">
                (ulanmoqda…)
              </Text>
            )}
          </HStack>
        </AppBarMain>
      </AppBar>

      <AppScreenContent>
        {listing && (
          <HStack
            gap="x3"
            align="center"
            px="spacingX.globalGutter"
            py="x3"
            style={{ borderBottom: "1px solid var(--seed-color-stroke-neutral-muted)" }}
          >
            <ListingThumb imageUrl={listing.imageUrl} categoryId={listing.categoryId} size={40} radius={6} />
            <VStack style={{ minWidth: 0 }}>
              <Text textStyle="t4Medium" maxLines={1}>
                {listing.title}
              </Text>
              <Text textStyle="t4Bold">{formatPrice(listing)}</Text>
            </VStack>
          </HStack>
        )}

        <VStack gap="x2" px="spacingX.globalGutter" py="x4" style={{ paddingBottom: 140 }}>
          {error && (
            <Text textStyle="t4Regular" color="fg.negative" style={{ textAlign: "center" }}>
              {error}
            </Text>
          )}
          <VStack align="center" gap="x1" py="x4">
            <Text
              textStyle="t4Regular"
              color="fg.neutralMuted"
              style={{ textAlign: "center", whiteSpace: "pre-wrap" }}
            >
              {SAFETY_NOTE}
            </Text>
          </VStack>
          {messages.map((m) => {
            const fromMe = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: fromMe ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: 18,
                  background: fromMe ? "var(--seed-color-bg-brand-solid)" : "var(--seed-color-bg-neutral-weak)",
                  color: fromMe ? "#fff" : "var(--seed-color-fg-neutral)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.body}
              </div>
            );
          })}
          <div ref={endRef} />
        </VStack>
      </AppScreenContent>

      <VStack
        gap="x2"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: "var(--z-index-app-bar)" as unknown as number, // SEED stackflow z-index tizimiga moslash
          padding: "8px 12px calc(8px + var(--seed-safe-area-bottom))",
          background: "var(--seed-color-bg-layer-default)",
          borderTop: "1px solid var(--seed-color-stroke-neutral-muted)",
        }}
      >
        {messages.length === 0 && (
          <HStack gap="x2" style={{ overflowX: "auto" }}>
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                style={{
                  flexShrink: 0,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid var(--seed-color-stroke-neutral-weak, #ddd)",
                  fontSize: 14,
                }}
              >
                {q}
              </button>
            ))}
          </HStack>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Xabar yozing"
            aria-label="Xabar"
            disabled={!roomId}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              outline: "none",
              fontSize: 16,
              background: "var(--seed-color-bg-neutral-weak)",
              color: "var(--seed-color-fg-neutral)",
            }}
          />
          <button
            type="submit"
            aria-label="Yuborish"
            disabled={!text.trim() || !roomId}
            style={{
              color: text.trim() ? "var(--seed-color-fg-brand)" : "var(--seed-color-fg-disabled)",
            }}
          >
            <SendHorizontal size={24} />
          </button>
        </form>
      </VStack>
    </AppScreen>
  );
};

export default ChatActivity;
