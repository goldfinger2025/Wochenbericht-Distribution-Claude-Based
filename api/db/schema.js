// ============================================
// NEON DATABASE SCHEMA
// Drizzle ORM Schema Definition
// ============================================

const { pgTable, text, timestamp, integer, jsonb, boolean, uuid } = require('drizzle-orm/pg-core');

// ============================================
// REPORTS TABLE
// ============================================
const reports = pgTable('reports', {
    id: text('id').primaryKey(),
    week: text('week').notNull(),
    department: text('department').notNull(),
    status: text('status').notNull(), // green, yellow, red

    // KPIs stored as JSONB
    kpis: jsonb('kpis').default({}),

    // Textual content
    achievements: text('achievements'),
    challenges: text('challenges'),
    nextWeekPlans: text('next_week_plans'),
    notes: text('notes'),

    // Metadata
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================
// TASKS TABLE
// ============================================
const tasks = pgTable('tasks', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('todo'), // todo, inProgress, done
    priority: text('priority').default('medium'), // low, medium, high

    // Assignment
    assignee: text('assignee'),
    department: text('department'),

    // Dates
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),

    // Relations
    reportId: text('report_id'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================
// COMMENTS TABLE
// ============================================
const comments = pgTable('comments', {
    id: text('id').primaryKey(),
    reportId: text('report_id').notNull(),
    text: text('text').notNull(),

    // Author
    author: text('author'),
    authorEmail: text('author_email'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============================================
// TEMPLATES TABLE
// ============================================
const templates = pgTable('templates', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    department: text('department'),

    // Template content stored as JSONB
    content: jsonb('content').notNull(),

    // Settings
    isDefault: boolean('is_default').default(false),

    // Metadata
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================
// ARCHIVE TABLE
// ============================================
const archive = pgTable('archive', {
    id: text('id').primaryKey(),
    originalId: text('original_id').notNull(),
    week: text('week').notNull(),
    department: text('department').notNull(),

    // Archived report data as JSONB
    data: jsonb('data').notNull(),

    // Archive metadata
    archivedAt: timestamp('archived_at').defaultNow().notNull(),
    archivedBy: text('archived_by')
});

// ============================================
// USERS TABLE (Optional - for future authentication)
// ============================================
const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    department: text('department'),
    role: text('role').default('user'), // user, admin

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastLogin: timestamp('last_login')
});

// ============================================
// EXPORTS
// ============================================
module.exports = {
    reports,
    tasks,
    comments,
    templates,
    archive,
    users
};
