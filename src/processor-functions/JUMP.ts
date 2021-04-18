import {Instruction, Processor} from '../processor';
import {convertToTwosComp} from '../helper/twosComplement';

export const JUMP = (processor: Processor, instruction: Instruction) => {
    processor.moveInstructionPointer(parseInt(instruction.operand1?.value!));
};

