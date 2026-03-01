import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../services/i18n.service';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { StaggerChildrenDirective } from '../../directives/stagger-children.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslatePipe, ScrollAnimateDirective, StaggerChildrenDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private i18n = inject(I18nService);

  loading = signal(false);
  submitted = signal(false);

  form = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  private last = { ...this.form };

  emailHref(): string {
    const to = this.i18n.t('contact.email.to');
    const subject = this.i18n.t('contact.email.subject', { name: this.last.name || '-' });
    const body = this.i18n.t('contact.email.body', {
      name: this.last.name || '-',
      email: this.last.email || '-',
      phone: this.last.phone || '-',
      message: this.last.message || '-',
    });
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  whatsappHref(): string {
    const phone = this.i18n.t('contact.whatsapp.number');
    const text = this.i18n.t('contact.whatsapp.message', {
      name: this.last.name || '-',
      phone: this.last.phone || '-',
      message: this.last.message || '-',
    });
    return `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(text)}`;
  }

  submit() {
    this.loading.set(true);
    setTimeout(() => {
      this.last = { ...this.form };
      this.loading.set(false);
      this.submitted.set(true);

      this.form = {
        name: '',
        email: '',
        phone: '',
        message: '',
      };
    }, 250);
  }
}

