import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  standalone: true,
  selector: 'app-data-state',
  imports: [CommonModule, TranslateModule, SkeletonModule],
  templateUrl: './data-state.component.html'
})
export class DataStateComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() empty = false;
  @Input() emptyTextKey = 'common.noData';
  @Input() skeletonRows = 4;

  skeletonRowsArray() {
    return Array.from({ length: this.skeletonRows }, (_, i) => i);
  }
}
