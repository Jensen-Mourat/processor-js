import {Instruction, Processor} from '../processor';

export const LOOP = (processor: Processor, instruction: Instruction) => {
    const ecx = parseInt(processor.getRegisterValue('ecx')!, 16);
    if (ecx > 0) {
        processor.moveInstructionPointerToPos(instruction.operand1?.value!);
        processor.setRegisterValue('ecx', (ecx - 1).toString(16));
    } else {
        processor.incrementInsPointer();
    }
};
