import {EightBitRegisters, SixteenBitRegisters} from './registers';
import {flagType, Processor} from '../processor';
import {IRegister, operand} from '../processor-functions/ADD';

export const formatAddress = (op: operand, p: Processor) => {
    let r1Value = op.register ? p.getRegisterValue(op.register!) : undefined;
    let r2Value = op.register2 ? p.getRegisterValue(op.register2) : undefined;
    let result = '0';
    let displacement = op.displacement ?? undefined;
    const constant = op.constant ?? undefined;
    if (constant || r2Value) {
        if (r2Value) {//[eax+eax*2]
            r2Value = constant ? multiplyBy(r2Value, parseInt(constant)) : r2Value;
            result = r1Value!.add(r2Value);
        } else {
            if (r1Value) { //[eax*2]
                r1Value = constant ? multiplyBy(r1Value, parseInt(constant)) : r1Value;
                result = r1Value;
            }
        }
    } else { // [eax]
        result = r1Value!;
    }
    if (displacement) {
        if (displacement.convertToTwosComp() !== displacement) {
            displacement = '-' + displacement.convertToTwosComp();
        }
        result = result.add(displacement);
    }
    return result;
};
export const setAf = (v1: string, v2: string, processor: Processor) => {
    if (v1.getLowestByte().add(v2.getLowestByte()).length > 2) {
        processor.setFlag('af', 1);
    } else {
        processor.setFlag('af', 0);
    }
};
const multiplyBy = (val: string, by: number) => {
    switch (by) {
        case 2 :
            return shift(val, 1);
        case 4 :
            return shift(val, 2);
        case 8 :
            return shift(val, 3);
        default:
            throw Error('Invalid shift');
    }
};
const shift = (val: string, shiftBy: number) => {
    let bin = hex2bin(val);
    while (shiftBy > 0) {
        shiftBy -= 1;
        bin = bin.substr(1);
        bin += '0';
    }
    return parseInt(bin, 2).toString(16);
};
export const processFlags = (p: Processor, result: string, formattedResult: string, flagsList: flagType[]) => {
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
export const getLength = (register: IRegister): number => {
    return register.is8bit ? 2 : register.is16bit ? 4 : 8;
};
export const getRegisterValue = (value: string, reg: IRegister): string => {
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
export const getRegisterType = (register: string): IRegister => {
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
