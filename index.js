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

// REQUISITO 3

// Validação do EMAIL
function validateEmail(request, response, next) {
  const { email } = request.body;
  if (!email || email === '') {
    return response.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  // regex para email
  const regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{3}$/;
  if (!regex.test(email)) {
    return response.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  next();
}
// Validação da SENHA
function validatePassword(request, response, next) {
  const SIZE = 6;
  const { password } = request.body;
  if (!password || password === '') {
    return response.status(400).json({
      message: 'O campo "password" é obrigatório',
    });
  }
  if (password.length < SIZE) {
    return response.status(400).json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }
  next();
}

app.post('/login', validateEmail, validatePassword, (request, response) => {
  /*
    Peguei esse coisa do token aqui https://stackoverflow.com/questions/9120915/jquery-create-a-random-16-digit-number-possible
    Ele serve pra gerar uma string de 16 caracteres
  */
  const token = `${Math.random()} `.substring(2, 10) + `${Math.random()} `.substring(2, 10);
  return response.status(200).json({ token });
});

// REQUISITO 4

function validateToken(request, response, next) {
  const SIZE = 16;
  const token = request.headers.authorization;
  if (!token) {
    return response.status(401).json({
      message: 'Token não encontrado',
    });
  }
  if (token.length !== SIZE) {
    return response.status(401).json({
      message: 'Token inválido',
    });
  }
  next();
}

function validateName(request, response, next) {
  const SIZE = 3;
  const { name } = request.body;
  if (!name || name === '') {
    return response.status(400).json({
      message: 'O campo "name" é obrigatório',
    });
  }
  if (name.length < SIZE) {
    return response.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
  next();
}


