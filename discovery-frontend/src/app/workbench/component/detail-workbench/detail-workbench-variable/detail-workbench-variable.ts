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
import { Workbench } from '../../../../domain/workbench/workbench';
import { isUndefined } from 'util';
import { WorkbenchService } from '../../../service/workbench.service';
import { CommonConstant } from '../../../../common/constant/common.constant';
import * as _ from 'lodash';
import { StringUtil } from '../../../../common/util/string.util';
import { Alert } from '../../../../common/util/alert.util';

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

  // global add editor event
  @Output()
  public addVariableEvent: EventEmitter<string> = new EventEmitter();

  // global variable list
  public variableList: any[] = [];

  // global variable type list
  public typeList: any[] = [
    { key: 'c', value: this.translateService.instant('msg.bench.ui.calen') },
    { key: 't', value: this.translateService.instant('msg.bench.ui.text') }
  ];
  // 선택된 결과값.
  public selectedType: any = this.typeList[0];

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;

  // input name variable in add panel
  public addVariableObject: any = {
    globalNm: '',
    globalVar: ''
  };

  // input name variable in edit panel;
  public editVariableInputName: string;
  // input value variable in edit panel
  public editVariableInputValue: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 글로벌 변수 최대 갯수
  private _globalVariableMax: number = 30;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    if (!isUndefined(this.workbench) && !isUndefined(this.workbench.globalVar)) {
      // variable list
      this.variableList = JSON.parse(this.workbench.globalVar);
    }
    // if exist variable list, hide add panel
    this.addVariableObject.editMode = this.variableList.length === 0 ? true : false;
  }

  public ngOnDestroy(): void {
  }

  /**
   * Get global variable icon
   * @param {string} key
   * @returns {string}
   */
  public getGlobalVariableIcon(key: string): string {
    switch (key) {
      case 'c':
        return 'ddp-icon-type-calen3';
      case 't':
        return 'ddp-icon-type-text';
      default :
        return '';
    }
  }

  /**
   * Change global variable type
   * @param type
   */
  public onChangeVariableType(type: any): void {
    //
    if (this.selectedType.value !== type.value) {
      // change type
      this.selectedType = type;
      // init value
      this.addVariableObject.globalVar = '';
    }
  }

  /**
   * Add global variable click event
   */
  public onClickAddVariable(): void {
    // check empty name
    if (this._isNotEmptyGlobalVariable(this.addVariableObject)
      && this._isNotDuplicateGlobalVariableName(this.variableList, this.addVariableObject)
      && this._isNotOverMaxVariableList()) {
      // add globalType
      this.addVariableObject.globalType = this.selectedType.key;
      // add variable in variable list
      this.variableList.push(_.cloneDeep(this.addVariableObject));
      // update global variable
      this._updateGlobalVariable().then(() => {
        // close add panel
        this.addVariableObject.editMode = false
      });
    }
  }

  /**
   * Save global variable list click event
   */
  public onClickSaveSelectedVariable(globalVariable: any): void {
    // check empty variable name
    if (this._isNotEmptyGlobalVariable(globalVariable) && this._isNotDuplicateGlobalVariableName(this.variableList.filter(item => item !== globalVariable), globalVariable)) {
      // save variable
      this._updateGlobalVariable();
    }
  }

  /**
   * Show and Hide add global variable click event
   */
  public onClickShowHideAddGlobalVariable(): void {
    // if show flag
    if (!this.addVariableObject.editMode) {
      // close edit mode in variable list
      this.variableList.forEach(item => item.editMode && this.onClickCloseEditSelectedVariable(item));
      // init global variable value
      this.addVariableObject.globalNm = '';
      this.addVariableObject.globalVar = '';
      // init error
      this.initErrorInVariable(this.addVariableObject, 'name');
      this.initErrorInVariable(this.addVariableObject, 'value');
      // init variable type
      this.selectedType = this.typeList[0];
    }
    // change add panel
    this.addVariableObject.editMode = !this.addVariableObject.editMode;
  }

  /**
   * Show edit selected global variable click event
   * @param globalVariable
   */
  public onClickShowEditSelectedVariable(globalVariable: any): void {
    // close add panel
    this.addVariableObject.editMode = false;
    // close edit mode in variable list
    this.variableList.forEach(item => item.editMode && this.onClickCloseEditSelectedVariable(item));
    // open edit mode
    globalVariable.editMode = true;
    // clone global variable value
    this.editVariableInputName = globalVariable.globalNm;
    this.editVariableInputValue = globalVariable.globalVar;
  }

  /**
   * Close edit selected global variable click event
   * @param globalVariable
   */
  public onClickCloseEditSelectedVariable(globalVariable: any): void {
    // close edit mode
    globalVariable.editMode = false;
    // reset global variable
    globalVariable.globalNm = this.editVariableInputName;
    globalVariable.globalVar = this.editVariableInputValue;
    // init error
    this.initErrorInVariable(globalVariable, 'name');
    this.initErrorInVariable(globalVariable, 'value');
  }

  /**
   * Remove selected global variable click event
   * @param globalVariable
   */
  public onClickRemoveSelectedVariable(globalVariable: any): void {
    this.variableList = _.filter(this.variableList, item => item !== globalVariable);
    // update global variable
    this._updateGlobalVariable();
  }

  /**
   * Insert selected global variable in editor click event
   * @param globalVariable
   */
  public onClickInsertSelectedVariableInEditor(globalVariable: any): void {
    this.addVariableEvent.emit('${' + globalVariable.globalNm + '}');
  }

  /**
   * Init error in variable
   * @param globalVariable
   */
  public initErrorInVariable(globalVariable: any, errorType: string): void {
    switch (errorType) {
      case 'name':
        globalVariable.isNameError = false;
        globalVariable.nameErrorMessage = '';
        break;
      case 'value':
        globalVariable.isValueError = false;
        globalVariable.valueErrorMessage = '';
        break;
    }
  }

  /**
   * Is empty global variable
   * @param globalVariable
   * @returns {boolean}
   * @private
   */
  private _isNotEmptyGlobalVariable(globalVariable: any): boolean {
    // check name
    if (StringUtil.isEmpty(globalVariable.globalNm)) {
      // set error message
      globalVariable.nameErrorMessage = this.translateService.instant('msg.common.ui.required');
      // set error flag
      globalVariable.isNameError = true;
    }
    // check value
    if (StringUtil.isEmpty(globalVariable.globalVar)) {
      // set error message
      globalVariable.valueErrorMessage = this.translateService.instant('msg.common.ui.required');
      // set error flag
      globalVariable.isValueError = true;
    }
    return !globalVariable.isNameError && !globalVariable.isValueError;
  }

  /**
   * Is exist duplicate global variable name
   * @param variableList
   * @returns {boolean}
   * @private
   */
  private _isNotDuplicateGlobalVariableName(variableList: any, globalVariable: any): boolean {
    if (_.some(variableList, item => globalVariable.globalNm.trim() === item.globalNm.trim())) {
      // set error message
      globalVariable.nameErrorMessage = 'Variable name is duplicated';
      // set error flag
      globalVariable.isNameError = true;
      return false;
    }
    return true;
  }

  /**
   * Is max global variable list
   * @returns {boolean}
   * @private
   */
  private _isNotOverMaxVariableList(): boolean {
    if (this.variableList.length >= this._globalVariableMax) {
      // alert
      Alert.warning(this.translateService.instant('msg.bench.alert.global-variable.limit'));
      return false;
    }
    return true;
  }

  /**
   * Update global variable
   * @private
   */
  private _updateGlobalVariable(): Promise<any> {
    return new Promise((resolve, reject) => {
      // loading show
      this.loadingShow();

      const params: any = {};
      params.id = this.workbench.id;
      params.name = this.workbench.name;
      if (!isUndefined(this.workbench.description)) {
        params.description = this.workbench.description;
      }
      if (!isUndefined(this.workbench.favorite)) {
        params.favorite = this.workbench.favorite;
      }
      if (!isUndefined(this.workbench.tag)) {
        params.tag = this.workbench.tag;
      }
      params.folderId = this.workbench.folderId;
      params.workspace = CommonConstant.API_CONSTANT.API_URL + 'workspace/' + this.workbench.workspace.id;
      params.dataConnection = CommonConstant.API_CONSTANT.API_URL + 'dataconnections/' + this.workbench.dataConnection.id;
      // change global variable
      params.globalVar = JSON.stringify(this._getGlobalVariableListMap());
      // update global variable in workbench
      this.workbenchService.updateWorkbench(params)
        .then((result) => {
          // if exist global variable in result
          if (!isUndefined(result.globalVar)) {
            // change global variable list
            this.workbench.globalVar = result.globalVar;
            this.variableList = JSON.parse(result.globalVar);
          } else {
            this.variableList = [];
          }
          // loading hide
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          this.commonExceptionHandler(error);
          reject(error);
        });
    });
  }

  /**
   * Get global variable list
   * @returns {any}
   * @private
   */
  private _getGlobalVariableListMap(): any {
    return _.map(this.variableList, (item) => {
      return {
        globalNm: item.globalNm,
        globalVar: item.globalVar,
        globalType: item.globalType,
      }
    });
  }
}
