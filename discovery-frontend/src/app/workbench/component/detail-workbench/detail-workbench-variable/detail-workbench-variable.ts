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
import {AbstractComponent} from '@common/component/abstract.component';
import {Workbench} from '@domain/workbench/workbench';
import {isUndefined} from 'util';
import {WorkbenchService} from '../../../service/workbench.service';
import {CommonConstant} from '@common/constant/common.constant';
import * as _ from 'lodash';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';

/**
 * Global variable in detail workbench
 */
@Component({
  selector: 'detail-workbench-variable',
  templateUrl: './detail-workbench-variable.html',
})
export class DetailWorkbenchVariableComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input()
  public workbench: Workbench;

  // global add editor event
  @Output()
  public addVariableEvent: EventEmitter<string> = new EventEmitter();

  // global variable list
  public variableList: any[] = [];

  // global variable type list
  public typeList: any[] = [
    {key: 'c', value: this.translateService.instant('msg.bench.ui.calen')},
    {key: 't', value: this.translateService.instant('msg.bench.ui.text')}
  ];
  // selected global variable type
  public selectedType: any = this.typeList[0];

  // global variable list show/hide flag
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

  // max global variable count
  private _globalVariableMax: number = 30;

  // popup
  public isConfirmPopup: boolean = false;

  public globalVariable: any;

  // constructor
  constructor(protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


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
      // init error
      this.initErrorInVariable(this.addVariableObject, 'name');
      this.initErrorInVariable(this.addVariableObject, 'value');
    }
  }

  /**
   * Add global variable click event
   */
  public onClickAddVariable(): void {
    // check empty name & check duplicated name & check variable count
    if (this._isNotEmptyGlobalVariable(this.addVariableObject)
      && this._isNotDuplicateGlobalVariableName(this.variableList, this.addVariableObject)
      && this._isNotOverMaxVariableList()) {
      // add globalType
      this.addVariableObject.globalType = this.selectedType.key;
      // clone variable list
      const list = _.cloneDeep(this.variableList);
      // add variable in list
      list.unshift(this.addVariableObject);
      // update global variable
      this._updateGlobalVariable(list)
        .then(() => {
          // close add panel
          this.addVariableObject.editMode = false
        }).catch(() => {
      });
    }
  }

  /**
   * Save global variable list click event
   * @param globalVariable
   */
  public onClickSaveSelectedVariable(globalVariable: any): void {
    // check empty variable name
    if (this._isNotEmptyGlobalVariable(globalVariable) && this._isNotDuplicateGlobalVariableName(this.variableList.filter(item => item !== globalVariable), globalVariable)) {
      // save variable
      this._updateGlobalVariable(this.variableList)
        .then(() => {
          globalVariable.editMode = false;
        }).catch(() => {
      });
    }
  }

  /**
   * Show and Hide add global variable click event
   */
  public onClickShowHideAddGlobalVariable(): void {
    // if show flag
    if (!this.addVariableObject.editMode) {
      // if editMode true, close edit mode in variable list
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
    this.addVariableObject.editMode && (this.addVariableObject.editMode = false);
    // if editMode true, close edit mode in variable list
    this.variableList.forEach(item => item.editMode && this.onClickCloseEditSelectedVariable(item));
    // open edit mode
    globalVariable.editMode = true;
    // clone global variable value
    this.editVariableInputName = globalVariable.globalNm;
    this.editVariableInputValue = globalVariable.globalVar;
    // TODO ExpressionChangedAfterItHasBeenCheckedError fix
    this.safelyDetectChanges();
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
    this.globalVariable = globalVariable;
    this.isConfirmPopup = true;
  }

  /**
   * Insert selected global variable in editor click event
   * @param globalVariable
   */
  public onClickInsertSelectedVariableInEditor(globalVariable: any): void {
    this.addVariableEvent.emit('${' + globalVariable.globalNm + '}');
  }

  /**
   * Date value changed event
   * @param {string} date
   * @param globalVariable
   */
  public onChangedDateValue(date: string, globalVariable: any): void {
    // change value
    globalVariable.globalVar = date;
    // init value error
    this.initErrorInVariable(globalVariable, 'value');
  }

  /**
   * Remove selected global variable
   * @param globalVariable
   */
  public removeSelectedVariable(): void {
    // update global variable
    this._updateGlobalVariable(_.filter(this.variableList, item => item !== this.globalVariable))
      .then(() => {
      }).catch(() => {
    });
    this.isConfirmPopup = false;
  }

  /**
   * Init error in variable
   * @param globalVariable
   * @param {string} errorType
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
   * @param globalVariable
   * @returns {boolean}
   * @private
   */
  private _isNotDuplicateGlobalVariableName(variableList: any, globalVariable: any): boolean {
    // if exist duplicate name in variable list
    if (_.some(variableList, item => globalVariable.globalNm.trim() === item.globalNm.trim())) {
      // set error message
      globalVariable.nameErrorMessage = this.translateService.instant('msg.bench.ui.global.variable.duplicated');
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
   * @param variableList
   * @returns {Promise<any>}
   * @private
   */
  private _updateGlobalVariable(variableList: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // loading show
      this.loadingShow();
      // params
      const params: any = {
        id: this.workbench.id,
        name: this.workbench.name,
        folderId: this.workbench.folderId,
        workspace: CommonConstant.API_CONSTANT.API_URL + 'workspace/' + this.workbench.workspace.id,
        dataConnection: CommonConstant.API_CONSTANT.API_URL + 'dataconnections/' + this.workbench.dataConnection.id,
        globalVar: JSON.stringify(this._getGlobalVariableListMap(variableList))
      };
      if (this.workbench.description) {
        params.description = this.workbench.description;
      }
      if (this.workbench.favorite) {
        params.favorite = this.workbench.favorite;
      }
      if (this.workbench.tag) {
        params.tag = this.workbench.tag;
      }
      // update global variable in workbench
      this.workbenchService.updateWorkbench(params)
        .then((result) => {
          // loading hide
          this.loadingHide();
          // if exist global variable in result
          if (result.globalVar) {
            // change global variable list
            this.workbench.globalVar = result.globalVar;
            this.variableList = JSON.parse(result.globalVar);
          } else {
            this.variableList = [];
          }
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
   * @param variableList
   * @returns {any}
   * @private
   */
  private _getGlobalVariableListMap(variableList: any): any {
    return _.map(variableList, (item) => {
      return {
        globalNm: item.globalNm,
        globalVar: item.globalVar,
        globalType: item.globalType,
      }
    });
  }
}
