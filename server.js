// ============================================
// EWS WEEKLY REPORTS - BACKEND API SERVER
// Express.js Server mit vollständiger API
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const winston = require('winston');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// LOGGING SETUP
// ============================================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(compression()); // Gzip compression
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));

// ============================================
// IN-MEMORY DATABASE (Production: Use PostgreSQL/MongoDB)
// ============================================
let database = {
    reports: [],
    tasks: [],
    users: [],
    templates: [],
    archive: [],
    comments: []
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Get current week number
function getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '3.0.0'
    });
});

// ============================================
// REPORTS API
// ============================================

// Get all reports
app.get('/api/reports', (req, res) => {
    try {
        const { department, week, status, limit = 100 } = req.query;
        
        let filtered = database.reports;
        
        if (department) {
            filtered = filtered.filter(r => r.department === department);
        }
        if (week) {
            filtered = filtered.filter(r => r.week === week);
        }
        if (status) {
            filtered = filtered.filter(r => r.status === status);
        }
        
        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Apply limit
        filtered = filtered.slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: filtered,
            count: filtered.length,
            total: database.reports.length
        });
    } catch (error) {
        logger.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports'
        });
    }
});

// Get single report
app.get('/api/reports/:id', (req, res) => {
    try {
        const report = database.reports.find(r => r.id === req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }
        
        // Include comments
        const comments = database.comments.filter(c => c.reportId === req.params.id);
        
        res.json({
            success: true,
            data: { ...report, comments }
        });
    } catch (error) {
        logger.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch report'
        });
    }
});

// Create new report
app.post('/api/reports', (req, res) => {
    try {
        const report = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validation
        if (!report.week || !report.department) {
            return res.status(400).json({
                success: false,
                error: 'Week and department are required'
            });
        }
        
        database.reports.push(report);
        
        logger.info(`Report created: ${report.id}`);
        
        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create report'
        });
    }
});

// Update report
app.put('/api/reports/:id', (req, res) => {
    try {
        const index = database.reports.findIndex(r => r.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }
        
        database.reports[index] = {
            ...database.reports[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        logger.info(`Report updated: ${req.params.id}`);
        
        res.json({
            success: true,
            data: database.reports[index]
        });
    } catch (error) {
        logger.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update report'
        });
    }
});

// Delete report
app.delete('/api/reports/:id', (req, res) => {
    try {
        const index = database.reports.findIndex(r => r.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }
        
        const deleted = database.reports.splice(index, 1)[0];
        
        logger.info(`Report deleted: ${req.params.id}`);
        
        res.json({
            success: true,
            data: deleted
        });
    } catch (error) {
        logger.error('Error deleting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete report'
        });
    }
});

// ============================================
// TASKS API
// ============================================

// Get all tasks
app.get('/api/tasks', (req, res) => {
    try {
        const { status, assignee, priority } = req.query;
        
        let filtered = database.tasks;
        
        if (status) {
            filtered = filtered.filter(t => t.status === status);
        }
        if (assignee) {
            filtered = filtered.filter(t => t.assignee === assignee);
        }
        if (priority) {
            filtered = filtered.filter(t => t.priority === priority);
        }
        
        res.json({
            success: true,
            data: filtered,
            count: filtered.length
        });
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks'
        });
    }
});

// Create new task
app.post('/api/tasks', (req, res) => {
    try {
        const task = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (!task.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }
        
        database.tasks.push(task);
        
        logger.info(`Task created: ${task.id}`);
        
        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task'
        });
    }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
    try {
        const index = database.tasks.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        database.tasks[index] = {
            ...database.tasks[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        logger.info(`Task updated: ${req.params.id}`);
        
        res.json({
            success: true,
            data: database.tasks[index]
        });
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task'
        });
    }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const index = database.tasks.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        const deleted = database.tasks.splice(index, 1)[0];
        
        logger.info(`Task deleted: ${req.params.id}`);
        
        res.json({
            success: true,
            data: deleted
        });
    } catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task'
        });
    }
});

// ============================================
// ANALYTICS API
// ============================================

// Get KPI analytics
app.get('/api/analytics/kpi', (req, res) => {
    try {
        const { timeRange = 12, department } = req.query;
        
        let reports = database.reports;
        
        if (department && department !== 'all') {
            reports = reports.filter(r => r.department === department);
        }
        
        // Calculate aggregated KPIs
        const kpiData = reports.reduce((acc, report) => {
            Object.entries(report.kpis || {}).forEach(([key, value]) => {
                if (!acc[key]) acc[key] = [];
                acc[key].push(value);
            });
            return acc;
        }, {});
        
        // Calculate averages
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
        logger.error('Error fetching KPI analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});

// Get department performance
app.get('/api/analytics/departments', (req, res) => {
    try {
        const departments = ['Vertrieb', 'Auftragsabwicklung', 'Lager', 'Kundenservice'];
        
        const performance = departments.map(dept => {
            const deptReports = database.reports.filter(r => r.department === dept);
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
        });
        
        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        logger.error('Error fetching department analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch department analytics'
        });
    }
});

// Get task analytics
app.get('/api/analytics/tasks', (req, res) => {
    try {
        const stats = {
            total: database.tasks.length,
            todo: database.tasks.filter(t => t.status === 'todo').length,
            inProgress: database.tasks.filter(t => t.status === 'inProgress').length,
            done: database.tasks.filter(t => t.status === 'done').length,
            overdue: database.tasks.filter(t => 
                t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
            ).length,
            byPriority: {
                high: database.tasks.filter(t => t.priority === 'high').length,
                medium: database.tasks.filter(t => t.priority === 'medium').length,
                low: database.tasks.filter(t => t.priority === 'low').length
            }
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching task analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task analytics'
        });
    }
});

// ============================================
// COMMENTS API
// ============================================

// Get comments for a report
app.get('/api/reports/:reportId/comments', (req, res) => {
    try {
        const comments = database.comments.filter(c => c.reportId === req.params.reportId);
        
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        logger.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments'
        });
    }
});

// Add comment to report
app.post('/api/reports/:reportId/comments', (req, res) => {
    try {
        const comment = {
            id: generateId(),
            reportId: req.params.reportId,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        if (!comment.text) {
            return res.status(400).json({
                success: false,
                error: 'Comment text is required'
            });
        }
        
        database.comments.push(comment);
        
        logger.info(`Comment added to report ${req.params.reportId}`);
        
        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        logger.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add comment'
        });
    }
});

// ============================================
// TEMPLATES API
// ============================================

// Get all templates
app.get('/api/templates', (req, res) => {
    try {
        res.json({
            success: true,
            data: database.templates
        });
    } catch (error) {
        logger.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
});

// Create template
app.post('/api/templates', (req, res) => {
    try {
        const template = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        database.templates.push(template);
        
        logger.info(`Template created: ${template.id}`);
        
        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        logger.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create template'
        });
    }
});

// ============================================
// ARCHIVE API
// ============================================

// Archive old reports (older than 12 weeks)
app.post('/api/archive/auto', (req, res) => {
    try {
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
        
        const toArchive = database.reports.filter(r => 
            new Date(r.createdAt) < twelveWeeksAgo
        );
        
        toArchive.forEach(report => {
            database.archive.push({
                ...report,
                archivedAt: new Date().toISOString()
            });
        });
        
        database.reports = database.reports.filter(r => 
            new Date(r.createdAt) >= twelveWeeksAgo
        );
        
        logger.info(`Auto-archived ${toArchive.length} reports`);
        
        res.json({
            success: true,
            archived: toArchive.length
        });
    } catch (error) {
        logger.error('Error auto-archiving:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to auto-archive'
        });
    }
});

// Get archived reports
app.get('/api/archive', (req, res) => {
    try {
        res.json({
            success: true,
            data: database.archive
        });
    } catch (error) {
        logger.error('Error fetching archive:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch archive'
        });
    }
});

// ============================================
// EXPORT API
// ============================================

// Export all data as JSON
app.get('/api/export/json', (req, res) => {
    try {
        res.json({
            success: true,
            data: database,
            exportDate: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error exporting data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export data'
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    logger.info(`🚀 EWS Weekly Reports API Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

module.exports = app; // For testing
