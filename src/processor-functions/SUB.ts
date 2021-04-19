import {Instruction, Processor} from '../processor';
import {processorFunctionWrapper, setAf} from './processorFunctionWrapper';

export const SUB = (processor: Processor, instruction: Instruction) => {
    processorFunctionWrapper(({op1, op2, processor}) => {
        const result = op1?.value.substract(op2?.value!);
        setAf(processor, op1?.value!, op2?.value!, false);
        return result;
    }, instruction, processor, {flags: ['cf', 'pf', 'zf', 'of', 'sf']});
};
