import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";

const timerSetting = new Map<any, number>();

export async function GET(req: Request, res: Response) {
    const session = await getServerSession({ req });
    let individualTimerSetting = 0;
    if(session && session.user){
        individualTimerSetting = timerSetting.get(session.user.email)!;
    }
    return NextResponse.json({ timerSetting: individualTimerSetting });
}

export async function POST(req: Request, res: Response) {
    console.log("POST request to timerSetting");
    const session = await getServerSession({ req });
    console.log("session X is: ", session);
    const body = await req.json();
    if (body.timerSetting){
        if (session && session.user){
            timerSetting.set(session.user.email, body.timerSetting);
            console.log("timer setting is: ", timerSetting.get(session.user.email));
        }
    }
    return NextResponse.json({ success: true });
}
