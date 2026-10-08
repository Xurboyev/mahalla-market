import { seedPlugin } from "@seed-design/stackflow";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { historySyncPlugin } from "@stackflow/plugin-history-sync";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { stackflow } from "@stackflow/react";
import ChatActivity from "../activities/ChatActivity";
import FeedActivity from "../activities/FeedActivity";
import ListingActivity from "../activities/ListingActivity";
import LoginActivity from "../activities/LoginActivity";
import NewListingActivity from "../activities/NewListingActivity";
import NotFoundActivity from "../activities/NotFoundActivity";
import RegionSelectActivity from "../activities/RegionSelectActivity";
import { config } from "./config";
import { theme } from "./theme";

/**
 * Stackflow — Daangn'ning ochiq kodli stack navigatsiya kutubxonasi (MIT).
 * Ekranlar ustma-ust ochiladi, orqaga swipe qilinadi, URL bilan sinxron.
 * https://stackflow.so
 */
export const { Stack, actions } = stackflow({
  config,
  components: {
    FeedActivity,
    ListingActivity,
    ChatActivity,
    NewListingActivity,
    LoginActivity,
    RegionSelectActivity,
    NotFoundActivity,
  },
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({ theme }),
    seedPlugin({ theme }),
    historySyncPlugin({ config, fallbackActivity: () => "NotFoundActivity" }),
  ],
});
