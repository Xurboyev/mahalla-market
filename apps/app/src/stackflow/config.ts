import { defineConfig } from "@stackflow/config";
import { theme } from "./theme";

export const config = defineConfig({
  initialActivity: () => "FeedActivity",
  activities: [
    { name: "FeedActivity", route: "/" },
    { name: "ListingActivity", route: "/e/:listingId" },
    { name: "ChatActivity", route: "/chat/:listingId" },
    { name: "NewListingActivity", route: "/yangi" },
    { name: "LoginActivity", route: "/kirish" },
    { name: "RegionSelectActivity", route: "/mahalla" },
    { name: "NotFoundActivity", route: "/404" },
  ],
  transitionDuration: theme === "cupertino" ? 350 : 270,
});
