import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
        throw redirect(303, '/login');
    }

    // Fetch profile data from our database
    let profile = null;
    try {
        const result = await db
            .select()
            .from(table.user)
            .where(eq(table.user.id, user.id));
        profile = result[0] || null;
    } catch (e) {
        console.error('Error fetching profile:', e);
    }

    return {
        session,
        user,
        profile
    };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals: { safeGetSession } }) => {
        const { session, user } = await safeGetSession();
        if (!session || !user) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const fullName = formData.get('fullName') as string;
        const avatarUrl = formData.get('avatarUrl') as string; // Capture avatar URL

        try {
            // Check if profile exists
            const [existingProfile] = await db
                .select()
                .from(table.user)
                .where(eq(table.user.id, user.id));

            if (existingProfile) {
                await db
                    .update(table.user)
                    .set({ username, fullName, avatarUrl })
                    .where(eq(table.user.id, user.id));
            } else {
                await db.insert(table.user).values({
                    id: user.id,
                    username,
                    fullName,
                    avatarUrl
                });
            }

            return { success: true, message: 'Profile updated successfully' };
        } catch (error) {
            console.error('Error updating profile:', error);
            return fail(500, { error: 'Failed to update profile' });
        }
    },

    changePassword: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match' });
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            return fail(500, { error: error.message });
        }

        return { success: true, message: 'Password updated successfully' };
    },

    deleteAccount: async ({ locals: { supabase, safeGetSession } }) => {
        const { user } = await safeGetSession();
        if (!user) return fail(401, { error: 'Unauthorized' });

        try {
            await db.delete(table.user).where(eq(table.user.id, user.id));
        } catch (e) {
            console.error('Error deleting user profile:', e);
        }

        await supabase.auth.signOut();

        throw redirect(303, '/');
    }
};
