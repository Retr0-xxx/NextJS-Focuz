import { getServerSession } from "next-auth"
import { setPlantData } from "@/utils/db";
import { NextResponse } from "next/server";


//make POST request to water plant, body is amount of water
export async function POST(req: Request, res: Response) {
    const session = await getServerSession({ req });
    const body = await req.json();
    if(session && session.user){
        const email = session.user.email;
        const amount = body.amount;
        await setPlantData(email, 0, amount, 0);
    }
    return NextResponse.json({ success: true });
}
