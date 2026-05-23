import { Issue, FinanceEntry } from './types';

export const mockIssues: Issue[] = [
  {
    id: 'TKT-001',
    title: 'Broken Hand Pump in Ward 4',
    category: 'water',
    description: 'The main hand pump near the primary school is not working for the last 3 days.',
    location: 'Ward 4, Near School',
    reporter: '98765XXXXX',
    upvotes: 12,
    status: 'red',
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    escalated: false,
  },
  {
    id: 'TKT-002',
    title: 'Streetlight dead at Main Chauraha',
    category: 'electricity',
    description: 'Streetlight pole #12 is not turning on.',
    location: 'Main Chauraha',
    reporter: '91234XXXXX',
    upvotes: 4,
    status: 'yellow',
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    escalated: false,
  },
  {
    id: 'TKT-003',
    title: 'Caste Certificate Request',
    category: 'certificates',
    description: 'Applied for caste certificate for school admission.',
    location: 'Ward 2',
    reporter: '99887XXXXX',
    upvotes: 0,
    status: 'green',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    escalated: false,
  },
  {
    id: 'TKT-004',
    title: 'Drainage choked near Market',
    category: 'sanitation',
    description: 'Foul smell and overflowing water from the main drain.',
    location: 'Weekly Market Area',
    reporter: '94567XXXXX',
    upvotes: 25,
    status: 'red',
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    escalated: true,
  },
  {
    id: 'TKT-005',
    title: 'Pothole on access road',
    category: 'roads',
    description: 'Large pothole causing accidents.',
    location: 'Village Entry Road',
    reporter: '98888XXXXX',
    upvotes: 2,
    status: 'resolved',
    reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    proofImageUrl: 'https://images.unsplash.com/photo-1541888040058-005809633e70?q=80&w=200&auto=format&fit=crop',
    escalated: false,
  }
];

export const mockLedger: FinanceEntry[] = [
  { id: 'FIN-101', category: '15th FC Grants', amount: 500000, date: '2023-04-10', status: 'allocated', project: 'Panchayat Fund' },
  { id: 'FIN-102', category: 'MGNREGA Wages', amount: -120000, date: '2023-05-15', status: 'spent', project: 'Pond Digging' },
  { id: 'FIN-103', category: 'Sanitation', amount: -45000, date: '2023-06-02', status: 'spent', project: 'Drain Cleaning' },
  { id: 'FIN-104', category: 'Solar Lights', amount: -80000, date: '2023-07-20', status: 'spent', project: 'Street Lighting' },
  { id: 'FIN-105', category: 'State Govt Scheme', amount: 300000, date: '2023-08-01', status: 'allocated', project: 'Road Repair' },
  { id: 'FIN-106', category: 'Roads', amount: -150000, date: '2023-09-10', status: 'spent', project: 'Village Entry Road' }
];
