import {Instruction, Processor} from '../processor';
import {convertToTwosComp} from '../helper/twosComplement';

export const JUMP = (processor: Processor, instruction: Instruction) => {
    const result = processJump(processor, instruction);
    processor.moveInstructionPointer(parseInt(result));
};

export const processJump = (processor: Processor, instruction: Instruction) => {
    const opCode = instruction.opCode;
    const operand = instruction.operand1?.value;
    const complement = convertToTwosComp(operand!);
    if (complement !== operand) {
        return complement;
    } else {
        return complement;
    }
};
