import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AntdRegistry } from '@ant-design/nextjs-registry';

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <section className="bg-neutral-50 min-h-screen">
          <Navbar />
          <Sidebar />
          <div className="pt-6 lg:pl-72 lg:pr-6 px-8 pb-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
              <AntdRegistry>
                {children}
              </AntdRegistry>
            </div>
          </div>
        </section>

      </body>
    </html>
  );
}
