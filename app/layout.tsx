import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crossclimb - Custom Word Ladder Puzzle",
  description: "Create and play custom Crossclimb word ladder puzzles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

