import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { activityScores } from '$lib/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const GET = async ({ url, locals: { safeGetSession } }) => {
    const { session, user: supabaseUser } = await safeGetSession();

    if (!session || !supabaseUser) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityType = url.searchParams.get('activityType');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    try {
        let query = db
            .select()
            .from(activityScores)
            .where(eq(activityScores.userId, supabaseUser.id))
            .orderBy(desc(activityScores.completedAt))
            .limit(limit);

        // Filter by activity type if provided
        if (activityType) {
            query = db
                .select()
                .from(activityScores)
                .where(
                    and(
                        eq(activityScores.userId, supabaseUser.id),
                        eq(activityScores.activityType, activityType)
                    )
                )
                .orderBy(desc(activityScores.completedAt))
                .limit(limit);
        }

        const scores = await query;

        // Get high score for the activity
        let highScore = null;
        if (activityType) {
            const highScoreResult = await db
                .select({ maxScore: sql<number>`max(${activityScores.score})` })
                .from(activityScores)
                .where(
                    and(
                        eq(activityScores.userId, supabaseUser.id),
                        eq(activityScores.activityType, activityType)
                    )
                );

            highScore = highScoreResult[0]?.maxScore || 0;
        }

        return json({
            success: true,
            scores,
            highScore,
            totalAttempts: scores.length
        });
    } catch (error) {
        console.error('Error fetching activity scores:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
