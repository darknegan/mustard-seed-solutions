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
      tagline: 'A professional first site for new businesses or anyone replacing a DIY page.',
      price: '$2,400–$3,800',
      priceNote: 'one-time · 2–4 weeks',
      idealFor: 'Solo owners, new businesses, and anyone ready to look legit online.',
      timeline: 'Start to go-live in about 2–4 weeks',
      highlights: [
        'Clear message & simple site map',
        'Up to 5 strong pages',
        'Looks great on phones; easy to read for all visitors',
        'Contact or lead form + basic visit tracking',
      ],
      deliverables: [
        'Planning session + short brand write-up',
        'Layout sketches + one round of design',
        'Help with what to say and which reviews or proof to show',
        'Set up so Google can understand and list your pages',
        'Google Business Profile setup (when it fits your business)',
        'Launch checklist + 30 days of fixes if something is wrong',
      ],
      cta: 'Start with Launch',
      accent: 'sky',
    },
    {
      id: 'growth',
      name: 'Growth',
      tagline: 'For businesses ready to turn more site visitors into calls, leads, and bookings.',
      price: '$4,500–$7,500',
      priceNote: 'one-time · 4–8 weeks',
      idealFor: 'Established businesses investing in more leads and stronger local search.',
      timeline: 'Start to go-live in about 4–8 weeks',
      highlights: [
        'Everything in Launch',
        'Layout and flow tuned for more sign-ups and calls',
        'One key connection: booking, contacts, or email tool',
        'Stronger local search and rich results in Google',
      ],
      deliverables: [
        'Deeper look at your message and how you are positioned',
        'Reusable sections you can use across the site',
        'Booking, contacts (CRM), or email signup wired in cleanly',
        'Blog or services section set up the right way',
        'Speed tune-up for fast load times on real phones and networks',
        'Track goals (like form fills) and weekly push until launch',
      ],
      cta: 'Start with Growth',
      featured: true,
      accent: 'orange',
    },
    {
      id: 'partner',
      name: 'Partner',
      tagline: 'Heavier builds: multiple services, multiple locations, or a growing brand.',
      price: '$8,000–$12,000+',
      priceNote: 'one-time build · price matches the scope',
      idealFor: 'Multiple locations, franchises, ministries, or businesses with a lot to show.',
      timeline: 'Start to go-live in about 6–12 weeks',
      highlights: [
        'Everything in Growth',
        'Larger site structure and more custom sections',
        'Deeper connections to your tools and day-to-day workflow',
        'Ongoing reporting and help improving results after launch',
      ],
      deliverables: [
        'Workshops with everyone who needs a voice in the project',
        'A matched set of page designs and building blocks (design system)',
        'Online store or members-only area, when that is in scope',
        'Hands-on training for your team + a simple how-to for updates',
        'Quarterly planning tied to your real goals and numbers',
        'Fast response window & direct chat channel for your team',
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
      summary: 'Keep the site online, safe, and in good shape — without you having to think about it.',
      includedHours: '30 minutes / month for small text or image changes',
      responseTime: 'Within 2 business days',
      features: [
        'Hosting and security certificate (HTTPS) taken care of',
        'Backups and malware scanning on a set schedule',
        'Alerts if the site stops loading for visitors',
        'Behind-the-scenes software kept up to date',
        'Small text and image updates included',
        'A simple monthly “how is the site doing” summary',
      ],
      cta: 'Choose Essentials',
      accent: 'sky',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$279–$449',
      priceNote: '/ month',
      summary: 'Your site keeps up as your business changes — with room to try new ideas.',
      includedHours: '2 hours / month for design and build work',
      responseTime: 'Within 24 hours (business week)',
      features: [
        'Everything in Essentials',
        'New page sections and landing pages as needed',
        'Tweaks to get more people to call or fill the form, plus speed improvements',
        'A quarterly call to plan what to do next on the site',
        'Help with small wording and search (Google) improvements',
        'Support trying two versions of a key headline or button each quarter (see what works better)',
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
      summary: 'A web partner in your corner for ongoing campaigns and steady growth.',
      includedHours: '5+ hours / month of new work',
      responseTime: 'Same business day (Monday–Friday)',
      features: [
        'Everything in Pro',
        'New campaign landing pages on a regular rhythm',
        'Monthly review of who visits, what they do, and what to try next',
        'Ongoing tests to get more sign-ups, calls, and sales from the same traffic',
        'Help with email and simple automations (reminders, follow-ups, etc.)',
        'Forward-looking planning: what to build and say next',
      ],
      cta: 'Choose Growth',
      accent: 'violet',
    },
  ];

  protected readonly techPillars: readonly TechPillar[] = [
    {
      icon: 'pi pi-bolt',
      title: 'Speed that shows',
      description:
        'Images and pages are tuned to load fast on real phones and home Wi‑Fi, not just in demos — so fewer people leave before they read you.',
    },
    {
      icon: 'pi pi-lock',
      title: 'Safe & easy to use',
      description:
        'Secure hosting, an encrypted connection to visitors, spam protection, and a layout that works for people using assistive tools — not an afterthought.',
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Built to get results',
      description:
        'Every section is there for a reason: clear next steps, trust builders like reviews, and as few roadblocks as possible between “interested” and “contacting you.”',
    },
    {
      icon: 'pi pi-cog',
      title: 'Connects to your tools',
      description:
        'Payment, calendar booking, your contact list, and email — Square, Stripe, Calendly, and similar services can be connected cleanly, not tacked on at the end.',
    },
  ];

  protected readonly addOns: readonly AddOn[] = [
    {
      icon: 'pi pi-pen-to-square',
      name: 'Copywriting sprint',
      price: '+$750',
      summary: 'Polished text for up to five pages, written in your voice.',
    },
    {
      icon: 'pi pi-images',
      name: 'Local photo day',
      price: '+$600',
      summary: 'A half day of on-site photos in Northwest Arkansas so your site shows the real you, not only stock images.',
    },
    {
      icon: 'pi pi-shopping-cart',
      name: 'Online store add-on',
      price: '+$1,200',
      summary: 'Up to 25 products with checkout through Stripe or Square, plus tax and inventory where needed.',
    },
    {
      icon: 'pi pi-send',
      name: 'Welcome email series',
      price: '+$500',
      summary: 'Five follow-up emails for new sign-ups, connected to the contact or email system you use.',
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
