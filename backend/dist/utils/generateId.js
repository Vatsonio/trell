"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBoardId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateBoardId = () => {
    return crypto_1.default.randomBytes(8).toString('hex');
};
exports.generateBoardId = generateBoardId;
//# sourceMappingURL=generateId.js.map