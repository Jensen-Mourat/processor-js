import {Instruction, Processor} from '../processor';
import '../utils/hex.utils';
import {EightBitRegisters, SixteenBitRegisters} from '../helper/registers';
import {flagType} from '../processor';

export const ADD = (processor: Processor, instruction: Instruction) => {
    const {operand1, operand2} = instruction;
    let result: string, formattedResult: string;
    if (!operand1?.pointer && !operand2?.pointer) { // not adressing mem
        // op1 must be register , op2 === r || imm
        const register1 = getRegisterType(operand1?.register!);
        const r1Value = getRegisterValue(processor.getRegisterValue(register1.register)!, register1);
        if (operand2?.value) { // sign extended
            const value = getRegisterValue(operand2.value, register1);
            result = r1Value?.add(value, getLength(register1));
            formattedResult = result!.fitTo(getLength(register1));
            processor.setRegisterValue(register1.register, formattedResult);
            setAf(r1Value, value, processor);
        }

    }
    processFlags(processor, result!, formattedResult!, ['sf', 'cf', 'of', 'zf', 'pf']);
};

const setAf = (v1: string, v2: string, processor: Processor) => {
    if (v1.getLowestByte().add(v2.getLowestByte()).length > 2) {
        processor.setFlag('af', 1);
    } else {
        processor.setFlag('af', 0);
    }
};

const processFlags = (p: Processor, result: string, formattedResult: string, flagsList: flagType[]) => {
    if (flagsList.includes('cf')) {
        if (result.greaterThan(formattedResult)) {
            p.setFlag('cf', 1);
        } else {
            p.setFlag('cf', 0);
        }
    }

    if (flagsList.includes('sf')) {
        const bin = hex2bin(formattedResult);
        const msb = bin[0];
        if (msb === '1') {
            p.setFlag('sf', 1);
        } else {
            p.setFlag('sf', 0);
        }
    }
    if (flagsList.includes('of')) {
        if (formattedResult.isOverflow()) {
            p.setFlag('of', 1);
        } else {
            p.setFlag('of', 0);
        }
    }
    if (flagsList.includes('zf')) {
        if (formattedResult.toInt() === 0) {
            p.setFlag('zf', 1);
        } else {
            p.setFlag('zf', 0);
        }
    }
    if (flagsList.includes('pf')) {
        const bin = hex2bin(formattedResult.getLowestByte());
        const ones = [];
        Array.from(bin).forEach(x => {
            if (x === '1') {
                ones.push(1);
            }
        });
        if (ones.length % 2 === 0) {
            p.setFlag('pf', 1);
        } else {
            p.setFlag('pf', 0);
        }
    }
};

const hex2bin = (hex: string, register?: IRegister) => {
    return (parseInt(hex, 16).toString(2)).padStart(register ? register.is8bit ? 8 : register.is16bit ? 16 : 32 : hex.length * 4, '0');
};

const getLength = (register: IRegister): number => {
    return register.is8bit ? 2 : register.is16bit ? 4 : 8;
};

const getRegisterValue = (value: string, reg: IRegister): string => {
    if (reg.is8bit) {
        if (reg.low) {
            return value.fitTo(2);
        }
        return value.fitTo(4).substr(0, 2);
    }
    if (reg.is16bit) {
        return value.fitTo(4);
    }
    return value;
};

export interface IRegister {
    register: string;
    is8bit?: boolean;
    low?: boolean;
    is16bit?: boolean
}

const getRegisterType = (register: string): IRegister => {
    if (EightBitRegisters.has(register)) {
        switch (register) {
            case 'al':
                return {register: 'eax', is8bit: true, low: true};
            case 'bl':
                return {register: 'ebx', is8bit: true, low: true};
            case 'cl':
                return {register: 'ecx', is8bit: true, low: true};
            case 'dl':
                return {register: 'edx', is8bit: true, low: true};
            case 'ah':
                return {register: 'eax', is8bit: true};
            case 'bh':
                return {register: 'ebx', is8bit: true};
            case 'ch':
                return {register: 'ecx', is8bit: true};
            case 'dh':
                return {register: 'edx', is8bit: true};
        }
    }
    if (SixteenBitRegisters.has(register)) {
        return {register: 'e' + register, is16bit: true};
    }
    return {register};
};
