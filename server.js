const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('.'));

app.listen(port, () => {
  console.log(`DuoLive 运行在 http://localhost:${port}`);
});
