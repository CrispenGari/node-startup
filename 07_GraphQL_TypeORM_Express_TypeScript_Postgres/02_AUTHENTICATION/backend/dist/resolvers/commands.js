"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTER_USER_COMMAND = void 0;
exports.REGISTER_USER_COMMAND = `
INSERT INTO auth_user (username, email, password)
VALUES($1, $2, $3) RETURNING *;
`;
//# sourceMappingURL=commands.js.map