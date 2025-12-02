import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();

    try {
        const sessionId = uuidv4();
        const result = await db.insert(SessionChatTable).values({
            sessionId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            notes,
            selectedDoctor,
            createdOn: new Date().toISOString(),
        }).returning();

        return NextResponse.json(result[0]);
    } catch (e) {
        return NextResponse.json({ error: e });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user = await currentUser();

    if (sessionId === 'all') {
        const result = await db.select().from(SessionChatTable)
            //@ts-ignore
            .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress));

        return NextResponse.json(result);
    } else {
        const result = await db.select().from(SessionChatTable)
            //@ts-ignore
            .where(eq(SessionChatTable.sessionId, sessionId))
            .orderBy(desc(SessionChatTable.id));

        return NextResponse.json(result[0]);
    }
}

