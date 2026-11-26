import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/">
        <span class="brand-mark">A</span>
        <span>ADADOC <small>Gestão escolar</small></span>
      </a>
      <nav aria-label="Navegação principal">
        <a routerLink="/alunos" routerLinkActive="active">Alunos</a>
        <a routerLink="/notas" routerLinkActive="active">Notas</a>
        <a routerLink="/chamadas" routerLinkActive="active">Chamadas</a>
      </nav>
    </header>
    <main class="page-shell">
      <router-outlet />
    </main>
    <footer>ADADOC <span>•</span> Gestão de alunos, notas e frequência</footer>
  `
})
export class AppComponent {}
