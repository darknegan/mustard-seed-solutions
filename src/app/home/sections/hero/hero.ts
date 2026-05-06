import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal,
} from '@angular/core';
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

  /** Single phrase in DOM so width tracks copy (inline-grid stacked spans sized to longest phrase). */
  protected readonly activePhraseText = computed(
    (): string => this.rotatingPhrases[this.activePhraseIndex()],
  );

  private phraseIntervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly stats: readonly HeroStat[] = [
    { value: 'Flexible', label: 'Timeline set to your project and schedule' },
    { value: 'Quick', label: 'Speed & quality built in' },
    { value: 'Direct', label: 'You work with me from start to finish' },
    { value: 'US + remote', label: 'Arkansas-based, serving clients nationwide' },
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
