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
import { Component, ElementRef, HostListener, Injector } from '@angular/core';
import { DatasourceService } from '../../../../../../datasource/service/datasource.service';

@Component({
  selector: 'ingestion-log-details',
  templateUrl: './ingestion-log.component.html'
})
export class IngestionLogComponent extends AbstractComponent {
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
  public ingestionProgress: any;


  // 생성자
  constructor(private _datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * on scrolled event
   * @param {MouseEvent} event
   */
  public onScrolled(event: MouseEvent): void {
    if (event.target['offsetHeight'] + event.target['scrollTop'] >= event.target['scrollHeight'] && !this._isGetAllLog) {
      // get ingestion result details
      this._getIngestionDetails(this._datasourceId, this.historyId);
    }
  }

  /**
   * init
   */
  public init(datasourceId: string, historyId: string, ingestionProgress?: any) {
    // init view
    this._initView();
    this._datasourceId = datasourceId;
    this.historyId = historyId;
    this.ingestionProgress = ingestionProgress;
    this.isShow = true;

    this._isGetAllLog = false;

    // get ingestion result details
    if (historyId && ingestionProgress && ingestionProgress.message === 'ENGINE_RUNNING_TASK') {
      this._getIngestionDetails(this._datasourceId, this.historyId, -10000);
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
    this.historyId = null;
    this.ingestionProgress = null;
  }


}
