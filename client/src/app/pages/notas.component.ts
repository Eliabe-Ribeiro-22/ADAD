import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Aluno, ApiService, Nota } from '../services/api.service';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-title">
      <div>
        <span class="eyebrow">ACOMPANHAMENTO ACADÊMICO</span>
        <h1>Notas</h1>
        <p>Registre e consulte o desempenho dos alunos.</p>
      </div>
      <span class="count-pill">{{ notas.length }} {{ notas.length === 1 ? 'nota' : 'notas' }}</span>
    </section>
    <p *ngIf="erro" class="alert error" role="alert">{{ erro }}</p>
    <p *ngIf="mensagem" class="alert success" role="status">{{ mensagem }}</p>

    <section class="panel form-panel">
      <div class="panel-heading">
        <div><h2>Lançar nota</h2><p>Selecione o aluno e informe a faixa, o valor e a data.</p></div>
      </div>
      <form (ngSubmit)="salvarNota()" #formNota="ngForm" class="form-grid">
        <label class="field">
          Faixa *
          <input name="faixa" [(ngModel)]="notaForm.faixa" required>
        </label>
        <label class="field">
          Aluno *
          <select name="aluno_id" [(ngModel)]="notaForm.aluno_id" required>
            <option [ngValue]="null" disabled>Selecione um aluno</option>
            <option *ngFor="let aluno of alunos" [ngValue]="aluno.id">{{ aluno.nome_aluno }}</option>
          </select>
        </label>
        <label class="field">
          Valor da nota (0–100) *
          <input name="valor_nota" [(ngModel)]="notaForm.valor_nota" type="number" min="0" max="100" step="0.01" required>
        </label>
        <label class="field">
          Data da nota *
          <input name="data_nota" [(ngModel)]="notaForm.data_nota" type="date" required>
        </label>
        <div class="form-actions span-2">
          <button class="button primary" [disabled]="formNota.invalid || !alunos.length || salvando">
            {{ salvando ? 'Salvando…' : 'Salvar nota' }}
          </button>
          <span *ngIf="!alunos.length" class="muted">Cadastre um aluno antes de lançar notas.</span>
        </div>
      </form>
    </section>

    <section class="panel table-panel">
      <div class="panel-heading"><div><h2>Notas lançadas</h2><p>Resultados registrados por aluno.</p></div></div>
      <p *ngIf="!notas.length" class="empty-state">Ainda não há notas lançadas.</p>
      <div *ngIf="notas.length" class="table-wrap">
        <table>
          <thead><tr><th>Faixa</th><th>Aluno</th><th>Valor da nota</th><th>Data da nota</th></tr></thead>
          <tbody>
            <tr *ngFor="let nota of notas">
              <td>{{ nota.faixa }}</td>
              <td><strong>{{ nota.nome_aluno }}</strong></td>
              <td><span class="grade-badge">{{ nota.valor_nota | number:'1.2-2' }}</span></td>
              <td>{{ nota.data_nota }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class NotasComponent implements OnInit {
  alunos: Aluno[] = [];
  notas: Nota[] = [];
  erro = '';
  mensagem = '';
  salvando = false;
  notaForm = this.novoFormulario();

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.carregarAlunos();
    this.carregarNotas();
  }

  salvarNota(): void {
    this.salvando = true;
    this.erro = '';
    this.api.criarNota(this.notaForm).subscribe({
      next: () => {
        this.mensagem = 'Nota lançada com sucesso.';
        this.notaForm = this.novoFormulario();
        this.salvando = false;
        this.carregarNotas();
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível salvar a nota.';
        this.salvando = false;
      }
    });
  }

  private carregarAlunos(): void {
    this.api.listarAlunos().subscribe({
      next: (alunos) => this.alunos = alunos,
      error: () => this.erro = 'Não foi possível carregar os alunos.'
    });
  }

  private carregarNotas(): void {
    this.api.listarNotas().subscribe({
      next: (notas) => this.notas = notas,
      error: () => this.erro = 'Não foi possível carregar as notas.'
    });
  }

  private novoFormulario(): { faixa: string; aluno_id: number | null; valor_nota: number | null; data_nota: string } {
    return {
      faixa: '',
      aluno_id: null,
      valor_nota: null,
      data_nota: new Date().toISOString().slice(0, 10)
    };
  }
}
