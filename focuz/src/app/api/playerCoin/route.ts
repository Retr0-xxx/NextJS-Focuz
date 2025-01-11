import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mysql from "mysql2/promise";
import exp from "node:constants";

//api to handle coin values
//POST requests adds or subtracts coins
//GET requests reads current coin balances

export async function POST(req: Request, res: Response) {
    const session = await getServerSession({ req });
    if (session && session.user) {
        if (session.user.email) {
            const body = await req.json();
            const amount = body.amount;
            console.log("coin is added");
            addCoin(session.user.email, amount);
            return NextResponse.json({ success: true });
        } else {
            console.error("User email is missing.");
        }
    } else {
        console.error("Session or user information is missing.");
    }
}

export async function GET(req: Request, res: Response) {
    let coin = 0;
    const session = await getServerSession({ req });
    if (session && session.user) {
        if (session.user.email) {
            coin = await readCoin(session.user.email);
            return NextResponse.json({ coin });
        } else {
            console.error("User email is missing.");
        }
    } else {
        console.error("Session or user information is missing.");
    }
}


async function addCoin(clientId:any, amount:number){
    try{
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        if (amount > 0) {
            const [rows] = await db.query(
                `UPDATE users
                SET coin = coin + ?
                WHERE email = ?`,
                [amount, clientId]
            );
        }
        else{
            const [rows] = await db.query(
                `UPDATE users
                SET coin = coin - ?
                WHERE email = ?`,
                [-amount, clientId]
            );
        }
        await db.end();
    }
    catch(error){
        console.error("Error updating the database:", error);
    }
}


async function readCoin(clientId: string): Promise<number> {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows]: any = await db.query(
            `SELECT coin FROM users WHERE email = ?`,
            [clientId]
        );

        await db.end();

        if (rows.length > 0) {
            return rows[0].coin;
        } else {
            console.error("No user found with the given email.");
            return 0;
        }
    } catch (error) {
        console.error("Error reading the database:", error);
        return 0;
    }
}