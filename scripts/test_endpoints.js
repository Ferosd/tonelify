const http = require('http');

const endpoints = [
    { path: '/', method: 'GET', expected: [200] },
    { path: '/plans', method: 'GET', expected: [200] },
    { path: '/request-gear', method: 'GET', expected: [200] },
    { path: '/api/equipment', method: 'GET', expected: [200, 401] }, // Might be 200 (empty) or 401 (if protected)
    { path: '/dashboard', method: 'GET', expected: [200, 307, 308] }, // Redirects if not logged in
];

function check(endpoint) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint.path,
            method: endpoint.method,
        };

        const req = http.request(options, (res) => {
            const status = res.statusCode;
            const success = endpoint.expected.includes(status);
            console.log(`[${success ? 'PASS' : 'FAIL'}] ${endpoint.path} -> ${status}`);
            resolve(success);
        });

        req.on('error', (e) => {
            console.log(`[FAIL] ${endpoint.path} -> Error: ${e.message}`);
            resolve(false);
        });

        req.end();
    });
}

async function run() {
    console.log("Testing Endpoints on localhost:3000...");
    let allPass = true;
    for (const ep of endpoints) {
        const pass = await check(ep);
        if (!pass) allPass = false;
    }

    if (allPass) {
        console.log("\nAll critical endpoints are reachable!");
    } else {
        console.log("\nSome endpoints failed.");
        process.exit(1);
    }
}

run();
