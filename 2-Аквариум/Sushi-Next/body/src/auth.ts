import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    ...(hasGitHub
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
          }),
        ]
      : []),

    // Dev-only escape hatch so the project boots even without OAuth secrets.
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            name: "Dev",
            credentials: {
              username: { label: "Username", type: "text" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const u = credentials?.username;
              const p = credentials?.password;
              if (!u || !p) return null;
              if (p !== "sushi") return null;
              return { id: "dev", name: String(u) };
            },
          }),
        ]
      : []),
  ],
});
