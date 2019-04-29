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

import {Component, ElementRef, Injector, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {Datasource, FieldFormatType, FieldRole, SourceType, Status} from '../../../domain/datasource/datasource';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {Alert} from '../../../common/util/alert.util';
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Log, Modal} from '../../../common/domain/modal';
import {CommonUtil} from '../../../common/util/common.util';
import {MomentDatePipe} from '../../../common/pipe/moment.date.pipe';
import {ActivatedRoute} from '@angular/router';
import {ConfirmModalComponent} from '../../../common/component/modal/confirm/confirm.component';
import {LogComponent} from '../../../common/component/modal/log/log.component';
import {MetadataService} from '../../../meta-data-management/metadata/service/metadata.service';
import {Metadata} from '../../../domain/meta-data-management/metadata';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {CommonConstant} from '../../../common/constant/common.constant';
import { Message } from '@stomp/stompjs';

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

  // websocket subscribe
  private _subscribe: any;

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

  // 데이터소스
  public datasource: Datasource;
  // 메타데이터 정보
  public metaData: Metadata;

  // edit flag
  public nameFl: boolean = false;

  // name & desc
  public reName: string = '';

  // more flag
  public moreFl: boolean = false;

  // ingestion process
  public ingestionProcess: any;
  // is not show progress flag
  public isNotShowProgress: boolean;

  // history id
  public historyId: string;

  // timestamp column
  public timestampColumn: any;

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
      // loading show
      this.loadingShow();
      // 현재 데이터소스 상세조회
      this._getDatasourceDetail(this.datasourceId)
        .then((datasource: Datasource) => {
          // create q
          const q = [];
          // get meta data
          q.push(this._getDatasourceMetadata(this.datasourceId));
          // if datasource status not DISABLED
          if (datasource.status !== Status.DISABLED) {
            // history params
            let params;
            // if status ENABLED, not create params
            if (datasource.status !== Status.ENABLED) {
              params = {status: datasource.status === Status.PREPARING ? 'running' : 'failed'};
            }
            // get history
            q.push(this._getDatasourceHistory(this.datasourceId, params)
              .then((history) => {
                // only status PREPARING, FAILED
                if (datasource.status !== Status.ENABLED) {
                  // init progress UI
                  if (history['_embedded'] && history['_embedded'].ingestionHistories[0].progress) {
                    this.ingestionProcess = {
                      progress: 1,
                      message: history['_embedded'].ingestionHistories[0].progress,
                      failResults: {
                        errorCode: history['_embedded'].ingestionHistories[0].errorCode,
                        cause: history['_embedded'].ingestionHistories[0].cause
                      }};
                  } else if (history['_embedded'] && !history['_embedded'].ingestionHistories[0].progress) {
                    this.isNotShowProgress = true;
                  } else if (datasource.srcType === SourceType.FILE || datasource.srcType === SourceType.JDBC) {
                    this.ingestionProcess = {progress: 1, message: 'START_INGESTION_JOB'};
                  } else if (datasource.srcType === SourceType.HIVE) {
                    this.ingestionProcess = {progress: 1, message: 'ENGINE_INIT_TASK'};
                  }

                  // link webSocket
                  this.checkAndConnectWebSocket(true)
                    .then(() => {
                      // set process
                      this._setProcessIngestion(this.datasourceId);
                    })
                    .catch(error => this.commonExceptionHandler(error));
                }
              }));
          }
          // run q
          Promise.all(q)
            .then(() => {
              // loading hide
              this.loadingHide();
            })
            .catch(() => {
              // loading hide
              this.loadingHide();
            })
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
    // if exist _subscribe
    if (this._subscribe) {
      this._subscribe.unsubscribe();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 이름 변경 모드
  public changeNameMode() {
    this.nameFl = true;
    this.reName = this.datasource.name;
  }

  /**
   * Change datasource data event
   * @param {string} mode
   */
  public changedDatasourceData(mode: string): void {
    // loading show
    this.loadingShow();
    // get datasource detail data
    this._getDatasourceDetail(this.datasourceId, mode)
      .then(result => this.loadingHide())
      .catch(error => this.commonExceptionHandler(error));
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
        this._getDatasourceDetail(this.datasourceId, this.mode)
          .then(result => this.loadingHide())
          .catch(error => this.commonExceptionHandler(error));
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
    this.nameFl = false;
    // update
    this.updateDatasource({name : this.reName.trim()});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 뒤로가기
  public prevDatasourceList(): void {
    this.location.back();
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

  /**
   * Changed datasource name event
   * @param {string} text
   */
  public onChangedSourceName(text: string): void {
    // set rename text
    this.reName = text;
    // rename
    this.renameDatasource();
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
   * Get datasource history
   * @param {string} datasourceId
   * @param {any} params
   * @returns {Promise<any>}
   * @private
   */
  private _getDatasourceHistory(datasourceId: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasourceService.getBatchHistories(datasourceId, params)
        .then((result) => {
          // if exist ingestionHistories
          if (result['_embedded'] && result['_embedded'].ingestionHistories) {
            // set history id
            this.historyId = result['_embedded'].ingestionHistories[0].id;
          }
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Get datasource detail data
   * @param {string} datasourceId
   * @param {string} mode
   * @returns {Promise<any>}
   * @private
   */
  private _getDatasourceDetail(datasourceId: string, mode: string = 'information'): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasourceService.getDatasourceDetail(datasourceId, true)
        .then((datasource) => {
          // set datasource
          this.datasource = datasource;
          // fields loop
          this.datasource.fields.forEach((field, index, list) => {
            // if field TIMESTAMP
            if (field.role === FieldRole.TIMESTAMP) {
              // set timestamp column
              this.timestampColumn = field;
              // if column is current time, hide
              if (field.format &&  field.format.type === FieldFormatType.TEMPORARY_TIME) {
                list.splice(index, 1);
              }
            }
          });
          // set view mode
          this.mode = mode;
          resolve(datasource);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Get datasource meta data
   * @param {string} datasourceId
   * @returns {Promise<any>}
   * @private
   */
  private _getDatasourceMetadata(datasourceId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._metaDataService.getMetadataForDataSource(datasourceId)
        .then((result) => {
          // set meta data
          result.length > 0 && (this.metaData = result[0]);
          resolve(result);
        })
        .catch(error => reject(error));
    });
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
      this._subscribe = CommonConstant.stomp.watch( `/topic/datasources/${datasourceId}/progress` )
        .subscribe((msg: Message) => {

          const data: { progress: number, message: string, results: any } = JSON.parse( msg.body );

          console.log('process socket', data);
          // if has history
          if (data.results && data.results.history) {
            // set history id
            this.historyId = data.results.history.id;
          }
          // 데이터 변경
          this.ingestionProcess = data;
          // 실패시
          if (-1 === data.progress) {
            // set status
            this.datasource.status = Status.FAILED;
            // if has history
            if (data.results && data.results.history) {
              // set ingestionProcess
              this.ingestionProcess['message'] = data.results.history.progress;
              // set cause and message
              this.ingestionProcess['failResults'] = {
                errorCode: data.results.history.errorCode,
                cause: data.results.history.cause
              };
            }
            // disconnect websocket
            this._subscribe.unsubscribe();
          } else if (100 === data.progress) { // 성공시
            // set status
            this.datasource.status = Status.ENABLED;
            // disconnect websocket
            this._subscribe.unsubscribe();
          }
        }, headers);
    } catch (e) {
      console.info(e);
    }
  }

}
