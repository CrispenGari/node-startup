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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudnary_1 = require("../cloudnary");
const router = express_1.Router();
router.get("/api/all-images", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resources } = yield cloudnary_1.cloudinary.search
            .expression("folder:node_backend")
            .sort_by("public_id", "desc")
            .max_results(30)
            .execute();
        return res.status(200).json(resources);
    }
    catch (error) {
        console.log(error);
        return;
    }
}));
router.delete("/api/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.params;
        id = id.replace("-", "/");
        const results = yield cloudnary_1.cloudinary.uploader.destroy(id, {
            invalidate: true,
        });
        return res.status(201).json(results);
    }
    catch (error) {
        console.log(error);
        return;
    }
}));
router.post("/api/upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const uploadRes = yield cloudnary_1.cloudinary.uploader.upload(data, {
            public_id: Math.random().toString(),
            upload_preset: "node_backend",
        });
        return res.status(200).json(uploadRes);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: "Internal server error",
        });
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map