import type { ReactNode } from "react";

import TawkToWidget from "@/components/TawkToWidget";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Embedded support chat for authenticated customers */}
      <TawkToWidget />
    </>
  );
}


