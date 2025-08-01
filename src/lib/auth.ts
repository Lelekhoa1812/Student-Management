import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
} 