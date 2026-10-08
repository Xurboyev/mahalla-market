import "@seed-design/css/base.css";
import "@stackflow/plugin-basic-ui/index.css";
import "./styles/theme.css";

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Stack } from "./stackflow/stack";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense>
      <Stack />
    </Suspense>
  </StrictMode>,
);
