import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AboutFeature {
  readonly title: string;
  readonly description: string;
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

  protected readonly features: readonly AboutFeature[] = [
    {
      title: 'Why I love building websites',
      description:
        'Fast pages, plain words, and layouts built around what you want visitors to do next—calls, signups, volunteer forms, online giving, events, or bookings. I work with small businesses, churches, nonprofits, and other teams who need a site that fits their needs.',
    },
    {
      title: 'Faith shapes how I build',
      description:
        "Following Jesus shapes my integrity, timelines, and follow-through. I'm grateful for clients who trust me with their story online.",
    },
    {
      title: 'The Extra Mile',
      description:
        "When we're close to launch and something still feels off, we polish it. You get thoroughness—not a handoff and disappear.",
    },
  ];
}
