import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!user || !(user as any).password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    session: async ({ session, user, token }) => {
      if (session?.user) {
        if (user) {
          session.user.id = user.id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session.user.role = (user as any).role
        } else if (token) {
          session.user.id = token.uid as string
          session.user.role = token.role as string
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role
      }
      return token
    },
  },
  pages: {
    signIn: '/dang-nhap',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} 