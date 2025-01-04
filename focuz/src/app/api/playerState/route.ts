import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mysql from "mysql2/promise";
import { redirect } from "next/navigation";

let isTmerRunning = false;
let shouldRedirect = false;
const timers = new Map();

//post request to player state start or stop timer
export async function POST(req: Request, res: Response) {
    const body = await req.json();
    const isPlayerInGame = body.isPlayerInGame;
    const session = await getServerSession({ req });
    if (session && session.user) {
        if (isPlayerInGame && !isTmerRunning) {
            startTimer(session.user.email);
        } else if (!isPlayerInGame && isTmerRunning) {
            stopTimer(session.user.email);
        }
    } else {
        console.error("Session or user information is missing.");
    }
    return NextResponse.json({ success: true });
}

//get request to player state reads timer
export async function GET(req: Request, res: Response) {
    const session = await getServerSession({ req });
    if (session && session.user) {
        const elapsedTime = readTimer(session.user.email);
        if (shouldRedirect) {
            shouldRedirect = false;
            return NextResponse.json({ elapsedTime, shouldRedirect : true });
        }
        else{
            return NextResponse.json({ elapsedTime, shouldRedirect : false });
        }
    } else {
        console.error("Session or user information is missing.");
    }
}

function startTimer(clientId:any) {
    isTmerRunning = true;
    const startTime = Date.now();
    timers.set(clientId, { startTime });
    console.log(`Timer started for client ${clientId}`);
}

function readTimer(clientId:any) {
    if (!timers.has(clientId)) return null;
    const { startTime } = timers.get(clientId);
    checkTimerAsync(clientId);
    return Date.now() - startTime;
}

async function checkTimerAsync(clientId:any) {
    if (!timers.has(clientId)) return null;
    const response = await fetch("http://localhost:3000/api/timerSetting");
    const { timerSetting } = await response.json();
    const { startTime } = timers.get(clientId);
    if (Date.now() - startTime > timerSetting) {
        stopTimer(clientId);
        shouldRedirect = true;
    } 
}


async function stopTimer(clientId:any) {
    isTmerRunning = false;
    if (!timers.has(clientId)) return null;

    const { startTime } = timers.get(clientId);
    const elapsedTime = Date.now() - startTime;
    timers.delete(clientId);

    try {
        // Create a database connection
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Update the database: set last_time and increment total_time
        const [rows] = await db.query(
            `UPDATE users 
             SET last_time = ?, 
                 total_time = total_time + ? 
             WHERE email = ?`,
            [elapsedTime, elapsedTime, clientId]
        );

        console.log(`Timer stopped for client ${clientId}. Elapsed time: ${elapsedTime} ms`);
        console.log(`${rows.affectedRows} row(s) updated.`);

        // Close the database connection
        await db.end();
    } catch (error) {
        console.error("Error updating the database:", error);
    }

    return elapsedTime;
}
