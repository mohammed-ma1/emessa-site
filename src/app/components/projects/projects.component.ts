import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { StaggerChildrenDirective } from '../../directives/stagger-children.directive';
import { Project, ProjectCategoryId } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ScrollAnimateDirective, StaggerChildrenDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;

  categories: Array<{ id: ProjectCategoryId; labelKey: string }> = [
    { id: 'all', labelKey: 'projects.filters.all' },
    { id: 'landscaping', labelKey: 'projects.filters.landscaping' },
    { id: 'irrigation', labelKey: 'projects.filters.irrigation' },
    { id: 'outdoor', labelKey: 'projects.filters.outdoor' },
    { id: 'special', labelKey: 'projects.filters.special' },
  ];

  selected = signal<ProjectCategoryId>('all');

  projects = signal<Project[]>([
    {
      id: 'p1',
      categoryId: 'landscaping',
      titleKey: 'projects.items.p1.t',
      descriptionKey: 'projects.items.p1.p',
      image: 'assets/green/landscaping-plaza-turf-planter.png',
      year: '2024',
      locationKey: 'projects.items.p1.loc',
    },
    {
      id: 'p2',
      categoryId: 'outdoor',
      titleKey: 'projects.items.p2.t',
      descriptionKey: 'projects.items.p2.p',
      image: 'assets/green/hardscape-concrete-benches.png',
      year: '2023',
      locationKey: 'projects.items.p2.loc',
    },
    {
      id: 'p3',
      categoryId: 'landscaping',
      titleKey: 'projects.items.p3.t',
      descriptionKey: 'projects.items.p3.p',
      image: 'assets/green/project-courtyard-shade-sails.jpg',
      year: '2022',
      locationKey: 'projects.items.p3.loc',
    },
    {
      id: 'p4',
      categoryId: 'outdoor',
      titleKey: 'projects.items.p4.t',
      descriptionKey: 'projects.items.p4.p',
      image: 'assets/green/outdoor-shade-sail-canopy-installation.png',
      year: '2024',
      locationKey: 'projects.items.p4.loc',
    },
    {
      id: 'p5',
      categoryId: 'irrigation',
      titleKey: 'projects.items.p5.t',
      descriptionKey: 'projects.items.p5.p',
      image: 'assets/green/irrigation-dripline-layout-field.png',
      year: '2021',
      locationKey: 'projects.items.p5.loc',
    },
    {
      id: 'p6',
      categoryId: 'special',
      titleKey: 'projects.items.p6.t',
      descriptionKey: 'projects.items.p6.p',
      image: 'assets/green/project-alquia-mall-hardscape.png',
      year: '2025',
      locationKey: 'projects.items.p6.loc',
    },
    {
      id: 'p7',
      categoryId: 'special',
      titleKey: 'projects.items.p7.t',
      descriptionKey: 'projects.items.p7.p',
      image: 'assets/green/boundary-wall-split-face-textured-blocks.jpg',
      year: '2024',
      locationKey: 'projects.items.p7.loc',
    },
    {
      id: 'p8',
      categoryId: 'special',
      titleKey: 'projects.items.p8.t',
      descriptionKey: 'projects.items.p8.p',
      image: 'assets/green/retaining-wall-split-face-textured-blocks.jpg',
      year: '2024',
      locationKey: 'projects.items.p8.loc',
    },
  ]);

  filtered = computed(() => {
    const cat = this.selected();
    const items = this.projects();
    return cat === 'all' ? items : items.filter((p) => p.categoryId === cat);
  });

  activeId = signal<string | null>(null);
  active = computed(() => {
    const id = this.activeId();
    if (!id) return null;
    return this.projects().find((p) => p.id === id) ?? null;
  });

  activeIndex = computed(() => {
    const id = this.activeId();
    if (!id) return -1;
    return this.filtered().findIndex((p) => p.id === id);
  });

  private previousFocus: Element | null = null;
  private boundKeydown = (e: KeyboardEvent) => this.onKeydown(e);
  private scrollY = 0;

  setCategory(id: ProjectCategoryId) {
    this.selected.set(id);
  }

  open(id: string) {
    const p = this.projects().find((x) => x.id === id);
    if (!p) return;
    this.previousFocus = document.activeElement;
    this.lockScroll();
    this.activeId.set(id);
    document.addEventListener('keydown', this.boundKeydown);
    setTimeout(() => this.focusDialog(), 0);
  }

  close() {
    document.removeEventListener('keydown', this.boundKeydown);
    this.activeId.set(null);
    this.unlockScroll();
    const el = this.previousFocus as HTMLElement | null;
    if (el && typeof el.focus === 'function') el.focus();
    this.previousFocus = null;
  }

  next() {
    const list = this.filtered();
    if (list.length === 0) return;
    const i = this.activeIndex();
    const next = list[(i + 1 + list.length) % list.length];
    if (next) this.activeId.set(next.id);
  }

  prev() {
    const list = this.filtered();
    if (list.length === 0) return;
    const i = this.activeIndex();
    const prev = list[(i - 1 + list.length) % list.length];
    if (prev) this.activeId.set(prev.id);
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close();
  }

  onTileKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.open(id);
    }
  }

  private onKeydown(e: KeyboardEvent) {
    if (!this.activeId()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'ArrowRight') {
      this.next();
      return;
    }
    if (e.key === 'ArrowLeft') {
      this.prev();
      return;
    }
    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  private focusDialog() {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) return;
    const closeBtn = dialog.querySelector<HTMLElement>('[data-close]');
    (closeBtn ?? dialog).focus();
  }

  private trapFocus(e: KeyboardEvent) {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((n) => !n.hasAttribute('disabled') && n.tabIndex !== -1);

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  }

  private lockScroll() {
    this.scrollY = window.scrollY || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  private unlockScroll() {
    const top = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    const y = top ? Math.abs(parseInt(top, 10)) : this.scrollY;
    window.scrollTo(0, Number.isFinite(y) ? y : this.scrollY);
  }
}

