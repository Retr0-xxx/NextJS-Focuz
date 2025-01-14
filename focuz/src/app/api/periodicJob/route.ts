import { updatePlantStats } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
    updatePlantStats();
    return NextResponse.json({ success: true });
}