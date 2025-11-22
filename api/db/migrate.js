// ============================================
// NEON DATABASE MIGRATIONS
// Run this to create all tables
// ============================================

require('dotenv').config();
const { executeRawQuery } = require('./connection');

// ============================================
// MIGRATION SQL
// ============================================

const createTablesSQL = `
-- Drop tables if they exist (careful in production!)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS archive CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id TEXT PRIMARY KEY,
    week TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red')),

    -- KPIs as JSONB
    kpis JSONB DEFAULT '{}',

    -- Content
    achievements TEXT,
    challenges TEXT,
    next_week_plans TEXT,
    notes TEXT,

    -- Metadata
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_reports_week ON reports(week);
CREATE INDEX idx_reports_department ON reports(department);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inProgress', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

    -- Assignment
    assignee TEXT,
    department TEXT,

    -- Dates
    due_date TIMESTAMP,
    completed_at TIMESTAMP,

    -- Relations
    report_id TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_report_id ON tasks(report_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    text TEXT NOT NULL,

    -- Author
    author TEXT,
    author_email TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_comments_report_id ON comments(report_id);

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,

    -- Template content as JSONB
    content JSONB NOT NULL,

    -- Settings
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_templates_department ON templates(department);

-- ============================================
-- ARCHIVE TABLE
-- ============================================
CREATE TABLE archive (
    id TEXT PRIMARY KEY,
    original_id TEXT NOT NULL,
    week TEXT NOT NULL,
    department TEXT NOT NULL,

    -- Archived data as JSONB
    data JSONB NOT NULL,

    -- Archive metadata
    archived_at TIMESTAMP DEFAULT NOW() NOT NULL,
    archived_by TEXT
);

-- Indexes
CREATE INDEX idx_archive_week ON archive(week);
CREATE INDEX idx_archive_department ON archive(department);
CREATE INDEX idx_archive_archived_at ON archive(archived_at DESC);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    department TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reports
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to templates
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

// ============================================
// RUN MIGRATION
// ============================================

async function migrate() {
    console.log('🔄 Starting database migration...');

    try {
        // Execute migration
        await executeRawQuery(createTablesSQL);

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('Created tables:');
        console.log('  - reports');
        console.log('  - tasks');
        console.log('  - comments');
        console.log('  - templates');
        console.log('  - archive');
        console.log('  - users');
        console.log('');
        console.log('✅ All indexes and triggers created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// ============================================
// EXPORTS & CLI
// ============================================

// Run if called directly
if (require.main === module) {
    migrate();
}

module.exports = { migrate, createTablesSQL };
