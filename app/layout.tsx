import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "AME Marketing — Strategic Marketing Agency",
    template: "%s | AME Marketing",
  },
  description:
    "A strategic marketing agency bridging Vietnamese and Japanese brands. Branding, digital marketing, performance, and more.",
  metadataBase: new URL("https://amenetwork.vn"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
