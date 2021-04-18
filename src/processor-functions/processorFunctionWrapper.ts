import {flagType, Instruction, Processor} from '../processor';
import {operand} from './ADD';
import {removeFalsy} from 'disassembler-x86-intel/lib/utils/object.extensions';
import '../utils/hex.utils';

import {register} from 'ts-node';

interface Iop {
    value: string,
    details: operand
}

export interface IFunction {
    processor: Processor;
    op1?: Iop;
    op2?: Iop
}

export const processorFunctionWrapper = (fn: (f: IFunction) => any, instruction: Instruction, processor: Processor, defaultBehavior = true, options?: { flags?: flagType[] }) => {
    const {operand1, operand2} = instruction;
    //reg
    if (isRegisterOnly(operand1) && !operand2) {
        const value = processor.getRegisterValue(operand1?.register!)!;
        fn({processor, op1: {value, details: operand1!}});
    }
    // reg, reg
    if (isRegisterOnly(operand1) && isRegisterOnly(operand2)) {
        const value1 = processor.getRegisterValue(operand1?.register!)!;
        const value2 = processor.getRegisterValue(operand1?.register!)!;
        const result = fn({
            processor,
            op1: {value: value1, details: operand1!},
            op2: {value: value2, details: operand1!}
        });
        if (defaultBehavior) {
            processor.setRegisterValue(operand1?.register!, result);
            if(options?.flags){
              
            }
        }

    }
    // reg, imm
    if (isRegisterOnly(operand1) && operand2?.value) {
        const value = processor.getRegisterValue(operand1?.register!)!;
        const result = fn({
            processor,
            op1: {value: value, details: operand1!},
            op2: {value: operand2.value!, details: operand2!},
        });
        if (defaultBehavior) {
            processor.setRegisterValue(operand1?.register!, result);
        }
    }
    // reg, mem
    if (isRegisterOnly(operand1) && operand2?.pointer) {
        const value1 = processor.getRegisterValue(operand1?.register!)!;
        const value2 = processMemory(operand2, processor);
        const result = fn({
            processor,
            op1: {value: value1, details: operand1!},
            op2: {value: value2, details: operand2!}
        });
        if (defaultBehavior) {
            processor.setRegisterValue(operand1?.register!, result);
        }
    }
    //mem reg
    if (isRegisterOnly(operand2) && operand1?.pointer) {
        const value2 = processor.getRegisterValue(operand2?.register!)!;
        const value1 = processMemory(operand1, processor);
        const result = fn({
            processor,
            op1: {value: value1, details: operand1!},
            op2: {value: value2, details: operand2!}
        });
        if (defaultBehavior) {
            processor.getMemory().setValue(value1, result);
        }
    }
    //mem mem
    if (operand2?.pointer && operand1?.pointer) {
        const value2 = processMemory(operand2, processor)!;
        const value1 = processMemory(operand1, processor);
        const result = fn({
            processor,
            op1: {value: value1, details: operand1!},
            op2: {value: value2, details: operand2!}
        });
        if (defaultBehavior) {
            processor.getMemory().setValue(value1, result);
        }
    }
    //mem imm
    if (operand1?.pointer && operand2?.value) {
        const value = processMemory(operand1, processor);
        const result = fn({
            processor,
            op1: {value: value, details: operand1!},
            op2: {value: operand2.value!, details: operand2!},
        });
        if (defaultBehavior) {
            processor.getMemory().setValue(value, result);
        }
    }
};


const processMemory = (op: operand, processor: Processor): string => {
    let registerValue = 0;
    let registerValue2 = 0;
    let constant = 1;
    let displacement = 0;
    //[eax+eax*2+1]
    if (op?.register) {
        registerValue = processor.getRegisterValue(op.register)!.toInt();
    }
    if (op?.register2) {
        registerValue2 = processor.getRegisterValue(op.register2)!.toInt();
    }
    if (op?.constant) {
        constant = op?.constant.toInt();
    }
    if (op?.displacement) {
        displacement = op.displacement.toInt();
    }
    const value = registerValue + (registerValue2 * constant) + displacement;
    return processor.getMemory().getValue(value.toString(16));
};

const isRegisterOnly = (op: operand | undefined) => {
    if (op?.register) {
        const _op = removeFalsy(op);
        if (Object.keys(_op).length === 1) {
            return true;
        }
    }
    return false;
};
