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

  public lineageMaxDepth: number = 2;
  public lineageDepth: number = 0;
  public lineageHeight: number = 0;

  @Input()
  public isNameEdit: boolean;

  public selectedNode: any = null;

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

  private awaitCount = 0;
  public constructLineageNode(metaId: string, x: number, y: number) {
    let lineageNode = {
      'metadataId': metaId,
      'positionX': x,
      'positionY': y
    };

    this.awaitCount++;
    this.metadataService.getDetailMetaData(metaId).then((result) => {
      lineageNode['metadata'] = result;
      this.awaitCount--;
    }).catch((error) => {
      console.error(error);
      this.awaitCount--;
    });

    return lineageNode;
  }

  /**
   * Get lineage map
   */
  public getLineageMap() {

    let metadataId = this.metaDataModelService.getMetadata().id;
    this.lineageViewService.getLineageMapForMetadata(metadataId).then((result) => {
      this.lineageNodes = [];
      this.lineageEdges = [];

      if (result) {
        this.makeLineageFromMap(result);

        // 임시방편 : 데모용
        setTimeout(() => {
          console.log(this.awaitCount);
          if(this.awaitCount==0) {
            this.drawChart();
          }
        }, 500);
      } else {
      }
    }).catch((error) => {
      console.error(error);
    });

  } // function - getLineageMap

  /**
   * Make lineage from map
   */
  public makeLineageFromMap(mapRoot: any) {

    let lineageNode = this.constructLineageNode( mapRoot.metaId, this.lineageMaxDepth, 0 );
    this.lineageNodes.push( lineageNode );

    this.makeLineageNode( lineageNode, -1, mapRoot ); // forward
    this.makeLineageNode( lineageNode, 1, mapRoot ); // toward

    console.log( this.lineageNodes );
    console.log( this.lineageEdges );
  } // function - makeLineageMap

  public makeLineageNode( lineageNode: any, direction: number, mapNode: any ) {
    var positionX = lineageNode.positionX + direction;
    if( positionX<0 || (this.lineageMaxDepth*2+1)<positionX ) {
      return;
    }

    let followNodes = null;
    if(direction === -1) { // forward
      followNodes = mapNode.upstreamMapNodes.filter(node => node.circuit == false);
    } else { // toward
      followNodes = mapNode.downstreamMapNodes.filter(node => node.circuit == false);
    }

    var ignoreCircuit : boolean = false;
    if(ignoreCircuit != false) {
      if(direction === -1) { // forward
        followNodes = mapNode.upstreamMapNodes;
      } else { // toward
        followNodes = mapNode.downstreamMapNodes;
      }
    }

    if( followNodes && followNodes.length>0 ) {
      for( var followNode of followNodes ) {
        var positionY = 0;
        var siblings = this.lineageNodes.filter( node => node.positionX == positionX );
        if( siblings ) {
          positionY = siblings.length;
        }
        let _lineageNode = this.constructLineageNode( followNode.metaId, positionX, positionY );
        this.lineageNodes.push( _lineageNode );

        let sourceNode = direction==1?lineageNode:_lineageNode;
        let targetNode = direction==1?_lineageNode:lineageNode;
        let _lineageEdge = {
          'source': sourceNode.metadataId,
          'target': targetNode.metadataId
        };
        this.lineageEdges.push( _lineageEdge );

        this.makeLineageNode( _lineageNode, direction, followNode );
      }
    }
  }

  public closeColumnView() {
    if( this.selectedNode !== null ) {
      var index = this.selectedNode.index;
      var category = this.selectedNode.category;

      var seriesIdx = SeriesIndex.LINEAGE_DIAGRAM;
      const option = this.chart.getOption();
      option.series[seriesIdx].data[index].symbol = this.symbolInfo[NodeType[category]]['DEFAULT'];

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
        this.chartAreaResize();
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Initialise chart values and options
   * @private
   */
  private _initialiseChartValues() {

    const SVG_LOCATION: string = 'image://' + window.location.origin + '/assets/images/mdm/png/icon_';
    this.symbolInfo[NodeType[NodeType.MainNode]] = {
      DEFAULT: SVG_LOCATION + 'table.png',
      SELECTED: SVG_LOCATION + 'table_focus.png',
    };
    this.symbolInfo[NodeType[NodeType.NormalNode]] = {
      DEFAULT: SVG_LOCATION + 'table.png',
      SELECTED: SVG_LOCATION + 'table_focus.png',
    };

    this.chartOptions = {
      backgroundColor: '#ffffff',
      nodeScaleRatio: 1.0,
      tooltip: { show: true },
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
                    '{large|'+params.data.metadata.name+'}'
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
                  return params.data.metadata.name;
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
                return params.data.metadata.name;
              } else if( params.dataType==='edge' ) {
                var sourceId = params.data.source;
                var targetId = params.data.target;
                var sourceName = null;
                var targetName = null;
                this.lineageNodes.forEach( (node) => {
                  if(node.metadataId==sourceId) {
                    sourceName = node.metadata.name;
                  } else if(node.metadataId==targetId) {
                    targetName = node.metadata.name;
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
    const hScrollbarWith: number = 30;
    let minHeightSize: number = this.lineageHeight < 5 ? 500 : this.lineageHeight * 100;
    /*
    if( this.selectedNode && this.selectedNode.metadataId ) {
      minHeightSize = minHeightSize - 100;
    }
    */
    let fixHeight: number = minHeightSize;
    const minWidthSize: number = $('.ddp-lineage-view').width() - hScrollbarWith;
    $('.ddp-lineage-view').css('overflow-x', 'hidden');
    $('#chartCanvas').css('height', fixHeight+'px').css('width', minWidthSize+'px').css('overflow', 'hidden');
    if($('#chartCanvas').children()!=null && $('#chartCanvas').children()!=undefined){
      $('#chartCanvas').children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    if($('#chartCanvas').children().children()!=null && $('#chartCanvas').children().children()!=undefined) {
      $('#chartCanvas').children().children().css('height', fixHeight+'px').css('width', minWidthSize+'px');}
    $('#chartCanvas div:last-child').css('height', '');
    $('#chartCanvas div:last-child').css('width', '');
    if (resizeCall == true && this.chart != null) {this.chart.resize();}
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

