import {MemoryObj, ProcessorInterface} from './processor.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {Memory} from './memory';
import {Disassembler} from 'disassembler-x86-intel';
import {Instruction} from 'disassembler-x86-intel/lib/src/disasm';

export class Processor implements ProcessorInterface {
    private memory: Memory = new Memory();
    private currentInstructions$ = new BehaviorSubject<Instruction[]>([]);
    private flags = new Map()
        .set('cf', {value: 0, address: '1'})
        .set('pf', {value: 0, address: '4'})
        .set('af', {value: 0, address: '10'})
        .set('zf', {value: 0, address: '40'})
        .set('sf', {value: 0, address: '80'})
        .set('tf', {value: 0, address: '100'})
        .set('if', {value: 0, address: '200'})
        .set('df', {value: 0, address: '400'})
        .set('of', {value: 0, address: '800'});

    constructor() {

    }

    getFlags() {
        return this.flags;
    }

    input(s: string) {
        const instructions = Disassembler.generateInstructions(s);
        this.currentInstructions$.next(instructions);
        return instructions;
    }

    getInstructions$(): Observable<Instruction[]> {
        return this.currentInstructions$;
    }

    // flags(): Observable<string[]> | undefined {
    //     return undefined;
    // }
    //
    // initialiseMemory(size: number): void {
    // }
    //
    // input(input: string): void {
    // }
    //
    // memoryChange(): Observable<[]> | undefined {
    //     return undefined;
    // }
    //
    // registers(): Observable<string[]> {
    //     return undefined;
    // }
}
