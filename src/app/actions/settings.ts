'use server'

import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/sync-user';
import { createClient } from '@/lib/supabase/server';

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export async function getUserProfile(): Promise<UserProfileResponse> {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  return {
    id: auth.dbUser.id,
    name: auth.dbUser.name || '',
    email: auth.dbUser.email,
    role: auth.dbUser.role,
    createdAt: auth.dbUser.createdAt.toISOString(),
  };
}

export async function updateUserProfile(formData: { name: string }) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  if (typeof formData?.name !== 'string') {
    throw new Error("Invalid name format.");
  }

  const trimmedName = formData.name.trim();
  if (trimmedName.length > 80) {
    throw new Error("Name cannot exceed 80 characters.");
  }

  // Strictly update only safe, non-privileged fields
  const updatedUser = await prisma.user.update({
    where: { id: auth.dbUser.id },
    data: {
      name: trimmedName.length > 0 ? trimmedName : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    user: {
      name: updatedUser.name || '',
      email: updatedUser.email,
      role: updatedUser.role,
    },
  };
}

export async function requestEmailChange(newEmail: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const trimmedEmail = newEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (trimmedEmail === auth.dbUser.email.toLowerCase()) {
    throw new Error("New email must be different from current email.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: trimmedEmail });

  if (error) {
    throw new Error(error.message || "Failed to initiate email change.");
  }

  return {
    success: true,
    message: `Verification link sent to ${trimmedEmail}. Both current and new addresses may require confirmation per Supabase security settings.`,
  };
}
