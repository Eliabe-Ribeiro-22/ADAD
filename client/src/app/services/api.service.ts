import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api';

export interface Aluno {
  id: number;
  nome_aluno: string;
  faixa_etaria_aluno: string;
  endereco_aluno?: string | null;
  data_nascimento_aluno?: string | null;
  celular_aluno?: string | null;
  email_aluno?: string | null;
}

export interface Nota {
  id: number;
  faixa: string;
  aluno_id: number;
  nome_aluno: string;
  valor_nota: number;
  data_nota: string;
}

export interface Chamada {
  id: number;
  data_chamada: string;
  faixa_etaria_alunos: string;
  divisa_chamada: string;
  professor: string;
  quantidade_presentes: number;
  quantidade_ausentes: number;
  quantidade_justificadas: number;
  total_alunos: number;
}

export interface Presenca {
  chamada_id: number;
  aluno_id: number;
  nome_aluno: string;
  status: 'presente' | 'ausente' | 'justificada';
  observacao?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  listarAlunos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${API_URL}/alunos`);
  }

  criarAluno(aluno: Partial<Aluno>): Observable<Aluno> {
    return this.http.post<Aluno>(`${API_URL}/alunos`, aluno);
  }

  atualizarAluno(id: number, aluno: Partial<Aluno>): Observable<unknown> {
    return this.http.put(`${API_URL}/alunos/${id}`, aluno);
  }

  excluirAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/alunos/${id}`);
  }

  listarNotas(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${API_URL}/notas`);
  }

  criarNota(nota: object): Observable<Nota> {
    return this.http.post<Nota>(`${API_URL}/notas`, nota);
  }

  listarChamadas(): Observable<Chamada[]> {
    return this.http.get<Chamada[]>(`${API_URL}/chamadas`);
  }

  criarChamada(chamada: object): Observable<Partial<Chamada>> {
    return this.http.post<Partial<Chamada>>(`${API_URL}/chamadas`, chamada);
  }

  listarPresencas(chamadaId: number): Observable<Presenca[]> {
    return this.http.get<Presenca[]>(`${API_URL}/chamadas/${chamadaId}/alunos`);
  }

  salvarPresencas(chamadaId: number, presencas: Presenca[]): Observable<{ message: string; atualizados: number }> {
    return this.http.put<{ message: string; atualizados: number }>(
      `${API_URL}/chamadas/${chamadaId}/presencas`,
      { presencas }
    );
  }
}
