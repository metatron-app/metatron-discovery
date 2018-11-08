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

import {
  Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { Datasource, Status } from '../../../domain/datasource/datasource';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { Alert } from '../../../common/util/alert.util';
import { DeleteModalComponent } from '../../../common/component/modal/delete/delete.component';
import { Log, Modal } from '../../../common/domain/modal';
import { CommonUtil } from '../../../common/util/common.util';
import { MomentDatePipe } from '../../../common/pipe/moment.date.pipe';
import { ActivatedRoute } from '@angular/router';
import { ConfirmModalComponent } from '../../../common/component/modal/confirm/confirm.component';
import { LogComponent } from '../../../common/component/modal/log/log.component';
import { MetadataService } from '../../../meta-data-management/metadata/service/metadata.service';
import { Metadata } from '../../../domain/meta-data-management/metadata';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { CommonConstant } from '../../../common/constant/common.constant';

@Component({
  selector: 'app-detail-datasource',
  templateUrl: './detail-data-source.component.html',
  providers: [MomentDatePipe]
})
export class DetailDataSourceComponent extends AbstractComponent implements OnInit, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터소스가 수정되었는지 판단
  private updateFl: boolean = false;

  // 현재 데이터소스 아이디
  private datasourceId: string;

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  // log 출력용 컴포넌트
  @ViewChild(LogComponent)
  private _logComponent: LogComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // mode
  public mode: string;

  @ViewChild('nameElement')
  public nameElement: ElementRef;

  @ViewChild('descElement')
  public descElement: ElementRef;

  // 데이터소스
  public datasource: Datasource;
  // 메타데이터 정보
  public metaData: Metadata;

  // edit flag
  public nameFl: boolean = false;
  public descFl: boolean = false;

  // name & desc
  public reName: string = '';
  public reDesc: string = '';

  // more flag
  public moreFl: boolean = false;

  // ingestion process
  public ingestionProcess: any;

  // history id
  public historyId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _metaDataService: MetadataService,
              private datasourceService: DatasourceService,
              private activatedRoute: ActivatedRoute,
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

    this.activatedRoute.params.subscribe((params) => {
      // sourceId
      this.datasourceId = params['sourceId'];
      // initView
      this._initView();
      // link webSocket
      this.checkAndConnectWebSocket(true)
        .then(() => {
          // 현재 데이터소스 상세조회
          this.getDatasourceDetail(this.datasourceId);
          // TODO get historyId
          // process ingestion
          this._setProcessIngestion(this.datasourceId);
        })
        .catch(error => this.commonExceptionHandler(error));
    });
  }

  // Change
  public ngOnChanges() {

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 이름 변경 모드
  public changeNameMode() {
    this.nameFl = true;
    this.reName = this.datasource.name;
  }

  // 설명 변경 모드
  public changeDescMode() {
    this.descFl = true;
    this.reDesc = this.datasource.description;
  }

  public changedDatasourceData(mode: string) {
    this.getDatasourceDetail(this.datasourceId, mode);
  }

  /**
   * 데이터소스 이름 수정
   */
  public renameDatasource() {
    // 수정할 이름이 없다면
    if (this.reName.trim() === '') {
      Alert.warning(this.translateService.instant('msg.storage.alert.insert.name'));
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.reName.trim()) > 150) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.len'));
      return;
    }
    const params = {
      name : this.reName.trim()
    };
    this.nameFl = false;
    // blur
    this.nameElement.nativeElement.blur();
    // update
    this.updateDatasource(params);
  }

  /**
   * 데이터소스 설명 수정
   */
  public redescDatasource() {
    // 설명 길이 체크
    if (CommonUtil.getByte(this.reDesc.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }
    const params = {
      description : this.reDesc.trim()
    };
    this.descFl = false;
    // blur
    this.descElement.nativeElement.blur();
    // update
    this.updateDatasource(params);
  }

  /**
   * 데이터소스 수정
   * @param params
   */
  public updateDatasource(params: any): void {

    // 로딩 show
    this.loadingShow();

    // param
    let param = {};

    // 파라메터가 넘어왔다면
    if (params) {
      param = params;
    }

    this.datasourceService.updateDatasource(this.datasourceId, param)
      .then((result) => {
        // 플래그 초기화
        this.updateFl = true;
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.update.success'));
        // 데이터소스 갱신
        this.getDatasourceDetail(this.datasourceId, this.mode);
      })
      .catch((error) => {
        // alert
        Alert.warning(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 데이터소스 삭제
   */
  public deleteDatasource(): void {
    // 로딩 show
    this.loadingShow();

    this.datasourceService.deleteDatasource(this.datasourceId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.del.success'));
        // 로딩 hide
        this.loadingHide();
        // 뒤로가기
        this.prevDatasourceList();
      })
      .catch((error) => {
        // alert
        Alert.warning(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  // 삭제 모달 오픈
  public deleteModalOpen() {
    // 모달 오픈
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dsource.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dsource.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dsource.del');
    this.deleteModalComponent.init(modal);
  }

  /**
   * 확인 팝업 모달 오픈
   * @param {string} type
   */
  public confirmModalOpen(type: string): void {
    const modal = new Modal();
    modal.data = type;
    // 타입이 published
    if (type === 'published') {
      // 현재 전체공개 됨
      if (this.datasource.published) {
        modal.name = `'${this.datasource.name}' `+ this.translateService.instant('msg.storage.alert.source.change-selected');
        modal.description = this.translateService.instant('msg.storage.alert.source-publish.description');
        modal.btnName = this.translateService.instant('msg.storage.btn.source.private');
      } else {
        modal.name = `'${this.datasource.name}' ` + this.translateService.instant('msg.storage.alert.source.change-public');
        modal.btnName = this.translateService.instant('msg.storage.btn.source.public');
      }
    } else if (type === 'update') {
      modal.name = this.translateService.instant('msg.storage.ui.source.modal.title');
      modal.description = this.translateService.instant('msg.storage.ui.source.modal.description');
      modal.btnName = this.translateService.instant('msg.storage.btn.save');
    }
    // 확인팝업 모달 오픈
    this._confirmModalComponent.init(modal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 뒤로가기
  public prevDatasourceList(): void {
    this.router.navigate(['/management/storage/datasource']);
  }

  // mode
  public onChangeMode(mode: string) {

    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
  }

  /**
   * 로그 show 모달 오픈
   * @param {Log} log
   */
  public onOpenLogModal(log: Log): void {
    this._logComponent.init(log);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * source enabled
   * @returns {boolean}
   */
  public isEnabled(): boolean {
    return this.getStatus === Status.ENABLED;
  }

  /**
   * status
   * @returns {Status}
   */
  private get getStatus() {
    return this.datasource.status;
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
  private _initView() {
    // datasource
    this.datasource = new Datasource;
    // update flag
    this.updateFl = false;
    // flag
    this.nameFl = false;
    this.moreFl = false;
  }


  /**
   * 데이터소스 상세 조회
   * @param {string} sourceId
   * @param {string} mode
   */
  private getDatasourceDetail(sourceId: string, mode: string = 'information'): void {
    // 로딩 시작
    this.loadingShow();
    this.datasourceService.getDatasourceDetail(sourceId)
      .then((datasource) => {
        // 데이터소스
        this.datasource = datasource;
        this.mode = mode;
        // 메타데이터 정보 조회
        this._getMetaData(datasource);
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 데이터소스로 메타데이터 정보 조회
   * @param {Datasource} source
   * @private
   */
  private _getMetaData(source: Datasource): void {
    // 로딩 show
    this.loadingShow();
    this._metaDataService.getMetadataForDataSource(source.id)
      .then((result) => {
        // 메타데이터가 있다면
        result.length > 0 && (this.metaData = result[0]);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set process ingestion
   * @param {string} datasourceId
   * @private
   */
  private _setProcessIngestion(datasourceId: string): void {
    try {
      const headers: any = { 'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) };
      // 메세지 수신
      const subscription = CommonConstant.stomp.subscribe(
        `/topic/datasources/${datasourceId}/progress`, (data: { progress: number, message: string }) => {
          console.log('test socket', data);
          if (-1 === data.progress) {
            // 데이터 변경
            this.ingestionProcess = data;
          } else if (100 === data.progress) {
            // 데이터 변경
            this.ingestionProcess = data;
            // TODO ENABLE로 바뀌었다면 status 변경

            CommonConstant.stomp.unsubscribe(subscription);     // Socket 응답 해제
          } else {
            // 데이터 변경
            this.ingestionProcess = data;
          }
        }, headers);

      // TODO test
      // this.datasource.status = Status.PREPARING;
      // this.ingestionProcess = {progress: 1, message: "START_INGESTION_JOB"};
      // setTimeout(() => {
      //   this.datasource.status = Status.PREPARING;
      //   this.ingestionProcess = {progress: 2, message: "ENGINE_INIT_TASK"};
      //   setTimeout(() => {
      //     this.datasource.status = Status.PREPARING;
      //     this.ingestionProcess = {progress: 3, message: "ENGINE_REGISTER_DATASOURCE"};
      //     setTimeout(() => {
      //       this.datasource.status = Status.ENABLED;
      //       this.ingestionProcess = {progress: 3, message: "END_INGESTION_JOB"};
      //     }, 5000);
      //   }, 5000);
      // }, 5000);
    } catch (e) {
      console.info(e);
    }
  }

}
