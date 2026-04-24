import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { SessionService } from './core/auth/session.service';
import { ThemeService } from './shared/services/theme.service';
import { UiLanguageService } from './shared/services/ui-language.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

class SessionServiceStub {
  readonly isAuthenticated = signal(false).asReadonly();
  readonly role = signal<'Admin' | 'Customer' | null>(null).asReadonly();

  loadMe() {
    return of(void 0);
  }

  clearSession() {}
}

class ThemeServiceStub {
  readonly isDark = signal(false).asReadonly();
  init() {}
  toggle() {}
}

class UiLanguageServiceStub {
  readonly language = signal<'en' | 'ar'>('en').asReadonly();
  init() {}
  setLanguage() {}
}

class AuthServiceStub {
  logout() {
    return of(void 0);
  }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        importProvidersFrom(
          TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
              provide: TranslateLoader,
              useClass: FakeTranslateLoader
            }
          })
        ),
        { provide: SessionService, useClass: SessionServiceStub },
        { provide: ThemeService, useClass: ThemeServiceStub },
        { provide: UiLanguageService, useClass: UiLanguageServiceStub },
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Car Rental');
  });
});
