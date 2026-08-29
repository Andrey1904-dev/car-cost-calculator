export type UserName =
  | "Заяц"
  | "Зайчонок"
  | "Зайцы";

export type Category =
  | "Продукты"
  | "Фаст фуд"
  | "Фаст фуд, который приготовил заяц"
  | "Алкоголь"
  | "Сигареты"
  | "Энергетики"
  | "Транспорт"
  | "Дом"
  | "Одежда"
  | "PlayStation 5 PRO"
  | "Подписка на VPN анти руки загребуки"
  | "Кредиты"
  | "Другое";

export type Expense = {
  id: number;
  userName: UserName;
  amount: number;
  category: Category;
  date: string;
  comment: string;
};

export const categories: Category[] = [
  "Продукты",
  "Фаст фуд",
  "Фаст фуд, который приготовил заяц",
  "Алкоголь",
  "Сигареты",
  "Энергетики",
  "Транспорт",
  "Дом",
  "Одежда",
  "PlayStation 5 PRO",
  "Подписка на VPN анти руки загребуки",
  "Кредиты",
  "Другое",
];

export const categoryIcons: Record<Category, string> = {
  Продукты: "🛒",
  "Фаст фуд": "🍟",
  "Фаст фуд, который приготовил заяц": "🐰",
  Алкоголь: "🍺",
  Сигареты: "🚬",
  Энергетики: "⚡",
  Транспорт: "🚗",
  Дом: "🏠",
  Одежда: "👕",
  "PlayStation 5 PRO": "🎮",
  "Подписка на VPN анти руки загребуки": "🔐",
  Кредиты: "😡",
  Другое: "💰",
};

export const userIcons: Record<UserName, string> = {
  Заяц: "🦊",
  Зайчонок: "🐇",
  Зайцы: "🐰",
};