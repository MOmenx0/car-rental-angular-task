import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-page-shell',
  templateUrl: './page-shell.component.html'
})
export class PageShellComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
