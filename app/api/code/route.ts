import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import {OpenAI} from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { belowApiLimit, increaseApiLimit } from "@/lib/api-limit";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

const instructionMessage: ChatCompletionMessageParam = {
    role: "system",
    content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
} 

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
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages]
        })

        await increaseApiLimit();

        console.log("got response", response);
        console.log("message", response.choices[0].message);
        return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.log("[CODE ERROR]", error);
        return new NextResponse("Internal error", {status: 500});
    }
}