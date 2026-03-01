import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MagneticButtonDirective } from '../../directives/magnetic-button.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe, MagneticButtonDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}

