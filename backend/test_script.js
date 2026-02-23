const http = require('http');

async function test() {
    const regData = JSON.stringify({ username: 'testu123', email: 'test1234@test.com', password: 'password123' });

    const makeReq = (path, data, token = null) => new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5001,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        }, res => {
            let b = '';
            res.on('data', d => b += d);
            res.on('end', () => resolve(JSON.parse(b)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });

    try {
        let token;
        let res = await makeReq('/api/auth/register', regData);
        if (!res.token) {
            res = await makeReq('/api/auth/login', regData);
        }
        if (!res.token) return console.log('Auth failed', res);
        token = res.token;
        console.log('Got token');

        const teamRes = await makeReq('/api/auth/team/create', JSON.stringify({ teamName: 'Test Team' }), token);
        token = teamRes.token || token;
        console.log('Created team');

        const projRes = await makeReq('/api/projects', JSON.stringify({ name: 'Test Project', description: 'Testing' }), token);
        console.log('Project Res:', projRes);

    } catch (e) {
        console.error(e);
    }
}
test();
