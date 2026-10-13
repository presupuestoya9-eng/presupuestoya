/**
 * Simple Node.js server for local development of Presupuestoya
 *
 * Usage:
 *   npm install express cors dotenv
 *   node server.js
 *
 * Server will run on http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes

/**
 * GET / - Serve the main form
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * POST /api/leads - Webhook proxy endpoint
 * Receives lead data and forwards to external webhook
 */
app.post('/api/leads', async (req, res) => {
    try {
        const leadData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'phone', 'email', 'postalCode', 'closureType'];
        const missingFields = requiredFields.filter(field => !leadData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        // Log the lead locally
        console.log(`\n📌 New Lead Received:`);
        console.log(`   Name: ${leadData.name}`);
        console.log(`   Email: ${leadData.email}`);
        console.log(`   Phone: ${leadData.phone}`);
        console.log(`   Postal Code: ${leadData.postalCode}`);
        console.log(`   Closure Type: ${leadData.closureType}`);
        console.log(`   Region: ${leadData.region || 'Unknown'}`);
        console.log(`   Timestamp: ${leadData.timestamp}`);

        // If external webhook is configured, forward the data
        if (WEBHOOK_URL) {
            try {
                const webhookResponse = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData),
                });

                if (!webhookResponse.ok) {
                    console.error(`❌ Webhook error: ${webhookResponse.status}`);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send lead to webhook',
                    });
                }

                console.log(`✅ Lead forwarded to webhook successfully`);
            } catch (error) {
                console.error(`❌ Webhook connection error:`, error.message);
                return res.status(500).json({
                    success: false,
                    message: 'Webhook unavailable',
                });
            }
        } else {
            console.log(`⚠️  No external webhook configured. Lead saved locally only.`);
        }

        res.json({
            success: true,
            message: 'Lead received successfully',
            id: `lead_${Date.now()}`,
        });

    } catch (error) {
        console.error('❌ Error processing lead:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        webhook_configured: !!WEBHOOK_URL,
    });
});

/**
 * GET /api/config - Check configuration (for debugging)
 */
app.get('/api/config', (req, res) => {
    res.json({
        port: PORT,
        webhook_url: WEBHOOK_URL ? '✓ Configured' : '✗ Not configured',
        node_env: process.env.NODE_ENV || 'development',
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Presupuestoya Server running at http://localhost:${PORT}`);
    console.log(`📝 Open http://localhost:${PORT} in your browser\n`);

    if (!WEBHOOK_URL) {
        console.log('⚠️  No external webhook configured.');
        console.log('   Set WEBHOOK_URL environment variable to forward leads.\n');
    } else {
        console.log(`✅ Webhook configured: ${WEBHOOK_URL}\n`);
    }

    console.log('Press Ctrl+C to stop the server.\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Server shutting down...');
    process.exit(0);
});
