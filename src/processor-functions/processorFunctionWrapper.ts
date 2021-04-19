import { flagType, Instruction, Processor } from '../processor';
import { operand } from './ADD';
import { removeFalsy } from 'disassembler-x86-intel/lib/utils/object.extensions';
import '../utils/hex.utils';

import { register } from 'ts-node';
import { hexTobin } from '../helper/Functions';

interface Iop {
  value: string;
  details: operand;
}

export interface IFunction {
  processor: Processor;
  op1?: Iop;
  op2?: Iop;
}

export const processorFunctionWrapper = (
  fn: (f: IFunction) => any,
  instruction: Instruction,
  processor: Processor,
  options?: { defaultBehavior?: boolean; flags?: flagType[]; incrementPointer?: boolean },
) => {
  const { operand1, operand2 } = instruction;
  const _incrementPointer = typeof options?.incrementPointer === 'undefined' ? true : options?.incrementPointer;
  const _defaultBehavior = typeof options?.defaultBehavior === 'undefined' ? true : options?.defaultBehavior;
  //reg
  if (isRegisterOnly(operand1) && !operand2) {
    const value = processor.getRegisterValue(operand1?.register!)!;
    fn({ processor, op1: { value, details: operand1! } });
  }
  // reg, reg
  if (isRegisterOnly(operand1) && isRegisterOnly(operand2)) {
    const value1 = processor.getRegisterValue(operand1?.register!)!;
    const value2 = processor.getRegisterValue(operand1?.register!)!;
    const result = fn({
      processor,
      op1: { value: value1, details: operand1! },
      op2: { value: value2, details: operand1! },
    });
    if (_defaultBehavior) {
      processor.setRegisterValue(operand1?.register!, result);
    }
    if (options?.flags) {
      processFlags(processor, options.flags, operand1!, value1, value2, result);
    }
  }
  // reg, imm
  if (isRegisterOnly(operand1) && operand2?.value) {
    const value = processor.getRegisterValue(operand1?.register!)!;
    const result = fn({
      processor,
      op1: { value: value, details: operand1! },
      op2: { value: operand2.value!, details: operand2! },
    });
    if (_defaultBehavior) {
      processor.setRegisterValue(operand1?.register!, result);
      if (options?.flags) {
        processFlags(processor, options.flags, operand1!, value, operand2.value!, result);
      }
    }
  }
  // reg, mem
  if (isRegisterOnly(operand1) && operand2?.pointer) {
    const value1 = processor.getRegisterValue(operand1?.register!)!;
    const { value: value2, address: address2 } = processMemory(operand2, processor, operand2?.pointer!);
    const result = fn({
      processor,
      op1: { value: value1, details: operand1! },
      op2: { value: value2, details: operand2! },
    });
    if (_defaultBehavior) {
      processor.setRegisterValue(operand1?.register!, result);
      if (options?.flags) {
        processFlags(processor, options.flags, operand1!, value1, value2, result);
      }
    }
  }
  //mem reg
  if (isRegisterOnly(operand2) && operand1?.pointer) {
    const value2 = processor.getRegisterValue(operand2?.register!)!;
    const { value: value1, address: address1 } = processMemory(operand1, processor, operand1?.pointer);
    const result = fn({
      processor,
      op1: { value: value1, details: operand1! },
      op2: { value: value2, details: operand2! },
    });
    if (_defaultBehavior) {
      processor.getMemory().setValue(address1, result);
    }
  }
  //mem mem
  if (operand2?.pointer && operand1?.pointer) {
    const { value: value2, address: address2 } = processMemory(operand2, processor, operand2?.pointer)!;
    const { value: value1, address: address1 } = processMemory(operand1, processor, operand1?.pointer);
    const result = fn({
      processor,
      op1: { value: value1, details: operand1! },
      op2: { value: value2, details: operand2! },
    });
    if (_defaultBehavior) {
      processor.getMemory().setValue(address1, result);
    }
  }
  //mem imm
  if (operand1?.pointer && operand2?.value) {
    const { value, address } = processMemory(operand1, processor, operand1?.pointer);
    const result = fn({
      processor,
      op1: { value: value, details: operand1! },
      op2: { value: operand2.value!, details: operand2! },
    });
    if (_defaultBehavior) {
      processor.getMemory().setValue(address, result);
    }
  }
  //increment pointer
  if (_incrementPointer) {
    processor.incrementInsPointer();
  }
};

const processMemory = (
  op: operand,
  processor: Processor,
  pointer: 'b' | 'w' | 'd',
): { address: string; value: string } => {
  let registerValue = 0;
  let registerValue2 = 0;
  let constant = 1;
  let displacement = 0;
  const pLength = pointer === 'b' ? 2 : pointer === 'w' ? 4 : 8;
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
  const value = (registerValue + registerValue2 * constant + displacement).toString(16).padStart(8, '0');
  return {
    value: processor
      .getMemory()
      .getValue(value)
      .substr(8 - pLength),
    address: value,
  };
};

export const setAf = (processor: Processor, v1: string, v2: string, add = true) => {
  if (add && v1[v1.length - 1].add(v2[v2.length - 1]).length > 1) {
    processor.setFlag('af', 1);
  }
  if (!add && v1[v1.length - 1].substract(v2[v2.length - 1]).length > 1) {
    processor.setFlag('af', 1);
  }
};

const processFlags = (
  processor: Processor,
  flags: flagType[],
  op: operand,
  value1: string,
  value2: string,
  result: string,
) => {
  if (flags.includes('cf')) {
    if (result.greaterThan(getMaxLength(op.register!))) {
      processor.setFlag('cf', 1);
    } else {
      processor.setFlag('cf', 0);
    }
  }
  if (flags.includes('sf')) {
    const bin = hexTobin(result, getMaxLength(op.register).length * 4);
    const msb = bin[0];
    if (msb === '1') {
      processor.setFlag('sf', 1);
    } else {
      processor.setFlag('sf', 0);
    }
  }
  if (flags.includes('zf')) {
    if (result.toInt() === 0) {
      processor.setFlag('zf', 1);
    } else {
      processor.setFlag('zf', 0);
    }
  }
  if (flags.includes('pf')) {
    const bin = hexTobin(result.getLowestByte(), 8);
    let count = 0;
    Array.from(bin).forEach((x) => {
      if (x === '1') {
        count++;
      }
    });
    if (count % 2 === 0) {
      processor.setFlag('pf', 1);
    } else {
      processor.setFlag('pf', 0);
    }
  }
  if (flags.includes('of')) {
    const bin1 = hexTobin(value1, getMaxLength(op.register).length * 4);
    const bin2 = hexTobin(value2, getMaxLength(op.register).length * 4);
    const binR = hexTobin(result, getMaxLength(op.register).length * 4);
    const msb1 = bin1[0];
    const msb2 = bin2[0];
    const msbR = binR[0];
    if (msb1 === msb2 && msb2 !== msbR) {
      processor.setFlag('of', 1);
    } else {
      processor.setFlag('of', 0);
    }
  }
};

const getMaxLength = (s: string | undefined) => {
  if (s) {
    if (s.includes('e')) {
      return 'ffffffff';
    } else if (s.includes('h') || s.includes('l')) {
      return 'ff';
    } else {
      return 'ffff';
    }
  }
  return '0';
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
