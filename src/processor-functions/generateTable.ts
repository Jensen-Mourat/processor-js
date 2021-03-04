import {ADD} from './ADD';

const table: { ins: string, fn: Function }[] = [
    {ins: 'add', fn: ADD}
];


export const generateTable = () => {
    const m = new Map<string, Function>();
    table.forEach(x => m.set(x.ins, x.fn));
    'a'.sub()
    return m;
};
