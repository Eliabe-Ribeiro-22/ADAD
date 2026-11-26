# ADADOC — Gestão de alunos

Sistema para cadastro de alunos, lançamento de notas e controle de chamadas. O frontend usa Angular; a API usa Express.js e o banco de dados é MySQL.

## Requisitos
- Node.js 20 ou superior
- MySQL 8 ou superior

## Configuração
1. Execute `database/schema.sql` no MySQL para criar o banco e as tabelas.
2. Copie `server/.env.example` para `server/.env` e informe as credenciais do MySQL.
3. Na raiz do projeto, instale as dependências do servidor: `npm install`.
4. Instale as dependências Angular: `npm install --prefix client`.
5. Inicie a API com `npm run dev` (http://localhost:3000).
6. Em outro terminal, inicie o Angular com `npm run client` (http://localhost:4200).

## Telas
- **Welcome:** atalhos para as áreas do sistema.
- **Alunos:** cadastro, edição e remoção de alunos.
- **Notas:** lançamento e consulta de notas.
- **Chamadas:** criação de chamadas e registro de presença, ausência ou justificativa.

## Banco de dados
As quatro tabelas são `alunos`, `notas`, `chamadas` e `chamada_alunos`. A última é a entidade fraca/associativa, identificada pela chave composta `chamada_id` + `aluno_id`. As quantidades de presentes, ausentes e justificadas são calculadas a partir dos status em `chamada_alunos`, evitando armazenar totais que podem ficar inconsistentes.

Os atributos do banco e os valores `name` dos campos HTML mantêm os mesmos identificadores, incluindo caixa e sublinhados.
