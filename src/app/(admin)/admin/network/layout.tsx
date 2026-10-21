import { Suspense } from "react";

import { NetworkTabs } from "@/components/admin/network/network-tabs";

export default function NetworkLayout({ children }: LayoutProps<"/admin/network">) {
  return (
    <>
      <Suspense fallback={<div className="mb-6 h-10 border-b" />}>
        <NetworkTabs />
      </Suspense>
      {children}
    </>
  );
}
