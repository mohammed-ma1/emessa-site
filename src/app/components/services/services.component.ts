import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { StaggerChildrenDirective } from '../../directives/stagger-children.directive';
import { DrawStrokeDirective } from '../../directives/draw-stroke.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [TranslatePipe, ScrollAnimateDirective, StaggerChildrenDirective, DrawStrokeDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  scopeImages = [
    'assets/green/irrigation-sprinkler-head-spray.png',
    'assets/green/irrigation-dripline-flowerbed.png',
    'assets/green/landscaping-tree-planting-site.png',
    'assets/green/landscaping-raised-planters-grid.png',
    'assets/green/boundary-wall-split-face-textured-blocks.jpg',
    'assets/green/retaining-wall-split-face-textured-blocks-details.jpg',
    'assets/green/nursery-greenhouse-plants.png',
    'assets/green/hardscape-deck-river-stone-garden.png',
    'assets/green/outdoor-walkway-shade-sail-tower.png',
    'assets/green/landscaping-cactus-planting-grid.png',
  ];
}

