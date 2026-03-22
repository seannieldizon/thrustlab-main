import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    // Redirect removed to allow access to homepage for logged-in users
    // const { session } = await safeGetSession();

    // if (session) {
    //     throw redirect(303, '/dashboard');
    // }

    return {};
};
