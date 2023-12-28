var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaTemplate = void 0;
const env_1 = require("./env");
const memoizer_1 = require("./memoizer");
const axios_1 = __importDefault(require("axios"));
class MetaTemplate {
    #memo = new memoizer_1.Memoizer();
    constructor() { }
    httpClient() {
        const request = axios_1.default.create({
            baseURL: env_1.SYSTEM_ENV.YELLOWAI_HOST,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': env_1.SYSTEM_ENV.YELLOWAI_APIKEY,
            }
        });
        return request;
    }
    async detail(key) {
        const map = await this.map();
        return map.get(key);
    }
    fetch() {
        return this.#memo.memoize('templates', async () => {
            const response = await this.httpClient().get(`api/templates/all?bot=${env_1.SYSTEM_ENV.YELLOWAI_BOTID}`);
            return response.data.data.templates;
        });
    }
    map() {
        return this.#memo.memoize('map', async () => {
            const templates = await this.fetch();
            const map = new Map();
            for (const template of templates) {
                map.set(template.name, template);
            }
            return map;
        });
    }
}
exports.MetaTemplate = MetaTemplate;
async function main() {
    const meta = await new MetaTemplate().map();
    console.log(meta.size);
    const detail = await meta.get('24hourbreak');
    console.log(detail);
}
if (require.main === module) {
    main().catch((err) => console.error(err));
}
