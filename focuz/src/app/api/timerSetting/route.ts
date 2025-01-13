import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { globalContext } from "@/utils/context";

const timerSetting = new Map<any, number>();

export async function GET(req: Request, res: Response) {
    const session = await getServerSession({ req });
    let individualTimerSetting = 0;
    let individualTimerReward = 0;
    if(session && session.user){
        individualTimerSetting = timerSetting.get(session.user.email)!;
        individualTimerReward = globalContext.timerReward.get(session.user.email)!;
    }
    return NextResponse.json({ timerSetting: individualTimerSetting, timerReward: individualTimerReward });
}

export async function POST(req: Request, res: Response) {
    console.log("POST request to timerSetting");
    const session = await getServerSession({ req });
    console.log("session X is: ", session);
    const body = await req.json();
    if (body.timerSetting && body.timerReward){
        if (session && session.user){
            timerSetting.set(session.user.email, body.timerSetting);
            globalContext.timerReward.set(session.user.email, body.timerReward);
        }
    }
    return NextResponse.json({ success: true });
}
