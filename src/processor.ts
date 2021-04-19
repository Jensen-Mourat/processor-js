import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {Memory} from './memory';
import {Disassembler} from 'disassembler-x86-intel';
import {Instruction as I} from 'disassembler-x86-intel/lib/src/disasm';
import {generateTable} from './processor-functions/generateTable';
import {MemorySubject} from './helper/MemorySubject';
import {filter, takeUntil, tap} from 'rxjs/operators';
import {EightBitRegisters, SixteenBitRegisters, ThirtyTwoBitRegisters} from './helper/registers';
import {processFlags} from './helper/Functions';

export interface Instruction extends I {
    opCode?: string;
}

export interface IFlag {
    value: 0 | 1;
    address: string;
}

export type flagType = 'cf' |
    'pf' |
    'af' |
    'zf' |
    'sf' |
    'tf' |
    'if' |
    'df' |
    'of'

export class Processor {
    private memory: Memory = new Memory();
    private currentInstructions$ = new BehaviorSubject<Instruction[]>([]);
    private instructionPointer$ = new MemorySubject<number>(0);
    private functionTable: Map<string, Function> = generateTable();
    done$ = new BehaviorSubject<boolean>(false);
    private flags = new Map<flagType, IFlag>()
        .set('cf', {value: 0, address: '1'}) // carry flag
        .set('pf', {value: 0, address: '4'}) // parity flag
        .set('af', {value: 0, address: '10'}) // aux flag
        .set('zf', {value: 0, address: '40'}) // zero flag
        .set('sf', {value: 0, address: '80'}) // sign flag
        .set('tf', {value: 0, address: '100'}) // trap flag
        .set('if', {value: 0, address: '200'}) // interupt flag
        .set('df', {value: 0, address: '400'}) // direction flag
        .set('of', {value: 0, address: '800'}); // overflow flag

    private flags$ = new MemorySubject<Map<flagType, IFlag>>(this.flags);

    private registers = new Map<string, string>()
        .set('eax', '00000000')
        .set('ebx', '00000000')
        .set('ecx', '00000000')
        .set('edx', '00000000')
        .set('ebp', '00000000')
        .set('esp', '00000000')
        .set('esi', '00000000')
        .set('edi', '00000000');
    private registers$ = new MemorySubject(this.registers);
    private runSub: Subscription | undefined;

    constructor() {
    }


    getFlags() {
        return this.flags;
    }

    input(s: string): any {
        const ins = Disassembler.generateInstructions(s);
        const instructions = ins.map((x, i) => {
            const nextPos = ins[i + 1]?.position!;
            const code = nextPos ? s?.slice(0, (nextPos - x.position!) * 2) : s;
            s = s.replace(code!, '');
            // if (x.instruction === 'jmp') {
            //     console.log('val', x);
            //     temp = {...temp, operand1: {value: processJump(this, temp)}};
            // }
            return {...x, opCode: code};
        });
        this.currentInstructions$.next(instructions);
        this.reset();
        return instructions;
    }

    runCurrentInstruction() {
        const instructions = this.currentInstructions$.getValue();
        const currentInstruction = instructions[this.instructionPointer$.getValue()];
        if (currentInstruction) {
            this.process(currentInstruction);
            this.flags$.next(this.flags);
            this.registers$.next(this.registers);
            this.memory.saveState(); // save memory state after each instruction
            return false;
        } else {
            this.done$.next(true);
            return true;
        }
    }

    moveInstructionPointerToPos(pos: string) {
        const _pos = parseInt(pos, 16);
        const instructions = this.currentInstructions$.getValue();
        const ind = instructions.findIndex(x => x.position === _pos);
        this.moveInstructionPointer(ind);
    }

    runNext() {
        this.runCurrentInstruction();
    }

    undo() {
        this.registers$.previous();
        this.instructionPointer$.previous();
        this.flags$.previous();
        this.memory.previousState();
    }

    runAll() {
        this.reset();
        this.runAllSync();
        // this.runSub = this.instructionPointer$.pipe(
        //     takeUntil(this.done$.pipe(filter(x => x))),
        //     tap(_ => {
        //         this.runCurrentInstruction();
        //     }),
        // ).subscribe();
    }

    reset(clearInstructions?: boolean) {
        this.resetFlags();
        this.resetRegisters();
        this.unsubscribe(this.runSub);
        this.instructionPointer$.reset(0);
        this.memory.reset();
        if (clearInstructions) {
            this.currentInstructions$.next([]);
        }
        this.done$.next(false);
        // reset memory
    }

    process(currentInstruction: Instruction) {
        const fn = this.functionTable.get(currentInstruction.instruction);
        if (fn) {
            fn(this, currentInstruction);
        } else {
            throw Error('Invalid Instruction');
        }
    }

    setFlag(flag: flagType, value: 0 | 1) {
        const f = this.flags.get(flag);
        if (f) {
            this.flags.set(flag, {address: f.address, value});
        } else {
            throw Error('Invalid Flag');
        }
    }

    getFlags$() {
        return this.flags$;
    }

    getInstructions$(): Observable<Instruction[]> {
        return this.currentInstructions$;
    }

    getInstructionPointer$(): Observable<number> {
        return this.instructionPointer$;
    }

    incrementInsPointer() {
        this.moveInstructionPointer(this.instructionPointer$.getValue() + 1);
    }

    resetInstructionPointer() {
        this.moveInstructionPointer(0);
    }

    moveInstructionPointer(dest: number) {
        this.instructionPointer$.next(dest);
    }

    getRegisterValue(r: string) {
        if (EightBitRegisters.has(r)) {
            const reg = this.registers.get('e' + r[0] + 'x')!;
            if (r.includes('h')) {
                return reg.substr(4, 2);
            } else {
                return reg.substr(6);
            }
        }
        if (SixteenBitRegisters.has(r)) {
            const reg = this.registers.get('e' + r)!;
            return reg.substr(4);
        }
        return this.registers.get(r);
    }

    setRegisterValue(r: string, value: string) {
        let updatedVal;
        if (EightBitRegisters.has(r)) {
            const name = 'e' + r[0] + 'x';
            const reg = this.registers.get(name)!;
            if (r.includes('h')) {
                updatedVal = reg.substr(0, 4) + value.padStart(2, '0').substr(value.length - 2, 2) + reg.substr(6);
            } else {
                updatedVal = reg.substr(0, 6) + value.padStart(2, '0').substr(value.length - 2, 2);
            }
            this.registers.set(name, updatedVal.toUpperCase().padStart(8, '0'));
        } else if (SixteenBitRegisters.has(r)) {
            const name = 'e' + r;
            const reg = this.registers.get(name)!;
            updatedVal = reg.substr(0, 4) + value.padStart(4, '0');
            this.registers.set(name, updatedVal.toUpperCase().padStart(8, '0'));
        } else if (ThirtyTwoBitRegisters.has(r)) {
            this.registers.set(r, value.toUpperCase().padStart(8, '0'));
        } else {
            throw new Error('Register ' + r + ' does not exist!');
        }
    }

    getRegisters$() {
        return this.registers$;
    }

    private resetFlags() {// overflow flag
        this.flags = new Map<flagType, IFlag>()
            .set('cf', {value: 0, address: '1'}) // carry flag
            .set('pf', {value: 0, address: '4'}) // parity flag
            .set('af', {value: 0, address: '10'}) // aux flag
            .set('zf', {value: 0, address: '40'}) // zero flag
            .set('sf', {value: 0, address: '80'}) // sign flag
            .set('tf', {value: 0, address: '100'}) // trap flag
            .set('if', {value: 0, address: '200'}) // interupt flag
            .set('df', {value: 0, address: '400'}) // direction flag
            .set('of', {value: 0, address: '800'});
        this.flags$.reset(this.flags);
    }

    resetRegisters() {
        this.registers = new Map<string, string>()
            .set('eax', '00000000')
            .set('ebx', '00000000')
            .set('ecx', '00000000')
            .set('edx', '00000000')
            .set('ebp', '00000000')
            .set('esp', '00000000')
            .set('esi', '00000000')
            .set('edi', '00000000');
        this.registers$.reset(this.registers);
    }

    getMemory() {
        return this.memory;
    }

    runAllSync() {
        let done;
        while (!done) {
            done = this.runCurrentInstruction();
        }
        return {registers: this.registers, flags: this.flags, memory: this.memory};
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
    private unsubscribe(sub?: Subscription) {
        if (sub) {
            sub.unsubscribe();
        }
    }
}
