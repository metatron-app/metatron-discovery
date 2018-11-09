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
  // historyId
  private _historyId: string;
  // show flag
  public isShow = false;
  // data
  public detailData: any;

  // 생성자
  constructor(private _datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      // get ingestion result details
      this._getIngestionDetails(this._datasourceId, this._historyId);
    }
  }

  /**
   * init
   */
  public init(datasourceId: string, historyId: string) {
    this._datasourceId = datasourceId;
    this._historyId = historyId;
    this.isShow = true;
    // get ingestion result details
    this._getIngestionDetails(this._datasourceId, this._historyId, -10000);
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
    // loading show
    this.loadingShow();
    this._datasourceService.getDatasourceIngestionLog(datasourceId, historyId, offset)
      .then((result) => {
        this.detailData = result['logs'];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

}
