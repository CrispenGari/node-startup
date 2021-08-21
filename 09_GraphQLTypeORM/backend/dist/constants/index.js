"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__confirm__email__prefix = exports.__reset__password__prefix = exports.__cookieName__ = exports.__secure__ = exports.__maxAge__ = exports.__secrete__ = exports.__port__ = void 0;
exports.__port__ = process.env.PORT || 3001;
exports.__secrete__ = "this_need_to_be_hidden";
exports.__maxAge__ = 1000 * 60 * 60 * 24 * 7;
exports.__secure__ = false;
exports.__cookieName__ = "user";
exports.__reset__password__prefix = "reset-password:";
exports.__confirm__email__prefix = "confirm-email:";
//# sourceMappingURL=index.js.map