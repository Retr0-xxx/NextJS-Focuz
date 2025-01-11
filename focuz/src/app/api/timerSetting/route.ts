import { NextResponse } from "next/server";

let timerSetting =  5000;

export async function GET(req: Request, res: Response) {
    return NextResponse.json({ timerSetting });
}

export async function POST(req: Request, res: Response) {
    const body = await req.json();
    if (body.timerSetting){
        timerSetting = body.timerSetting;
    }
    return NextResponse.json({ success: true });
}
