import { Suspense } from "react";
import type { Metadata } from "next";
import FailedContent from "./FailedContent";

export const metadata: Metadata = {
  title: "Payment failed",
};

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
          <div className="w-8 h-8 border-4 border-[#00685C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
