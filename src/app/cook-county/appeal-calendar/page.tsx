import { Metadata } from "next";
import AppealCalendarClient from "./AppealCalendarClient";

export const metadata: Metadata = {
  title: "Cook County Property Tax Appeal Calendar 2026 | All 38 Townships | Overtaxed",
  description: "Complete 2026 Cook County property tax appeal calendar. Find when your township's appeal window opens at the Assessor and Board of Review. South/West suburbs being reassessed in 2026 — biggest savings opportunity.",
  openGraph: {
    title: "Cook County Appeal Calendar 2026 | Overtaxed",
    description: "Find when your Cook County township's property tax appeal window opens in 2026. All 38 townships covered.",
  },
  alternates: {
    canonical: "https://getovertaxed.com/cook-county/appeal-calendar",
  },
};

export default function AppealCalendarPage() {
  return <AppealCalendarClient />;
}
