export type Round = {
  number: number;
  name: string;
  day: string;
  time: string;
  minutes: number;
  points: number;
  bonus: number;
  firstPage: number;
  lastPage: number;
  team?: boolean;
  playoffs?: boolean;
};

// Page numbers refer to the PDF, including its cover.
export const rounds: Round[] = [
  { number: 1, name: 'Raghu Clan', day: 'Thursday, 15 October', time: '09:00–10:00', minutes: 60, points: 750, bonus: 10, firstPage: 7, lastPage: 10 },
  { number: 2, name: 'Vishwamitra', day: 'Thursday, 15 October', time: '10:15–11:10', minutes: 55, points: 650, bonus: 10, firstPage: 11, lastPage: 13 },
  { number: 3, name: 'Sita', day: 'Thursday, 15 October', time: '11:25–12:00', minutes: 35, points: 400, bonus: 10, firstPage: 14, lastPage: 18 },
  { number: 4, name: 'Dasharatha’s Dilemma', day: 'Thursday, 15 October', time: '13:45–14:20', minutes: 35, points: 400, bonus: 10, firstPage: 19, lastPage: 23 },
  { number: 5, name: 'Urmila', day: 'Thursday, 15 October', time: '14:30–15:10', minutes: 40, points: 450, bonus: 10, firstPage: 24, lastPage: 27 },
  { number: 6, name: 'Agastya', day: 'Thursday, 15 October', time: '15:20–16:10', minutes: 50, points: 600, bonus: 10, firstPage: 28, lastPage: 30 },
  { number: 7, name: 'Shoorpanakha', day: 'Thursday, 15 October', time: '16:25–17:25', minutes: 60, points: 1000, bonus: 10, firstPage: 31, lastPage: 34 },
  { number: 8, name: 'Bharata’s Resolve', day: 'Thursday, 15 October', time: '17:40–18:25', minutes: 45, points: 1600, bonus: 20, firstPage: 35, lastPage: 41, team: true },
  { number: 9, name: 'Janasthana', day: 'Friday, 16 October', time: '09:00–09:45', minutes: 45, points: 600, bonus: 10, firstPage: 42, lastPage: 44 },
  { number: 10, name: 'Laxman Rekha', day: 'Friday, 16 October', time: '09:55–10:35', minutes: 40, points: 400, bonus: 7, firstPage: 45, lastPage: 47 },
  { number: 11, name: 'Shabri', day: 'Friday, 16 October', time: '10:50–11:30', minutes: 40, points: 450, bonus: 10, firstPage: 48, lastPage: 51 },
  { number: 12, name: 'Hanuman', day: 'Friday, 16 October', time: '11:40–12:15', minutes: 35, points: 300, bonus: 7, firstPage: 52, lastPage: 55 },
  { number: 13, name: 'Vali and Sugriva', day: 'Friday, 16 October', time: '14:00–14:50', minutes: 50, points: 550, bonus: 10, firstPage: 56, lastPage: 60 },
  { number: 14, name: 'Squirrel', day: 'Friday, 16 October', time: '15:00–15:20', minutes: 20, points: 200, bonus: 7, firstPage: 61, lastPage: 65 },
  { number: 15, name: 'Kumbhakarna', day: 'Friday, 16 October', time: '15:35–16:55', minutes: 80, points: 1200, bonus: 10, firstPage: 66, lastPage: 68 },
  { number: 16, name: 'Vanaras Assemble', day: 'Friday, 16 October', time: '17:20–17:55', minutes: 35, points: 1200, bonus: 40, firstPage: 69, lastPage: 72, team: true },
  { number: 17, name: 'Search for Sita', day: 'Friday, 16 October', time: '18:05–18:50', minutes: 45, points: 2000, bonus: 40, firstPage: 73, lastPage: 80, team: true },
  { number: 18, name: 'Indrajit', day: 'Saturday, 17 October', time: '09:00–09:55', minutes: 55, points: 650, bonus: 10, firstPage: 81, lastPage: 84 },
  { number: 19, name: 'Vibhishana', day: 'Saturday, 17 October', time: '10:10–10:45', minutes: 35, points: 1200, bonus: 40, firstPage: 85, lastPage: 89, team: true },
  { number: 20, name: 'Bridge to Lanka', day: 'Saturday, 17 October', time: '11:00–12:00', minutes: 60, points: 2400, bonus: 40, firstPage: 90, lastPage: 95, team: true },
  { number: 21, name: 'Sanjeevani', day: 'Saturday, 17 October', time: '13:45–14:55', minutes: 70, points: 2400, bonus: 40, firstPage: 96, lastPage: 107, team: true },
  { number: 22, name: 'Ravana', day: 'Saturday, 17 October', time: '15:30–16:30', minutes: 60, points: 800, bonus: 0, firstPage: 108, lastPage: 111, playoffs: true },
];

export const bookletUrl = '/wpc2026/WPC2026_IB_v2_20261005.pdf';
