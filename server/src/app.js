const express = require('express');
const cors = require('cors');
const pool = require('./db');
const alunosRoutes = require('./routes/alunos');
const notasRoutes = require('./routes/notas');
const chamadasRoutes = require('./routes/chamadas');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_request, response, next) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/alunos', alunosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/chamadas', chamadasRoutes);

app.use((_request, response) => {
  response.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') {
    return response.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }
  response.status(error.status || 500).json({
    error: error.status ? error.message : 'Erro interno do servidor.'
  });
});

module.exports = app;
