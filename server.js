const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    
    // Default to login.html for root path
    if (pathname === '/') {
        pathname = '/login.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 - Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file <strong>${pathname}</strong> was not found.</p>
                        <a href="/login.html">Go to Login Page</a>
                    </body>
                </html>
            `);
            return;
        }
        
        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(port, () => {
    console.log(`🚀 TradeMind AI Server running at http://localhost:${port}`);
    console.log(`📱 Open http://localhost:${port}/login.html to get started`);
    console.log(`⚡ Press Ctrl+C to stop the server`);
    
    // Auto-open browser (Windows)
    const { exec } = require('child_process');
    exec(`start http://localhost:${port}/login.html`, (err) => {
        if (err) {
            console.log('Could not auto-open browser. Please manually open the URL above.');
        }
    });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down TradeMind AI server...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});