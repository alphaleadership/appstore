import { describe, it, expect } from '@jest/globals';
import { checkDiskSpace } from './utils.js';
describe('utils', () => {
    it('should return mock disk space', async () => {
        const space = await checkDiskSpace('/');
        expect(space).toHaveProperty('available');
        expect(space).toHaveProperty('total');
    });
});
//# sourceMappingURL=utils.test.js.map