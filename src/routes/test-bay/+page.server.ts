import { db } from '$lib/server/db';
import { modules, questions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
    // Ensure user is logged in (optional, but good practice for test bay)
    const { session } = await safeGetSession();

    // Fetch all modules
    const allModules = await db.select().from(modules).orderBy(modules.moduleNo);

    // Fetch all questions
    const allQuestions = await db.select().from(questions);

    // Group questions by module
    const modulesWithQuestions = allModules.map(mod => {
        const modQuestions = allQuestions
            .filter(q => q.moduleNo === mod.moduleNo)
            .map(q => ({
                id: q.questionId,
                text: q.questionText,
                options: q.options as string[],
                // Find the index of the correct answer in the options array
                correctAnswer: (q.options as string[]).indexOf(q.correctAnswer)
            }));

        return {
            id: mod.moduleNo,
            title: mod.moduleName,
            // Add descriptions and icons manually or fetch if added to DB later
            // For now, we'll map them based on ID or keep them hardcoded in frontend if static
            // But the requirement was to store questions in DB.
            // I'll pass the basic info and let frontend enhance it or just pass what I have.
            // The frontend expects description and icon. I'll add them here based on ID for now.
            description: getModuleDescription(mod.moduleNo),
            icon: getModuleIcon(mod.moduleNo),
            questions: modQuestions
        };
    });

    return {
        modules: modulesWithQuestions,
        user: session ? true : false
    };
};

function getModuleDescription(id: number): string {
    switch (id) {
        case 1: return 'Ready for takeoff? Test how well you understand the core principles and history that keep jets soaring through the skies.';
        case 2: return 'Think you know your engines? Explore the different types, layouts, and designs that power aircraft around the world.';
        case 3: return 'Time to get hands-on! Identify the key parts and their functions that make up a powerful jet engine.';
        default: return 'Test your knowledge.';
    }
}

function getModuleIcon(id: number): string {
    switch (id) {
        case 1: return '🚀';
        case 2: return '⚙️';
        case 3: return '🔧';
        default: return '📝';
    }
}
