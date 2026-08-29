export const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getMonthPrefix(
  year: number,
  month: number,
) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}