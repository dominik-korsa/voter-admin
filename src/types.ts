import { Token } from 'src/api/types';

export interface TokenBatch {
  pdfUrl: string;
  generationDate: string;
  className: string | null;
  uuid: string;
  usedTokens: Token[];
  unusedTokens: Token[];
  timestamp: number;
}
