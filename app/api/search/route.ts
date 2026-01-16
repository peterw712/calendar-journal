import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildSnippet(body: string, query: string) {
  const loweredBody = body.toLowerCase();
  const loweredQuery = query.toLowerCase();
  const index = loweredBody.indexOf(loweredQuery);
  if (index === -1) {
    return body.slice(0, 120);
  }
  const padding = 50;
  const start = Math.max(0, index - padding);
  const end = Math.min(body.length, index + loweredQuery.length + padding);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < body.length ? "…" : "";
  return `${prefix}${body.slice(start, end)}${suffix}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const entries = await prisma.journalEntry.findMany({
    where: {
      body: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      date: true,
      body: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 200,
  });

  return NextResponse.json({
    results: entries.map((entry) => ({
      date: entry.date,
      snippet: buildSnippet(entry.body, query),
    })),
  });
}
