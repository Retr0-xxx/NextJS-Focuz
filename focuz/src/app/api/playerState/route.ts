import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mysql from "mysql2/promise";
import { redirect } from "next/navigation";
import { url } from "inspector";

//player state means timers
//post request starts or stops time based on if timer is running or not
//get request reads timers, returns if the page should redirect or not
//also handles saving timer info to db, and adding coins to user

type timerEntry = {
    startTime: number;
    isTimerRunning: boolean;
    shouldRedirect: boolean;
};

const timers = new Map<any, timerEntry>();

//post request to player state start or stop timer
export async function POST(req: Request, res: Response) {
    const body = await req.json();
    const isPlayerInGame = body.isPlayerInGame;
    const session = await getServerSession({ req });
    if (session && session.user) {
        if (isPlayerInGame && !timers.get(session.user.email)?.isTimerRunning) {
            startTimer(session.user.email);
        } else if (!isPlayerInGame && timers.get(session.user.email)?.isTimerRunning) {
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
    const cookie : string = req.headers.get("cookie")!;
    if (session && session.user) {
        const elapsedTime = readTimer(session.user.email, cookie);
        if (timers.get(session.user.email)?.shouldRedirect) {
            timers.get(session.user.email)!.shouldRedirect = false;
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
    timers.set(clientId, { startTime: Date.now(), isTimerRunning: true, shouldRedirect: false });
    console.log(`Timer started for client ${clientId}`);
}

function readTimer(clientId: any, cookie: string) {
    if (!timers.has(clientId)) return 0;
    const startTime = timers.get(clientId)?.startTime ?? 0;
    checkTimerAsync(clientId, cookie);
    return Date.now() - startTime;
}

async function checkTimerAsync(clientId:any, cookie: string) {
    const baseUrl = process.env.BASE_URL;  
    //forward the cookie, imortant for getServersession()
    const response = await fetch(`${baseUrl}/api/timerSetting`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie,
        },
    }
    );
    const { timerSetting } = await response.json();
    const timer = timers.get(clientId);
    if (!timer || !timer.isTimerRunning) return 0;
    const startTime = timers.get(clientId)?.startTime ?? 0;
    if (Date.now() - startTime > timerSetting) {
        stopTimer(clientId);
        timers.get(clientId)!.shouldRedirect = true;
        addCoin(clientId, 1);
    } 
}


async function stopTimer(clientId:any) {
    const timer = timers.get(clientId);
    if (!timer || !timer.isTimerRunning) return null; // Prevent multiple calls

    const startTime = timers.get(clientId)?.startTime ?? 0;
    const elapsedTime = Date.now() - startTime;
    timers.set(clientId, { startTime: 0, isTimerRunning: false, shouldRedirect: false });

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

        // Close the database connection
        await db.end();
    } catch (error) {
        console.error("Error updating the database:", error);
    }

    return elapsedTime;
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