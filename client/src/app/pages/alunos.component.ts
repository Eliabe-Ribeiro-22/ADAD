import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Aluno, ApiService } from '../services/api.service';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-title">
      <div>
        <span class="eyebrow">CADASTRO</span>
        <h1>Alunos</h1>
        <p>Cadastre e consulte os estudantes da instituição.</p>
      </div>
      <span class="count-pill">{{ alunos.length }} {{ alunos.length === 1 ? 'aluno' : 'alunos' }}</span>
    </section>

    <p *ngIf="erro" class="alert error" role="alert">{{ erro }}</p>
    <p *ngIf="mensagem" class="alert success" role="status">{{ mensagem }}</p>

    <section class="panel form-panel">
      <div class="panel-heading">
        <div>
          <h2>{{ alunoEmEdicaoId ? 'Editar aluno' : 'Novo aluno' }}</h2>
          <p>Os campos com * são obrigatórios.</p>
        </div>
      </div>
      <form (ngSubmit)="salvarAluno()" #formAluno="ngForm" class="form-grid">
        <label class="field">
          Nome do aluno *
          <input name="nome_aluno" [(ngModel)]="alunoForm.nome_aluno" required autocomplete="name">
        </label>
        <label class="field">
          Faixa etária *
          <input name="faixa_etaria_aluno" [(ngModel)]="alunoForm.faixa_etaria_aluno" required placeholder="Ex.: 8 a 10 anos">
        </label>
        <label class="field span-2">
          Endereço
          <input name="endereco_aluno" [(ngModel)]="alunoForm.endereco_aluno" autocomplete="street-address">
        </label>
        <label class="field">
          Data de nascimento
          <input name="data_nascimento_aluno" [(ngModel)]="alunoForm.data_nascimento_aluno" type="date">
        </label>
        <label class="field">
          Celular
          <input name="celular_aluno" [(ngModel)]="alunoForm.celular_aluno" type="tel" autocomplete="tel">
        </label>
        <label class="field span-2">
          E-mail
          <input name="email_aluno" [(ngModel)]="alunoForm.email_aluno" type="email" autocomplete="email">
        </label>
        <div class="form-actions span-2">
          <button class="button primary" [disabled]="formAluno.invalid || salvando">
            {{ salvando ? 'Salvando…' : alunoEmEdicaoId ? 'Salvar alterações' : 'Cadastrar aluno' }}
          </button>
          <button *ngIf="alunoEmEdicaoId" type="button" class="button secondary" (click)="limparFormulario()">
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <section class="panel table-panel">
      <div class="panel-heading">
        <div>
          <h2>Alunos cadastrados</h2>
          <p>Informações dos estudantes registrados.</p>
        </div>
      </div>
      <p *ngIf="!alunos.length" class="empty-state">Nenhum aluno cadastrado.</p>
      <div *ngIf="alunos.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>Faixa etária</th><th>Endereço</th><th>Nascimento</th>
              <th>Celular</th><th>E-mail</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let aluno of alunos">
              <td><strong>{{ aluno.nome_aluno }}</strong></td>
              <td>{{ aluno.faixa_etaria_aluno }}</td>
              <td>{{ aluno.endereco_aluno || '—' }}</td>
              <td>{{ aluno.data_nascimento_aluno || '—' }}</td>
              <td>{{ aluno.celular_aluno || '—' }}</td>
              <td>{{ aluno.email_aluno || '—' }}</td>
              <td class="actions">
                <button class="text-action" type="button" (click)="editarAluno(aluno)">Editar</button>
                <button class="text-action danger-text" type="button" (click)="excluirAluno(aluno)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AlunosComponent implements OnInit {
  alunos: Aluno[] = [];
  alunoEmEdicaoId: number | null = null;
  erro = '';
  mensagem = '';
  salvando = false;
  alunoForm: Partial<Aluno> = this.novoFormulario();

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.carregarAlunos();
  }

  carregarAlunos(): void {
    this.api.listarAlunos().subscribe({
      next: (alunos) => {
        this.alunos = alunos;
        this.erro = '';
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível carregar os alunos.';
      }
    });
  }

  salvarAluno(): void {
    this.salvando = true;
    this.erro = '';
    const request = this.alunoEmEdicaoId
      ? this.api.atualizarAluno(this.alunoEmEdicaoId, this.alunoForm)
      : this.api.criarAluno(this.alunoForm);

    request.subscribe({
      next: () => {
        this.mensagem = this.alunoEmEdicaoId ? 'Aluno atualizado.' : 'Aluno cadastrado.';
        this.limparFormulario();
        this.carregarAlunos();
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível salvar o aluno.';
        this.salvando = false;
      }
    });
  }

  editarAluno(aluno: Aluno): void {
    this.alunoEmEdicaoId = aluno.id;
    this.alunoForm = {
      ...aluno,
      data_nascimento_aluno: aluno.data_nascimento_aluno?.slice(0, 10) || ''
    };
    this.mensagem = '';
  }

  excluirAluno(aluno: Aluno): void {
    if (!confirm(`Excluir ${aluno.nome_aluno}? Notas e presenças vinculadas também serão removidas.`)) {
      return;
    }

    this.api.excluirAluno(aluno.id).subscribe({
      next: () => {
        this.mensagem = 'Aluno excluído.';
        this.carregarAlunos();
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível excluir o aluno.';
      }
    });
  }

  limparFormulario(): void {
    this.alunoEmEdicaoId = null;
    this.alunoForm = this.novoFormulario();
    this.salvando = false;
  }

  private novoFormulario(): Partial<Aluno> {
    return {
      nome_aluno: '',
      faixa_etaria_aluno: '',
      endereco_aluno: '',
      data_nascimento_aluno: '',
      celular_aluno: '',
      email_aluno: ''
    };
  }
}
