import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="welcome-hero">
      <span class="eyebrow">PLATAFORMA DE GESTÃO ESCOLAR</span>
      <h1>Organize a rotina.<br><em>Acompanhe cada evolução.</em></h1>
      <p>Cadastre alunos, acompanhe o desempenho e registre a frequência em um só lugar.</p>
      <a class="button primary" routerLink="/alunos">Começar agora <span aria-hidden="true">→</span></a>
    </section>

    <section class="section-heading">
      <div>
        <span class="eyebrow">ACESSO RÁPIDO</span>
        <h2>O que você precisa fazer?</h2>
      </div>
      <span class="muted">Escolha uma área para continuar</span>
    </section>

    <section class="feature-grid">
      <a class="feature-card" routerLink="/alunos">
        <span class="feature-icon blue" aria-hidden="true">♙</span>
        <h3>Alunos</h3>
        <p>Cadastre e mantenha atualizadas as informações dos estudantes.</p>
        <span class="card-link">Gerenciar alunos →</span>
      </a>
      <a class="feature-card" routerLink="/notas">
        <span class="feature-icon coral" aria-hidden="true">▤</span>
        <h3>Notas</h3>
        <p>Lance notas e acompanhe o desempenho acadêmico.</p>
        <span class="card-link">Acessar notas →</span>
      </a>
      <a class="feature-card" routerLink="/chamadas">
        <span class="feature-icon green" aria-hidden="true">✓</span>
        <h3>Chamadas</h3>
        <p>Registre presentes, ausentes e justificativas por turma.</p>
        <span class="card-link">Fazer chamada →</span>
      </a>
    </section>
  `
})
export class WelcomeComponent {}
