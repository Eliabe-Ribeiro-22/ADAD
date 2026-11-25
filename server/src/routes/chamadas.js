const express = require('express');
const pool = require('../db');
const { asyncHandler, currentDate, isPositiveInteger } = require('../utils');

const router = express.Router();

const attendanceSummaryQuery = `
  SELECT chamadas.id, chamadas.data_chamada, chamadas.faixa_etaria_alunos,
         chamadas.divisa_chamada, chamadas.professor,
         COALESCE(SUM(chamada_alunos.status = 'presente'), 0) AS quantidade_presentes,
         COALESCE(SUM(chamada_alunos.status = 'ausente'), 0) AS quantidade_ausentes,
         COALESCE(SUM(chamada_alunos.status = 'justificada'), 0) AS quantidade_justificadas,
         COUNT(chamada_alunos.aluno_id) AS total_alunos
  FROM chamadas
  LEFT JOIN chamada_alunos ON chamada_alunos.chamada_id = chamadas.id
`;

router.get('/', asyncHandler(async (_request, response) => {
  const [calls] = await pool.query(
    `${attendanceSummaryQuery}
     GROUP BY chamadas.id
     ORDER BY chamadas.data_chamada DESC, chamadas.id DESC`
  );
  response.json(calls);
}));

router.post('/', asyncHandler(async (request, response) => {
  const { data_chamada, faixa_etaria_alunos, divisa_chamada, professor } = request.body;

  if (
    !String(faixa_etaria_alunos || '').trim() ||
    !String(divisa_chamada || '').trim() ||
    !String(professor || '').trim()
  ) {
    return response.status(400).json({
      error: 'Faixa etária, divisão da chamada e professor são obrigatórios.'
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const callDate = data_chamada || currentDate();
    const [result] = await connection.execute(
      `INSERT INTO chamadas (data_chamada, faixa_etaria_alunos, divisa_chamada, professor)
       VALUES (?, ?, ?, ?)`,
      [callDate, faixa_etaria_alunos.trim(), divisa_chamada.trim(), professor.trim()]
    );
    const [students] = await connection.execute(
      'SELECT id FROM alunos WHERE faixa_etaria_aluno = ?',
      [faixa_etaria_alunos.trim()]
    );

    for (const student of students) {
      await connection.execute(
        'INSERT INTO chamada_alunos (chamada_id, aluno_id, status) VALUES (?, ?, ?)',
        [result.insertId, student.id, 'ausente']
      );
    }

    await connection.commit();
    response.status(201).json({
      id: result.insertId,
      data_chamada: callDate,
      faixa_etaria_alunos: faixa_etaria_alunos.trim(),
      divisa_chamada: divisa_chamada.trim(),
      professor: professor.trim(),
      total_alunos: students.length
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

router.get('/:id/alunos', asyncHandler(async (request, response) => {
  if (!isPositiveInteger(request.params.id)) {
    return response.status(400).json({ error: 'ID inválido.' });
  }

  const [students] = await pool.execute(
    `SELECT chamada_alunos.chamada_id, chamada_alunos.aluno_id,
            alunos.nome_aluno, chamada_alunos.status, chamada_alunos.observacao
     FROM chamada_alunos
     INNER JOIN alunos ON alunos.id = chamada_alunos.aluno_id
     WHERE chamada_alunos.chamada_id = ?
     ORDER BY alunos.nome_aluno`,
    [request.params.id]
  );
  response.json(students);
}));

router.put('/:id/presencas', asyncHandler(async (request, response) => {
  if (!isPositiveInteger(request.params.id) || !Array.isArray(request.body.presencas)) {
    return response.status(400).json({ error: 'ID inválido ou lista de presenças ausente.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [calls] = await connection.execute(
      'SELECT id FROM chamadas WHERE id = ?',
      [request.params.id]
    );
    if (!calls.length) {
      await connection.rollback();
      return response.status(404).json({ error: 'Chamada não encontrada.' });
    }

    for (const attendance of request.body.presencas) {
      const validStatuses = ['presente', 'ausente', 'justificada'];
      if (!isPositiveInteger(attendance.aluno_id) || !validStatuses.includes(attendance.status)) {
        const error = new Error('Aluno ou status de presença inválido.');
        error.status = 400;
        throw error;
      }

      const [result] = await connection.execute(
        `UPDATE chamada_alunos
         SET status = ?
         WHERE chamada_id = ? AND aluno_id = ?`,
        [attendance.status, request.params.id, attendance.aluno_id]
      );
      if (!result.affectedRows) {
        const error = new Error('O aluno não pertence a esta chamada.');
        error.status = 400;
        throw error;
      }
    }

    await connection.commit();
    response.json({ message: 'Chamada salva.', atualizados: request.body.presencas.length });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

module.exports = router;
