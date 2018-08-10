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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Dataconnection } from '../../../../domain/dataconnection/dataconnection';
import { Workbench } from '../../../../domain/workbench/workbench';
import { isUndefined } from 'util';
import { Alert } from '../../../../common/util/alert.util';
import { WorkbenchService } from '../../../service/workbench.service';
import { CommonConstant } from '../../../../common/constant/common.constant';

@Component({
  selector: 'detail-workbench-variable',
  templateUrl: './detail-workbench-variable.html',
})
export class DetailWorkbenchVariable extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public workbench: Workbench;

  // gloval add editor
  @Output()
  public addVariableEvent: EventEmitter<string> = new EventEmitter();

  // 조회된 데이터
  public globalVar: any[] = [];

  // 선택된 combo
  public selectedData: any[] = [
      { key: 'c', name: this.translateService.instant('msg.bench.ui.calen') },
      { key: 't', name: this.translateService.instant('msg.bench.ui.text') }
    ];

  // 저장된 변수 리스트
  public variableList: any[] = [];

  // 선택된 결과값.
  public selectedType: any = this.selectedData[0];

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 글로벌 변수 최대 갯수
  private globalVariableMax: number = 30;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbecnService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    if (!isUndefined(this.workbench)) {
      if (!isUndefined(this.workbench.globalVar)) {
        this.variableList = JSON.parse(this.workbench.globalVar);
      }
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    const workbenchPrarm: any = {};
    workbenchPrarm.id = this.workbench.id;
    workbenchPrarm.name = this.workbench.name;
    if (!isUndefined(this.workbench.description)) {
      workbenchPrarm.description = this.workbench.description;
    }
    if (!isUndefined(this.workbench.favorite)) {
      workbenchPrarm.favorite = this.workbench.favorite;
    }
    if (!isUndefined(this.workbench.tag)) {
      workbenchPrarm.tag = this.workbench.tag;
    }
    workbenchPrarm.folderId = this.workbench.folderId;
    workbenchPrarm.workspace = CommonConstant.API_CONSTANT.API_URL + 'workspace/' + this.workbench.workspace.id;
    workbenchPrarm.dataConnection = CommonConstant.API_CONSTANT.API_URL + 'dataconnections/' + this.workbench.dataConnection.id;

    workbenchPrarm.globalVar = JSON.stringify(this.variableList);
    this.workbecnService.updateWorkbench(workbenchPrarm)
      .then((result) => {
        if (!isUndefined(result.globalVar)) {
          this.workbench.globalVar = result.globalVar;
        }
      })
      .catch((error) => {
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필터 선택
  public onSelectedFilter(event) {
    console.info(event);
    this.selectedType = event;
  }

  public toggleSelectedFilter() {
    this.isShowSelectList = !this.isShowSelectList;
  }

  // 새 변수 추가
  public addVariable() {
    if (this.isGlobalVariableAddEnable) {
      const tmp = {
        globalType: this.selectedType.key,
        globalNm: '',
        globalVar: ''
      };
      this.variableList.unshift(tmp);
    } else {
      Alert.warning(this.translateService.instant('msg.bench.alert.global-variable.limit'));
    }
  }

  // 새 변수 에디터 창에 반영
  public addVariableEditor(item) {
    event.stopPropagation();
    if (item.globalNm === '') {
      Alert.info(this.translateService.instant('msg.bench.alert.input.variable.name'));
      return;
    }
    if (item.globalVar === '') {
      Alert.info(this.translateService.instant('msg.bench.alert.input.variable.val'));
      return;
    }
    this.addVariableEvent.emit('${' + item.globalNm + '}');
  }

  // 변수 삭제
  public deleteVariableRow(item) {
    event.stopPropagation();
    this.variableList = this.variableList.filter(obj => obj !== item);
  }

  /**
   * 글로벌 변수가 추가 가능한 상태인지 확인
   * @returns {boolean}
   */
  public get isGlobalVariableAddEnable(): boolean {
    return this.variableList.length < this.globalVariableMax;
  }


  /**
   * 글로벌 변수 icon
   * @param {string} key
   * @returns {string}
   */
  public getGlobalVariabledIcon(key: string): string {
    let icon: string = '';
    switch (key) {
      case 'c':
        icon = 'ddp-icon-type-calen3';
        break;
      case 't':
        icon = 'ddp-icon-type-text';
        break;
    }
    return icon;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
