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

import {isNull, isNullOrUndefined, isUndefined} from 'util';
import * as $ from 'jquery';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnChanges, OnDestroy, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { Dataflow } from '../../../../../domain/data-preparation/dataflow';
import { Dataset, Field, Rule } from '../../../../../domain/data-preparation/dataset';
import { StringUtil } from '../../../../../common/util/string.util';
import { Alert } from '../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../util/preparation-alert.util';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../../common/service/popup.service';
import { DataflowService } from '../../../service/dataflow.service';
import { GridOption } from '../../../../../common/component/grid/grid.option';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { SubscribeArg } from '../../../../../common/domain/subscribe-arg';
import { HeaderMenu } from '../../../../../common/component/grid/grid.header.menu';
import * as _ from 'lodash';
import { MulticolumnRenameComponent } from './multicolumn-rename.component';
import { RuleContextMenuComponent } from './rule-context-menu.component';
import { ExtendInputFormulaComponent } from './extend-input-formula.component';
import { CreateSnapshotPopup } from '../../../../component/create-snapshot-popup.component';
import { ScrollLoadingGridComponent } from './edit-rule-grid/scroll-loading-grid.component';
declare let moment: any;
declare let echarts: any;


@Component({
  selector: 'app-edit-dataflow-rule',
  templateUrl: './edit-dataflow-rule.component.html',
})
export class EditDataflowRuleComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  @ViewChild(MulticolumnRenameComponent)
  private multicolumnRenameComponent : MulticolumnRenameComponent;

  @ViewChild(RuleContextMenuComponent)
  private contextMenuComp : RuleContextMenuComponent;

  @ViewChild(ExtendInputFormulaComponent)
  private extendInputFormulaComponent : ExtendInputFormulaComponent;

  @ViewChild(CreateSnapshotPopup)
  private createSnapshotPopup : CreateSnapshotPopup;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public dataflow: Dataflow;

  @Input()
  public selectedDataSet: Dataset;

  @Output()
  public closeEditRule = new  EventEmitter();

  @Output()
  public changeDataset = new  EventEmitter<Dataset>();

  @Input()
  public step: string;

  // 검색어
  public searchText: string = '';        // 그리드 검색어
  public commandSearchText: string = ''; // command 검색어
  public columnSearchText: string = '';
  public typeSearchText: string = '';
  public unnestSearchText: string = '';
  public moveSearchText: string = '';

  // viewMode : grid / table
  public viewMode: string = 'grid';

  // 그리스 컬럼, 로우, 타입 갯수
  public pivoteGridColumn: number = 0;        // 그리드 column 구성
  public pivotGridTotalRow: number = 0;       // 전체 조회 행수
  public pivotGridTypeNumber: number = 0;     // 전체 컬럼 type 갯수
  public pivotGridTypeList: any[] = [];       // 전체 컬럼 type list
  public pivotGridShowToggle: boolean = false;

  // 조인 편집시 필요한 데이터
  public rightDataset :Dataset;

  // Layer show/hide
  public isColumnListShow: boolean = false;
  public isBeforeOrAfterColumnListShow: boolean = false;
  public isNestListShow: boolean = false;
  public isRuleListOptionShow: boolean = false;
  public isTypeListShow: boolean = false;
  public isBeforeOrAfterShow: boolean = false;
  public isMultiColumnListShow: boolean = false;
  public isMultiColumnGroupListShow: boolean = false;
  public isRuleJoinModalShow: boolean = false;
  public isRuleUnionModalShow: boolean = false;
  public isOtherDatasetListShow: boolean = false;
  public isCommandListShow: boolean = false;

  // Rules
  public ruleVO: Rule = new Rule;
  public ruleList: any[] = [];
  public isJumped: boolean = false;
  public currentIndex : number = 0;
  public redoable: boolean = false;
  public undoable: boolean = false;

  // Flag for undo and redo, to stop users from multiple requests
  public isRedoRunning : boolean = false;
  public isUndoRunning : boolean = false;

  // Add rule / editor or builder
  public editorUseFlag: boolean = false;
  public editorUseLabel: string = 'switch to editor';
  public editLabelBtn: string = 'Add';  // 편집 모드 버튼 라벨

  // input cmd line
  public inputRuleCmd: string = ''; // Rule을 직접 입력시

  // APPEND (룰 등록) or UPDATE (룰 수정)
  public modeType: string = 'APPEND';

  // pivot - Formula 여러개 입력받는다
  public pivotFormulaList : any[] = [];
  public pivotFormulaValueList : any[] =[];

  // input focus 여부
  public isFocus = false;

  // 툴팁 show/hide
  public isTooltipShow = false;

  // Flag for mouse movement and keyboard navigation
  public flag: boolean = false;

  // 룰 수정시 다른 룰로 바꾸면 append 되는것을 막기위한 변수 - 몇번째 룰을 편집하는지 갖고있는다
  public ruleNo:any;

  // Join / Union 편집용 룰문자열
  public editJoinOrUnionRuleStr:string;

  public commandList: any[];
  public typeList: any[] = [];
  public nestList: any[] = [];
  public moveList: any[];
  public sortList: any[];
  public beforeOrAfterDataSet: any[] = [];    // List for Rule-move
  public editColumnList = [];                 // 수정 할 컬럼 리스트
  public selectedColumns : string[] = [];     // 그리드에서 선택된 컬럼 리스트
  public selectedRows : any = [];             // 그리드에서 선택된 로우 리스트
  public selectedBarChartRows : any = [];             // 그리드에서 선택된 로우 리스트

  // tell if union is updating or just adding
  public isUpdate: boolean = false;

  // select box 에서 선택됐는지 여부
  public selectboxFlag : boolean = false;

  // Histogram
  public charts : any = [];
  private _barCharts: any = [];
  public barChartTooltipPosition : string;
  public barChartTooltipShow : boolean = false;
  public barChartTooltipValue : string;
  public barChartTooltipIndex : number;
  public barChartTooltipLabel : string;
  public histogramDefaultColor : string = '#c1cef1';
  public histogramHoverColor : string = '#9aa5c1';
  public histogramClickColor : string = '#666eb2';
  public defaultChartOption : any;
  public clickedSeries = {};
  public barClickedSeries = {};
  public hoverHistogramData : string ;  // Hover 했을 때 보여지는 데이타
  private readonly _BARCHART_MISSING_COLOR: string = '#4b515b';
  private readonly _BARCHART_MISSING_CLICK_COLOR: string = '#25292f';
  private readonly _BARCHART_MISSING_HOVER_COLOR: string = '#3c4149';
  private readonly _BARCHART_MISMATCH_COLOR: string = '#dc494f';
  private readonly _BARCHART_MISMATCH_CLICK_COLOR: string = '#9b252a';
  private readonly _BARCHART_MISMATCH_HOVER_COLOR: string = '#b03a3f';

  // 헤더 컨텍스트 메뉴 show/hide
  public currentContextMenuInfo: any;

  // 컬럼 width 관련
  public columnWidths : any = [];

  // Auto complete 관련
  public autoCompleteSuggestions : any = [];
  public autoCompleteSuggestions_selectedIdx : number = -1;
  public isAutoCompleteSuggestionListOpen : boolean = false;
  public autoCompleteSuggestion_inputId : string = '';

  // 공백 치환 관련
  public spaceSymbol = '&middot;';

  // Timestamp 관련
  public isTypeTimestamp : boolean = false;
  public isTimestampOpen : boolean = false;
  public timestampTime : any = [];
  public timestampVal : string = '';
  public isTimestampEdit :boolean = false;
  public timestampSuggestions : any;

  get filteredWrangledDatasets() {
    if (this.dataflow['_embedded'].datasets.length === 0) return [];

    let list = this.dataflow['_embedded'].datasets;

    list = list.filter((dataset) => {
      return dataset.dsType.toString() === 'WRANGLED';
    }).map((data) => {
      data.current = data.dsId === this.selectedDataSet.dsId;
      return data;
    });
    return list;
  }

  // command List (search)
  get filteredCommandList() {

    let commandList = this.commandList;
    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.commandSearchText);

    // 검색어가 있다면
    if (isSearchTextEmpty) {
      commandList = commandList.filter((item) => {
        return item.command.toLowerCase().indexOf(this.commandSearchText.toLowerCase()) > -1;
      });
    }
    return commandList;
  }

  // unnest List
  get filteredUnnestList() {
    let tempList = this.selectedDataSet.gridData.fields.filter((item)=> {
      return item.type === 'MAP' || item.type === 'ARRAY';
    });

    const isUnnestSearchTextEmpty = StringUtil.isNotEmpty(this.unnestSearchText);

    // 검색어가 있다면
    if (isUnnestSearchTextEmpty) {
      tempList = tempList.filter((item) => {
        return item.type.toLowerCase().indexOf(this.unnestSearchText.toLowerCase()) > -1;
      });
    }

    return tempList;
  }

  // flatten List
  get filteredFlattenList() {
    let tempList = this.selectedDataSet.gridData.fields.filter((item)=> {
      return item.type === 'ARRAY';
    });

    const isFlattenSearchTextEmpty = StringUtil.isNotEmpty(this.unnestSearchText);

    // 검색어가 있다면
    if (isFlattenSearchTextEmpty) {
      tempList = tempList.filter((item) => {
        return item.type.toLowerCase().indexOf(this.unnestSearchText.toLowerCase()) > -1;
      });
    }

    return tempList;
  }

  // column List (search)
  get filteredColumnList() {
    let columnList = this.selectedDataSet.gridData.fields;

    const isColumnSearchTextEmpty = StringUtil.isNotEmpty(this.columnSearchText);

    // 검색어가 있다면
    if (isColumnSearchTextEmpty) {
      columnList = columnList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.columnSearchText.toLowerCase()) > -1;
      });
    }
    return columnList;

  }

  // type List (search)
  get filteredTypeList() {
    let tempTypeList = this.typeList;

    const isTypeSearchTextEmpty = StringUtil.isNotEmpty(this.typeSearchText);


    // 검색어가 있다면
    if (isTypeSearchTextEmpty) {
      tempTypeList = tempTypeList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.typeSearchText.toLowerCase()) > -1;
      });
    }
    return tempTypeList;

  }

  get filteredMoveDatasetList() {
    let dsList = this.beforeOrAfterDataSet;
    const isMoveSearchTextEmpty = StringUtil.isNotEmpty(this.moveSearchText);


    // 검색어가 있다면
    if (isMoveSearchTextEmpty) {
      dsList = dsList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.moveSearchText.toLowerCase()) > -1;
      });
    }
    return dsList;
  }

  // timestamp List
  get filteredTimestampList() {
    return this.selectedDataSet.gridData.fields.filter((item)=> {
      return item.type === 'TIMESTAMP';
    })
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private dataflowService: DataflowService,
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

    this.initViewPage();

    const snapshotPopupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.step = data.name;
    });

    this.subscriptions.push(snapshotPopupSubscription);

  }

  public ngOnChanges() {

  }

  public ngAfterViewInit() {

    this.getSearchCountDataSets();

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
   * move to previous step
   * */
  public prev() {
    this.closeEditRule.emit();
  }

  /**
   * open create snapshot popup
   * */
  public createSnapshot() {
    // this.step = 'create-snapshot';
    this.createSnapshotPopup.init({id : this.selectedDataSet.dsId , name : this.selectedDataSet.dsName, fields : this.selectedDataSet.gridData.fields});
  }

  /* 테이블뷰는 이차에
  // toggle view mode
  // public toggleViewMode(viewMode) {
  //   this.viewMode = viewMode;
  //   if (this.viewMode === 'grid') {
  //     this.updateGrid(this.selectedDataSet.gridData);
  //   }
  // }
  */

  /**
   * Join 설정 완료 이벤트
   * @param $event Join 설정 정보
   */
  public ruleJoinComplete($event) {
    if ($event.ruleInfo) {
      this.applyRule($event.ruleInfo);
    } else {
      this.initRule();
    }
    this.isRuleJoinModalShow = false;
  } // function - ruleJoinComplete

  /**
   * union 설정 완료 이벤트
   * @param $event Union 설정 정보
   */
  public ruleUnionComplete($event) {
    if ($event.ruleInfo) {
      this.applyRule($event.ruleInfo);

    } else {
      // init ruleVO
      this.initRule();
    }
    this.isRuleUnionModalShow = false;
  } // function - ruleUnionComplete

  // type list toggle function
  public isGridTypeViewList(param?) {
    if (param === false) {
      this.pivotGridShowToggle = param;
      return;
    }

    this.pivotGridShowToggle = this.pivotGridShowToggle !== true;
  }

  // 좌측 상단 네비 - 다른 데이터셋 리스트 보여주는
  public showDatasets() {
    this.isOtherDatasetListShow = !this.isOtherDatasetListShow;
  }


  // switch editor
  public switchEditor() {
    if (this.editorUseFlag === true) {
      this.editorUseFlag = false;
      this.editorUseLabel = 'switch to editor';

    } else {
      this.editorUseFlag = true;
      this.editorUseLabel = 'switch to builder';
    }
    // const ruleTemp: any = { ruleVO: this.ruleVO };
    // this.setRuleVO(ruleTemp);
  }

  // command list show
  public showCommandList(event) {

    this.contextMenuComp.isShow = false;

    if( true == this.jumpLast() ) {
      this.showCommandList(event);
    }

    event.stopImmediatePropagation();

    // 포커스 이동
    setTimeout(() => $('#commandSearch').focus());

    this.commandSearchText = '';
    this.isCommandListShow = true;
    this.initSelectedCommand(this.filteredCommandList);

    // isCommandListShow 클릭시 다른 리스트는 모두 닫는다
    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }
    if (this.isTypeListShow) {
      this.isTypeListShow = !this.isTypeListShow;
    }
    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }
    if (this.isBeforeOrAfterShow) {
      this.isBeforeOrAfterShow = !this.isBeforeOrAfterShow;
    }
    if (this.isBeforeOrAfterColumnListShow) {
      this.isBeforeOrAfterColumnListShow = !this.isBeforeOrAfterColumnListShow;
    }
    if (this.isNestListShow) {
      this.isNestListShow = !this.isNestListShow;
    }
    if (this.isAutoCompleteSuggestionListOpen) {
      this.isAutoCompleteSuggestionListOpen = !this.isAutoCompleteSuggestionListOpen;
      if( false==this.isAutoCompleteSuggestionListOpen ) { this.autoCompleteSuggestion_inputId = ''; }
    }

    this.changeDetect.detectChanges();

  }

  /***
   * Header menu 에서 선택시
   * event
   * */
  public selectedFromHeaderMenu (event) {

    let rule = {};

    if (isUndefined(event.args.command) || event.args.command === '') {
      return;
    }

    if (event.args.command === 'sort' || event.args.command === 'drop' ) {

      let val = '';

      if (event.args.command === 'drop') {
        if (this.selectedDataSet.gridData.fields.length === 1) { // at least one column must exist
          Alert.warning('Cannot delete all columns');
          return;
        }
        val = ' col: ';
      } else {
        val = ' order: ';
      }

      rule = {
        command: event.args.command,
        col: event.args.column.id,
        op: "APPEND",
        ruleString: event.args.command + val + event.args.column.id
      };

      this.applyRule(rule);

    } else if (event.args.command === 'sort_desc') {

      let val = ' order: ';
      this.ruleVO.type = 'desc';
      rule = {
        command: 'sort',
        col: event.args.column.id,
        op: "APPEND",
        type : 'desc',
        ruleString: 'sort' + val + event.args.column.id + ' type:\'desc\''
      };

      this.applyRule(rule);

    } else {

      // 선택 된 컬럼 초기화
      // this.gridComponent.rowAllUnSelection();
      this.gridComponent.columnAllUnSelection();
      this.gridComponent.selectColumn(event.args.column.id, true);

      this.ruleVO['command'] = event.args.command;
      this.ruleVO.col = event.args.column.id;

      if (this.ruleVO['command'] === 'rename') {

        this.setDefaultValue(true);

        setTimeout(() => $('.newColumnInput').focus()); // 포커스
        // setTimeout(() => $('.newColumnInput').select()); // highlight

      } else if ( this.ruleVO['command'] === 'settype') {

        setTimeout(() => $('[tabindex=3]').focus()); // 포커스

      }

    }

  }

  /**
   * Set default input values for derive, merge, nest, rename
   * isRename {boolean}
   * */
  public setDefaultValue( isRename : boolean) {

    let num = 1;
    let val : boolean = true;

    do {
      let item = this.selectedDataSet.gridData.fields.filter((item) =>{
        if (item.name === 'new_column'+ num) {
          return item;
        }
      });

      if ( item.length === 0 ) {
        isRename ? this.ruleVO.to = 'new_column' + num : this.ruleVO.as = 'new_column' + num;
        val = false;
        break;
      } else {
        num = num + 1;
      }

    } while (val)

  } // end of setDefaultValue

  /**
   * When command is selected from commandList
   * @param event
   * @param command
   * */
  public selectCommand(event, command) {
    event.stopImmediatePropagation();
    const mode = this.modeType; // 룰 수정시 필요함
    const vo = this.ruleVO;     // 룰 수정시 필요함
    this.initRule();
    if (mode === 'UPDATE') { // 편집인데 다른 룰을 추가할때
      this.modeType = mode;
      this.editLabelBtn = 'Edit';
      this.ruleNo = vo['ruleNo'];
    }

    // ignore default 값은 false;
    this.ruleVO.ignoreCase = false;

    // 선택된 컬럼은 킵
    // this.ruleVO.cols = vo['cols'] ? vo['cols'] : [];
    this.ruleVO.cols = this.selectedColumns;

    const singleSelectRule = ['rename', 'split', 'extract' ];
    if (-1 !== singleSelectRule.indexOf(command.command)) {
      if (this.selectedColumns.length === 1) {
        this.ruleVO.col = this.selectedColumns[0];
      } else if (this.selectedColumns.length > 1) {
        let col = this.selectedColumns[0];
        this.gridComponent.columnAllUnSelection();
        this.gridComponent.selectColumn(col,true);
        this.ruleVO.col = col;
      }
    }

    this.ruleVO.command = command.command;
    this.ruleVO.alias = command.alias;
    this.ruleVO.desc = command.desc;

    // 검색어 초기화 및 레이어 닫기
    this.commandSearchText = '';
    setTimeout(() => {this.isCommandListShow = false;});

    switch(this.ruleVO.command) {
      case 'join':
        this.rightDataset = new Dataset();
        this.rightDataset.dsId = '';
        this.isRuleJoinModalShow = true;
        break;
      case 'union':
        this.editJoinOrUnionRuleStr = '';
        this.isRuleUnionModalShow = true;
        break;
      case 'derive':
      case 'merge':
        this.setDefaultValue(false);
        break;
      case 'nest':
        this.setDefaultValue(false);
        this.ruleVO.into = 'map';
        break;
      case 'unnest':
        this.selectedDataSet.gridData.fields.filter((item) => {
          if (item.name === this.ruleVO.col) {
            if (item.type !== 'ARRAY' && item.type !== 'MAP') {
              this.ruleVO.col = '';
            }
          }
        });
        break;
      case 'flatten':
        this.selectedDataSet.gridData.fields.filter((item) => {
          if (item.name === this.ruleVO.col) {
            if (item.type !== 'ARRAY') {
              this.ruleVO.col = '';
            }
          }
        });
        break;
      case 'header':
        this.ruleVO.rownum = 1;
        break;
      case 'settype':
        this.dataflowService.getTimestampFormatSuggestions(this.selectedDataSet.dsId,  {colNames : this.selectedDataSet.gridResponse.colNames })
          .then((result) => {
            this.timestampSuggestions = result;
          }).catch((error) => {
          console.info(error);
        });
        break;
      case 'setformat':

        let types = [];
        this.ruleVO.cols = [];
        const allEqual = arr => arr.every( v => v === arr[0] );

        if (this.selectedColumns.length > 0 ) {
          this.selectedColumns.forEach((item) => {
            if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[this._findIndexWithNameInGridResponse(item)].type) {
              types.push(this._findTimestampStyleWithIdxInColDescs(this._findIndexWithNameInGridResponse(item)));
              this.ruleVO.cols.push(item);
            }
          });
          if (types.length > 0 && allEqual(types)) {
            this.ruleVO.timestamp = types[0];
          } else {
            this.ruleVO.timestamp = '';
          }
        }
        break;
    }
    this.initSelectedCommand(this.filteredCommandList);
  }

  /**
   * Find index of column Name in grid response
   * @param {string} name
   * @return {number}
   * @private
   */
  private _findIndexWithNameInGridResponse(name : string) : number {
    return this.selectedDataSet.gridResponse.colNames.indexOf(name)
  } // function - _findIndexWithNameInGridResponse

  /**
   * Find timestamp style of timestamp type column
   * @param {number} idx
   * @return {string}
   * @private
   */
  private _findTimestampStyleWithIdxInColDescs(idx : number) : string {
    return this.selectedDataSet.gridResponse.colDescs[idx].timestampStyle.replace(/'/g, '\\\'');
  } // function - _findTimestampStyleWithIdxInColDescs

  /**
   * Find type of column with idx ( upper cased)
   * @param {number} idx
   * @return {string}
   * @private
   */
  private _findUpperCaseColumnTypeWithIdx(idx : number) : string {
    return this.selectedDataSet.gridResponse.colDescs[idx].type.toUpperCase()
  } // function - _findUpperCaseColumnTypeWithIdx


  // column layer show
  public showColumnList(event) {
    event.stopImmediatePropagation();
    this.isColumnListShow = true;
    this.columnSearchText =''; // 검색어 초기화
    setTimeout(() => $('.unnest-search').focus()); // 포커스
    setTimeout(() => $('.columnSearch').focus()); // 포커스

    // isColumnListShow 클릭시 다른 리스트는 모두 닫는다
    if (this.isTypeListShow) {
      this.isTypeListShow = !this.isTypeListShow;
    }

    if (this.isBeforeOrAfterShow) {
      this.isBeforeOrAfterShow = !this.isBeforeOrAfterShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }

    if (this.isBeforeOrAfterColumnListShow) {
      this.isBeforeOrAfterColumnListShow = !this.isBeforeOrAfterColumnListShow;
    }
    this.changeDetect.detectChanges();
  }

  // column layer show for [MOVE] before or after
  public showBeforeOrAfterColumnList(event) {
    event.stopImmediatePropagation();
    this.isBeforeOrAfterColumnListShow = true;
    setTimeout(() => $('.move-search').focus());


    // isBeforeOrAfterColumnListShow 클릭시 다른 리스트는 모두 닫는다
    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isBeforeOrAfterShow) {
      this.isBeforeOrAfterShow = !this.isBeforeOrAfterShow;
    }

    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }
    this.changeDetect.detectChanges();
  }

  // before or after layer show
  public showBeforeOrAfterList(event) {
    event.stopImmediatePropagation();
    this.isBeforeOrAfterShow = !this.isBeforeOrAfterShow;

    // isBeforeOrAfterShow 클릭시 다른 리스트는 모두 닫는다
    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isBeforeOrAfterColumnListShow) {
      this.isBeforeOrAfterColumnListShow = !this.isBeforeOrAfterColumnListShow;
    }
    this.changeDetect.detectChanges();
  }


  public showTimestampList(event) {
    event.stopImmediatePropagation();
    this.isTimestampOpen= true;
    if ('' !== this.ruleVO.timestamp) {
      let idx = this.timestampTime.findIndex((item) => {
        return item.type === this.ruleVO.timestamp
      });

      if (-1 !== idx) {
        this.timestampTime[idx].isHover = true;
        setTimeout(() => {$('.ddp-list-command').scrollTop(idx * 25);})
      }
    }

    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }

    if (this.isTypeListShow) {
      this.isTypeListShow = !this.isTypeListShow;
    }

    this.changeDetect.detectChanges();
  }
  // type layer show
  public showTypeList(event) {
    event.stopImmediatePropagation();
    this.isTypeListShow = true;

    setTimeout(() => $('.type-search').focus()); // 포커스

    // isTypeListShow 클릭시 다른 리스트는 모두 닫는다
    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }

    this.changeDetect.detectChanges();
  }

  /**
   * 컬럼 산택 (replace, rename, set, setType, countPattern, split, extract, flatten, move, unnest)
   * @param event 이벤트
   * @param col 컬럼 정보
   */
  public selectColumn(event, col) {
    event.stopImmediatePropagation();
    // 선택 된 컬럼 초기화
    // this.gridComponent.rowAllUnSelection();
    this.gridComponent.columnAllUnSelection();

    this.ruleVO['col'] = col.name;

    this.selectboxFlag = true; // 셀렉트 박스에서 선택 했는지 flag걸기
    this.gridComponent.selectColumn(col.name, true,null, false, col.type);
    // this.gridComponent.selectColumn(col.name, true,null, col.type);

    this.columnSearchText = ''; // 검색어 초기화
    this.unnestSearchText = '';

    setTimeout(() => {this.isColumnListShow = false});

    this.initSelectedCommand(this.filteredColumnList);

  } // function - selectColumn

  /**
   * 컬럼 택 (move)
   * @param event 이벤트
   * @param col 컬럼 정보
   */
  public selectedBeforeOrAfterColumn(event, col) {
    event.stopImmediatePropagation();
    this.ruleVO['colForMove'] = col.name;
    this.moveSearchText = '';
    setTimeout(() => { this.isBeforeOrAfterColumnListShow = false; });

    this.initSelectedCommand(this.filteredMoveDatasetList);

  } // function - selectedBeforeOrAfterColumn

  /**
   * Array or map 산택 (nest, unnest)
   * @param event 이벤트
   * @param type 타입정보
   */
  public selectType(event, type) {
    event.stopImmediatePropagation();
    this.ruleVO['into'] = type.name;

    setTimeout(() => {this.isNestListShow = false;});

    this.initSelectedCommand(this.nestList);
  } // function - selectArrayColumn


  // multi column layer show
  public showMultiColumnList(event) {
    event.stopImmediatePropagation();
    this.isMultiColumnListShow = true;

    if (this.isNestListShow) {
      this.isNestListShow = !this.isNestListShow;
    }

    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isMultiColumnGroupListShow) {
      this.isMultiColumnGroupListShow = !this.isMultiColumnGroupListShow;
    }

    if (this.isTypeListShow) {
      this.isTypeListShow = !this.isTypeListShow;
    }
    this.changeDetect.detectChanges();
  }

  // Pivot -  multi column group layer show
  public showMultiColumnGroupList(event) {
    event.stopImmediatePropagation();
    this.isMultiColumnGroupListShow = true;

    if (this.isNestListShow) {
      this.isNestListShow = !this.isNestListShow;
    }

    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }

    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }
    this.changeDetect.detectChanges();
  }

  // nest list layer show
  public showNestList(event) {
    event.stopImmediatePropagation();
    this.isNestListShow = !this.isNestListShow;
    if (this.isMultiColumnListShow) {
      this.isMultiColumnListShow = !this.isMultiColumnListShow;
    }
    if (this.isColumnListShow) {
      this.isColumnListShow = !this.isColumnListShow;
    }

    if (this.isCommandListShow) {
      this.isCommandListShow = !this.isCommandListShow;
    }
    this.changeDetect.detectChanges();
  }

  /**
   * 컬럼을 선택하면 무조건 실행된다. 그리드 헤거 클릭 or select box 에서 클릭도 !
   * @param col
   */
  public setColSeq(col) {
    if (col.selected) {

      if (isUndefined(this.ruleVO.cols)) {
        this.ruleVO.cols = [];
      }
      this.ruleVO.cols.push(col.name);
      col.seq = this.ruleVO.cols.length;
    } else {

      const fieldNames = this.selectedDataSet.gridData.fields.map((field) => {
        return field.name;
      });

      if (this.ruleVO.cols && this.ruleVO.cols.length > 0) {
        this.ruleVO.cols.forEach((column) => {
          const idx = fieldNames.indexOf(column);
          if (idx !== -1) {
            if (this.selectedDataSet.gridData.fields[idx].seq > col.seq) {
              this.selectedDataSet.gridData.fields[idx].seq -= 1;
            }
          }
        });
        const index = this.ruleVO.cols.indexOf(col.name);
        this.ruleVO.cols.splice(index, 1);
      }
    }
  }

  /**
   * Select box 클릭 시 (멀티 체크박스)
   * @param col
   */
  public checkItem(col) {


    // if (this.ruleVO.command === 'setformat') {
    //   let cols = 0;
    //   this.selectedColumns.forEach((item) => {
    //     if (this.selectedDataSet.gridResponse.colDescs[this._findIndexWithNameInGridResponse(item)].type !== 'TIMESTAMP') {
    //       cols += 1
    //     }
    //   });
    //   if (0 < cols || this.selectedColumns.length === cols) {
    //     this.gridComponent.columnAllUnSelection();
    //   }
    // }

    this.gridComponent.selectColumn(col.name, !col.selected);

  }


  // rule - pivot
  public setGroupColSeq(col) {
    if (col.ticked) {
      this.ruleVO.groups.push(col.name);
      col.groupSeq = this.ruleVO.groups.length; // pivot에 seq를 쓰는 곳이 2개라서 groupSeq로 따로 관리
    } else {

      const fieldNames = this.selectedDataSet.gridData.fields.map((field) => {
        return field.name;
      });
      this.ruleVO.groups.forEach((column) => {
        const idx = fieldNames.indexOf(column);
        if (this.selectedDataSet.gridData.fields[idx].groupSeq > col.groupSeq) {
          this.selectedDataSet.gridData.fields[idx].groupSeq -= 1;
        }
      });

      const index = this.ruleVO.groups.indexOf(col.name);
      this.ruleVO.groups.splice(index, 1);
    }

  }

  /**
   * set column type
   * @param event 이벤트
   * @param type integer, float ect
   */
  public setColumnType(event, type) {
    event.stopImmediatePropagation();
    this.ruleVO.type = type.name;
    this.typeSearchText = '';

    // 컬럼 타입 리스트
    let colTypes = this.selectedDataSet.gridResponse.colDescs.filter((item) => { return item.type });

    // 스트링으로 변경하려면
    if ('String' === this.ruleVO.type) {

      if (this.selectedColumns.length === 1) {
        let idx = this.selectedDataSet.gridResponse.colNames.indexOf(this.selectedColumns[0]);
        if (colTypes[idx].type.toUpperCase() === 'TIMESTAMP') {
          this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(idx);
          this.isTypeTimestamp = true;
        } else {
          this.isTypeTimestamp = false;
          this.ruleVO.timestamp = '';
        }
      } else if (this.selectedColumns.length > 1) {
        let timestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
          }
        });
        const allEqual = arr => arr.every( v => v === arr[0] );
        if (this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
        } else if (timestampStyles.length > 0) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = '';
        } else {
          this.isTypeTimestamp = false;
        }
      } else {
        this.isTypeTimestamp = false;
        this.ruleVO.timestamp = '';
      }
      // 타임스탬프로 변경한다면
    } else if ('Timestamp' === this.ruleVO.type) {
      this.isTypeTimestamp = true;
      if (this.selectedColumns.length === 1) {
        let idx = this._findIndexWithNameInGridResponse(this.selectedColumns[0]);
        if (colTypes[idx].type.toUpperCase() === 'TIMESTAMP') {     // timestamp -> timestamp
          this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(idx);
        } else if (colTypes[idx].type.toUpperCase() === 'STRING') { // string -> timestamp

          if (this.timestampSuggestions[this.selectedColumns[0]] && this.timestampSuggestions[this.selectedColumns[0]].length > 0) {
            this.ruleVO.timestamp = this.timestampSuggestions[this.selectedColumns[0]][0];
          }
          if (!isNullOrUndefined(this.ruleVO.timestamp)) {
            this.ruleVO.timestamp = this.ruleVO.timestamp.replace(/'/g, '\\\'');
          } else {
            this.ruleVO.timestamp = '';
          }
        }
      } else if (this.selectedColumns.length > 1) {

        let timestampStyles = [];
        let stringTimestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
          } else if ('STRING' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
            stringTimestampStyles.push(this.timestampSuggestions[item][0] ? this.timestampSuggestions[item][0] : '');
          }
        });
        const allEqual = arr => arr.every( v => v === arr[0] );
        if (this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
          this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
        } else if (this.selectedColumns.length === stringTimestampStyles.length && allEqual(stringTimestampStyles)) {
          this.ruleVO.timestamp = stringTimestampStyles[0].replace(/'/g, '\\\'');
        } else {
          this.ruleVO.timestamp = '';
        }

      } else {
        this.ruleVO.timestamp = '';
      }
    } else {
      this.isTypeTimestamp = false;
      this.ruleVO.timestamp = '';
    }

    setTimeout(() => {this.isTypeListShow = false;});

    this.initSelectedCommand(this.filteredTypeList);
  } // function - setColumnType

  public setTimestamp(event, type) {
    event.stopImmediatePropagation();
    if ('Custom format' === type.name) {
      this.timestampVal = isUndefined(this.ruleVO.timestamp) ? '' : this.ruleVO.timestamp;
    } else if ('Custom format' !== type.name) {
      this.timestampVal = '';
    }
    this.ruleVO.timestamp = type.name;

    setTimeout(() => {this.isTimestampOpen = false;});
    this.initSelectedCommand(this.timestampTime);
  } // function - setColumnType

  /**
   * select BEFORE or AFTER (move)
   * @param event 이벤트
   * @param type BEFORE or AFTER
   */
  public setBeforeOrAfter(event, type) {

    event.stopImmediatePropagation();
    this.ruleVO.beforeOrAfter = type.name;
    setTimeout(() => {this.isBeforeOrAfterShow = false;});

    this.initSelectedCommand(this.moveList);

  } // function - setBeforeOrAfter

  /**
   * Rule cancel or 초기 세팅
   * @param data
   */
  public initRule(data?) {

    // default 는 append
    this.modeType = 'APPEND';

    // default 는 Add
    this.editLabelBtn = 'Add';

    // 룰 리스트에서 선택된 룰이 없게 this.ruleNo 초기화
    this.ruleNo = null;

    this.ruleVO = new Rule();
    this.beforeOrAfterDataSet = this.selectedDataSet.gridData.fields;
    this.inputRuleCmd = '';
    this.timestampInit();

    // redo, undo를 초기화 한다.
    if (data) this.initRedoUndo(data);

    // init pivot & aggregate formulas
    this.initFormulaList();

  }

  public timestampInit() {
    this.isTypeTimestamp = false;
    this.isTimestampOpen = false;
  }

  /**
   * Initialise formula list
   */
  public initFormulaList() {
    this.pivotFormulaList = [];
    this.pivotFormulaList.push('');
    this.pivotFormulaValueList = [];
  }

  /**
   * Initialise redo and undo buttons
   * @param data
   */
  public initRedoUndo(data) {

    switch (data.redoable) {
      case 'true':
        this.redoable = true;
        break;
      case 'false' :
        this.redoable = false;
        break;
    }

    switch (data.undoable) {
      case 'true':
        this.undoable = true;
        break;
      case 'false' :
        this.undoable = false;
        break;
    }
  }

  /**
   * Apply rule. (When Add button is clicked)
   */
  public addRule() {

    let rule = {};
    if (this.editorUseFlag === false) {
      if (isUndefined(this.ruleVO['command']) || '' === this.ruleVO['command']) {
        Alert.warning(this.translateService.instant('msg.dp.alert.no.data'));
        return;
      }

      switch (this.ruleVO['command']) {

        case 'header' :
          rule = this.setHeaderRule();
          break;
        case 'keep' :
          rule = this.setKeepRule();
          break;
        case 'replace' :
          rule = this.setReplaceRule();
          break;
        case 'rename' :
          rule = this.setRenameRule();
          break;
        case 'set' :
          rule = this.setSetRule();
          break;
        case 'settype' :
          rule = this.setSettypeRule();
          break;
        case 'countpattern' :
          rule = this.setCountpatternRule();
          break;
        case 'split' :
        case 'extract' :
          rule = this.setExtractRule();
          break;
        case 'derive' :
          rule = this.setDeriveRule();
          break;
        case 'delete' :
          rule = this.setDeleteRule();
          break;
        case 'drop' :
          rule = this.setDropRule();
          break;
        case 'flatten' :
          rule = this.setFlattenRule();
          break;
        case 'merge' :
          rule = this.setMergeRule();
          break;
        case 'aggregate' :
          rule = this.setAggregateRule();
          break;
        case 'splitrows' :
          rule = this.setSplitRowsRule();
          break;
        case 'sort' :
          rule = this.setSortRule();
          break;
        case 'move' :
          rule = this.setMoveRule();
          break;
        case 'pivot' :
          rule = this.setPivotRule();
          break;
        case 'unpivot' :
          rule = this.setUnpivotRule();
          break;
        case 'nest' :
          rule = this.setNestRule();
          break;
        case 'unnest' :
          rule = this.setUnnestRule();
          break;
        case 'setformat' :
          rule = this.setSetformatRule();
          break;
        default :
          break;
      }

      // 룰 적용하기
      // set operation
      if (!isUndefined(rule)) {
        if (isUndefined(this.ruleVO['ruleNo'])) {
          if (!isNull(this.ruleNo)) { //룰 편집 수정 중 다른 룰로 바꾸면 append -> update로 수정
            rule['op'] = 'UPDATE';
          } else {
            rule['op'] = 'APPEND';
          }

        } else {// 수정 모드
          rule['op'] = 'UPDATE';
          rule['ruleCurIdx'] = this.ruleVO['ruleNo'];
        }
      }
    } else {  // editor 사용시
      if (this.inputRuleCmd === '') {
        Alert.warning(this.translateService.instant('msg.dp.alert.editor.warn'));
        return;
      }
      let cmd = this.inputRuleCmd;
      cmd = cmd.substring(0, cmd.indexOf(' '));
      const ruleIdx = this.ruleList.length;


      if (this.modeType === 'APPEND') {
        rule = {
          command: cmd,
          op: this.modeType,
          rownum: ruleIdx + 1,
          ruleString: this.inputRuleCmd
        };
      } else if (this.modeType === 'UPDATE') {
        rule = {
          command: cmd,
          op: this.modeType,
          rownum: this.ruleVO.rownum,
          ruleString: this.inputRuleCmd
        };
      }
    }
    if (!isUndefined(rule)) {
      this.applyRule(rule);
    }
  }

  /**
   * 룰이 파싱되는지 체크함
   * @param rule 적용할 rule 정보
   */
  public parseRule(rule) {
    let result : boolean = false;
    if(!isUndefined(rule) && !isUndefined(rule.ruleString)) {
      this.loadingShow();
      this.dataflowService.parseRule(rule.ruleString)
        .then((data) => {
          this.loadingHide();
          console.log(data);
          if( !isUndefined(data) ) {
            let rule = data.rule;
            if( rule.name ) {
              let command = this.commandList.filter((command) => {
                if(command.command==rule.name) { return true; }
                else { return false; }
              });
              if( 1==command.length ) {
                result = true;
                // OK
              } else {
                Alert.error('rule name mismatch');
                result = false;
              }
            } else {
              Alert.error('rule name is wrong');
              result = false;
            }
          } else {
            // not reach
            Alert.error(this.translateService.instant('msg.dp.alert.unknown.error'));
            result=false;
          }
          result = true;
        })
        .catch((error) => {
          this.loadingHide();
          let prep_error = this.dataprepExceptionHandler(error);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } else {
      Alert.error(this.translateService.instant('msg.dp.alert.not.rule'));
    }

    return result;
  }

  /**
   * 편집시 기존의 수식이 각 위치에 들어간다
   * @param rule 수정할 rule 정보 (this.selectedDataSet.ruleStringInfos[마지막])
   */
  public setEditInfo(rule) {

    // 선택된 컬럼이 있다면 클리어 한다.
    if (!isNull(this.gridComponent.grid) && (this.selectedColumns.length > 0)) {
      this.gridComponent.columnAllUnSelection();
    }

    try {
      this.selectboxFlag = true;
      this.initRule();
      this.modeType = 'UPDATE';
      this.editLabelBtn = 'Edit';
      this.ruleVO = rule['ruleVO'];
      switch (this.ruleVO.command) {
        case 'rename' :
          this.setRenameEditInfo(rule);
          break;
        case 'keep' :
          this.setKeepEditInfo(rule);
          break;
        case 'replace' :
          this.setReplaceEditInfo(rule);
          break;
        case 'merge' :
          this.setMergeEditInfo(rule);
          break;
        case 'set' :
          this.setSetEditInfo(rule);
          break;
        case 'settype' :
          this.setSettypEditInfo(rule);
          break;
        case 'setformat' :
          this.setSetFormatEditInfo(rule);
          break;
        case 'countpattern' :
          this.setCountpatternEditInfo(rule);
          break;
        case 'derive' :
          this.setDeriveEditInfo(rule);
          break;
        case 'aggregate' :
          this.setAggregateEditInfo(rule);
          break;
        case 'nest' :
          this.setNestEditInfo(rule);
          break;
        case 'unnest' :
          this.setUnnestEditInfo();
          break;
        case 'delete' :
          this.setDeleteEditInfo(rule);
          break;
        case 'drop' :
          this.setDropEditInfo(rule);
          break;
        case 'split' :
        case 'extract' :
          this.setExtractEditInfo(rule);
          break;
        case 'sort' :
          this.setSortEditInfo(rule);
          break;
        case 'move' :
          this.setMoveEditInfo(rule);
          break;
        case 'pivot' :
          this.setPivotEditInfo(rule);
          break;
        case 'flatten' :
          this.editColumnList = [this.ruleVO.col];
          break;
        case 'unpivot' :
          this.setUnpivotEditInfo(rule);
          break;
        case 'union' :
          if (this.selectedDataSet.gridData.data.length > 1) {
            this.editJoinOrUnionRuleStr = rule['jsonRuleString'];
            this.isUpdate = true;
            this.isRuleUnionModalShow = true;
          } else {
            Alert.warning('No rows to union');
          }

          break;
        case 'join' :

          if (this.selectedDataSet.gridData.data.length > 1) {
            this.setJoinEditInfo(rule);
          } else {
            Alert.warning('No rows to join');
          }
          break;
        default:
          break;
      }

      this.inputRuleCmd = this.makeRuleResult(this.ruleVO);
    } catch (e) {
      Alert.error(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
    }
  }


  /**
   * 룰 수정 클릭시
   * @param dataRule 수정할 룰 정보
   */
  public setRuleVO(dataRule) {

    if(this.gridComponent.grid) { // 전 단계 그리드를 그리기 전에 현재 그리드에 선택된 컬럼을 해제 해야한다.
      this.gridComponent.columnAllUnSelection();
    }

    let event = dataRule.event;
    let rule = dataRule.rule;

    // 인풋박스 포커스 여부 IE 에서 수정버튼을 누르면 툴팁 박스가 열려서...
    this.isFocus = false;

    if( true == this.jumpLast() ) {
      this.setRuleVO({rule : rule, event: event});
      return;
    }

    event.stopPropagation();
    this.loadingShow();
    const op = {op:'FETCH'};
    // fetch data 1 step before
    this.dataflowService.fetchPreviousData(this.selectedDataSet.dsId,op).then((data) => {
      if (data.errorMsg) {
        Alert.warning(this.translateService.instant('msg.dp.alert.rule.edit.fail'));
      } else {

        this.selectedDataSet.ruleCurIdx = data.ruleCurIdx;
        this.selectedDataSet.gridResponse = data.gridResponse;

        // this.selectedDataSet.ruleStringInfos = data['ruleStringInfos'];
        // this.setRuleList(this.selectedDataSet.ruleStringInfos);

        this.setGridData(this.selectedDataSet.gridResponse);

        this.setColumnWidthInfo(this.selectedDataSet.gridData);

        this.getHistogramInfoByWidths(this.columnWidths, false, true);

      }
      this.loadingHide();
    })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /**
   * Delete rule
   * @param dataEvent
   */
  public deleteRule(dataEvent) {

    let event = dataEvent.event;
    let data = dataEvent.rule;

    if( true == this.jumpLast() ) {
      this.deleteRule({rule:data, event:event});
    }

    event.stopPropagation();

    const rule = {
      op: 'DELETE',
      ruleIdx: data.ruleNo
    };

    this.applyRule(rule,'msg.dp.alert.rule.del.fail');
  }

  /**
   * get Histogram info with col widths
   * @param colWidths
   * @param isInitialLoad 처음 그리드 로드 여부
   * @param isEditMode 편집 모드 여부
   */
  public getHistogramInfoByWidths(colWidths, isInitialLoad : boolean = false, isEditMode : boolean = false) {

    let widths = Object.keys(colWidths).map((i) => {
      return colWidths[i]
    });

    let ruleCurIdx = this.selectedDataSet.ruleCurIdx ;
    let colnos = Array.from(Array(this.selectedDataSet.gridData.fields.length).keys());
    let params = {
      colnos : colnos,
      colWidths : widths,
      ruleIdx : isEditMode ? ruleCurIdx-1 : ruleCurIdx
    };

    this.dataflowService.getHistogramInfo(this.selectedDataSet.dsId, params).then((result) => {
      if (result.colHists) {
        this.selectedDataSet.gridResponse.colHists = result.colHists;

        this.selectedDataSet.gridData.fields.map(field => field.isHover = false);

        this.beforeOrAfterDataSet = this.selectedDataSet.gridData.fields;

        this.updateGrid(this.selectedDataSet.gridData);

        this.headerInformation();

        let ruleStrings = this.selectedDataSet.ruleStringInfos;
        if (ruleStrings.length > 0 && isInitialLoad === false) {

          if (isEditMode) {
            this.setEditInfo(ruleStrings[ruleCurIdx]);
          }
          if (isEditMode ? this.editColumnList.length > 0  :  this.selectedDataSet.gridResponse['interestedColNames'].length > 0) {
            this.setAffectedColumns(isEditMode ? this.editColumnList : this.selectedDataSet.gridResponse['interestedColNames'],ruleStrings[ruleCurIdx-1]);
          }
        }
      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    })
  }

  /**
   * Set Column width
   * @param data this.selectedDataSet.gridData
   */
  public setColumnWidthInfo(data){
    const maxDataLen: any = {};
    const maxLength = 500;
    let rows: any[] = data.data;
    const fields: Field[] = data.fields;

    // Row 생성 및 컬럼별 최대 길이 측정
    if (rows.length > 0 ) {
      rows = rows.map((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          // const colWidth: number = pixelWidth(row[field.name], { size: 12 });
          let colWidth:number = 0;
          if (typeof row[field.name] === 'string') {
            colWidth = Math.floor((row[field.name]).length * 12);
          }
          if (!maxDataLen[field.name] || ( maxDataLen[field.name] < colWidth )) {
            if (colWidth > 500) {
              maxDataLen[field.name] = maxLength;
            } else {
              maxDataLen[field.name] = colWidth;
            }
          }
        });
        // row id 설정
        if( !data.data[0].hasOwnProperty('id') ) {
          row.id = idx;
        }
        return row;
      });
    }

    this.columnWidths = [];
    fields.forEach((item) => {

      let headerWidth:number = Math.floor(item.name.length * 12) + 62;

      if (headerWidth > 500) {
        headerWidth = 500;
      }
      if (!this.columnWidths.hasOwnProperty(item.name)) {
        this.columnWidths[item.name]= maxDataLen[item.name] > headerWidth ? maxDataLen[item.name] : headerWidth
      }
    });

  }

  /**
   * Retrieve list again
   */
  public getSearchCountDataSets() {
    this.loadingShow();
    this.dataflowService.getSearchCountDataSets(this.selectedDataSet.dsId)
      .then((data) => {
        if (data.errorMsg) {
          Alert.warning(this.translateService.instant('msg.dp.alert.ds.retrieve.fail'));
          this.loadingHide();
        } else {

          // Todo :
          let dsId = this.selectedDataSet.dsId;
          let dsName = this.selectedDataSet.dsName;
          let _embedded = this.selectedDataSet['_embedded'];

          this.selectedDataSet = data;

          // 서버에서 돌아오는 데이터에 dsId, dsName, embedded 없음
          this.selectedDataSet.dsId = dsId;
          this.selectedDataSet.dsName = dsName;
          this.selectedDataSet['_embedded'] = _embedded;
          this.currentIndex = data['ruleStringInfos'].length-1;

          this.setGridData(this.selectedDataSet.gridResponse);

          this.setColumnWidthInfo(this.selectedDataSet.gridData);

          this.getHistogramInfoByWidths(this.columnWidths, true);

          this.setRuleList(data['ruleStringInfos']);

          this.initRule(data);

        }
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /**
   * Get histogram info of changed column width
   * @param {any} opts : { dsId:string, columnIndex:Number, columnWidth:Number, chartIndex : number, columnName : string }
   */
  public getDistinctHistogram(opts : any) {

    // 히스토그램 정보 바뀌기 전
    let previousHistogramInfo = this.selectedDataSet.gridResponse.colHists[opts.columnIndex];

    let params = {
      ruleIdx : this.selectedDataSet.ruleCurIdx,
      colnos : [opts.columnIndex],
      colWidths :[opts.columnWidth]
    };

    // ToDo: getHistogramInfo 공통으로..
    this.dataflowService.getHistogramInfo(opts.dsId, params).then((data) => {

      // 바뀐 히스토그램을 원래 있던 this.selectedDataSet.histogram 정보에 overwrite 한다.
      this.selectedDataSet.gridResponse.colHists[opts.columnIndex] = data['colHists'][0];
      let currentHistogramInfo = this.selectedDataSet.gridResponse.colHists[opts.columnIndex];

      // find remaining bars
      let remains = this.clickedSeries[opts.columnIndex].filter((remain) => {
        if(currentHistogramInfo.labels.indexOf(remain) !== -1) {
          return remain
        }
      });

      // Unselect all selected rows
      this.clickedSeries[opts.columnIndex] = [];
      this.selectedRows = [];
      this.rowClickHandler([]);
      let options = this.getDefaultChartOption(previousHistogramInfo,opts.columnIndex);
      let barOptions = this.getDefaultBarChartOption(previousHistogramInfo,opts.columnIndex);
      // this.applyChart(this.charts[opts.columnIndex],options);
      this.charts[opts.columnIndex].dispose();
      this._barCharts[opts.columnIndex].dispose();

      // remains
      // 다시 그리기 ...
      options = this.getDefaultChartOption(currentHistogramInfo,opts.columnIndex);
      barOptions = this.getDefaultBarChartOption(currentHistogramInfo,opts.columnIndex);

      // // 변경된 width를 바꾸고
      $('#histogram_' + opts.columnName)[0].style.width = opts.columnWidth + 'px';
      $('#barChart_' + opts.columnName)[0].style.width = opts.columnWidth + 'px';
      $( `#` + opts.columnName)[0].style.width = opts.columnWidth + 'px';

      // 새로운 width 를 가진 차트로 다시 그린다.
      this.charts[opts.chartIndex] = echarts.init(document.getElementById('histogram_' + opts.columnName));
      this._barCharts[opts.chartIndex] = echarts.init(document.getElementById('barChart_' + opts.columnName));

      if (remains.length > 0) {
        this.clickedSeries[opts.columnIndex] = remains;
        let remainIndex = remains.map((item) => {
          return currentHistogramInfo.labels.indexOf(item);
        });
        remainIndex.forEach((val) =>{
          this.selectedRows = _.union(this.selectedRows, currentHistogramInfo.rownos[val])
        });
        this.rowClickHandler(this.selectedRows);
      }

      if (this.charts[opts.chartIndex]) {
        // Apply chart
        this.applyChart(this.charts[opts.chartIndex],options);
        this.histogramMouseEvent(this.charts[opts.chartIndex], this.escapedName(opts.columnName),currentHistogramInfo, opts.chartIndex);
      }

      if (this._barCharts[opts.chartIndex]) {
        // Apply chart
        this.applyChart(this._barCharts[opts.chartIndex],barOptions);
        this._barChartClickEvent(this._barCharts[opts.chartIndex], currentHistogramInfo,opts.chartIndex);
        this._barChartHoverEvent(this._barCharts[opts.chartIndex], this.escapedName(opts.columnName), currentHistogramInfo, opts.chartIndex);
      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // - getDistinctHistogram

  /**
   * Change to different dataset in same dataflow
   */
  public changeWrangledDataset(dataset) {
    this.loadingShow();

    let dataflows = this.selectedDataSet["_embedded"].dataflows?this.selectedDataSet["_embedded"].dataflows:null;

    delete this.selectedDataSet;
    this.selectedDataSet = dataset;

    if(!this.selectedDataSet["_embedded"]) { this.selectedDataSet["_embedded"] = {}; }
    if(!this.selectedDataSet["_embedded"].dataflows && null!=dataflows) {
      this.selectedDataSet["_embedded"].dataflows = dataflows;
    }

    this.dataflowService.getDatasetWrangledData(dataset.dsId)
      .then((result) => {
        this.selectedDataSet.gridResponse = result.gridResponse;
        // grid refresh
        this.setGridData(this.selectedDataSet.gridResponse);

        this.setColumnWidthInfo(this.selectedDataSet.gridData);

        this.getHistogramInfoByWidths(this.columnWidths);

        // rule refresh
        this.setRuleList(result['ruleStringInfos']);
        // init ruleVO
        this.initRule();

        this.changeDataset.emit(this.selectedDataSet);

        this.loadingHide();

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

  } // function - changeWrangledDataset

  /**
   * REDO rule
   */
  public redoRule() {

    if (!this.redoable) {
      return;
    }

    if (this.isRedoRunning === false) {
      this.isRedoRunning = true;
      const rule = { op: 'REDO', ruleString: '' };
      this.applyRule(rule,'msg.dp.alert.redo.fail',false)

    }
  }

  /**
   * UNDO rule
   */
  public undoRule() {

    if (!this.undoable) {
      return;
    }

    if (this.isUndoRunning === false) {
      this.isUndoRunning = true;

      const rule = { op: 'UNDO', ruleString: '' };

      this.applyRule(rule,'msg.dp.alert.undo.fail',true);

    }

  }

  public showRuleListOption(event) {
    event.stopImmediatePropagation();
    this.isRuleListOptionShow = !this.isRuleListOptionShow;
  }

  /**
   * Jump to last index
   */
  public jumpLast() {
    let lastIdx = this.ruleList.length - 1;
    if( this.isJumped==true && 0 <= lastIdx ) {
      this.isJumped = false;

      this.jump(lastIdx, true);
      return true;
    }
    return false;
  }

  /**
   * Jump
   */
  public jump(idx, isCancel?) {
    // 현재 rule index
    this.currentIndex = idx;

    // 선택 된 컬럼 초기화
    if(!isNull(this.gridComponent.grid) && (this.selectedColumns.length > 0)) {
      // 선택 된 컬럼 초기화
      this.gridComponent.rowAllUnSelection();
      this.gridComponent.columnAllUnSelection();
    }

    this.searchText = '';
    let lastIdx = this.ruleList.length - 1;

    lastIdx!=idx ? this.isJumped = true : this.isJumped = false;

    this.loadingShow();

    // TODO : jumpRule, applyRule 은 같은 API
    this.dataflowService.jumpRule(this.selectedDataSet.dsId, 'FETCH', idx)
      .then((data) => {
        if (data.errorMsg) {
          Alert.warning(this.translateService.instant('msg.dp.alert.jump.fail'));
        } else {
          this.selectedDataSet.gridResponse = data.gridResponse;
          // this.selectedDataSet.ruleStringInfos = data['ruleStringInfos'];
          this.selectedDataSet.ruleCurIdx = idx;
          // grid refresh
          this.setGridData(this.selectedDataSet.gridResponse);

          this.setColumnWidthInfo(this.selectedDataSet.gridData);

          this.getHistogramInfoByWidths(this.columnWidths, isCancel);
          // rule refresh
          // this.setRuleList(data['ruleStringInfos']);
          // init ruleVO
          this.initRule(data);
          // init type list

          let boolValue = false;
          this.isJumped ? boolValue = true : boolValue = false;

          this.searchText = '';

          this.setRuleListColor(idx, boolValue);

        }

        this.loadingHide();

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /**
   * Delete formula input box for PIVOT & AGGREGATE
   * @idx index for deletion
   */
  public deleteFormula(idx) {

    if (this.pivotFormulaList.length === 1) {
      Alert.warning('Cannot delete Formula');
    } else {
      this.pivotFormulaValueList.splice(idx,1);
      this.pivotFormulaList.splice(idx,1);
    }
  } // function - deleteFormula

  /**
   * Command list 에서 Mouseover 일때 Selected = true, mouseleave 일때 selected = false
   * @param event 이벤트
   * @param index
   */
  public commandListHover(event,index) {

    if (!this.flag) {
      if (event.type === 'mouseover') {
        this.filteredCommandList[index].isHover = true;

      } else if (event.type === 'mouseout') {
        this.initSelectedCommand(this.filteredCommandList);
      }
    }
  } // function - commandListHover

  /**
   * nestlist, typelist, movelist 에서 mouseover 일때 Selected = true
   * @param event
   * @param list
   * @param index
   */
  public listMouseOver(event,list, index) {

    let tempList = [];
    switch(list) {
      case 'nest':
        tempList = this.nestList;
        break;
      case 'move':
        tempList = this.moveList;
        break;
      case 'type':
        tempList = this.typeList;
        break;
      case 'sort':
        tempList = this.sortList;
        break;
      case 'column1' :
        tempList = this.filteredColumnList;
        break;
      case 'column2' :
        tempList = this.filteredMoveDatasetList;
        break;
      case 'flatten' :
        tempList = this.filteredFlattenList;
        break;
      case 'unnest' :
        tempList = this.filteredUnnestList;
        break;
      case 'timestamp' :
        tempList = this.timestampTime;
        break;
    }
    if (!this.flag) {
      tempList[index].isHover = true;
    }
  } // function - listMouseOver

  /**
   * nestlist, typelist, patternlist,movelist, quotelist 에서 mouseout 일때 Selected = false
   * @param event
   * @param list
   */
  public listMouseOut(event,list) {

    let tempList = [];
    switch(list) {
      case 'nest':
        tempList = this.nestList;
        break;
      case 'move':
        tempList = this.moveList;
        break;
      case 'type':
        tempList = this.typeList;
        break;
      case 'sort':
        tempList = this.sortList;
        break;
      case 'column1' :
        tempList = this.filteredColumnList;
        break;
      case 'column2' :
        tempList = this.filteredMoveDatasetList;
        break;
      case 'flatten' :
        tempList = this.filteredFlattenList;
        break;
      case 'unnest' :
        tempList = this.filteredUnnestList;
        break;
      case 'timestamp' :
        tempList = this.timestampTime;
        break;
    }
    if (!this.flag) {
      this.initSelectedCommand(tempList);
    }
  } // function - listMouseOut

  /**
   * Select box for commands - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   */
  public navigateWithKeyboardShortList(event, currentList, clickHandler) {

    // open select box when arrow up/ arrow down is pressed
    if(event.keyCode === 38 || event.keyCode === 40) {
      switch(clickHandler) {
        case 'move' :
          !this.isBeforeOrAfterShow ? this.isBeforeOrAfterShow = true : null;
          break;
        case 'nest' :
          !this.isNestListShow ? this.isNestListShow = true: null;
          break;
        case 'type':
          if(!this.isTypeListShow) {
            this.isTypeListShow = true;
            setTimeout(() => $('.type-search').focus()); // 포커스
          }
          break;
        case 'column1':
        case 'unnestList':
        case 'flatten':
          if(!this.isColumnListShow) {
            this.isColumnListShow = true;
            setTimeout(() => $('.columnSearch').focus()); // 포커스
          }
          break;
        case 'column2':
          !this.isBeforeOrAfterColumnListShow ? this.isBeforeOrAfterColumnListShow = true: null;
          break;
        case 'timestamp':
          !this.isTimestampOpen ? this.isTimestampOpen = true: null;
          break;
        case 'command':
          if(!this.isCommandListShow) {
            this.isCommandListShow = true;
            setTimeout(() => $('#commandSearch').focus()); // 포커스
          }
          break;
      }
    }

    // when there is no element in the list
    if(currentList.length === 0){
      return;
    }

    // set scroll height
    let height = 25;
    if(clickHandler == 'command') {
      height = 50;
    }

    // this.commandList 에 마지막 인덱스
    let lastIndex = currentList.length-1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.isHover) {
        return command;
      }
    });
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if ( idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].isHover = true;

        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-command').scrollTop(lastIndex*height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].isHover = false;
        currentList[lastIndex].isHover = true;


        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-command').scrollTop(lastIndex*height);

      } else {
        currentList[idx].isHover = false;
        currentList[idx-1].isHover = true;
        $('.ddp-list-command').scrollTop((idx-1)*height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if ( idx === -1) {
        currentList[0].isHover = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      }  else if (idx === lastIndex) {

        currentList[0].isHover = true;
        currentList[lastIndex].isHover = false;
        $('.ddp-list-command').scrollTop(0);

      } else {
        currentList[idx].isHover = false;
        currentList[idx+1].isHover = true;
        $('.ddp-list-command').scrollTop((idx+1)*height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const idx = currentList.findIndex((command) => {
        if (command.isHover) {
          return command;
        }
      });

      // 선택된게 없는데 엔터를 눌렀을때
      if (idx === -1) {
        // if (this.ruleVO.command === 'settype' && this.timestampInputVal.nativeElement.value !== ''){
        //   this.ruleVO.timestamp = this.timestampInputVal.nativeElement.value;
        //   this.timestampInputVal.nativeElement.value = '';
        //   setTimeout(() => this.isTimestampOpen = false);
        //
        // }
        // return;
      } else {
        switch(clickHandler) {
          case 'move' :
            this.setBeforeOrAfter(event,currentList[idx]);
            break;
          case 'nest' :
            this.selectType(event,currentList[idx]);
            break;
          case 'type':
            this.setColumnType(event,currentList[idx]);
            break;
          case 'column1':
            this.selectColumn(event, currentList[idx]);
            $('[tabindex=2]').focus();
            break;
          case 'unnestList':
            this.selectColumn(event, currentList[idx]);
            break;
          case 'column2':
            this.selectedBeforeOrAfterColumn(event,currentList[idx]);
            break;
          case 'command':
            this.selectCommand(event, currentList[idx]);
            $('[tabindex=1]').focus();
            break;
          case 'timestamp':
            this.setTimestamp(event,currentList[idx]);
            break;
          default:
            this.selectColumn(event, currentList[idx]);
            break;

        }
      }
      // 스크롤, command select 초기화
      this.initSelectedCommand(currentList);
    }
  }

  /**
   * change commandList selected -> false (초기화)
   */
  public initSelectedCommand(list) {
    list.forEach((item) => {
      return item.isHover = false;
    })
  } // function - initSelectedCommand


  /**
   * Set colour to rule list when jumped
   */
  public setRuleListColor(idx, renew) {

    if (renew) {
      this.ruleList.forEach((item,index) => {
        item.colored = !(index === idx || index < idx);
      });
    } else {
      this.ruleList.forEach((item) => {
        item.colored = false;
      });
    }

  }

  public gridHeaderClickHandler(event) {

    // 선택되어있던 Row unselect !
    if (this.gridComponent.getSelectedRows().length > 0) {
      for (let i in this.clickedSeries) {
        if(this.clickedSeries[i].length > 0) {
          this.clickedSeries[i] = [];
          let options = this.getDefaultChartOption(this.getHistogramInfo(i),i);
          this.applyChart(this.charts[i],options)
        }
      }
      for (let i in this.barClickedSeries) {
        if(this.barClickedSeries[i].length > 0) {
          this.barClickedSeries[i] = [];
          let options = this.getDefaultBarChartOption(this.getHistogramInfo(i),i);
          this.applyChart(this._barCharts[i],options)
        }
      }
      this.gridComponent.rowAllUnSelection();
      this.selectedBarChartRows = [];
    }

    let list = this.selectedDataSet.gridData.fields.map((item) => {
      return this.escapedName(item.name);
    });

    let selectedDiv = $('app-edit-dataflow-rule .slick-header-columns').children()[list.indexOf(event.id) + 1];
    if (event.isSelect) {
      selectedDiv.setAttribute("style",'background-color : #d6d9f1; width : ' + selectedDiv.style.width);
    }  else {
      selectedDiv.setAttribute("style",'background-color : ; width : ' + selectedDiv.style.width);
    }

    // 선택된 컬럼들
    this.selectedColumns = event.selectColumnIds;

    // 셀렉트박스에서 컬럼 클릭 시
    if (this.selectboxFlag) {
      this.selectedDataSet.gridData.fields.forEach((item) => {
        if (item.name === event.id) {
          item.selected = event.isSelect;
          item.seq = 1;
          this.setColSeq(item);
          this.selectboxFlag = false;
        }
      });
      this.moveScrollHorizontally(this.ruleVO.col);
    } else { // 그리드에서 헤더 클릭시
      this.selectedDataSet.gridData.fields.forEach((item) => {
        if (item.name === event.id) {
          item.selected = event.isSelect;
          this.setColSeq(item);
        }
      })
    }

    if (this.ruleVO.command === 'rename' || this.ruleVO.command === 'split' || this.ruleVO.command === 'extract') {

      this.ruleVO.col = this.selectedColumns.length === 0 ? '' : this.selectedColumns[0];

    } else if (this.ruleVO.command === 'unnest') {
      if (this.selectedColumns.length === 1) { // multi select 지원 안함
        this.selectedDataSet.gridData.fields.filter((item) => { // type 확인
          if (item.name === this.selectedColumns[0]) {
            if (item.type === 'ARRAY' || item.type === 'MAP') {
              this.ruleVO.col = this.selectedColumns[0];
              // this.moveScrollHorizontally(this.ruleVO.col);
            } else {
              this.ruleVO.col = '';
            }
          }
        });
      } else {
        this.ruleVO.col = '';
      }
    } else if (this.ruleVO.command === 'flatten') {
      if (this.selectedColumns.length === 1) { // multi select 지원 안함
        this.selectedDataSet.gridData.fields.filter((item) => { // type 확인
          if (item.name === this.selectedColumns[0]) {
            if (item.type === 'ARRAY') {
              this.ruleVO.col = this.selectedColumns[0];
              // this.moveScrollHorizontally(this.ruleVO.col);

            } else {
              this.ruleVO.col = '';
            }
          }
        });
      } else {
        this.ruleVO.col = '';
      }
    } else if (this.ruleVO.command === 'settype') {
      if (this.ruleVO.type && 'string' === this.ruleVO.type.toLowerCase()) {

        let timestampStyles = [];
        this.selectedColumns.forEach((item) => {
          let idx = this._findIndexWithNameInGridResponse(item);
          if ('TIMESTAMP' === this._findUpperCaseColumnTypeWithIdx(idx)) {
            timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
          }
        });
        const allEqual = arr => arr.every( v => v === arr[0] );
        if (timestampStyles.length !== 0 && this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
        } else if (timestampStyles.length > 0) {
          this.isTypeTimestamp = true;
          this.ruleVO.timestamp = '';
        } else {
          this.isTypeTimestamp = false;
        }

      } else if (this.ruleVO.type && 'timestamp' === this.ruleVO.type.toLowerCase()) {
        this.isTypeTimestamp = true;

        let timestampStyles = [];
        let stringTimestampStyles = [];
        if (this.selectedColumns.length > 0 ) {
          this.selectedColumns.forEach((item) => {
            let idx = this._findIndexWithNameInGridResponse(item);
            if ('TIMESTAMP' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
              timestampStyles.push(this._findTimestampStyleWithIdxInColDescs(idx));
            } else if ('STRING' === this.selectedDataSet.gridResponse.colDescs[idx].type) {
              stringTimestampStyles.push(this.timestampSuggestions[item][0] ? this.timestampSuggestions[item][0] : '');
            }
          });
          const allEqual = arr => arr.every( v => v === arr[0] );
          if (timestampStyles.length !== 0 && this.selectedColumns.length === timestampStyles.length && allEqual(timestampStyles)) {
            this.ruleVO.timestamp = timestampStyles[0].replace(/'/g, '\\\'');
          } else if (stringTimestampStyles.length !== 0 && this.selectedColumns.length === stringTimestampStyles.length && allEqual(stringTimestampStyles)) {
            this.ruleVO.timestamp = stringTimestampStyles[0].replace(/'/g, '\\\'');
          } else {
            this.ruleVO.timestamp = '';
          }
        }
      } else {
        this.isTypeTimestamp = false;
        this.ruleVO.timestamp = '';
      }
    } else if ('setformat' === this.ruleVO.command) {

      let selectedColumns = event.selectColumnIds;
      let types = [];
      selectedColumns.forEach((item) => {
        let idx = this._findIndexWithNameInGridResponse(item);
        if ('TIMESTAMP' === this._findUpperCaseColumnTypeWithIdx(idx)) {
          types.push(this._findTimestampStyleWithIdxInColDescs(idx));
        } else {
          this.ruleVO.cols.splice(this.ruleVO.cols.indexOf(item),1);
        }
        const allEqual = arr => arr.every( v => v === arr[0] );
        if (allEqual(types)) {
          this.ruleVO.timestamp = types[0];
        } else {
          this.ruleVO.timestamp = '';
        }
      });
      this.isTimestampEdit = false;
      this.ruleVO.timestamp = this.ruleVO.timestamp !== '' ? this.ruleVO.timestamp : this.ruleVO.timestamp.replace(/'/g, '\\\'');

    }


    if (event.shiftKey) {
      this.onShiftKeyPressedSelectColumn(event);
    }

    if (this.selectedColumns.length === 0) {
      this.ruleVO.timestamp = '';
    }

  }

  /**
   * Shift key가 눌린 상태에서 컬럼 선택시
   * @param event
   */
  public onShiftKeyPressedSelectColumn(event) {

    if(event.isSelect === false) {
      return;
    }

    let selectedIdx = this.selectedColumns.indexOf(event.id);
    let baseColumn = this.selectedColumns[selectedIdx-1];

    const gridFields = this.selectedDataSet.gridData.fields.map((f) => {
      return f.name;
    });

    let selectedIndex = gridFields.indexOf(event.id);
    let baseColumnIndex = gridFields.indexOf(baseColumn);

    let selectlist = [];
    if (selectedIndex > baseColumnIndex) {
      this.selectedDataSet.gridData.fields.forEach((item, index) => {
        if (index < selectedIndex && index > baseColumnIndex ) {
          selectlist.push(index);
        }
      });
    } else {
      this.selectedDataSet.gridData.fields.forEach((item, index) => {
        if (index > selectedIndex && index < baseColumnIndex ) {
          selectlist.push(index);
        }
      });
    }

    selectlist.forEach((item)=> {
      let data = this.selectedDataSet.gridData.fields[item];
      if (!data.selected) {
        this.gridComponent.selectColumn(data.name, !data.selected);
      }
    });
  }


  /**
   * Scroll 위치 강제 조정
   * @param column 선택된 컬럼 위치에 따라 스크롤 위치 수정
   */
  public moveScrollHorizontally(column : string) {

    // 스크롤을 강제적으로 주는것
    this.selectedDataSet.gridData.fields.filter((item,index) => {
      if (item.name === column) {
        this.gridComponent.grid.scrollCellIntoView(0,index+1);
      }
    });

  }

  /**
   * Scroll 위치 강제 조정
   * @param row
   */
  public moveScrollVertically(row) {

    this.gridComponent.grid.scrollRowIntoView(row);
  }


  /**
   * When row is clicked
   * @param event
   */
  public gridRowClickHandler(event) {

    // 컬럼이 선택되어 있다면 all unsel
    if(this.selectedColumns.length > 0) {
      this.gridComponent.columnAllUnSelection();
    }

    // cell이 선택 했을 때 선택 되어있던 히스토그램 바 refresh.
    // if (event.selected === null) {
    let options ;
    this.selectedDataSet.gridResponse.colNames.forEach((item,index) => {
      if (this.clickedSeries[index].length > 0) {
        this.clickedSeries[index] = [];
        options = this.getDefaultChartOption(this.getHistogramInfo(index),index);
        this.applyChart(this.charts[index],options)
      }
    });
    this.selectedRows = [];
    // }

    if (event.event.shiftKey) {
      this.onShiftKeyPressedSelectRow(event.event,event.row);
    }
  }

  /**
   * Row clicked with Shift key
   * @param event
   * @param row
   */
  public onShiftKeyPressedSelectRow(event,row) {

    if(event.selected === false) {
      return;
    }

    let selectedRows = this.gridComponent.getSelectedRows().map((item) => {
      return item['_idProperty_']-1
    });

    let baseColumn = selectedRows[selectedRows.length-2];
    let selectedIdx = row['_idProperty_']-1;

    let selectlist = [baseColumn];
    if (selectedIdx > baseColumn) {
      this.selectedDataSet.gridResponse.rows.forEach((item, index) => {
        if (index < selectedIdx && index > baseColumn ) {
          selectlist.push(index);
        }
      });
    } else {
      this.selectedDataSet.gridResponse.rows.forEach((item, index) => {
        if (index > selectedIdx && index < baseColumn) {
          selectlist.push(index);
        }
      });
    }
    selectlist.push(selectedIdx);
    this.gridComponent.rowSelection(_.union(selectedRows, selectlist));

  }

  /**
   * 수식 입력 팝업 오픈
   * @param {string} command 수식 입력 실행 커맨드
   */
  public openPopupFormulaInput(command:string) {
    const fields: Field[] = this.selectedDataSet.gridData.fields;
    this.extendInputFormulaComponent.open(fields, command);
  } // function - openPopupFormulaInput

  /**
   * 수식 입력 종료 및 적용
   * @param {{command: string, formula: string}} data
   */
  public doneInputFormula(data:{command:string, formula:string}) {
    switch( data.command ) {
      case 'derive' :
      case 'set' :
        this.ruleVO.value = data.formula;
        break;
      default :
        this.ruleVO.row = data.formula;
    }
  } // function - doneInputFormaula

  // create grid
  public updateGrid(data: any) {

    const fields: Field[] = data.fields;
    let rows: any[] = data.data;

    const defaultStyle: string = 'line-height:30px;';
    const nullStyle: string = 'color:#b8bac2; font-style: italic;';
    const selectStyle: string = 'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0px; line-height:30px; padding:0 10px;';
    const mismatchStyle: string = 'color:' +this._BARCHART_MISMATCH_COLOR +'; font-style: italic;';

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field) => {

      return new SlickGridHeader()
        .Id(this.escapedName(field.name))
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
        .Field(field.name)
        .Behavior('select')
        .CssClass('cell-selection')
        .Width(this.columnWidths[field.name])
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .RerenderOnResize(true)
        .Unselectable(true)
        .Sortable(false)
        .Header(this.getHeaderMenu(field))
        .ColumnType(field.type)
        .Formatter(( row, cell, value, columnDef ) => {

          const colDescs = (this.selectedDataSet.gridResponse) ? this.selectedDataSet.gridResponse.colDescs[cell-1] : {};
          value = this._setFieldFormatter(value, field.type, colDescs);

          if (field.type === 'STRING') {
            let re = /\s/gi;
            let tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0px">'+this.spaceSymbol+'</span>';
            value = ( value ) ? value.toString().replace(re, tag) : value;
          }

          if (isNull(value) && columnDef.select) {
            return '<div style="' + defaultStyle + nullStyle + selectStyle + '">' + '(null)' + '</div>';
          } else if (isNull(value) && !columnDef.select) {
            return '<div  style="' + defaultStyle + nullStyle + '">' + '(null)' + '</div>';
          } else if (!isNull(value) && columnDef.select) {
            if (this.getHistogramInfo(cell-1).mismatchedRows.length !== 0  && this.getHistogramInfo(cell-1).mismatchedRows.indexOf(row) !== -1 ) {
              return '<div style="' + defaultStyle + mismatchStyle + selectStyle + '">' + value + '</div>';
            } else {
              return '<div style="' + defaultStyle + selectStyle + '">' + value + '</div>';
            }
          } else if (columnDef.id === '_idProperty_') {
            return '<div style="' + defaultStyle + '">' + '&middot;' + '</div>';
          } else {
            if (this.getHistogramInfo(cell-1).mismatchedRows.length !== 0  && this.getHistogramInfo(cell-1).mismatchedRows.indexOf(row) !== -1 ) {
              return '<div style="' + defaultStyle + mismatchStyle + '">' + value + '</div>';
            } else {
              return value;
            }
          }

        })
        .build();
    });

    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .RowHeight(32)
      .MultiColumnSort(false)
      .EnableHeaderClick(true)
      .DualSelectionActivate(true)
      .EnableColumnReorder(false)
      .EnableHeaderMenu(!this.isJumped)
      .EnableSeqSort(false)
      .ShowHeaderRow(true)
      .HeaderRowHeight(90)
      .ExplicitInitialization(true)
      .NullCellStyleActivate(true)
      .EnableMultiSelectionWithCtrlAndShift(true)
      .build()
    );

    // 그리드  검색
    this.gridComponent.search(this.searchText);

    // 그리드 total number of Rows
    this.pivotGridTotalRow = this.gridComponent.getRows().length;

    // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
    this.gridComponent.grid.init();

    this.loadingHide();

    // Draw histogram
    this.drawChart();
  }

  /**
   * 문자열에 타임스탬프 포맷을 적용함
   * @param {string} value
   * @param {string} timestampStyle
   * @return {string}
   * @private
   */
  private _setTimeStampFormat(value: string, timestampStyle?: string): string {
    (timestampStyle) || (timestampStyle = 'YYYY-MM-DDTHH:mm:ss.000Z');
    return moment(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g,''));
  } // function - _setTimeStampFormat


  /**
   * 필드에 대한 형식 지정
   * @param value
   * @param {string} type
   * @param {{timestampStyle: string, arrColDesc: any, mapColDesc: any}} colDescs
   * @returns {string}
   * @private
   */
  private _setFieldFormatter(value: any, type: string,
                             colDescs: { timestampStyle?: string, arrColDesc?: any, mapColDesc?: any }): string {
    let strFormatVal: string = '';
    if( colDescs ) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = this._setTimeStampFormat(value, colDescs.timestampStyle);
      } else if ('ARRAY' === type && !isUndefined(colDescs)) {
        // 배열 형식내 각 항목별 타임 스템프 처리
        const arrColDescs = colDescs.arrColDesc ? colDescs.arrColDesc : {};
        strFormatVal = JSON.stringify(
          value.map((item: any, idx: number) => {
            const colDesc = arrColDescs[idx] ? arrColDescs[idx] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              return this._setTimeStampFormat(item, colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(item, colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              return ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          })
        );
      } else if ('MAP' === type && !isUndefined(colDescs)) {
        // 구조체내 각 항목별 타임 스템프 처리
        const mapColDescs = colDescs.mapColDesc ? colDescs.mapColDesc : {};
        let newMapValue = {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            const colDesc = mapColDescs.hasOwnProperty(key) ? mapColDescs[key] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              newMapValue[key] = this._setTimeStampFormat(value[key], colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(value[key], colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              newMapValue[key]
                = ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          }
        }
        strFormatVal = JSON.stringify(newMapValue);
      } else {
        strFormatVal = <string>value;
      }
    } else {
      strFormatVal = <string>value;
    }

    return strFormatVal;
  } // function - _setFieldFormatter


  public escapedName(name) : string {

    // /[$&+,:;=?@#|'<>.^*()%!-]/.test(name)

    let specialCharacters: { value: RegExp; label: string }[];
    specialCharacters = [
      { value: /!/gi, label: '1' },
      { value: /@/gi, label: '2' },
      { value: /#/gi, label: '3' },
      { value: /\$/gi, label: '4' },
      { value: /%/gi, label: '5' },
      { value: /\^/gi, label: '6' },
      { value: /&/gi, label: '7' },
      { value: /\*/gi, label: '8' },
      { value: /\(/gi, label: '9' },
      { value: /\)/gi, label: '0' },
      { value: /`/gi, label: 'a' },
      { value: /~/gi, label: 'b' },
      { value: /=/gi, label: 'c' },
      { value: /\+/gi, label: 'd' },
      { value: /;/gi, label: 'e' },
      { value: /:/gi, label: 'f' },
      { value: /</gi, label: 'g' },
      { value: />/gi, label: 'h' },
      { value: /\?/gi, label: 'j' },
      { value: /,/gi, label: 'k' },
      { value: /\./gi, label: 'l' },
      { value: /\[/gi, label: 'm' },
      { value: /]/gi, label: 'n' }
    ];

    if (/[!@#$%^&*()`~=';/,.?":{}+₩|_<>\\]/.test(name)){
      specialCharacters.forEach((item) => {
        name = name.replace(item.value,item.label);
      });
    }
    return name
  }

  /**
   * Draw histogram
   * @param data {any} - {idx : array index, name : 컬럼 이름, width : 변경된 컬럼 width}
   */
  public drawChart(data?) {

    let gridResponse = this.selectedDataSet.gridResponse;

    // 처음 그릴때 컬럼별로 저장한다
    this.charts = [];
    this._barCharts = [];

    gridResponse.colNames.forEach((item) => {
      this.charts.push(echarts.init(document.getElementById('histogram_' +  this.escapedName(item))));
      this._barCharts.push(echarts.init(document.getElementById('barChart_' +  this.escapedName(item))));
    });

    // 컬럼 폭이 변경됐다면 ~
    if (data) {

      this.columnWidths[data.name] ? this.columnWidths[data.name] = data.width : null;

      // 첫번째 컬럼은 해당 안됨
      if (data.name === '_idProperty_') {
        return;
      }

      // 히스토그램 redraw
      this.getDistinctHistogram({
        dsId : this.selectedDataSet.dsId
        , columnIndex : gridResponse.colNames.indexOf(data.name)
        , columnWidth : data.width
        , chartIndex : data.idx-1
        , columnName : data.name} );

    } else {

      if (gridResponse.colHists.length !== 0) {
        // 옵션 넣기
        this.charts.forEach((item,index) => {
          // let name = this.selectedDataSet.gridData.fields[index].name;
          let name = gridResponse.colNames[index];
          if (gridResponse.colHists[index]) {

            let histogramInfo = this.getHistogramInfo(index);
            let option = this.getDefaultChartOption(histogramInfo,index);

            // Apply chart
            this.applyChart(item,option);

            this.histogramMouseEvent(item, this.escapedName(name), histogramInfo, index);
          } else {
            this.histogramMouseEvent(item, this.escapedName(name), '', index);
          }
        });

        this._barCharts.forEach((chart, index) => {

          let histogramInfo = this.getHistogramInfo(index);
          let name = gridResponse.colNames[index];

          this.applyChart(chart, this.getDefaultBarChartOption(histogramInfo,index));
          this._barChartHoverEvent(chart, this.escapedName(name),histogramInfo, index);
          this._barChartClickEvent(chart,histogramInfo, index);
        });
      }
    }
    this.loadingHide();
  }

  /**
   * Bar chart click event 처리
   * @param chart
   * @param histogramInfo
   * @param index
   * @private
   */
  private _barChartClickEvent(chart, histogramInfo, index) {
    let options;
    chart.off('click');
    chart.on('click', (params) => {

      // 컬럼이 선택되어있다면 초기화
      if (this.selectedColumns.length > 0 ) {
        this.gridComponent.columnAllUnSelection();
      }

      // 바가 아닌 다른 영역을 클릭했을 경우 선택 해지.
      if (isNull(params)) {
        // 현재 클릭된 시리즈 해제
        this.barClickedSeries[index] = [];
        this.selectedBarChartRows = [];
        this.gridComponent.rowAllUnSelection();

      } else {

        // 선택되어있는 히스토그램 및 rows 초기화 //
        let chartIndex = -1;
        Object.keys(this.clickedSeries).forEach((key,index) => {
          if(this.clickedSeries[key].length > 0) {
            chartIndex = index;
          }
        });
        if (chartIndex !== -1) {
          this.clickedSeries[chartIndex] = [];
          this.gridRowAllUnselect();
          this.selectedRows = [];
          options = this.getDefaultChartOption(this.getHistogramInfo(chartIndex),chartIndex);
          this.applyChart(this.charts[chartIndex],options)
        }
        // 선택되어있는 히스토그램 및 rows 초기화 //


        // 자기 이외에 다른 차트가 선택되어있으면 모두 선택 해제
        this.selectedDataSet.gridResponse.colNames.forEach((item, i) => {
          if (i !== index) {
            if (this.barClickedSeries[i].length !== 0) {
              this.barClickedSeries[i] = [];
              this.gridRowAllUnselect();
              this.selectedBarChartRows = [];
              options = this.getDefaultBarChartOption(this.selectedDataSet.gridResponse.colHists[i],i);
              this.applyChart(this._barCharts[i],options)
            }
          }
        });


        // 현재 선택된 시리즈가 이미 선택되어있는지 확인한다.
        let idx = this.barClickedSeries[index].indexOf(params.seriesName);
        if (idx === -1) {

          // 선택되어있지 않으면 추가
          // 선택된 rows 도 클릭이 되어야하는 상태 ..
          // this.selectedDataset.gridResponse.colHists[index] 에서
          // params.seriesName + rows 를 찾아와서 rows를 그리드에 선택 되게 한다.
          this.selectedBarChartRows = _.union(this.selectedBarChartRows, this.selectedDataSet.gridResponse.colHists[index][params.seriesName + 'Rows']);
          this.rowClickHandler(this.selectedBarChartRows);
          this.barClickedSeries[index].push(params.seriesName);

        } else {

          // 이미 선택되어있다면 삭제
          this.selectedDataSet.gridResponse.colHists[index][params.seriesName + 'Rows'].forEach((item) => {
            this.selectedBarChartRows.forEach((data,idx) => {
              if(data === item) {
                this.selectedBarChartRows.splice(idx,1);
              }
            })
          });
          this.rowClickHandler(this.selectedBarChartRows);
          this.barClickedSeries[index].splice(idx,1);
        }
      }
      options = this.getDefaultBarChartOption(histogramInfo, index);
      this.applyChart(chart,options);
    })
  }

  /**
   * Bar chart hover event 처리
   * @param chart
   * @param name
   * @param histogramInfo
   * @param index
   * @private
   */
  private _barChartHoverEvent(chart, name, histogramInfo, index) {
    this.barChartTooltipShow = false;
    chart.off('mouseout');
    chart.on('mouseover', (param) => {

      this.barChartTooltipIndex = index;
      // 이미 호버된 영역에 툴팁이 띄어져 있다면 또 띄우지 않는다
      if ( ( param.event && this.barChartTooltipLabel !== param.seriesName)) {

        // 현재 호버 한 시리즈 width
        let seriesWidth : number = param.event.target.shape.x;

        // 화면 끝에서 현재 마우스가 있는 곳 까지의 거리
        let distanceFromWindowToCursor : number = param.event.event.pageX;

        // 현재 차트가 들어있는 div 처음에서 마우스가 있는 곳 까지의 거리
        let distanceFromDivToCursor : number = seriesWidth !== 0 ? param.event.event.offsetX - seriesWidth : param.event.event.offsetX;

        if (distanceFromDivToCursor + 30  > seriesWidth) {
          if (distanceFromDivToCursor < 30) {
            distanceFromWindowToCursor = distanceFromWindowToCursor + 30;
          } else if (param.event.target.shape.width - distanceFromDivToCursor < 30) {
            distanceFromWindowToCursor = distanceFromWindowToCursor - 30;
          }
        }

        this.barChartTooltipPosition = distanceFromWindowToCursor + 'px';
        this.barChartTooltipValue = param.value;
        this.barChartTooltipLabel = param.seriesName;
        this.barChartTooltipShow = true;
      }
    });
    chart.on('mouseout', () => {
      this.barChartTooltipShow = false;
      this.barChartTooltipLabel = '';
    });
  }

  public applyMulticolumnRename(data) {
    this.applyRule(data);
  }


  public applyChart(chart: any, option: any) {
    chart.setOption(option);
  }

  /**
   * Grid component 안에 있는 onHeaderRowCellRendered 가 일어났을때 아래 로직 적용
   * @param args
   */
  public onHeaderRowCellRendered(args) {

    if (args.column.id !== '_idProperty_') {
      $('<div></div>')
        .attr('id', 'barChart_' +  args.column.id)
        .css({
          'width': args.column.width + 'px',
          'height': '15px',
        })
        .appendTo(args.node);
      $('<div></div>')
        .attr('id', 'histogram_' +  args.column.id)
        .css({
          'width': args.column.width + 'px',
          'height': '45px',
        })
        .appendTo(args.node);
      $("<div></div>")
        .attr('id', args.column.id)
        .css({'width':args.column.width + 'px',
          'height':'30px' , 'border-top':'1px solid #ebebed', 'line-height': '29px', 'white-space':'nowrap', 'text-overflow':'ellipsis', 'overflow':'hidden'})
        .appendTo(args.node);
    } else {
      $('<div></div>')
        .attr('id', 'firstColumn')
        .css({'height': '90px'})
        .appendTo(args.node); //75
    }
  }

  /**
   * 바 차트 디폴트 옵션 설정
   * @param chartInfo
   * @param {number} index
   * @return {any}
   */
  public getDefaultBarChartOption (chartInfo : any, index : number | string ) : any {

    return {
      animation : false,
      grid: { right: '0', left: '0', bottom : '55'},
      xAxis: [{ type: 'category', show : false },
        { type: 'value', show : false, max : chartInfo.matched + chartInfo.missing + chartInfo.mismatched }],
      yAxis: [
        { type: 'value', show : false, position: 'left'},
        { type: 'category', position: 'right', show : false, }],
      series: [
        { name: 'matched', type: 'bar', stack: 'stack1', barWidth : 8,
          label: {
            normal: {
              show: false,
            }
          },
          data: [chartInfo.matched],
          xAxisIndex : 1,
          yAxisIndex : 1,
          itemStyle: { normal: {
              color: ((params) => {
                if (this.barClickedSeries[index].length === 0) {
                  return this.histogramDefaultColor
                } else {
                  let idx = this.barClickedSeries[index].indexOf(params.seriesName);
                  if (idx === - 1) {
                    return this.histogramDefaultColor
                  } else {
                    return this.histogramClickColor
                  }
                }
              })
            }, emphasis : {color : this.histogramHoverColor} }
        },
        {
          name: 'mismatched',
          type: 'bar',
          stack: 'stack1',

          label: {
            normal: {
              show: false,
            }
          },
          data: [chartInfo.mismatched],
          xAxisIndex : 1,
          yAxisIndex : 1,
          itemStyle: { normal: {
              color: ((params) => {
                if (this.barClickedSeries[index].length === 0) {
                  return this._BARCHART_MISMATCH_COLOR
                } else {
                  let idx = this.barClickedSeries[index].indexOf(params.seriesName);
                  if (idx === - 1) {
                    return this._BARCHART_MISMATCH_COLOR
                  } else {
                    return this._BARCHART_MISMATCH_CLICK_COLOR
                  }
                }
              })
            }, emphasis : {color : this._BARCHART_MISMATCH_HOVER_COLOR} }
        },
        {
          name: 'missing',
          type: 'bar',
          stack: 'stack1',

          label: {
            normal: {
              show: false,
            }
          },
          data: [chartInfo.missing],
          xAxisIndex : 1,
          yAxisIndex : 1,
          itemStyle: { normal: {
              color: ((params) => {
                if (this.barClickedSeries[index].length === 0) {
                  return this._BARCHART_MISSING_COLOR
                } else {
                  let idx = this.barClickedSeries[index].indexOf(params.seriesName);
                  if (idx === - 1) {
                    return this._BARCHART_MISSING_COLOR
                  } else {
                    return this._BARCHART_MISSING_CLICK_COLOR
                  }
                }
              })
            }, emphasis : {color : this._BARCHART_MISSING_HOVER_COLOR} }
        },
      ]
    }
  }


  /**
   * Get histogram info from this.selectedDataSet.histogram
   * @param index
   */
  public getHistogramInfo(index) : any {
    return this.selectedDataSet.gridResponse.colHists[index];
    // return this.selectedDataSet.histogram[index];
  }

  /**
   * Set Histogram option
   * @param histogramInfo 히스토그램 정보
   * @param index
   */
  public getDefaultChartOption(histogramInfo: any, index ) : any {

    // 옵션들
    this.defaultChartOption = {
      animation : false, // 차트가 처음 그릴떄 깜박거리는거
      brush: {
        xAxisIndex: [],
        yAxisIndex: [],
        transformable : false,
        inBrush: {
          opacity: 1
        },
        outOfBrush: {
          opacity: 0.2
        }
      },toolbox: {
        show : false,
        feature : {
          mark : {show: true},
          dataView : {show: true, readOnly: false},
          magicType: {show: true, type: ['line', 'bar']},
          restore : {show: true},
          saveAsImage : {show: true}
        }
      },
      cursor : 'pointer',
      grid: { top: '5px', left: '10px', right: '10px', bottom: '0' },
      xAxis: { show : false , min : 0 },
      yAxis: { show : false , min : 0 },
      series: [{
        name: '',
        type: 'bar',
        barGap : 2,
        itemStyle: { normal: {
            color: (function (scope) {
              return function (params) {
                if (scope.clickedSeries[index].length === 0) {
                  return scope.histogramDefaultColor;
                } else {
                  let idx = scope.clickedSeries[index].indexOf(params.name);
                  if (idx === - 1) {
                    return scope.histogramDefaultColor
                  } else {
                    return scope.histogramClickColor
                  }
                }
              };
            })(this)
          }, emphasis : {color : this.histogramHoverColor} },
      }]
    };

    let labels = _.cloneDeep(histogramInfo.labels);
    if (histogramInfo.labels.length !== histogramInfo.counts.length){
      labels.pop();
    }

    return _.merge({}, this.defaultChartOption, {
      tooltip: { trigger: 'axis', axisPointer: {
          type: 'shadow' },
        formatter : (function (scope) {
          return function (params) {
            let labels = scope.selectedDataSet.gridResponse.colHists[index].labels;
            let sum = scope.selectedDataSet.gridResponse.rows.length;
            let data = ` ${params[0].data} `;
            let percentage = '<span style="color:#b4b9c4">' +((params[0].value/sum)* 100).toFixed(2) + '%' + '</span>';
            switch (scope.selectedDataSet.gridResponse.colDescs[index].type) {
              case 'TIMESTAMP':
                scope.hoverHistogramData = `${labels[params[0].dataIndex]} ~ ${labels[params[0].dataIndex +1]}${data}${percentage}`;
                break;
              case 'LONG' :
                scope.hoverHistogramData = `${scope._getAbbrNumberRange(labels[params[0].dataIndex],labels[params[0].dataIndex+1])}${data}${percentage}`;
                break;
              case 'DOUBLE':
                // if ( labels[params[0].dataIndex] % 1 === 0 ) {
                //   scope.hoverHistogramData = `${scope._abbrNum(labels[params[0].dataIndex])} ~ ${scope._abbrNum(labels[params[0].dataIndex +1])}`
                // } else {
                //   scope.hoverHistogramData = `${parseFloat(labels[params[0].dataIndex]).toFixed(2)} ~ ${parseFloat(labels[params[0].dataIndex +1]).toFixed(2)}${data}${percentage}`
                // }
                scope.hoverHistogramData = `${parseFloat(labels[params[0].dataIndex]).toFixed(2)} ~ ${parseFloat(labels[params[0].dataIndex +1]).toFixed(2)}${data}${percentage}`
                break;
              default:
                scope.hoverHistogramData = params[0].name + data + percentage;
                break;
            }
            $('#' + scope.escapedName(scope.selectedDataSet.gridResponse.colHists[index].colName)).empty().append(scope.hoverHistogramData );

          };
        })(this) },
      xAxis: [{ data: labels }],
      yAxis: {  max : histogramInfo.maxCount },
      series: [{ data: histogramInfo.counts }]
    });
  }

  /**
   * Histogram Mouse event
   * @param chart 현재 마우스이벤트가 일어나는 echart
   * @param {string} divId 현재 echart의 div의 ID
   * @param histogramInfo 히스토그램 정보
   * @param {number} index charts 에서 몇번째 인지
   */
  public histogramMouseEvent(chart : any, divId: string, histogramInfo : any, index: number) {

    let histInfo = this.selectedDataSet.gridResponse.colHists[index];

    let value = '';

    if ( isUndefined(histInfo) || ( 0 === histInfo.labels.length && 0 === histInfo.counts.length ) ) {
      value = "No valid values";
    } else {
      switch(this.selectedDataSet.gridResponse.colDescs[index].type) {
        case 'LONG':
        case 'TIMESTAMP':
          value = `${histogramInfo.min} ~ ${histogramInfo.max}`;
          break;
        case 'DOUBLE':
          value = `${parseFloat(histogramInfo.min).toFixed(2)} ~ ${parseFloat(histogramInfo.max).toFixed(2)}`;
          break;
        default :
          value = histogramInfo.distinctValCount === 1 ? histogramInfo.distinctValCount + ' category' : histogramInfo.distinctValCount + ' categories';
          break;
      }
    }

    $('#' + divId).empty().append(value);

    // when mouse out, show categories
    chart.off('mouseout');
    chart.on('mouseout', () => {
      if(histogramInfo !== '') {
        this.hoverHistogramData = histogramInfo.counts.length;
        $('#' + divId).empty().append(value);
      }
    });

    this.histogramClickEvent(chart, histogramInfo, index);
  }

  /**
   * Histogram bar click handler
   * @param chart - current chart
   * @param histogramInfo - current histogram info
   * @param index - index from chart array (그리드에서 현재 클릭된 히스토그램이 몇번쨰 인지 확인하기 위한)
   */
  public histogramClickEvent(chart, histogramInfo, index) {

    let options;
    chart.off('click');
    chart.on('click', (params) => {
      // param이 null 이라면 선택된 bar 초기화 한다.
      if (isNull(params)) {
        if (this.clickedSeries[index].length > 0) {
          this.clickedSeries[index] = [];
          this.gridRowAllUnselect();
          this.selectedRows = [];
          options = this.getDefaultChartOption(histogramInfo,index);
          this.applyChart(chart,options)
        }
      } else {

        // 현재 선택되어있는 column/row refresh
        if (this.selectedColumns.length > 0) {
          this.gridComponent.columnAllUnSelection();
          this.selectedRows = [];
        }

        // 현재 선택되어있는 바 차트 refresh
        let chartIndex = -1;
        Object.keys(this.barClickedSeries).forEach((key,index) => {
          if(this.barClickedSeries[key].length > 0) {
            chartIndex = index;
          }
        });
        if (chartIndex !== -1) {
          this.barClickedSeries[chartIndex] = [];
          this.gridRowAllUnselect();
          options = this.getDefaultBarChartOption(this.getHistogramInfo(chartIndex),chartIndex);
          this.applyChart(this._barCharts[chartIndex],options)
        }


        this.selectedDataSet.gridResponse.colNames.forEach((item, i) => {
          if (i !== index) {
            if (this.clickedSeries[i].length !== 0) {
              this.clickedSeries[i] = [];
              this.gridRowAllUnselect();
              options = this.getDefaultChartOption(this.selectedDataSet.gridResponse.colHists[i],i);
              // options = this.getDefaultChartOption(this.selectedDataSet.histogram[i],i);
              this.applyChart(this.charts[i],options)
            }
          }
        });
        let idx = this.clickedSeries[index].indexOf(params.name);
        if (idx === -1) {
          this.selectedRows = _.union(this.selectedRows, histogramInfo.rownos[params.dataIndex]);
          this.rowClickHandler(this.selectedRows);
          this.clickedSeries[index].push(params.name);
        } else {
          histogramInfo.rownos[params.dataIndex].forEach((item) => {
            this.selectedRows.forEach((data,idx) => {
              if(data === item) {
                this.selectedRows.splice(idx,1);
              }
            })
          });
          this.rowClickHandler(this.selectedRows);
          this.clickedSeries[index].splice(idx,1);
        }
        options = this.getDefaultChartOption(histogramInfo,index);
        this.applyChart(chart,options)
      }
    })
  }

  /**
   * Trigger click event on row
   * @param selectedRows
   */
  public rowClickHandler(selectedRows) {
    this.gridComponent.rowSelection(selectedRows);
    this.moveScrollVertically(_.min(selectedRows));
  }

  /**
   * Unselect all rows
   */
  public gridRowAllUnselect() {
    this.gridComponent.rowAllUnSelection();
    this.selectedRows = [];
  }

  /**
   * Removes unnecessary single quotation from string
   * @param rule rule sent to server
   */
  public removeQuotes(rule) {

    if(rule.command === 'aggregate' || rule.command === 'pivot' && rule.value) {
      let list = rule.value.split(',');
      list.forEach((item,idx) => {
        if(item.startsWith('\'') && item.endsWith('\'')) {
          this.pivotFormulaValueList[idx] = item.substring(1,item.length -1);
        }
      });
    }

    let tempList = ['idx', 'on', 'with', 'as', 'value', 'timestamp'];

    tempList.filter((item) => {

      if(rule[item] && rule[item].startsWith('\'') && rule[item].endsWith('\'')) {
        this.ruleVO[item] = rule[item].substring(1, rule[item].length - 1);
      }
    })
  }

  public applyRuleFromContextMenu(data) {

    if(data.more) {
      let originalSelectedDatasets = _.cloneDeep(this.selectedColumns);
      this.gridComponent.columnAllUnSelection();
      this.ruleVO.command = data.more.command;
      let index = this._findIndexWithNameInGridResponse(data.more.col);
      switch(data.more.command) {
        case 'rename':
        case 'unnest':
          this.ruleVO.col = data.more.col;
          this.gridComponent.selectColumn(this.ruleVO.col, true);
          setTimeout(() => $('[tabIndex=3]').focus());
          break;
        case 'settype':
          this.ruleVO.col = data.more.col;
          this.gridComponent.selectColumn(this.ruleVO.col, true);
          this.ruleVO.type = data.more.type;
          this.isTypeTimestamp = true;

          if (this.ruleVO.type === 'String') { // 스트링일떄는 선택된 컬럼이 타임스탬프 타입임
            this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(this._findIndexWithNameInGridResponse(this.ruleVO.col));
          } else if (this.ruleVO.type === 'Timestamp') {
            if (this._findUpperCaseColumnTypeWithIdx(index) === 'STRING') {
              this.dataflowService.getTimestampFormatSuggestions(this.selectedDataSet.dsId,  {colNames : this.selectedDataSet.gridResponse.colNames })
                .then((result) => {

                  if (result[this.ruleVO.col][0]) {
                    this.ruleVO.timestamp = result[this.ruleVO.col][0].replace(/'/g, '\\\'');
                  }
                }).catch((error) => {
                console.info(error);
              });
            } else if (this._findUpperCaseColumnTypeWithIdx(index) === 'TIMESTAMP') {
              this.ruleVO.timestamp = this._findTimestampStyleWithIdxInColDescs(index);
            }
          }
          break;
        case 'setformat':
          this.ruleVO.col = data.more.col;
          this.gridComponent.selectColumn(this.ruleVO.col, true);
          break;
        case 'move':
          this.ruleVO.col = data.more.col;
          this.gridComponent.selectColumn(this.ruleVO.col, true);
          this.ruleVO.beforeOrAfter = data.more.move;
          break;
        case 'merge':
        case 'replace':
        case 'set':
        case 'nest':
          let idx = originalSelectedDatasets.indexOf(data.more.col);
          if (idx === -1) {
            originalSelectedDatasets.push(data.more.col);
          }
          originalSelectedDatasets.forEach((item) => {
            this.gridComponent.selectColumn(item, true);
          });
          this.ruleVO.into = 'map';
          this.setDefaultValue(false);
          setTimeout(() => $('[tabIndex=3]').focus());
          break;
        case 'derive':
          this.setDefaultValue(false);
          this.selectedRows = [];
          setTimeout(() => $('[tabIndex=2]').focus());
          break;
        case 'extract':
        case 'split':
        case 'countpattern':
          this.ruleVO.col = data.more.col;
          this.gridComponent.selectColumn(this.ruleVO.col, true);
          setTimeout(() => $('[tabIndex=3]').focus());
          break;

      }

    } else {
      this.applyRule(data);
    }

  }


  public onContextMenuClick(data) {

    this.isCommandListShow = false;

    // 컨텍스트 메뉴 클릭시 헤더가 클릭 되게 변경 단, row가 선택되어있으면 컬럼 선택 안됨(전체 해제 -> 컬럼 선택)
    if (this.selectedColumns.length > 1) {
      this.gridComponent.selectColumn(data.columnName, true,null, false, data.columnType);
    } else if (0 === this.barClickedSeries[data.index].length && 0 === this.clickedSeries[data.index].length) {
      this.gridComponent.columnAllUnSelection();
      this.gridComponent.selectColumn(data.columnName, true,null, false, data.columnType);
    }

    this.currentContextMenuInfo = {
      columnType : data.columnType,
      columnName : data.columnName,
      index : data.index,
      top : data.top,
      left : data.left,
      gridResponse : _.cloneDeep(this.selectedDataSet.gridResponse)
    };

    let param : any = {} ;

    Object.keys(this.clickedSeries).forEach((key,index) => {
      if(this.clickedSeries[key].length >= 1 && index === data.index) {
        param = {
          clickable : true,
          values : this.clickedSeries[key]
        }
      }
    });

    Object.keys(this.barClickedSeries).forEach((key,index) => {
      if(this.barClickedSeries[key].length >= 1 && index === data.index) {
        param = {
          clickable : true,
          values : this.barClickedSeries[key],
          isColumnSelect : true
        }
      }
    });

    if(param.clickable) {
      param['labels'] = this.selectedDataSet.gridResponse.colHists[data.index].labels;
    }

    this.contextMenuComp.openContextMenu(this.currentContextMenuInfo,this.selectedColumns, param);
  }

  /**
   * Set header menu
   * @param field
   * @return headerMenu
   */
  public getHeaderMenu (field) : HeaderMenu {

    let headerMenu = new HeaderMenu();
    headerMenu.buttons = [{cssClass : 'slick-header-menubutton', command :field.name, index: field.seq, type : field.type
    }];
    return headerMenu;

  }

  /**
   * Simplify Rule List
   * @param rule
   * @param ruleString
   */
  public simplifyRule(rule : any , ruleString? : string) {

    let result : string;
    let column : string;

    if (rule.col) {
      if ('string' === typeof rule.col) {
        column = rule.col;
      } else if ('string' === typeof rule.col.value) {
        column = rule.col.value;
      } else if (rule.col.value.length === 2 ) {
        column = rule.col.value.join(', ');
      } else {
        column = `${rule.col.value.length} columns`;
      }
    }

    switch(rule.command) {
      case 'create':
        result = `Create with DS ${rule.with}`;
        break;
      case 'header':
        result = `Convert row${rule.rownum} to header`;
        break;
      case 'keep':
        let row = ruleString.split(": ");
        result = `Keep rows where ` + row[1];
        break;
      case 'rename':

        let toString : string = '';
        if ('string' === typeof rule.to.value) {
          toString = ` to '${rule.to['escapedValue']}'`;
        } else if ( rule.to.value.length === 2 ) {
          toString = ` to ${rule.to['value'].join(', ')}`;
        }
        result = `Rename ${column}${toString}`;
        break;
      case 'nest' :
        result = `Convert ${column} into ${rule.into}`;
        break;
      case 'unnest' :
        result = `Create new columns from ${column}`;
        break;
      case 'setformat':
        let fomatStr : string;
        if ('string' === typeof rule.col.value) {
          fomatStr = `${column} type`
        } else if ( rule.col.value.length === 2 ) {
          fomatStr = `${column} types`;
        } else {
          fomatStr = column;
        }
        result = `Set ${fomatStr} format to ${ rule.format }`;
        break;
      case 'settype':

        let columnStr : string;
        if ('string' === typeof rule.col.value) {
          columnStr = `${column} type`
        } else if ( rule.col.value.length === 2 ) {
          columnStr = `${column} types`;
        } else {
          columnStr = column;
        }

        result = `Change ${columnStr} to ${ rule.type }`;

        break;
      case 'delete':
        const deleteCondition = ruleString.split('row: ');
        result = `Delete rows where ${deleteCondition[1]}`;
        break;
      case 'set':
        let rowString = ruleString.split("value: ");
        result = `Set ${column} to ${rowString[1]}`;
        break;
      case 'split':
        result = `Split ${rule.col} into ${rule.limit+1 > 1 ? rule.limit+1 + ' columns' : rule.limit+1 +' column'} on ${rule.on.value}`;
        break;
      case 'extract':
        result = `Extract ${rule.on.value} ${rule.limit > 1 ? rule.limit + ' times' : rule.limit+' time'} from ${rule.col}`;
        break;
      case 'flatten':
        result = `Convert arrays in ${rule.col} to rows`;
        break;
      case 'countpattern':
        result = `Count occurrences of ${rule.on.value} in ${column}`;
        break;
      case 'sort':
        if ('string' === typeof rule.order.value) {
          result = `Sort row by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-'+rule.order.value : rule.order.value}`;
          break;
        } else {
          result = `Sort rows by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-'+rule.order.value.toString() : rule.order.value.toString()}`;
          break;
        }
      case 'replace':
        result = `Replace ${rule.on.value} from `;
        if('string' === typeof rule.col.value) {
          result += `${rule.col.value} with ${rule.with['value']}`;
        } else if(rule.col.value.length === 2) {
          result += `${rule.col.value.join(', ')} with ${rule.with['value']}`;
        } else {
          result += column;
        }
        break;
      case 'merge':
        result = `Concatenate ${column} separated by ${rule.with}`;
        break;
      case 'aggregate':
        result = `Aggregate with ${rule.value.escapedValue ? rule.value.escapedValue : rule.value.value.length + ' functions'} grouped by `;
        if ('string' === typeof rule.group.value) {
          result += `${rule.group.value}`
        } else if ( rule.group.value.length === 2 ) {
          result += `${rule.group.value.join(', ')}`
        } else {
          result += `${rule.group.value.length} columns`
        }
        break;
      case 'move':
        result = `Move ${column}`;
        result += `${rule.before ? ' before ' + rule.before : ' after ' + rule.after }`;
        break;
      case 'union':
      case 'join':
        result = `${rule.command} with `;

        let datasetIds = [];
        if ( rule.dataset2.escapedValue ) {
          datasetIds = [rule.dataset2.escapedValue]
        } else {
          rule.dataset2.value.forEach((item) => {
            datasetIds.push(item.substring(1,item.length -1))
          })
        }

        if (datasetIds.length === 1) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}`;
        } else if (datasetIds.length === 2) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}, ${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[1]]}`;
        } else {
          result += `${datasetIds.length} datasets`;
        }

        break;
      case 'derive':
        let deriveCondition = ruleString.split('value: ');
        deriveCondition = deriveCondition[1].split(' as: ');
        result = `Create ${rule.as} from ${deriveCondition[0]}`;
        break;
      case 'pivot':
        let formula = '';
        if(rule.value.escapedValue) {
          formula = rule.value.escapedValue
        } else {
          let list = [];
          rule.value.value.forEach((item) =>{
            list.push(item.substring(1,item.length -1));
          });
          formula = list.toString();
        }
        result = `Pivot ${column} and compute ${formula} grouped by`;

        if ('string' === typeof rule.group.value || rule.group.value.length === 2) {
          result += ` ${rule.group.value}`;
        } else {
          result += ` ${rule.group.value.length} columns`;
        }
        break;
      case 'unpivot':
        result = `Convert `;
        if ('string' === typeof rule.col.value) {
          result += `${rule.col.value} into row`;
        } else if(rule.col.value.length > 1) {
          result += `${column} into rows`;
        }
        break;
      case 'drop':
        result = `Drop ${column}`;
        break;

    }
    return result
  }

  /**
   * Multicolumn rename popup open
   */
  public onMulticolumnRenameClick() {

    if(this.modeType === 'UPDATE') {
      this.multicolumnRenameComponent.init({data : _.cloneDeep(this.selectedDataSet.gridData), datasetName : this.selectedDataSet.dsName, ruleCurIdx : this.ruleVO['ruleNo'], cols : this.ruleVO.cols, to : [this.ruleVO.to]});
    } else {
      this.multicolumnRenameComponent.init({data : _.cloneDeep(this.selectedDataSet.gridData), datasetName : this.selectedDataSet.dsName});
    }
  }

  /**
   * Find smallest index
   * @param list
   * @return smallest Index
   */
  public findSmallestIndex(list) : number {
    let indexList = [];
    let result = -1;
    if (typeof list === 'object') {
      list.forEach((item) => {
        indexList.push(this.selectedDataSet.gridResponse.colNames.indexOf(item));
      });
      result = _.min(indexList)
    } else {
      result = this.selectedDataSet.gridResponse.colNames.indexOf(list);
    }
    return result
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 큰 숫자 축약 문자 사용
   * @param {number} from
   * @param {number} to
   * @return string
   */
  private _getAbbrNumberRange(from : number, to : number) : string {

    // TODO : Negative numbers

    let returnVal : string;
    let fromReversedList = from.toString().split('').reverse();
    let toReversedList = to.toString().split('').reverse();

    let idx;
    if (from == 0) {
      idx = this._findUnitIdx(toReversedList);
    } else {
      idx = Math.min(this._findUnitIdx(fromReversedList), this._findUnitIdx(toReversedList));
    }

    if (-1 === idx || Math.floor(idx/3) === 0) {
      returnVal = `${from} ~ ${to}`;
    } else {
      returnVal = `${ from == 0 ? 0 : this._getAbbrNumber(fromReversedList, idx) } ~ ${this._getAbbrNumber(toReversedList, idx)}`;
    }

    return returnVal;
  } // function - _abbrNum


  /**
   * 축약된 숫자를 얻어온다 eg) 15K
   * @param numberList
   * @param idx
   * @return {string}
   * @private
   */
  private _getAbbrNumber(numberList, idx) : string {
    const abbrLetters : any = ['K','M','B','T'];
    numberList.splice(0,Math.floor(idx/3) * 3);
    return numberList.reverse().join('') + abbrLetters[Math.floor(idx/3)-1];
  }

  /**
   * List에서 가장 처음 0 이 아닌 숫자의 index를 찾는다
   * @param list
   * @return {number}
   * @private
   */
  private _findUnitIdx(list : any) : number {

    return list.findIndex((item) => {
      return item !== '0'
    });

  }


  /**
   * Close selecbox or popup with esc
   */
  @HostListener('document:keydown.escape', ['$event'])
  private onKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 27) {

      this.isColumnListShow ? this.isColumnListShow = false : null;
      this.isTypeListShow ? this.isTypeListShow = false : null;
      this.isMultiColumnListShow ? this.isMultiColumnListShow = false : null;
      this.isBeforeOrAfterShow ? this.isBeforeOrAfterShow = false : null;
      this.isBeforeOrAfterColumnListShow ? this.isBeforeOrAfterColumnListShow = false : null;
      this.isNestListShow ? this.isNestListShow = false : null;
      this.isCommandListShow ? this.isCommandListShow = false : null;

      if(this.isRuleUnionModalShow){
        this.isRuleUnionModalShow = false;
        this.ruleVO.command = '';
      }
      if(this.isRuleJoinModalShow){
        this.isRuleJoinModalShow = false;
        this.ruleVO.command = '';
      }

      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestion_inputId = '';
      this.autoCompleteSuggestions = [];
      this.autoCompleteSuggestions_selectedIdx=-2;
    }
  }

  /**
   * apply rule with enter key
   */
  @HostListener('document:keydown.enter', ['$event'])
  private onEnterKeydownHandler(event: KeyboardEvent) {
    // enter key only works when there is not popup or selectbox opened

    let hasFocus = $('#gridSearch').is(':focus');

    if(event.keyCode === 13) {
      if (!this.isColumnListShow && !this.isTypeListShow && !this.isMultiColumnListShow
        && !this.createSnapshotPopup.isShow
        && !this.isBeforeOrAfterShow
        && !this.isBeforeOrAfterColumnListShow && !this.isNestListShow && !this.isCommandListShow && !this.isTimestampOpen
        && !this.isRuleUnionModalShow && !this.isRuleJoinModalShow && this.step !== 'create-snapshot' && !hasFocus
        && this.autoCompleteSuggestions_selectedIdx==-1 ) {
        this.addRule();
      }
    }
  }

  private getGridDataFromGridResponse(gridResponse: any) {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for(let idx=0;idx<colCnt;idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for (let idx = 0; idx < colCnt; idx++) {
        // if (colTypes[idx].type === 'STRING') {
        //   let re = /\s/gi;
        //   let tag = '<span style="color:red; font-size: 9pt; letter-spacing: 0px">'+this.spaceSymbol+'</span>';
        //   let strCol = row.objCols[idx];
        //   obj[colNames[idx]] = ( strCol ) ? strCol.toString().replace(re, tag) : strCol;
        // } else {
        //   obj[colNames[idx]] = row.objCols[idx];
        // }
        obj[colNames[idx]] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse

  /**
   * Change gridResponse
   * @param data (this.selectedDataSet.gridResponse)
   */
  private setGridData(data: any) {

    data.colNames.forEach((item,index) => {
      this.clickedSeries[index] = [];
      this.barClickedSeries[index] = [];
    });

    this.selectedDataSet.gridData = this.getGridDataFromGridResponse(data);

  } // function - setGridData

  /**
   * Set rule list
   */
  private setRuleList(rules: any) {
    this.ruleList = [];
    const commandNames = this.commandList.map((command) => {
      return command.command;
    });

    // ruleStringInfos
    rules.forEach((rule) => {
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      const idx = commandNames.indexOf(rule['ruleVO'].name);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;
      }
      rule['simplifiedRule'] = this.simplifyRule(rule['ruleVO'], rule.ruleString);
      this.ruleList.push(rule);
    });
  }


  private initViewPage() {
    this.commandList = [
      { command: 'header', alias: 'He', desc: this.translateService.instant('msg.dp.li.he.description'), isHover:false },
      { command: 'keep', alias: 'Ke', desc: this.translateService.instant('msg.dp.li.ke.description'), isHover:false },
      { command: 'replace', alias: 'Rp', desc: this.translateService.instant('msg.dp.li.rp.description'), isHover:false },
      { command: 'rename', alias: 'Rn', desc: this.translateService.instant('msg.dp.li.rn.description'), isHover:false },
      { command: 'set', alias: 'Se', desc: this.translateService.instant('msg.dp.li.se.description'), isHover:false },
      { command: 'settype', alias: 'St', desc: this.translateService.instant('msg.dp.li.st.description'), isHover:false },
      { command: 'countpattern', alias: 'Co', desc: this.translateService.instant('msg.dp.li.co.description'), isHover:false },
      { command: 'split', alias: 'Sp', desc: this.translateService.instant('msg.dp.li.sp.description'), isHover:false },
      { command: 'derive', alias: 'Dr', desc: this.translateService.instant('msg.dp.li.dr.description'), isHover:false },
      { command: 'delete', alias: 'De', desc: this.translateService.instant('msg.dp.li.de.description'), isHover:false },
      { command: 'drop', alias: 'Dp', desc: this.translateService.instant('msg.dp.li.dp.description'), isHover:false },
      { command: 'pivot', alias: 'Pv', desc: this.translateService.instant('msg.dp.li.pv.description'), isHover:false },
      { command: 'unpivot', alias: 'Up', desc: this.translateService.instant('msg.dp.li.up.description'), isHover:false },
      { command: 'join', alias: 'Jo', desc: this.translateService.instant('msg.dp.li.jo.description'), isHover:false },
      { command: 'extract', alias: 'Ex', desc: this.translateService.instant('msg.dp.li.ex.description'), isHover:false },
      { command: 'flatten', alias: 'Fl', desc: this.translateService.instant('msg.dp.li.fl.description'), isHover:false },
      { command: 'merge', alias: 'Me', desc: this.translateService.instant('msg.dp.li.me.description'), isHover:false },
      { command: 'nest', alias: 'Ne', desc: this.translateService.instant('msg.dp.li.ne.description'), isHover:false },
      { command: 'unnest', alias: 'Un', desc: this.translateService.instant('msg.dp.li.un.description'), isHover:false  },
      { command: 'aggregate', alias: 'Ag', desc: this.translateService.instant('msg.dp.li.ag.description'), isHover:false },
      { command: 'sort', alias: 'So', desc: this.translateService.instant('msg.dp.li.so.description'), isHover:false },
      { command: 'move', alias: 'Mv', desc: this.translateService.instant('msg.dp.li.mv.description'), isHover:false },
      { command: 'union', alias: 'Ui', desc: this.translateService.instant('msg.dp.li.ui.description'), isHover:false },
      { command: 'setformat', alias: 'Sf', desc: 'set timestamp type .... ', isHover:false }

    ];

    this.typeList = [
      {type:'long', name :'Long', isHover : false},
      {type:'double', name :'Double', isHover : false},
      {type:'string', name :'String', isHover : false},
      {type:'boolean', name :'Boolean', isHover : false},
      {type:'timestamp', name :'Timestamp', isHover : false}
    ];

    this.timestampTime = [
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSZZ', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSZZ', isHover : false},
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSZ', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSZ', isHover : false},
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSz', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ss.SSSz', isHover : false},
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ssZZ', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ssZZ', isHover : false},
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ssZ', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ssZ', isHover : false},
      {type:'yyyy-MM-dd\\\'T\\\'HH:mm:ssz', name :'yyyy-MM-dd\\\'T\\\'HH:mm:ssz', isHover : false},
      {type:'yyyy-MM-dd HH:mm:ss.SSS', name :'yyyy-MM-dd HH:mm:ss.SSS', isHover : false},
      {type:'yyyy-MM-dd HH:mm:ss', name :'yyyy-MM-dd HH:mm:ss', isHover : false},
      {type:'MM-dd-yyyy HH:mm:ss.SSS', name :'MM-dd-yyyy HH:mm:ss.SSS', isHover : false},
      {type:'MM-dd-yyyy HH:mm:ss', name :'MM-dd-yyyy HH:mm:ss', isHover : false},
      {type:'dd-MM-yyyy HH:mm:ss.SSS', name :'dd-MM-yyyy HH:mm:ss.SSS', isHover : false},
      {type:'dd-MM-yyyy HH:mm:ss', name :'dd-MM-yyyy HH:mm:ss', isHover : false},
      {type:'yyyy-MMM-dd', name :'yyyy-MMM-dd', isHover : false},
      {type:'yyyy-MM-dd', name :'yyyy-MM-dd', isHover : false},
      {type:'yy-MMM-dd', name :'yy-MMM-dd', isHover : false},
      {type:'yy-MM-dd', name :'yy-MM-dd', isHover : false},
      {type:'MMM-dd-yyyy', name :'MMM-dd-yyyy', isHover : false},
      {type:'MM-dd-yyyy', name :'MM-dd-yyyy', isHover : false},
      {type:'MMM-dd-yy', name :'MMM-dd-yy', isHover : false},
      {type:'MM-dd-yy', name :'MM-dd-yy', isHover : false},
      {type:'dd-MMM-yyyy', name :'dd-MMM-yyyy', isHover : false},
      {type:'dd-MM-yyyy', name :'dd-MM-yyyy', isHover : false},
      {type:'dd-MMM-yy', name :'dd-MMM-yy', isHover : false},
      {type:'dd-MM-yy', name :'dd-MM-yy', isHover : false},
      {type:'MMM-dd', name :'MMM-dd', isHover : false},
      {type:'MM-dd', name :'MM-dd', isHover : false},
      {type:'dd-MMM', name :'dd-MMM', isHover : false},
      {type:'dd-MM', name :'dd-MM', isHover : false},
      {type:'HH:mm:ss.sss', name :'HH:mm:ss.sss', isHover : false},
      {type:'HH:mm:ss', name :'HH:mm:ss', isHover : false},
      {type:'Custom format', name :'Custom format', isHover : false},
    ];

    this.nestList = [
      {type:'map', name :'map', isHover : false},
      {type:'array', name :'array', isHover : false},
    ];

    this.moveList = [
      {type:'before', name:'before', isHover : false},
      {type:'after', name:'after', isHover : false}
    ];

    this.sortList = [
      {type:'', name :'asc', isHover : false},
      {type:'desc', name :'desc', selected : false}
    ];

    // 룰 셋팅
    if (this.selectedDataSet.rules && this.selectedDataSet.rules.length > 0) {
      this.setRuleList(this.selectedDataSet.rules);
    }


    // init ruleVO
    this.ruleVO.command = '';

    // pivot formular input box 하나부터 시작
    this.pivotFormulaList.push('');

  }

  /**
   * Grid information (on the top right corner)
   */
  private headerInformation() {

    // init type list
    this.pivotGridTypeList = [];

    if (!isUndefined(this.selectedDataSet.gridData.data.length)) {
      this.pivotGridTotalRow = this.selectedDataSet.gridData.data.length;
    }
    if (!isUndefined(this.selectedDataSet.gridData.fields)) {
      this.pivoteGridColumn = this.selectedDataSet.gridData.fields.length;
    }

    const tempMap: Map<string, number> = new Map();
    this.selectedDataSet.gridData.fields.forEach((item) => {
      if (tempMap.get(item.type) > -1) {
        const temp = tempMap.get(item.type) + 1;
        tempMap.set(item.type, temp);
      } else {
        tempMap.set(item.type, 1);
      }
    });
    this.pivotGridTypeNumber = tempMap.size;

    tempMap.forEach((value: number, key: string) => {
      this.pivotGridTypeList.push(key + ' : ' + value + ' ' + this.translateService.instant('msg.comm.detail.rows'));
    });

  } // function - headerInformation

  /**
   * apply rule
   * @rule Rule
   * @msg translate key
   * @isUndo
   */
  private applyRule(rule: object, msg?: string, isUndo?: boolean) {

    this.searchText = '';
    let command = rule['command'];

    const slickViewPort = $('app-edit-dataflow-rule .slick-viewport');
    const $viewPort : any = slickViewPort[0];
    const t = $viewPort.scrollTop;
    const l = $viewPort.scrollLeft;

    this.loadingShow();
    this.dataflowService.applyRules(this.selectedDataSet.dsId, rule)
      .then((data) => {
        if (data.errorMsg) {
          Alert.warning(this.translateService.instant(msg ? msg : 'msg.dp.alert.apply.rule.fail'));
        } else {

          // TODO : refresh here ?
          this.selectedRows = [];
          this.selectedDataSet.gridResponse = data.gridResponse;
          this.selectedDataSet.ruleCurIdx = data.ruleCurIdx;
          this.selectedDataSet.ruleStringInfos = data['ruleStringInfos'];
          this.isJumped = false;
          if(command === 'multipleRename') {
            this.multicolumnRenameComponent.showFlag = false;
          }
          if (!isNull(this.gridComponent.grid) && this.selectedColumns.length > 0) {
            this.gridComponent.columnAllUnSelection();
            this.selectedColumns = [];
            this.editColumnList = [];
          }
          // grid refresh
          this.setGridData(this.selectedDataSet.gridResponse);

          this.setColumnWidthInfo(this.selectedDataSet.gridData);

          this.getHistogramInfoByWidths(this.columnWidths);

          this.setRuleList(data['ruleStringInfos']);

          this.initRule(data);

          if (command !== 'join' && command !== 'derive' && command !== 'aggregate' && command !== 'move') {
            const $viewport = $('app-edit-dataflow-rule .slick-viewport');
            $viewport.scrollTop(t);
            $viewport.scrollLeft(l);
          }
          // 계속 클릭하는거 방지ser
          if (isUndo && this.isUndoRunning) {
            this.isUndoRunning = false;
          } else if (!isUndo && this.isRedoRunning) {
            this.isRedoRunning = false;
          }
        }

        this.changeDetect.detectChanges();

        this.loadingHide();

      })
      .catch((error) => {
        this.loadingHide();

        // If error, remove single quotes from input
        this.removeQuotes(this.ruleVO);

        if (isNull(error)) {
          return;
        }

        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

        if(prep_error.code && prep_error.code.startsWith("PR")) {
        } else if (1 < this.inputRuleCmd.length) {
          Alert.warning(this.translateService.instant('msg.dp.alert.command.error'));
        } else {
          Alert.error(this.translateService.instant('msg.dp.alert.unknown.error'));
        }
      });

  }

  /**
   * Create rule string
   * @param cols (edit mode ? this.editColumnList : this.selectedDataSet.gridResponse['interestedColNames'])
   * @param ruleString (this.selectedDataSet.ruleStringInfos[currentIndex])
   */
  private setAffectedColumns(cols : any, ruleString : any ) {
    switch(ruleString.command) {
      case 'derive' :
        this.gridComponent.grid.scrollCellIntoView(0,this.findSmallestIndex(cols[0])+1);
        this.gridComponent.selectColumn(cols[0], true);
        break;
      case 'aggregate' :
      case 'unpivot' :
      case 'pivot' :
      case 'drop' :
      case 'rename' :
      case 'sort' :
      case 'nest' :
      case 'merge' :
      case 'split' :
      case 'unnest' :
      case 'extract' :
      case 'countpattern' :
      case 'replace' :
      case 'settype' :
      case 'flatten' :
      case 'set' :
      case 'move' :
      case 'join' :
      case 'setformat':
        cols.forEach((item) => {
          this.gridComponent.selectColumn(item, true);
        });
        this.gridComponent.grid.scrollCellIntoView(0,this.findSmallestIndex(cols)+1);
        break;
    }
  }

  /**
   * Create rule string
   * @param rule
   */
  private makeRuleResult(rule: Rule) {
    let result = '';
    if(rule.cols) {
      rule.col = rule.cols.join(',')
    }
    switch (rule.command) {
      case 'header':
        result = 'header rownum: ' + rule.rownum;
        break;
      case 'keep':
        result = 'keep row: ' + rule.row;
        break;
      case 'replace':
        result = 'replace col: ' + rule.col + ' with: ' + rule.with + ' on: ' + rule.on + ' global: ' + rule.global + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'rename':
        result = 'rename col: ' + rule.col + ' to: ' + rule.to;
        break;
      case 'set':
        result = 'set col: ' + rule.col + ' value: ' + rule.value;
        break;
      case 'settype' :
        result = 'settype col: ' + rule.col + ' type: ' + rule.type;
        if(rule.timestamp) {
          result += ' format: ' + rule.timestamp;
        }
        break;
      case 'setformat':
        result = 'setformat col: ' + rule.col + ' format: ' + rule.timestamp;
        break;
      case 'countpattern':
        result = 'countpattern col: ' + rule.col + ' on: ' + rule.on + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'split':
        result = 'split col: ' + rule.col + ' on: ' + rule.on + ' limit: ' + rule.limit + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'derive':
        result = 'derive value: ' + rule['value'] + ' as: ' + rule['as'];
        break;
      case 'delete':
        result = 'delete row: ' + rule['row'];
        break;
      case 'drop':
        result = 'drop col: ' + rule['col'];
        break;
      case 'extract':
        result = 'extract col: ' + rule.col + ' on: ' + rule.on + ' limit: ' + rule.limit + ' ignoreCase: ' + rule.ignoreCase;
        break;
      case 'flatten':
        result = 'flatten col: ' + rule['col'];
        break;
      case 'merge':
        result = 'merge col: ' + rule['col'] + ' with: ' + rule['with'] + ' as: ' + rule['as'];
        break;
      case 'aggregate':
        if(rule['value'] && rule.value['escapedValue']) {
          rule.value = rule.value['escapedValue']
        }
        result = 'aggregate value: ' + rule['value'] + ' group: ' + rule['col'];
        break;
      case 'splitrows':
        result = 'splitrows col: ' + rule['col'] + ' on: ' + rule['on'];
        if (!isUndefined(rule['quote'])) {
          result += ' quote: ' + rule['quote'];
        }
        break;
      case 'sort':
        let col = '';
        rule['col'] ? col = rule['col'] : col = rule['order'].value;
        result = 'sort order: ' + col;

        if (rule['type'] && rule['type'].escapedValue) {
          result = result + ' type:\''+ rule['type'].escapedValue + '\'';
        }

        if (this.ruleVO.type === 'desc') {
          result = result + ' type:\'desc\'';
        }
        break;
      case 'move':
        result = 'move col: ' + rule['col'];
        if (this.ruleVO['beforeOrAfter'] === 'before') {
          result += ' before: ' + rule['colForMove'];
        } else {
          result += ' after: ' + rule['colForMove'];
        }
        break;
      case 'pivot':
        if(rule['value'] && rule.value['escapedValue']) {
          rule.value = rule.value['escapedValue']
        }
        if(rule['groups']) {
          rule['group'] = rule['groups'].join(',');
        } else if(rule['group']['escapedValue']) {
          rule['group'] = rule['group']['escapedValue'];
        }
        result = 'pivot col: ' + rule['col'] + ' value: ' + rule['value'] + ' group: ' + rule['group'];
        break;
      case 'unpivot':
        result = 'unpivot col: ' + rule['col'] + ' groupEvery: ' + rule['groupEvery'];
        break;
      case 'nest':
        result = 'nest col: ' + rule['col'] + ' into: ' + rule['into'] + ' as: ' + rule['as'];
        break;
      case 'unnest':
        result = 'unnest col: ' + rule['col'] + ' into: ' + rule['into'] + ' idx: ' + rule['idx'];
        break;
      default :
        break;
    }
    if (rule.command === 'replace' || rule.command === 'extract' || rule.command === 'countpattern' || rule.command === 'split') {
      if (rule.quote && '' !== rule.quote.trim() && "''" !== rule.quote.trim()) {
        result += ' quote: ' + rule.quote;
      }
    }

    if (rule.command === 'replace' || rule.command === 'set') {
      if (rule.row && '' !== rule.row.trim() && "''" !== rule.row.trim()) {
        result += ' row: ' + rule.row;
      }
    }

    return result;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Set return value for each rule .. 22 rules..
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private setHeaderRule() : any {
    if (isUndefined(this.ruleVO['rownum']) || isNaN(this.ruleVO['rownum'])) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.row'));
      return;
    }

    if (0 == this.ruleVO['rownum'] || this.ruleVO['rownum'] > this.selectedDataSet.gridData.data.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.out.of.range'));
      return;
    }

    return {
      command: this.ruleVO['command'],
      rownum: this.ruleVO['rownum'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setKeepRule() : any {
    if (isUndefined(this.ruleVO['row']) || '' === this.ruleVO['row'] || "''" === this.ruleVO['row']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.keep.warn'));
      return;
    }
    // 다음 조건에서만 수행
    if (!isUndefined(this.ruleVO.row) && '' !== this.ruleVO.row.trim() && "''" !== this.ruleVO.row.trim()) {
      let check = StringUtil.checkSingleQuote(this.ruleVO.row, {isPairQuote : true});
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return;
      } else {
        this.ruleVO.row = check[1];
      }
    }

    return {
      command: this.ruleVO['command'],
      row: this.ruleVO['row'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setReplaceRule() : any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // 패턴
    if (isUndefined(this.ruleVO.on) || '' === this.ruleVO.on || this.ruleVO.on === '//' ||  this.ruleVO.on=== '\'\'') {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return;
    }

    if (isUndefined(this.validateSingleQuoteForPattern(this.ruleVO.on))) {
      Alert.warning(this.translateService.instant('msg.dp.alert.pattern.error'));
      return;
    } else {
      this.ruleVO.on = this.validateSingleQuoteForPattern(this.ruleVO.on);
    }

    // 다음 문자 사이 무시
    if (this.ruleVO.quote && '' !== this.ruleVO.quote.trim() && "''" !== this.ruleVO.quote.trim()) {
      const quote = StringUtil.checkSingleQuote(this.ruleVO.quote.trim(),{isWrapQuote:true});
      if (quote[0] === false) {
        Alert.warning('Check value of ignore between characters');
        return
      } else {
        this.ruleVO.quote = quote[1];
      }
    }

    if (!isUndefined(this.ruleVO.with)) {
      let withVal = StringUtil.checkSingleQuote(this.ruleVO.with,{isPairQuote : true, isWrapQuote : true});
      if (withVal[0] === false) {
        Alert.warning('Check new value');
        return
      } else {
        this.ruleVO.with = withVal[1];
      }
    } else {
      this.ruleVO.with = '\'\'';
    }


    // 다음 조건에서만 수행
    if (!isUndefined(this.ruleVO.row) && '' !== this.ruleVO.row.trim() && "''" !== this.ruleVO.row.trim()) {
      // let check = StringUtil.checkFormula(this.ruleVO.row);
      // if (check === false) {
      //   Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
      //   return;
      // }
      let check = StringUtil.checkSingleQuote(this.ruleVO.row,{isPairQuote:true});
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return;
      }
    }

    let ruleString = this.makeRuleResult(this.ruleVO);
    return {ruleString: ruleString}

  }

  private setRenameRule() : any {

    if (isUndefined(this.ruleVO['col']) || '' === this.ruleVO['col']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    if (isUndefined(this.ruleVO['to']) || '' === this.ruleVO['to']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return;
    }

    if(this.selectedDataSet.gridResponse.colNames.indexOf(this.ruleVO.to) > -1 && this.selectedDataSet.gridResponse.colNames.indexOf(this.ruleVO.to) !== this.selectedDataSet.gridResponse.colNames.indexOf(this.ruleVO.col)) {
      Alert.warning('Column name already in use.');
      return;
    }

    let check = StringUtil.checkSingleQuote(this.ruleVO.to, {isAllowBlank:false, isWrapQuote:true});
    if (check[0] === false) {
      Alert.warning('Special characters are not allowed');
      return;
    } else {
      const renameReg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if(!renameReg.test(check[1])) {
        if(check[1].indexOf(' ') > -1) {
          check[1] = check[1].replace(' ', '_');
        }
      }
      this.ruleVO.to = check[1];
    }

    return {
      command: this.ruleVO['command'],
      to: this.ruleVO['to'],
      col: this.ruleVO['col'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setSetRule() : any {
    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // Value
    if (isUndefined(this.ruleVO.value) || '' === this.ruleVO.value.trim()) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return;
    }
    if (!isUndefined(this.ruleVO.value)) {
      let check = StringUtil.checkSingleQuote(this.ruleVO.value,{isPairQuote:true});
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.value'));
        return;
      } else{
        this.ruleVO.value = check[1];
      }
    }

    // 다음 조건에서만 수행
    if (!isUndefined(this.ruleVO.row) && '' !== this.ruleVO.row.trim() && "''" !== this.ruleVO.row.trim()) {
      // let check = StringUtil.checkFormula(this.ruleVO.row);
      // if (check === false) {
      //   Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
      //   return;
      // }
      let check = StringUtil.checkSingleQuote(this.ruleVO.row,{isPairQuote:true});
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return;
      }
    }
    return {
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  } // function - setSetRule


  /**
   * 타임스탬프 값에 '로 감싼다
   * @param {string} value
   * @return {boolean}
   * @private
   */
  private _surroundQuoteOnTimestamp(value : string) : boolean {
    let check = StringUtil.checkSingleQuote(value, {isPairQuote : false, isWrapQuote:true } );
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
      return false;
    } else{
      this.ruleVO.timestamp = check[1];
      return true;
    }
  } // - _surroundQuoteOnTimestamp

  private setSetformatRule() {
    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    if (this.ruleVO.timestamp !== '' || !isUndefined(this.ruleVO.timestamp)) {

      if (! this._surroundQuoteOnTimestamp(this.ruleVO.timestamp === 'Custom format' ? this.timestampVal : this.ruleVO.timestamp) ) {
        return ;
      }
    }
    return {
      command: this.ruleVO.command,
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  }

  private setSettypeRule() : any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // 타임스템프
    if (this.isTypeTimestamp) {
      if ('Timestamp' === this.ruleVO.type) {

        if (! this._surroundQuoteOnTimestamp(this.ruleVO.timestamp === 'Custom format' ? this.timestampVal : this.ruleVO.timestamp) ) {
          return ;
        }

      } else if('String' === this.ruleVO.type) {

        if (this.ruleVO.timestamp === '' || isUndefined(this.ruleVO.timestamp) || (this.ruleVO.timestamp === 'Custom format' && this.timestampVal === '')) {

          this.ruleVO.timestamp = ''

        } else if ( (this.ruleVO.timestamp !== 'Custom format' && this.timestampVal === '') || (this.ruleVO.timestamp === 'Custom format' && this.timestampVal !== '') ) {

          if (! this._surroundQuoteOnTimestamp(this.timestampVal !== ''  ? this.timestampVal : this.ruleVO.timestamp) ) {
            return ;
          }

        }
      }
    }

    // 타입
    if (isUndefined(this.ruleVO.type) || '' === this.ruleVO.type) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.type'));
      return;
    }
    return {
      command: this.ruleVO.command,
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  } // function - setSettypeRule

  private setCountpatternRule() : any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // 패턴
    if (isUndefined(this.ruleVO.on) || '' === this.ruleVO.on) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return;
    }

    if (this.ruleVO.on === '//' ||  this.ruleVO.on=== '\'\'') {
      Alert.warning('The pattern should not be empty');
      return;
    }

    if (isUndefined(this.validateSingleQuoteForPattern(this.ruleVO.on))) {
      Alert.warning('Illegal pattern');
      return;
    } else {
      this.ruleVO.on = this.validateSingleQuoteForPattern(this.ruleVO.on);
    }

    // 다음 문자 사이 무시
    if (this.ruleVO.quote && '' !== this.ruleVO.quote.trim() && "''" !== this.ruleVO.quote.trim()) {
      const quote = StringUtil.checkSingleQuote(this.ruleVO.quote.trim(),{isWrapQuote: true});
      if (quote[0] === false) {
        Alert.warning('Check value of ignore between characters');
        return;
      } else {
        this.ruleVO.quote = quote[1];
      }
    }

    let ruleString = this.makeRuleResult(this.ruleVO);
    return {ruleString : ruleString };
  }

  private validateSingleQuoteForPattern(on) {
    let pattern = StringUtil.checkSingleQuote(on,{isWrapQuote : !StringUtil.checkRegExp(on)});
    if (pattern[0] === false) {
      return;
    } else {
      return pattern[1]
    }

  }

  private setDeriveRule() : any {
    if (isUndefined(this.ruleVO['value']) || '' === this.ruleVO['value']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return;
    }
    if (!isUndefined(this.ruleVO.value) && '' !== this.ruleVO.value.trim()) {
      let check = StringUtil.checkSingleQuote(this.ruleVO.value,{isPairQuote :true});
      if (check[0] === false) {
        Alert.warning('Check value');
      } else {
        this.ruleVO.value = check[1];
      }
    }

    if (isUndefined(this.ruleVO['as']) || '' === this.ruleVO['as']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return;
    }
    this.ruleVO['as'] = '\'' + this.ruleVO['as'].trim() + '\'';
    return {
      command: this.ruleVO['command'],
      value: this.ruleVO['value'],
      as: this.ruleVO['as'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setDeleteRule() : any {
    if (isUndefined(this.ruleVO['row']) || '' === this.ruleVO['row']) {
      Alert.warning(this.translateService.instant('msg.dp.th.condition.ph'));
      return;
    }

    if (!isUndefined(this.ruleVO.row) && '' !== this.ruleVO.row.trim()) {
      let check = StringUtil.checkSingleQuote(this.ruleVO.row,{isPairQuote :true});
      if (check[0] === false) {
        Alert.warning('Check row');
      } else {
        this.ruleVO.row = check[1];
      }
    }

    return {
      command: this.ruleVO['command'],
      row: this.ruleVO['row'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setDropRule() : any {
    if (this.ruleVO['cols'].length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    } else if (this.ruleVO['cols'].length === this.selectedDataSet.gridData.fields.length) { // at least one column must exist
      Alert.warning('Cannot delete all columns');
      return;
    }

    this.ruleVO.col = this.ruleVO['cols'].join(', ');

    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setExtractRule() : any {

    // 컬럼
    if (isUndefined(this.ruleVO['col']) || '' === this.ruleVO['col']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    // 패턴
    if (isUndefined(this.ruleVO['on']) || '' === this.ruleVO['on']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return;
    }

    if (this.ruleVO.on === '//' ||  this.ruleVO.on=== '\'\'') {
      Alert.warning('The pattern should not be empty');
      return;
    }

    if (isUndefined(this.validateSingleQuoteForPattern(this.ruleVO.on))) {
      Alert.warning('Illegal pattern');
      return;
    } else {
      this.ruleVO.on = this.validateSingleQuoteForPattern(this.ruleVO.on);
    }

    // 횟수
    if (isUndefined(this.ruleVO['limit']) || '' === this.ruleVO['limit']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.times'));
      return;
    }
    // 다음 문자 사이 무시
    if (this.ruleVO.quote && '' !== this.ruleVO.quote.trim() && "''" !== this.ruleVO.quote.trim()) {
      const quote = StringUtil.checkSingleQuote(this.ruleVO.quote.trim(),{isWrapQuote:true});
      if (quote[0] === false) {
        Alert.warning('Check value of ignore between characters');
        return;
      } else {
        this.ruleVO.quote = quote[1];
      }
    }

    let ruleString = this.makeRuleResult(this.ruleVO);
    return {ruleString: ruleString};

  }

  private setFlattenRule() : any {
    if (this.filteredUnnestList.length=== 0){
      Alert.warning('Rule flatten cannot be applies as there is no array type column.');
      return;
    }

    if (isUndefined(this.ruleVO['col']) || '' === this.ruleVO['col']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setSortRule() : any {

    if (this.ruleVO['cols'].length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    this.ruleVO.col = this.ruleVO['cols'].join(', ');

    let rule = {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };
    if (this.ruleVO.type) {
      rule['type'] = this.ruleVO.type;
    }
    return rule;

  }

  private setPivotRule() : any {

    // 컬럼
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(', ');

    // Formula
    // must enter at least one formula
    if (this.pivotFormulaValueList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return;
    }
    let checkFormula = this.pivotFormulaValueList.map((field) => {
      return StringUtil.checkSingleQuote(field,{isWrapQuote : false, isAllowBlank : false })[0];
    });
    if (checkFormula.indexOf(false) == -1) {
      this.pivotFormulaValueList = this.pivotFormulaValueList.map((field) => { // 수식 하나에 ''를 감싼다
        if(StringUtil.checkFormula(field)) {
          return '\'' + field + '\'';
        } else {
          Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
          return;
        }
      });
      this.ruleVO.value = this.pivotFormulaValueList.join(','); // 수식을 , 로 쪼인한다
    } else {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
      return;
    }

    // 그룹
    if (this.ruleVO.groups.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.groupby'));
      return;
    }
    this.ruleVO.group = this.ruleVO.groups.join(', ');

    return {
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  } // function - setPivotRule

  private setAggregateRule() : any {

    // Formula
    if (this.pivotFormulaValueList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return;
    }
    let checkFormula = this.pivotFormulaValueList.map((field) => {
      return StringUtil.checkSingleQuote(field,{isWrapQuote : false, isAllowBlank : false })[0];
    });
    if (checkFormula.indexOf(false) == -1) {
      this.pivotFormulaValueList = this.pivotFormulaValueList.map((field) => { // 수식 하나에 ''를 감싼다
        if(StringUtil.checkFormula(field)) {
          return '\'' + field + '\'';
        } else {
          Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
          return;
        }
      });
      this.ruleVO.value = this.pivotFormulaValueList.join(','); // 수식을 , 로 쪼인한다
    } else {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
      return;
    }

    // 그룹
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.groupby'));
      return;
    }
    this.ruleVO.col = this.ruleVO.cols.join(',');

    return {
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  } // function - setAggregateRule

  private setUnpivotRule() : any {
    if (this.ruleVO['cols'].length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO['cols'].join(', ');

    if (isUndefined(this.ruleVO['groupEvery']) || '' === this.ruleVO['groupEvery']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.group.every'));
      return;
    }

    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      groupEvery: this.ruleVO['groupEvery'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  }

  private setMergeRule() : any {
    if (this.ruleVO.cols.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    this.ruleVO.col = this.ruleVO.cols.join(',');

    if (isUndefined(this.ruleVO.with) || '' === this.ruleVO.with.trim()) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.delimiter'));
      return;
    }
    if (isUndefined(this.ruleVO.as) || '' === this.ruleVO.as) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return;
    }

    let check = StringUtil.checkSingleQuote(this.ruleVO.with,{isWrapQuote:true});
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.delimiter'));
      return;
    } else{
      this.ruleVO.with = check[1];
    }

    this.ruleVO.as = '\'' + this.ruleVO.as.trim() + '\'';

    return  {
      ruleString: this.makeRuleResult(this.ruleVO)
    };
  }

  private setMoveRule() : any {

    if (this.ruleVO['cols'].length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    this.ruleVO.col = this.ruleVO['cols'].join(', ');

    if (isUndefined(this.ruleVO['colForMove']) || '' === this.ruleVO['colForMove']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    if (this.ruleVO['col'] === this.ruleVO['colForMove']) {
      Alert.warning('Cannot select same column.');
      return;
    }

    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      after: this.ruleVO['colForMove'],
      before: this.ruleVO['colForMove'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  }

  private setNestRule() : any {
    if (this.ruleVO['cols'].length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    this.ruleVO.col = this.ruleVO['cols'].join(', ');

    if (isUndefined(this.ruleVO['into']) || '' === this.ruleVO['into']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.type'));
      return;
    }

    if (isUndefined(this.ruleVO['as']) || '' === this.ruleVO['as']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return;
    }

    this.ruleVO['as'] = '\'' + this.ruleVO['as'].trim() + '\'';

    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      into: this.ruleVO['into'],
      as: this.ruleVO['as'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  }

  private setUnnestRule() : any {

    if (this.filteredUnnestList.length=== 0){
      Alert.warning('Rule unnest cannot be applies as there is no array or map type column.');
      return;
    }

    if (isUndefined(this.ruleVO['col']) || '' === this.ruleVO['col']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }

    this.selectedDataSet.gridData.fields.forEach((item) => {
      if (item.name === this.ruleVO['col']) {
        this.ruleVO['into'] = item['type'].toLowerCase();
      }
    });

    if (isUndefined(this.ruleVO['idx']) || '' === this.ruleVO['idx']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.unnest.warn'));
      return;
    }
    // this.ruleVO['idx'] = '\'' + this.ruleVO['idx'] + '\'';
    let check = StringUtil.checkSingleQuote(this.ruleVO.idx,{isWrapQuote:true});
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('Check element value'));
      return;
    } else{
      this.ruleVO.idx = check[1];
    }


    return {
      command: this.ruleVO['command'],
      col: this.ruleVO['col'],
      into: this.ruleVO['into'],
      idx: this.ruleVO['idx'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };

  }

  private setSplitRowsRule() : any {
    if (isUndefined(this.ruleVO['col']) || '' === this.ruleVO['col']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return;
    }
    if (isUndefined(this.ruleVO['on']) || '' === this.ruleVO['on']) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return;
    }

    if (this.ruleVO.patternType === 'string') {
      this.ruleVO['on'] = '\'' + this.ruleVO['on'] + '\'';
    } else {
      this.ruleVO['on'] = '/' + this.ruleVO['on'] + '/';
    }

    let rule = {
      command: this.ruleVO['command'],
      on: this.ruleVO['on'],
      ruleString: this.makeRuleResult(this.ruleVO)
    };

    if (this.ruleVO.hasOwnProperty('quoteType') && this.ruleVO['quoteType'].toLowerCase() !== 'none') {
      if(this.ruleVO['quoteType'].toLowerCase() === 'single') {
        this.ruleVO.quote = '';
      } else {
        this.ruleVO.quote = '\"';
      }
      rule['quote'] = this.ruleVO['quote'];
    }

    return rule;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Set edit info for each rule .. 20 rules..
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private setRenameEditInfo(rule) {

    if(this.ruleVO.col['value'] && 'string' === typeof this.ruleVO.col['value']) {
      this.ruleVO.col = this.ruleVO.col['value'];
      this.editColumnList = [this.ruleVO.col];
      this.removeQuotation('to');
    } else {
      let tos = [];
      this.ruleVO.to['value'].forEach((item) => {
        if (item.startsWith('\'') && item.endsWith('\'')) {
          tos.push(item.substring(1, item.length - 1));
        }
      });
      let cols = _.cloneDeep(this.ruleVO.col['value']);
      this.multicolumnRenameComponent.init({data : _.cloneDeep(this.selectedDataSet.gridData), datasetName : this.selectedDataSet.dsName, ruleCurIdx : rule['ruleNo'], cols : cols, to : tos});
      // TODO : ... 지우면 안되는데..
      this.ruleVO.col = '';
      this.ruleVO.to = '';
    }
  }

  private setKeepEditInfo(rule) {
    let row = rule.ruleString.split(": ");
    this.ruleVO['row'] = row[1];
  }

  private setMergeEditInfo(rule) {

    this.removeQuotation('as');
    this.removeQuotation('with');
    this.getEditColumnList(rule['jsonRuleString'], 'col');

  }

  private setSetEditInfo(rule) {
    this.getEditColumnList(rule['jsonRuleString'], 'col');
    let rowString = rule.ruleString.split("value: ");
    rowString = rowString[1].split(" row: ");
    this.ruleVO.value = rowString[0];
    this.ruleVO.row = rowString[1];
  }

  private setSetFormatEditInfo(rule) {
    this.isTimestampEdit = true;
    this.getEditColumnList(rule['jsonRuleString'], 'col');
    let ruleString = JSON.parse(rule['jsonRuleString']);
    if (ruleString['format']) {
      let str = rule.ruleString.split('format: ');
      str = str[1].substring(1,str[1].length-1);
      let items = this.timestampTime.map((item)=> {
        return item.type;
      });
      if (items.indexOf(str) === -1) {
        this.ruleVO.timestamp = 'Custom format';
        this.timestampVal = str;
      } else {
        this.ruleVO.timestamp = str;
      }
    }
  }

  private setSettypEditInfo(rule) {
    this.getEditColumnList(rule['jsonRuleString'], 'col');

    let ruleString = JSON.parse(rule['jsonRuleString']);
    if (ruleString['format']) {
      let str = rule.ruleString.split('format: ');
      str = str[1].substring(1,str[1].length-1);
      this.isTypeTimestamp = true;
      let items = this.timestampTime.map((item)=> {
        return item.type;
      });
      if (items.indexOf(str) === -1) {
        this.ruleVO.timestamp = 'Custom format';
        this.timestampVal = str;
      } else {
        this.ruleVO.timestamp = items[items.indexOf(str)];
      }
    }

  }

  private setReplaceEditInfo(rule) {

    let jsonRuleString = JSON.parse(rule.jsonRuleString);

    if (jsonRuleString['on']['value'].startsWith('/') && jsonRuleString['on']['value'].endsWith('/')) {
      this.ruleVO.on = jsonRuleString['on']['value'];
    } else {
      this.ruleVO.on = jsonRuleString['on']['escapedValue']
    }
    this.ruleVO.quote = jsonRuleString['quote'] ? jsonRuleString['quote']['escapedValue'] : null;
    this.ruleVO.global = jsonRuleString['global'];
    this.ruleVO.ignoreCase = jsonRuleString['ignoreCase'];

    let str = rule.ruleString.split('with: ');
    str = str[1].split(' on:');
    this.ruleVO.with = str[0].substring(1, str[0].length - 1);
    // this.ruleVO.with = jsonRuleString['with']['escapedValue'];
    this.getEditColumnList(rule['jsonRuleString'], 'col');

    let row = rule['ruleString'].split('row: ');
    this.ruleVO.row = row[1]

  }

  private setCountpatternEditInfo(rule) {

    let jsonRuleString = JSON.parse(rule.jsonRuleString);
    if (jsonRuleString['on']['value'].startsWith('/') && jsonRuleString['on']['value'].endsWith('/')) {
      this.ruleVO.on = jsonRuleString['on']['value'];
    } else {
      this.ruleVO.on = jsonRuleString['on']['escapedValue']
    }
    this.ruleVO.quote = jsonRuleString['quote'] ? jsonRuleString['quote']['escapedValue'] : null;
    this.getEditColumnList(rule['jsonRuleString'], 'col');

  }

  private setExtractEditInfo(rule){

    let jsonRuleString = JSON.parse(rule.jsonRuleString);
    if (jsonRuleString['on']['value'].startsWith('/') && jsonRuleString['on']['value'].endsWith('/')) {
      this.ruleVO.on = jsonRuleString['on']['value'];
    } else {
      this.ruleVO.on = jsonRuleString['on']['escapedValue']
    }
    this.ruleVO.quote = jsonRuleString['quote'] ? jsonRuleString['quote']['escapedValue'] : null;
    this.editColumnList = [this.ruleVO.col];

  }

  private setDeriveEditInfo(rule) {

    this.removeQuotation('as');

    let deriveCondition = rule['ruleString'].split('value: ');
    deriveCondition = deriveCondition[1].split(' as: ');
    this.ruleVO['value'] = deriveCondition[0];

  }

  private setAggregateEditInfo(rule) {

    let aggregaterulestring = JSON.parse(rule['jsonRuleString']);

    if (!isUndefined(aggregaterulestring['value'].escapedValue)) {
      this.pivotFormulaValueList.push(aggregaterulestring['value'].escapedValue);
    } else {
      this.pivotFormulaValueList = [];
      aggregaterulestring['value'].value.filter((field) => {
        this.pivotFormulaValueList.push(field.substring(1,field.length-1));
      });
    }

    this.pivotFormulaList.length = this.pivotFormulaValueList.length;

    // order is important in multicolumn selectbox. First delete seq
    this.selectedDataSet.gridData.fields.filter((field) => {
      delete field.seq;
    });

    this.ruleVO.cols = [];
    if (aggregaterulestring['group']) {
      this.getEditColumnList(rule['jsonRuleString'], 'group');
    }

  }

  private setNestEditInfo(rule) {

    this.removeQuotation('as');

    this.getEditColumnList(rule['jsonRuleString'], 'col');

  }

  private setUnnestEditInfo() {
    if (this.ruleVO['idx']['value'].startsWith('\'') && this.ruleVO['idx']['value'].endsWith('\'')) {
      this.ruleVO['idx'] = this.ruleVO['idx']['value'].substring(1, this.ruleVO['idx']['value'].length - 1);
    } else {
      this.ruleVO['idx'] = this.ruleVO['idx']['value']
    }
  }

  private setDeleteEditInfo(rule) {
    const deleteCondition = rule['ruleString'].split('row: ');
    this.ruleVO['row'] = deleteCondition[1];
  }

  private setDropEditInfo(rule) {

    this.getEditColumnList(rule['jsonRuleString'], 'col');
  }

  private setSortEditInfo(rule) {


    let type = rule['ruleString'].split('type:');
    if (!isUndefined(type[1])) {
      this.ruleVO['type'] = type[1].substring(1, type[1].length - 1);
    }

    this.getEditColumnList(rule['jsonRuleString'], 'order');

  }

  private setMoveEditInfo(rule) {
    if (this.ruleVO['before'] != null) {
      this.ruleVO['beforeOrAfter'] = 'before';
      this.ruleVO['colForMove'] = this.ruleVO['before'];
    } else {
      this.ruleVO['beforeOrAfter'] = 'after';
      this.ruleVO['colForMove'] = this.ruleVO['after'];
    }
    this.getEditColumnList(rule['jsonRuleString'], 'col');
  }

  private setPivotEditInfo(rule) {
    let pivotrulestring = JSON.parse(rule['jsonRuleString']);
    this.selectedDataSet.gridData.fields.filter((field) => {
      delete field.seq;
      delete field.groupSeq;
    });

    if (pivotrulestring['value']['escapedValue']) {
      this.pivotFormulaValueList[0] = pivotrulestring['value']['escapedValue'];
    } else {
      pivotrulestring['value']['value'].filter((item) => {
        const field = item.substring(1, item.length - 1);
        this.pivotFormulaValueList.push(field);
      });

    }

    this.pivotFormulaList.length = this.pivotFormulaValueList.length;

    if (!isUndefined(pivotrulestring['col'].value)) {
      const pivotFields = this.selectedDataSet.gridData.fields.map((f) => {
        return f.name;
      });
      // this.ruleVO.cols = [];
      this.ruleVO.groups = [];

      let anotherList = [];
      if (pivotrulestring['group']) {
        typeof pivotrulestring['group'].value === 'string' ? anotherList[0] = pivotrulestring['group'].value : null;
        anotherList.length !== 0 ? pivotrulestring['group']['value'] = anotherList : anotherList = [];
        pivotrulestring['group']['value'].forEach((colName, index) => {
          this.ruleVO.groups.push(colName);
          const idx = pivotFields.indexOf(colName);
          if (idx > -1) {
            // only insert seq number into selected fields
            this.selectedDataSet.gridData.fields[idx].ticked = true;
            this.selectedDataSet.gridData.fields[idx].groupSeq = index + 1;
          }
        });
      }
    }

    this.getEditColumnList(rule['jsonRuleString'], 'col');
  }

  private setUnpivotEditInfo(rule) {

    this.selectedDataSet.gridData.fields.filter((field) => {
      delete field.seq;
    });

    this.getEditColumnList(rule['jsonRuleString'], 'col');

  }

  private setJoinEditInfo(rule) {
    this.rightDataset = new Dataset();

    // is it append or update ?
    this.rightDataset.joinButtonText = 'Edit Join';

    // 수정시 필요한 룰넘버
    this.rightDataset.ruleNo = rule['ruleNo'];

    // dataset id
    this.rightDataset.dsId = this.ruleVO['dataset2']['escapedValue'];

    //  join type
    this.rightDataset.selectedJoinType = this.ruleVO['joinType'].substring(1, this.ruleVO['joinType'].length - 1);

    let rlist = []; // container for rightcolumns
    let llist = []; // container for leftcolumns
    typeof this.ruleVO['rightSelectCol'].value === 'string' ? (rlist[0] = this.ruleVO['rightSelectCol'].value)
      : this.rightDataset.rightSelectCol = this.ruleVO['rightSelectCol'].value;
    typeof this.ruleVO['leftSelectCol'].value === 'string' ? (llist[0] = this.ruleVO['leftSelectCol'].value)
      : this.rightDataset.leftSelectCol = this.ruleVO['leftSelectCol'].value;

    rlist.length > 0 ? this.rightDataset.rightSelectCol = rlist: null;
    llist.length > 0 ? this.rightDataset.leftSelectCol = llist: null;
    let list = [];

    if (this.ruleVO['condition'].hasOwnProperty('children')) {
      list = this.ruleVO['condition']['children'];
      this.rightDataset.joinRuleList = [];
      list.forEach((item) => {
        const info = new JoinInfo();
        info.leftJoinKey = item['left'].value;
        info.rightJoinKey = item['right'].value;
        this.rightDataset.joinRuleList.push(info);

      });
    } else {

      list = this.ruleVO['condition'];
      this.rightDataset.joinRuleList = [];
      const info = new JoinInfo();
      info.leftJoinKey = list['left'].value;
      info.rightJoinKey = list['right'].value;
      this.rightDataset.joinRuleList.push(info);
    }

    this.isRuleJoinModalShow = true;
    this.changeDetect.detectChanges();
  }

  /**
   * Multi column edit - 어떤 컬럼이 선택 되어있는지
   * @param jsonRuleString
   * @param property
   */
  private getEditColumnList(jsonRuleString, property) {
    let ruleString = JSON.parse(jsonRuleString);

    if (!isUndefined(ruleString[property].value)) {
      this.editColumnList = [];

      if (typeof ruleString[property].value === 'string') {
        this.editColumnList[0] = ruleString[property].value;
        return;
      }

      ruleString[property]['value'].forEach((colName) => {
        this.editColumnList.push(colName);
      });
    }
  }

  /**
   * Remove surrounded quotation marks from server
   * @param property
   */
  private removeQuotation(property) {
    if ('string' !== typeof this.ruleVO[property]) {
      this.ruleVO[property] = this.ruleVO[property]['escapedValue'];
    } else {
      if (this.ruleVO[property].startsWith('\'') && this.ruleVO[property].endsWith('\'')) {
        this.ruleVO[property] = this.ruleVO[property].substring(1, this.ruleVO[property].length - 1);
      }
    }

  }

  private changeRule($event) {
    if(-2==this.autoCompleteSuggestions_selectedIdx) {
      this.autoCompleteSuggestions_selectedIdx=-1;
      return;
    }

    //console.log($event);

    let inputId = '';
    let value = undefined;
    if(typeof $event === 'string') {
      value = $event;
    } else if($event instanceof ClipboardEvent) {
      let input = (<HTMLInputElement>$event.target);
      let input_value = input.value;
      let start = input.selectionStart;
      let end = input.selectionEnd;

      value = input_value.substring(0,start);
      value += $event.clipboardData.getData('Text');
      value += input_value.substring(end+1);

      //console.log(value);
    } else {
      if($event.target && $event.target.value) {
        value = $event.target.value.substring(0,$event.target.selectionStart);
        if( $event.key ) {
          if(
            (8 <= $event.keyCode && $event.keyCode <= 9) ||
            (12 <= $event.keyCode && $event.keyCode <= 13) ||
            (16 <= $event.keyCode && $event.keyCode <= 21) ||
            $event.keyCode === 25 ||
            $event.keyCode === 27 ||
            (33 <= $event.keyCode && $event.keyCode <= 47) ||
            (91 <= $event.keyCode && $event.keyCode <= 92) ||
            (112 <= $event.keyCode && $event.keyCode <= 127) ||
            (144 <= $event.keyCode && $event.keyCode <= 145)
          ) {
            // special key
          } else {
            if(($event.metaKey==true || $event.ctrlKey==true) && $event.key=='v') {
              // paste
              /*
              let input = $event.target;
              input.blur();
              input.dispatchEvent(new Event('input'));
              input.focus();
              */

              return true;
            } else {
              //value += String.fromCharCode($event.key);
              value += $event.key;
            }
          }
        }
      }
      if($event.target && $event.target.id) {
        inputId = $event.target.id;
      }
      if(this.autoCompleteSuggestions && 0<this.autoCompleteSuggestions.length) {
        if($event.keyCode === 38 || $event.keyCode === 40) {
          if($event.keyCode === 38) {
            this.autoCompleteSuggestions_selectedIdx--;
          } else if($event.keyCode === 40) {
            this.autoCompleteSuggestions_selectedIdx++;
          }

          if(this.autoCompleteSuggestions_selectedIdx<0) {
            this.autoCompleteSuggestions_selectedIdx = this.autoCompleteSuggestions.length-1;
          } else if(this.autoCompleteSuggestions.length<=this.autoCompleteSuggestions_selectedIdx) {
            this.autoCompleteSuggestions_selectedIdx = 0;
          }

          let height=25;
          $('.ddp-list-command').scrollTop(this.autoCompleteSuggestions_selectedIdx*height);

          return false;
        } else if($event.keyCode === 27) {
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestion_inputId = '';
          this.autoCompleteSuggestions = [];
          this.autoCompleteSuggestions_selectedIdx=-2;
          return false;
        } else if($event.keyCode === 13 || $event.keyCode === 108) {
          if( 0<=this.autoCompleteSuggestions_selectedIdx
            && this.autoCompleteSuggestions_selectedIdx<this.autoCompleteSuggestions.length)
          {
            if(inputId.startsWith('rule-pivot') || inputId.startsWith('rule-aggregate')) {
              let formulaValueIdx = inputId.substring(inputId.lastIndexOf('-')+1);
              this.onautoCompleteSuggestionsSelectPivot(this.autoCompleteSuggestions[this.autoCompleteSuggestions_selectedIdx], this.pivotFormulaValueList, formulaValueIdx );
            } else {
              this.onautoCompleteSuggestionsSelect(this.autoCompleteSuggestions[this.autoCompleteSuggestions_selectedIdx]);
            }
          }
          return false;
        } else if($event.keyCode === 8 || $event.keyCode === 46 || $event.keyCode === 37 || $event.keyCode === 39) {

          let input = $event.target;
          let input_value = input.value;
          let start = input.selectionStart;
          let end = input.selectionEnd;

          if($event.keyCode === 8) {
            if(0<=start && end<=input_value.length) {
              if(start==end) {
                start--; end--;
                input_value = input_value.substring(0,start) + input_value.substring(start+1);
              } else if(start<end) {
                input_value = input_value.substring(0,start) + input_value.substring(end);
                end = start;
              }
            }
          } else if($event.keyCode === 46) {
            if(0<=start && end<=input_value.length) {
              if(start==end) {
                input_value = input_value.substring(0,start+1) + input_value.substring(end+2);
              } else if(start<end) {
                input_value = input_value.substring(0,start) + input_value.substring(end);
                end = start;
              }
            }
          } else if($event.keyCode === 37) {
            if(0<start) {
              start--; end--;
            }
          } else if($event.keyCode === 39) {
            if(end<input_value.length) {
              start++; end++;
            }
          }

          input.blur();

          input.value = input_value;
          input.selectionStart = start;
          input.selectionEnd = end;

          input.dispatchEvent(new Event('input'));
          input.focus();

          return false;
        } else if(
          (8 <= $event.keyCode && $event.keyCode <= 9) ||
          (12 <= $event.keyCode && $event.keyCode <= 13) ||
          (16 <= $event.keyCode && $event.keyCode <= 21) ||
          $event.keyCode === 25 ||
          $event.keyCode === 27 ||
          (33 <= $event.keyCode && $event.keyCode <= 47) ||
          (91 <= $event.keyCode && $event.keyCode <= 92) ||
          (112 <= $event.keyCode && $event.keyCode <= 127) ||
          (144 <= $event.keyCode && $event.keyCode <= 145)
        ) {
          return false;
        } else {
          // normal character
        }
      }
    }

    let ruleString = '';
    let ruleCommand = null;
    let rulePart = null;
    if(!isUndefined(this.ruleVO)) {
      ruleString = this.makeRuleResult(this.ruleVO);
      ruleCommand = this.ruleVO['command'];
      if( undefined!==value ) {
        rulePart = value;
        if(0<rulePart.length && 0<this.autoCompleteSuggestions.length) {
          for(let suggest of this.autoCompleteSuggestions) {
            if(rulePart.trim().endsWith(suggest.value)) {
              if(suggest.type!='@_OPERATOR_@'
                && suggest.type!='@_STRING_@'
                && suggest.type!='@_FUNCTION_EXPRESSION_@'
                && suggest.type!='@_AGGREGATE_FUNCTION_EXPRESSION_@') {
                let lastIdx = rulePart.lastIndexOf(suggest.value);
                rulePart = rulePart.substring(0,lastIdx) + suggest.type + rulePart.substring(lastIdx+suggest.value.length);
              }
              break;
            }
          }
        }
      } else {
        rulePart = '';
      }
    }

    /********************************
     // autocomplete temporary dev
     *********************************/
    /*
    let columnNames = [];
    if(ruleCommand=='set' && 0<this.selectedDataSet.gridData.fields.length ) {
      columnNames.push( '$col' );
    }
    for(var _column of this.selectedDataSet.gridData.fields) {
      columnNames.push( _column.name );
    }
    var functionNames = [
      'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper','year'
    ];
    var functionAggrNames = [
      'sum','avg','max','min','count',
    ];
    console.log(value);
    */


    this.dataflowService.autoComplete(ruleString, ruleCommand, rulePart).then((data) => {
      let columnNames = [];
      if(ruleCommand=='set' && 0<this.selectedDataSet.gridData.fields.length ) {
        columnNames.push( '$col' );
      }
      for(var _column of this.selectedDataSet.gridData.fields) {
        columnNames.push( _column.name );
      }
      var functionNames = [
        'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper','year'
      ];
      // 2018.5.23  'now','month','day','hour','minute','second','millisecond','if','isnull','isnan','length','trim','ltrim','rtrim','upper','lower','substring','math.abs','math.acos','math.asin','math.atan','math.cbrt','math.ceil','math.cos','math.cosh','math.exp','math.expm1','math.getExponent','math.round','math.signum','math.sin','math.sinh','math.sqrt','math.tan','math.tanh','left','right','if','substring','add_time','concat','concat_ws'
      var functionAggrNames = [
        'sum','avg','max','min','count',
      ];
      if (!isUndefined(data.suggest)) {
        let suggests: any = [];
        let ruleSource = "";
        let tokenSource0 = data.suggest[0].tokenSource;
        data.suggest.forEach((item) => {
          if(0<=item.start) {
            if(item.tokenSource=="<EOF>") {
              item.tokenSource="";
            }
            if(1<item.tokenString.length&&item.tokenString.startsWith("'")&&item.tokenString.endsWith("'")) {
              item.tokenString=item.tokenString.substring(1,item.tokenString.length-1);
            }
            if(item.tokenString=="@_COLUMN_NAME_@") {
              let ts = item.tokenSource;
              if( false==tokenSource0.endsWith(ts) ) {
                ts = '';
              }
              for(var columnName of columnNames) {
                if( columnName.startsWith(ts) ) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'DodgerBlue',
                    'source': item.tokenSource,
                    'value': columnName
                  };
                  suggests.push(suggest);
                }
              }
            } else if(item.tokenString=="@_FUNCTION_EXPRESSION_@") {
              let ts = item.tokenSource;
              if( false==tokenSource0.endsWith(ts) ) {
                ts = '';
              }
              for(var functionName of functionNames) {
                if( functionName.startsWith(ts) ) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push( suggest );
                }
              }
            } else if(item.tokenString=="@_COMPLETED_BRACKET_@") {
              let openidx = ruleSource.lastIndexOf('(');
              let closeidx = ruleSource.lastIndexOf(')');
              if(0<=openidx && closeidx<openidx ) {
                //if( item.tokenSource.startsWith('(') ) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'LightCoral',
                  'source': item.tokenSource,
                  'value': ')'
                };
                //suggests.push( suggest );
              }
            } else if(item.tokenString=="@_STRING_@") {
              if( item.tokenSource.startsWith('\'') ) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'black',
                  'source': item.tokenSource,
                  'value': '\''
                };
                suggests.push( suggest );
              }
            } else if(item.tokenString=="LONG") {
            } else if(item.tokenString=="DOUBLE") {
            } else if(item.tokenString=="BOOLEAN") {
            } else if(item.tokenString=="@_AGGREGATE_FUNCTION_EXPRESSION_@") {
              for(var functionName of functionAggrNames) {
                if( functionName.startsWith(item.tokenSource) ) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push( suggest );
                }
              }
            } else if( item.tokenString=="count" || item.tokenString=="avg" || item.tokenString=="sum" || item.tokenString=="min" || item.tokenString=="max" ) {
              if( item.tokenString.startsWith(item.tokenSource) ) {
                let suggest = {
                  'type': '@_AGGREGATE_FUNCTION_EXPRESSION_@', // item.tokenString,
                  'class': 'Olive',
                  'source': item.tokenSource,
                  'value': item.tokenString
                };
                suggests.push( suggest );
              }
            } else {
              let suggest = {
                'type': '@_OPERATOR_@',
                'class': 'LightCoral',
                'source': item.tokenSource,
                'value': item.tokenString
              };

              // column name for aggregate function
              if( suggest.value==')' &&
                (tokenSource0.startsWith('sum') || tokenSource0.startsWith('avg') || tokenSource0.startsWith('min') || tokenSource0.startsWith('max') )
              ) {
                let colnameIdx = tokenSource0.lastIndexOf('(');
                let ts = tokenSource0.substring(colnameIdx+1);
                for(var columnName of columnNames) {
                  if( columnName.startsWith(ts) ) {
                    let suggest = {
                      'type': "@_COLUMN_NAME_@",
                      'class': 'DodgerBlue',
                      'source': item.tokenSource,
                      'value': columnName
                    };
                    suggests.push(suggest);
                  }
                }
              }

              if( suggest.value!='(' && suggest.value!=')' ) {
                suggests.push( suggest );
              }
            }
          } else if(-1==item.start&&-1==item.stop&&-1==item.tokenNum) {
            ruleSource = item.tokenSource;
          }
        });
        this.autoCompleteSuggestions_selectedIdx = -1;
        this.autoCompleteSuggestions = suggests;
        if(0<=suggests.length) {
          this.isAutoCompleteSuggestionListOpen = true;
          this.autoCompleteSuggestion_inputId = inputId;
        } else {
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestion_inputId = '';
        }
      }
    }).catch((error) => {
      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestion_inputId = '';
      this.autoCompleteSuggestions_selectedIdx = -1;
      this.autoCompleteSuggestions = [];

      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  }

  public onautoCompleteSuggestionsSelect(item) {
    /*
    let value = null;
    switch (this.ruleVO.command) {
      case 'keep':
      case 'delete':
        value = this.ruleVO.row;
        break;
      case 'set' :
      case 'derive' :
        value = this.ruleVO.value;
        break;
    }
    if(isUndefined(value)) {
      value = "";
    }

    if( item.type!="@_OPERATOR_@" && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      let lastIdx = value.lastIndexOf(item.source);
      if(-1!=lastIdx && value.endsWith(item.source) ) {
          value = value.substring(0,lastIdx) + item.value;
      } else {
          value += item.value;
      }
    } else {
      value += item.value;
    }

    switch (this.ruleVO.command) {
      case 'keep':
      case 'delete':
        this.ruleVO.row = value;
        break;
      case 'set' :
      case 'derive' :
        this.ruleVO.value = value;
        break;
    }

    this.changeRule(value);
    */

    var input = this.elementRef.nativeElement.querySelector('#'+this.autoCompleteSuggestion_inputId);
    if(isUndefined(input)) { return; }

    let start = input.selectionStart;
    let end = input.selectionEnd;
    let value = input.value.substring(0,input.selectionStart);
    if( item.type!="@_OPERATOR_@" ) { // && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      if(start<end) {
        let value = input.value.substring(0,input.selectionEnd);
      }
      let lastIdx = value.lastIndexOf(item.source);
      if(-1!=lastIdx && value.endsWith(item.source) ) {
        value = value.substring(0,lastIdx);
      }
    }

    let len_of_head = value.length;
    value += item.value;
    let caretPos = value.length;
    let tail = input.value.substring(input.selectionEnd);
    if( start==end && len_of_head<=start ) {
      let part_of_tail = value.substring(start);
      if( tail.indexOf(part_of_tail)==0 ) {
        tail = tail.substring(part_of_tail.length);
      }
    }
    value += tail;

    input.blur();

    input.value = value;
    input.selectionStart = caretPos;
    input.selectionEnd = caretPos;

    input.dispatchEvent(new Event('input'));
    input.focus();
  }

  public isAutoCompleteSuggestionListOpenPivot(id, idx) {
    if( true==this.isAutoCompleteSuggestionListOpen && this.autoCompleteSuggestion_inputId==id+'-'+idx ) {
      return true;
    }
    return false;
  }
  public onautoCompleteSuggestionsSelectPivot(item,pivotFormulaValueList,idx) {
    var input = this.elementRef.nativeElement.querySelector('#'+this.autoCompleteSuggestion_inputId);
    if(isUndefined(input)) { return; }

    let start = input.selectionStart;
    let end = input.selectionEnd;
    let value = input.value.substring(0,input.selectionStart);

    if(item.type=="@_AGGREGATE_FUNCTION_EXPRESSION_@") {
      value = item.value;
    } else if(item.type=="@_COLUMN_NAME_@") {
      let bracketIdx = value.lastIndexOf('(');
      value = value.substring(0,bracketIdx);
      let colname = value.substring(bracketIdx+1);
      if(item.value.startsWith(colname)) {
        value += '(';
      } else {
        value += '(' + colname;
      }
      value += item.value;
    } else if(item.type=="@_OPERATOR_@") {
      value += item.value;
    }

    pivotFormulaValueList[idx] = value;
    let caretPos = value.length;

    input.blur();

    input.value = value;
    input.selectionStart = caretPos;
    input.selectionEnd = caretPos;

    input.dispatchEvent(new Event('input'));
    input.focus();
  }

}

class JoinInfo {
  public leftJoinKey:string;
  public rightJoinKey:string;
}
