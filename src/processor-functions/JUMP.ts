import {Instruction, Processor} from '../processor';

export const JUMP = (processor: Processor, instruction: Instruction) => {
    processor.moveInstructionPointer(parseInt(instruction.operand1!.value!));
};
