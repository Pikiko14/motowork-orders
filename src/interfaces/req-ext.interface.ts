import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      files?: {
        [fieldname: string]: Express.Multer.File[]; // Definir correctamente el tipo para el índice
      };
    }
  }
}

export interface RequestExt extends Request {
  user?: any;
  files?: any
  file?: Express.Multer.File;
}

export interface PaginationInterface {
  page: number;
  perPage: number;
  search: string | number;
  type?: string;
  sortBy?: string;
  order?: string;
  fields?: string;
  filter?: any;
}