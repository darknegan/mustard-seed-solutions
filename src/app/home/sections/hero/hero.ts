import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface HeroStat {
  readonly value: string;
  readonly label: string;
}

interface OrbitChip {
  readonly label: string;
  readonly icon: string;
  readonly orbit: 'inner' | 'mid' | 'outer';
  readonly angle: number;
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
    'outrank the template crowd',
  ];

  protected readonly activePhraseIndex = signal(0);

  private phraseIntervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly stats: readonly HeroStat[] = [
    { value: '2–3 wk', label: 'Avg launch time' },
    { value: '99 / 100', label: 'Lighthouse perf' },
    { value: '100%', label: 'Human support' },
    { value: 'NWA', label: 'Local · remote-ready' },
  ];

  protected readonly orbitChips: readonly OrbitChip[] = [
    { label: 'Lead capture', icon: 'pi pi-bolt', orbit: 'inner', angle: 18 },
    { label: 'Local SEO', icon: 'pi pi-map-marker', orbit: 'inner', angle: 198 },
    { label: 'Booking flow', icon: 'pi pi-calendar-plus', orbit: 'mid', angle: 72 },
    { label: 'Fast hosting', icon: 'pi pi-server', orbit: 'mid', angle: 214 },
    { label: 'Accessibility', icon: 'pi pi-eye', orbit: 'outer', angle: 42 },
    { label: 'Analytics', icon: 'pi pi-chart-line', orbit: 'outer', angle: 160 },
    { label: 'CRM sync', icon: 'pi pi-sync', orbit: 'outer', angle: 280 },
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

  protected chipStyle(chip: OrbitChip): Record<string, string> {
    const radius = chip.orbit === 'inner' ? 175 : chip.orbit === 'mid' ? 235 : 290;
    const rad = (chip.angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return {
      transform: `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0)`,
    };
  }

}
