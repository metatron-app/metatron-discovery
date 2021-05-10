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
import {Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {LineageViewService} from '../../service/lineage-view.service';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';

declare let echarts;

enum NodeType {
  MainNode = 0,
  NormalNode = 1
}

// 다이어그램 시리즈 번호
enum SeriesIndex {
  LINEAGE_DIAGRAM = 0
}

enum ViewType {
  Diagram = 0,
  Grid = 1
}

@Component({
  selector: 'app-metadata-detail-lineageview',
  templateUrl: './lineage-view.component.html'
})
export class LineageViewComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 차트 기본 옵션
  private chartOptions: any;

  // 노드 리스트
  private chartNodes: any[] = [];

  // 노드간 링크 리스트
  private chartLinks: any[] = [];

  // 노드 아이콘 경로
  private symbolInfo: any = {};

  public viewType: ViewType;

  public readonly VIEW_TYPE = ViewType;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // echart instance
  public chart: any;

  public lineageNodes: any = [];
  public lineageEdges: any = [];

  public lineageDepth: number = 0;
  public lineageHeight: number = 0;

  public nodeCount: number;
  public alignment: string;

  public defaultNodeCountIndex = 2;
  public defaultAlignmentIndex = 0;

  @Input()
  public isNameEdit: boolean;

  @Input()
  public metadataLoaded: boolean;

  public selectedNode: any = null;

  public nodeCountList: any[];
  public alignmentList: any[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    protected lineageViewService: LineageViewService,
    protected metadataService: MetadataService,
    public metaDataModelService: MetadataModelService,
    protected injector: Injector) {

    super(element, injector);

    this._initValues();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this._initialiseChartValues();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  public ngOnChanges(changedInput: any) {
    if (changedInput.metadataLoaded && changedInput.metadataLoaded.currentValue === true) {
      this.getLineageMap();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Get lineage map
   */
  public getLineageMap() {
    const nodeCount = this.nodeCount;
    const alignment = this.alignment;
    const metadataId = this.metaDataModelService.getMetadata().id;
    this.lineageViewService.getLineageMapForMetadata(metadataId, nodeCount, alignment).then((result) => {
      this.lineageNodes = [];
      this.lineageEdges = [];

      if (result) {
        let indexX = 0;
        for (const nodeList of result.nodeGrid) {
          let indexY = 0;
          for (const node of nodeList) {
            const _node = _.cloneDeep(node);
            _node.metadataId = node.metaId;
            _node.positionX = indexX;
            _node.positionY = indexY;

            this.lineageNodes.push(_node);
            indexY++;
          }
          indexX++;
        }

        for (const edge of result.needEdges) {
          const _edge = _.cloneDeep(edge);
          _edge.source = edge.frMetaId;
          _edge.target = edge.toMetaId;

          this.lineageEdges.push(_edge);
        }

        this.drawChart();
      } else {
      }
    }).catch((error) => {
      console.error(error);
    });

  } // function - getLineageMap

  public closeColumnView() {
    if (this.selectedNode !== null) {
      const index = this.selectedNode.index;
      const category = this.selectedNode.category;

      const option = this.chart.getOption();
      option.series[SeriesIndex.LINEAGE_DIAGRAM].data[index].symbol = this.symbolInfo[NodeType[category]]['DEFAULT'];
      this.chart.setOption(option);

      this.selectedNode = null;
    }

    this.chartAreaResize();
  }

  /* symbol properties of the category have a bug
   * manual copy
   */
  private setCategory(categories, node) {
    node.symbol = categories[node.category].symbol;
    node.symbolSize = categories[node.category].symbolSize;
    node.symbolOffset = categories[node.category].symbolOffset;
  }

  public selectNode(selectIndex) {
    const oldSelectedNodeIdx = this.selectedNode !== null ? this.selectedNode.index : null;
    let newSelectedNodeIdx = null;

    const seriesIdx = SeriesIndex.LINEAGE_DIAGRAM;

    const option = this.chart.getOption();
    if (selectIndex !== null) {
      option.series[seriesIdx].data.map((_node, idx) => {
        if (idx === selectIndex) {
          newSelectedNodeIdx = idx;
        }
      });
    }

    if (oldSelectedNodeIdx !== null) {
      const category = option.series[seriesIdx].data[oldSelectedNodeIdx].category;
      option.series[seriesIdx].data[oldSelectedNodeIdx].symbol = this.symbolInfo[NodeType[category]]['DEFAULT'];

      this.selectedNode = null;
    }
    if (newSelectedNodeIdx !== null) {
      const category = option.series[seriesIdx].data[newSelectedNodeIdx].category;
      option.series[seriesIdx].data[newSelectedNodeIdx].symbol = this.symbolInfo[NodeType[category]]['SELECTED'];

      this.selectedNode = option.series[seriesIdx].data[newSelectedNodeIdx];
    }

    if (oldSelectedNodeIdx !== null || newSelectedNodeIdx !== null) {
      this.chart.setOption(option);
      setTimeout(() => {
        this.chartAreaResize();
      }, 500);
    }
  }

  /**
   * 차트 그리기
   */
  private drawChart() {

    this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
    this.chart.clear();

    this.chartNodes = [];
    this.chartLinks = [];

    const seriesIdx = SeriesIndex.LINEAGE_DIAGRAM;

    this.chart.off('click');
    this.chart.on('click', (params) => {
      let paramIdx = null;
      if (params !== null && params.componentType === 'series' && params.seriesIndex === seriesIdx) {
        if (params.dataType === 'node') {
          paramIdx = params.dataIndex;
        }
      }
      this.selectNode(paramIdx);
    });

    let thisIndex = null;
    this.lineageDepth = 0;
    this.lineageHeight = 0;
    this.chartNodes = this.lineageNodes.map((_node, idx) => {
      const node = _.cloneDeep(_node);

      node.index = idx;
      node.name = node.metadataId;

      if (this.lineageDepth <= node.positionX) {
        this.lineageDepth = node.positionX + 1;
      }
      if (this.lineageHeight <= node.positionY) {
        this.lineageHeight = node.positionY + 1;
      }
      node.value = [node.positionX, node.positionY];

      /* main node */
      if (node.metadataId === this.metaDataModelService.getMetadata().id) {
        thisIndex = idx;
        node.category = NodeType.MainNode;
      } else {
        node.category = NodeType.NormalNode;
      }

      this.setCategory(this.chartOptions.series[seriesIdx].categories, node);

      return node;
    });
    this.chartOptions.xAxis.min = 0;
    this.chartOptions.xAxis.max = this.lineageDepth;
    this.chartOptions.yAxis.min = 0;
    this.chartOptions.yAxis.max = this.lineageHeight;

    this.chartLinks = this.lineageEdges.map(_edge => {
      /*
      let source : string = edge.source;
      let target : string = edge.target;
      let link : any = {
        'source': source,
        'target': target
      };
      return link;
      */
      return _.cloneDeep(_edge);
    });

    this.chartOptions.series[seriesIdx].data = this.chartNodes;
    this.chartOptions.series[seriesIdx].links = this.chartLinks;

    this.chart.setOption(this.chartOptions);
    this.chartAreaResize(true);

    const $chart = this;

    if (thisIndex) {
      this.selectNode(thisIndex);
    }

    $(window).off('resize');
    $(window).on('resize', (_event) => {
      $chart.chartAreaResize(true);
    });
  } // function - initChart

  public resizeEventHandler(_event?: any) {
    this.chartAreaResize();

    // Check whether to put scroll bar
    const $rightPanel = $('.sys-lineage-right-panel');
    const resize = $rightPanel.width() !== null && $rightPanel.width() / $('.ddp-lineage-view').width() > 0.5;
    if (resize) {
      $('.ddp-lineage-view-diagram').css('overflow-x', 'auto');
    } else {
      $('.ddp-lineage-view-diagram').css('overflow-x', 'hidden');
    }
  }

  public onChangeAlignment(_alignment: any) {
    if (this.alignment !== _alignment.value) {
      this.alignment = _alignment.value;
      this.selectedNode = null;
      this.getLineageMap();
    }
  }

  public onChangeNodeCount(_nodeCount: any) {
    if (this.nodeCount !== _nodeCount.value) {
      this.nodeCount = _nodeCount.value;
      this.selectedNode = null;
      this.getLineageMap();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _initValues() {
    this.nodeCountList = [
      {label: '3', value: 3},
      {label: '5', value: 5},
      {label: '7', value: 7},
      {label: '9', value: 9}
    ];
    this.nodeCount = this.nodeCountList[this.defaultNodeCountIndex].value;

    this.alignmentList = [
      {label: 'Center', value: 'Center'},
      {label: 'Left', value: 'Left'},
      {label: 'Right', value: 'Right'},
    ];
    this.alignment = this.alignmentList[this.defaultAlignmentIndex].value;

    this.viewType = ViewType.Diagram;
  }

  /**
   * Initialise chart values and options
   * @private
   */
  private _initialiseChartValues() {

    const SVG_LOCATION: string = 'image://' + window.location.origin + '/assets/images/mdm/png/';
    this.symbolInfo[NodeType[NodeType.MainNode]] = {
      DEFAULT: SVG_LOCATION + 'icon_table_standard_normal.png',
      SELECTED: SVG_LOCATION + 'icon_table_standard_focus.png',
    };
    this.symbolInfo[NodeType[NodeType.NormalNode]] = {
      DEFAULT: SVG_LOCATION + 'icon_table_normal.png',
      SELECTED: SVG_LOCATION + 'icon_table_focus.png',
    };

    this.chartOptions = {
      backgroundColor: '#ffffff',
      tooltip: {show: true},
      toolbox: {
        left: 'left',
      },
      xAxis: {
        type: 'value',
        splitLine: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        axisTick: {show: false}
      },
      yAxis: {
        type: 'value',
        inverse: true,
        splitLine: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        axisTick: {show: false}
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          legendHoverLink: false,
          hoverAnimation: true,
          roam: true,
          draggable: true,
          nodeScaleRatio: 0.6,
          categories: [
            {
              name: NodeType[NodeType.MainNode],
              // symbol: 'roundRect',
              symbol: this.symbolInfo[NodeType[NodeType.MainNode]]['DEFAULT'],
              symbolSize: [50, 50],
              symbolOffset: [0, 0],
              itemStyle: {
                color: 'rgba(0, 0, 0, 0.0)',
                borderColor: '#000',
                borderWidth: 1,
                borderType: 'solid',
                opacity: 1.0,
              },
              label: {
                show: true,
                offset: [0, 50],
                color: '#000',
                formatter: (params) => {
                  return [
                    '{title|Main Node}',
                    '{large|' + params.data.metaName + '}'
                  ].join('\n');
                },
                rich: {
                  title: {
                    color: 'gray'
                  },
                  large: {
                    color: '#050505',
                    fontSize: 18,
                    borderColor: '#449933',
                    borderRadius: 4
                  }
                }
              }
            },
            {
              name: NodeType[NodeType.NormalNode],
              // symbol: 'rect',
              symbol: this.symbolInfo[NodeType[NodeType.NormalNode]]['DEFAULT'],
              symbolSize: [50, 50],
              symbolOffset: [0, 0],
              itemStyle: {
                color: 'rgba(0, 0, 0, 0.0)',
                borderColor: '#000',
                borderWidth: 1,
                borderType: 'solid',
                opacity: 1.0,
              },
              label: {
                show: true,
                offset: [0, 50],
                color: '#000',
                formatter: (params) => {
                  return params.data.metaName;
                }
              }
            }
          ],
          nodes: null,
          links: null,
          lineStyle: {normal: {opacity: 1, width: 0.5}},
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: 10,
          edgeLabel: {
            show: false
          },
          tooltip: {
            formatter: (params) => {
              if (params.dataType === 'node') {
                return params.data.metaName;
              } else if (params.dataType === 'edge') {
                let sourceName = params.data.frMetaName;
                let targetName = params.data.toMetaName;
                const sourceColName = params.data.frColName;
                if (sourceColName && 0 < sourceColName.length) {
                  sourceName = sourceName + '(' + sourceColName + ')';
                }
                const targetColName = params.data.toColName;
                if (targetColName && 0 < targetColName.length) {
                  targetName = targetName + '(' + targetColName + ')';
                }
                return sourceName + ' to ' + targetName;
              }
              return null;
            },
          },
          left: 'center',
          top: 'middle',
          right: 'auto',
          bottom: 'auto',
          width: 'auto',
          height: 'auto'
        },
      ],
      color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      animation: false
    };

  }

  private chartAreaResize(resizeCall?: boolean): void {
    if (resizeCall === undefined) resizeCall = false;

    const $diagram = $('.ddp-lineage-view-diagram');
    const $leftPanel = $('.sys-lineage-left-panel');
    $diagram.css('width', $leftPanel.width());
    $diagram.css('height', $leftPanel.height());
    $diagram.css('overflow', 'auto');

    const hNodeUnit = 5;
    const vNodeUnit = 7;

    const hScrollbarWith: number = 30;
    const vScrollbarWith: number = 30;

    // let minWidthSize: number = $('.sys-lineage-left-panel').width();
    const $view = $('.ddp-lineage-view');
    const minWidthSize: number = $view.width() - hScrollbarWith;
    let minHeightSize: number = $view.height() - vScrollbarWith;

    if (hNodeUnit < this.lineageHeight) {
      minHeightSize = minHeightSize * this.lineageHeight / hNodeUnit;
    }
    if (vNodeUnit < this.lineageDepth) {
      minHeightSize = minHeightSize * hNodeUnit / this.lineageHeight;
    }

    /*
    const resize = $('.sys-lineage-right-panel').width() !== null && $('.sys-lineage-right-panel').width() / $('.ddp-lineage-view').width() > 0.5;
    if(resize) {
      $('.ddp-lineage-view-diagram').css('overflow-x', 'auto');
    }else{
      $('.ddp-lineage-view-diagram').css('overflow-x', 'hidden');
    }
    */

    const $canvas = $('#chartCanvas');
    $canvas.css('height', minHeightSize + 'px').css('width', minWidthSize + 'px').css('overflow', 'hidden');
    if ($canvas.children() != null && $canvas.children() !== undefined) {
      $canvas.children().css('height', minHeightSize + 'px').css('width', minWidthSize + 'px');
    }
    if ($canvas.children().children() != null && $canvas.children().children() !== undefined) {
      $canvas.children().children().css('height', minHeightSize + 'px').css('width', minWidthSize + 'px');
    }
    const $canvasLastChild = $('#chartCanvas div:last-child');
    $canvasLastChild.css('height', '');
    $canvasLastChild.css('width', '');
    if (resizeCall === true && this.chart != null) {
      this.chart.resize();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

