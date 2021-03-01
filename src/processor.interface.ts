import { Observable } from 'rxjs';

export interface ProcessorInterface {
  // input(input: string): void;
  // registers(): Observable<string[]>;
  // flags():Observable<string[]>;
  // memoryChange(): Observable<MemoryObj[]>
  // initialiseMemory(size: number):void;
}

export interface MemoryObj {
  address: string;
  value: string;
}
