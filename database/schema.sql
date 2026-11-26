CREATE DATABASE IF NOT EXISTS adadoc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE adadoc;

CREATE TABLE IF NOT EXISTS alunos (
  aluno_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_aluno VARCHAR(150) NOT NULL,
  faixa_etaria_aluno VARCHAR(60) NOT NULL,
  endereco_aluno VARCHAR(255) NULL,
  data_nascimento_aluno DATE NULL,
  celular_aluno VARCHAR(30) NULL,
  email_aluno VARCHAR(190) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_alunos_email (email_aluno)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notas (
  nota_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  faixa VARCHAR(60) NOT NULL,
  aluno_id INT UNSIGNED NOT NULL,
  valor_nota DECIMAL(5, 2) NOT NULL,
  data_nota DATE NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notas_alunos
    FOREIGN KEY (aluno_id) REFERENCES alunos (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_notas_valor
    CHECK (valor_nota >= 0 AND valor_nota <= 100),
  INDEX idx_notas_aluno (aluno_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chamadas (
  chamada_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data_chamada DATE NOT NULL,
  faixa_etaria_alunos VARCHAR(60) NOT NULL,
  divisa_chamada VARCHAR(100) NOT NULL,
  aluno_id INT UNSIGNED NOT NULL,
  professor VARCHAR(150) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_chamadas_alunos
    FOREIGN KEY (aluno_id) REFERENCES alunos (id)
    ON DELETE CASCADE,
  INDEX idx_chamadas_data (data_chamada)
) ENGINE=InnoDB;

-- Entidade fraca: a chave composta identifica cada aluno dentro de uma chamada.
CREATE TABLE IF NOT EXISTS chamada_alunos (
  chamada_id INT UNSIGNED NOT NULL,
  aluno_id INT UNSIGNED NOT NULL,
  status ENUM('presente', 'ausente', 'justificada') NOT NULL DEFAULT 'ausente',
  observacao VARCHAR(255) NULL,
  PRIMARY KEY (chamada_id, aluno_id),
  CONSTRAINT fk_chamada_alunos_chamada
    FOREIGN KEY (chamada_id) REFERENCES chamadas (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chamada_alunos_aluno
    FOREIGN KEY (aluno_id) REFERENCES alunos (id)
    ON DELETE CASCADE,
  INDEX idx_chamada_alunos_aluno (aluno_id)
) ENGINE=InnoDB;
