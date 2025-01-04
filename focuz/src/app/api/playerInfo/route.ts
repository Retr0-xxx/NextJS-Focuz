import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mysql from "mysql2/promise";


export async function GET(req: Request, res: Response) {
    const session = await getServerSession({ req });
    if (session && session.user) {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows, fields]: [any, any] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [session.user.email]
        );

        if (rows.length === 0) {
            return NextResponse.json({ last_time: 0, total_time: 0 });
        } else {
            return NextResponse.json({ last_time: rows[0].last_time, total_time: rows[0].total_time });
        }
    } else {
        console.error("Session or user information is missing.");
    }
}