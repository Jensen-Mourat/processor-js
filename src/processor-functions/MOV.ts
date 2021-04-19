import {Instruction, Processor} from '../processor';
import {processorFunctionWrapper} from './processorFunctionWrapper';

export const MOV = (processor: Processor, instruction: Instruction) => {
    processorFunctionWrapper(({op1, op2}) => {
        const result = op2?.value;
        return result;
    }, instruction, processor);
};
// export const MOV = (processor: Processor, instruction: Instruction) => {
//     const {operand1, operand2} = instruction;
//     if (!operand1?.pointer && !operand2?.pointer) { // not adressing mem
//         const register1 = getRegisterType(operand1?.register!);
//         if (operand2?.value) { // sign extended
//             const value = getRegisterValue(operand2.value, register1);
//             const result = value;
//             processor.setRegisterValue(register1.register, result.fitTo(getLength(register1)));
//         } else {
//             if (operand2?.register) {
//                 const register2 = getRegisterType(operand2?.register!);
//                 const r2Value = getRegisterValue(processor.getRegisterValue(register2.register)!, register2);
//                 const result = r2Value;
//                 processor.setRegisterValue(register1.register, result.fitTo(getLength(register1)));
//
//             }
//         }
//     } else {
//         if (!operand1?.pointer && operand2?.pointer) {
//             const address = formatAddress(operand2, processor);
//             const register1 = getRegisterType(operand1?.register!);
//             const result = processor.getMemory().getValue(address, operand2.pointer)!;
//             const formattedResult = result!.fitTo(getLength(register1));
//             processor.setRegisterValue(register1.register, formattedResult);
//         } else {
//             const address = formatAddress(operand1!, processor);
//             const register2 = getRegisterType(operand2?.register!);
//             const r2Val = getRegisterValue(processor.getRegisterValue(register2.register)!, register2);
//             const formattedResult = r2Val!.fitTo(getLength(register2));
//             processor.getMemory().setValue(address, formattedResult, operand1?.pointer);
//         }
//     }
// };
