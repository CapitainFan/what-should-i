export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const monthNames = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${time} ${month} ${day}`;
};