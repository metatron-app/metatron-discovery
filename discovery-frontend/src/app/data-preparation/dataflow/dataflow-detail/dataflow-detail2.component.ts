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

import {isNullOrUndefined, isUndefined} from 'util';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {Location} from '@angular/common';
import {ChangeDetectorRef, Component, ElementRef, Injector, Input, ViewChild} from "@angular/core";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import {SnapshotLoadingComponent} from "../../component/snapshot-loading.component";
import {CreateSnapshotPopup} from "../../component/create-snapshot-popup.component";
import {PrDataflow} from "../../../domain/data-preparation/pr-dataflow";
import {DeleteModalComponent} from "../../../common/component/modal/delete/delete.component";
import {DsType, ImportType, PrDataset, Rule} from "../../../domain/data-preparation/pr-dataset";
import {DataflowService} from "../service/dataflow.service";
import {DataflowModelService} from "../service/dataflow.model.service";
import {ActivatedRoute} from "@angular/router";
import {StringUtil} from "../../../common/util/string.util";
import {Alert} from "../../../common/util/alert.util";
import {PreparationAlert} from "../../util/preparation-alert.util";
import {Modal} from "../../../common/domain/modal";
import {DatasetInfoPopupComponent} from "./component/dataset-info-popup/dataset-info-popup.component";
import {PreparationCommonUtil} from "../../util/preparation-common.util";

declare let echarts: any;

@Component({
  selector: 'app-dataflow-detail2',
  templateUrl: './dataflow-detail2.component.html'
})

export class DataflowDetail2Component extends AbstractPopupComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DatasetInfoPopupComponent)
  public datasetInfoPopup: DatasetInfoPopupComponent;

  @ViewChild(SnapshotLoadingComponent)
  public snapshotLoadingComponent : SnapshotLoadingComponent;

  @ViewChild(CreateSnapshotPopup)
  private createSnapshotPopup : CreateSnapshotPopup;

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
  public dataSetList: PrDataset[];

  // delete selected dataflow
  public selectedDataflowId: string;

  public dataflows: PrDataflow[] = [];

  // 룰 리스트 (룰 미리보기)
  public ruleList: any[];

  // 룰 리스트에서 필요한 변수
  public commandList: any[];
  public ruleVO: Rule = new Rule;

  // container for dataflow name/desc - for edit
  public dataflowName: string;
  public dataflowDesc: string;

  public cloneFlag: boolean = false;

  public step: string;
  public longUpdatePopupType: string = '';

  public isSelectDatasetPopupOpen : boolean = false;    // Swap dataset popup open/close
  public isRadio : boolean = false;                     // If swapping -> true / if Adding -> false
  public swapDatasetId : string;                        // Swapping 대상 imported 면 dataset id wrangled 면 upstreamId

  public dfId: string;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private dfService: DataflowService,
    private dfModelService : DataflowModelService,
    private commonLocation: Location,
    private activatedRoute: ActivatedRoute,
    protected elementRef: ElementRef,
    protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기 설정
   */
  public ngOnInit() {
    super.ngOnInit();

    // navigation back check
    this.step = '';

    this._initialiseValues();
    this._initialiseChartValues();

    // Get param from url
    this.activatedRoute.params.subscribe((params) => {

      if (!_.isNil(params['id'])) {
        this.dfId = params['id'];
      }

      if (!this.dfModelService.isSelectedDsIdAndDsTypeEmpty()) {
        this.selectedDataSet.dsId = this.dfModelService.getSelectedDsId();
        this.selectedDataSet.dsType = this.dfModelService.getSelectedDsType();

        this.dfModelService.emptyDsIdAndDsType();

        this.getDataflow(true);
      } else {
        this.getDataflow();
      }

    });

  } // function - ngOnInit

  /**
   * View 종료
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public snapshotCreateFinish(data) {
    this.snapshotLoadingComponent.init(data);
  }

  public openSnapshotPopup() {
    this.createSnapshotPopup.init({id : this.selectedDataSet.dsId , name : this.selectedDataSet.dsName});
  }


  public addDatasets() {
    this.openAddDatasetPopup(null);
  }


  /**
   * 뒤로가기
   * */
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
  public setDataflowName(dfName: string) {

    this.isDataflowNameEditMode = false;
    this.dataflowName = dfName;

  }

  /**
   * Dataflow 섦영 셋 (this.dataflowDesc은 container이고 this.dataflow.dfDesc 실제 설명임
   */
  public setDataflowDesc(dfDesc: string) {

    this.isDataflowDescEditMode = false;
    this.dataflowDesc = !_.isNil(dfDesc) ? dfDesc : '';

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
    this.dfService.updateDataflow(newDataflow)
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
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
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
    this.dfService.deleteDataflow(this.selectedDataflowId).then(() => {
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
      delete this.selectedDataSet[key];
    }
    //$.extend(this.selectedDataSet, new Dataset());
    $.extend(this.selectedDataSet, new PrDataset());

    // 밖에 누르면 edit을 할 수 없다
    this.isDatasetNameEditMode = false;
    this.isDatasetDescEditMode = false;
    this.getDataflow();
  }

  /** imported dataset일 경우, wrangled dataset을 생성하는 createWrangledDataset을 호출, wrangled dataset일 경우 룰 편집 화면으로 이동
   * @param {string} data step 정보
   * */
  public datasetEventHandler(data?: string) {
    if (data) {
      if (data === 'resize') {
        // Check whether to put scroll bar
        const resize = $('.sys-dataflow-right-panel').width() !== null && $('.sys-dataflow-right-panel').width() / $('.ddp-wrap-flow2').width() > 0.5;
        if(resize) {
          $('.ddp-box-chart').css('overflow-x', 'auto');
        }else{
          $('.ddp-box-chart').css('overflow-x', 'hidden');
        }
      } else {
        this.step = data;
      }
    } else {
      this.createWrangledDataset();
    }
  }

  /**
   * create wrangled dataset
   */
  public createWrangledDataset() {
    this.loadingShow();
    this.dfService.createWrangledDataset(this.selectedDataSet.dsId, this.dataflow.dfId)
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
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /**
   * Clone dataset
   * @param event
   */
  public datasetClone(event) {
    this.loadingShow();
    if (!this.cloneFlag) {
      this.dfService.cloneWrangledDataset(event.dsId).then(() => {
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
   * chart에서 icon에 selected/unselected표시
   * @param dataset currently selected dataset
   * @param init is it from same page or from outside
   */
  public changeChartClickStatus(dataset, init:boolean = false) {

    if (!init) { // 현재 page에서 X 버튼을 눌러서 preview 창을 닫았을때
      let temp = this.chart.getOption();
      if (!isUndefined(temp)) {
        temp = temp.series[0].nodes.filter((node) => {
          if (_.eq(node.dsId, dataset.dsId)) {
            if (init) {
              node.symbol = this.symbolInfo[node.type]['SELECTED'];
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
                node.symbol = this.symbolInfo[node.type]['SELECTED'];
                tempChart.setOption(temp1);
              }
            });
          }
        }
      }, 500)
    }


    setTimeout( () => {
      this.dataflowChartAreaResize();
    }, 600);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * 데이터플로우 차트 Height Resize
   */
  private dataflowChartAreaResize(resizeCall?:boolean): void {
    if(resizeCall == undefined) resizeCall = false;
    const hScrollbarWith: number = 30;
    let minHeightSize: number = this.dataflow.datasets.length < 6 ? 600 : this.dataflow.datasets.length * 100;
    let fixHeight: number = minHeightSize;
    const minWidthSize: number = $('.ddp-wrap-flow2').width()- hScrollbarWith;
    $('.ddp-box-chart').css('overflow-x', 'hidden');
    $('#chartCanvas').css('height', fixHeight+'px').css('width', minWidthSize+'px').css('overflow', 'hidden');
    if($('#chartCanvas').children()!=null && $('#chartCanvas').children()!=undefined){
      $('#chartCanvas').children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    if($('#chartCanvas').children().children()!=null && $('#chartCanvas').children().children()!=undefined) {
      $('#chartCanvas').children().children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    $('#chartCanvas div:last-child').css('height', '');
    $('#chartCanvas div:last-child').css('width', '');
    if (resizeCall == true && this.chart != null) {this.chart.resize();}
  }


  /**
   * Fetch dataflow info
   */
  public getDataflow(isOpen?: boolean) {

    this.loadingShow();

    // Fetch dataflow info
    this.dfService.getDataflow(this.dfId).then((df: PrDataflow) => {

      if (!_.isNil(df)) {
        this.dataflow = df;

        this.setDataflowName(this.dataflow.dfName);
        this.setDataflowDesc(this.dataflow.dfDesc);

        this.dataSetList = [];
        if (this.dataflow.datasets) { // if dataflow has datasets
          this.dataSetList = this.dataflow.datasets;
        }

        this.dfService.getUpstreams(this.dataflow.dfId).then((upstreams: Upstream[]) => {

          // 선택된 wrangled dataset의 imported dataset id를 몰라서 넘겨야한다 ;
          this.dfModelService.setUpstreamList(upstreams);

          let upstreamList = upstreams.filter((upstream: Upstream) => {
            return upstream.dfId === this.dataflow.dfId;
          });

          for (let ds of this.dataSetList) {
            ds.upstreamDsIds = [];
            for (let upstream of upstreamList) {
              if (upstream.dsId === ds.dsId) {
                ds.upstreamDsIds.push(upstream.upstreamDsId);
              }
            }
          }

          this.initChart(); // chart initial

          if (isOpen) {
            this.changeChartClickStatus(this.selectedDataSet, true);
            (this.datasetInfoPopup) && (this.datasetInfoPopup.setDataset(this.selectedDataSet));
          }
          this.loadingHide();

        }).catch((error) => {
          this.loadingHide();
          this.translateService.instant(error.message)
        });

      } else {
        this.loadingHide();
        Alert.warning(this.translateService.instant('msg.dp.alert.no.flow.info'));
      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - getDataflow


  /**
   * 데이터셋 초기화
   */
  private initSelectedDataSet() {
    // 데이터 형식은 유지한 상태에서 내부 내용을 지우기 위해서 각 키별 삭제 처리를 함
    for (const key in this.selectedDataSet) {
      delete this.selectedDataSet[key];
    }
    //$.extend(this.selectedDataSet, new Dataset());
    $.extend(this.selectedDataSet, new PrDataset());

    // 밖에 누르면 edit을 할 수 없다
    this.isDatasetNameEditMode = false;
    this.isDatasetDescEditMode = false;
  } // function - initSelectedDataSet


  /**
   * When done btn is pressed from Dataset swapping popup
   * @param data
   */
  public datasetPopupFinishEvent (data) {

    let param = this.setParamForSwapping(data);

    if (!isNullOrUndefined(param)) {
      if (param['dsList']) { // upstream 에 데이터플로우에 없어서 추가 해야한다

        this._addDatasetToDataflow(param.dfId, param['dsList']).then((result) => {

          delete param['dsList'];
          this.datasetSwap(param);

        }).catch((error) => {

        });

      } else {
        this.datasetSwap(param);
      }

    } else {
      this.isSelectDatasetPopupOpen = false;
    }

  }

  private setParamForSwapping(data) {
    let param : SwapParam = new SwapParam();

    param.dfId = this.dataflow.dfId;
    param.newDsId = data.newDsId;
    param.oldDsId =  data.oldDsId;


    if (data.type === 'wrangled') {

      // 데이터프로우에 데이터셋이 존재 여부는 무조건 체크해야함
      let idx = this.dataSetList.findIndex((item) => {
        return item.dsId === data.newDsId
      });

      if (idx === -1) { // 데이터플로우에 선택된 데이터셋의 upstream 없음

        // 데이터플로우에 데이터셋 추가하는 param 추가
        let dsList: string[] = [];
        this.dataSetList.forEach((item) => {
          dsList.push(item.dsId);
        });
        dsList.push(data.newDsId);

        param.dsList= dsList;
        param.wrangledDsId = this.selectedDataSet.dsId;

      } else { // 데이터플로우에 선택된 데이터셋의 upstream 있음

        let upstreamDsIds = _.cloneDeep(this.dfModelService.getUpstreamList());

        let currentIdx = upstreamDsIds.findIndex((item) => {
          return item.dsId === this.selectedDataSet.dsId
        });

        let currentUpstreamId = upstreamDsIds[currentIdx].upstreamDsId;
        upstreamDsIds.splice(currentIdx,1);

        let index = upstreamDsIds.findIndex((item) => {
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

    if (isNullOrUndefined(data) || data.length === 0 ) {
      return;
    }

    this.loadingShow();
    this.dataSetList.forEach((ds) => {
      data.push(ds.dsId);
    });

    this.dfService.updateDataSets(this.dataflow.dfId, { dsIds : data }).then((result) => {
      this.loadingHide();
      this.selectedDataSet.dsId = '';
      this.isSelectDatasetPopupOpen = false;
      Alert.success(this.translateService.instant('msg.dp.alert.add.ds.success'));
      this.getDataflow();
    }).catch((error) => {
      this.loadingHide();
      Alert.error(this.translateService.instant(error.message));
      console.info('error -> ', error);
    });
  }


  private _addDatasetToDataflow(dfId, datasetLists) {
    return new Promise(((resolve, reject) => {
      this.dfService.updateDataSets(dfId, { dsIds : datasetLists, forSwap: true })
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

    this.dfService.swapDataset(param).then((result) => {
      // console.info('swapping >>>>>>>>>>>>', result);
      Alert.success('Swap successful');

      this.isSelectDatasetPopupOpen = false;
      // 초기화
      this.initSelectedDataSet();
      this.getDataflow();

    }).catch((error) => {
      Alert.fail('Swap failed');
      console.info(error);
      this.loadingHide();
    });
  }


  /**
   * Open swap dataset popup
   * @param data
   */
  public openAddDatasetPopup(data :any) {

    // console.info('openAddDatasetPopup', data);
    if(data === null) {
      this.swapDatasetId = null;
      this.longUpdatePopupType = 'add';
      // this.datasetPopupTitle = 'Add datasets';
      this.isRadio = false;
    }else{
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
    this.chartNodes = this.chartNodes.filter(function (elem, index, self) {
      for (let dsIdx in self) {
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
    this.chartOptions.tooltip = {
      formatter: (param) => {
        return param.dataType === 'node' ? PreparationCommonUtil.parseTooltip(param.data.dsName) : '';
      }
    };
    this.chart.setOption(this.chartOptions);
    this.chartClickEventListener(this.chart);
    this.cloneFlag = false;
    this.dataflowChartAreaResize(true);

    let $chart = this;

    $(window).off('resize');
    $(window).on('resize', function (event) {
      $chart.dataflowChartAreaResize(true);
    });
  } // function - initChart

  /**
   * 특정 데이터셋의 최상위 데이터셋 정보를 탐색한다
   * @param {Dataset} node
   * @param {Dataset[]} nodeList
   * @returns {Dataset}
   */
  //private findRootDataset(node: Dataset, nodeList: Dataset[]) {
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
   * @param {Dataset} rootNode
   * @returns {{dsId: (string | any); dsName: (string | any); name: (string | any); dsType; importType: any; detailType: any; flowName: any; upstream: any; children: Array; value: any[]; symbol: any; originSymbol: any; label: any}}
   */
  private createNode(dataset: PrDataset, depth: number, position: number, rootNode?: any) {

    let importType: ImportType = dataset.importType|| null;
    let detailType: string = 'DEFAULT';
    let flowName: string = dataset.creatorDfId;
    let name = PreparationCommonUtil.getNameForSvgWithDataset(dataset);
    if (name === '') {
      name = 'WRANGLED';
    }
    let nodeSymbol = this.symbolInfo[name][detailType];
    const node = {
      dsId: dataset.dsId,
      dsName: dataset.dsName,
      name: dataset.dsId,
      type: name,
      dsType: dataset.dsType,
      importType: importType != null ? importType : undefined,
      detailType: detailType != null ? detailType : undefined,
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
    for (let idx in chartNodes) {
      let node = chartNodes[idx];

      let upstreams = chartLinks.filter(function (l) {
        if (l.target === node.dsId) {
          return true;
        }
      });

      if (0 < upstreams.length) {
        let maxDepth = 0;
        upstreams.forEach(function (l) {
          let n = chartNodes.find(function (n) {
            if (n.dsId === l.source) {
              return true;
            }
          });
          if (maxDepth < n.value[0]) {
            maxDepth = n.value[0];
          }
        });
        let diffDepth = maxDepth - node.value[0] + 1;
        if (0 < diffDepth) {
          let depth = node.value[0];
          let position = node.value[1];
          chartNodes.forEach(function (n) {
            if (position == n.value[1] && depth <= n.value[0]) {
              n.value[0] += diffDepth;
            }
          });
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
          if (_.eq(idx, params.dataIndex) && params.data.type) {
            node.symbol = symbolInfo[params.data.type]['SELECTED'];
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

      setTimeout( () => {
        this.dataflowChartAreaResize();
      }, 600);

    });
  } // function - chartClickEventListener

  /**
   * Initialise values
   * @private
   */
  private _initialiseValues() {

    this.commandList = [
      { command: 'create', alias: 'Cr' },
      { command: 'header', alias: 'He' },
      { command: 'keep', alias: 'Ke' },
      { command: 'replace', alias: 'Rp' },
      { command: 'rename', alias: 'Rm' },
      { command: 'set', alias: 'Se' },
      { command: 'settype', alias: 'St' },
      { command: 'countpattern', alias: 'Co' },
      { command: 'split', alias: 'Sp' },
      { command: 'derive', alias: 'Dr' },
      { command: 'delete', alias: 'De' },
      { command: 'drop', alias: 'Dp' },
      { command: 'pivot', alias: 'Pv' },
      { command: 'unpivot', alias: 'Up' },
      { command: 'join', alias: 'Jo' },
      { command: 'extract', alias: 'Ex' },
      { command: 'flatten', alias: 'Fl' },
      { command: 'merge', alias: 'Me' },
      { command: 'nest', alias: 'Ne' },
      { command: 'unnest', alias: 'Un' },
      { command: 'aggregate', alias: 'Ag' },
      { command: 'sort', alias: 'So' },
      { command: 'move', alias: 'Mv' },
      { command: 'union', alias: 'Ui' }
    ];

    this.dataflow = new PrDataflow();
    this.selectedDataSet = new PrDataset();
  }


  /**
   * Initialise chart values and options
   * @private
   */
  private _initialiseChartValues() {

    const SVG_LOCATION: string = 'image://' + window.location.origin + '/assets/images/datapreparation/png/icon_';

    this.symbolInfo = {
        CSV : {
          DEFAULT: SVG_LOCATION + 'file_csv.png',
          SELECTED: SVG_LOCATION + 'file_csv_focus.png',
        },
        EXCEL : {
          DEFAULT: SVG_LOCATION + 'file_xls.png',
          SELECTED: SVG_LOCATION + 'file_xls_focus.png',
        },
        JSON : {
          DEFAULT: SVG_LOCATION + 'file_json.png',
          SELECTED: SVG_LOCATION + 'file_json_focus.png',
        },
        TXT : {
          DEFAULT: SVG_LOCATION + 'file_txt.png',
          SELECTED: SVG_LOCATION + 'file_txt_focus.png',
        },
        MYSQL: {
          DEFAULT: SVG_LOCATION + 'db_mysql.png',
          SELECTED: SVG_LOCATION + 'db_mysql_focus.png',
        },
        HIVE: {
          DEFAULT: SVG_LOCATION + 'db_hive.png',
          SELECTED: SVG_LOCATION + 'db_hive_focus.png',
        },
        PRESTO: {
          DEFAULT: SVG_LOCATION + 'db_presto.png',
          SELECTED: SVG_LOCATION + 'db_presto_focus.png',
        },
        DRUID: {
          DEFAULT: SVG_LOCATION + 'db_druid.png',
          SELECTED: SVG_LOCATION + 'db_druid_focus.png',
        },
        POSTGRESQL: {
          DEFAULT: SVG_LOCATION + 'db_post.png',
          SELECTED: SVG_LOCATION + 'db_post_focus.png',
        },
        ORACLE: {
          DEFAULT: SVG_LOCATION + 'db_oracle.png',
          SELECTED: SVG_LOCATION + 'db_oracle_focus.png',
        },
        TIBERO: {
          DEFAULT: SVG_LOCATION + 'db_tibero.png',
          SELECTED: SVG_LOCATION + 'db_tibero_focus.png',
        },
        STAGING_DB: {
          DEFAULT: SVG_LOCATION + 'db_hive.png',
          SELECTED: SVG_LOCATION + 'db_hive_focus.png'
        },
        WRANGLED: {
          DEFAULT: SVG_LOCATION + 'dataset_wrangled_.png',
          SELECTED: SVG_LOCATION + 'dataset_wrangled_focus.png',
        }

    };

    const labelOption = {
      show: true,
      position: 'bottom',
      textStyle: { color: '#000000', fontWeight: 'bold' },
      formatter(params) {
        return PreparationCommonUtil.parseChartName(params.data.dsName);
      }
    };
    this.label = {
      normal: labelOption,
      emphasis: labelOption
    };

    this.chartOptions = {
      backgroundColor: '#ffffff',
      tooltip: { show: true },
      xAxis: {
        type: 'value',
        max: null,
        interval: 1,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: null,
        interval: 1,
        inverse: true,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'graph',
          legendHoverLink: false,
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          symbolSize: 55,
          hoverAnimation: true,
          roam: false,
          edgeSymbol: ['none', 'arrow'],
          draggable: true,
          itemStyle: { normal: { color: '#ccc', borderColor: '#1af' } },
          nodes: null,
          links: null,
          lineStyle: { normal: { opacity: 1, width: 0.5 } }
        }
      ], animation: false
    };
  }


}

class SwapParam {
  oldDsId : string;
  newDsId : string;
  dfId : string;
  wrangledDsId? : string;
  dsList? : string[];
}

class Upstream {
  dfId: string;
  dsId: string;
  upstreamDsId: string;
  upstreamDsIds?: string[];
}
