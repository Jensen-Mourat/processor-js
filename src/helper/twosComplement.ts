export const convertToTwosComp = (s: string) => {
  const hex = parseInt(s, 16);
  const maxHex = parseInt('ffffffff', 16);
  return (maxHex - hex + 1).toString(16).padStart(8, '0');
};
