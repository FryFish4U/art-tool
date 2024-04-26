import { Inter } from "next/font/google";
import "./globals.css";
import { ModelProvider} from "./model-provider";
import Loading from "./loading";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

//export const metadata = {
//  title: "Create Next App",
//  description: "Generated by create next app",
//};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Suspense fallback={<Loading/>}>
      <ModelProvider>
        <body className={inter.className}>{children}</body>
      </ModelProvider>
      </Suspense>
    </html>
  );
}
