const https = require('https');

https.get('https://script.google.com/macros/s/AKfycbxuUnhUnr1zfeIzfsYg_KR2eem7Rxy7-Y1lTcJz6SR8bQqIq7H6YYFR62TjLkzGnVS1/exec?action=getEvents', (res) => {
  let data = '';
  
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // Handle redirect
    https.get(res.headers.location, (res2) => {
      let data2 = '';
      res2.on('data', (c) => data2 += c);
      res2.on('end', () => console.log(data2));
    });
    return;
  }

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
