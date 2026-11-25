import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Aluno, ApiService, Chamada, Presenca } from '../services/api.service';

@Component({
  selector: 'app-chamadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-title">
      <div>
        <span class="eyebrow">FREQUÊNCIA</span>
        <h1>Chamadas</h1>
        <p>Crie chamadas por faixa e divisão e registre a situação dos alunos.</p>
      </div>
      <span class="count-pill">{{ chamadas.length }} {{ chamadas.length === 1 ? 'chamada' : 'chamadas' }}</span>
    </section>
    <p *ngIf="erro" class="alert error" role="alert">{{ erro }}</p>
    <p *ngIf="mensagem" class="alert success" role="status">{{ mensagem }}</p>

    <section class="panel form-panel">
      <div class="panel-heading"><div><h2>Nova chamada</h2><p>Os alunos da faixa etária selecionada serão incluídos automaticamente.</p></div></div>
      <form (ngSubmit)="criarChamada()" #formChamada="ngForm" class="form-grid">
        <label class="field">
          Data da chamada *
          <input name="data_chamada" [(ngModel)]="chamadaForm.data_chamada" type="date" required>
        </label>
        <label class="field">
          Faixa etária dos alunos *
          <select name="faixa_etaria_alunos" [(ngModel)]="chamadaForm.faixa_etaria_alunos" required>
            <option value="" disabled>Selecione uma faixa</option>
            <option *ngFor="let faixa of faixasEtarias" [value]="faixa">{{ faixa }}</option>
          </select>
        </label>
        <label class="field">
          Divisão da chamada *
          <input name="divisa_chamada" [(ngModel)]="chamadaForm.divisa_chamada" required>
        </label>
        <label class="field">
          Professor *
          <input name="professor" [(ngModel)]="chamadaForm.professor" required>
        </label>
        <div class="form-actions span-2">
          <button class="button primary" [disabled]="formChamada.invalid || criando || !alunos.length">
            {{ criando ? 'Criando…' : 'Criar chamada' }}
          </button>
          <span *ngIf="!alunos.length" class="muted">Cadastre alunos antes de criar uma chamada.</span>
        </div>
      </form>
    </section>

    <section class="panel table-panel">
      <div class="panel-heading"><div><h2>Chamadas registradas</h2><p>Os totais são atualizados conforme os status dos alunos.</p></div></div>
      <p *ngIf="!chamadas.length" class="empty-state">Nenhuma chamada registrada.</p>
      <div *ngIf="chamadas.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Faixa etária</th><th>Divisão</th><th>Professor</th>
              <th>Presentes</th><th>Ausentes</th><th>Justificadas</th><th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let chamada of chamadas">
              <td>{{ chamada.data_chamada }}</td>
              <td>{{ chamada.faixa_etaria_alunos }}</td>
              <td>{{ chamada.divisa_chamada }}</td>
              <td>{{ chamada.professor }}</td>
              <td>{{ chamada.quantidade_presentes }}</td>
              <td>{{ chamada.quantidade_ausentes }}</td>
              <td>{{ chamada.quantidade_justificadas }}</td>
              <td><button class="text-action" type="button" (click)="selecionarChamada(chamada)">Registrar →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section *ngIf="chamadaSelecionada" class="panel attendance-panel">
      <div class="panel-heading">
        <div>
          <h2>Frequência — {{ chamadaSelecionada.faixa_etaria_alunos }} / {{ chamadaSelecionada.divisa_chamada }}</h2>
          <p>{{ chamadaSelecionada.data_chamada }} · {{ chamadaSelecionada.professor }}</p>
        </div>
        <span class="count-pill">{{ contarStatus('presente') }} presentes</span>
      </div>
      <p *ngIf="!presencas.length" class="empty-state">Não há alunos vinculados a esta chamada.</p>
      <div *ngFor="let presenca of presencas" class="attendance-row">
        <span class="student-name">{{ presenca.nome_aluno }}</span>
        <select [(ngModel)]="presenca.status" [name]="'status-' + presenca.aluno_id" aria-label="Status da presença">
          <option value="presente">Presente</option>
          <option value="ausente">Ausente</option>
          <option value="justificada">Justificada</option>
        </select>
      </div>
      <div class="form-actions attendance-actions">
        <button class="button primary" type="button" [disabled]="salvando || !presencas.length" (click)="salvarPresencas()">
          {{ salvando ? 'Salvando…' : 'Salvar chamada' }}
        </button>
      </div>
    </section>
  `
})
export class ChamadasComponent implements OnInit {
  alunos: Aluno[] = [];
  chamadas: Chamada[] = [];
  presencas: Presenca[] = [];
  chamadaSelecionada: Chamada | null = null;
  erro = '';
  mensagem = '';
  criando = false;
  salvando = false;
  chamadaForm = this.novoFormulario();

  constructor(private readonly api: ApiService) {}

  get faixasEtarias(): string[] {
    return [...new Set(this.alunos.map((aluno) => aluno.faixa_etaria_aluno))].sort();
  }

  ngOnInit(): void {
    this.api.listarAlunos().subscribe({
      next: (alunos) => this.alunos = alunos,
      error: () => this.erro = 'Não foi possível carregar os alunos.'
    });
    this.carregarChamadas();
  }

  criarChamada(): void {
    this.criando = true;
    this.erro = '';
    this.api.criarChamada(this.chamadaForm).subscribe({
      next: (chamada) => {
        this.mensagem = 'Chamada criada. Registre a situação dos alunos.';
        this.chamadaForm = this.novoFormulario();
        this.criando = false;
        this.carregarChamadas();
        this.selecionarChamada(chamada as Chamada);
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível criar a chamada.';
        this.criando = false;
      }
    });
  }

  selecionarChamada(chamada: Chamada): void {
    this.chamadaSelecionada = chamada;
    this.mensagem = '';
    this.api.listarPresencas(chamada.id).subscribe({
      next: (presencas) => this.presencas = presencas,
      error: (error) => this.erro = error.error?.error || 'Não foi possível carregar a chamada.'
    });
  }

  contarStatus(status: Presenca['status']): number {
    return this.presencas.filter((presenca) => presenca.status === status).length;
  }

  salvarPresencas(): void {
    if (!this.chamadaSelecionada) {
      return;
    }

    this.salvando = true;
    this.api.salvarPresencas(this.chamadaSelecionada.id, this.presencas).subscribe({
      next: () => {
        this.mensagem = 'Frequência salva com sucesso.';
        this.salvando = false;
        this.carregarChamadas();
      },
      error: (error) => {
        this.erro = error.error?.error || 'Não foi possível salvar a frequência.';
        this.salvando = false;
      }
    });
  }

  private carregarChamadas(): void {
    this.api.listarChamadas().subscribe({
      next: (chamadas) => this.chamadas = chamadas,
      error: () => this.erro = 'Não foi possível carregar as chamadas.'
    });
  }

  private novoFormulario(): {
    data_chamada: string;
    faixa_etaria_alunos: string;
    divisa_chamada: string;
    professor: string;
  } {
    return {
      data_chamada: new Date().toISOString().slice(0, 10),
      faixa_etaria_alunos: '',
      divisa_chamada: '',
      professor: ''
    };
  }
}
