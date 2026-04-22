import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { RatingModule } from 'primeng/rating';

interface AboutStat {
  readonly value: string;
  readonly label: string;
}

interface AboutValue {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AvatarModule, RatingModule, FormsModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly rating = 5;

  protected readonly stats: readonly AboutStat[] = [
    { value: '10+ yrs', label: 'Software engineering' },
    { value: '100%', label: 'Local & faith-rooted' },
    { value: '1:1', label: 'You talk to the builder' },
  ];

  protected readonly values: readonly AboutValue[] = [
    {
      icon: 'pi pi-heart',
      title: 'Integrity first',
      description:
        'Honest scope. Honest pricing. Honest timelines. If something changes, you hear it from me first.',
    },
    {
      icon: 'pi pi-users',
      title: 'Relationship over transaction',
      description:
        "I'd rather build one great thing for you than ten forgettable ones. I answer my own email.",
    },
    {
      icon: 'pi pi-check-circle',
      title: 'Craft that lasts',
      description:
        'Modern, accessible, fast. Built on solid foundations so your site still feels good in five years.',
    },
  ];
}
