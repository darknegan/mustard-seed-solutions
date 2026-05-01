import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface HeroStat {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy {
  protected readonly rotatingPhrases: readonly string[] = [
    'earn trust',
    'load fast',
    'welcome visitors',
    "show what's next",
  ];

  protected readonly activePhraseIndex = signal(0);

  private phraseIntervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly stats: readonly HeroStat[] = [
    { value: '2–3 wk', label: 'Typical go-live time' },
    { value: 'Quick', label: 'Speed & quality built in' },
    { value: '100%', label: 'You talk to a person' },
    { value: 'NWA', label: 'Local · works with remote clients' },
  ];

  ngOnInit(): void {
    this.phraseIntervalId = setInterval(() => {
      this.activePhraseIndex.update((i) => (i + 1) % this.rotatingPhrases.length);
    }, 2600);
  }

  ngOnDestroy(): void {
    if (this.phraseIntervalId !== null) {
      clearInterval(this.phraseIntervalId);
    }
  }
}
