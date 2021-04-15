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

import * as $ from 'jquery';
import * as _ from 'lodash';
import {isNullOrUndefined, isUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {PrDataflow} from '@domain/data-preparation/pr-dataflow';
import {DsType, ImportType, PrDataset, Rule} from '@domain/data-preparation/pr-dataset';
import {PreparationAlert} from '../../util/preparation-alert.util';
import {SnapshotLoadingComponent} from '../../component/snapshot-loading.component';
import {CreateSnapshotPopupComponent} from '../../component/create-snapshot-popup.component';
import {DataflowService} from '../service/dataflow.service';
import {DataflowModelService} from '../service/dataflow.model.service';
import {DatasetInfoPopupComponent} from './component/dataset-info-popup/dataset-info-popup.component';

declare let echarts: any;

@Component({
  selector: 'app-dataflow-detail',
  templateUrl: './dataflow-detail.component.html'
})

export class DataflowDetailComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DatasetInfoPopupComponent)
  public datasetInfoPopup: DatasetInfoPopupComponent;

  @ViewChild(SnapshotLoadingComponent)
  public snapshotLoadingComponent: SnapshotLoadingComponent;

  @ViewChild(CreateSnapshotPopupComponent)
  private createSnapshotPopup: CreateSnapshotPopupComponent;

  // 타입별 아이콘 정보
  private symbolInfo: any;

  // 차트 기본 옵션
  private chartOptions: any;

  // 노드 라벨 속성
  private label: any;

  // 루트 데이터셋 개수
  private rootCount: number = 0;

  // depth 개수
  private depthCount: number = 0;

  // 노드 리스트
  private chartNodes: any[] = [];

  // 노드간 링크 리스트
  private chartLinks: any[] = [];

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @ViewChild('dfName')
  private dfName: ElementRef;
  @ViewChild('dfDesc')
  private dfDesc: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public canNavigationBack: boolean;
  public locationSubscription: any;

  @Input()
  public dataflow: PrDataflow;

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  @Input()
  public selectedDataSet: PrDataset;

  // 사용된 dataflow layer show/hide
  public isDataflowsShow: boolean = false;

  // 데이터 플로우 option layer show/hide
  public isDataflowOptionShow: boolean = false;

  // 데이터 플로우 이름 수정 모드
  public isDataflowNameEditMode: boolean = false;

  // 데이터 플로우 설명 수정 모드
  public isDataflowDescEditMode: boolean = false;

  // 데이터셋 이름 수정 모드
  public isDatasetNameEditMode: boolean = false;

  // 데이터셋 설명 수정 모드
  public isDatasetDescEditMode: boolean = false;

  // echart ins
  public chart: any;

  // 차트를 그리기 위한 기반 데이터
  public dataSetList: any[] = [];

  // delete selected dataflow
  public selectedDataflowId: string;

  // public dataflows: Dataflow[] = [];
  public dataflows: PrDataflow[] = [];

  // 룰 리스트 (룰 미리보기)
  public ruleList: any[];

  // 룰 리스트에서 필요한 변수
  public commandList: any[];
  public ruleVO: Rule = new Rule();

  // container for dataflow name/desc - for edit
  public dataflowName: string;
  public dataflowDesc: string;

  public cloneFlag: boolean = false;

  public step: string;
  public longUpdatePopupType: string = '';

  public isSelectDatasetPopupOpen: boolean = false;    // Swap dataset popup open/close
  public isRadio: boolean = false;                     // If swapping -> true / if Adding -> false
  public swapDatasetId: string;                        // Swapping 대상 imported 면 dataset id wrangled 면 upstreamId
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private dataflowService: DataflowService,
    private dataflowModelService: DataflowModelService,
    private commonLocation: Location,
    private activatedRoute: ActivatedRoute,
    protected elementRef: ElementRef,
    protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public canDeactive(): Observable<boolean> | boolean {
    if (false === this.canNavigationBack) {
      this.canNavigationBack = true;
      return false;
    }
    return true;
  }

  /**
   * 초기 설정
   */
  public ngOnInit() {
    super.ngOnInit();

    // navigation back check
    this.step = '';
    this.canNavigationBack = true;
    this.locationSubscription = this.commonLocation.subscribe((data) => {
      if ('update-rules' === this.step) {
        console.log('navigation back from update-rules');
        this.canNavigationBack = false;
      } else if ('' === this.step && false === data.url.endsWith('/datapreparation/dataflow')) {
        console.log('navigation back to wrong path');
      }

      if (false === this.canNavigationBack) {
        window.history.go(1);
      }
    });

    // 초기 세팅
    this.initViewPage();

    // 초기화
    this.init();


  } // function - ngOnInit

  /**
   * View 종료
   */
  public ngOnDestroy() {
    this.locationSubscription.unsubscribe();
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public snapshotCreateFinish(data) {
    this.snapshotLoadingComponent.init(data);
  }

  public openSnapshotPopup() {
    this.createSnapshotPopup.init({id: this.selectedDataSet.dsId, name: this.selectedDataSet.dsName});
  }

  /**
   * 다른 데이터셋으로 변경했을 떄 ..
   * @Param data 변경된 데이터셋으로 다시 표시
   */
  public onDatasetChange(data) {

    this.initSelectedDataSet();

    this.selectedDataSet = data;

    this.getDataflow();

  }

  public addDatasets() {
    this.openAddDatasetPopup(null);
  }


  /**
   * 뒤로가기
   */
  public close() {
    this.router.navigate(['/management/datapreparation/dataflow']);
  }

  // 다른 데이터 플로우로 이동
  public selectDataflow(dfId) {
    // 선택된 데이터 셋 레이어 hide
    this.selectedDataSet.dsId = '';
    this.isDataflowsShow = false;

    // 선택한 데이터 플로우 아이디로 변경
    this.dataflow.dfId = dfId;
    // 데이터 플로우 상세조회
    this.getDataflow();
  }

  // 데이터 플로우 옵션 레이어 toggle
  public showOption(event) {
    this.isDataflowOptionShow = !this.isDataflowOptionShow;
    event.stopImmediatePropagation();
  }

  public hideOption() {
    this.isDataflowOptionShow = false;
  }

  /**
   * Dataflow 이름 수정
   * @Param $event
   */
  public onDataflowNameEdit($event) {
    $event.stopPropagation();
    this.isDataflowNameEditMode = !this.isDataflowNameEditMode;

    if (this.isDataflowDescEditMode) {
      this.isDataflowDescEditMode = false;
    }

    if (this.dataflowDesc !== this.dataflow.dfDesc) {
      this.dataflowDesc = this.dataflow.dfDesc;
    }

    this.changeDetect.detectChanges();
    this.dfName.nativeElement.focus();
  }

  /**
   * Dataflow 설명 수정
   * @Param $event
   */
  public onDataflowDescEdit($event) {
    $event.stopPropagation();
    this.isDataflowDescEditMode = !this.isDataflowDescEditMode;

    if (this.isDataflowNameEditMode) {
      this.isDataflowNameEditMode = false;
    }

    if (this.dataflowName !== this.dataflow.dfName) {
      this.dataflowName = this.dataflow.dfName;
    }

    this.changeDetect.detectChanges();
    this.dfDesc.nativeElement.focus();
  }

  /**
   * Dataflow 이름 셋 (this.dataflowName은 container이고 this.dataflow.dfName이 실제 이름임
   */
  public setDataflowName() {

    this.isDataflowNameEditMode = false;
    if (this.dataflowName !== this.dataflow.dfName) {
      this.dataflowName = this.dataflow.dfName;
    }
  }

  /**
   * Dataflow 섦영 셋 (this.dataflowDesc은 container이고 this.dataflow.dfDesc 실제 설명임
   */
  public setDataflowDesc() {
    this.isDataflowDescEditMode = false;
    if (this.dataflowDesc !== this.dataflow.dfDesc) {
      this.dataflowDesc = this.dataflow.dfDesc;
    }
  }

  // 팝업끼리 관리하는 모델들 초기화
  public init() {
    this.dataflow = new PrDataflow();
    this.selectedDataSet = new PrDataset();

    // Get param from url
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.dataflow.dfId = params['id'];
      }
      if (this.cookieService.get('SELECTED_DATASET_ID')) { // From dataset detail

        this.selectedDataSet.dsId = this.cookieService.get('SELECTED_DATASET_ID');
        let type;
        switch (this.cookieService.get('SELECTED_DATASET_TYPE')) {
          case 'WRANGLED' :
            type = DsType.WRANGLED;
            break;
          case 'IMPORTED' :
            type = DsType.IMPORTED;
            break;
        }
        this.selectedDataSet.dsType = type;
        this.cookieService.delete('SELECTED_DATASET_ID');
        this.cookieService.delete('SELECTED_DATASET_TYPE');
        this.closeEditRule();
      } else {
        this.getDataflow();
        if (sessionStorage.getItem('DATASET_ID')) { // From dataflow detail
          this.addDatasets();
        }

      }
    });
  }

  /**
   * 데이터플로로우 이름, 설명 편집
   */
  public updateDataflow() {

    // 입력한 값이 없으면
    if (this.dataflowName.trim() === '' || this.dataflowName.length < 1) {
      Alert.warning(this.translateService.instant('msg.dp.alert.name.error'));
      return;
    }

    // 이름 validation
    if (this.dataflowName.length > 150) {
      Alert.warning(this.translateService.instant('msg.dp.alert.name.error.description'));
      return;
    }

    // 설명 validation
    if (!StringUtil.isEmpty(this.dataflowDesc) && this.dataflowDesc.length > 150) {
      Alert.warning(this.translateService.instant('msg.dp.alert.description.error.description'));
      return;
    }

    // 서버에 보낼 이름 설명 앞뒤 공백 제거
    this.dataflowName = this.dataflowName.trim();
    this.dataflowDesc ? this.dataflowDesc = this.dataflowDesc.trim() : null;

    const newDataflow = {
      dfId: this.dataflow.dfId,
      dfName: this.dataflowName,
      dfDesc: this.dataflowDesc
    };

    this.loadingShow();
    this.dataflowService.updateDataflow(newDataflow)
      .then((dataflow) => {
        this.loadingHide();
        this.isDataflowNameEditMode = false;
        this.isDataflowDescEditMode = false;
        this.dfName.nativeElement.blur();
        this.dfDesc.nativeElement.blur();
        this.dataflow = dataflow;
        this.dataflowDesc = dataflow.dfDesc;
        this.dataflowName = dataflow.dfName;
      })
      .catch((error) => {
        this.loadingHide();
        const prepError = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
      });
  }


  public confirmDelete(event, id) {
    event.stopPropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.dp.alert.del.flow.title');
    modal.description = this.translateService.instant('msg.dp.alert.del.flow.sub-title');

    this.selectedDataflowId = id;
    this.deleteModalComponent.init(modal);

  }

  /**
   * 이 데이터 플로우 삭제하기
   */
  public deleteDataflow() {
    this.loadingShow();
    this.dataflowService.deleteDataflow(this.selectedDataflowId).then(() => {
      Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
      this.loadingHide();
      this.close();

    }).catch(() => {
      Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
      this.loadingHide();
    });
  }

  /** 데이터셋을 지우고 난 후에 init */
  public initEventAfterDelete() {
    // 데이터 형식은 유지한 상태에서 내부 내용을 지우기 위해서 각 키별 삭제 처리를 함
    for (const key in this.selectedDataSet) {
      if (key) {
        delete this.selectedDataSet[key];
      }
    }
    // $.extend(this.selectedDataSet, new Dataset());
    $.extend(this.selectedDataSet, new PrDataset());

    // 밖에 누르면 edit을 할 수 없다
    this.isDatasetNameEditMode = false;
    this.isDatasetDescEditMode = false;
    this.getDataflow();
  }

  /** imported dataset일 경우, wrangled dataset을 생성하는 createWrangledDataset을 호출, wrangled dataset일 경우 룰 편집 화면으로 이동
   * @param {string} data step 정보
   */
  public datasetEventHandler(data?: string) {
    if (data) {
      this.step = data;
    } else {
      this.createWrangledDataset();
    }
  }

  /**
   * create wrangled dataset
   */
  public createWrangledDataset() {
    this.loadingShow();
    this.dataflowService.createWrangledDataset(this.selectedDataSet.dsId, this.dataflow.dfId)
      .then((result) => {
        this.loadingHide();
        if (isUndefined(result)) {
          Alert.warning(this.translateService.instant('msg.dp.alert.rule.create.fail'));
        } else {
          Alert.success(this.translateService.instant('msg.dp.alert.rule.create.success'));
          // 새로운 데이터 셋 정보로 초기화 및 차트 초기화
          this.getDataflow();

          // wrangled dataset 생성시 열려있던 창을 닫는다
          this.changeChartClickStatus(this.selectedDataSet, false);
          this.selectedDataSet.dsId = '';
        }
      })
      .catch((error) => {
        this.loadingHide();
        const prepError = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
      });
  }

  /**
   * Clone dataset
   * @param event
   */
  public datasetClone(event) {
    this.loadingShow();
    if (!this.cloneFlag) {
      this.dataflowService.cloneWrangledDataset(event.dsId).then(() => {
        this.cloneFlag = true;
        this.selectedDataSet.dsId = '';
        this.getDataflow();
      }).catch(() => {
        this.loadingHide();
        Alert.warning('msg.dp.alert.clone.failed');
      })
    }
  }

  /**
   * 데이터셋 타입 아이콘
   * @param datasetType
   */
  public getIconClass(datasetType): string {
    let result = '';
    switch (datasetType.toLowerCase()) {
      case 'dataset':
        result = 'ddp-icon-flow-dataset';
        break;
      case 'wrangled':
        result = 'ddp-icon-flow-wrangled';
        break;
      case 'db':
        result = 'ddp-icon-flow-db';
        break;
      case 'mysql':
        result = 'ddp-icon-flow-mysql';
        break;
      case 'post':
        result = 'ddp-icon-flow-post';
        break;
      case 'hive':
        result = 'ddp-icon-flow-db';
        break;
      case 'presto':
        result = 'ddp-icon-flow-presto';
        break;
      case 'phoenix':
        result = 'ddp-icon-flow-phoenix';
        break;
      case 'tibero':
        result = 'ddp-icon-flow-tibero';
        break;
      case 'file':
        result = 'ddp-icon-flow-file';
        break;
      case 'xls':
        result = 'ddp-icon-flow-xls';
        break;
      case 'xlsx':
        result = 'ddp-icon-flow-xlsx';
        break;
      case 'csv':
        result = 'ddp-icon-flow-csv';
        break;
      default:
        Alert.error(this.translateService.instant('msg.common.ui.no.icon.type'));
        break;
    }
    return result;
  }

  /**
   * chart에서 icon에 selected/unselected표시
   * @param dataset currently selected dataset
   * @param init is it from same page or from outside
   */
  public changeChartClickStatus(dataset, init: boolean = false) {

    if (!init) { // 현재 page에서 X 버튼을 눌러서 preview 창을 닫았을때
      let temp = this.chart.getOption();
      if (!isUndefined(temp)) {
        temp = temp.series[0].nodes.filter((node) => {
          if (_.eq(node.dsId, dataset.dsId)) {
            if (init) {
              node.symbol = this.symbolInfo.SELECTED[dataset.dsType];
              this.chart.setOption(temp);
            } else {
              node.detailType = dataset.dsType;
              node.symbol = _.cloneDeep(node.originSymbol);
              this.chart.setOption(temp);
            }

          }
        });
      }
    } else { // rule편집 화면에서 done버튼을 눌러서 다시 graph화면으로 왔을때 선택된 데이터셋이 동그라미있는 아이콘으로 바뀐다
      const tempChart = this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
      setTimeout(() => {
        if (!isUndefined(tempChart)) {
          let temp1 = tempChart.getOption();
          if (!isUndefined(temp1)) {
            temp1 = temp1.series[0].nodes.filter((node) => {
              if (_.eq(node.dsId, dataset.dsId)) {
                node.symbol = this.symbolInfo.SELECTED[dataset.dsType];
                tempChart.setOption(temp1);
              }
            });
          }
        }
      }, 500)
    }


    setTimeout(() => {
      this.dataflowChartAreaResize();
    }, 600);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private initViewPage() {

    this.symbolInfo = {
      IMPORTED: {
        UPLOAD: {
          DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png',
        },
        DATABASE: {
          DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png',
        },
        STAGING_DB: {
          DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db.png'
        }
      },
      WRANGLED: {
        DEFAULT: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_wrangled.png',
      },
      SELECTED: {
        IMPORTED: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_db_focus.png',
        WRANGLED: 'image://' + window.location.origin + '/assets/images/datapreparation/icon_dataset_focus.png'
      }
    };

    this.label = {
      normal: {
        show: true,
        position: 'bottom',
        textStyle: {color: '#000000', fontWeight: 'bold'},
        formatter(params) {
          if (params.data.dsName.length > 20) {
            return params.data.dsName.slice(0, 20) + ' ...'
          } else {
            return params.data.dsName;
          }
        }
      },
      emphasis: {
        show: true,
        position: 'bottom',
        textStyle: {color: '#000000', fontWeight: 'bold'},
        formatter(params) {
          if (params.data.dsName.length > 20) {
            return params.data.dsName.slice(0, 20) + ' ...'
          } else {
            return params.data.dsName;
          }
        }
      }
    };

    this.chartOptions = {
      backgroundColor: '#ffffff',
      tooltip: {show: false},
      xAxis: {
        type: 'value',
        max: null,
        interval: 1,
        splitLine: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        axisTick: {show: false}
      },
      yAxis: {
        type: 'value',
        max: null,
        interval: 1,
        inverse: true,
        splitLine: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        axisTick: {show: false}
      },
      series: [
        {
          type: 'graph',
          legendHoverLink: false,
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          symbolSize: 40,
          hoverAnimation: true,
          roam: false,
          edgeSymbol: ['none', 'arrow'],
          draggable: true,
          itemStyle: {normal: {color: '#ccc', borderColor: '#1af'}},
          nodes: null,
          links: null,
          lineStyle: {normal: {opacity: 1, width: 0.5}}
        }
      ], animation: false
    };

    this.commandList = [
      {command: 'create', alias: 'Cr'},
      {command: 'header', alias: 'He'},
      {command: 'keep', alias: 'Ke'},
      {command: 'replace', alias: 'Rp'},
      {command: 'rename', alias: 'Rm'},
      {command: 'set', alias: 'Se'},
      {command: 'settype', alias: 'St'},
      {command: 'countpattern', alias: 'Co'},
      {command: 'split', alias: 'Sp'},
      {command: 'derive', alias: 'Dr'},
      {command: 'delete', alias: 'De'},
      {command: 'drop', alias: 'Dp'},
      {command: 'pivot', alias: 'Pv'},
      {command: 'unpivot', alias: 'Up'},
      {command: 'join', alias: 'Jo'},
      {command: 'extract', alias: 'Ex'},
      {command: 'flatten', alias: 'Fl'},
      {command: 'merge', alias: 'Me'},
      {command: 'nest', alias: 'Ne'},
      {command: 'unnest', alias: 'Un'},
      {command: 'aggregate', alias: 'Ag'},
      {command: 'sort', alias: 'So'},
      {command: 'move', alias: 'Mv'},
      {command: 'union', alias: 'Ui'}
    ];
  }

  /**
   * 데이터플로우 차트 Height Resize
   */
  private dataflowChartAreaResize(resizeCall?: boolean): void {
    if (resizeCall === undefined) resizeCall = false;
    // const itemMinSize: number = 64;
    const itemMinSize: number = 70;
    const hScrollbarWith: number = 30;
    const topMargin: number = 50;
    let minHeightSize: number = 600;
    const $flow2 = $('.ddp-wrap-flow2');
    if ($flow2 !== undefined && $flow2 != null) {
      minHeightSize = $flow2.height() - topMargin;
    }
    let fixHeight: number = minHeightSize;
    if (this.dataflow != null && this.dataflow.hasOwnProperty('wrangledDsCount') && this.dataflow.hasOwnProperty('importedDsCount')) {
      let imported: number = this.dataflow.importedDsCount;
      let wrangled: number = this.dataflow.wrangledDsCount;
      if (imported === undefined) imported = 0;
      if (wrangled === undefined) wrangled = 0;
      const lImported: number = (imported * itemMinSize) + Math.floor(wrangled * itemMinSize / 2);
      const lWrangled: number = (wrangled * itemMinSize) + Math.floor(imported * itemMinSize / 2);
      if (lImported > minHeightSize || lWrangled > minHeightSize) {
        if (lImported > lWrangled) {
          fixHeight = lImported;
        } else {
          fixHeight = lWrangled;
        }
      }
    }
    let isRight: boolean = false;
    if ($('.sys-dataflow-right-panel').width() !== null) {
      isRight = true;
    }
    const minWidthSize: number = $flow2.width() - hScrollbarWith;
    if (isRight) {
      $('.ddp-box-chart').css('overflow-x', 'auto');
    } else {
      $('.ddp-box-chart').css('overflow-x', 'hidden');
    }
    const $chartCanvas = $('#chartCanvas');
    $chartCanvas.css('height', fixHeight + 'px').css('width', minWidthSize + 'px').css('overflow', 'hidden');
    if ($chartCanvas.children() != null && $chartCanvas.children() !== undefined) {
      $chartCanvas.children().css('height', fixHeight + 'px').css('width', minWidthSize + 'px');
    }
    if ($chartCanvas.children().children() != null && $chartCanvas.children().children() !== undefined) {
      $chartCanvas.children().children().css('height', fixHeight + 'px').css('width', minWidthSize + 'px');
    }

    if (resizeCall === true && this.chart != null) {
      this.chart.resize();
    }
  }

  /**
   * Fetch dataflow info
   */
  public getDataflow(isOpen: boolean = false) {

    this.loadingShow();

    // Fetch dataflow info
    this.dataflowService.getDataflow(this.dataflow.dfId).then((dataflow) => {

      if (dataflow) {
        // this.dataflow = dataflow 로 대체 가능한지 확인
        this.dataflow = $.extend(this.dataflow, dataflow);

        // canvas height resize
        this.dataflowChartAreaResize();
        // canvas height resize


        if (this.dataflow.datasets) { // if dataflow has datasets
          this.dataSetList = this.dataflow.datasets;
        } else {
          if (this.dataflow['_embedded'] && this.dataflow['_embedded'].datasets) {
            this.dataSetList = this.dataflow['_embedded'].datasets;
          } else {
            this.dataSetList = [];
          }
        }

        this.dataSetList = this.dataSetList.filter((ds) => {
          if (ds.dsType && 'FULLWRANGLED' !== ds.dsType.toUpperCase()) {
            return true;
          }
        });

        if (this.dataSetList && 1 < this.dataSetList.length) {
          this.dataSetList.sort((left, right) => {
            const leftTime = Date.parse(left.createdTime);
            const rightTime = Date.parse(right.createdTime);
            if (isNaN(rightTime)) {
              return -1;
            } else if (isNaN(leftTime)) {
              return 1;
            }
            return leftTime < rightTime ? -1 : leftTime > rightTime ? 1 : 0;
          });
        }

        // when there is no datasets left in dataflow
        if (dataflow.importedDsCount === 0 && dataflow.wrangledDsCount === 0) {
          this.dataSetList = [];
          this.dataflow = dataflow;
          this.loadingHide();
        } else {
          this.dataflowService.getUpstreams(this.dataflow.dfId)
            .then((upstreams) => {

              // 선택된 wrangled dataset의 imported dataset id를 몰라서 넘겨야한다 ;
              this.dataflowModelService.setUpstreamList(upstreams);

              const dfId = this.dataflow.dfId;
              const upstreamList = upstreams.filter((upstream) => {
                if (upstream.dfId === dfId) {
                  return true;
                }
              });
              for (const ds of this.dataSetList) {
                ds.upstreamDsIds = [];
                for (const upstream of upstreamList) {
                  if (upstream.dsId === ds.dsId) {
                    ds.upstreamDsIds.push(upstream.upstreamDsId);
                  }
                }
              }

              this.initChart(); // chart initial

              // set wrangled dataset as selected (from dataset detail)
              let wrangeldDsId = '';
              if (this.cookieService.get('FIND_WRANGLED')) {

                const dsId = this.cookieService.get('FIND_WRANGLED');
                this.cookieService.delete('FIND_WRANGLED');
                upstreams.forEach((item) => {
                  if (item['upstreamDsId'] === dsId) {
                    wrangeldDsId = item['dsId'];
                  }
                });
                if (wrangeldDsId !== '') {
                  this.selectedDataSet.dsId = wrangeldDsId;
                  this.selectedDataSet.dsType = DsType.WRANGLED;
                  isOpen = true;
                }
              }

              if (isOpen) {
                this.changeChartClickStatus(this.selectedDataSet, true);
                (this.datasetInfoPopup) && (this.datasetInfoPopup.setDataset(this.selectedDataSet));
              }
              this.loadingHide();

            })
            .catch((error) => {
              this.loadingHide();
              const prepError = this.dataprepExceptionHandler(error);
              PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
            });
        }

        this.setDataflowName();
        this.setDataflowDesc();

      } else {
        Alert.warning(this.translateService.instant('msg.dp.alert.no.flow.info'));
      }

    }).catch((error) => {
      this.loadingHide();
      const prepError = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
    });
  } // function - getDataflow


  /**
   * 데이터셋 초기화
   */
  private initSelectedDataSet() {
    // 데이터 형식은 유지한 상태에서 내부 내용을 지우기 위해서 각 키별 삭제 처리를 함
    for (const key in this.selectedDataSet) {
      if (key) {
        delete this.selectedDataSet[key];
      }
    }
    // $.extend(this.selectedDataSet, new Dataset());
    $.extend(this.selectedDataSet, new PrDataset());

    // 밖에 누르면 edit을 할 수 없다
    this.isDatasetNameEditMode = false;
    this.isDatasetDescEditMode = false;
  } // function - initSelectedDataSet

  public closeEditRule() {
    this.step = '';
    this.getDataflow(true);

  }


  /**
   * When done btn is pressed from Dataset swapping popup
   * @param data
   */
  public datasetPopupFinishEvent(data) {

    const param = this.setParamForSwapping(data);

    if (!isNullOrUndefined(param)) {
      if (param['dsList']) { // upstream 에 데이터플로우에 없어서 추가 해야한다

        this._addDatasetToDataflow(param.dfId, param['dsList']).then((_result) => {

          delete param['dsList'];
          this.datasetSwap(param);

        }).catch((_error) => {

        });

      } else {
        this.datasetSwap(param);
      }

    } else {
      this.isSelectDatasetPopupOpen = false;
    }

  }

  private setParamForSwapping(data) {
    const param: SwapParam = new SwapParam();

    param.dfId = this.dataflow.dfId;
    param.newDsId = data.newDsId;
    param.oldDsId = data.oldDsId;

    if (data.type === 'wrangled') {

      // 데이터프로우에 데이터셋이 존재 여부는 무조건 체크해야함
      const idx = this.dataSetList.findIndex((item) => {
        return item.dsId === data.newDsId
      });

      if (idx === -1) { // 데이터플로우에 선택된 데이터셋의 upstream 없음

        // 데이터플로우에 데이터셋 추가하는 param 추가
        const dsList: string[] = [];
        this.dataSetList.forEach((item) => {
          dsList.push(item.dsId);
        });
        dsList.push(data.newDsId);

        param.dsList = dsList;
        param.wrangledDsId = this.selectedDataSet.dsId;

      } else { // 데이터플로우에 선택된 데이터셋의 upstream 있음

        const upstreamDsIds = _.cloneDeep(this.dataflowModelService.getUpstreamList());

        const currentIdx = upstreamDsIds.findIndex((item) => {
          return item.dsId === this.selectedDataSet.dsId
        });

        const currentUpstreamId = upstreamDsIds[currentIdx].upstreamDsId;
        upstreamDsIds.splice(currentIdx, 1);

        const index = upstreamDsIds.findIndex((item) => {
          return item.upstreamDsId === currentUpstreamId
        });
        if (index !== -1) {
          // 3번
          param.wrangledDsId = this.selectedDataSet.dsId;
        }
      }

    } else { // imported


      // 같은 imported 를 선택 했기 때문에 변화 없음
      if (param.newDsId === param.oldDsId) {
        return undefined;
      } else {
        // swap 할 imported dataset 이 이미 데이터플로우에 있는 경우 ?
        // 두개의 같은 imported dataset 이 돌아옴 - 서버에서 처리 필요
      }
    }

    return param
  }


  /**
   * Add datasets (event listener)
   * @param data
   */
  public datasetPopupAddEvent(data): void {

    if (data === undefined || data == null || data.length === 0) {
      return
    }
    this.loadingShow();
    this.dataSetList.forEach((ds) => {
      data.push(ds.dsId);
    });

    this.dataflowService.updateDataSets(this.dataflow.dfId, {dsIds: data}).then((_result) => {
      this.loadingHide();
      this.selectedDataSet.dsId = '';
      this.isSelectDatasetPopupOpen = false;
      Alert.success(this.translateService.instant('msg.dp.alert.add.ds.success'));
      this.getDataflow();
    }).catch((error) => {
      this.loadingHide();
      Alert.error(this.translateService.instant(error.message));
      console.log('error -> ', error);
    });
  }

  private _addDatasetToDataflow(dfId, datasetLists) {
    return new Promise(((resolve, reject) => {
      this.dataflowService.updateDataSets(dfId, {dsIds: datasetLists, forSwap: true})
        .then((result) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.dp.alert.add.ds.success'));
          resolve(result);
        }).catch((error) => {
        this.loadingHide();
        reject(error)
      });
    }));
  }

  /**
   * Swap dataset API
   */
  public datasetSwap(param) {
    this.loadingShow();

    this.dataflowService.swapDataset(param).then((_result) => {
      // console.log('swapping >>>>>>>>>>>>', result);
      Alert.success('Swap successful');

      this.isSelectDatasetPopupOpen = false;
      // 초기화
      this.initSelectedDataSet();
      this.getDataflow();

    }).catch((error) => {
      Alert.fail('Swap failed');
      console.log(error);
      this.loadingHide();
    });
  }


  /**
   * Open swap dataset popup
   * @param data
   */
  public openAddDatasetPopup(data: any) {

    // console.log('openAddDatasetPopup', data);
    if (data === null) {
      this.swapDatasetId = null;
      this.longUpdatePopupType = 'add';
      // this.datasetPopupTitle = 'Add datasets';
      this.isRadio = false;
    } else {
      this.swapDatasetId = data.dsId;
      if (data.type === 'imported') {
        // this.datasetPopupTitle = 'Replace dataset';
        this.isRadio = true;
        this.longUpdatePopupType = 'imported';
      } else if (data.type === 'wrangled') {
        // this.datasetPopupTitle = 'Change input dataset';
        this.isRadio = true;
        this.longUpdatePopupType = 'wrangled';
      }
    }
    this.isSelectDatasetPopupOpen = true;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Chart
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 초기화
   */
  private initChart() {

    this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
    this.chart.clear();
    // this.chart.setVi

    this.chartNodes = [];
    this.chartLinks = [];
    this.depthCount = 0;
    this.rootCount = 0;

    // 최상위 노드 탐색
    this.dataSetList.forEach(item => {
      const rootDataset = this.findRootDataset(item, this.dataSetList);
      if (rootDataset.dsId !== item.dsId) {
        item.rootDataset = rootDataset;
      }
    });

    this.createNodeTree(this.dataSetList);

    // 중복 제거 - 원래 생성되는 배열을 보존하기 위해서 createNodeTree()는 원형대로 놓아둠
    this.chartNodes = this.chartNodes.filter((elem, index, self) => {
      for (const dsIdx in self) {
        if (self[dsIdx].dsId === elem.dsId) {
          if (dsIdx === index.toString()) {
            return true;
          }
          break;
        }
      }
      return false;
    });

    this.chartSpacing(this.chartNodes, this.chartLinks);

    // 하위 노드 위치 조정 ( 최상위 노드에 맞춰 정렬되도록 변경 )
    this.chartNodes.forEach(item1 => {
      if (item1.rootValue) {
        const rootDsNode = this.chartNodes.filter(item2 => item2.dsId === item1.rootDataset.dsId)[0];
        if (item1.value[1] < rootDsNode.value[1]) {
          const itemIdx = this.chartNodes
            .filter(item2 => item2.rootDataset && item2.rootDataset.dsId === item1.rootDataset.dsId)
            .findIndex(item2 => item2.dsId === item1.dsId);
          item1.value[1] = rootDsNode.value[1] + itemIdx;
        }
      }
    });

    this.chartOptions.xAxis.max = this.depthCount > 5 ? 5 + (this.depthCount - 5) : 5;
    this.chartOptions.yAxis.max = this.rootCount > 5 ? 5 + (this.rootCount - 5) : 5;
    this.chartOptions.series[0].nodes = this.chartNodes;
    this.chartOptions.series[0].links = this.chartLinks;
    this.chart.setOption(this.chartOptions);
    this.chartClickEventListener(this.chart);
    this.cloneFlag = false;
    this.chart.resize();

    const $chart = this;

    $(window).off('resize');
    $(window).on('resize', (_event) => {
      $chart.dataflowChartAreaResize(true);
    });
  } // function - initChart

  /**
   * 특정 데이터셋의 최상위 데이터셋 정보를 탐색한다
   * @param {PrDataset} node
   * @param {PrDataset[]} nodeList
   */
  // private findRootDataset(node: Dataset, nodeList: Dataset[]) {
  private findRootDataset(node: PrDataset, nodeList: PrDataset[]) {
    if (0 === node.upstreamDsIds.length && node.dsType === DsType.IMPORTED) {
      return node;
    } else {
      const result = nodeList
        .filter(item => -1 !== node.upstreamDsIds.indexOf(item.dsId))
        .map(item => this.findRootDataset(item, nodeList));
      return (result && 0 < result.length) ? result[0] : node;
    }
  } // function - findRootDataset

  /**
   * 차트 전체 노드 구조 생성
   * @param nodeList
   */
  private createNodeTree(nodeList) {

    // root노드
    const rootNodeList = nodeList.filter(node => (node.upstreamDsIds.length === 0));

    const wrangledRootNodeList = nodeList.filter((node) => {
      return _.eq(node.dsType, 'WRANGLED') && !_.eq(node.creatorDfId, this.dataflow.dfId);
    });

    // 각 root로 부터 파생되는 노드를 순차적으로 생성
    _.concat(rootNodeList, wrangledRootNodeList).map((node) => {
      const rootNode = this.createNode(node, 0, this.rootCount);
      this.rootCount += 1;
      this.setChildNode(nodeList, rootNode, rootNode);
    });

  } // function - createNodeTree

  /**
   * 차트 노드 생성
   * @param dataset
   * @param depth
   * @param position
   * @param rootNode
   * @returns {{dsId: (string | any); dsName: (string | any); name: (string | any); dsType; importType: any; detailType: any; flowName: any; upstream: any; children: Array; value: any[]; symbol: any; originSymbol: any; label: any}}
   */
  // private createNode(dataset: Dataset, depth: number, position: number, rootNode?: any) {
  private createNode(dataset: PrDataset, depth: number, position: number, rootNode?: any) {

    // if (DsType.IMPORTED === dataset.dsType) {
    //   importType = dataset.importType;
    //   detailType = isUndefined(dataset.custom) ? 'DEFAULT' : JSON.parse(dataset.custom);
    //   if (ImportType.DB === importType || ImportType.HIVE === importType) {
    //     detailType = detailType.connType || 'DEFAULT';
    //   } else if (ImportType.FILE === importType) {
    //     detailType = detailType.fileType || 'DEFAULT';
    //   }
    // } else {
    //   detailType = _.eq(dataset.creatorDfId, this.dataflow.dfId) ? 'CURR' : 'DIFF';
    //   flowName = dataset.creatorDfId;
    // }

    const flowName = dataset.creatorDfId;
    const importType: ImportType = dataset.importType;
    const detailType = 'DEFAULT';

    const nodeSymbol = DsType.IMPORTED === dataset.dsType ? this.symbolInfo[dataset.dsType][importType][detailType] : this.symbolInfo[dataset.dsType][detailType];

    const node = {
      dsId: dataset.dsId,
      dsName: dataset.dsName,
      name: dataset.dsId,
      dsType: dataset.dsType,
      importType: importType != null ? importType : undefined,
      detailType: detailType,
      flowName: flowName != null ? flowName : undefined,
      upstream: dataset.upstreamDsIds,
      children: [],
      value: [depth, position],
      symbol: nodeSymbol,
      originSymbol: _.cloneDeep(nodeSymbol),
      label: this.label
    };
    if (rootNode) {
      node['rootDataset'] = dataset['rootDataset'];
      node['rootValue'] = rootNode['value'];
    }

    // 차트 정보에 들어갈 노드 추가
    this.chartNodes.push(node);

    return node;
  } // function - createNode

  /**
   * 하위 노드 설정
   * @param nodeList
   * @param parent
   * @param rootNode
   */
  private setChildNode(nodeList, parent, rootNode) {
    const childNodeList = nodeList.filter((node) => {
      return node.upstreamDsIds.indexOf(parent.dsId) > -1 && _.eq(node.creatorDfId, this.dataflow.dfId);
    });
    childNodeList.map((child, idx) => {
      const depth = parent.value[0] + 1;
      const position = parent.value[1] + idx;
      this.rootCount = this.rootCount <= position ? position + 1 : this.rootCount;

      // 차트 정보에 들어갈 노드 추가
      const childData = this.createNode(child, depth, position, rootNode);

      // 차트 정보에 들어갈 링크 추가
      const link = {
        source: parent.dsId,
        target: childData.dsId
      };
      if (parent.value[1] !== position) {
        link['lineStyle'] = {
          normal: {
            curveness: -0.2
          }
        };
      }
      this.chartLinks.push(link);
      this.setChildNode(nodeList, childData, rootNode);
    });
  } // function - setChildNode

  /**
   * 차트 공백 설정
   * @param chartNodes
   * @param chartLinks
   */
  private chartSpacing(chartNodes, chartLinks) {
    for (const idx in chartNodes) {
      if (idx) {
        const node = chartNodes[idx];

        const upstreams = chartLinks.filter((l) => {
          if (l.target === node.dsId) {
            return true;
          }
        });

        if (0 < upstreams.length) {
          let maxDepth = 0;
          upstreams.forEach((l) => {
            const n = chartNodes.find((chartNode) => {
              if (chartNode.dsId === l.source) {
                return true;
              }
            });
            if (maxDepth < n.value[0]) {
              maxDepth = n.value[0];
            }
          });
          const diffDepth = maxDepth - node.value[0] + 1;
          if (0 < diffDepth) {
            const depth = node.value[0];
            const position = node.value[1];
            chartNodes.forEach((n) => {
              if (position === n.value[1] && depth <= n.value[0]) {
                n.value[0] += diffDepth;
              }
            });
          }
        }
      }
    }
  } // function - chartSpacing

  /**
   * 차트 노드 클릭 이벤트 리스너
   * @param chart
   */
  private chartClickEventListener(chart) {
    const symbolInfo = this.symbolInfo;


    chart.off('click');
    chart.on('click', (params) => {

      this.initSelectedDataSet();
      if (params && params.dataType && params.dataType === 'node') {
        this.selectedDataSet.dsId = params.data.dsId;
      } else {
        this.isDataflowsShow = false;
      }

      const clearSelectedNodeEffect = (() => {
        option.series[0].nodes.map((node) => {
          node.symbol = _.cloneDeep(node.originSymbol);
        });
      });

      const option = chart.getOption();
      if (params === null) {
        clearSelectedNodeEffect();
      } else {
        option.series[params.seriesIndex].nodes.map((node, idx) => {
          if (_.eq(idx, params.dataIndex) && params.data.detailType) {
            node.symbol = symbolInfo.SELECTED[params.data.dsType];
          } else {
            node.symbol = _.cloneDeep(node.originSymbol);
          }
        });
      }
      chart.setOption(option);

      if (!StringUtil.isEmpty(this.selectedDataSet.dsId) && this.datasetInfoPopup) {
        // 컴포넌트가 열려있는 상태에서 데이터를 설정해주기 위함
        this.datasetInfoPopup.setDataset(this.selectedDataSet);
      }

      setTimeout(() => {
        this.dataflowChartAreaResize();
      }, 600);

    });
  } // function - chartClickEventListener


}

class SwapParam {
  oldDsId: string;
  newDsId: string;
  dfId: string;
  wrangledDsId?: string;
  dsList?: string[];
}
