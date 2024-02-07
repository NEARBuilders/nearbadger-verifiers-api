const express = require('express');
const verifiers = require('./verifiers');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send(
    JSON.stringify({"ping": "pong"})
  );
});

app.post('/verify/:platform', (req, res) => {
  const { platform } = req.params;
  const { accountId, handle, signature } = req.body;


  if (platform in verifiers) {
     return res.status(200).send(JSON.stringify({ accountId, handle, signature }));
  }

  return res.status(400);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
