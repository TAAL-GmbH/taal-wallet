export const truncateText = (text: string, startLen = 3, endLen = 5) => {
  const glue = '...';
  if (text.length <= startLen + endLen + glue.length) {
    return text;
  }
  return `${text.slice(0, startLen)}${glue}${text.slice(endLen * -1)}`;
};
