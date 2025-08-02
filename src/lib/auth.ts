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

        // Check in Student collection first
        const student = await prisma.student.findUnique({
          where: { gmail: credentials.email }
        })

        if (student) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            student.password
          )

          if (isPasswordValid) {
            return {
              id: student.id,
              email: student.gmail,
              name: student.name,
              role: student.role,
            }
          }
        }

        // Check in Staff collection if not found in Student
        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email }
        })

        if (staff) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            staff.password
          )

          if (isPasswordValid) {
            return {
              id: staff.id,
              email: staff.email,
              name: staff.name,
              role: staff.role,
            }
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user exists in Student collection
          const student = await prisma.student.findUnique({
            where: { gmail: profile.email }
          })

          if (student) {
            console.log("✅ Google OAuth: Existing student found, allowing sign in")
            return true
          }

          // Check if user exists in Staff collection
          const staff = await prisma.staff.findUnique({
            where: { email: profile.email }
          })

          if (staff) {
            console.log("✅ Google OAuth: Existing staff found, allowing sign in")
            return true
          }

          // User doesn't exist, redirect to registration
          console.log("❌ Google OAuth: User not found, redirecting to registration")
          return "/tao-tai-khoan?error=no-account&email=" + encodeURIComponent(profile.email)
        } catch (error) {
          console.error("Error checking user existence:", error)
          return false
        }
      }

      return true
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, user, token }) {
      if (session?.user) {
        if (user) {
          session.user.id = user.id
          session.user.role = user.role
        } else if (token) {
          session.user.id = token.uid as string
          session.user.role = token.role as string
        }
      }
      return session
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