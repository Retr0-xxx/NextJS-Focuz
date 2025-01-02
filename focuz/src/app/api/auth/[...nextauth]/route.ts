import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

//send player to sigin in once player visits auth/signin

export const authOptions = {
    providers: [
        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
};

export const handler = (req, res) => NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };