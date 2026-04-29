export type Category = 'Games' | 'Surveys' | 'Apps' | 'Videos';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type TaskStatus = 'Active' | 'Pending' | 'Completed' | 'Failed';

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  country?: string;
  balance: number;
  streak: number;
  lastLogin?: string;
  createdAt: string;
  offersCompleted?: number;
  surveysCompleted?: number;
  refereeName?: string;
  referralEarnings?: number;
  usersInvited?: number;
  referrerUid?: string;
  isPrivateProfile?: boolean;
  role?: string;
  isBanned?: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  reward: number;
  status: 'credited' | 'pending' | 'rejected';
  time: string;
  type: 'earning' | 'withdrawal' | 'chargeback';
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: Category;
  imageUrl: string;
  difficulty: Difficulty;
  isFuture?: boolean;
}

export interface UserTask {
  id: string;
  userId: string;
  offerId: string;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  bgColor: string;
  url: string;
}

export interface CashoutMethod {
  id: string;
  name: string;
  logoUrl: string;
  bgColor: string;
  brandColor: string;
  minPayout: number;
  currency: string;
}
