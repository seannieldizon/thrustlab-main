import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, next);
		} else {
			console.error('Auth Error:', error);
			throw redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
		}
	}

	// return the user to an error page with instructions
	throw redirect(303, '/auth/error?message=No+code+provided');
};
