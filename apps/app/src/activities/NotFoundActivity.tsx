import { Text, VStack } from "@seed-design/react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";

declare module "@stackflow/config" {
  interface Register {
    NotFoundActivity: {};
  }
}

const NotFoundActivity: ActivityComponentType<"NotFoundActivity"> = () => (
  <AppScreen>
    <AppBar>
      <AppBarLeft>
        <AppBarBackButton />
      </AppBarLeft>
    </AppBar>
    <AppScreenContent>
      <VStack align="center" py="x20" gap="x2">
        <Text textStyle="t6Bold">Sahifa topilmadi</Text>
        <Text textStyle="t4Regular" color="fg.neutralMuted">
          Havola eskirgan yoki noto'g'ri bo'lishi mumkin.
        </Text>
      </VStack>
    </AppScreenContent>
  </AppScreen>
);

export default NotFoundActivity;
