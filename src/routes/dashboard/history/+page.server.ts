import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
        throw redirect(303, '/login');
    }

    // Parallelize fetches for Tests and Activities (Simulations)
    const [userTests, userActivities] = await Promise.all([
        db
            .select()
            .from(table.tests)
            .where(eq(table.tests.userId, user.id))
            .orderBy(desc(table.tests.testDate)),
        db
            .select()
            .from(table.activityScores)
            .where(eq(table.activityScores.userId, user.id))
            .orderBy(desc(table.activityScores.completedAt))
    ]);

    // Map Tests
    const mappedTests = userTests.map((t) => ({
        type: 'test',
        date: t.testDate,
        moduleName: t.moduleName,
        score: Math.round((t.questionsCorrect / t.totalQuestions) * 100),
        passed: Math.round((t.questionsCorrect / t.totalQuestions) * 100) >= 70,
        questions: [] as any[], // Explicitly typed to avoid never[] error
        originalId: t.testId
    }));

    // Map Activities
    function formatActivityType(type: string) {
        return type
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const mappedActivities = userActivities.map((a) => ({
        type: 'simulation', // Matches frontend filter value 'simulation'
        date: a.completedAt,
        moduleName: formatActivityType(a.activityType),
        score: a.score,
        passed: a.score >= 70,
        questions: [] as any[], // Explicitly typed
        originalId: a.id
    }));

    // Fetch questions for Tests only (Activities usually don't have Q&A logs in this schema yet)
    // Using a loop for simplicity
    for (const t of mappedTests) {
        const qs = await db.select().from(table.testQuestions).where(eq(table.testQuestions.testId, t.originalId));
        t.questions = qs;
    }

    // Combine and Sort
    const allActivity = [...mappedTests, ...mappedActivities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
        allActivity
    };
};
