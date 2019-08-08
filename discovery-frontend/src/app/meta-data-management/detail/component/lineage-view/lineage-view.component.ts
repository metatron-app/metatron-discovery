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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild, ViewChildren} from '@angular/core';
import * as _ from 'lodash';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {InputComponent} from '../../../../common/component/input/input.component';
import {LineageViewService} from '../../service/lineage-view.service';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';
import {Alert} from '../../../../common/util/alert.util';
import {Metadata} from '../../../../domain/meta-data-management/metadata';

declare let echarts;

enum NodeType {
  MainNode = 0,
  NormalNode = 1
};

// 다이어그램 시리즈 번호
enum SeriesIndex {
  LINEAGE_DIAGRAM = 0
};

enum ViewType {
  Diagram = 0,
  Grid = 1
};

@Component({
  selector: 'app-metadata-detail-lineageview',
  templateUrl: './lineage-view.component.html'
})
export class LineageViewComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('metadataName')
  private metadataName: ElementRef;

    // 차트 기본 옵션
  private chartOptions: any;

  // 노드 리스트
  private chartNodes: any[] = [];

  // 노드간 링크 리스트
  private chartLinks: any[] = [];

  // 노드 아이콘 경로
  private symbolInfo: any = {};

  private viewType: ViewType;

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

  @Input()
  public isNameEdit: boolean;

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
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this._initValues();
    this._initialiseChartValues();

    this.getLineageMap();
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
   * Get lineage map
   */
  public getLineageMap() {
    let nodeCount = this.nodeCount;
    let alignment = this.alignment;
    let metadataId = this.metaDataModelService.getMetadata().id;
    this.lineageViewService.getLineageMapForMetadata(metadataId).then((result) => {
      this.lineageNodes = [];
      this.lineageEdges = [];

      if (result) {
        let indexX = 0;
        for(var nodeList of result.nodeGrid) {
          let indexY = 0;
          for(var node of nodeList) {
            var _node = _.cloneDeep(node);
            _node.metadataId = node.metaId;
            _node.positionX = indexX;
            _node.positionY = indexY;

            this.lineageNodes.push( _node );
            indexY++;
          }
          indexX++;
        }

        for(var edge of result.needEdges) {
          var _edge = _.cloneDeep(edge);
          _edge.source = edge.frMetaId;
          _edge.target = edge.toMetaId;

          this.lineageEdges.push( _edge );
        }

        this.drawChart();
      } else {
      }
    }).catch((error) => {
      console.error(error);
    });

  } // function - getLineageMap

  public closeColumnView() {
    if( this.selectedNode !== null ) {
      var index = this.selectedNode.index;
      var category = this.selectedNode.category;

      var seriesIdx = SeriesIndex.LINEAGE_DIAGRAM;
      const option = this.chart.getOption();
      option.series[seriesIdx].data[index].symbol = this.symbolInfo[NodeType[category]]['DEFAULT'];
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

  /**
   * 차트 그리기
   */
  private drawChart() {

    this.chart = echarts.init(this.$element.find('#chartCanvas')[0]);
    this.chart.clear();

    this.chartNodes = [];
    this.chartLinks = [];

    let seriesIdx = SeriesIndex.LINEAGE_DIAGRAM;

    this.chart.off('click');
    this.chart.on('click', (params) => {

      let oldSelectedNodeIdx = this.selectedNode!==null?this.selectedNode.index:null;
      let newSelectedNodeIdx = null;

      const option = this.chart.getOption();
      if(params!==null && params.componentType==='series' && params.seriesIndex===seriesIdx) {
        if( params.dataType==='node' ) {
          option.series[seriesIdx].data.map((node, idx) => {
            if(idx===params.dataIndex) {
              newSelectedNodeIdx = idx;
            }
          });
        }
      }

      if( oldSelectedNodeIdx !== null ) {
        var category = option.series[seriesIdx].data[oldSelectedNodeIdx].category;
        option.series[seriesIdx].data[oldSelectedNodeIdx].symbol = this.symbolInfo[NodeType[category]]['DEFAULT'];

        this.selectedNode = null;
      }
      if( newSelectedNodeIdx !== null ) {
        var category = option.series[seriesIdx].data[newSelectedNodeIdx].category;
        option.series[seriesIdx].data[newSelectedNodeIdx].symbol = this.symbolInfo[NodeType[category]]['SELECTED'];

        this.selectedNode = option.series[seriesIdx].data[newSelectedNodeIdx];
      }

      if( oldSelectedNodeIdx !== null || newSelectedNodeIdx !== null ) {
        this.chart.setOption(option);
        setTimeout( () => {
          this.chartAreaResize();
        }, 500 );
      }
    });

    this.lineageDepth = 0;
    this.lineageHeight = 0;
    this.chartNodes = this.lineageNodes.map((_node,idx) => {
      let node = _.cloneDeep(_node);

      node.index = idx;
      node.name = node.metadataId;

      if( this.lineageDepth <= node.positionX ) { this.lineageDepth = node.positionX + 1; }
      if( this.lineageHeight <= node.positionY ) { this.lineageHeight = node.positionY + 1; }
      node.value = [node.positionX,node.positionY];

      /* main node */
      if( node.metadataId === this.metaDataModelService.getMetadata().id ) {
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
      let edge = _.cloneDeep(_edge);
      /*
      let source : string = edge.source;
      let target : string = edge.target;
      let link : any = {
        'source': source,
        'target': target
      };
      return link;
      */
      return edge;
    });

    this.chartOptions.series[seriesIdx].data = this.chartNodes;
    this.chartOptions.series[seriesIdx].links = this.chartLinks;

    this.chart.setOption(this.chartOptions);
    this.chartAreaResize(true);

    let $chart = this;

    $(window).off('resize');
    $(window).on('resize', function (event) {
      $chart.chartAreaResize(true);
    });
  } // function - initChart

  public resizeEventHandler(event?: any) {
    this.chartAreaResize();

    // Check whether to put scroll bar
    const resize = $('.sys-lineage-right-panel').width() !== null && $('.sys-lineage-right-panel').width() / $('.ddp-lineage-view').width() > 0.5;
    if(resize) {
      $('.ddp-lineage-view-diagram').css('overflow-x', 'auto');
    }else{
      $('.ddp-lineage-view-diagram').css('overflow-x', 'hidden');
    }
  }

  public onChangeAlignment(_alignment: any) {
    this.alignment = _alignment.value;
  }
  public onChangeNodeCount(_nodeCount: any) {
    this.nodeCount = _nodeCount.value;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _initValues() {
    this.nodeCountList = [
      {label:'3', value : 3},
      {label:'5', value : 5},
      {label:'7', value : 7},
      {label:'9', value : 9}
    ];
    this.nodeCount = this.nodeCountList[1].value;

    this.alignmentList = [
      {label:'Center', value : 'Center'},
      {label:'Left', value : 'Left'},
      {label:'Right', value : 'Right'},
    ];
    this.alignment = this.alignmentList[0].value;

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
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      tooltip: { show: true },
      toolbox: {
        left: 'left',
      },
      xAxis: {
        type: 'value',
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        inverse: true,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
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
              //symbol: 'roundRect',
              symbol: this.symbolInfo[NodeType[NodeType.MainNode]]['DEFAULT'],
              symbolSize: [70,70],
              symbolOffset: [0,0],
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
                    '{large|'+params.data.metaName+'}'
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
              //symbol: 'rect',
              symbol: this.symbolInfo[NodeType[NodeType.NormalNode]]['DEFAULT'],
              symbolSize: [50,50],
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
          lineStyle: { normal: { opacity: 1, width: 0.5 } },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: 10,
          edgeLabel: {
            show: false
          },
          tooltip: {
            formatter: (params) => {
              if( params.dataType==='node' ) {
                return params.data.metaName;
              } else if( params.dataType==='edge' ) {
                var sourceId = params.data.source;
                var targetId = params.data.target;
                var sourceName = null;
                var targetName = null;
                this.lineageNodes.forEach( (node) => {
                  if(node.metadataId==sourceId) {
                    sourceName = node.name;
                  } else if(node.metadataId==targetId) {
                    targetName = node.name;
                  }
                });
                return sourceName +' to '+ targetName;
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
      color: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83', '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      animation: false
    };

  }

  private chartAreaResize(resizeCall?:boolean): void {
    if(resizeCall == undefined) resizeCall = false;

    $('.ddp-lineage-view-diagram').css('width', $('.sys-lineage-left-panel').width() );
    $('.ddp-lineage-view-diagram').css('height', $('.sys-lineage-left-panel').height() );
    $('.ddp-lineage-view-diagram').css('overflow', 'auto');

    const hNodeUnit = 5;
    const vNodeUnit = 7;

    const hScrollbarWith: number = 30;
    const vScrollbarWith: number = 30;

    //let minWidthSize: number = $('.sys-lineage-left-panel').width();
    let minWidthSize: number = $('.ddp-lineage-view').width() - hScrollbarWith;
    let minHeightSize: number = $('.ddp-lineage-view').height() - vScrollbarWith;

    if( hNodeUnit < this.lineageHeight ) {
      minHeightSize = minHeightSize * this.lineageHeight / hNodeUnit;
    }
    if( vNodeUnit < this.lineageDepth ) {
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

    $('#chartCanvas').css('height', minHeightSize+'px').css('width', minWidthSize+'px').css('overflow', 'hidden');
    if($('#chartCanvas').children()!=null && $('#chartCanvas').children()!=undefined){
      $('#chartCanvas').children().css('height', minHeightSize+'px').css('width', minWidthSize+'px');}
    if($('#chartCanvas').children().children()!=null && $('#chartCanvas').children().children()!=undefined) {
      $('#chartCanvas').children().children().css('height', minHeightSize+'px').css('width', minWidthSize+'px');}
    $('#chartCanvas div:last-child').css('height', '');
    $('#chartCanvas div:last-child').css('width', '');
    if (resizeCall == true && this.chart != null) {this.chart.resize();}
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

