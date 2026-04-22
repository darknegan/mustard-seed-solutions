import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

type SolutionMode = 'build' | 'care';

interface PackageTier {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly price: string;
  readonly priceNote: string;
  readonly highlights: readonly string[];
  readonly deliverables: readonly string[];
  readonly idealFor: string;
  readonly timeline: string;
  readonly cta: string;
  readonly featured?: boolean;
  readonly accent: 'sky' | 'orange' | 'violet';
}

interface CarePlanTier {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly priceNote: string;
  readonly summary: string;
  readonly features: readonly string[];
  readonly includedHours: string;
  readonly responseTime: string;
  readonly cta: string;
  readonly recommended?: boolean;
  readonly accent: 'sky' | 'orange' | 'violet';
}

interface TechPillar {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface AddOn {
  readonly icon: string;
  readonly name: string;
  readonly price: string;
  readonly summary: string;
}

@Component({
  selector: 'app-solutions',
  standalone: true,
  imports: [ButtonModule, TagModule],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsComponent {
  protected readonly mode = signal<SolutionMode>('build');

  protected readonly packages: readonly PackageTier[] = [
    {
      id: 'launch',
      name: 'Launch',
      tagline: 'A credible, conversion-ready first site for new or pivoting businesses.',
      price: '$2,400–$3,800',
      priceNote: 'one-time · 2–4 weeks',
      idealFor: 'Solo founders, new LLCs, and owners ready to replace a DIY site.',
      timeline: 'Kickoff → Launch in 14–28 days',
      highlights: [
        'Clear messaging & sitemap',
        'Up to 5 optimized pages',
        'Mobile-first, WCAG AA ready',
        'Lead-capture form + analytics',
      ],
      deliverables: [
        'Discovery workshop + brand brief',
        'Wireframes + 1 design round',
        'Copy guidance & proof framework',
        'On-page SEO foundation',
        'Google Business Profile setup',
        'Launch checklist + 30-day warranty',
      ],
      cta: 'Start with Launch',
      accent: 'sky',
    },
    {
      id: 'growth',
      name: 'Growth',
      tagline: 'Turn existing traffic into booked calls, form leads, and reservations.',
      price: '$4,500–$7,500',
      priceNote: 'one-time · 4–8 weeks',
      idealFor: 'Established owners ready to invest in conversion and local dominance.',
      timeline: 'Kickoff → Launch in 4–8 weeks',
      highlights: [
        'Everything in Launch',
        'Conversion-focused architecture',
        'One automation/integration',
        'Local SEO + schema markup',
      ],
      deliverables: [
        'Messaging audit & positioning session',
        'Custom section library',
        'Booking, CRM, or email capture integration',
        'Blog or services library setup',
        'Core Web Vitals optimization',
        'Goal tracking + weekly launch sprints',
      ],
      cta: 'Start with Growth',
      featured: true,
      accent: 'orange',
    },
    {
      id: 'partner',
      name: 'Partner',
      tagline: 'A fractional web team for multi-service, multi-location, or scaling brands.',
      price: '$8,000–$12,000+',
      priceNote: 'one-time build · scoped to goals',
      idealFor: 'Multi-location, franchise, ministry, or product-led businesses.',
      timeline: 'Kickoff → Launch in 6–12 weeks',
      highlights: [
        'Everything in Growth',
        'Expanded site architecture',
        'Advanced integrations & automations',
        'Reporting & optimization support',
      ],
      deliverables: [
        'Multi-stakeholder workshops',
        'Custom design system + component library',
        'E-commerce or member portal buildout',
        'Staff training + documentation',
        'Quarterly roadmap & OKR alignment',
        'Priority SLA & dedicated Slack channel',
      ],
      cta: 'Talk about Partner',
      accent: 'violet',
    },
  ];

  protected readonly carePlans: readonly CarePlanTier[] = [
    {
      id: 'essentials',
      name: 'Essentials',
      price: '$129–$229',
      priceNote: '/ month',
      summary: 'Keep it live, secure, and healthy — so you never wonder.',
      includedHours: '30 min / month of edits',
      responseTime: 'Response within 2 business days',
      features: [
        'Managed hosting & SSL',
        'Weekly backups + malware scans',
        '24/7 uptime monitoring',
        'Plugin & framework updates',
        'Small copy + image edits',
        'Monthly health report',
      ],
      cta: 'Choose Essentials',
      accent: 'sky',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$279–$449',
      priceNote: '/ month',
      summary: 'Your site as a living asset — evolving with your business.',
      includedHours: '2 hrs / month of design & dev',
      responseTime: 'Priority 24-hr response',
      features: [
        'Everything in Essentials',
        'New sections & landing modules',
        'Conversion & speed tune-ups',
        'Quarterly strategy check-in',
        'Content + SEO tweaks',
        'A/B test support (1 / quarter)',
      ],
      cta: 'Choose Pro',
      recommended: true,
      accent: 'orange',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$499–$899+',
      priceNote: '/ month',
      summary: 'A retained web partner on call for ongoing campaigns & revenue.',
      includedHours: '5+ hrs / month of new work',
      responseTime: 'Same-day response Mon–Fri',
      features: [
        'Everything in Pro',
        'New landing pages for campaigns',
        'Monthly analytics + insights',
        'Ongoing CRO experiments',
        'Email / automation support',
        'Roadmap reviews + strategic planning',
      ],
      cta: 'Choose Growth',
      accent: 'violet',
    },
  ];

  protected readonly techPillars: readonly TechPillar[] = [
    {
      icon: 'pi pi-bolt',
      title: 'Performance first',
      description:
        'Built on modern frameworks and image pipelines to hit 95+ Core Web Vitals — Google and visitors notice.',
    },
    {
      icon: 'pi pi-lock',
      title: 'Secure & accessible',
      description:
        'WCAG 2.2 AA targets, hardened hosting, SSL, spam defense, and dependency monitoring by default.',
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Conversion engineered',
      description:
        'Every section earns its place. CTAs, proof, and friction audits are part of the build — not an afterthought.',
    },
    {
      icon: 'pi pi-cog',
      title: 'Real integrations',
      description:
        'Square, Stripe, Calendly, HubSpot, Mailchimp, Zapier — wired cleanly into your business, not bolted on.',
    },
  ];

  protected readonly addOns: readonly AddOn[] = [
    {
      icon: 'pi pi-pen-to-square',
      name: 'Copywriting sprint',
      price: '+$750',
      summary: 'Professionally written copy for up to 5 pages, rooted in your voice.',
    },
    {
      icon: 'pi pi-images',
      name: 'Local photo day',
      price: '+$600',
      summary: 'Half-day branded photography on-site in NWA — no stock needed.',
    },
    {
      icon: 'pi pi-shopping-cart',
      name: 'E-commerce module',
      price: '+$1,200',
      summary: 'Up to 25 products, Stripe/Square checkout, taxes, inventory.',
    },
    {
      icon: 'pi pi-send',
      name: 'Email nurture sequence',
      price: '+$500',
      summary: '5-email welcome flow + automation wired to your CRM of choice.',
    },
  ];

  protected readonly activeList = computed(() =>
    this.mode() === 'build' ? this.packages : this.carePlans,
  );

  protected setMode(mode: SolutionMode): void {
    this.mode.set(mode);
  }

  protected isBuild(): boolean {
    return this.mode() === 'build';
  }
}
