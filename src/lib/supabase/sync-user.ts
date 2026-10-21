import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import type { User as PrismaUser } from '@prisma/client';

/**
 * Derives authenticated user identity from the server-side Supabase session
 * and safely upserts the corresponding Prisma User record.
 * 
 * Never trusts client-supplied user IDs.
 * Preserves existing user records and roles; defaults new users to USER.
 */
export async function getAuthenticatedUser(accessToken?: string | null): Promise<{
  supabaseUser: SupabaseUser;
  dbUser: PrismaUser;
} | null> {
  const supabase = await createClient();
  let user: SupabaseUser | null = null;

  if (accessToken) {
    const res = await supabase.auth.getUser(accessToken);
    user = res.data.user;
  } else {
    const res = await supabase.auth.getUser();
    user = res.data.user;
  }

  // Fallback to getSession in case cookies are in the session store
  if (!user?.id) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      user = session.user;
    }
  }

  if (!user?.id) {
    return null;
  }

  const meta = user.user_metadata || {};
  const derivedName: string | null = 
    meta.full_name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(' ') ||
    (meta.name as string | undefined) ||
    null;

  const email = user.email || `user_${user.id}@example.com`;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email }] : [])
      ]
    }
  });

  let dbUser: PrismaUser;
  if (existingUser) {
    dbUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: user.email || existingUser.email,
        ...(derivedName && !existingUser.name ? { name: derivedName } : {}),
      },
    });
  } else {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email,
        name: derivedName,
        role: 'USER',
      },
    });
  }

  return { supabaseUser: user, dbUser };
}
