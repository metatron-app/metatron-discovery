import {Injectable, Injector} from "@angular/core";
import {FileItem, ParsedResponseHeaders} from "ng2-file-upload";
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DataSourceCreateService {

  private _translateService: TranslateService;

  constructor(injector: Injector) {
    this._translateService = injector.get(TranslateService);
  }

  /**
   * Get convert sheets
   * @param {object} sheets
   * @return {Sheet[]}
   */
  public getConvertSheets(sheets: object): Sheet[] {
    return Object.keys(sheets).map(key => {
      return sheets[key].valid ? {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning} : {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning, errorMessage: this.getFileErrorMessage(sheets[key].warning)};
    });
  }

  /**
   * Get file error message
   * @param {string} errorCode
   * @return {string}
   */
  public getFileErrorMessage(errorCode: string): string {
    return this._translateService.instant(`msg.storage.ui.file.result.${errorCode}`);
  }
}

export interface FileResult {
  filePath: string;
  fileKey: string;
  fileSize: string;
  fileName: string;
  sheets?: Sheet[];
  selectedSheet?: Sheet;
}

export interface Sheet {
  sheetName: string;
  valid: boolean;
  warning?: string;
  errorMessage?: string;
}

export interface UploadResult {
  success: boolean;
  item: FileItem;
  response: any;
  status: number;
  headers: ParsedResponseHeaders;
}

export interface FileDetail {
  data: any[];
  fields: any[];
  headers?: any[];
  success?: boolean;
  totalRows?: number;
  isParsable: {valid: boolean, warning?: string};
  errorMessage?: string;
}

export interface QueryDataResult {
  // result info
  data?: any[];
  fields?: any[];
  totalRows?: number;
  // error info
  code?: string;
  details?: string;
  message?: string;
}
