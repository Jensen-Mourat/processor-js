import {Instruction, Processor} from '../processor';
import '../utils/hex.utils';
import {pointerType} from 'disassembler-x86-intel/lib/src/disasm';
import {formatAddress, getLength, getRegisterType, getRegisterValue, processFlags, setAf} from '../helper/Functions';

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
        } else {
            if (operand2?.register) {
                const register2 = getRegisterType(operand2?.register!);
                const r2Value = getRegisterValue(processor.getRegisterValue(register2.register)!, register2);
                result = r1Value?.add(r2Value, getLength(register1));
                formattedResult = result!.fitTo(getLength(register1));
                processor.setRegisterValue(register1.register, formattedResult)
                setAf(r1Value, r2Value, processor);
            }
        }
    } else {
        if (!operand1?.pointer && operand2?.pointer) {
            const address = formatAddress(operand2, processor);
            const register1 = getRegisterType(operand1?.register!);
            const r1Value = getRegisterValue(processor.getRegisterValue(register1.register)!, register1);
            const op2Value = processor.getMemory().getValue(address, operand2.pointer)!;
            result = r1Value.add(op2Value);
            formattedResult = result!.fitTo(getLength(register1));
            processor.setRegisterValue(register1.register, formattedResult)
            setAf(r1Value, op2Value, processor);
        } else {
            const address = formatAddress(operand1!, processor);
            const register2 = getRegisterType(operand2?.register!);
            const r2Value = getRegisterValue(processor.getRegisterValue(register2.register)!, register2);
            const op1Value = processor.getMemory().getValue(address, operand1?.pointer)!;
            result = r2Value.add(op1Value);
            formattedResult = result!.fitTo(getLength(register2));
            processor.getMemory().setValue(address, formattedResult, operand1?.pointer)
            setAf(op1Value, r2Value, processor);
        }
    }
    processFlags(processor, result!, formattedResult!, ['sf', 'cf', 'of', 'zf', 'pf']);
};

export interface IRegister {
    register: string;
    is8bit?: boolean;
    low?: boolean;
    is16bit?: boolean
}

export interface operand {
    value?: string;
    register?: string;
    register2?: string;
    displacement?: string;
    constant?: string;
    pointer?: pointerType;
}
