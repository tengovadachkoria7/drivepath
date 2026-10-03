export interface RouteTip {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'stop';
}

export interface DrivingRoute {
  id: string;
  name: string;
  description: string;
  distance: string;
  duration: string;
  difficulty: 'ადვილი' | 'საშუალო' | 'რთული';
  coordinates: [number, number][];
  tips: RouteTip[];
}

export const OZURGETI_ROUTES: DrivingRoute[] = [
  {
    id: 'route-1',
    name: 'მარშრუტი 1 - ცენტრალური წრე',
    description: 'ჭანტურიასა და გაბრიელ ეპისკოპოსის ქუჩების ცენტრალური მონაკვეთი.',
    distance: '3.2 კმ',
    duration: '10-12 წუთი',
    difficulty: 'საშუალო',
    coordinates: [
      [41.9961, 41.9248], [41.9975, 41.9256], [41.9990, 41.9270],
      [42.0015, 41.9271], [42.0030, 41.9260], [42.0010, 41.9240],
      [41.9961, 41.9248]
    ],
    tips: [
      { id: 't1', title: 'STOP ნიშანი', description: 'მოედნიდან გამოსვლისას აუცილებლად სრული გაჩერება 3 წამით.', type: 'stop' },
      { id: 't2', title: 'ქვეითთა გადასასვლელი', description: 'სკოლასთან ახლოს შეანელეთ სიჩქარე 30 კმ/სთ-მდე.', type: 'warning' }
    ]
  },
  {
    id: 'route-2',
    name: 'მარშრუტი 2 - თაყაიშვილის ქუჩა',
    description: 'ექვთიმე თაყაიშვილის ქუჩიდან აღმაშენებლის გამზირის მიმართულებით.',
    distance: '4.5 კმ',
    duration: '15 წუთი',
    difficulty: 'რთული',
    coordinates: [
      [41.9910, 41.9210], [41.9940, 41.9230], [41.9970, 41.9250],
      [42.0005, 41.9280], [42.0040, 41.9300]
    ],
    tips: [
      { id: 't3', title: 'მარცხნივ მოხვევა', description: 'დაუთმეთ გზა საპირისპიროდ მომავალ ტრანსპორტს.', type: 'warning' },
      { id: 't4', title: 'სიჩქარის შეზღუდვა', description: 'მაქსიმალური დაშვებული სიჩქარე 40 კმ/სთ.', type: 'info' }
    ]
  },
  {
    id: 'route-3',
    name: 'მარშრუტი 3 - სადგურის ზონა',
    description: 'რკინიგზის სადგურის მიმდებარე ტერიტორია და გურიის ქუჩა.',
    distance: '2.8 კმ',
    duration: '8-10 წუთი',
    difficulty: 'ადვილი',
    coordinates: [
      [41.9890, 41.9190], [41.9920, 41.9205], [41.9950, 41.9220],
      [41.9961, 41.9248]
    ],
    tips: [
      { id: 't5', title: 'რკინიგზის გადასასვლელი', description: 'ყურადღება მიაქციეთ შუქნიშანს და ბარიერს.', type: 'stop' }
    ]
  }
];