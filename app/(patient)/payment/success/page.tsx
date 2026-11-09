import { Suspense } from "react";
import type { Metadata } from "next";
import SuccessContent from "./SuccessContent";

export const metadata: Metadata = {
  title: "Payment successful",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
          <div className="w-8 h-8 border-4 border-[#00685C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
