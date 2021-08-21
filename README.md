# processor-js
Intel x86 processor simulation. Receives machine code as input and the processor states (i.e flags and registers) can be queries or subscribed to. Uses my [disassembler](#https://github.com/Jensen-Mourat/disassembler-intel-x86) internally.

## Interface

**Rxjs Observables are used for the states because the reactive nature of observables allows easy UI bindings with frameworks such as Angular**

```
interface operand {
  value?: string;
  register?: string;
  register2?: string;
  displacement?: string;
  constant?: string;
  pointer?: pointerType;
}

interface Instruction {
  instruction: string;
  operand1?: operand;
  operand2?: operand;
  position?: number;
  opCode?: string;
}

interface IFlag {
  value: 0 | 1;
  address: string;
}

type flagType = 'cf' | 'pf' | 'af' | 'zf' | 'sf' | 'tf' | 'if' | 'df' | 'of';

interface Processor {
  getFlags(): Map<flagType, IFlag>;
  input(string): Instruction[]; // use this function to input machine code to the processor, it also returns the instructions disassembled by the processor 
  runCurrentInstruction(); // run current instruction
  undo() // return to previous state
  runAll() // run all instructions at once
  reset(clearInstructions?: boolean) // reset processor state, if clearInstructions is true, new instructions must also be added using input
  getFlags$() // get observable for flags
  getInstructions$(): Observable<Instruction[]>;// get observable for Instructions
  getInstructionPointer$(): Observable<number>;// get observable for pointer position
  resetInstructionPointer() // reset the instruction pointer
  getRegisterValue(r: string) // r: intel 8, 16 or 32 bit general purpose register i.e ax, eax, ah etc... return hex string
  getRegisters$() // get all register values as observable
  getMemory(): Memory // return the Memory object
  initialiseMemory(size: number) // size: number of bytes
}

interface Memory {
  previousState()// revert the memory to its previous state
  reset();
  setValue(address: string, value: string, size?: 'b' | 'w' | 'd') 
  getValue(address: string, size?: 'b' | 'w' | 'd', addresses?: string[])
}
```
