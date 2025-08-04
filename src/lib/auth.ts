import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
          console.log("❌ Missing credentials")
          return null
        }

        try {
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
              console.log("✅ Student login successful:", student.gmail)
              return {
                id: student.id,
                email: student.gmail,
                name: student.name,
                role: student.role,
              }
            } else {
              console.log("❌ Invalid password for student:", student.gmail)
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
              console.log("✅ Staff login successful:", staff.email)
              return {
                id: staff.id,
                email: staff.email,
                name: staff.name,
                role: staff.role,
              }
            } else {
              console.log("❌ Invalid password for staff:", staff.email)
            }
          }

          console.log("❌ User not found:", credentials.email)
          return null
        } catch (error) {
          console.error("❌ Database error during authentication:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google" && profile?.email) {
        try {
          console.log("🔍 Google OAuth: Checking for existing user with email:", profile.email)
          
          // Check if user exists in Student collection
          const student = await prisma.student.findUnique({
            where: { gmail: profile.email }
          })

          if (student) {
            console.log("✅ Google OAuth: Existing student found:", student.name)
            // Update the user object with database info
            user.id = student.id
            user.role = student.role
            user.name = student.name
            return true
          }

          // Check if user exists in Staff collection
          const staff = await prisma.staff.findUnique({
            where: { email: profile.email }
          })

          if (staff) {
            console.log("✅ Google OAuth: Existing staff found:", staff.name)
            // Update the user object with database info
            user.id = staff.id
            user.role = staff.role
            user.name = staff.name
            return true
          }

          // User doesn't exist, redirect to registration
          console.log("❌ Google OAuth: User not found, redirecting to registration")
          return "/tao-tai-khoan?error=no-account&email=" + encodeURIComponent(profile.email)
        } catch (error) {
          console.error("❌ Error checking user existence:", error)
          return false
        }
      }

      return true
    },
    async jwt({ user, token, account, profile }) {
      // Handle Google OAuth JWT creation
      if (account?.provider === "google" && profile?.email) {
        try {
          // Fetch user data from database to ensure we have the correct role and ID
          const student = await prisma.student.findUnique({
            where: { gmail: profile.email }
          })

          if (student) {
            token.uid = student.id
            token.role = student.role
            token.email = student.gmail
            token.name = student.name
            console.log("✅ JWT: Student data set for:", student.gmail)
            return token
          }

          const staff = await prisma.staff.findUnique({
            where: { email: profile.email }
          })

          if (staff) {
            token.uid = staff.id
            token.role = staff.role
            token.email = staff.email
            token.name = staff.name
            console.log("✅ JWT: Staff data set for:", staff.email)
            return token
          }
        } catch (error) {
          console.error("❌ Error fetching user data for JWT:", error)
        }
      }

      // Handle regular user data
      if (user) {
        token.uid = user.id
        token.role = user.role
        token.email = user.email || undefined
        token.name = user.name || undefined
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
          session.user.email = token.email as string
          session.user.name = token.name as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/dang-nhap',
    error: '/dang-nhap', // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
} 