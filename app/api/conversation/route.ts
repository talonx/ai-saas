import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

export async function POST(
    req: Request
) {
    try {
        console.log("in conv api");
        const {userId} = auth();
        const body = await req.json();
        const {messages} = body;

        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!messages) {
            return new NextResponse("Messages are required", {status: 400});
        }

        console.log("calling conv api", messages);
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        })
        console.log("got response", response);
        console.log("message", response.choices[0].message);
        return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.log("[CONV ERROR]", error);
        return new NextResponse("Internal error", {status: 500});
    }
}