import { pgTable, serial, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username'),
	fullName: text('full_name'),
	avatarUrl: text('avatar_url')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const modules = pgTable('modules', {
	moduleNo: serial('module_no').primaryKey(),
	moduleName: text('module_name').notNull()
});

export const questions = pgTable('questions', {
	questionId: serial('question_id').primaryKey(),
	moduleNo: integer('module_no').references(() => modules.moduleNo),
	questionText: text('question_text').notNull(),
	options: jsonb('options').notNull(),
	correctAnswer: text('correct_answer').notNull()
});

export const tests = pgTable('tests', {
	testId: serial('test_id').primaryKey(),
	userId: text('user_id').references(() => user.id),
	testDate: timestamp('test_date').defaultNow().notNull(),
	moduleNo: integer('module_no').notNull(),
	moduleName: text('module_name').notNull(),
	totalQuestions: integer('total_questions').notNull(),
	questionsCorrect: integer('questions_correct').notNull(),
	questionsIncorrect: integer('questions_incorrect').notNull(),
	marks: integer('marks').notNull()
});

export const testQuestions = pgTable('test_questions', {
	id: serial('id').primaryKey(),
	testId: integer('test_id').references(() => tests.testId),
	questionText: text('question_text').notNull(),
	options: jsonb('options').notNull(),
	correctAnswer: text('correct_answer').notNull(),
	userAnswer: text('user_answer').notNull()
});

export const activityScores = pgTable('activity_scores', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activityType: text('activity_type').notNull(), // 'assembly-disassembly', 'preliminary', etc.
	score: integer('score').notNull(),
	completedAt: timestamp('completed_at').defaultNow().notNull(),
	metadata: jsonb('metadata') // For storing additional data like time taken, attempts, etc.
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type TestQuestion = typeof testQuestions.$inferSelect;
export type ActivityScore = typeof activityScores.$inferSelect;
