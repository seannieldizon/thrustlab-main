import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { sql, eq } from 'drizzle-orm';
import { modules, questions } from '$lib/server/db/schema';

/**
 * Secure setup endpoint to:
 * 1) Create required tables if they don't exist
 * 2) Seed initial modules and questions if empty
 *
 * Protection:
 * - Requires header: x-setup-token = process.env.SETUP_TOKEN
 * - Returns 403 if missing/invalid
 *
 * Usage (PowerShell example):
 *   $env:SETUP_TOKEN="your-secret"
 *   curl -X POST https://YOUR_DOMAIN/api/setup -H "x-setup-token: your-secret"
 *
 * After first successful run, consider removing the token in production or rotating it.
 */
export const POST: RequestHandler = async ({ request }) => {
	const token = request.headers.get('x-setup-token');
	if (!env.SETUP_TOKEN || token !== env.SETUP_TOKEN) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		// Create tables if not exists (aligning with src/lib/server/db/schema.ts)
		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "user" (
				"id" text PRIMARY KEY,
				"username" text,
				"full_name" text,
				"avatar_url" text
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "session" (
				"id" text PRIMARY KEY,
				"user_id" text NOT NULL REFERENCES "user"("id"),
				"expires_at" timestamptz NOT NULL
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "modules" (
				"module_no" serial PRIMARY KEY,
				"module_name" text NOT NULL
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "questions" (
				"question_id" serial PRIMARY KEY,
				"module_no" integer REFERENCES "modules"("module_no"),
				"question_text" text NOT NULL,
				"options" jsonb NOT NULL,
				"correct_answer" text NOT NULL
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "tests" (
				"test_id" serial PRIMARY KEY,
				"user_id" text REFERENCES "user"("id"),
				"test_date" timestamptz NOT NULL DEFAULT now(),
				"module_no" integer NOT NULL,
				"module_name" text NOT NULL,
				"total_questions" integer NOT NULL,
				"questions_correct" integer NOT NULL,
				"questions_incorrect" integer NOT NULL,
				"marks" integer NOT NULL
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "test_questions" (
				"id" serial PRIMARY KEY,
				"test_id" integer REFERENCES "tests"("test_id"),
				"question_text" text NOT NULL,
				"options" jsonb NOT NULL,
				"correct_answer" text NOT NULL,
				"user_answer" text NOT NULL
			);
		`);

		await db.execute(sql`
			CREATE TABLE IF NOT EXISTS "activity_scores" (
				"id" serial PRIMARY KEY,
				"user_id" text NOT NULL REFERENCES "user"("id"),
				"activity_type" text NOT NULL,
				"score" integer NOT NULL,
				"completed_at" timestamptz NOT NULL DEFAULT now(),
				"metadata" jsonb
			);
		`);

		// Seed: if no modules exist, insert modules and their questions
		const existingModules = await db.select().from(modules).limit(1);
		if (existingModules.length === 0) {
			// Minimal seed (based on scripts/seed-questions.ts)
			const moduleSeed = [
				{
					id: 1,
					title: 'History of Gas Turbine Engines',
					questions: [
						{
							text: 'Which of the following best describes the principle of jet propulsion?',
							options: [
								'The conversion of fuel into mechanical energy by a reciprocating motion',
								'The force is generated in the same direction as the exhaust gases',
								'The force is produced opposite to the discharge of fluid under pressure',
								'The suction of air to create a vacuum thrust'
							],
							correctAnswerIndex: 2
						},
						{
							text: "Jet propulsion operates according to which of Newton's Laws of Motion?",
							options: ['First Law', 'Second Law', 'Third Law', 'Fourth Law'],
							correctAnswerIndex: 2
						}
					]
				},
				{
					id: 2,
					title: 'Types of Gas Turbine Engines',
					questions: [
						{
							text: 'Which of the following best describes a turbojet engine?',
							options: [
								'Converts almost all energy into shaft horsepower',
								'Drives a propeller through reduction gears',
								'Produces thrust by accelerating exhaust gases through a nozzle',
								'Uses a free power turbine to drive a shaft'
							],
							correctAnswerIndex: 2
						},
						{
							text: 'What is a "spool" in a turbojet engine?',
							options: [
								'A device that measures engine performance',
								'A turbine and compressor mounted on the same shaft',
								'The propeller gearbox unit',
								'The exhaust nozzle assembly'
							],
							correctAnswerIndex: 1
						}
					]
				},
				{
					id: 3,
					title: 'Sections of a Gas Turbine Engine',
					questions: [
						{
							text: 'Which components belong to the cold section of a gas turbine engine?',
							options: [
								'Turbine and Exhaust',
								'Air Inlet and Compressor',
								'Combustion and Turbine',
								'Compressor and Exhaust'
							],
							correctAnswerIndex: 1
						},
						{
							text: 'The main function of the compressor section is to:',
							options: [
								'Convert fuel into energy',
								'Supply compressed air for combustion',
								'Cool the turbine blades',
								'Direct exhaust gases rearward'
							],
							correctAnswerIndex: 1
						}
					]
				}
			];

			for (const mod of moduleSeed) {
				const [inserted] = await db
					.insert(modules)
					.values({ moduleNo: mod.id, moduleName: mod.title })
					.onConflictDoUpdate({
						target: modules.moduleNo,
						set: { moduleName: mod.title }
					})
					.returning();

				for (const q of mod.questions) {
					await db.insert(questions).values({
						moduleNo: inserted.moduleNo,
						questionText: q.text,
						options: q.options as unknown as any,
						correctAnswer: q.options[q.correctAnswerIndex]
					});
				}
			}
		}

		return json({ ok: true });
	} catch (error) {
		console.error('Setup error:', error);
		return json({ error: 'Setup failed' }, { status: 500 });
	}
};

