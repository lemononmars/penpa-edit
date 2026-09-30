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
  playoffs?: boolean;
};

// Page numbers refer to the PDF, including its cover.
export const rounds: Round[] = [
  { number: 1, name: 'Raghu Clan', day: 'Thursday, 15 October', time: '09:00–10:00', minutes: 60, points: 750, bonus: 10, firstPage: 6, lastPage: 8 },
  { number: 2, name: 'Vishwamitra', day: 'Thursday, 15 October', time: '10:15–11:10', minutes: 55, points: 650, bonus: 10, firstPage: 9, lastPage: 10 },
  { number: 3, name: 'Sita', day: 'Thursday, 15 October', time: '11:25–12:00', minutes: 35, points: 400, bonus: 10, firstPage: 11, lastPage: 14 },
  { number: 4, name: 'Dasharatha’s Dilemma', day: 'Thursday, 15 October', time: '13:45–14:20', minutes: 35, points: 400, bonus: 10, firstPage: 15, lastPage: 18 },
  { number: 5, name: 'Urmila', day: 'Thursday, 15 October', time: '14:30–15:10', minutes: 40, points: 450, bonus: 10, firstPage: 19, lastPage: 21 },
  { number: 6, name: 'Agastya', day: 'Thursday, 15 October', time: '15:20–16:10', minutes: 50, points: 600, bonus: 10, firstPage: 22, lastPage: 23 },
  { number: 7, name: 'Shoorpanakha', day: 'Thursday, 15 October', time: '16:25–17:25', minutes: 60, points: 1000, bonus: 10, firstPage: 24, lastPage: 26 },
  { number: 9, name: 'Janasthana', day: 'Friday, 16 October', time: '09:00–09:45', minutes: 45, points: 600, bonus: 10, firstPage: 27, lastPage: 28 },
  { number: 10, name: 'Laxman Rekha', day: 'Friday, 16 October', time: '09:55–10:40', minutes: 40, points: 400, bonus: 7, firstPage: 29, lastPage: 30 },
  { number: 11, name: 'Shabri', day: 'Friday, 16 October', time: '10:55–11:35', minutes: 40, points: 450, bonus: 10, firstPage: 31, lastPage: 33 },
  { number: 12, name: 'Hanuman', day: 'Friday, 16 October', time: '11:45–12:20', minutes: 35, points: 300, bonus: 7, firstPage: 34, lastPage: 36 },
  { number: 13, name: 'Vali and Sugriva', day: 'Friday, 16 October', time: '14:00–14:50', minutes: 50, points: 550, bonus: 10, firstPage: 37, lastPage: 40 },
  { number: 14, name: 'Squirrel', day: 'Friday, 16 October', time: '15:00–15:20', minutes: 20, points: 200, bonus: 7, firstPage: 41, lastPage: 44 },
  { number: 15, name: 'Kumbhakarna', day: 'Friday, 16 October', time: '15:35–16:55', minutes: 80, points: 1200, bonus: 10, firstPage: 45, lastPage: 46 },
  { number: 18, name: 'Indrajit', day: 'Saturday, 17 October', time: '09:00–09:55', minutes: 55, points: 650, bonus: 10, firstPage: 47, lastPage: 49 },
  { number: 22, name: 'Ravana', day: 'Saturday, 17 October', time: '15:15–16:15', minutes: 60, points: 800, bonus: 0, firstPage: 50, lastPage: 53, playoffs: true },
];

export const bookletUrl = '/wpc2026/WPC2026_IB_v1_20260926_Individual.pdf';
