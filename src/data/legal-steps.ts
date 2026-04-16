export interface LegalStep {
  key: string;
  number: number;
  title: string;
  shortTitle: string;
  path: string;
  icon: string;
  color: string;
  description: string;
}

export const LEGAL_STEPS: LegalStep[] = [
  {
    key: 'structure',
    number: 1,
    title: 'Choose Your Business Structure',
    shortTitle: 'Structure',
    path: '/legal/structure',
    icon: 'building',
    color: '#2979FF',
    description: 'LLC vs Sole Proprietor vs S-Corp — find the right fit.',
  },
  {
    key: 'form-llc',
    number: 2,
    title: 'Form Your LLC',
    shortTitle: 'Form LLC',
    path: '/legal/form-llc',
    icon: 'file-check',
    color: '#06D6A0',
    description: 'File your paperwork and make it official.',
  },
  {
    key: 'ein',
    number: 3,
    title: 'Get Your EIN',
    shortTitle: 'EIN',
    path: '/legal/ein',
    icon: 'hash',
    color: '#FF6B35',
    description: 'Your business\'s social security number — free from the IRS.',
  },
  {
    key: 'bank',
    number: 4,
    title: 'Open a Business Bank Account',
    shortTitle: 'Bank Account',
    path: '/legal/bank',
    icon: 'landmark',
    color: '#1877F2',
    description: 'Separate personal and business finances.',
  },
  {
    key: 'insurance',
    number: 5,
    title: 'Get Business Insurance',
    shortTitle: 'Insurance',
    path: '/legal/insurance',
    icon: 'shield-check',
    color: '#E1306C',
    description: 'Protect yourself and your business from day one.',
  },
  {
    key: 'licenses',
    number: 6,
    title: 'Local Licenses & Permits',
    shortTitle: 'Licenses',
    path: '/legal/licenses',
    icon: 'scroll-text',
    color: '#8B5CF6',
    description: 'Check what your city, county, and state require.',
  },
];

export const NORTHWEST_LINK = '{{NORTHWEST_AFFILIATE_LINK}}';
export const BLUEVINE_LINK = '{{BLUEVINE_LINK}}';
export const MERCURY_LINK = '{{MERCURY_LINK}}';
export const RELAY_LINK = '{{RELAY_LINK}}';
export const NEXT_INSURANCE_LINK = '{{NEXT_INSURANCE_LINK}}';
export const THIMBLE_LINK = '{{THIMBLE_LINK}}';
