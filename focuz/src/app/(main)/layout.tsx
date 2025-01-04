import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import SessionProvider from "../components/sessionProvider";
import NavMenu from "../components/NavMenu";

import "../globals.css"
import { Bebas_Neue } from 'next/font/google';
import { redirect } from "next/navigation";


const bebasNeue = Bebas_Neue({
  weight: '400', // Bebas Neue only supports 400
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Focuz",
};

export default async function MainRoot({children}: Readonly<{children: React.ReactNode;}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body className="bg-[#ED6A40]">
        <SessionProvider session={session}>
          <main>
            <NavMenu />
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
