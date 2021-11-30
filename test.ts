import { DeepReadonly } from 'src/common/utils/types/deep-readonly';

interface I {
    a: {
        b: {
            c: number;
        }
    }
}

class Test {
    constructor(public x: DeepReadonly<I>) {
    }
}

const x = new Test({a: {b: {c: 1}}})
