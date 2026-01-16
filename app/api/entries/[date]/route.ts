import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const entry = await prisma.journalEntry.findUnique({
    where: { date },
  });

  return NextResponse.json({ entry });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const payload = (await request.json()) as { body?: string };
  const body = payload.body ?? "";

  const entry = await prisma.journalEntry.upsert({
    where: { date },
    create: {
      date,
      body,
    },
    update: {
      body,
    },
  });

  return NextResponse.json({ entry });
}
