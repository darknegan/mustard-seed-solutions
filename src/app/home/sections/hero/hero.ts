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
    'book more calls',
    'capture more leads',
    'feel unmistakably yours',
  ];

  protected readonly activePhraseIndex = signal(0);

  private phraseIntervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly stats: readonly HeroStat[] = [
    { value: '2–3 wk', label: 'Avg launch time' },
    { value: '99 / 100', label: 'Lighthouse perf' },
    { value: '100%', label: 'Human support' },
    { value: 'NWA', label: 'Local · remote-ready' },
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
