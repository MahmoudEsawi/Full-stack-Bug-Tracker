const http = require('http');

async function test() {
  const regData = JSON.stringify({username: 'admin88', email: 'adm@test.com', password: 'pass'});
  const regUser = JSON.stringify({username: 'member88', email: 'mem@test.com', password: 'pass'});

  const makeReq = (path, method, data, token = null) => new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && {'Content-Length': Buffer.byteLength(data)}),
        ...(token && {'Authorization': `Bearer ${token}`})
      }
    }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve(JSON.parse(b || "{}")));
    });
    req.on('error', reject);
    if(data) req.write(data);
    req.end();
  });

  try {
    let adminToken = (await makeReq('/api/auth/register', 'POST', regData)).token;
    if (!adminToken) adminToken = (await makeReq('/api/auth/login', 'POST', regData)).token;
    console.log('Admin Token:', !!adminToken);

    let memToken = (await makeReq('/api/auth/register', 'POST', regUser)).token;
    if (!memToken) memToken = (await makeReq('/api/auth/login', 'POST', regUser)).token;
    console.log('Member Token:', !!memToken);

    const teamRes = await makeReq('/api/auth/team/create', 'POST', JSON.stringify({teamName: 'Kick Team'}), adminToken);
    adminToken = teamRes.token || adminToken;
    console.log('Created Team, code:', teamRes.team?.code || 'Assumed created');

    const authRes = await makeReq('/api/auth', 'GET', null, adminToken);
    const code = authRes.team?.code;
    const adminId = authRes.user._id;

    if (code) {
        await makeReq('/api/auth/team/join', 'POST', JSON.stringify({code}), memToken);
        console.log('Member Joined Team');
        
        const memData = await makeReq('/api/auth', 'GET', null, memToken);
        const memId = memData.user._id;

        const kickRes = await makeReq('/api/auth/team/kick/' + memId, 'DELETE', null, adminToken);
        console.log('Kick Response:', kickRes);
    }

  } catch(e) {
    console.error(e);
  }
}
test();
