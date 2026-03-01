import { Component, ElementRef, AfterViewInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { gsap } from 'gsap';
import { MagneticButtonDirective } from '../../directives/magnetic-button.directive';
import { SplitTextDirective } from '../../directives/split-text.directive';
import { DrawStrokeDirective } from '../../directives/draw-stroke.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslatePipe, MagneticButtonDirective, SplitTextDirective, DrawStrokeDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit() {
    this.animateIntro();
  }

  private animateIntro() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = this.el.nativeElement;

    const media = root.querySelector('.hero__media') as HTMLElement | null;
    const mediaOverlay = root.querySelector('.hero__overlay') as HTMLElement | null;
    const blueprint = root.querySelector('.hero__blueprint') as HTMLElement | null;
    const chips = root.querySelectorAll('.hero__chip');
    const ctas = root.querySelector('.hero__cta') as HTMLElement | null;
    const promise = root.querySelector('.hero__promise') as HTMLElement | null;

    if (!media || !mediaOverlay || !blueprint || !ctas) return;

    gsap.set(media, { clipPath: 'inset(12% 14% 12% 14% round 22px)', scale: 1.06, opacity: 0.92 });
    gsap.set(mediaOverlay, { opacity: 0 });
    gsap.set(blueprint, { opacity: 1 });
    gsap.set(chips, { y: 14, opacity: 0 });
    if (promise) gsap.set(promise, { y: 14, opacity: 0 });
    gsap.set(ctas, { y: 16, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(media, {
      clipPath: 'inset(0% 0% 0% 0% round 26px)',
      scale: 1,
      opacity: 1,
      duration: 1.05,
    })
      .to(mediaOverlay, { opacity: 1, duration: 0.6 }, '-=0.7')
      .to(
        chips,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
        },
        '-=0.55',
      )
      .to(promise, { opacity: 1, y: 0, duration: 0.55 }, '-=0.45')
      .to(ctas, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .to(blueprint, { opacity: 0.0, duration: 0.65 }, '-=0.55');
  }
}

