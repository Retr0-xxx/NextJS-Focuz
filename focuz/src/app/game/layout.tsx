import "../globals.css"
import { Bebas_Neue } from 'next/font/google';
import SessionProvider from "../components/sessionProvider";
import { getServerSession } from "next-auth";

const bebasNeue = Bebas_Neue({
  weight: '400', // Bebas Neue only supports 400
  subsets: ['latin'],
});

export default async function GameRoot({children}: Readonly<{children: React.ReactNode;}>) {
    const session = await getServerSession();

    return (
        <html lang="en">
            <body className="bg-[#FCB7AB]">
                <SessionProvider session={session}>
                    <main>
                        {children}
                    </main>
                </SessionProvider>
            </body>
        </html>
    );
}