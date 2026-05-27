import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-wc-logo',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 64 64"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fcd34d"/>
          <stop offset="50%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#15803d"/>
        </linearGradient>
      </defs>
      <!-- copa principal -->
      <path d="M18 6 C18 6 22 4 32 4 C42 4 46 6 46 6 L44 26 C44 32 38 38 32 38 C26 38 20 32 20 26 Z"
            fill="url(#gold)" stroke="#a16207" stroke-width="0.5"/>
      <!-- asas -->
      <path d="M18 10 Q11 12 11 20 Q11 26 18 26" fill="none" stroke="url(#gold)" stroke-width="3"/>
      <path d="M46 10 Q53 12 53 20 Q53 26 46 26" fill="none" stroke="url(#gold)" stroke-width="3"/>
      <!-- cintura -->
      <rect x="26" y="38" width="12" height="5" fill="url(#gold)" stroke="#a16207" stroke-width="0.5"/>
      <!-- base anillo verde superior -->
      <rect x="22" y="43" width="20" height="4" fill="url(#green)"/>
      <!-- base dorado intermedia -->
      <rect x="20" y="47" width="24" height="3" fill="url(#gold)"/>
      <!-- base anillo verde inferior -->
      <rect x="18" y="50" width="28" height="5" fill="url(#green)"/>
      <!-- pie -->
      <ellipse cx="32" cy="56" rx="16" ry="2.5" fill="#15803d"/>
    </svg>
  `,
    styles: [`
    :host {
      display: inline-flex;
      line-height: 0;
      vertical-align: middle;
    }
  `]
})
export class WcLogoComponent {
    readonly size = input(28);
}
