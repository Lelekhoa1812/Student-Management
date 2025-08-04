import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | null
    image?: string | null
    role: string
    password?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
    role?: string
    email?: string
    name?: string
  }
} 