"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OptionARedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center text-[#999]">
      Redirecting to current homepage...
    </div>
  );
}
