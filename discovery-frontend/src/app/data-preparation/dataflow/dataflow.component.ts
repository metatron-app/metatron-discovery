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

import { Component, ElementRef, OnInit, Injector, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { DataflowService } from './service/dataflow.service';
import { Dataflow } from '../../domain/data-preparation/dataflow';
import { Subscription } from 'rxjs/Subscription';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Alert } from '../../common/util/alert.util';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { CreateDataflowNameDescComponent } from './create-dataflow-name-desc.component';

@Component({
  selector: 'app-dataflow',
  templateUrl: './dataflow.component.html',
  providers: [MomentDatePipe]
})
export class DataflowComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private popupSubscription: Subscription;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  @ViewChild(CreateDataflowNameDescComponent)
  public createDataflowComponent : CreateDataflowNameDescComponent;

  // 데이터플로우 리스트
  public dataflows : Dataflow[] = [];

  // 상세 조회 할 데이터 플로우 아이디
  public dfId: string;

  // popup status
  public step: string;

  // Selected dataflow that you want to delete
  public selectedDeletedfId: string;

  // search text
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private dataflowService: DataflowService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this.page.sort = 'createdTime,desc';
    this.getDataflows();


  }

  public ngOnDestroy() {

    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터 플로우 생성
  public createDataflow() {
    this.createDataflowComponent.init();
  }


  // 데이터 플로우 수정
  public updateDataflow(dfId) {
    this.router.navigate(['/management/datapreparation/dataflow',dfId]);
  }

  // 데이터 플로우 검색
  public searchDataflows(event) {

    if (13 === event.keyCode) {
      this.page.page = 0;
      this.getDataflows();
    } else if (27 === event.keyCode) {
      this.searchText = '';
      this.page.page = 0;
      this.getDataflows();
    }
  }

  public confirmDelete(event,id) {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.dp.alert.df.del.description');
    modal.btnName = this.translateService.instant('msg.comm.btn.modal.done');

    this.selectedDeletedfId = id;
    this.deleteModalComponent.init(modal);

  }

  public deleteDataflow() {
    this.loadingShow();
    this.dataflowService.deleteDataflow(this.selectedDeletedfId).then(() => {
      Alert.success(this.translateService.instant('msg.dp.alert.del.success'));
      this.loadingHide();

      let idx = this.dataflows.findIndex((result) => {
        return result.dfId === this.selectedDeletedfId;
      });
      this.dataflows.splice(idx,1);
      this.pageResult.totalElements = this.pageResult.totalElements-1

    }).catch((error) => {
      Alert.error(this.translateService.instant('msg.dp.alert.del.fail'));
      this.loadingHide();
    });

  }

  // 데이터 플로우 목록 조회
  public getDataflows() {

    this.loadingShow();

    this.dataflowService.getDataflows(this.searchText, this.page, 'forListView')
      .then((data) => {

        this.loadingHide();

        this.pageResult = data['page'];
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];

        if (this.page.page === 0) {
          this.dataflows = [];
        }

        this.dataflows = this.dataflows.concat(data['_embedded']['preparationdataflows']);
        this.page.page += 1;
      })
      .catch((error) => {
        if(error.status && error.status===500) {
          Alert.error(error.message);
        } else {
          Alert.warning(error.message);
        }
        this.loadingHide();
      });
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  private _onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13  && this.deleteModalComponent.isShow) {
      this.deleteModalComponent.done();
    } else if (event.keyCode === 13 && this.createDataflowComponent.isShow) {
      this.createDataflowComponent.createDataflow();
    }
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
