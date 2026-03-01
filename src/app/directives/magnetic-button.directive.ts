import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appMagneticButton]',
  standalone: true,
})
export class MagneticButtonDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private enabled = true;

  ngOnInit() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
      return;
    }

    // Avoid magnetic on coarse pointers / touch.
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.enabled = false;
      return;
    }

    const btn = this.el.nativeElement;
    btn.addEventListener('mousemove', this.onMouseMove);
    btn.addEventListener('mouseleave', this.onMouseLeave);
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.enabled) return;
    const btn = this.el.nativeElement;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.24,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  private onMouseLeave = () => {
    if (!this.enabled) return;
    const btn = this.el.nativeElement;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.38,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  ngOnDestroy() {
    const btn = this.el.nativeElement;
    btn.removeEventListener('mousemove', this.onMouseMove);
    btn.removeEventListener('mouseleave', this.onMouseLeave);
  }
}

