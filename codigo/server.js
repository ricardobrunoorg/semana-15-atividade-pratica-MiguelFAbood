const path = require('path');
const jsonServer = require('json-server');
const express = require('express');

const app = express();
const router = jsonServer.router(path.join(__dirname, 'db', 'db.json'));

app.use(jsonServer.defaults({ noCors: true }));
app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Custom JSON Server is running on http://localhost:${PORT}`);
});
