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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MomentDatePipe} from '@common/pipe/moment.date.pipe';
import {AbstractComponent} from '@common/component/abstract.component';
import {PrDataflow, Dataflows} from '@domain/data-preparation/pr-dataflow';
import {DataflowService} from '../dataflow/service/dataflow.service';

@Component({
  selector: 'app-add-dataset-dataflow',
  templateUrl: './add-dataset-dataflow.component.html',
  providers: [MomentDatePipe]
})
export class AddDatasetDataflowComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output('close')
  private closePopup = new EventEmitter();

  @Input()
  public datasetName: string;

  @Input()
  public datasetId: string;

  @Input('dfStr')
  public set setDfStr(dfStr) {
    if (!this.isNullOrUndefined(dfStr)) {
      this.dataflowIds = dfStr.split(',');
    }
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedDataflowId : string = '';

  public selectedContentSort: Order = new Order();

  public searchText: string = '';

  public dataflowIds : string[];

  public dataflows : PrDataflow[];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataflowService: DataflowService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    // Since existing dataflow is deleted from list
    this.page.size = 30;

    this.getDataflows();


  }

  public ngOnDestroy() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public close() {
    this.closePopup.emit();
  }

  public apply() {

    if (this.selectedDataflowId === '') {
      return;
    }

    let dsIds = [];

    this.loadingShow();

    // first get dataflow info -> need dataset ids in this dataflow
    this.dataflowService.getDataflow(this.selectedDataflowId).then((result) => {

      console.log('result ==> ', result );
      if (result.datasets && result.datasets.length > 0) {
        dsIds = result.datasets.map((item) => {
          return item.dsId;
        });

      }

      // add current dataset
      dsIds.push(this.datasetId);

      // update dataflow with dataset ids
      this.dataflowService.updateDataSets(this.selectedDataflowId, { dsIds : dsIds }).then((_result) => {
        this.router.navigate(['/management/datapreparation/dataflow', this.selectedDataflowId]);
        this.cookieService.set('FIND_WRANGLED',this.datasetId);

      }).catch((error) => {
        this.loadingHide();
        console.log('error -> ', error);
      });

    }).catch((error => {
      this.loadingHide();
      console.log('error -> ', error);
    }));




    this.closePopup.emit();
  }

  public getDataflows() {

    this.loadingShow();
    this.dataflowService.getDataflows(this.searchText, this.page, 'forListView').then((result : Dataflows) => {

      this.loadingHide();

      this.pageResult = result['page'];
      const sorting = this.page.sort.split(',');
      this.selectedContentSort.key = sorting[0];
      this.selectedContentSort.sort = sorting[1];

      if (this.page.page === 0) {
        this.dataflows = [];
      }

      if (result['_embedded'] && result['_embedded']['preparationdataflows'].length > 0) {

        this.dataflows = this.dataflows.concat(result['_embedded']['preparationdataflows']);
        this.page.page += 1;

        if (!this.isNullOrUndefined(this.dataflowIds)) {
          this.dataflows = this.dataflows.filter((item) => {
            return -1 === this.dataflowIds.indexOf(item.dfId)
          })
        }
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  public getDataflowLength() {

    let result : number = 0;
    if (this.pageResult) {
      result = this.pageResult.totalElements;
    }
    return result;
  }

  public selectDataflow(dataflow:PrDataflow) {
    this.selectedDataflowId = dataflow.dfId;
  }

  public refreshSearch() {
    this.searchText = '';
    this.page.page = 0;
    this.getDataflows();
  }

  /** 정렬 */
  public changeOrder(column: string) {

    this.page.page = 0;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;

    // asc, desc, default
    switch (this.selectedContentSort.sort) {

      case 'asc':
        this.selectedContentSort.sort = 'desc';
        break;
      case 'desc':
        this.selectedContentSort.sort = 'asc';
        break;
      case 'default':
        this.selectedContentSort.sort = 'desc';
        break;
    }

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    // 데이터소스 리스트 조회
    this.getDataflows();

  }

  // 데이터 플로우 검색
  public searchDataflow(event) {

    if (13 === event.keyCode) {
      this.page.page = 0;
      this.getDataflows();
    } else if (27 === event.keyCode) {
      this.searchText = '';
      this.page.page = 0;
      this.getDataflows();
    }
  }


}



class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
