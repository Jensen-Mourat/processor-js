import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {Memory} from './memory';
import {Disassembler} from 'disassembler-x86-intel';
import {Instruction as I} from 'disassembler-x86-intel/lib/src/disasm';
import {generateTable} from './processor-functions/generateTable';
import {MemorySubject} from './helper/MemorySubject';
import {tap} from 'rxjs/operators';
import {EightBitRegisters, SixteenBitRegisters} from './helper/registers';

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
        this.process(currentInstruction);
        this.flags$.next(this.flags);
        this.registers$.next(this.registers);
        this.memory.saveState(); // save memory state after each instruction
        const pointer = this.instructionPointer$.getValue();
        if (currentInstruction.instruction !== 'jmp') {
            if (instructions[pointer + 1]) {
                this.instructionPointer$.next(pointer + 1);
            } else {
                this.done$.next(true);
            }
        }
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
        this.runSub = this.instructionPointer$.pipe(
            tap(_ => {
                this.runCurrentInstruction();
            }),
        ).subscribe();
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
                return reg.substring(0, 2);
            } else {
                return reg.substr(2, 4);
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
                updatedVal = reg.substr(0, 4) + value.padStart(2, '0') + reg.substr(6);
            } else {
                updatedVal = reg.substr(0, 6) + value.padStart(2, '0');
            }
            this.registers.set(name, updatedVal.toUpperCase().padStart(8, '0'));
        }
        if (SixteenBitRegisters.has(r)) {
            const name = 'e' + r;
            const reg = this.registers.get(name)!;
            updatedVal = reg.substr(0, 4) + value.padStart(4, '0');
            this.registers.set(name, updatedVal.toUpperCase().padStart(8, '0'));
        }
        this.registers.set(r, value.toUpperCase().padStart(8, '0'));
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
        const instructions = this.currentInstructions$.getValue();
        let pointer = 0;
        while (!done) {
            const currentInstruction = instructions[pointer];
            this.process(currentInstruction);
            if (currentInstruction.instruction !== 'jmp') {
                if (instructions[pointer + 1]) {
                    pointer++;
                } else {
                    done = true;
                }
            } else {
                //jump
            }
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
