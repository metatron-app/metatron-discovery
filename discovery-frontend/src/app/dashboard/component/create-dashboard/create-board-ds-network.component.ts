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

import * as _ from 'lodash';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {CommonUtil} from '@common/util/common.util';
import {Modal} from '@common/domain/modal';
import {ConnectionType, Datasource, TemporaryDatasource} from '@domain/datasource/datasource';
import {BoardDataSource, BoardDataSourceRelation, Dashboard} from '@domain/dashboard/dashboard';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {CreateBoardPopDsSelectComponent} from './create-board-pop-ds-select.component';
import {CreateBoardPopRelationComponent} from './create-board-pop-relation.component';

declare const vis;

@Component({
  selector: 'create-board-ds-network',
  templateUrl: './create-board-ds-network.component.html',
  styleUrls: ['./create-board-ds-network.component.css']
})
export class CreateBoardDsNetworkComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(CreateBoardPopDsSelectComponent)
  private _dataSourceSelectComp: CreateBoardPopDsSelectComponent;

  @ViewChild(CreateBoardPopRelationComponent)
  private _relationPopComp: CreateBoardPopRelationComponent;

  @ViewChild('guideLine')
  private _guideLine: ElementRef;

  // VIS Data
  private _nodes: any;
  private _edges: any;

  private _network: any = null;

  private _dataSources: Datasource[] = [];                // 데이터소스 목록
  private _boardDataSources: BoardDataSource[] = [];     // 보드 데이터소스 목록
  private _relations: BoardDataSourceRelation[] = [];    // 연계 정보 목록

  private _isAlreadyViewGuide: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isRenderedNetwork: boolean = false;    // 네트워크보드 생성 여부
  public isRelationEditMode: boolean = false;   // 연계 정보 수정 모드
  public isPossibleSettingRel: boolean = false;  // 연계 정보 설정 가능 여부

  // Data Ingestion
  public candidateIngestionList: BoardDataSource[] = [];  // 데이터적재 후보 데이터소스 목록
  public ingestionTargetDatasource: BoardDataSource;      // 데이터적재 대상 데이터소스
  public isShowDataIngestion: boolean = false;            // 데이터적재 팝업 표시 여부

  // 선택 정보
  public selectedDataSource: BoardDataSource;           // 선택된 데이터소스
  public selectedRelation: BoardDataSourceRelation;     // 데이터소스 연계 정보

  public isShowMultiDsGuide: boolean = false;             // 가이드 표시 여부

  @Input()
  public workspaceId: string;

  @Input()
  public dashboard: Dashboard;

  @Output()
  public onChange: EventEmitter<{ isDenyNext?: boolean, isShowButtons?: boolean }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();

    // 데이터 소스 변경
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_UPDATE_DS').subscribe((data: { dataSource: BoardDataSource, candidateDataSources: Datasource[] }) => {

        const targetIdx = this._boardDataSources.findIndex(item => item.id === data.dataSource.id);
        (-1 < targetIdx) && (this._boardDataSources[targetIdx] = data.dataSource);

        data.candidateDataSources.forEach(ds => {
          const dataSourceIdx: number = this._dataSources.findIndex(item => item.id === ds.id);
          if (-1 === dataSourceIdx) {
            this._dataSources.push(ds);
          }
        });
      })
    );

    // 데이터 소스 삭제
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_REMOVE_DS').subscribe((data: { dataSourceId: string }) => {
        if (this._relations.some(item => (item.ui.source.id === data.dataSourceId || item.ui.target.id === data.dataSourceId))) {
          const modal = new Modal();
          modal.name = this.translateService.instant('msg.board.create.confirm.del_ds.main');
          modal.description = this.translateService.instant('msg.board.create.confirm.del_ds.sub');
          modal.btnName = this.translateService.instant('msg.comm.btn.del');
          modal.afterConfirm = () => {
            this.selectedDataSource = null;
            this._removeDataSource(data.dataSourceId);
          };
          CommonUtil.confirm(modal);
        } else {
          this.selectedDataSource = null;
          this._removeDataSource(data.dataSourceId);
        }
      })
    );

    // 데이터 소스 정보 영역 숨김
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_CLOSE_DS').subscribe(() => {
        this.selectedDataSource = null;
      })
    );

    // 연계 정보 생성
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_CREATE_REL').subscribe((data: { relation: BoardDataSourceRelation }) => {
        this._relations.push(data.relation);
      })
    );

    // 연계 수정 요청
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_EDIT_REL').subscribe((data: { relationId: string }) => {
        const relInfo = this._relations.find(item => item.id === data.relationId);
        this._relationPopComp.editRelation(relInfo);
      })
    );

    // 연계 정보 갱신
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_UPDATE_REL').subscribe((data: { relation: BoardDataSourceRelation }) => {
        const targetIdx = this._relations.findIndex(item => item.id === data.relation.id);
        (-1 < targetIdx) && (this._relations[targetIdx] = data.relation);
      })
    );

    // 연계 정보 삭제
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_REMOVE_REL').subscribe((data: { relationId: string }) => {
        this._removeRelation(data.relationId);
      })
    );

    // 필수 필터 재설정
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_RE_INGESTION').subscribe((data: { dataSource: BoardDataSource }) => {
        this._clearSelection();
        const targetDs: BoardDataSource = data.dataSource['orgDataSource'];
        targetDs.uiFilters = data.dataSource.uiFilters;
        this.candidateIngestionList.push(targetDs);
        this._showDataIngestion();
      })
    );

  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    if (this.dashboard) {
      // 네트워크 보드 생성
      (this.isRenderedNetwork) || (this._renderNetworkBoard());
      this.safelyDetectChanges();
      const dataSources: Datasource[] = this.dashboard.dataSources;
      this._dataSources = dataSources;
      const boardDs: BoardDataSource = this.dashboard.configuration.dataSource;
      if ('multi' === boardDs.type) {
        boardDs.dataSources.forEach(item => {
          const targetDs: Datasource = dataSources.find(ds => item.engineName === ds.engineName || (ds.connType === ConnectionType.LINK && item.engineName.startsWith(ds.engineName + '_')));
          (targetDs) && (item.name = targetDs.name);

          if (targetDs.connType === ConnectionType.LINK && targetDs.engineName !== item.engineName) {
            targetDs.engineName = item.engineName;
            targetDs.temporary = targetDs.temporary ? targetDs.temporary : new TemporaryDatasource();
          }

          this._addDataSource(BoardDataSource.convertDsToMetaDs(targetDs));
        });
        if (boardDs.associations) {
          boardDs.associations.forEach(item => {
            const srcDs: Datasource = dataSources.find(ds => ds.engineName === item.source);
            const tgtDs: Datasource = dataSources.find(ds => ds.engineName === item.target);
            const srcKey: string = Object.keys(item.columnPair)[0];
            const tgtKey: string = item.columnPair[srcKey];
            item.id = CommonUtil.getUUID();
            item.ui = {
              source: BoardDataSource.convertDsToMetaDs(srcDs),
              target: BoardDataSource.convertDsToMetaDs(tgtDs),
              sourceField: srcDs.fields.find(field => field.name === srcKey),
              targetField: tgtDs.fields.find(field => field.name === tgtKey)
            };
            this._addEdgeByRelation(item);
          });
        }
        this.isPossibleSettingRel = true;
      } else {
        const foundDs: Datasource = dataSources.find(ds => boardDs.engineName === ds.engineName || (ds.connType === ConnectionType.LINK && boardDs.engineName.startsWith(ds.engineName + '_')));
        if (foundDs) {
          if (foundDs.connType === ConnectionType.LINK && foundDs.engineName !== boardDs.engineName) {
            foundDs.engineName = boardDs.engineName;
            foundDs.temporary = foundDs.temporary ? foundDs.temporary : new TemporaryDatasource();
          }

          const newBoardDs: BoardDataSource = BoardDataSource.convertDsToMetaDs(foundDs);
          if (boardDs.joins && boardDs.joins.length > 0) {
            newBoardDs.joins = boardDs.joins;
          }
          this._addDataSource(newBoardDs);
        }
      }
      this._bindEventNetworkBoard();
      this.safelyDetectChanges();
    }
  } // function - ngAfterViewInit

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /**
   * 차트 Resize
   *
   */
  @HostListener('window:resize')
  public onResize() {
    $('.sys-create-board-top-panel').css('height', '100%').css('height', '-=1px');
  } // function - onResize

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - API
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 개수 반환
   * @returns {number}
   */
  public getCntDataSources(): number {
    return this._boardDataSources.length;
  } // function - getCntDataSources

  /**
   * 데이터 유효하지 않음 여부
   * @return {boolean}
   */
  public isInvalidate(): boolean {
    return (0 === this._boardDataSources.length)
      || this._relations.some(item => this.isNullOrUndefined(item.ui.sourceField) || this.isNullOrUndefined(item.ui.targetField));
  } // function - isInvalidate

  /**
   * 데이터 반환
   * @return {{dataSources: Datasource[], boardDataSources: BoardDataSource[], relations: BoardDataSourceRelation[]}}
   */
  public getData(): { dataSources: Datasource[], boardDataSources: BoardDataSource[], relations: BoardDataSourceRelation[] } {
    return {
      dataSources: this._dataSources,
      boardDataSources: this._boardDataSources,
      relations: this._relations
    };
  } // function - getData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 추가 팝업 열기
   */
  public showPopupAddDataSource() {
    this._dataSourceSelectComp.open(this.workspaceId, this._boardDataSources.map(item => item.id));
  } // function - showPopupAddDataSource

  /**
   * 가이드 표시 On/Off
   */
  public toggleGuide(setVisible?: string) {
    switch (setVisible) {
      case 'SHOW' :
        this.isShowMultiDsGuide = true;
        break;
      case 'HIDE' :
        this.isShowMultiDsGuide = false;
        break;
      default :
        this.isShowMultiDsGuide = !this.isShowMultiDsGuide;
    }

    this.safelyDetectChanges();
    this.animateGuide();

  } // function - toggleGuide

  /**
   * Animate guide
   */
  public animateGuide() {
    if (this.isShowMultiDsGuide) {
      localStorage.setItem('VIEW_MULTI_DS_GUIDE', 'YES');
      const $guideLine = $(this._guideLine.nativeElement);
      $guideLine.delay(500).animate({paddingLeft: '270'}, 1000, () => {
        $guideLine.delay(500).animate({paddingLeft: '0'}, 1000, () => {
          this.animateGuide();
        });
      });
    }
  } // function - animateGuide

  /**
   * Relation 변경 모드 활성화
   */
  public onEditRelationMode() {
    this._network.addEdgeMode();
    this.isRelationEditMode = true;

    const isViewGuide: string = localStorage.getItem('VIEW_MULTI_DS_GUIDE');
    this._isAlreadyViewGuide = ('YES' === isViewGuide);
    (this._isAlreadyViewGuide) || (this.toggleGuide('SHOW'));

    this._clearSelection();
    this.safelyDetectChanges();

    // 변경사항 전파
    this.onChange.emit({isShowButtons: !this.isRelationEditMode});

    // 원래는 calc( 100% - 1px ) 로 적용되어야 하지만.. jquery와 angular 에서 calc를 지원하지 않아..
    // 아래의 방식으로 처리함
    $('.sys-create-board-top-panel').css('height', '100%').css('height', '-=1px');
  } // function - onEditRelationMode

  /**
   * Relation 변경 모드 비활성화sys-create-board-top-panel
   */
  public offEditRelationMode() {
    this.isRelationEditMode = false;
    (this._network) && (this._network.disableEditMode());
    this.toggleGuide('HIDE');
    this.safelyDetectChanges();

    // 변경사항 전파
    this.onChange.emit({isShowButtons: !this.isRelationEditMode});
  } // function - offEditRelationMode

  /**
   * 데이터소스 목록 변경
   * @param {{add: Datasource[], remove: string[]}} data
   */
  public changeDataSources(data: { add: Datasource[], remove: string[] }) {

    // 네트워크 보드 생성
    if (!this.isRenderedNetwork) {
      this._renderNetworkBoard();
      this._bindEventNetworkBoard();
    }

    // 네트워크보드 설정
    if (0 < data.add.length) {

      // 데이터소스와 네트워크보드 동기화
      const ids: string[] = (this._nodes) ? this._nodes.getIds() : [];
      data.add.forEach(item => {
        const idIdx: number = ids.indexOf(item.id);
        if (-1 === idIdx) {
          const newDataSource: BoardDataSource = BoardDataSource.convertDsToMetaDs(item);
          newDataSource.type = 'default';
          if (ConnectionType.LINK.toString() === newDataSource.connType) {
            this.candidateIngestionList.push(newDataSource);
          } else {
            // 기존에 없는 데이터소스 추가
            this._dataSources.push(item);
            this._addDataSource(BoardDataSource.convertDsToMetaDs(item));
          }
        }
      });
    }

    if (data.remove) {
      data.remove.forEach(id => {
        this._removeDataSource(id);
      });
    }

    // 적재 예정 데이터소스가 있는 경우 팝업 호출
    this._showDataIngestion();

    // 연계 설정 가능 여부 저장
    if (1 < this._boardDataSources.length) {
      this.isPossibleSettingRel = true;
      this.onEditRelationMode();
    } else {
      this.isPossibleSettingRel = false;
      this.offEditRelationMode();
    }

  } // function - changeDataSources

  /**
   * 네트워크 보드 줌인
   */
  public zoomInNetwork() {
    let zoom: number = this._network.getScale() + 0.2;
    (2.6 < zoom) && (zoom = 2.6);
    this._network.moveTo({scale: zoom});
  } // function - zoomInNetwork

  /**
   * 네트워크 보드 줌아웃
   */
  public zoomOutNetwork() {
    let zoom: number = this._network.getScale() - 0.2;
    (1 > zoom) && (zoom = 1);
    this._network.moveTo({scale: zoom});
  } // function - zoomOutNetwork

  /**
   * 네트워크 보드 화면 크기에 맞춤
   */
  public fitNetwork() {
    this._network.fit();
    // this._network.moveTo({ scale: 1.6 });
  } // function - fitNetwork

  /**
   * 연계정보 추가 취소
   * @param {string} relationId
   */
  public cancelAddRelation(relationId: string) {
    this._removeRelation(relationId);
    this.onEditRelationMode();  // 편집 모드를 유지 시키기 위해 실행
  } // function - cancelAddRelation

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Linked Datasource Ingestion
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public closeEssentialFilterPopup() {
    this.isShowDataIngestion = false
    const cntNodes: number = this._nodes.getIds().length;
    if (0 === cntNodes) {
      this.isRenderedNetwork = false;

      // 네트워크 보드 제거
      this._destroyNetworkBoard();
    }
  } // function - closeEssentialFilterPopup

  /**
   * Data Ingestion 완료 이벤트 핸들러
   * @param {{id: string, info: Datasource, dataSourceId: string, filters:Filter[]}} tempDatasource
   */
  public finishDataIngestion(tempDatasource: { id: string, info: Datasource, dataSourceId: string, filters: Filter[] }) {

    this.isShowDataIngestion = false;
    this.safelyDetectChanges();

    // this.createDashboard.temporaryId = tempDatasource.id;
    const dataSource: BoardDataSource = BoardDataSource.convertDsToMetaDs(tempDatasource.info);
    dataSource.type = 'default';
    dataSource.metaDataSource = tempDatasource.info;
    dataSource.uiFilters = tempDatasource.filters;
    dataSource['temporaryId'] = tempDatasource.id;
    dataSource['orgDataSource'] = this.ingestionTargetDatasource;

    const targetIdx: number = this._dataSources.findIndex(item => item.id === dataSource.id);
    if (-1 < targetIdx) {
      this._dataSources[targetIdx] = tempDatasource.info;
    } else {
      this._dataSources.push(tempDatasource.info);
    }
    this._addDataSource(dataSource);

    // 다음 예정 데이터소스 표시
    this._showDataIngestion();

  } // function - finishDataIngestion

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Linked Datasource Ingestion
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터적재 팝업 표시
   * @private
   */
  private _showDataIngestion() {
    if (0 < this.candidateIngestionList.length) {
      this.ingestionTargetDatasource = this.candidateIngestionList.pop();
      this.isShowDataIngestion = true;
    }
  } // function - _showDataIngestion

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 네트워크 보드 시작
   * @private
   */
  private _renderNetworkBoard() {

    this.isRenderedNetwork = true;
    this.safelyDetectChanges();

    this._nodes = new vis.DataSet([]);
    this._edges = new vis.DataSet([]);

    // 네트워크 보드 생성
    this._network = new vis.Network(
      document.querySelector('.sys-ds-board'),
      {
        nodes: this._nodes,
        edges: this._edges
      },
      {
        interaction: {hover: true},
        manipulation: {enabled: true},
        nodes: {
          margin: {
            top: 15,
            bottom: 15,
            left: 5,
            right: 5
          },
          shadow: true,
          borderWidth: 1,
          scaling: {
            min: 30,
            max: 30
          },
          size: 30,
          shape: 'ellipse',
          font: {size: 14},
          labelHighlightBold: false,
          color: {
            border: '#fff',
            background: '#fff',
            highlight: {border: '#666eb2', background: '#f0f4ff'},
            hover: {border: '#666eb2', background: '#f0f4ff'}
          },
          heightConstraint: {
            minimum: 45
          },
          widthConstraint: {
            minimum: 150,
            maximum: 150
          }
        },
        edges: {
          width: 40,
          color: {color: '#d0d1d8', highlight: '#c1cef1', hover: '#b7b9c2', inherit: 'from', opacity: 1.0},
          font: {color: '#343434', size: 12},
          smooth: false,
          length: 200
        },
        physics: {
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            avoidOverlap: 1
          }
        }
      }
    );


    // 초기 스케일 설정
    this._network.moveTo({scale: 1.6});
  } // function - _renderNetworkBoard

  /**
   * 네트워크 보드에 이벤트를 연결한다.
   * @private
   */
  private _bindEventNetworkBoard() {
    // 네트워크 보드 이벤트 연결
    this._network.on('click', (params) => {
      if (1 === params.nodes.length) {
        this._selectDataSource(params.nodes[0]);
      } else if (1 === params.edges.length) {
        this._selectRelation(params.edges[0]);
      } else if (this.selectedRelation) {
        this._clearSelection();
      }
    });

    // Relation 이벤트 연결
    this._edges.on('*', (event, props) => {
      if ('add' === event) {
        this._addRelationByEdgeId(props.items[0]);
        setTimeout(() => {
          this.onEditRelationMode();  // 편집 모드를 유지 시키기 위해 실행
        }, 100);
      }
    });
  } // function - _bindEventNetworkBoard

  /**
   * 네트워크 보드 제거
   * @private
   */
  private _destroyNetworkBoard() {
    if (null !== this._network) {
      this._network.destroy();
      this._network = null;
    }
  } // function - _destroyNetworkBoard

  /**
   * 네트워크보드에 데이터소스 추가
   * @param {BoardDataSource} ds
   * @private
   */
  private _addDataSource(ds: BoardDataSource) {
    this.isRenderedNetwork = true;

    const targetIdx: number = this._boardDataSources.findIndex(item => item.id === ds.id);

    if (-1 < targetIdx) {
      this._boardDataSources[targetIdx] = ds;
    } else {
      // 데이터 소스 추가
      this._boardDataSources.push(ds);

      // 네트워크 노드 추가
      const isKorean: boolean = this._checkKorean(ds.name);   // 한글 체크
      if (360 < (isKorean ? 2 * ds.name.length : ds.name.length) * 14) {
        const nodeName: string = isKorean ? ds.name.substr(0, 11) + '...' : ds.name.substr(0, 22) + '...';
        this._nodes.add({id: ds.id, label: nodeName, title: ds.name});
      } else {
        this._nodes.add({id: ds.id, label: ds.name, title: ds.name});
      }

      if (1 === this._nodes.getIds().length) {
        this._network.focus(ds.id);
      }
    }

    // 변경사항 전파
    this.onChange.emit({isDenyNext: this.isInvalidate()});
  } // function - _addDataSource

  /**
   * 데이터소스 삭제
   * @param {string} dataSourceId
   * @private
   */
  private _removeDataSource(dataSourceId: string) {

    // 데이터소스 삭제
    const dsRemoveIdx: number = this._dataSources.findIndex(item => item.id === dataSourceId);
    (dsRemoveIdx) && (this._dataSources.splice(dsRemoveIdx, 1));

    // 네트워크 노드 삭제
    this._nodes.remove({id: dataSourceId});

    // 보드 데이터 소스 삭제
    const removeIdx = this._boardDataSources.findIndex(item => item.id === dataSourceId);
    (-1 < removeIdx) && (this._boardDataSources.splice(removeIdx, 1));

    // 삭제된 데이터소스에 연관된 관계 정보 삭제
    _.cloneDeep(this._relations).forEach(item => {
      if (item.ui.source.id === dataSourceId || item.ui.target.id === dataSourceId) {
        this._removeRelation(item.id);
      }
    });

    // 연계 설정 가능 여부
    this.isPossibleSettingRel = (1 < this._boardDataSources.length);

    const cntNodes: number = this._nodes.getIds().length;
    if (0 === cntNodes) {
      this.isRenderedNetwork = false;

      // 네트워크 보드 제거
      this._destroyNetworkBoard();
    } else if (1 === cntNodes) {
      this._network.focus(this._nodes.getIds()[0]);
    }

    // 변경사항 전파
    this.onChange.emit({isDenyNext: this.isInvalidate()});

  } // function - _removeDataSource

  /**
   * 데이터소스 선택
   * @param {string} dsId
   * @private
   */
  private _selectDataSource(dsId: string) {
    if (!this.isRelationEditMode) {
      this._clearSelection();
      this.selectedDataSource = this._boardDataSources.find(item => item.id === dsId);
      this.broadCaster.broadcast('CREATE_BOARD_SELECT_DS', {dataSource: this.selectedDataSource});
    }
  } // function - _selectDataSource

  /**
   * Relation 정보를 바탕으로 그래프 상의 연결선 추가
   * @param {BoardDataSourceRelation} relInfo
   * @private
   */
  private _addEdgeByRelation(relInfo: BoardDataSourceRelation) {
    this._edges.add({id: relInfo.id, from: relInfo.ui.source.id, to: relInfo.ui.target.id});
    this._relations.push(relInfo);

    // 변경사항 전파
    this.onChange.emit({isDenyNext: this.isInvalidate()});
  } // function - _addEdgeByRelation

  /**
   * Edge Id를 통한 데이터소스 연관관계 추가
   * @param {string} edgeId
   * @private
   */
  private _addRelationByEdgeId(edgeId: string) {
    const data = this._edges.get(edgeId);

    const isDuplicate: boolean
      = this._relations.some((rel: BoardDataSourceRelation) => {
      return (rel.ui.source.id === data.from || rel.ui.target.id === data.from)
        && (rel.ui.source.id === data.to || rel.ui.target.id === data.to);
    });

    if (data.from === data.to || isDuplicate) {
      // Self Relation 혹은 같은 Relation 생성을 방지하기 위해서 바로 삭제
      this._edges.remove({id: edgeId});
    } else {
      const relInfo: BoardDataSourceRelation = new BoardDataSourceRelation();
      relInfo.id = data.id;
      relInfo.ui.source = this._boardDataSources.find(item => item.id === data.from);
      relInfo.ui.target = this._boardDataSources.find(item => item.id === data.to);
      this._relationPopComp.addRelation(relInfo);
    }

    // 변경사항 전파
    this.onChange.emit({isDenyNext: this.isInvalidate()});
  } // function - _addRelationByEdgeId

  /**
   * 연계정보 삭제
   * @param {string} relationId
   * @private
   */
  private _removeRelation(relationId: string) {
    this._clearSelection();

    // 네트워크 엣지 삭제
    this._edges.remove({id: relationId});

    // 연계정보 삭제
    const removeIdx = this._relations.findIndex(item => item.id === relationId);
    (-1 < removeIdx) && (this._relations.splice(removeIdx, 1));

    // 변경사항 전파
    this.onChange.emit({isDenyNext: this.isInvalidate()});
  } // function - _removeRelation

  /**
   * 데이터소스 연계 선택
   * @param {string} edgeId
   * @private
   */
  private _selectRelation(edgeId: string) {
    if (this.selectedRelation && this.selectedRelation.id === edgeId) {
      // 기존에 선택된 엣지를 재 선택한 경우 - 엣지 삭제
      this._removeRelation(edgeId);
      if (this.isRelationEditMode) {
        setTimeout(() => {
          this.onEditRelationMode();  // 편집 모드를 유지 시키기 위해 실행
        }, 100);
      }
    } else {
      // 신규 혹은 다른 엣지를 선택한 경우 - 선택
      this._clearSelection();
      const relInfo: BoardDataSourceRelation = this._relations.find(item => item.id === edgeId);
      this._edges.update({id: relInfo.id, label: 'delete'});
      this._network.selectNodes([relInfo.ui.source.id, relInfo.ui.target.id]);
      this.selectedRelation = relInfo;
      this.broadCaster.broadcast('CREATE_BOARD_SELECT_REL', {relation: relInfo});
    }
  } // function - _selectRelation

  /**
   * 선택 제거
   * @private
   */
  private _clearSelection() {
    (this.selectedRelation) && (this._edges.update({id: this.selectedRelation.id, label: undefined}));
    this.selectedDataSource = undefined;
    this.selectedRelation = undefined;
    this._network.unselectAll();
  } // function - _clearSelection

  /**
   * Check Korean
   * @param objStr
   * @return {boolean}
   * @private
   */
  private _checkKorean(objStr): boolean {
    let isKorean: boolean = false;
    for (let idx = 0; idx < objStr.length; idx++) {
      if (((objStr.charCodeAt(idx) > 0x3130 && objStr.charCodeAt(idx) < 0x318F) || (objStr.charCodeAt(idx) >= 0xAC00 && objStr.charCodeAt(idx) <= 0xD7A3))) {
        isKorean = true;
        break;
      }
    }
    return isKorean;
  } // function - _checkKorean

}
