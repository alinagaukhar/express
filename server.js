'use strict';

const express = require('./');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Mock in-memory user database
const users = [
  { id: 1, name: 'Tobi', role: 'Maintainer', email: 'tobi@example.com' },
  { id: 2, name: 'Loki', role: 'Contributor', email: 'loki@example.com' },
  { id: 3, name: 'Jane', role: 'Reviewer', email: 'jane@example.com' },
  { id: 4, name: 'Luna', role: 'Developer', email: 'luna@example.com' }
];

// API Endpoints
app.get('/api/status', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'online',
    framework: 'Express',
    version: require('./package.json').version,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: `${Math.floor(process.uptime())} seconds`,
    memory: {
      rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`
    },
    system: {
      loadavg: os.loadavg(),
      cpus: os.cpus().length,
      freeMemMB: Math.round(os.freemem() / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'World';
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    queryReceived: req.query
  });
});

app.get('/api/users', (req, res) => {
  const role = req.query.role;
  if (role) {
    return res.json(users.filter(u => u.role.toLowerCase() === role.toLowerCase()));
  }
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found', id });
  }
  res.json(user);
});

app.post('/api/echo', (req, res) => {
  res.json({
    message: 'Payload received successfully',
    contentType: req.get('content-type') || 'unknown',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    secure: req.secure,
    protocol: req.protocol,
    hostname: req.hostname,
    headers: req.headers
  });
});

app.get('/api/error-demo', (req, res, next) => {
  const error = new Error('Demonstrating Express custom error handling pipeline');
  error.status = 500;
  next(error);
});

// Interactive Web UI Dashboard
app.get('/', (req, res) => {
  const pkg = require('./package.json');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Express.js Playground & Dashboard</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --code-bg: #020617;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: #000;
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 6px 14px;
      font-size: 20px;
      font-weight: 700;
      border-radius: 8px;
      letter-spacing: -0.5px;
    }
    .tagline {
      color: var(--text-muted);
      font-size: 14px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid var(--success);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 16px 20px;
    }
    .metric-label {
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--accent);
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text);
    }
    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .preset-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .preset-btn {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-family: monospace;
      font-weight: 600;
      transition: all 0.15s;
    }
    .preset-btn:hover {
      background: var(--accent);
      color: #000;
    }
    .request-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    select, input[type="text"] {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-family: monospace;
    }
    select {
      font-weight: 600;
      min-width: 100px;
    }
    input[type="text"] {
      flex: 1;
    }
    textarea {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      min-height: 80px;
      margin-bottom: 16px;
      display: none;
      resize: vertical;
    }
    .action-btn {
      background: var(--accent);
      color: #000;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.15s;
    }
    .action-btn:hover {
      background: var(--accent-hover);
    }
    .response-box {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 13px;
      overflow-x: auto;
      max-height: 380px;
      white-space: pre-wrap;
    }
    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .badge-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
    .status-2xx { background: rgba(16, 185, 129, 0.2); color: var(--success); }
    .status-4xx { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
    .status-5xx { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
    .endpoints-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .endpoints-table th, .endpoints-table td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--card-border);
    }
    .endpoints-table th {
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
    }
    .method-get { color: var(--success); font-weight: 600; font-family: monospace; }
    .method-post { color: var(--accent); font-weight: 600; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo-badge">express</div>
        <div>
          <h2>Express.js Server</h2>
          <div class="tagline">Version ${pkg.version} &bull; Fast, unopinionated, minimalist web framework</div>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span> Server Running on :${PORT}
      </div>
    </header>

    <div class="grid">
      <div class="metric-card">
        <div class="metric-label">Node Runtime</div>
        <div class="metric-value">${process.version}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Process Memory (RSS)</div>
        <div class="metric-value">${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Server Port</div>
        <div class="metric-value">${PORT}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Environment</div>
        <div class="metric-value">${process.env.NODE_ENV || 'development'}</div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Interactive API Playground</div>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 12px;">
        Quickly test live Express endpoints directly from this browser interface:
      </p>
      <div class="preset-list">
        <button class="preset-btn" onclick="setPreset('GET', '/api/status', '')">GET /api/status</button>
        <button class="preset-btn" onclick="setPreset('GET', '/api/hello?name=AIStudio', '')">GET /api/hello</button>
        <button class="preset-btn" onclick="setPreset('GET', '/api/users', '')">GET /api/users</button>
        <button class="preset-btn" onclick="setPreset('GET', '/api/users/2', '')">GET /api/users/2</button>
        <button class="preset-btn" onclick="setPreset('POST', '/api/echo', JSON.stringify({ message: 'Hello from client!', test: true, timestamp: Date.now() }, null, 2))">POST /api/echo</button>
        <button class="preset-btn" onclick="setPreset('GET', '/api/headers', '')">GET /api/headers</button>
        <button class="preset-btn" onclick="setPreset('GET', '/api/error-demo', '')">GET /api/error-demo</button>
      </div>

      <div class="request-bar">
        <select id="reqMethod" onchange="toggleBody()">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" id="reqUrl" value="/api/status" placeholder="/api/endpoint" />
        <button class="action-btn" id="sendBtn" onclick="sendRequest()">Send Request</button>
      </div>

      <textarea id="reqBody" placeholder='Enter JSON body (e.g. { "name": "Jane" })'></textarea>

      <div class="response-header">
        <span id="responseStatus">Status: Ready</span>
        <span id="responseTime"></span>
      </div>
      <div class="response-box" id="responseViewer">// Press "Send Request" or click a preset above to execute an API call</div>
    </div>

    <div class="card">
      <div class="section-title">Available Routes & Specifications</div>
      <table class="endpoints-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Route Path</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/</code></td>
            <td>This interactive dashboard and explorer interface</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/status</code></td>
            <td>System diagnostics, Node.js memory, uptime, and framework version</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/hello</code></td>
            <td>Query parameter handling demonstration (supports <code>?name=...</code>)</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/users</code></td>
            <td>Mock user list query (supports filtering with <code>?role=...</code>)</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/users/:id</code></td>
            <td>Route parameters handling (<code>req.params.id</code>) with 404 validation</td>
          </tr>
          <tr>
            <td><span class="method-post">POST</span></td>
            <td><code>/api/echo</code></td>
            <td>JSON body parsing middleware demonstration (<code>express.json()</code>)</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/headers</code></td>
            <td>Request inspector (client IP, HTTP headers, protocol)</td>
          </tr>
          <tr>
            <td><span class="method-get">GET</span></td>
            <td><code>/api/error-demo</code></td>
            <td>Demonstration of Express error propagation middleware (500)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function toggleBody() {
      const method = document.getElementById('reqMethod').value;
      const bodyEl = document.getElementById('reqBody');
      bodyEl.style.display = (method === 'POST' || method === 'PUT') ? 'block' : 'none';
    }

    function setPreset(method, url, body) {
      document.getElementById('reqMethod').value = method;
      document.getElementById('reqUrl').value = url;
      const bodyEl = document.getElementById('reqBody');
      if (body) {
        bodyEl.value = body;
      }
      toggleBody();
      sendRequest();
    }

    async function sendRequest() {
      const method = document.getElementById('reqMethod').value;
      const url = document.getElementById('reqUrl').value;
      const viewer = document.getElementById('responseViewer');
      const statusEl = document.getElementById('responseStatus');
      const timeEl = document.getElementById('responseTime');
      const sendBtn = document.getElementById('sendBtn');

      sendBtn.disabled = true;
      statusEl.textContent = 'Status: Sending...';
      timeEl.textContent = '';
      viewer.textContent = 'Loading...';

      const start = performance.now();
      try {
        const options = { method, headers: {} };
        if (method === 'POST' || method === 'PUT') {
          options.headers['Content-Type'] = 'application/json';
          options.body = document.getElementById('reqBody').value || '{}';
        }

        const res = await fetch(url, options);
        const duration = Math.round(performance.now() - start);
        timeEl.textContent = duration + ' ms';

        let badgeClass = 'status-2xx';
        if (res.status >= 400 && res.status < 500) badgeClass = 'status-4xx';
        if (res.status >= 500) badgeClass = 'status-5xx';

        statusEl.innerHTML = 'Status: <span class="badge-status ' + badgeClass + '">' + res.status + ' ' + res.statusText + '</span>';

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          viewer.textContent = JSON.stringify(json, null, 2);
        } else {
          const text = await res.text();
          viewer.textContent = text;
        }
      } catch (err) {
        statusEl.innerHTML = '<span class="badge-status status-5xx">Network Error</span>';
        viewer.textContent = 'Error: ' + err.message;
      } finally {
        sendBtn.disabled = false;
      }
    }

    // Auto-fetch status on initial load
    window.addEventListener('DOMContentLoaded', () => {
      sendRequest();
    });
  </script>
</body>
</html>`;
  res.send(html);
});

// Custom 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method,
    message: 'The requested resource was not found on this Express server.'
  });
});

// Express Error Handling Middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
    status: status
  });
});

// Start listening on port 3000 and 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`Express application successfully started on http://${HOST}:${PORT}`);
});

module.exports = app;
