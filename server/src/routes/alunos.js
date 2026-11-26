const express = require('express');
const pool = require('../db');
const { asyncHandler, isPositiveInteger } = require('../utils');

const router = express.Router();

router.get('/', asyncHandler(async (_request, response) => {
  const [students] = await pool.query(
    `SELECT id, nome_aluno, faixa_etaria_aluno, endereco_aluno,
            data_nascimento_aluno, celular_aluno, email_aluno, criado_em
     FROM alunos
     ORDER BY nome_aluno`
  );
  response.json(students);
}));

router.post('/', asyncHandler(async (request, response) => {
  const {
    nome_aluno,
    faixa_etaria_aluno,
    endereco_aluno,
    data_nascimento_aluno,
    celular_aluno,
    email_aluno
  } = request.body;

  if (!String(nome_aluno || '').trim() || !String(faixa_etaria_aluno || '').trim()) {
    return response.status(400).json({ error: 'Nome e faixa etária são obrigatórios.' });
  }

  const [result] = await pool.execute(
    `INSERT INTO alunos
      (nome_aluno, faixa_etaria_aluno, endereco_aluno, data_nascimento_aluno, celular_aluno, email_aluno)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nome_aluno.trim(),
      faixa_etaria_aluno.trim(),
      endereco_aluno || null,
      data_nascimento_aluno || null,
      celular_aluno || null,
      email_aluno || null
    ]
  );

  const [students] = await pool.execute('SELECT * FROM alunos WHERE id = ?', [result.insertId]);
  response.status(201).json(students[0]);
}));

router.put('/:id', asyncHandler(async (request, response) => {
  if (!isPositiveInteger(request.params.id)) {
    return response.status(400).json({ error: 'ID inválido.' });
  }

  const {
    nome_aluno,
    faixa_etaria_aluno,
    endereco_aluno,
    data_nascimento_aluno,
    celular_aluno,
    email_aluno
  } = request.body;

  if (!String(nome_aluno || '').trim() || !String(faixa_etaria_aluno || '').trim()) {
    return response.status(400).json({ error: 'Nome e faixa etária são obrigatórios.' });
  }

  const [result] = await pool.execute(
    `UPDATE alunos
     SET nome_aluno = ?, faixa_etaria_aluno = ?, endereco_aluno = ?,
         data_nascimento_aluno = ?, celular_aluno = ?, email_aluno = ?
     WHERE id = ?`,
    [
      nome_aluno.trim(),
      faixa_etaria_aluno.trim(),
      endereco_aluno || null,
      data_nascimento_aluno || null,
      celular_aluno || null,
      email_aluno || null,
      request.params.id
    ]
  );

  if (!result.affectedRows) {
    return response.status(404).json({ error: 'Aluno não encontrado.' });
  }

  response.json({ message: 'Aluno atualizado.' });
}));

router.delete('/:id', asyncHandler(async (request, response) => {
  if (!isPositiveInteger(request.params.id)) {
    return response.status(400).json({ error: 'ID inválido.' });
  }

  const [result] = await pool.execute('DELETE FROM alunos WHERE id = ?', [request.params.id]);
  if (!result.affectedRows) {
    return response.status(404).json({ error: 'Aluno não encontrado.' });
  }

  response.status(204).end();
}));

module.exports = router;
