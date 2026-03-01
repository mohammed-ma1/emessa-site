import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type ScrollAnimationType =
  | 'fadeUp'
  | 'fadeIn'
  | 'scaleUp'
  | 'slideLeft'
  | 'slideRight'
  | 'clipReveal';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private scrollTrigger: ScrollTrigger | null = null;

  @Input() appScrollAnimate: number | string = 0.2;
  @Input() scrollDelay = 0;
  @Input() scrollDuration = 0.8;
  @Input() scrollEase = 'power3.out';
  @Input() scrollAnimation: ScrollAnimationType = 'fadeUp';
  @Input() scrollY = 60;
  @Input() scrollStart = 'top 88%';

  ngOnInit() {
    const element = this.el.nativeElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'none', filter: 'none' });
      return;
    }

    const threshold =
      typeof this.appScrollAnimate === 'number'
        ? this.appScrollAnimate
        : parseFloat(String(this.appScrollAnimate)) || 0.2;

    const fromVars: gsap.TweenVars = { overwrite: 'auto' };
    const toVars: gsap.TweenVars = {
      duration: this.scrollDuration,
      ease: this.scrollEase,
      delay: this.scrollDelay / 1000,
    };

    switch (this.scrollAnimation) {
      case 'fadeUp':
        fromVars.opacity = 0;
        fromVars.y = this.scrollY;
        toVars.opacity = 1;
        toVars.y = 0;
        break;
      case 'fadeIn':
        fromVars.opacity = 0;
        toVars.opacity = 1;
        break;
      case 'scaleUp':
        fromVars.opacity = 0;
        fromVars.scale = 0.96;
        toVars.opacity = 1;
        toVars.scale = 1;
        break;
      case 'slideLeft':
        fromVars.opacity = 0;
        fromVars.x = this.scrollY;
        toVars.opacity = 1;
        toVars.x = 0;
        break;
      case 'slideRight':
        fromVars.opacity = 0;
        fromVars.x = -this.scrollY;
        toVars.opacity = 1;
        toVars.x = 0;
        break;
      case 'clipReveal':
        fromVars.clipPath = 'inset(0 100% 0 0)';
        toVars.clipPath = 'inset(0 0 0 0)';
        break;
      default:
        fromVars.opacity = 0;
        fromVars.y = this.scrollY;
        toVars.opacity = 1;
        toVars.y = 0;
    }

    if (threshold > 0) {
      fromVars.opacity = typeof fromVars.opacity === 'number' ? fromVars.opacity : fromVars.opacity ?? 0;
    }

    gsap.set(element, fromVars);

    this.scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: this.scrollStart,
      onEnter: () => {
        gsap.to(element, toVars);
      },
    });
  }

  ngOnDestroy() {
    this.scrollTrigger?.kill();
  }
}

