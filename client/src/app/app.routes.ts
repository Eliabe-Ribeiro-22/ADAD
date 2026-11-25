import { Routes } from '@angular/router';
import { AlunosComponent } from './pages/alunos.component';
import { ChamadasComponent } from './pages/chamadas.component';
import { NotasComponent } from './pages/notas.component';
import { WelcomeComponent } from './pages/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'alunos', component: AlunosComponent },
  { path: 'notas', component: NotasComponent },
  { path: 'chamadas', component: ChamadasComponent },
  { path: '**', redirectTo: '' }
];
