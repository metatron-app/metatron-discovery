/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable, Injector } from '@angular/core';
import { AbstractService } from '../../../common/service/abstract.service';
//import { DatasetHive, DatasetJdbc, DatasetFile, Datasets } from '../../../domain/data-preparation/dataset';
import { PrDatasetHive, PrDatasetJdbc, PrDatasetFile, Datasets } from '../../../domain/data-preparation/pr-dataset';
import { CommonUtil } from '../../../common/util/common.util';
import { Dataconnection } from '../../../domain/dataconnection/dataconnection';
import { ConnectionRequest } from '../../../domain/dataconnection/connectionrequest';

@Injectable()
export class DatasetService extends AbstractService {

  public connInfo:any = {};

  // 데이터플로우에서 데이터셋 생성으로 넘어왔을 경우, 생성 완료 후 다시 데이터플로우도 이동을 위해 필요
  public dataflowId : string;

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * 데이터셋 목록 조회
   * @param {any} param {searchText, dsType, sort, refDfCountSort}
   * @returns {Promise<any>}
   */
  public getDatasets(param): Promise<Datasets> {

    delete param.page.column;

    const sort = param.page.sort.split(',');
    let sortStr = '';
    if (sort[0] === 'refDfCount') {
      if (sort[1] === 'asc') {
        sortStr = 'Asc';
      } else {
        sortStr = 'Desc';
      }
    }

    let url = this.API_URL + `preparationdatasets/search/`;

    if (param.dsType !== '') {

      if (sort[0] === 'refDfCount') {
        url += `findByDsNameContainingAndDsTypeOrderByRefDfCount${sortStr}?dsType=${param.dsType}&`;
      } else {
        url += `findByDsNameContainingAndDsType?dsType=${param.dsType}&`;
      }

    } else {
      if (sort[0] === 'refDfCount') {
        url += `findByDsNameContainingOrderByRefDfCount${sortStr}?`;
      } else {
        url += `findByDsNameContaining?`;
      }
    }

    url += `dsName=${encodeURIComponent(param.searchText)}&projection=listing&${CommonUtil.objectToUrlString(param.page)}`;

    return this.get(url);

  }

  /**
   * Fetch grid data according to file type (csv, excel)
   * @param param
   * @returns {Promise<any>}
   */
  public getFileGridInfo(param) {


    //let url = this.API_URL + 'preparationdatasets/file/' + param.fileKey;
    let url = this.API_URL + 'preparationdatasets/file_grid?storedUri=' + encodeURI(param.storedUri);

/*
    if (param.fileType === 'csv' || param.fileType === 'txt') {

      url += '?hasFields=N';

      if (param.delimiter) {
        url += `&delimiterCol=${encodeURI(param.delimiter)}`;
      }

    } else {

      url += '?sheetname=' + encodeURI(param.sheetname) + '&hasFields=N'
    }
*/
    if (param.fileType === 'csv' || param.fileType === 'txt') {
      if (param.delimiter) {
        url += `&delimiterCol=${encodeURI(param.delimiter)}`;
      }
    }

    return this.get(url);

  }

  // 파일 조회
  public getImportedPreviewReload(dsId: string) {
      return this.get(this.API_URL + 'preparationdatasets/reload_preview/' + dsId );
  }

  public getDataPreview(dsId: string) {
    return this.get(this.API_URL + 'preparationdatasets/' + dsId +'?projection=detail');
  }


  // Wrangled 데이터셋 조회
  public getDatasetWrangledData(datasetId: string): Promise<any> {
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;
    let params = ['ruleIdx=','count=1000', 'offset=0'];
    url = url + '?' + params.join('&');
    return this.get(url);
  }

  // 데이터셋  저장 HIVE
  public createDatasetJdbc(datasetJdbc: PrDatasetJdbc) {
    /*
    if(datasetJdbc.databaseName && 0<datasetJdbc.databaseName.length) {
      datasetJdbc.custom = JSON.stringify({"databaseName":datasetJdbc.databaseName});
    }
    */
    console.info('datasetJdbc', datasetJdbc);

    let params = {};
    for (var i in datasetJdbc) {
      if(i==='dataconnection') { continue; }
      params[i] = datasetJdbc[i];
    }

    //return this.post(this.API_URL + 'preparationdatasets', datasetJdbc);
    return this.post(this.API_URL + 'preparationdatasets', params);
  }

  // 데이터셋  저장
  //public createDataset(datasetFile: DatasetFile, delimiter) {
  public createDataset(datasetFile: PrDatasetFile, delimiter) {
    const params: any = {};
    /*
    params.filename = datasetFile.filename;
    params.filekey = datasetFile.filekey;
    params.dsName = datasetFile.name;
    params.dsDesc = datasetFile.desc;
    params.dsType = 'IMPORTED';
    params.importType = 'FILE';
    params.fileType = datasetFile.fileType;
    */
    params.delimiter = datasetFile.delimiter;
    params.dsName = datasetFile.dsName;
    params.dsDesc = datasetFile.dsDesc;
    params.dsType = 'IMPORTED';
    params.importType = 'UPLOAD';
    params.filenameBeforeUpload = datasetFile.filenameBeforeUpload;
    params.storageType = datasetFile.storageType;
    params.sheetName = datasetFile.sheetName;
    //params.storageType = datasetFile.storageType;
    params.storedUri = datasetFile.storedUri;

    console.info('datasetFile', datasetFile);
    /*
    var filename = datasetFile.filename.toLowerCase();
    if( true==filename.endsWith("xls") || true==filename.endsWith("xlsx") ) {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"EXCEL", "sheet":"` + datasetFile.sheetname + `", "delimiter":"`+delimiter +`"}`;
    } else if ( true==filename.endsWith("json") ) {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"JSON"}`;
    } else {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"DSV", "delimiter":"`+delimiter +`"}`;
    }
    */

    var filenameBeforeUpload = datasetFile.filenameBeforeUpload.toLowerCase();
    if( true==filenameBeforeUpload.endsWith("xls") || true==filenameBeforeUpload.endsWith("xlsx") ) {
      params.fileFormat = "EXCEL";
    } else if( true==filenameBeforeUpload.endsWith("csv") || true==filenameBeforeUpload.endsWith("txt") ) {
      params.fileFormat = "CSV";
    } else if( true==filenameBeforeUpload.endsWith("json") ) {
      params.fileFormat = "JSON";
    }
    /*
    if (isUndefined(datasetFile.sheets)) {
      params.custom = `{"fileType":"CSV", "delimiter":"`+delimiter +`"}`;
    } else if (datasetFile.sheets.length === 0) {
      params.custom = `{"fileType":"CSV", "delimiter":"`+delimiter+`"}`;
    } else { //TODO : sheet가 여러개 있는데 하나만 보내고 있었음
      params.custom = '{"fileType":"EXCEL", "sheet":"' + datasetFile.sheetname + '"}';
    }
    */
    //return this.post(this.API_URL + 'preparationdatasets', params);
    return this.post(this.API_URL + 'preparationdatasets?storageType='+datasetFile.storageType, params);
  }

  // 데이터셋  수정
  public updateDataset(dataset: any) {
    return this.patch(this.API_URL + 'preparationdatasets/' + dataset.dsId, dataset);
  }

  // 데이터셋 연쇄 삭제
  public deleteChainDataset(dsId: string) {
    return this.delete(this.API_URL + 'preparationdatasets/delete_chain/' + dsId);
  }

  // 데이터셋 삭제
  public deleteDataset(dsId: string) {
    return this.delete(this.API_URL + 'preparationdatasets/' + dsId);
  }

  // database connection check connection
  public checkConnection(connectionRequest: ConnectionRequest) {
    return this.post(this.API_URL + 'connections/query/check', connectionRequest);
  }

  // data connection 저장.
  public saveConnection(dataconnection: Dataconnection) {
    return this.post(this.API_URL + 'connections', dataconnection);
  }

  // staging connection info 가져오기
  public getStagingConnectionInfo() {
    return this.get(this.API_URL + 'preparationdatasets/getStagingConnection');
  }

  public setConnInfo(info:any) {
    this.connInfo = info;
  }

  public getStagingSchemas() {
    const params:any = {};
    params.connection = this.connInfo;

    return this.post(this.API_URL + 'preparationdatasets/query/schemas', params);
  } // function - getStagingSchemas

  public getStagingTables(schema:string) {
    const params:any = {};
    params.connection = this.connInfo;
    params.schema = schema;

    return this.post(this.API_URL + 'preparationdatasets/query/tables', params);
  } // function - getStagingTables

  public getStagingTableData(schema:string, table:string) {
    const params:any = {};
    params.connection = this.connInfo;
    params.schema = schema;
    // params.type = 'TABLE';
    params.type = 'QUERY';
    params.query = 'select * from ' + schema + '.' + table;

    const path = '/preparationdatasets/staging?sql=' + encodeURIComponent(params.query) + '&dbname='+schema+'&tblname =' + table + '&size=50';

    return this.get(this.API_URL + path);
    // return this.post(this.API_URL + 'connections/query/data', params);
  } // function - getStagingTableData


  public getResultWithStagingDBQuery(query: string) {

    const path = '/preparationdatasets/staging?sql=' + encodeURIComponent(query) + '&size=50';

    return this.get(this.API_URL + path);
  } // function - getResultWithStagingDBQuery


  // 테이블 상세조회
  public getTableDetailWitoutId(param: any, extractColumnName: boolean = false): Promise<any>  {
    return this.post(this.API_URL + 'connections/query/data?extractColumnName=' + extractColumnName, param);
  }


  public checkHdfs() {
    const path = '/preparationdatasets/check_hdfs';
    return this.get(this.API_URL + path);
  } // function - checkHdfs

  /**
   * Check asynchronously if file is uploaded
   * @param {string} fileKey
   */
  /*
  public checkFileUploadStatus(fileKey: string) {
    return this.post(this.API_URL + 'preparationdatasets/upload_async_poll', fileKey);
  }
  */
  public checkFileUploadStatus(storedUri: string) {
    return this.post(this.API_URL + 'preparationdatasets/upload_async_poll', storedUri);
  }

  /**
   * Create dataset
   * @param param
   * @returns {Promise<any>}
   */
  public createDataSet(param : any) : Promise<any>  {
    return this.post(this.API_URL + 'preparationdatasets', param);
  }
}
