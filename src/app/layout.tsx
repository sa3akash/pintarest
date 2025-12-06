import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinterest - application for image and video sharing",
  description:
    "Pinterest - application for image and video sharing. you can share your image and video with the world.",
  keywords: [
    "Pinterest",
    "image sharing",
    "video sharing",
    "image and video sharing",
    "Pinterest app",
    "Pinterest application",
    "Pinterest for image and video sharing",
  ],
  authors: [
    {
      name: "Shakil Ahmed",
      url: "https://github.com/sa3akash",
    },
  ],
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#ffffff",
  colorScheme: "light",
  openGraph: {
    title: "Pinterest - application for image and video sharing",
    description:
      "Pinterest - application for image and video sharing. you can share your image and video with the world.",
    type: "website",
    locale: "en_US",
    siteName: "Pinterest",
  },
  twitter: {
    title: "Pinterest - application for image and video sharing",
    description:
      "Pinterest - application for image and video sharing. you can share your image and video with the world.",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "google-site-verification",
    yandex: "yandex-verification",
    yahoo: "yahoo-site-verification",
  },

  creator: "@sa3akash",
  publisher: "@sa3akash",

  category: "Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
