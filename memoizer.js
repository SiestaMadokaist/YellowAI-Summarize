Object.defineProperty(exports, "__esModule", { value: true });
exports.Memoizer = void 0;
class Memoizer {
    store = {};
    memoize(k, cb) {
        const stored = this.store[k];
        if (typeof stored === 'undefined') {
            const result = cb();
            this.store[k] = result;
            return result;
        }
        return stored;
    }
}
exports.Memoizer = Memoizer;
