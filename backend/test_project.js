const http = require('http');

async function test() {
  const loginData = JSON.stringify({username: 'test', password: 'password'});
  let token = '';

  const loginReq = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      token = JSON.parse(body).token;
      
      const projData = JSON.stringify({name: 'Testing Projects', description: 'Desc'});
      const projReq = http.request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Content-Length': projData.length
        }
      }, r2 => {
        let b2 = '';
        r2.on('data', d => b2 += d);
        r2.on('end', () => console.log('Response:', b2));
      });
      projReq.write(projData);
      projReq.end();
    });
  });
  loginReq.write(loginData);
  loginReq.end();
}
test();
