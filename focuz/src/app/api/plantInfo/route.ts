import { getServerSession } from "next-auth"
import { getPlantData } from "@/utils/db";
import { NextResponse } from "next/server";


//get info about plant (growth, water, death)
export async function GET(req: Request, res: Response) {
    const session = await getServerSession({ req });
    let info = null;
    if(session && session.user){
        info =  await getPlantData(session.user.email); 
    }
    return NextResponse.json({ info: info });
}
