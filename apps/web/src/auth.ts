import 'server-only';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { serviceConfig } from '@/server/config';

export const { auth, handlers, signIn, signOut } = NextAuth(() => ({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  providers: serviceConfig().authReady ? [GitHub({ authorization: { params: { scope: 'read:user' } } })] : [],
  pages: { signIn: '/conversations', error: '/conversations' },
  callbacks: {
    signIn({ account }) {
      return account?.provider === 'github' && serviceConfig().allowedGitHubIds.includes(account.providerAccountId);
    },
    jwt({ token, account }) {
      if (account?.provider === 'github') token.sub = `github:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
    redirect({ url, baseUrl }) {
      const origin = serviceConfig().origin || baseUrl;
      try { const target = new URL(url, origin); if (target.origin === origin) return target.toString(); } catch {}
      return `${origin}/conversations`;
    },
  },
  logger: {
    error() { /* Authentication failures are handled by the sign-in page; omit raw OAuth errors. */ },
    warn() {},
    debug() {},
  },
}));
