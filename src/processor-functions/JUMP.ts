import { Instruction, Processor } from '../processor';
import { convertToTwosComp } from '../helper/twosComplement';
import { processorFunctionWrapper, setAf } from './processorFunctionWrapper';

export const JUMP = (processor: Processor, instruction: Instruction) => {
  processor.moveInstructionPointerToPos(instruction.operand1?.value!);
};
