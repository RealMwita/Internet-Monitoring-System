import { UpperCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './status-card.html',
  styleUrl: './status-card.css',
})
export class StatusCardComponent {
  readonly label = input('Status');
  readonly status = input.required<string>();
  readonly description = input('');

  readonly tone = computed(() => {
    const value = this.status().toLowerCase();
    if (value.includes('active') || value.includes('success')) return 'success';
    if (value.includes('pending') || value.includes('waiting')) return 'pending';
    if (value.includes('expired') || value.includes('failed')) return 'danger';
    return 'neutral';
  });
}

