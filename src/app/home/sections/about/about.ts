import { ChangeDetectionStrategy, Component } from '@angular/core';

type AboutFeatureAccent = 'sky' | 'orange' | 'violet';

interface AboutFeature {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly accent: AboutFeatureAccent;
}

interface AboutStat {
  readonly id: string;
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly profileSrc: string = '/Profile Pic.webp';
  protected readonly profileAlt: string = 'Drake, founder of Mustard Seed Solutions';

  protected readonly stats: readonly AboutStat[] = [
    {
      id: 'contact',
      value: '1',
      label: 'Point of contact — you work with me start to finish',
    },
    {
      id: 'intro',
      value: '20 min',
      label: 'Free intro — clear next step, no pressure',
    },
    {
      id: 'plan',
      value: 'Written',
      label: 'Plan before we build — scope you can review',
    },
  ];

  protected readonly features: readonly AboutFeature[] = [
    {
      id: 'build',
      title: 'Why I love building websites',
      description:
        'Fast pages, plain words, and layouts built around what you want visitors to do next—calls, signups, volunteer forms, online giving, events, or bookings. I work with small businesses, churches, nonprofits, and other teams who need a site that fits their needs.',
      icon: 'pi pi-globe',
      accent: 'orange',
    },
    {
      id: 'faith',
      title: 'Faith shapes how I build',
      description:
        "Following Jesus shapes my integrity, timelines, and follow-through. I'm grateful for clients who trust me with their story online.",
      icon: 'pi pi-heart',
      accent: 'sky',
    },
    {
      id: 'extra',
      title: 'The Extra Mile',
      description:
        "When we're close to launch and something still feels off, we polish it. You get thoroughness—not a handoff and disappear.",
      icon: 'pi pi-check-circle',
      accent: 'violet',
    },
  ];
}
