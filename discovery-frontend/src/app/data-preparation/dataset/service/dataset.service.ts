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
import { DatasetHive, DatasetJdbc, DatasetFile, Datasets } from '../../../domain/data-preparation/dataset';
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

    let url = this.API_URL + `preparationdatasets/search/`;
    let sort;
    if (param.refDfCountSort) {
      sort = param.refDfCountSort[0].toUpperCase() + param.refDfCountSort.slice(1);
    }

    // dsType X , refDfCount X
    if (param.dsType === '' && !param.refDfCountSort) {
      url += `findByDsNameContaining?`;
    } else if (param.dsType === '' && param.refDfCountSort ) { // dsType X, refDfCount 0
      url += `findByDsNameContainingOrderByRefDfCount${sort}?`;
    }

    // dsType 0 , refDfCount X
    if (param.dsType !== '' && !param.refDfCountSort) {
      url += `findByDsNameContainingAndDsType?dsType=${param.dsType}&`;
    } else if (param.dsType !== '' && param.refDfCountSort) { // dsType 0 , refDfCount 0
      url += `findByDsNameContainingAndDsTypeOrderByRefDfCount${sort}?dsType=${param.dsType}&`;
    }

    url += `dsName=${encodeURIComponent(param.searchText)}&projection=listing&${CommonUtil.objectToUrlString(param.page)}`;
    return this.get(url);

  }

  // 데이터셋 엑셀 파일 조회
  public getDatasetExcelFile(datasetFile: DatasetFile) {
    return this.get(this.API_URL + 'preparationdatasets/file/' + datasetFile.filekey + '?sheetname=' + encodeURI(datasetFile.sheetname) + '&hasFields=N');
  }

  // CSV 파일 조회
  public getDatasetCSVFile(datasetFile: DatasetFile) {
    return this.get(this.API_URL + 'preparationdatasets/file/' + datasetFile.filekey + '?hasFields=N');
    //return this.get(this.API_URL + 'preparationdatasets/file/' + datasetFile.filekey + '?resultSize=4096&hasFields=N');
  }


  /**
   * Fetch grid data according to file type (csv, excel)
   * @param param
   * @returns {Promise<any>}
   */
  public getFileGridInfo(param) {


    let url = this.API_URL + 'preparationdatasets/file/' + param.fileKey;

    if (param.fileType === 'csv' || param.fileType === 'txt') {

      url += '?hasFields=N';

      if (param.delimiter) {
        url += `&delimiterCol=${encodeURI(param.delimiter)}`;
      }

    } else {

      url += '?sheetname=' + encodeURI(param.sheetname) + '&hasFields=N'
    }


    return this.get(url);

  }

  // 파일 조회
  public getDatasetFile(fileKey: string, sheetname: string) {
    if (sheetname === '') {
      return this.get(this.API_URL + 'preparationdatasets/file/' + fileKey + '?resultSize=4096&hasFields=N');
    } else {
      return this.get(this.API_URL + 'preparationdatasets/file/' + fileKey + '?sheetname=' + encodeURI(sheetname) + '&hasFields=N')
    }
  }

  // 파일 조회
  public getImportedPreviewReload(dsId: string) {
      return this.get(this.API_URL + 'preparationdatasets/reload_preview/' + dsId );
  }

  public getDataPreview(dsId: string) {
    return this.get(this.API_URL + 'preparationdatasets/' + dsId +'?projection=detail');
  }

  /*
  public getImportedHiveRows(dsId: string) {
    return this.get(this.API_URL + 'preparationdatasets/cal_rows/' + dsId, true);
  }
  */

  // Wrangled 데이터셋 조회
  public getDatasetWrangledData(datasetId: string): Promise<any> {
    let url = this.API_URL + `preparationdatasets/${datasetId}/transform`;
    let params = ['ruleIdx=','count=1000', 'offset=0'];
    url = url + '?' + params.join('&');
    return this.get(url);
  }

  // 데이터셋  저장 HIVE
  public createDatasetHive(datasetHive: DatasetHive) {
    if(datasetHive.databaseName && 0<datasetHive.databaseName.length) {
      datasetHive.custom = JSON.stringify({"databaseName":datasetHive.databaseName});
    }
    console.info('datasetHive', datasetHive);
    return this.post(this.API_URL + 'preparationdatasets', datasetHive);
  }

  // 데이터셋  저장 HIVE
  public createDatasetJdbc(datasetJdbc: DatasetJdbc) {
    if(datasetJdbc.databaseName && 0<datasetJdbc.databaseName.length) {
      datasetJdbc.custom = JSON.stringify({"databaseName":datasetJdbc.databaseName});
    }
    console.info('datasetJdbc', datasetJdbc);
    return this.post(this.API_URL + 'preparationdatasets', datasetJdbc);
  }

  // 데이터셋  저장
  public createDataset(datasetFile: DatasetFile, delimiter) {
    const params: any = {};
    params.filename = datasetFile.filename;
    params.filekey = datasetFile.filekey;
    params.dsName = datasetFile.name;
    params.dsDesc = datasetFile.desc;
    params.dsType = 'IMPORTED';
    params.importType = 'FILE';
    params.fileType = datasetFile.fileType;
    console.info('datasetFile', datasetFile);
    var filename = datasetFile.filename.toLowerCase();
    if( true==filename.endsWith("xls") || true==filename.endsWith("xlsx") ) {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"EXCEL", "sheet":"` + datasetFile.sheetname + `", "delimiter":"`+delimiter +`"}`;
    } else if ( true==filename.endsWith("json") ) {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"JSON"}`;
    } else {
      params.custom = `{"filePath":"`+datasetFile.filepath+`", "fileType":"DSV", "delimiter":"`+delimiter +`"}`;
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
    return this.post(this.API_URL + 'preparationdatasets', params);
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

  public deleteDatasets(dsIds: any) {
    return this.put(this.API_URL + 'preparationdatasets/delete_datasets', dsIds);
  }

  // database connection check connection
  public checkConnection(connectionRequest: ConnectionRequest) {
    return this.post(this.API_URL + 'connections/query/check', connectionRequest);
  }

  // data connection 저장.
  public saveConnection(dataconnection: Dataconnection) {
    return this.post(this.API_URL + 'connections', dataconnection);
  }

  // data connection list 가져오기
  public getConnections() {
    return this.get(this.API_URL + 'connections');
  }

  // 데이터커넥션 목록
  public getDataconnections(param: any, projection: string = 'list'): Promise<any[]> {

    let url = this.API_URL + `connections`;

    if (param.hasOwnProperty('implementor') && param.hasOwnProperty('name')) {
      url += '/search/nameAndimplementor';
    } else if (param.hasOwnProperty('implementor')) {
      url += '/search/implementor';
    } else if (param.hasOwnProperty('name')) {
      url += '/search/name';
    }

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + '&projection=' + projection);
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

  public getJdbcTableData(dcId: string, dbName:string, table:string) {
    const params:any = {};
    params.dcid = dcId;
    params.schema = dbName;
    // params.type = 'TABLE';
    params.type = 'QUERY';
    params.query = 'select * from ' + dbName + '.' + table;

    const path = '/preparationdatasets/jdbc?sql=' + encodeURIComponent(params.query) + '&dcid=' + dcId + '&dbname='+dbName+'&tblname =' + table + '&size=50';

    return this.get(this.API_URL + path);
    // return this.post(this.API_URL + 'connections/query/data', params);
  } // function - getJdbcTableData


  public getResultWithJdbcQuery(dcId:string, dbName:string, query: string) {

    const path = 'preparationdatasets/jdbc?sql=' + encodeURIComponent(query) + '&dcid=' + dcId + '&dbname='+dbName+'&size=50';

    return this.get(this.API_URL + path);
  } // function - getResultWithJdbcQuery

  // 테이블 상세조회
  public getTableDetailWitoutId(param: any, extractColumnName: boolean = false): Promise<any>  {
    return this.post(this.API_URL + 'connections/query/data?extractColumnName=' + extractColumnName, param);
  }



  /*
  public checkStagingConnection() {
    const path = '/preparationdatasets/checkStagingConnection';
    return this.get(this.API_URL + path);
  } // function - checkStagingConnection
  */

  public checkHdfs() {
    const path = '/preparationdatasets/check_hdfs';
    return this.get(this.API_URL + path);
  } // function - checkHdfs

  /**
   * Check asynchronously if file is uploaded
   * @param {string} fileKey
   */
  public checkFileUploadStatus(fileKey: string) {
    return this.post(this.API_URL + 'preparationdatasets/upload_async_poll', fileKey);
  }
}
