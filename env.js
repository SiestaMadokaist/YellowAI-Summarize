Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_ENV = void 0;
require('dotenv').config();
const getEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
const initEnv = () => {
    return {
        YELLOWAI_BOTID: getEnv('YELLOWAI_BOTID'),
        YELLOWAI_HOST: getEnv('YELLOWAI_HOST'),
        YELLOWAI_APIKEY: getEnv('YELLOWAI_APIKEY'),
    };
};
exports.SYSTEM_ENV = initEnv();
