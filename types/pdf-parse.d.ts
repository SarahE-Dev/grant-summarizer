// types/pdf-parse.d.ts
declare module 'pdf-parse' {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: object;
    metadata: object;
    version: string;
  }

  interface PDFResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdf(dataBuffer: Buffer): Promise<PDFResult>;

  export = pdf;
}
