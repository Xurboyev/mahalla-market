// Asl manba: SEED Design (github.com/daangn/seed-design), Apache-2.0. MahallaMarket uchun moslashtirilgan (ikonlar lucide-react).
import { ChevronLeft as IconChevronLeftLine, X as IconXmarkLine } from "lucide-react";
import { VStack } from "@seed-design/react";
import { AppBar as SeedAppBar } from "@seed-design/stackflow";
import { useFlow, useActivity } from "@stackflow/react";
import * as React from "react";
import { forwardRef } from "react";

export interface AppBarProps extends SeedAppBar.RootProps {}

export const AppBar = SeedAppBar.Root;

export interface AppBarLeftProps extends SeedAppBar.LeftProps {}

export const AppBarLeft = SeedAppBar.Left;

export interface AppBarRightProps extends SeedAppBar.RightProps {}

export const AppBarRight = SeedAppBar.Right;

export interface AppBarSlotProps extends SeedAppBar.SlotProps {}

export const AppBarSlot = SeedAppBar.Slot;

export interface AppBarMainProps extends Omit<SeedAppBar.MainProps, "asChild"> {
  /**
   * The title of the app bar.
   * If children is provided as ReactElement, this prop will be ignored.
   */
  title?: string;

  /**
   * The subtitle of the app bar.
   * If children is provided as ReactElement, this prop will be ignored.
   */
  subtitle?: string;
}

export const AppBarMain = forwardRef<HTMLDivElement, AppBarMainProps>(
  ({ title, subtitle, children, ...otherProps }, ref) => {
    if (React.isValidElement(children)) {
      return (
        <SeedAppBar.Main {...otherProps} ref={ref}>
          {children}
        </SeedAppBar.Main>
      );
    }

    return (
      <SeedAppBar.Main layout={subtitle ? "withSubtitle" : "titleOnly"} {...otherProps} ref={ref}>
        <VStack overflowX="auto">
          <SeedAppBar.Title>{children ?? title}</SeedAppBar.Title>
          {subtitle ? <SeedAppBar.Subtitle>{subtitle}</SeedAppBar.Subtitle> : null}
        </VStack>
      </SeedAppBar.Main>
    );
  },
);
AppBarMain.displayName = "AppBarMain";

export interface AppBarIconButtonProps extends SeedAppBar.IconButtonProps {}

export const AppBarIconButton = SeedAppBar.IconButton;

export const AppBarBackButton = forwardRef<HTMLButtonElement, AppBarIconButtonProps>(
  ({ children = <IconChevronLeftLine />, onClick, ...otherProps }, ref) => {
    const activity = useActivity();
    const actions = useFlow();

    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);

      if (!e.defaultPrevented) {
        actions.pop();
      }
    };

    if (!activity) {
      return null;
    }
    if (activity.isRoot) {
      return null;
    }

    return (
      <SeedAppBar.IconButton
        ref={ref}
        aria-label="Orqaga"
        type="button"
        onClick={handleOnClick}
        {...otherProps}
      >
        {children}
      </SeedAppBar.IconButton>
    );
  },
);
AppBarBackButton.displayName = "AppBarBackButton";

export const AppBarCloseButton = forwardRef<HTMLButtonElement, AppBarIconButtonProps>(
  ({ children = <IconXmarkLine />, onClick, ...otherProps }, ref) => {
    const activity = useActivity();
    const actions = useFlow();

    // MahallaMarket: modal ekranlarni (masalan, "Yangi e'lon") yopish uchun pop() qiladi.
    // Ildiz ekranda (WebView ichida) native qobiq yopilishi keyin metabridge orqali ulanadi.
    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && activity && !activity.isRoot) {
        actions.pop();
      }
    };

    return (
      <AppBarIconButton
        ref={ref}
        aria-label="Yopish"
        type="button"
        onClick={handleOnClick}
        {...otherProps}
      >
        {children}
      </AppBarIconButton>
    );
  },
);
AppBarCloseButton.displayName = "AppBarCloseButton";
