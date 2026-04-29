import { Offer, User, Partner, CashoutMethod } from '../types';

export const MOCK_USER: User = {
  uid: '123',
  displayName: 'Subinoy Nath',
  email: 'nathsubinoy4@gmail.com',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Subinoy',
  balance: 2450,
  streak: 12,
  createdAt: new Date().toISOString(),
};

export const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Raid: Shadow Legends',
    description: 'Install and reach level 40 within 14 days to earn massive rewards.',
    reward: 1200,
    category: 'Games',
    imageUrl: 'https://picsum.photos/seed/raid/800/600',
    difficulty: 'Hard',
  },
  {
    id: '2',
    title: 'Quick Consumer Survey',
    description: 'Share your thoughts on recent tech trends and earn coins instantly.',
    reward: 150,
    category: 'Surveys',
    imageUrl: 'https://picsum.photos/seed/survey/800/600',
    difficulty: 'Easy',
  },
  {
    id: '3',
    title: 'Duolingo Plus Trial',
    description: 'Start a free trial of Duolingo Plus and complete one lesson.',
    reward: 450,
    category: 'Apps',
    imageUrl: 'https://picsum.photos/seed/duo/800/600',
    difficulty: 'Medium',
  },
  {
    id: '4',
    title: 'Watch & Earn: Tech News',
    description: 'Watch a 5-minute video about the latest AI breakthroughs.',
    reward: 50,
    category: 'Videos',
    imageUrl: 'https://picsum.photos/seed/video/800/600',
    difficulty: 'Easy',
  },
  {
    id: '5',
    title: 'Coin Master',
    description: 'Reach Village 3 to claim your reward. New users only.',
    reward: 800,
    category: 'Games',
    imageUrl: 'https://picsum.photos/seed/coin/800/600',
    difficulty: 'Medium',
  },
  {
    id: '6',
    title: 'Spotify Premium',
    description: 'Sign up for a free trial and listen to your first playlist.',
    reward: 300,
    category: 'Apps',
    imageUrl: 'https://picsum.photos/seed/spotify/800/600',
    difficulty: 'Easy',
  },
];

export const OFFER_PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'AdGate Media',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', // Placeholder
    bgColor: 'bg-[#1b1b22]',
    url: 'https://adgatemedia.com',
  },
  {
    id: 'p2',
    name: 'Offertoro',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', // Placeholder
    bgColor: 'bg-white',
    url: 'https://offertoro.com',
  },
  {
    id: 'p3',
    name: 'Revenue Universe',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', // Placeholder
    bgColor: 'bg-blue-600',
    url: 'https://revenueuniverse.com',
  },
  {
    id: 'p4',
    name: 'Lootably',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', // Placeholder
    bgColor: 'bg-teal-500',
    url: 'https://lootably.com',
  },
];

export const SURVEY_PARTNERS: Partner[] = [
  {
    id: 's1',
    name: 'CPX Research',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg', // Placeholder
    bgColor: 'bg-teal-600',
    url: 'https://cpx-research.com',
  },
  {
    id: 's2',
    name: 'BitLabs',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg', // Placeholder
    bgColor: 'bg-[#1b1b22]',
    url: 'https://bitlabs.ai',
  },
  {
    id: 's3',
    name: 'InBrain',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', // Placeholder
    bgColor: 'bg-blue-500',
    url: 'https://inbrain.ai',
  },
  {
    id: 's4',
    name: 'Pollfish',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', // Placeholder
    bgColor: 'bg-white',
    url: 'https://pollfish.com',
  },
];

export const FUTURE_OFFERS: Offer[] = [
  {
    id: 'f1',
    title: 'Cyberpunk 2077 Mobile',
    description: 'Be the first to test the mobile version of the legendary RPG.',
    reward: 5000,
    category: 'Games',
    imageUrl: 'https://picsum.photos/seed/cyber/800/600',
    difficulty: 'Hard',
    isFuture: true,
  },
  {
    id: 'f2',
    title: 'Metaverse Explorer',
    description: 'Explore the new virtual world and complete 3 social tasks.',
    reward: 2500,
    category: 'Apps',
    imageUrl: 'https://picsum.photos/seed/meta/800/600',
    difficulty: 'Medium',
    isFuture: true,
  },
  {
    id: 'f3',
    title: 'AI Art Generator',
    description: 'Create 10 unique AI artworks and share them with the community.',
    reward: 1200,
    category: 'Apps',
    imageUrl: 'https://picsum.photos/seed/ai/800/600',
    difficulty: 'Easy',
    isFuture: true,
  },
];

export const CASHOUT_METHODS: CashoutMethod[] = [
  {
    id: 'c0',
    name: 'PayPal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    bgColor: 'bg-white',
    brandColor: '#00d074',
    minPayout: 50000,
    currency: 'USD',
  },
  {
    id: 'c1',
    name: 'Binance',
    logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=035',
    bgColor: 'bg-[#f3ba2f]',
    brandColor: '#f3ba2f',
    minPayout: 500,
    currency: 'USD',
  },
  {
    id: 'c2',
    name: 'Litecoin',
    logoUrl: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=024',
    bgColor: 'bg-[#345d9d]',
    brandColor: '#345d9d',
    minPayout: 250,
    currency: 'LTC',
  },
  {
    id: 'c3',
    name: 'Tron',
    logoUrl: 'https://cryptologos.cc/logos/tron-trx-logo.png?v=024',
    bgColor: 'bg-[#ef0027]',
    brandColor: '#ef0027',
    minPayout: 100,
    currency: 'TRX',
  },
  {
    id: 'c4',
    name: 'Bitcoin',
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024',
    bgColor: 'bg-[#f7931a]',
    brandColor: '#f7931a',
    minPayout: 2000,
    currency: 'BTC',
  },
  {
    id: 'c5',
    name: 'Dogecoin',
    logoUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=024',
    bgColor: 'bg-[#c2a633]',
    brandColor: '#c2a633',
    minPayout: 50,
    currency: 'DOGE',
  },
];
