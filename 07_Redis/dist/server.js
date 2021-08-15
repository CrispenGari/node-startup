"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
const PORT = 3001 || process.env.PORT;
app.use(cors_1.default());
app.get("/", (_req, res) => {
    res.status(200).json({
        name: "backend",
        language: "typescript",
        message: "hello world!",
    });
});
app.listen(PORT, () => {
    console.log(`The server is running on port: ${PORT}`);
});
//# sourceMappingURL=server.js.map