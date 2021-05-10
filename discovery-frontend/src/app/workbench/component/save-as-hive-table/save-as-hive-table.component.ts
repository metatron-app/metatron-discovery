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
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {WorkbenchService} from '../../service/workbench.service';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from 'app/common/util/common.util';
import {Alert} from '@common/util/alert.util';

@Component({
  selector: 'app-save-as-hive-table',
  templateUrl: './save-as-hive-table.component.html',
})
export class SaveAsHiveTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  // 모달 flag
  public isShow = false;

  public isInvalidTableName: boolean = false;
  public errMsgTableName: string = '';

  public tableName: string = '';
  private csvFilePath: string = '';
  private webSocketId: string = '';
  private workbenchId: string = '';

  @Output()
  saveSucceed = new EventEmitter<string>();

  // 생성자
  constructor(private workbenchService: WorkbenchService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
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

  public init(workbenchId: string, csvFilePath: string, webSocketId: string) {
    this.isShow = true;
    this.tableName = '';
    this.workbenchId = workbenchId;
    this.csvFilePath = csvFilePath;
    this.webSocketId = webSocketId;
  }

  // 닫기
  public close() {
    this.isShow = false;
  }

  public validation() {
    if (StringUtil.isEmpty(this.tableName)) {
      this.isInvalidTableName = true;
      this.errMsgTableName = this.translateService.instant('msg.common.ui.required');
      return false;
    } else {
      if (StringUtil.isAlphaNumericUnderscore(this.tableName) === false) {
        this.isInvalidTableName = true;
        this.errMsgTableName = this.translateService.instant('msg.bench.alert.invalid-hive-table-name');
        return false;
      }
    }

    return true;
  }

  public saveToHive() {
    if (this.validation()) {
      const params = {
        type: 'csv',
        tableName: this.tableName.trim(),
        firstRowHeadColumnUsed: true,
        uploadedFile: this.csvFilePath,
        loginUserId: CommonUtil.getLoginUserId(),
        webSocketId: this.webSocketId
      };

      this.loadingShow();
      this.workbenchService.importFile(this.workbenchId, params)
        .then((_response) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.saveSucceed.emit();
          this.close();
        }).catch((error) => {
        this.loadingHide();
        console.log(error);
        if (error.code && error.code === 'WB0004') {
          Alert.error(this.translateService.instant('msg.bench.alert.already-exists-table'));
        } else {
          Alert.error(this.translateService.instant('msg.comm.alert.save.fail'));
        }
      });
    }
  }
}
