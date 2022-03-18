const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const FILE = 'talker.json';

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// REQUISITO 1
app.get('/talker', (_request, response) => {
  try {
    const talkers = fs.readFileSync(FILE, 'utf-8');
    return response.status(200).json(JSON.parse(talkers));
  } catch (err) {
    return err;
  }
});

// REQUISITO 2
app.get('/talker/:id', (request, response) => {
  const { id } = request.params;
  const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  const talker = talkers.find((person) => String(person.id) === id);
  if (!talker) {
    return response.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  return response.status(200).json(talker);
});
