import {Injectable, Injector} from "@angular/core";
import {AbstractService} from "../../../common/service/abstract.service";
import {CommonUtil} from "../../../common/util/common.util";

@Injectable()
export class HivePersonalDatabaseService extends AbstractService {
  constructor(protected injector: Injector) {
    super(injector);
  }

  public createTable(workbenchId: string, database: string, tableInformation: any): Promise<any> {
    const url = this.API_URL + `plugins/hive-personal-database/workbenches/${workbenchId}/databases/${database}/tables`;
    return this.post(url, tableInformation);
  }

  public deleteTable(workbenchId: string, database: string, table: string, webSocketId: string): Promise<any> {
    const url = this.API_URL + `plugins/hive-personal-database/workbenches/${workbenchId}/databases/${database}/tables/${table}?webSocketId=${webSocketId}`;
    return this.delete(url);
  }

  public renameTable(workbenchId: string, database: string, targetTable: string, renameTable: string, webSocketId: string): Promise<any> {
    const url = this.API_URL +
      `plugins/hive-personal-database/workbenches/${workbenchId}/databases/${database}/tables/${targetTable}?renameTable=${renameTable}&webSocketId=${webSocketId}`;
    return this.put(url, null);
  }

  public createTableFromFile(workbenchId: string, database: string, params: any) {
    const url = this.API_URL +
      `plugins/hive-personal-database/workbenches/${workbenchId}/databases/${database}/tables/import-file`;
    return this.post(url, params);
  }

  public getPreviewImportFile(workbenchId: string, fileKey: string, params: any): Promise<any> {
    let url = this.API_URL + 'plugins/hive-personal-database/workbenches/' + workbenchId + '/import/files/' + fileKey + "/preview";
    if (params) {
      // 주요 이스케이프 시퀀스에 대한 replace 처리 ( \n, \r, \t )
      const replaceParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          replaceParams[key] = (params[key] + '').replace(/\\n/gi, '\n').replace(/\\r/gi, '\r').replace(/\\t/gi, '\t');
        }
      }
      url += '?' + CommonUtil.objectToUrlString(replaceParams);
    }

    return this.get(url);
  }

}
