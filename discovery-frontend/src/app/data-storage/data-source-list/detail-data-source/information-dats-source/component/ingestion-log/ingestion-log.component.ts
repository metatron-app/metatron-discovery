/*
 *
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

import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import { Component, ElementRef, HostListener, Injector, ViewChild } from '@angular/core';
import { DatasourceService } from '../../../../../../datasource/service/datasource.service';
import {DataStorageConstant} from "../../../../../constant/data-storage-constant";

@Component({
  selector: 'ingestion-log-details',
  templateUrl: './ingestion-log.component.html'
})
export class IngestionLogComponent extends AbstractComponent {
  // scroll elements
  @ViewChild('scrollElf')
  private _scrollElements: ElementRef;

  // datasourceId
  private _datasourceId: string;

  // is get all log
  private _isGetAllLog: boolean;

  // show flag
  public isShow = false;
  // data
  public detailDatas: any;
  // historyId
  public historyId: string;
  // ingestionProgress
  public ingestionProgress: DataStorageConstant.Datasource.IngestionStep;
  // failResults object
  public failResultsObject: any;

  // enum
  readonly INGESTION_STEP = DataStorageConstant.Datasource.IngestionStep;


  // 생성자
  constructor(private _datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * init
   * @param {string} datasourceId
   * @param {string} historyId
   * @param {string} progress
   * @param failResults
   */
  public init(datasourceId: string, historyId: string, ingestionProgress?) {
    // init view
    this._initView();
    // set datasource id
    this._datasourceId = datasourceId;
    // set history id
    this.historyId = historyId;
    // if exist ingestion progress
    if (ingestionProgress) {
      // progress status step
      this.ingestionProgress = ingestionProgress['message'];
      // set fail object
      this.failResultsObject = ingestionProgress['failResults'];
    }
    // show log component
    this.isShow = true;
    // is get all log
    this._isGetAllLog = false;
    // get ingestion result details
    if (historyId && this.ingestionProgress === DataStorageConstant.Datasource.IngestionStep.ENGINE_RUNNING_TASK) {
      this._getIngestionDetails(this._datasourceId, this.historyId);
    }
  }

  /**
   * close
   */
  public close() {
    this.isShow = false;
  }

  /**
   * Get ingestion result details
   * @param {string} datasourceId
   * @param {string} historyId
   * @param {number} offset
   * @private
   */
  private _getIngestionDetails(datasourceId: string, historyId: string, offset?: number): void {
    // check is all log
    if (!offset && !this._isGetAllLog) {
      this._isGetAllLog = true;
    }
    // loading show
    this.loadingShow();
    this._datasourceService.getDatasourceIngestionLog(datasourceId, historyId, offset)
      .then((result) => {
        this.detailDatas = this.detailDatas.concat(result['logs'].split('\n'));
        // detect changes
        this.safelyDetectChanges();
        // scroll to bottom
        this._scrollElements.nativeElement.scrollTop = this._scrollElements.nativeElement.scrollHeight;
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        if (error['details']) {
          this.detailDatas = error['details'].split('\n');
        }
        // loading hide
        this.loadingHide();
      });
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // init
    this.detailDatas = [];
    this.historyId = undefined;
    this.ingestionProgress = undefined;
    this.failResultsObject = undefined;
  }


}
