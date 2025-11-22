// ============================================
// EWS WEEKLY REPORTS - VERCEL SERVERLESS API
// Mit Neon Postgres Integration
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const { eq, and, desc, asc } = require('drizzle-orm');

// Database
const { getDb, checkHealth } = require('./db/connection');
const schema = require('./db/schema');

// Initialize Express App
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
    contentSecurityPolicy: false // Für externe CDN-Ressourcen
}));
app.use(cors());
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
    const dbHealth = await checkHealth();

    res.json({
        status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        platform: 'Vercel',
        database: dbHealth
    });
});

// ============================================
// REPORTS API
// ============================================

// Get all reports
app.get('/api/reports', async (req, res) => {
    try {
        const db = getDb();
        const { department, week, status, limit = 100 } = req.query;

        // Build query conditions
        const conditions = [];
        if (department) conditions.push(eq(schema.reports.department, department));
        if (week) conditions.push(eq(schema.reports.week, week));
        if (status) conditions.push(eq(schema.reports.status, status));

        // Execute query
        let query = db.select().from(schema.reports);

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        query = query.orderBy(desc(schema.reports.createdAt)).limit(parseInt(limit));

        const reports = await query;

        res.json({
            success: true,
            data: reports,
            count: reports.length
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports',
            details: error.message
        });
    }
});

// Get single report
app.get('/api/reports/:id', async (req, res) => {
    try {
        const db = getDb();

        // Get report
        const reports = await db
            .select()
            .from(schema.reports)
            .where(eq(schema.reports.id, req.params.id))
            .limit(1);

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Get comments for this report
        const comments = await db
            .select()
            .from(schema.comments)
            .where(eq(schema.comments.reportId, req.params.id));

        res.json({
            success: true,
            data: { ...reports[0], comments }
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch report',
            details: error.message
        });
    }
});

// Create new report
app.post('/api/reports', async (req, res) => {
    try {
        const db = getDb();

        // Validation
        if (!req.body.week || !req.body.department) {
            return res.status(400).json({
                success: false,
                error: 'Week and department are required'
            });
        }

        const report = {
            id: generateId(),
            week: req.body.week,
            department: req.body.department,
            status: req.body.status || 'green',
            kpis: req.body.kpis || {},
            achievements: req.body.achievements,
            challenges: req.body.challenges,
            nextWeekPlans: req.body.nextWeekPlans,
            notes: req.body.notes,
            createdBy: req.body.createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert into database
        await db.insert(schema.reports).values(report);

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create report',
            details: error.message
        });
    }
});

// Update report
app.put('/api/reports/:id', async (req, res) => {
    try {
        const db = getDb();

        // Check if report exists
        const existing = await db
            .select()
            .from(schema.reports)
            .where(eq(schema.reports.id, req.params.id))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Prepare update data
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        // Remove id and timestamps from update data
        delete updateData.id;
        delete updateData.createdAt;

        // Update
        await db
            .update(schema.reports)
            .set(updateData)
            .where(eq(schema.reports.id, req.params.id));

        // Fetch updated report
        const updated = await db
            .select()
            .from(schema.reports)
            .where(eq(schema.reports.id, req.params.id))
            .limit(1);

        res.json({
            success: true,
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update report',
            details: error.message
        });
    }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
    try {
        const db = getDb();

        // Check if exists
        const existing = await db
            .select()
            .from(schema.reports)
            .where(eq(schema.reports.id, req.params.id))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Delete
        await db
            .delete(schema.reports)
            .where(eq(schema.reports.id, req.params.id));

        res.json({
            success: true,
            data: existing[0]
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete report',
            details: error.message
        });
    }
});

// ============================================
// TASKS API
// ============================================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const db = getDb();
        const { status, assignee, priority } = req.query;

        const conditions = [];
        if (status) conditions.push(eq(schema.tasks.status, status));
        if (assignee) conditions.push(eq(schema.tasks.assignee, assignee));
        if (priority) conditions.push(eq(schema.tasks.priority, priority));

        let query = db.select().from(schema.tasks);

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        const tasks = await query.orderBy(desc(schema.tasks.createdAt));

        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
    try {
        const db = getDb();

        if (!req.body.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const task = {
            id: generateId(),
            title: req.body.title,
            description: req.body.description,
            status: req.body.status || 'todo',
            priority: req.body.priority || 'medium',
            assignee: req.body.assignee,
            department: req.body.department,
            dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
            reportId: req.body.reportId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.insert(schema.tasks).values(task);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            details: error.message
        });
    }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const db = getDb();

        const existing = await db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.id, req.params.id))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        delete updateData.id;
        delete updateData.createdAt;

        // If status changes to 'done', set completedAt
        if (updateData.status === 'done' && existing[0].status !== 'done') {
            updateData.completedAt = new Date();
        }

        await db
            .update(schema.tasks)
            .set(updateData)
            .where(eq(schema.tasks.id, req.params.id));

        const updated = await db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.id, req.params.id))
            .limit(1);

        res.json({
            success: true,
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            details: error.message
        });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const db = getDb();

        const existing = await db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.id, req.params.id))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        await db
            .delete(schema.tasks)
            .where(eq(schema.tasks.id, req.params.id));

        res.json({
            success: true,
            data: existing[0]
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            details: error.message
        });
    }
});

// ============================================
// ANALYTICS API
// ============================================

app.get('/api/analytics/kpi', async (req, res) => {
    try {
        const db = getDb();
        const { department } = req.query;

        let query = db.select().from(schema.reports);

        if (department && department !== 'all') {
            query = query.where(eq(schema.reports.department, department));
        }

        const reports = await query;

        // Aggregate KPIs
        const kpiData = reports.reduce((acc, report) => {
            if (report.kpis) {
                Object.entries(report.kpis).forEach(([key, value]) => {
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(value);
                });
            }
            return acc;
        }, {});

        const averages = {};
        Object.entries(kpiData).forEach(([key, values]) => {
            averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
        });

        res.json({
            success: true,
            data: {
                kpiData,
                averages,
                reportCount: reports.length
            }
        });
    } catch (error) {
        console.error('Error fetching KPI analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics',
            details: error.message
        });
    }
});

app.get('/api/analytics/departments', async (req, res) => {
    try {
        const db = getDb();
        const departments = ['Vertrieb', 'Auftragsabwicklung', 'Lager', 'Kundenservice'];

        const performance = await Promise.all(
            departments.map(async (dept) => {
                const deptReports = await db
                    .select()
                    .from(schema.reports)
                    .where(eq(schema.reports.department, dept));

                const statusCounts = {
                    green: deptReports.filter(r => r.status === 'green').length,
                    yellow: deptReports.filter(r => r.status === 'yellow').length,
                    red: deptReports.filter(r => r.status === 'red').length
                };

                return {
                    department: dept,
                    reportCount: deptReports.length,
                    statusCounts,
                    score: (statusCounts.green * 100 + statusCounts.yellow * 50) / Math.max(deptReports.length, 1)
                };
            })
        );

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        console.error('Error fetching department analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch department analytics',
            details: error.message
        });
    }
});

app.get('/api/analytics/tasks', async (req, res) => {
    try {
        const db = getDb();
        const allTasks = await db.select().from(schema.tasks);

        const stats = {
            total: allTasks.length,
            todo: allTasks.filter(t => t.status === 'todo').length,
            inProgress: allTasks.filter(t => t.status === 'inProgress').length,
            done: allTasks.filter(t => t.status === 'done').length,
            overdue: allTasks.filter(t =>
                t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
            ).length,
            byPriority: {
                high: allTasks.filter(t => t.priority === 'high').length,
                medium: allTasks.filter(t => t.priority === 'medium').length,
                low: allTasks.filter(t => t.priority === 'low').length
            }
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching task analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task analytics',
            details: error.message
        });
    }
});

// ============================================
// COMMENTS API
// ============================================

app.get('/api/reports/:reportId/comments', async (req, res) => {
    try {
        const db = getDb();
        const comments = await db
            .select()
            .from(schema.comments)
            .where(eq(schema.comments.reportId, req.params.reportId))
            .orderBy(asc(schema.comments.createdAt));

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments',
            details: error.message
        });
    }
});

app.post('/api/reports/:reportId/comments', async (req, res) => {
    try {
        const db = getDb();

        if (!req.body.text) {
            return res.status(400).json({
                success: false,
                error: 'Comment text is required'
            });
        }

        const comment = {
            id: generateId(),
            reportId: req.params.reportId,
            text: req.body.text,
            author: req.body.author,
            authorEmail: req.body.authorEmail,
            createdAt: new Date()
        };

        await db.insert(schema.comments).values(comment);

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add comment',
            details: error.message
        });
    }
});

// ============================================
// TEMPLATES API
// ============================================

app.get('/api/templates', async (req, res) => {
    try {
        const db = getDb();
        const templates = await db.select().from(schema.templates);

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates',
            details: error.message
        });
    }
});

app.post('/api/templates', async (req, res) => {
    try {
        const db = getDb();

        const template = {
            id: generateId(),
            name: req.body.name,
            description: req.body.description,
            department: req.body.department,
            content: req.body.content,
            isDefault: req.body.isDefault || false,
            createdBy: req.body.createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.insert(schema.templates).values(template);

        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create template',
            details: error.message
        });
    }
});

// ============================================
// ARCHIVE API
// ============================================

app.post('/api/archive/auto', async (req, res) => {
    try {
        const db = getDb();
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

        // Find old reports
        const oldReports = await db
            .select()
            .from(schema.reports)
            .where(eq(schema.reports.createdAt, twelveWeeksAgo));

        // Archive them
        for (const report of oldReports) {
            await db.insert(schema.archive).values({
                id: generateId(),
                originalId: report.id,
                week: report.week,
                department: report.department,
                data: report,
                archivedAt: new Date(),
                archivedBy: req.body.archivedBy || 'system'
            });

            // Delete from reports
            await db.delete(schema.reports).where(eq(schema.reports.id, report.id));
        }

        res.json({
            success: true,
            archived: oldReports.length
        });
    } catch (error) {
        console.error('Error auto-archiving:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to auto-archive',
            details: error.message
        });
    }
});

app.get('/api/archive', async (req, res) => {
    try {
        const db = getDb();
        const archived = await db
            .select()
            .from(schema.archive)
            .orderBy(desc(schema.archive.archivedAt));

        res.json({
            success: true,
            data: archived
        });
    } catch (error) {
        console.error('Error fetching archive:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch archive',
            details: error.message
        });
    }
});

// ============================================
// EXPORT API
// ============================================

app.get('/api/export/json', async (req, res) => {
    try {
        const db = getDb();

        const [reports, tasks, comments, templates, archive] = await Promise.all([
            db.select().from(schema.reports),
            db.select().from(schema.tasks),
            db.select().from(schema.comments),
            db.select().from(schema.templates),
            db.select().from(schema.archive)
        ]);

        res.json({
            success: true,
            data: {
                reports,
                tasks,
                comments,
                templates,
                archive
            },
            exportDate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export data',
            details: error.message
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
    });
});

// Export for Vercel
module.exports = app;
