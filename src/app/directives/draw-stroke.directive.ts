import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Directive({
  selector: '[appDrawStroke]',
  standalone: true,
})
export class DrawStrokeDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement | SVGElement>);
  private scrollTrigger: ScrollTrigger | null = null;

  /** CSS selector to pick SVG stroke elements under the host */
  @Input() drawSelector = 'path, line, polyline, polygon, circle, rect';
  @Input() drawDuration = 1.1;
  @Input() drawEase = 'power2.out';
  @Input() drawStagger = 0.08;
  @Input() drawStart = 'top 85%';
  @Input() drawOnce = true;
  @Input() drawFill = true;
  @Input() useScrollTrigger = true;

  afterSet = false;

  ngAfterViewInit() {
    queueMicrotask(() => this.setup());
  }

  private setup() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = this.el.nativeElement as Element;
    const nodes = Array.from(root.querySelectorAll(this.drawSelector)).filter((n) =>
      n instanceof SVGElement,
    ) as SVGElement[];

    if (nodes.length === 0) return;

    const geometry = nodes.filter((n): n is SVGGeometryElement => 'getTotalLength' in (n as any));
    if (geometry.length === 0) return;

    const setImmediate = () => {
      geometry.forEach((g) => {
        try {
          (g as any).style.strokeDasharray = 'none';
          (g as any).style.strokeDashoffset = '0';
          (g as any).style.opacity = '1';
          if (this.drawFill) (g as any).style.fillOpacity = '1';
        } catch {
          // ignore
        }
      });
    };

    if (prefersReducedMotion) {
      setImmediate();
      return;
    }

    const lengths = geometry.map((g) => {
      try {
        return Math.max(1, Math.ceil(g.getTotalLength()));
      } catch {
        return 1;
      }
    });

    geometry.forEach((g, i) => {
      const len = lengths[i] ?? 1;
      gsap.set(g, {
        strokeDasharray: len,
        strokeDashoffset: len,
        opacity: 1,
      });
      if (this.drawFill) {
        gsap.set(g, { fillOpacity: 0 });
      }
    });

    const animate = () => {
      gsap.to(geometry, {
        strokeDashoffset: 0,
        duration: this.drawDuration,
        ease: this.drawEase,
        stagger: this.drawStagger,
        overwrite: true,
      });
      if (this.drawFill) {
        gsap.to(geometry, {
          fillOpacity: 1,
          duration: Math.max(0.45, this.drawDuration * 0.75),
          ease: 'power2.out',
          stagger: this.drawStagger,
          delay: Math.max(0.12, this.drawDuration * 0.22),
          overwrite: true,
        });
      }
    };

    if (this.useScrollTrigger) {
      this.scrollTrigger = ScrollTrigger.create({
        trigger: root,
        start: this.drawStart,
        once: this.drawOnce,
        onEnter: animate,
      });
    } else {
      animate();
    }
  }

  ngOnDestroy() {
    this.scrollTrigger?.kill();
  }
}

