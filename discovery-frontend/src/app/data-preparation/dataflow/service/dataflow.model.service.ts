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

import * as _ from 'lodash' ;
import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {AbstractService} from '@common/service/abstract.service';
import {DsType, PrDataset} from '@domain/data-preparation/pr-dataset';

@Injectable()
export class DataflowModelService extends AbstractService {

  private datasetsFromDataflow: PrDataset[] = [];

  private upstreamList = [];

  public scrollClose = new Subject();
  public scrollClose$ = this.scrollClose.asObservable();

  private _selectedDsId: string;

  private _selectedDsType: DsType;

  /**
   * Returns list of original Dataset list
   * @returns { string [] }
   */
  public getDatasetsFromDataflow () : PrDataset[] {
    return this.datasetsFromDataflow;
  }


  /**
   * Set datasetIds From Dataflow from outer
   * @param {String[]} datasets
   */
  public setDatasetsFromDataflow (datasets : PrDataset[]) {
    this.datasetsFromDataflow = datasets;
  }

  public setUpstreamList(upstream) {
    this.upstreamList = upstream;
  }

  public getUpstreamList() {
    return this.upstreamList;
  }

  public getSelectedDsId(): string {
    return this._selectedDsId;
  }

  public setSelectedDsId(value: string) {
    this._selectedDsId = value;
  }

  public getSelectedDsType(): DsType {
    return this._selectedDsType;
  }

  public setSelectedDsType(value: DsType) {
    this._selectedDsType = value;
  }

  public isSelectedDsIdAndDsTypeEmpty() : boolean {
    return _.isNil(this._selectedDsId);
  }

  public emptyDsIdAndDsType() {
    this._selectedDsId = null;
    this._selectedDsType = null;
  }

}
