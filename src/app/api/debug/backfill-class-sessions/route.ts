import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/debug/backfill-class-sessions
// Secure with header X-Admin-Token matching process.env.ADMIN_TOKEN
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("x-admin-token")
    const expected = process.env.ADMIN_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const classes = await prisma.class.findMany({})
    let updated = 0
    for (const cls of classes) {
      // Always set a random number between 12 and 24 as requested
      const rand = Math.floor(Math.random() * (24 - 12 + 1)) + 12
      await prisma.class.update({
        where: { id: cls.id },
        data: { numSessions: rand },
      })
      updated++
    }

    return NextResponse.json({ message: "Backfill completed", total: classes.length, updated })
  } catch (error) {
    console.error("Error backfilling class sessions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


