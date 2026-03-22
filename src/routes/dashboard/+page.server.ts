import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tests, testQuestions, user as userTable, activityScores } from '$lib/server/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

function formatActivityType(type: string) {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    if (!session || !user) {
        throw redirect(303, '/login');
    }

    let userProfileResult: Array<(typeof userTable.$inferSelect)> = [];
    let userTests: Array<(typeof tests.$inferSelect)> = [];
    let userActivities: Array<(typeof activityScores.$inferSelect)> = [];

    try {
        // Parallelize initial fetches
        [userProfileResult, userTests, userActivities] = await Promise.all([
            db.select().from(userTable).where(eq(userTable.id, user.id)),
            db.select().from(tests).where(eq(tests.userId, user.id)).orderBy(desc(tests.testDate)),
            db
                .select()
                .from(activityScores)
                .where(eq(activityScores.userId, user.id))
                .orderBy(desc(activityScores.completedAt))
        ]);
    } catch (error) {
        // Keep auth flow usable even when DB schema/RLS is still being configured.
        console.error('Dashboard data load failed, falling back to empty state:', error);
    }

    const dbUser = userProfileResult[0];

    // Combine activities and tests
    const combinedActivity = [
        ...userTests.map((t) => ({
            type: 'test',
            id: t.testId,
            moduleName: t.moduleName,
            date: t.testDate,
            score: t.marks,
            passed: t.marks >= 70,
            questions: [] as any[] // Will populate later
        })),
        ...userActivities.map((a) => ({
            type: 'activity',
            id: a.id,
            moduleName: formatActivityType(a.activityType),
            date: a.completedAt,
            score: a.score,
            passed: a.score >= 70,
            questions: [] as any[]
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fetch questions for the recent tests (last 5)
    const recentActivity = combinedActivity.slice(0, 5);
    const recentTestIds = recentActivity
        .filter((a) => a.type === 'test')
        .map((t) => t.id as number);

    let recentTestQuestions: any[] = [];
    if (recentTestIds.length > 0) {
        try {
            // Optimized query using inArray
            recentTestQuestions = await db
                .select()
                .from(testQuestions)
                .where(inArray(testQuestions.testId, recentTestIds));
        } catch (error) {
            console.error('Dashboard recent questions load failed:', error);
        }
    }

    // Calculate stats
    const totalTests = userTests.length + userActivities.length;
    const totalScore =
        userTests.reduce((acc, t) => acc + t.marks, 0) +
        userActivities.reduce((acc, a) => acc + a.score, 0);
    const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

    // Calculate progress (unique modules completed)
    const uniqueModules = new Set([
        ...userTests.map((t) => t.moduleNo.toString()),
        ...userActivities.map((a) => a.activityType)
    ]);
    const totalModules = 4; // Assuming 4 modules now (3 tests + 1 assembly)
    const progress = Math.round((uniqueModules.size / totalModules) * 100);

    return {
        user: {
            username:
                dbUser?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
            fullName: dbUser?.fullName || user.user_metadata?.full_name || 'Pilot',
            email: user.email,
            avatarUrl: dbUser?.avatarUrl || user.user_metadata?.avatar_url || ''
        },
        stats: {
            progress,
            totalTests,
            averageScore
        },
        recentActivity: recentActivity.map((item) => {
            if (item.type === 'test') {
                return {
                    ...item,
                    questions: recentTestQuestions.filter((q) => q.testId === item.id)
                };
            }
            return item;
        })
    };
};
