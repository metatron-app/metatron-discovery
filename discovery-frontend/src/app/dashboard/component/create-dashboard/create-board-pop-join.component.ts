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
import * as pixelWidth from 'string-pixel-width';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BoardDataSource, JoinMapping, QueryParam } from '../../../domain/dashboard/dashboard';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { Datasource, Field } from '../../../domain/datasource/datasource';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { CommonUtil } from '../../../common/util/common.util';
import { Alert } from '../../../common/util/alert.util';
import * as $ from 'jquery';
import { StringUtil } from '../../../common/util/string.util';

@Component({
  selector: 'create-board-pop-join',
  templateUrl: './create-board-pop-join.component.html'
})
export class CreateBoardPopJoinComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('leftGrid')
  private leftGrid: GridComponent; // 조인 대상 원본 데이터 그리드

  @ViewChild('rightGrid')
  private rightGrid: GridComponent; // 조인할 데이터 그리드

  @ViewChild('joinPreview')
  private joinPreview: GridComponent; // 조인 미리보기

  private _dataSource: BoardDataSource;       // 메인 데이터소스
  private _queryLimit: number = 1000;         // 조회 갯수
  private _similarity: SimilarityInfo[];      // Join Key 유사도 정보
  private _joinMappings: JoinMapping[] = [];  // 전체 join 정보
  private _joinMapping: JoinMapping;          // 현재 조인 팝업의 조인 연결 정보

  private _candidateDataSources: Datasource[];   // 조인 할수 있는 데이터 소스 목록들

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isEmptyPreviewGrid: boolean = false; // 프리뷰 그리드 데이터 존재 여부
  public isShowJoinPopup: boolean = false;    // Join Popup 표시 여부

  public editingJoin: EditJoin;               // 편집중인 조인 정보

  @Output('complete')
  public completeEvent: EventEmitter<JoinMapping[]> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private datasourceService: DatasourceService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();

  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Join 추가 설정
   * @param {BoardDataSource} dataSource
   * @param {Datasource[]} candidateDataSources
   * @param {JoinMapping[]} joinMappings
   * @param {BoardDataSource} leftDataSource
   * @param {JoinMapping} join
   */
  public addJoin(dataSource: BoardDataSource, candidateDataSources: Datasource[], joinMappings: JoinMapping[],
                 leftDataSource: BoardDataSource, join?: JoinMapping) {
    this._dataSource = dataSource;
    this._candidateDataSources = candidateDataSources;
    this._joinMappings = joinMappings;
    this._joinMapping = join;
    this._queryLimit = 100;
    this.editingJoin = new EditJoin();
    this.editingJoin.isEdit = false;
    this.editingJoin.left = leftDataSource;
    this._queryData(this.editingJoin.left.engineName, this.editingJoin.left.temporary).then(data => {
      this.updateGrid(data[0], this.editingJoin.left.uiFields, 'left');
      this.changeDetect.detectChanges();
    }).catch(err => this.showErrorMsgForJoin(err));
    this.isShowJoinPopup = true;
  } // function - addJoin

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Join 수정 설정
   * @param {BoardDataSource} dataSource
   * @param {Datasource[]} candidateDataSources
   * @param {JoinMapping[]} joinMappings
   * @param {BoardDataSource} leftDataSource
   * @param {BoardDataSource} rightDataSource
   * @param {JoinMapping} join
   * @param {string} targetDsId
   */
  public editJoin(dataSource: BoardDataSource, candidateDataSources: Datasource[], joinMappings: JoinMapping[],
                  leftDataSource: BoardDataSource, rightDataSource: BoardDataSource,
                  join: JoinMapping, targetDsId: string) {

    this._dataSource = dataSource;
    this._joinMappings = joinMappings;
    this._candidateDataSources = candidateDataSources;

    // convert joinMapping => editJoin
    const editJoin: EditJoin = new EditJoin();
    editJoin.left = leftDataSource;
    editJoin.right = rightDataSource;
    editJoin.isEdit = true;
    const joinIdx: number = this._joinMappings.findIndex(mapping => mapping.id === targetDsId);
    if (-1 < joinIdx) {
      editJoin.joinMappingIdx = joinIdx;
      this._joinMapping = this._joinMappings[joinIdx];
    } else {
      editJoin.joinMappingIdx = this._joinMappings.findIndex(mapping => mapping.id === join.id);
      this._joinMapping = null;
    }

    // type
    if (join.type === 'LEFT_OUTER') {
      editJoin.selectedJoinType = 'left';
    } else if (join.type === 'INNER') {
      editJoin.selectedJoinType = 'inner';
    }

    // keypair
    const joinInfoList: JoinInfo[] = [];
    Object.keys(join.keyPair).forEach((key) => {
      const joinInfo: JoinInfo = new JoinInfo();
      joinInfo.leftJoinKey = key;
      joinInfo.rightJoinKey = join.keyPair[key];
      joinInfoList.push(joinInfo);
    });
    editJoin.joinInfoList = joinInfoList;

    this.editingJoin = editJoin;

    const promises = [];

    promises.push(new Promise((res, rej) => {
      this._queryLimit = 100;
      this._queryData(this.editingJoin.left.engineName, this.editingJoin.left.temporary).then(data => {
        this.updateGrid(data[0], this.editingJoin.left.uiFields, 'left');
        res();
      }).catch(rej);
    }));

    promises.push(new Promise((res, rej) => {
      this._queryLimit = 100;
      this._queryData(this.editingJoin.right.engineName).then(data => {
        this.updateGrid(data[0], this.editingJoin.right.uiFields, 'right');
        res();
      }).catch(rej);
    }));

    promises.push(new Promise((res, rej) => {
      this._loadDataToPreviewGrid(false).then(res).catch(rej);
    }));

    this.loadingShow();
    CommonUtil.waterfallPromise(promises).then(() => {
      this.loadingHide();
      this.changeDetect.detectChanges();
    }).catch(this.loadingHide);

    this.isShowJoinPopup = true;
  } // function - editJoin

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 조인 화면 내 검색어에 의한 데이터 소스 목록
   * @returns {Datasource[]}
   */
  public get filteredCandidateDatasources() {
    if (StringUtil.isNotEmpty(this.editingJoin.joinSearchText)) {
      return this._candidateDataSources.filter((ds) => {
        return ds.name.indexOf(this.editingJoin.joinSearchText) > -1;
      });
    }
    return this._candidateDataSources;
  } // get - filteredCandidateDatasources

  /**
   * 조인 정보를 생성한다.
   */
  public completeJoin() {
    // validation check
    if (!this.editingJoin.right || 0 === this.editingJoin.joinInfoList.length) {
      Alert.warning(this.translateService.instant('msg.board.alert.join.complete.error'));
      return;
    }

    if (this.editingJoin.tempJoinMappings) {
      this.completeEvent.emit(this.editingJoin.tempJoinMappings);
    }

    this.closeJoinPopup();
  } // function - completeJoin

  /**
   * 조인 팝업을 닫는다.
   */
  public closeJoinPopup() {
    this.isShowJoinPopup = false;
    this.editingJoin = null;
  } // function - closeJoinPopup

  /**
   * Join 팝업 왼쪽 대상 이름
   */
  public joinPopupLeftName() {
    let leftName = this.editingJoin.left.name;
    if (0 < this.editingJoin.left.joins.length) {
      leftName = leftName + ' - ' + this.editingJoin.left.joins[0].name;
    }
    return leftName;
  } // function - joinPopupLeftName

  /**
   * 오른쪽 조인 대상 데이터소스 셀렉트박스의 옵션을 표시한다.
   */
  public openOptionsJoinDatasources() {
    this.editingJoin.isJoinDatasourceFl = true;
    this.editingJoin.joinSearchText = '';

    // 포커스 이동
    setTimeout(() => $('#joinSearchText').trigger('focus'));
  } // function - openOptionsJoinDatasources

  /**
   * 오른쪽 조인 테이블을 선택한다.
   * @param {Datasource} ds
   */
  public loadDataToRightJoinGrid(ds: Datasource) {

    if (this.editingJoin.right && this.editingJoin.right.id === ds.id) {
      return;
    }

    (this.rightGrid) && (this.rightGrid.destroy());
    this.editingJoin.right = BoardDataSource.convertDsToMetaDs(ds);
    this._queryLimit = 100;
    this._queryData(ds.engineName).then(data => {
      this.editingJoin.isJoinDatasourceFl = false;  // 콤보박스 옵션 닫음

      // 기존 정보 초기화
      this.editingJoin.joinInfoList = [];
      this._initPreview();

      // 그리드 조회
      this.updateGrid(data[0], this.editingJoin.right.uiFields, 'right');
      // 데이터 유사도 처리
      this.datasourceService.getDatasourceSimilarity(
        this.editingJoin.left.engineName, this.editingJoin.right.engineName
      ).then((similarity) => {
        this._similarity = similarity;
        this._setSimilarity();
        this.changeDetect.detectChanges();
      }).catch(err => {
        this.showErrorMsgForJoin(err);
      });

    }).catch(err => this.showErrorMsgForJoin(err));
  } // function - loadDataToRightJoinGrid

  /**
   * 조인 키를 선택한다.
   * @param {MouseEvent} event
   * @param {string} direction
   * @param {string} name
   */
  public selectJoinColumn(event: MouseEvent, direction: string, name: string) {
    event.stopPropagation();
    if ('left' === direction) {
      this.editingJoin.leftJoinKey = name;
      this.editingJoin.isJoinLeftFl = false;
    } else {
      this.editingJoin.rightJoinKey = name;
      this.editingJoin.isJoinRightFl = false;
    }
  } // function - selectJoinColumn

  /**
   * 조인키를 추가한다.
   */
  public addToJoinKeys() {

    // validation
    if ('' === this.editingJoin.leftJoinKey.trim() || '' === this.editingJoin.rightJoinKey.trim()) {
      this.editingJoin.joinChooseColumnErrorFl = true;
      return;
    }

    // 정보 등록
    const info = new JoinInfo();
    info.leftJoinKey = this.editingJoin.leftJoinKey;
    info.rightJoinKey = this.editingJoin.rightJoinKey;
    this.editingJoin.joinInfoList.push(info);

    this.editingJoin.leftJoinKey = '';
    this.editingJoin.rightJoinKey = '';
    this.editingJoin.joinChooseColumnErrorFl = false;

    this._setSimilarity();

    this._loadDataToPreviewGrid().then();

  } // function - addToJoinKeys

  /**
   * 조인 결과 줄 수 설정
   * @param {number} rowNum
   */
  public setRowPreviewGrid(rowNum: number) {

    // 숫자가 변경 됐을때만 실행
    if (Number(rowNum) !== this.editingJoin.rowNum) {
      // Row 설정
      this.editingJoin.rowNum = rowNum;
      // 조회
      this._loadDataToPreviewGrid().then();
    }

  } // function - setRowPreviewGrid

  /**
   * 조인 편집 내 조인타입 변경
   * @param type
   */
  public changeJoinType(type) {
    if (this.editingJoin.selectedJoinType === type) return;
    this.editingJoin.selectedJoinType = type;
    if (this.editingJoin.joinInfoList.length !== 0) {
      this._loadDataToPreviewGrid().then(); // 조회
    }
  } // function - changeJoinType

  /**
   * 조인키 목록 중 특정 정보를 삭제한다.
   * @param idx
   */
  public removeJoinInfoList(idx) {
    this.editingJoin.joinInfoList.splice(idx, 1);
    if (this.editingJoin.joinInfoList.length !== 0) {
      this._loadDataToPreviewGrid().then();
    } else {
      this._initPreview();
    }
    this._setSimilarity();
  } // function - removeJoinInfoList

  // noinspection JSMethodCanBeStatic
  /**
   * 검색어를 강조하는 태그를 반환한다.
   * @param name
   * @param searchText
   * @return {string}
   */
  public highlightSearchText(name, searchText): string {
    return name.replace(new RegExp('(' + searchText + ')'), '<span class="ddp-txt-search">$1</span>');
  } // function - highlightSearchText

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 유사도 적용
   * @private
   */
  private _setSimilarity() {
    const sim: SimilarityInfo[] = this._similarity;
    const joinInfos: JoinInfo[] = this.editingJoin.joinInfoList;

    this.editingJoin.leftJoinKey = '';
    this.editingJoin.rightJoinKey = '';

    if (this._similarity && 0 < this._similarity.length) {
      const unuseSims: SimilarityInfo[] = sim.filter(item => {
        return 0 === joinInfos.filter(info => {
          return (item.to.split('.')[1] === info.leftJoinKey && item.from.split('.')[1] === info.rightJoinKey);
        }).length;
      });
      unuseSims.sort((prev, next) => {
        if (prev.similarity > next.similarity) {
          return -1;
        } else if (prev.similarity < next.similarity) {
          return 1;
        } else {
          return 0;
        }
      });
      if (unuseSims && 0 < unuseSims.length) {
        this.editingJoin.leftJoinKey = unuseSims[0].to.split('.')[1];
        this.editingJoin.rightJoinKey = unuseSims[0].from.split('.')[1];
      }
    }
  } // function - _setSimilarity

  /**
   * 프리뷰를 초기화한다.
   * @private
   */
  private _initPreview() {
    (this.joinPreview) && (this.joinPreview.destroy());
    this.isEmptyPreviewGrid = false;
    this.editingJoin.previewGridFl = false;
  } // function - _initPreview

  /**
   * 조인 편집 내 미리보기 조회
   * @param {boolean} loading
   * @returns {Promise<any>}
   */
  private _loadDataToPreviewGrid(loading: boolean = true): Promise<any> {
    return new Promise<any>((res, rej) => {

      this._initPreview();    // 조회 전에 초기화함

      // validation
      if (0 === this.editingJoin.joinInfoList.length) {
        Alert.warning(this.translateService.instant('msg.board.alert.join.setting.error'));
        return;
      }

      // 조인 정보 생성
      const joinInfo = new JoinMapping();
      joinInfo.keyPair = {};
      joinInfo.id = this.editingJoin.right.id;
      joinInfo.name = this.editingJoin.right.engineName;
      joinInfo.type = this.editingJoin.joinType;

      let paramJoins: JoinMapping[] = _.cloneDeep(this._joinMappings);
      if (this._joinMapping) {
        // 2-Depth Join
        paramJoins.some((mapping: JoinMapping) => {
          if (mapping.id === this.editingJoin.left.id) {
            this.editingJoin.joinInfoList.forEach((item) => {
              joinInfo.keyPair[item.leftJoinKey] = item.rightJoinKey;
            });
            joinInfo.joinAlias = mapping.joinAlias + '_1';
            mapping.join = joinInfo;
            return true;
          }
        });
      } else {
        // 1-Depth Join
        this.editingJoin.joinInfoList.forEach((item) => {
          joinInfo.keyPair[item.leftJoinKey] = item.rightJoinKey;
        });
        if (this.editingJoin.isEdit) {
          joinInfo.joinAlias = paramJoins[this.editingJoin.joinMappingIdx].joinAlias;
          paramJoins[this.editingJoin.joinMappingIdx] = joinInfo;
        } else {
          joinInfo.joinAlias = 'join_' + (paramJoins.length + 1);
          paramJoins.push(joinInfo);
        }

      }

      // 조회 상태 저장
      this.editingJoin.tempJoinMappings = paramJoins;

      this._queryLimit = this.editingJoin.rowNum;  // 조회 제한 설정

      this._queryData(paramJoins).then((data) => {
        this.editingJoin.columnCnt = data[1].length;
        this.editingJoin.previewGridFl = true;

        if (0 < data[0].length && 0 < data[1].length) {
          this.isEmptyPreviewGrid = false;
          (this.editingJoin.rowNum > data[0].length) && (this.editingJoin.rowNum = data[0].length);
          this.updateGrid(data[0], data[1], 'joinPreview');
        } else {
          this.editingJoin.rowNum = 0;
          this.isEmptyPreviewGrid = true;
        }

        this.changeDetect.detectChanges();

        (res) && (res());
        (loading) && (this.loadingHide());

      }).catch(err => {
        if (err && err.message) {
          Alert.error(err.message);
        } else {
          Alert.error(this.translateService.instant('msg.alert.retrieve.fail'));
        }
        (rej) && (rej());
        (loading) && (this.loadingHide());
      });
    });
  } // function - _loadDataToPreviewGrid


  /**
   * 데이터를 조회한다. 
   * @param {JoinMapping[] | string} queryTarget
   * @param {boolean} isTemporary
   * @param {boolean} loading
   * @return {Promise<[any , Field[]]>}
   * @private
   */
  private _queryData(queryTarget: JoinMapping[] | string, isTemporary: boolean = false, loading: boolean = true): Promise<[any, Field[]]> {
    return new Promise<any>((res, rej) => {

      let joins: JoinMapping[] = null;
      let dsName: string = null;
      if (queryTarget instanceof Array) {
        joins = queryTarget;
      } else {
        dsName = queryTarget;
      }

      const params = new QueryParam();
      params.limits.limit = this._queryLimit;

      params.dataSource = new BoardDataSource();
      params.dataSource.type = 'default';
      if (dsName) {
        params.dataSource.name = dsName;
        params.dataSource.temporary = isTemporary;
      } else {
        params.dataSource.name = this._dataSource.engineName;
        params.dataSource.temporary = this._dataSource.temporary;
      }

      // 조인 설정
      if (joins && joins.length > 0) {
        params.dataSource.type = 'mapping';
        params.dataSource['joins'] = joins;
      } // end if - joinMapping

      (loading) && (this.loadingShow());
      this.datasourceService.getDatasourceQuery(params).then((data) => {
        let fieldList: Field[] = [];
        if (data && 0 < data.length) {
          fieldList = Object.keys(data[0]).map(keyItem => {
            const tempInfo = new Field();
            tempInfo.name = keyItem;
            return tempInfo;
          });
        }
        res([data, fieldList]);
        this.loadingHide();
      }).catch((err) => {
        rej(err);
        this.loadingHide();
      });
    });
  } // function - _queryData

  /**
   * 그리드 갱신
   * @param data
   * @param {Field[]} fields
   * @param {string} targetGrid
   */
  private updateGrid(data: any, fields: Field[], targetGrid: string = 'main') {

    // 헤더정보 생성
    const headers: header[] = fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 62;
        return new SlickGridHeader()
          .Id(field.name)
          .Name(field.name)
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );

    let rows: any[] = data;

    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    let grid: GridComponent;

    if (targetGrid === 'left') {
      grid = this.leftGrid;
    } else if (targetGrid === 'right') {
      grid = this.rightGrid;
    } else if (targetGrid === 'joinPreview') {
      grid = this.joinPreview;
    }

    grid.destroy();

    if (0 < headers.length) {
      grid.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build()
      );

      if (0 === rows.length) {
        grid.invalidateAllRows();
        grid.elementRef.nativeElement.querySelector('.grid-canvas').innerHTML =
          '<div class="ddp-data-empty"><span class="ddp-data-contents">'
          + this.translateService.instant('msg.space.ui.no.data')
          + '</span></div>';
      }
    }

  } // function - updateGrid


  /**
   * Show detail Error msg alert
   * @param err
   */
  private showErrorMsgForJoin(err) {
    err.message = this.translateService.instant('msg.space.alert.join.msg');
    this.commonExceptionHandler(err);
  }

}

/**
 * 조인 편집 화면에 사용하는 클래스
 */
class EditJoin {
  public left: BoardDataSource;
  public right: BoardDataSource | JoinMapping;

  // 조인 표시 형식 플래그
  public viewModeForLeft: string = 'grid';    // view mode for existing data : grid / table
  public viewModeForRight: string = 'grid';   // view mode for Join : gird/ table
  public isJoinDatasourceFl: boolean = false;  // 조인할 데이터소스 리스트 show/hide
  public isJoinLeftFl: boolean = false;  // left columns layer show/hide
  public isJoinRightFl: boolean = false;  // left columns layer show/hide
  public joinSearchText: string = '';  // 조인데이터소스 검색어

  // 조인 정보
  public leftJoinKey: string = '';       // 기준 테이블의 조인 컬럼이름
  public rightJoinKey: string = '';      // 대상 테이블의 조인 컬럼이름
  public joinInfoList: JoinInfo[] = []; // 조인 정보 목록
  public selectedJoinType: string = 'left';  // 선택된 조인 형식
  public joinChooseColumnErrorFl: boolean = false; // 조인시 에러 메세지

  public columnCnt: number = 0;
  public rowNum: number = 1000;

  public previewGridFl: boolean = false;

  public tempJoinMappings: JoinMapping[];

  // 수정관련 정보
  public isEdit: boolean = false;
  public joinMappingIdx: number = -1;

  get joinType(): string {
    if (this.selectedJoinType === 'left') {
      return 'LEFT_OUTER';
    } else if (this.selectedJoinType === 'inner') {
      return 'INNER';
    } else {
      throw new Error(`지원되지 않는 타입 > ${this.selectedJoinType}`);
    }
  }
} // end of EditJoin

/**
 * 조인 정보
 */
class JoinInfo {
  public leftJoinKey: string;
  public rightJoinKey: string;
}

/**
 * 필드 유사도 정보
 */
class SimilarityInfo {
  from: string;
  similarity: number;
  to: string;
}
