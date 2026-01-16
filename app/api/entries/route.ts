import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end are required" },
      { status: 400 },
    );
  }

  const entries = await prisma.journalEntry.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return NextResponse.json({ dates: entries.map((entry) => entry.date) });
}
