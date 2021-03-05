import {ADD} from './ADD';
import {MOV} from './MOV';
import {JUMP} from './JUMP';

const table: { ins: string, fn: Function }[] = [
    {ins: 'add', fn: ADD},
    {ins: 'mov', fn: MOV},
    {ins: 'jmp', fn: JUMP}
];


export const generateTable = () => {
    const m = new Map<string, Function>();
    table.forEach(x => m.set(x.ins, x.fn));
    return m;
};
