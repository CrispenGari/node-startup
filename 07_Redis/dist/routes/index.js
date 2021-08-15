"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = __importDefault(require("redis"));
const axios_1 = __importDefault(require("axios"));
const MAX_AGE = 60 * 60;
const axios = axios_1.default.create({
    baseURL: "https://jsonplaceholder.typicode.com/",
});
const client = redis_1.default.createClient();
const router = express_1.Router();
router.get("/photos", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fetchData(`photos`, () => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield axios.get("photos/");
        return data;
    }));
    return res.status(200).json(data);
}));
router.get("/photo/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = yield fetchData(`photo:${id}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const { data } = yield axios.get("photos/" + id);
        return data;
    }));
    return res.status(200).json(data);
}));
const fetchData = (key, cb) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        yield client.get(key, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return reject(error);
            }
            if (Boolean(data)) {
                return resolve(JSON.parse(String(data)));
            }
            else {
                const data = yield cb();
                yield client.setex(key, MAX_AGE, JSON.stringify(data, null, 2));
                return resolve(JSON.parse(JSON.stringify(data, null, 2)));
            }
        }));
    }));
};
exports.default = router;
//# sourceMappingURL=index.js.map