'use server';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { serviceConfig } from '@/server/config';
export async function login() {
  if (!serviceConfig().authReady) redirect('/conversations?error=configuration');
  try { await signIn('github', { redirectTo: '/conversations' }); }
  catch (error) { if (error instanceof AuthError) redirect('/conversations?error=signin'); throw error; }
}
export async function logout() { await signOut({ redirectTo: '/conversations' }); }
