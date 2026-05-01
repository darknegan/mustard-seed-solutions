import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface ProcessStep {
  readonly number: string;
  readonly title: string;
  readonly kicker: string;
  readonly summary: string;
  readonly duration: string;
  readonly accent: 'sky' | 'orange' | 'violet' | 'green';
  readonly icon: string;
  readonly deliverables: readonly string[];
  readonly yourJob: string;
  readonly myJob: string;
  readonly artifact: {
    readonly label: string;
    readonly lines: readonly string[];
  };
}

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [ButtonModule, TagModule, RouterLink],
  templateUrl: './process.html',
  styleUrl: './process.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessComponent {
  protected readonly steps: readonly ProcessStep[] = [
    {
      number: '01',
      title: 'Discover',
      kicker: 'We learn how you work before we design anything.',
      duration: 'Week 1 · ~3 hours of your time',
      accent: 'sky',
      icon: 'pi pi-compass',
      summary:
        'Before layouts or a single line of code, we get clear on what makes you different. Who you serve, what helps people say yes (or hesitate), what others like you are doing online, and what you want the next few months to look like if the site is doing its job.',
      deliverables: [
        'Free 20-minute intro call to see if we are a fit',
        'Guided planning session (about 60–90 minutes)',
        'Simple worksheet: goals and how we will measure them',
        'Plain-language look at others in your space',
        'First pass at your main messages: what to say, in what order',
      ],
      yourJob:
        'Share how things really run — the wins, the struggles, and where you want to go.',
      myJob: 'Ask the questions your last website person may not have asked, and turn it into a plan you can follow.',
      artifact: {
        label: 'Discovery brief',
        lines: [
          'Main goal · get 12+ calls per month',
          'Best customers · local homeowners, roughly 35–65',
          'Social proof · 14 five-star reviews',
          'Why you · same-day quotes',
        ],
      },
    },
    {
      number: '02',
      title: 'Strategy',
      kicker: 'A written plan — not a vague estimate.',
      duration: 'Week 1-2 · 48-hr turnaround',
      accent: 'orange',
      icon: 'pi pi-sitemap',
      summary:
        'You get a clear written proposal: what we will build, for what price, and what each page is for. No cookie-cutter PDF. You will know exactly what you are saying yes to, and you will not get surprise add-ons on the final bill.',
      deliverables: [
        'Written proposal with the full list of work',
        'A map of the site: pages and what each one covers',
        'List of tools we will use (and how things like forms or your calendar will connect)',
        'Timeline with key dates',
        'Simple payment plan — when each part is due',
      ],
      yourJob: 'Read it, ask questions, and say if something is wrong. Please speak up before we start building — that is when changes are easy.',
      myJob: 'Answer the “what about…” questions in writing up front, so the invoice matches what you agreed to.',
      artifact: {
        label: 'Proposal preview',
        lines: [
          'Growth package · $5,200 fixed',
          '6 pages · connect to your CRM · blog',
          'Launch target · Aug 14',
          '50% deposit to get on the calendar',
        ],
      },
    },
    {
      number: '03',
      title: 'Design',
      kicker: 'You see the site before it is built.',
      duration: 'Week 2-3 · 2 review rounds',
      accent: 'violet',
      icon: 'pi pi-palette',
      summary:
        'You get polished, full-page designs for the important screens — not a surprise on launch day. We use a click-through preview (like a test version of the site) so you can try it on your phone, leave comments, and steer the look and feel. Two rounds of revisions are built in.',
      deliverables: [
        'Look and feel: fonts, colors, and overall tone',
        'Home page plus two other key pages, designed in detail',
        'How the same pages look on a phone, not just a desktop',
        'A clickable preview you can tap through and review',
        'Short recorded walkthrough: why the design choices help people you serve',
      ],
      yourJob: 'Say what you think. “I do not love this part” helps — tell us why, and we will adjust.',
      myJob:
        'Push back on choices that would confuse or frustrate visitors, stay flexible on personal taste. No ego.',
      artifact: {
        label: 'Design preview',
        lines: [
          '✓ Top of home page · approved',
          '✎ Services page · round 1 changes',
          '• Reviews section · in review',
          '• Contact page · waiting on your text',
        ],
      },
    },
    {
      number: '04',
      title: 'Build',
      kicker: 'Fast to load, easy to read, easy to find on Google.',
      duration: 'Week 3-5 · weekly check-ins',
      accent: 'sky',
      icon: 'pi pi-code',
      summary:
        'The site is built by hand for your organization — not a generic template site builder. That means it loads quickly, works well for people who use screen readers or keyboard navigation, and is set up so search engines can understand your pages. You end up with something you can hand off to another developer later if you ever need to: clean, professional work.',
      deliverables: [
        'A site that works on computer, tablet, and phone',
        'Checked for readability and accessibility (including for visitors who rely on assistive tech)',
        'Tuned for fast load times so people do not bounce',
        'Page titles, descriptions, and behind-the-scenes tags so Google can list you properly',
        'Your forms, calendar, and day-to-day tools connected the way we planned',
      ],
      yourJob: 'Send text, photos, and feedback in our weekly check-in. Quicker answers usually mean a quicker launch.',
      myJob: 'Show you a real working preview every week. No “we are still working on it” black hole.',
      artifact: {
        label: 'Quality check',
        lines: [
          'Load speed · excellent',
          'Works with assistive tools · strong',
          'Security & good habits · in place',
          'Search-friendly setup · in place',
        ],
      },
    },
    {
      number: '05',
      title: 'Launch',
      kicker: 'Go-live on a day you pick — not a guessing game.',
      duration: 'Launch week · planned switchover',
      accent: 'green',
      icon: 'pi pi-rocket',
      summary:
        'We pick a go-live time together. First we do a final walkthrough of the “almost live” version, then a thorough checklist, then we point your web address to the new site and watch that everything works. You get a recorded how-to for your team so you are not dependent on us for every small change.',
      deliverables: [
        'Full walkthrough of the preview site before it goes public',
        'A detailed pre-launch checklist (security, forms, links, and more)',
        'Scheduled switch so your domain name points to the new site',
        'Basic visit and goal tracking set up (so you can see what is working)',
        'Recorded training: how to update text, add photos, and who to call if something breaks',
      ],
      yourJob:
        'Choose a launch window that works for you, tell people you serve if you like, and enjoy the moment.',
      myJob: 'Handle the technical switch and stay available for the first couple of days in case anything needs a tweak.',
      artifact: {
        label: 'Launch checklist',
        lines: [
          '✓ Security & redirects look good',
          '✓ Forms send where they should',
          '✓ Visit counts are working',
          '✓ Backups in place',
        ],
      },
    },
    {
      number: '06',
      title: 'Nurture',
      kicker: 'I do not vanish the day the site goes live.',
      duration: '90-day warranty + optional care plan',
      accent: 'orange',
      icon: 'pi pi-heart',
      summary:
        'Every project includes 90 days of fixes if something is wrong because of how we built it. After that, you can add an ongoing care plan (updates, security, small improvements) or simply own the site and run it yourself — your call.',
      deliverables: [
        '90 days: we fix build-related problems at no extra charge',
        'About a month after launch: a check-in on how the site is performing',
        'A short report: what people are doing on the site and what might be improved',
        'Ideas for new copy or small SEO tweaks, based on what we see',
        'Optional: handoff to a monthly care plan if you want ongoing help',
      ],
      yourJob: 'Tell us what is working, what is not, and what you are hearing from people you serve.',
      myJob: 'Adjust based on what the numbers and feedback show — not hunches — and help you plan what is next.',
      artifact: {
        label: '30-day review',
        lines: [
          '+41% more contact form uses',
          'Typical visit · about 2 min on site',
          'Most-visited page · Services',
          'Next step · add a reviews section',
        ],
      },
    },
  ];
}
