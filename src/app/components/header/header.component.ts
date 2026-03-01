import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, signal, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MagneticButtonDirective } from '../../directives/magnetic-button.directive';
import { I18nService, SupportedLang } from '../../services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MagneticButtonDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private i18n = inject(I18nService);
  private host = inject(ElementRef<HTMLElement>);

  scrolled = signal(false);
  mobileOpen = signal(false);
  currentLang = signal<SupportedLang>('en');

  constructor() {
    this.currentLang.set(this.i18n.currentLang);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  async toggleLanguage() {
    const next: SupportedLang = this.currentLang() === 'ar' ? 'en' : 'ar';
    await this.i18n.setLanguage(next);
    this.currentLang.set(next);

    // Close mobile after switching to avoid layout jump on RTL.
    this.closeMobile();
  }

  onNavClick() {
    this.closeMobile();
  }

  get logoAlt() {
    return this.i18n.t('header.logoAlt');
  }

  get headerEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector('header');
  }
}

