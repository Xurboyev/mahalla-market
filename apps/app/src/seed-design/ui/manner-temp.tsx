// Asl manba: SEED Design (github.com/daangn/seed-design), Apache-2.0. MahallaMarket uchun moslashtirilgan (ikonlar lucide-react).
import {
  Celsius,
  MannerTemp as SeedMannerTemp,
  SuffixIcon,
  type MannerTempProps as SeedMannerTempProps,
} from "@seed-design/react";
import * as React from "react";
import { Thermometer } from "lucide-react";
import { mannerTempToLevel } from "../lib/manner-temp-level";

export interface MannerTempProps extends Omit<SeedMannerTempProps, "children" | "asChild"> {
  /**
   * The manner temperature of the MannerTemp component.
   * Level will be calculated based on this value.
   * If level is provided, this will be ignored.
   */
  temperature: number;
}

export const MannerTemp = React.forwardRef<HTMLSpanElement, MannerTempProps>(
  ({ temperature, level, ...otherProps }, ref) => {
    return (
      <SeedMannerTemp ref={ref} level={level ?? mannerTempToLevel(temperature)} {...otherProps}>
        <Celsius value={temperature} />
        {/* Karrot CDN'dagi brend emotsiya rasmlari o'rniga oddiy ikonka */}
        <SuffixIcon svg={<Thermometer />} />
      </SeedMannerTemp>
    );
  },
);
MannerTemp.displayName = "MannerTemp";
