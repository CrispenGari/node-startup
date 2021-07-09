export const FIND_USER = (): string => {
  return `
  SELECT * FROM users WHERE username=? AND password=?;
  `;
};
