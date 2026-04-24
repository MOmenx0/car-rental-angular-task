import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, numberAttribute } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [CommonModule, TranslateModule, ButtonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  @Input({ required: true, transform: numberAttribute }) page = 1;
  @Input({ required: true, transform: numberAttribute }) lastPage = 1;

  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();

  prev() {
    if (this.disabled || this.page <= 1) return;
    this.pageChange.emit(this.page - 1);
  }

  next() {
    if (this.disabled || this.page >= this.lastPage) return;
    this.pageChange.emit(this.page + 1);
  }

  goTo(page: number) {
    if (this.disabled) return;
    if (page < 1 || page > this.lastPage) return;
    this.pageChange.emit(page);
  }

  pagesToShow() {
    const total = this.lastPage;
    const current = this.page;
    const windowSize = 5;
    const start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    const pages: number[] = [];
    for (let p = adjustedStart; p <= end; p++) pages.push(p);
    return pages;
  }
}
