const https = require('https');

https.get('https://theta-experience.pages.dev/assets/index-D2s2DrGZ.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Look for the date filtering logic
    const hasFilter = data.includes('.setHours(0,0,0,0)');
    const hasStatusCheck = data.includes("!=='upcoming'");
    console.log('Has setHours:', hasFilter);
    console.log('Has upcoming check:', hasStatusCheck);
  });
});
