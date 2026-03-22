import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
        throw redirect(303, '/dashboard');
    }
};

export const actions: Actions = {
    default: async ({ request, url, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const username = formData.get('username') as string;
        const fullName = formData.get('fullName') as string;

        if (!email || !password || !username || !fullName) {
            return fail(400, {
                error: 'Please fill in all fields',
                email,
                username,
                fullName
            });
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: fullName
                },
                emailRedirectTo: `${url.origin}/auth/callback`
            }
        });
        if (error) {
            return fail(500, {
                error: error.message,
                email,
                username
            });
        }

        return {
            success: true,
            message: 'Please check your email to confirm your account.'
        };
    }
};
