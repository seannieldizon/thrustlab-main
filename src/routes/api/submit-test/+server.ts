import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tests, testQuestions, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, locals: { safeGetSession } }) => {
    const { session, user: supabaseUser } = await safeGetSession();

    if (!session || !supabaseUser) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { moduleNo, moduleName, totalQuestions, questionsCorrect, questionsIncorrect, marks, questions: questionDetails } = data;

    try {
        // Check if user exists in our local db
        const existingUser = await db.select().from(user).where(eq(user.id, supabaseUser.id)).limit(1);

        if (existingUser.length === 0) {
            // Insert user
            await db.insert(user).values({
                id: supabaseUser.id,
                username: supabaseUser.email?.split('@')[0] || 'User'
            });
        }

        // Insert test result
        const [newTest] = await db.insert(tests).values({
            userId: supabaseUser.id,
            moduleNo,
            moduleName,
            totalQuestions,
            questionsCorrect,
            questionsIncorrect,
            marks
        }).returning({ testId: tests.testId });

        // Insert question details
        if (questionDetails && questionDetails.length > 0) {
            const questionsToInsert = questionDetails.map((q: any) => ({
                testId: newTest.testId,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: q.userAnswer
            }));

            await db.insert(testQuestions).values(questionsToInsert);
        }

        return json({ success: true, testId: newTest.testId });
    } catch (error) {
        console.error('Error submitting test:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
