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

interface Principle {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
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
      kicker: 'Understanding the business before touching a pixel.',
      duration: 'Week 1 · ~3 hours of your time',
      accent: 'sky',
      icon: 'pi pi-compass',
      summary:
        'Before design and before code, we go deep on what makes your business tick. Who buys, why they hesitate, what competitors miss, and what a win looks like in 90 days.',
      deliverables: [
        'Free 20-min fit call',
        'Discovery workshop (60-90 min)',
        'Goal & KPI worksheet',
        'Competitor teardown',
        'Messaging hierarchy draft',
      ],
      yourJob: 'Share how your business actually works — the good, the messy, the aspirations.',
      myJob: 'Ask the questions your last web person never asked. Translate chaos into clarity.',
      artifact: {
        label: 'Discovery brief',
        lines: [
          'Primary goal · Book 12+ calls / mo',
          'ICP · NWA homeowners 35-65',
          'Proof · 14 5-star reviews',
          'Differentiator · Same-day quotes',
        ],
      },
    },
    {
      number: '02',
      title: 'Strategy',
      kicker: 'A proposal that reads like a plan, not a price list.',
      duration: 'Week 1-2 · 48-hr turnaround',
      accent: 'orange',
      icon: 'pi pi-sitemap',
      summary:
        'You get a written proposal with fixed scope, fixed price, and a real sitemap — not a template. You will know exactly what you are approving, and why.',
      deliverables: [
        'Written proposal + scope',
        'Sitemap + page outlines',
        'Tech stack & integrations plan',
        'Timeline with milestones',
        'Transparent payment schedule',
      ],
      yourJob: 'Review, push back, and approve scope. Silence = yes here kills projects.',
      myJob: 'Pre-empt every "what about…" with a written answer. No gotchas at invoice time.',
      artifact: {
        label: 'Proposal preview',
        lines: [
          'Growth package · $5,200 fixed',
          '6 pages · CRM integration · blog',
          'Launch target · Aug 14',
          '50% deposit to schedule',
        ],
      },
    },
    {
      number: '03',
      title: 'Design',
      kicker: 'Mockups that tell your story in one scroll.',
      duration: 'Week 2-3 · 2 review rounds',
      accent: 'violet',
      icon: 'pi pi-palette',
      summary:
        'High-fidelity designs in Figma for every key page. We iterate in the browser-like prototype — you click, comment, and shape it live. No more "surprise" launches.',
      deliverables: [
        'Brand direction (type, color, tone)',
        'Homepage + 2 key page mockups',
        'Responsive mobile design',
        'Interactive Figma prototype',
        'Design rationale walkthrough (recorded)',
      ],
      yourJob: 'React honestly. "I don\u2019t love it" is a gift — tell me why and we\u2019ll fix it.',
      myJob: 'Defend what serves your customer, flex on what is taste. No ego.',
      artifact: {
        label: 'Figma prototype',
        lines: [
          '✓ Hero · approved',
          '✎ Services · revision 1',
          '• Testimonials · in review',
          '• Contact · pending copy',
        ],
      },
    },
    {
      number: '04',
      title: 'Build',
      kicker: 'Engineered for speed, accessibility, and search.',
      duration: 'Week 3-5 · weekly check-ins',
      accent: 'sky',
      icon: 'pi pi-code',
      summary:
        'Your site is hand-built on a modern framework — not dragged-and-dropped. That means 90+ Lighthouse scores, clean schema, SEO that actually works, and code you can hand to anyone.',
      deliverables: [
        'Responsive build (desktop / tablet / mobile)',
        'Accessibility pass (WCAG 2.2 AA)',
        'Performance tune (Core Web Vitals)',
        'On-page SEO + schema markup',
        'Integrations wired (forms, CRM, booking)',
      ],
      yourJob: 'Send copy, photos, and feedback in weekly threads. Fast replies = fast launch.',
      myJob: 'Ship real previews every Friday. No mystery, no "agency silence".',
      artifact: {
        label: 'Lighthouse report',
        lines: [
          'Performance · 98',
          'Accessibility · 100',
          'Best practices · 100',
          'SEO · 100',
        ],
      },
    },
    {
      number: '05',
      title: 'Launch',
      kicker: 'Go-live day without white-knuckles.',
      duration: 'Launch week · structured cutover',
      accent: 'green',
      icon: 'pi pi-rocket',
      summary:
        'Launch day is a scheduled event, not a prayer. Staging → pre-flight checklist → DNS cutover → post-launch monitoring. You get a recorded training session so you actually own the thing.',
      deliverables: [
        'Full staging QA walkthrough',
        '40-point pre-launch checklist',
        'Scheduled DNS cutover',
        'Analytics + conversion tracking',
        'Recorded training for your team',
      ],
      yourJob: 'Pick a launch window, share it with customers, celebrate.',
      myJob: 'Handle the technical choreography. Stay on call for the first 48 hours.',
      artifact: {
        label: 'Launch checklist',
        lines: [
          '✓ SSL + redirects verified',
          '✓ Forms smoke-tested',
          '✓ Analytics firing',
          '✓ Backups scheduled',
        ],
      },
    },
    {
      number: '06',
      title: 'Nurture',
      kicker: 'The first 90 days are on me. After that, we grow together.',
      duration: '90-day warranty + optional care plan',
      accent: 'orange',
      icon: 'pi pi-heart',
      summary:
        'I don\u2019t disappear after launch. 90 days of warranty fixes are included with every build. From day 91, Care Plans keep you fast, secure, and evolving — or you can walk away owning everything.',
      deliverables: [
        '90-day bug-fix warranty',
        '30-day post-launch review',
        'Conversion insights report',
        'Content & SEO recommendations',
        'Optional Care Plan handoff',
      ],
      yourJob: 'Share what\u2019s working, what isn\u2019t, what customers are saying.',
      myJob: 'Tune based on real data — not assumptions — and plan the next quarter.',
      artifact: {
        label: '30-day review',
        lines: [
          '+41% form submissions',
          'Avg. session · 2m 14s',
          'Top page · /services',
          'Next · add reviews widget',
        ],
      },
    },
  ];

  protected readonly principles: readonly Principle[] = [
    {
      icon: 'pi pi-eye',
      title: 'Radical transparency',
      description:
        'Every stage has a published deliverable. No black boxes, no surprise invoices, no "just trust me".',
    },
    {
      icon: 'pi pi-calendar',
      title: 'Fixed scope & price',
      description:
        'You sign off on scope before we build. Change requests are quoted in writing — no hourly drift.',
    },
    {
      icon: 'pi pi-comments',
      title: 'Weekly real check-ins',
      description:
        'Every Friday: a Loom video or real call. You always know where we are and what is next.',
    },
    {
      icon: 'pi pi-lock',
      title: 'You own everything',
      description:
        'Code, domain, hosting, analytics, CMS — in your accounts, from day one. No vendor lock-in.',
    },
  ];
}
