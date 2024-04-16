import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface APIOutput {
    data?: string
    message?: string
}

export async function GET(req : NextRequest) {
    try {
        const userID = req.nextUrl.searchParams.get("userID");

        if (typeof(userID) != "string" || !userID) return NextResponse.json(
            { message: "Invalid UserID"} as APIOutput, {status: 400}
        )
        const url = process.env.SERVER_URL! + "/getCheckoutPage";
        const payload = {
            key: process.env.ADMIN_API_KEY!,
            userID: userID
        }
        const response = await axios.post(url, payload);
        const data = response.data as APIOutput;

        if (data.message) return NextResponse.json({ data: data.message } as APIOutput, {status : 500})
        return NextResponse.json({ data: data.data } as APIOutput, {status: 200})

    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Server Error" } as APIOutput, {status: 500});
    }
}