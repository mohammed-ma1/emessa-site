import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class ParallaxDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private enabled = true;
  private scrollHandler = () => this.onScroll();

  ngOnInit() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
      return;
    }
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.onScroll();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  private onScroll() {
    if (!this.enabled) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const rate = 0.18;
    const y = -(rect.top * rate);
    this.el.nativeElement.style.transform = `translate3d(0, ${y}px, 0)`;
  }
}

