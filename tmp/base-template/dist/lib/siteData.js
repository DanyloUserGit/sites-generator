"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteData = getSiteData;
exports.getAllSlugs = getAllSlugs;
exports.getPageByName = getPageByName;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataFilePath = path_1.default.join(process.cwd(), 'data.json');
let cachedData = null;
function readJson() {
    if (cachedData)
        return cachedData;
    if (!fs_1.default.existsSync(dataFilePath)) {
        throw new Error(`data.json not found at ${dataFilePath}`);
    }
    const raw = fs_1.default.readFileSync(dataFilePath, 'utf-8');
    try {
        const parsed = JSON.parse(raw);
        cachedData = parsed;
        return parsed;
    }
    catch (err) {
        throw new Error('Invalid JSON structure in data.json' + err);
    }
}
function getSiteData() {
    return readJson();
}
function getAllSlugs() {
    const data = getSiteData();
    return data.pages.map((page) => page.slug);
}
function getPageByName(name) {
    const data = getSiteData();
    const found = data.pages.find((page) => page.pageName === name);
    if (!found) {
        throw new Error(`Page with slug "${name}" not found`);
    }
    const content = {
        ...found.content,
        benefits: Array.isArray(found.content.benefits)
            ? found.content.benefits
            : JSON.parse(found.content.benefits || '[]'),
        aboutServicesTitle: Array.isArray(found.content.aboutServicesTitle)
            ? found.content.aboutServicesTitle
            : JSON.parse(found.content.aboutServicesTitle || '[]'),
        aboutServicesDescription: Array.isArray(found.content.aboutServicesDescription)
            ? found.content.aboutServicesDescription
            : JSON.parse(found.content.aboutServicesDescription || '[]'),
    };
    return {
        ...found,
        content,
    };
}
