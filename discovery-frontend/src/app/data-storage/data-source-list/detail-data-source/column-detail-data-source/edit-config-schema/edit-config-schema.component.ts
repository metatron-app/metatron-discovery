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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { Field, FieldRole, LogicalType } from '../../../../../domain/datasource/datasource';

import * as _ from 'lodash';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { Alert } from '../../../../../common/util/alert.util';

@Component({
  selector: 'edit-config-schema',
  templateUrl: './edit-config-schema.component.html'
})
export class EditConfigSchemaComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터소스 아이디
  private _sourceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // field list
  public fields: Field[];

  // show flag
  public isShowFl: boolean = false;

  // logical type list
  public logicalTypes: any[];

  @Output()
  public updatedSchema: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   * @param {Field[]} fields
   */
  public init(datasourceId: string, fields: Field[]): void {
    // init view
    this._initView();
    // 데이터소스 아이디
    this._sourceId = datasourceId;
    // 필드 리스트 복사
    this.fields = _.cloneDeep(fields);
    // flag
    this.isShowFl = true;
  }

  /**
   * save
   */
  public save(): void {
    this._updateSchema();
  }

  /**
   * cancel
   */
  public cancel(): void {
    this.isShowFl = false;
  }

  /**
   * 현재 필드의 logical Type label
   * @param {Field} field
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(field: Field): string {
    return this.logicalTypes.filter((type) => {
      return type.value === field.logicalType;
    })[0].label;
  }

  /**
   * logical type list
   * @param {Field} field
   * @returns {any[]}
   */
  public getLogicalTypeList(field: Field) {
    return field.role === FieldRole.MEASURE ? this.logicalTypes.filter((type) => {
      return type.measure;
    }) : this.logicalTypes;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * logical type 변경 이벤트
   * @param {Field} field
   * @param logicalType
   */
  public onChangeLogicalType(field: Field, logicalType: any): void {
    // 변경이벤트 체크
    this.onChangeValue(field);
    // logical type 변경
    field.logicalType = logicalType.value;
    // Role 이 측정값인데 logicalType이 float과 integer가 아니라면 role을 차원값으로 변경
    // if (field.role === FieldRole.MEASURE && (field.logicalType !== LogicalType.FLOAT && field.logicalType !== LogicalType.INTEGER)) {
    //   field.role = FieldRole.DIMENSION;
    // }
  }

  /**
   * filed 의 변경이벤트 발생
   * @param {Field} field
   */
  public onChangeValue(field: Field): void {
    // 변경이벤트 체크
    field['replaceFl'] = true;
  }

  /**
   * logical type list show
   * @param {Field} field
   */
  public onShowLogicalTypeList(field: Field): void {
    field['typeListFl'] = !field['typeListFl'];
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // id
    this._sourceId = '';
    // fields
    this.fields = [];
    // flag
    this.isShowFl = false;
    // logicalType
    this.logicalTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', measure: true },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', measure: true  },
      { label: this.translateService.instant('msg.storage.ui.list.timestamp'), value: 'TIMESTAMP' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' }
    ];
  }

  /**
   * 변경된 필드정보 업데이트
   * @private
   */
  private _updateSchema(): void {
    // 로딩 show
    this.loadingShow();
    // 필드 업데이트
    this.datasourceService.updateDatasourceFields(this._sourceId, this._getUpdateFieldParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.schema.config.success'));
        // 로딩 hide
        this.loadingHide();
        // 변경 emit
        this.updatedSchema.emit();
        // close
        this.cancel();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 변경에 사용될 필드
   * @returns {any}
   * @private
   */
  private _getUpdateFieldParams(): any {
    const result = this.fields.filter((field) => {
      return field['replaceFl'];
    });
    result.forEach((item) => {
      item['op'] = 'replace';
      delete item['replaceFl'];
      delete item['typeListFl'];
    });
    return result;
  }
}
