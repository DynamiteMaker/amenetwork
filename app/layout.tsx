import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AME Marketing",
  description:
    "A strategic marketing agency bridging Vietnamese and Japanese brands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
