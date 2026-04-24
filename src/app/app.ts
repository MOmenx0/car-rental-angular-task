import { Component, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

import { AuthService } from './core/auth/auth.service';
import { SessionService } from './core/auth/session.service';
import { ThemeService } from './shared/services/theme.service';
import { UiLanguageService } from './shared/services/ui-language.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    TranslateModule,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly session = inject(SessionService);
  readonly theme = inject(ThemeService);
  readonly uiLang = inject(UiLanguageService);
  private readonly translate = inject(TranslateService);

  readonly isAuthed = computed(() => this.session.isAuthenticated());
  readonly role = computed(() => this.session.role());
  readonly currentLanguageLabel = computed(() => (this.uiLang.language() === 'en' ? 'AR' : 'EN'));
  readonly themeIcon = computed(() => (this.theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'));

  readonly navLinks = computed(() => {
    const role = this.session.role();
    if (role === 'Admin') {
      return [
        { link: '/admin/users', label: 'nav.admin.users' },
        { link: '/admin/cars', label: 'nav.admin.cars' },
        { link: '/admin/orders', label: 'nav.admin.orders' }
      ];
    }

    if (role === 'Customer') {
      return [
        { link: '/cars', label: 'nav.customer.cars' },
        { link: '/orders', label: 'nav.customer.orders' },
        { link: '/installments', label: 'nav.customer.installments' }
      ];
    }

    return [];
  });

  readonly homeLink = computed(() => {
    const role = this.session.role();
    if (role === 'Admin') return '/admin/users';
    if (role === 'Customer') return '/cars';
    return '/login';
  });

  constructor() {
    this.translate.addLangs(['en', 'ar']);
    this.uiLang.init();
    this.theme.init();
    this.translate.use(this.uiLang.language());
    this.session.loadMe().subscribe();
  }

  toggleTheme() {
    this.theme.toggle();
  }

  toggleLanguage() {
    const next = this.uiLang.language() === 'en' ? 'ar' : 'en';
    this.uiLang.setLanguage(next);
    this.translate.use(next);
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.session.clearSession();
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.session.clearSession();
        this.router.navigateByUrl('/login');
      }
    });
  }
}
