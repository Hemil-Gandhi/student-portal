import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./components/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./components/exams/exams.component').then(m => m.ExamsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./components/attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./components/expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'notes',
        loadComponent: () => import('./components/notes/notes.component').then(m => m.NotesComponent)
      },
      {
        path: 'placements',
        loadComponent: () => import('./components/placements/placements.component').then(m => m.PlacementsComponent)
      },
      {
        path: 'study-timer',
        loadComponent: () => import('./components/study-timer/study-timer.component').then(m => m.StudyTimerComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
