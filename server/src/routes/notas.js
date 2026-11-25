const express = require('express');
const pool = require('../db');
const { asyncHandler, currentDate, isPositiveInteger } = require('../utils');

const router = express.Router();

router.get('/', asyncHandler(async (_request, response) => {
  const [grades] = await pool.query(
    `SELECT notas.id, notas.faixa, notas.aluno_id, alunos.nome_aluno,
            notas.valor_nota, notas.data_nota
     FROM notas
     INNER JOIN alunos ON alunos.id = notas.aluno_id
     ORDER BY notas.data_nota DESC, notas.id DESC`
  );
  response.json(grades);
}));

router.post('/', asyncHandler(async (request, response) => {
  const { faixa, aluno_id, valor_nota, data_nota } = request.body;
  const gradeValue = Number(valor_nota);

  if (
    !isPositiveInteger(aluno_id) ||
    !String(faixa || '').trim() ||
    !Number.isFinite(gradeValue) ||
    gradeValue < 0 ||
    gradeValue > 100
  ) {
    return response.status(400).json({ error: 'Informe aluno, faixa e nota entre 0 e 100.' });
  }

  const gradeDate = data_nota || currentDate();
  const [result] = await pool.execute(
    'INSERT INTO notas (faixa, aluno_id, valor_nota, data_nota) VALUES (?, ?, ?, ?)',
    [faixa.trim(), Number(aluno_id), gradeValue, gradeDate]
  );

  response.status(201).json({
    id: result.insertId,
    faixa: faixa.trim(),
    aluno_id: Number(aluno_id),
    valor_nota: gradeValue,
    data_nota: gradeDate
  });
}));

module.exports = router;
