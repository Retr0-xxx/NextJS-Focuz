import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

//send player to sigin in once player visits auth/signin

export const authOptions = {
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        CredentialsProvider({
          name: "Guest",
          credentials: {},
          async authorize(credentials, req) {
            // Generate a consistent UUID for the guest session
            const guestId = uuidv4();
            const guestEmail = `guest_${guestId}@example.com`;
            const guestName = "Guest User";
            const guestImage = ""; // Optional: Set a default image URL
    
            // Return the guest user object without inserting into the DB
            return {
              id: guestId, // Use the UUID as a consistent ID
              name: guestName,
              email: guestEmail,
              image: guestImage,
            };
          },
        }),

    ],
    callbacks: {
        //callback to store user in database
        async signIn({ user, account, profile, email, credentials }: { user: any, account: any, profile: any, email: any, credentials: any }) {
          //connect to database check if user exists by email
          const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          })
          
          // Check if user exists by email
          const [rows, fields]: [any, any] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [user.email]
          )
    
          if (rows.length === 0) {
            // If not, insert a new record
            await db.execute(
              "INSERT INTO users (name, email, image) VALUES (?, ?, ?)",
              [user.name, user.email, user.image]
            )
          }
          
          // Return true to allow sign in
          return true
        },

        async jwt({ token, user, account }) {
          if (user) {
            token.id = user.id
            token.email = user.email
            token.name = user.name
            token.image = user.image
          }
          return token
        },

        async session({ session, token }) {
          session.user.id = token.id
          session.user.email = token.email
          session.user.name = token.name
          session.user.image = token.image
          return session
        },
    
    }
};

export const handler = (req, res) => NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };