import { company } from '@/config/company';

const contactLine = `${company.contact.email} or ${company.contact.phone1}`;

export const privacyPolicy = {
  title: 'Privacy Policy',
  description:
    'This policy explains how Joseph Bezzina & Co. Ltd collects, uses, and protects personal data when you use our website and services.',
  lastUpdated: '12 July 2026',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        `${company.name} (${company.registrationNumber}) is the data controller for personal data collected through jbezzina.store and related customer services.`,
        `Registered address: ${company.address.line1}, ${company.address.city}, ${company.address.postalCode}, ${company.address.country}.`,
      ],
    },
    {
      title: 'Data we collect',
      paragraphs: ['We may collect the following categories of personal data:'],
      list: [
        'Identity and contact details (name, email, phone, company name)',
        'Account and order information when you register or purchase',
        'Quote requests and enquiry messages',
        'Technical data such as IP address, browser type, and usage logs',
        'Career application details and CV uploads',
      ],
    },
    {
      title: 'How we use your data',
      paragraphs: ['We process personal data to:'],
      list: [
        'Respond to enquiries, quotations, and orders',
        'Provide customer account and checkout services',
        'Improve website performance and security',
        'Comply with legal and accounting obligations',
      ],
    },
    {
      title: 'Legal basis',
      paragraphs: [
        'We rely on contract performance, legitimate business interests, consent (where required), and legal obligation under applicable EU and Maltese data protection law.',
      ],
    },
    {
      title: 'Data sharing',
      paragraphs: [
        'We may share data with service providers such as hosting, email delivery, payment processors, and authentication providers where necessary to operate the website. We do not sell personal data.',
      ],
    },
    {
      title: 'Retention',
      paragraphs: [
        'We retain personal data only for as long as needed for the purposes described above, including legal, tax, and audit requirements.',
      ],
    },
    {
      title: 'Your rights',
      paragraphs: [
        'You may request access, correction, deletion, restriction, or portability of your personal data, and object to certain processing. Contact us to exercise your rights.',
        `Email or phone: ${contactLine}.`,
      ],
    },
    {
      title: 'Contact',
      paragraphs: [
        'For privacy questions or requests, contact us using the details above. You may also lodge a complaint with the Office of the Information and Data Protection Commissioner in Malta.',
      ],
    },
  ],
};

export const termsOfService = {
  title: 'Terms of Service',
  description:
    'These terms govern use of the Joseph Bezzina & Co. Ltd website and online services.',
  lastUpdated: '12 July 2026',
  sections: [
    {
      title: 'Use of the website',
      paragraphs: [
        'By accessing this website you agree to use it lawfully and not to disrupt, damage, or attempt unauthorised access to our systems or data.',
      ],
    },
    {
      title: 'Product information',
      paragraphs: [
        'Catalogue content, specifications, availability, and pricing are provided for business reference. We endeavour to keep information accurate but do not guarantee that all details are complete or current at all times.',
      ],
    },
    {
      title: 'Quotations and orders',
      paragraphs: [
        'Quote requests are non-binding until confirmed in writing. Orders are subject to stock availability, verification, and our standard commercial terms.',
      ],
    },
    {
      title: 'Accounts',
      paragraphs: [
        'You are responsible for safeguarding your account credentials and for activity under your account. We may suspend accounts involved in misuse or fraud.',
      ],
    },
    {
      title: 'Intellectual property',
      paragraphs: [
        'Website content, branding, and materials are owned by or licensed to Joseph Bezzina & Co. Ltd and may not be copied or reused without permission.',
      ],
    },
    {
      title: 'Limitation of liability',
      paragraphs: [
        'To the extent permitted by law, we are not liable for indirect or consequential loss arising from website use. Nothing in these terms limits liability where it cannot be excluded by law.',
      ],
    },
    {
      title: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of Malta. Disputes are subject to the jurisdiction of the Maltese courts unless mandatory consumer rights apply.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [`Questions about these terms: ${contactLine}.`],
    },
  ],
};

export const cookiePolicy = {
  title: 'Cookie Policy',
  description: 'How Joseph Bezzina & Co. Ltd uses cookies and similar technologies on this website.',
  lastUpdated: '12 July 2026',
  sections: [
    {
      title: 'What are cookies?',
      paragraphs: [
        'Cookies are small text files stored on your device to help websites function, remember preferences, and understand usage.',
      ],
    },
    {
      title: 'Cookies we use',
      paragraphs: ['We use the following types of cookies:'],
      list: [
        'Strictly necessary cookies for authentication, session security, and checkout',
        'Preference cookies such as cookie consent choice',
        'Functional cookies for cart, wishlist, and quote cart state',
        'Analytics cookies only if enabled in future with consent',
      ],
    },
    {
      title: 'Managing cookies',
      paragraphs: [
        'You can accept or decline non-essential cookies using the banner on first visit. You can also control cookies through your browser settings.',
        'Blocking necessary cookies may affect login, checkout, and quote functionality.',
      ],
    },
    {
      title: 'Updates',
      paragraphs: [
        'We may update this policy when our website or legal requirements change. The latest version will always be published on this page.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [`Cookie questions: ${contactLine}.`],
    },
  ],
};
