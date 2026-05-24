export type IssueStatus = 'green' | 'yellow' | 'red' | 'resolved'; // Green: New, Yellow: Pending, Red: Overdue
export type IssueCategory = 'water' | 'sanitation' | 'roads' | 'electricity' | 'certificates' | 'other';

export interface Issue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporter: string;
  reporterId?: string;
  upvotes: number;
  status: IssueStatus;
  reportedAt: string; // ISO string
  resolvedAt?: string;
  issueImageUrl?: string;
  proofImageUrl?: string;
  escalated: boolean;
  escalatedTo?: string;
}

export interface FinanceEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
  status: 'allocated' | 'spent';
  project: string;
}

export type ViewState = 'citizen' | 'sarpanch' | 'finance' | 'leaderboard' | 'season';
