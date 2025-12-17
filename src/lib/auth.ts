import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch github access token
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "github",
          },
          select: {
            access_token: true,
          },
        });
        session.accessToken = account?.access_token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
