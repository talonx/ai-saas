import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {OpenAI} from "openai";
import { belowApiLimit, increaseApiLimit } from "@/lib/api-limit";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

export async function POST(
    req: Request
) {
    try {
        const {userId} = auth();
        const body = await req.json();
        const {messages} = body;

        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!messages) {
            return new NextResponse("Messages are required", {status: 400});
        }

        const apiAllowed = await belowApiLimit();
        console.log("allowed", apiAllowed);
        if (!apiAllowed) {
            return new NextResponse("Free trial expired.", {status: 403});
        }
        console.log("calling conv api", messages);
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        })

        await increaseApiLimit();

        console.log("got response", response);
        console.log("message", response.choices[0].message);
        return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.log("[CONV ERROR]", error);
        return new NextResponse("Internal error", {status: 500});
    }
}