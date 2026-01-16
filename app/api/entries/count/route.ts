import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const count = await prisma.journalEntry.count();
  return NextResponse.json({ count });
}
