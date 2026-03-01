import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type SplitMode = 'chars' | 'words' | 'lines';

@Directive({
  selector: '[appSplitText]',
  standalone: true,
})
export class SplitTextDirective implements AfterViewInit, OnChanges, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private scrollTrigger: ScrollTrigger | null = null;
  private viewReady = false;
  private lastSplitText: string | null = null;

  @Input() appSplitText: SplitMode = 'words';
  @Input() splitText?: string;
  @Input() splitDelay = 0.03;
  @Input() splitDuration = 0.7;
  @Input() splitY = 28;
  @Input() splitBlur = 8;
  @Input() splitEase = 'power3.out';
  @Input() useScrollTrigger = false;
  @Input() scrollTriggerStart = 'top 85%';

  ngAfterViewInit() {
    this.viewReady = true;
    queueMicrotask(() => this.splitAndAnimate());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.viewReady) return;
    if (changes['splitText'] || changes['appSplitText']) {
      queueMicrotask(() => this.splitAndAnimate());
    }
  }

  private splitAndAnimate() {
    const element = this.el.nativeElement;
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;

    const text = (this.splitText ?? element.textContent ?? '').trim();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.textContent = text;
      this.lastSplitText = text;
      return;
    }

    if (!text) return;
    if (this.lastSplitText === text && element.querySelector('.split-inner')) return;
    this.lastSplitText = text;

    element.textContent = '';

    const targets: HTMLElement[] = [];
    const mode = this.appSplitText;

    const makeInner = (content: string) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'bottom';

      const inner = document.createElement('span');
      inner.className = 'split-inner';
      inner.style.display = 'inline-block';
      inner.textContent = content;
      wrap.appendChild(inner);
      targets.push(inner);
      return wrap;
    };

    if (mode === 'chars') {
      for (const char of text) {
        element.appendChild(makeInner(char === ' ' ? '\u00A0' : char));
      }
    } else if (mode === 'words') {
      const words = text.split(/\s+/);
      words.forEach((word: string, i: number) => {
        const node = makeInner(word);
        (node as HTMLElement).style.whiteSpace = 'nowrap';
        element.appendChild(node);
        if (i < words.length - 1) element.appendChild(document.createTextNode(' '));
      });
    } else {
      const lines = text.split('\n');
      lines.forEach((line: string, i: number) => {
        const block = document.createElement('span');
        block.style.display = 'block';
        block.style.overflow = 'hidden';
        block.appendChild(makeInner(line));
        element.appendChild(block);
        if (i < lines.length - 1) element.appendChild(document.createTextNode('\n'));
      });
    }

    gsap.set(targets, {
      y: this.splitY,
      opacity: 0,
      filter: `blur(${this.splitBlur}px)`,
      willChange: 'transform, opacity, filter',
    });

    const animateIn = () => {
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: this.splitDuration,
        stagger: this.splitDelay,
        ease: this.splitEase,
        overwrite: true,
        onComplete: () => {
          targets.forEach((t) => t.style.removeProperty('will-change'));
        },
      });
    };

    if (this.useScrollTrigger) {
      this.scrollTrigger = ScrollTrigger.create({
        trigger: element,
        start: this.scrollTriggerStart,
        onEnter: animateIn,
      });
    } else {
      gsap.delayedCall(0.15, animateIn);
    }
  }

  ngOnDestroy() {
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;
  }
}

