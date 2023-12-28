var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const metatemplate_1 = require("./metatemplate");
const memoizer_1 = require("./memoizer");
class YellowParser {
    helper;
    props;
    #memo = new memoizer_1.Memoizer();
    constructor(helper, props) {
        this.helper = helper;
        this.props = props;
    }
    async csv() {
        const file = fs_1.default.createReadStream(this.props.key);
        return file;
    }
    async rows() {
        return this.#memo.memoize('rows', async () => {
            const result = [];
            const csv = await this.csv();
            const parser = csv.pipe((0, csv_parser_1.default)({ separator: ',' }));
            parser.on('data', async (data) => {
                result.push(data);
            });
            const p = new Promise((rs, rj) => {
                parser.on('end', () => rs(result));
                parser.on('error', rj);
            });
            return p;
        });
    }
    async grouped() {
        const rows = await this.rows();
        const map = new Map();
        for (const row of rows) {
            const key = `${row.templateId}:${row.senderId}`;
            const current = map.get(key) ?? null;
            let data;
            if (current === null) {
                data = {
                    templateId: row.templateId,
                    senderId: row.senderId,
                    key,
                    counts: {
                        read: 0,
                        delivered: 0,
                        sent: 0,
                        failed: 0,
                    }
                };
                map.set(key, data);
            }
            else {
                data = current;
            }
            data['counts'][row.status] += 1;
        }
        return map;
    }
    async output() {
        const map = await this.grouped();
        const result = [
            "sep=,",
            [
                "Template ID",
                "Source",
                "Failed",
                "Sent",
                "Delivered",
                "Read",
                "Type",
                "Created By",
                "Sender ID",
            ].join(',')
        ];
        const { metaTemplate } = this.helper;
        const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
        const metaMap = await metaTemplate.map();
        for (const key of keys) {
            const group = map.get(key);
            const meta = await metaMap.get(group?.templateId);
            const line = [
                group?.templateId ?? '',
                "yellowai",
                group?.counts.failed.toString() ?? '',
                group?.counts.sent.toString() ?? '',
                group?.counts.delivered.toString() ?? '',
                group?.counts.read.toString() ?? '',
                meta?.channelTransformer.category ?? '',
                meta?.createdBy ?? '',
                `'${group?.senderId ?? '???'}`
            ];
            result.push(line.join(','));
        }
        return result;
    }
    exportCSV(outPath) {
        const csv = this.output();
        return new Promise((rs, rj) => {
            csv.then((data) => {
                const file = fs_1.default.createWriteStream(outPath);
                file.on('error', rj);
                data.forEach((line) => file.write(`${line}\n`));
                file.end();
                rs();
            }).catch(rj);
        });
    }
}
async function main(source, destination) {
    const metaTemplate = new metatemplate_1.MetaTemplate();
    const helper = { metaTemplate };
    const props = {
        key: source,
        startAt: 0,
        endAt: 0,
    };
    const parser = new YellowParser(helper, props);
    await parser.exportCSV(destination);
}
if (require.main === module) {
    const [source, destination] = process.argv.slice(2);
    console.log({ source, destination });
    main(source, destination).catch(console.error);
}
