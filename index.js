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
  const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  return response.status(200).json(talkers);
});

// REQUISITO 2
app.get('/talker/:id', (request, response, next) => {
  const { id } = request.params;
  if (id === 'search') return next();
  console.log(id);
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

function validateAge(request, response, next) {
  const AGE = 18;
  const { age } = request.body;
  if (!age || age === '') {
    return response.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  if (age < AGE) {
    return response.status(400).json({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }
  next();
}

function validateDateAndRate(request, response, next) {
  // regex para validar a data no formato DD/MM/AAAA, peguei aqui https://stackoverflow.com/questions/5465375/javascript-date-regex-dd-mm-yyyy
  const regex = /^(0?[1-9]|[12][0-9]|3[01])[/](0?[1-9]|1[012])[/-]\d{4}$/;
  const { talk } = request.body;
  const { watchedAt, rate } = talk;
  if (!regex.test(watchedAt)) {
    return response.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  if (typeof rate !== 'number' || rate < 1 || rate > 5) {
    return response.status(400).json({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
    });
  }
  next();
}

function validateTalk(request, response, next) {
  const { talk } = request.body;
  if (!talk || talk === '') {
    return response.status(400).json({
      message:
        'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }
  const { watchedAt, rate } = talk;
  if (watchedAt === undefined || rate === undefined) {
    return response.status(400).json({
      message:
        'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }
  next();
}

app.post(
  '/talker',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateDateAndRate,
  (request, response) => {
    const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    const id = talkers.length + 1;
    const { age, name, talk } = request.body;
    const talker = { name, age, id, talk };
    talkers.push(talker);
    fs.writeFileSync(FILE, JSON.stringify(talkers));
    return response.status(201).json({
      id,
      name,
      age,
      talk,
    });
  },
);

// REQUISITO 5

app.put(
  '/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateDateAndRate,
  (request, response) => {
    let { id } = request.params;
    const { age, name, talk } = request.body;
    const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    const talkerIndex = talkers.findIndex((person) => String(person.id) === id);
    talkers[talkerIndex] = { ...talkers[talkerIndex], name, age, talk };
    fs.writeFileSync(FILE, JSON.stringify(talkers));
    id = parseInt(id, 10);
    return response.status(200).json({
      id, name, age, talk,
    });
  },
);

// REQUISITO 6

app.delete('/talker/:id', validateToken, (request, response) => {
  const { id } = request.params;
  const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  const talkerIndex = talkers.findIndex((person) => String(person.id) === id);
  talkers.splice(talkerIndex, 1);
  fs.writeFileSync(FILE, JSON.stringify(talkers));
  return response.status(204).send();
});

// REQUISITO 7

app.get('/talker/search', validateToken, (request, response) => {
  const { name } = request.query;
  const talkers = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  console.log('xablau', name);
  if (!name || name === '') {
    return response.status(200).json(talkers);
  }
  const searchQuery = talkers.filter((talk) => talk.name.includes(name));
  if (!searchQuery) {
    return response.status(200).send([]);
  }
  return response.status(200).json(searchQuery);
});
