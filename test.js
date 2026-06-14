const http = require('http');

const data = JSON.stringify({
  promptText: "what is photosynthesis?",
  modelUsed: "claude-3-5-sonnet"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/optimize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('RESPONSE:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
