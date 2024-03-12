import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"
import { MAX_FREE_COUNTS } from "@/constants"

export const increaseApiLimit = async() => {
    const { userId } = auth();

    if (!userId) {
        return;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId: userId
        },
    });

    if(userApiLimit) {
        await prismadb.userApiLimit.update({
            where: {
                userId: userId
            },
            data: {
                count: userApiLimit.count + 1
            },
        });
    } else {
        await prismadb.userApiLimit.create({
            data: {
                userId: userId, count: 1
            },
        });
    }
};

export const belowApiLimit = async() => {
    const { userId } = auth();

    if (!userId) {
        return false;//Invalid, we don't want any API calls.
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId: userId
        },
    });

    console.log("limit", userApiLimit?.count, MAX_FREE_COUNTS)
    if(!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
        return true;
    }
    return false;
 };