export const REGISTER_USER_COMMAND: string = `
INSERT INTO auth_user (username, email, password)
VALUES($1, $2, $3) RETURNING *;
`;
