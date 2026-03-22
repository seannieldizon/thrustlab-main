import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { activityScores, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, locals: { safeGetSession } }) => {
    const { session, user: supabaseUser } = await safeGetSession();

    if (!session || !supabaseUser) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { activityType, score, metadata } = data;

    if (!activityType || score === undefined) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Check if user exists in our local db
        const existingUser = await db.select().from(user).where(eq(user.id, supabaseUser.id)).limit(1);

        if (existingUser.length === 0) {
            // Insert user
            await db.insert(user).values({
                id: supabaseUser.id,
                username: supabaseUser.email?.split('@')[0] || 'User',
                fullName: supabaseUser.user_metadata?.full_name || null
            });
        }

        // Insert activity score
        const [newScore] = await db
            .insert(activityScores)
            .values({
                userId: supabaseUser.id,
                activityType,
                score,
                metadata: metadata || null
            })
            .returning({ id: activityScores.id, score: activityScores.score, completedAt: activityScores.completedAt });

        return json({ success: true, data: newScore });
    } catch (error) {
        console.error('Error saving activity score:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
