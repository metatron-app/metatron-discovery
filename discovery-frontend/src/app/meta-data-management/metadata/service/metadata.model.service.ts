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

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../../common/service/abstract.service';
import {Metadata} from '../../../domain/meta-data-management/metadata';

@Injectable()
export class MetadataModelService extends AbstractService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Dictionary url
  private URL_METADATA = this.API_URL + 'metadatas';

  // 생성시 사용되는 데이터 오브젝트
  private _selectedMetadata: Metadata;

  // 생성시 사용되는 데이터 오브젝트
  private _createData: object = {};
  // 생성시 사용하는 생성 step
  private _createStep: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedMetadata: Metadata;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 메타데이터 조회
   * @returns {Metadata}
   */
  public getMetadata(): Metadata {
    return this._selectedMetadata;
  }

  /**
   * 메타데이터 갱신
   * @param {Metadata} metadata
   */
  public setMetadata(metadata: Metadata): void {
    // metadata.source.sourceInfo = {
    //   "Partition Fields":[
    //
    //   ],
    //   "Detail Information":{
    //     "Database:":"default",
    //     "Owner:":"hive",
    //     "CreateTime:":"Wed Jul 17 13:46:48 KST 2019",
    //     "LastAccessTime:":"UNKNOWN",
    //     "Retention:":"0",
    //     "Location:":"hdfs://localhost:9000/user/hive/warehouse/sales25",
    //     "Table Type:":"MANAGED_TABLE",
    //     "Table Parameters:":null,
    //     "COLUMN_STATS_ACCURATE":"{\\\"BASIC_STATS\\\":\\\"true\\\"}",
    //     "numFiles":"0",
    //     "numRows":"0",
    //     "rawDataSize":"0",
    //     "totalSize":"0",
    //     "transient_lastDdlTime":"1563338808"
    //   },
    //   "Storage Information":{
    //     "SerDe Library:":"org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
    //     "InputFormat:":"org.apache.hadoop.mapred.TextInputFormat",
    //     "OutputFormat:":"org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
    //     "Compressed:":"No",
    //     "Num Buckets:":"-1",
    //     "Bucket Columns:":"[]",
    //     "Sort Columns:":"[]",
    //     "Storage Desc Params:":null,
    //     "serialization.format":"1"
    //   },
    //   "Partition Information":{
    //   },
    //   "schema":"default"
    // };
    this._selectedMetadata = metadata;
  }

  public updateMetadataName(name: string): void {
    this._selectedMetadata.name = name;
  }

  /**
   * 생성 데이터 오브젝트 조회
   * @returns {Object}
   */
  public getCreateData(): object {
    return this._createData;
  }

  /**
   * 생성 데이터 오브젝트 갱신
   * @param {Object} createData
   */
  public setCreateData(createData: object): void {
    this._createData = createData;
  }

  /**
   * 생성 데이터 오브젝트 갱신
   * @param {string} propertyName
   * @param value
   */
  public patchCreateData(propertyName: string, value: any): void {
    this._createData[propertyName] = value;
  }

  /**
   * 생성시 사용하는 step 조회
   * @returns {string}
   */
  public getCreateStep(): string {
    return this._createStep;
  }

  /**
   * 생성시 사용하는 step 설정
   * @param {string} step
   */
  public setCreateStep(step: string): void {
    this._createStep = step;
  }
}
