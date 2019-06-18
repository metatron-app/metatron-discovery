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

  private symbolInfo: any;

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

  /**
   * Get lineage map
   */
  public getLineageMap() {

    let test : boolean = false;
    if( test != false ) {
      let paramList = [
        {
          'description' : 'test1 -> test2',
          'fromMetaId' : 'test_meta1',
          'toMetaId' : 'test_meta2'
        }, {
          'description' : 'test2 -> test3',
          'fromMetaId' : 'test_meta2',
          'toMetaId' : 'test_meta3'
        }, {
          'description' : 'test4 -> test1',
          'fromMetaId' : 'test_meta4',
          'toMetaId' : 'test_meta1'
        }, {
          'description' : 'test3 -> test5',
          'fromMetaId' : 'test_meta3',
          'toMetaId' : 'test_meta5'
        }, {
          'description' : 'test2 -> test3',
          'fromMetaId' : 'test_meta2',
          'toMetaId' : 'test_meta3'
        }, {
          'description' : 'test6 -> test2',
          'fromMetaId' : 'test_meta6',
          'toMetaId' : 'test_meta2'
        }, {
          'description' : 'test7 -> test7',
          'fromMetaId' : 'test_meta7',
          'toMetaId' : 'test_meta6'
        }, {
          'description' : 'test3 -> test8',
          'fromMetaId' : 'test_meta3',
          'toMetaId' : 'test_meta8'
        }, {
          'description' : 'test9 -> test1',
          'fromMetaId' : 'test_meta9',
          'toMetaId' : 'test_meta1'
        }
      ];
      paramList.forEach(params => {
        this.lineageViewService.postLineageEdge(params).then((result) => {
          if (result) {
            console.error(result);
          }
        }).catch((error) => {
          console.error(error);
        });
      });

    }

    let metadataId = this.metaDataModelService.getMetadata().id;
    this.lineageViewService.getLineageMapForMetadata(metadataId).then((result) => {
      this.lineageNodes = [];
      this.lineageEdges = [];

      if (result) {
        this.makeLineageFromMap(result);
        this.drawChart();
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

    let lineageNode = {
      'metadataId': mapRoot.metaId,
      'positionX': this.lineageMaxDepth,
      'positionY': 0
    };
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
      followNodes = mapNode.fromMapNodes.filter(node => node.circuit == false);
    } else { // toward
      followNodes = mapNode.toMapNodes.filter(node => node.circuit == false);
    }

    var ignoreCircuit : boolean = false;
    if(ignoreCircuit != false) {
      if(direction === -1) { // forward
        followNodes = mapNode.fromMapNodes;
      } else { // toward
        followNodes = mapNode.toMapNodes;
      }
    }

    if( followNodes && followNodes.length>0 ) {
      for( var followNode of followNodes ) {
        var positionY = 0;
        var siblings = this.lineageNodes.filter( node => node.positionX == positionX );
        if( siblings ) {
          positionY = siblings.length;
        }
        let _lineageNode = {
          'metadataId': followNode.metaId,
          'positionX': positionX,
          'positionY': positionY
        };
        this.lineageNodes.push( _lineageNode );

        let _lineageEdge = {
          'source': direction==1?lineageNode.metadataId:_lineageNode.metadataId,
          'target': direction==1?_lineageNode.metadataId:lineageNode.metadataId,
        };
        this.lineageEdges.push( _lineageEdge );

        this.makeLineageNode( _lineageNode, direction, followNode );
      }
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

    this.chart.off('click');
    this.chart.on('click', (params) => {
      if(params===null) { return; }
      if(params.componentType!=='series') { return; }

      //console.log(params.dataType +'_'+ params.dataIndex +' is clicked');

      if( params.dataType==='node' ) {
        const option = this.chart.getOption();
        option.series[params.seriesIndex].nodes.map((node, idx) => {
          if(idx===params.dataIndex) {
            node.category = (node.category+1)%2;
            var nodeType = node.category==0?'CSV':'WRANGLED';
            node.symbol = this.symbolInfo[nodeType]['SELECTED'];
            node.symbolSize = [50,50];
            node.symbolOffset = [0,0];
          }
        });
        this.chart.setOption(option);
      }
    });

    this.lineageDepth = 0;
    this.lineageHeight = 0;
    this.chartNodes = this.lineageNodes.map((node,idx) => {
      node.name = node.metadataId;

      if( this.lineageDepth <= node.positionX ) { this.lineageDepth = node.positionX + 1; }
      if( this.lineageHeight <= node.positionY ) { this.lineageHeight = node.positionY + 1; }
      node.value = [node.positionX,node.positionY];

      node.category = 0;
      node.symbol = this.symbolInfo['CSV']['SELECTED'];
      node.symbolSize = [50,50];
      node.symbolOffset = [0,0];

      /* main node */
      if( node.metadataId === this.metaDataModelService.getMetadata().id ) {
        node.symbolSize = [70,70];
      }

      return node;
    });
    this.chartOptions.xAxis.min = 0;
    this.chartOptions.xAxis.max = this.lineageDepth;
    this.chartOptions.yAxis.min = 0;
    this.chartOptions.yAxis.max = this.lineageHeight;

    this.chartLinks = this.lineageEdges.map(edge => {
      let source : string = edge.source;
      let target : string = edge.target;
      let link : any = {
        'source': source,
        'target': target,
      };
      return link;
    });

    this.chartOptions.series[0].nodes = this.chartNodes;
    this.chartOptions.series[0].links = this.chartLinks;

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

    const SVG_LOCATION: string = 'image://' + window.location.origin + '/assets/images/datapreparation/png/icon_';

    this.symbolInfo = {
      'CSV' : {
        'DEFAULT': SVG_LOCATION + 'file_csv.png',
        'SELECTED': SVG_LOCATION + 'file_csv_focus.png',
      },
      'WRANGLED': {
        'DEFAULT': SVG_LOCATION + 'dataset_wrangled_.png',
        'SELECTED': SVG_LOCATION + 'dataset_wrangled_focus.png',
      }
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
      /*
      graphic: {
        type: 'text',
        position: [1,1],
        left:100,
        right:100,
        width: 100,
        height: 100,
        draggable: true,
        style: {
          text: 'test text',
          lineWidth: 1
        }
      },
      */
      series: [
        {
          type: 'graph',
          layout: 'circular',
          coordinateSystem: 'cartesian2d',
          focusNodeAdjacency: false,
          legendHoverLink: false,
          hoverAnimation: true,
          roam: true,
          draggable: true,
          itemStyle: {
            color: '#acacac',
            borderColor: '#1af'
          },
          categories: [
            {
              name: 'cat1',
              symbol: 'rect',
              symbolSize: [100,300],
              symbolKeepAspect: false,
              symbolOffset: [0, 0],
              label: {
                show: true,
                color: '#000',
                formatter: [
                  '{red|{b}}',
                  '{large|{c}}'
                ].join('\n'),
                rich: {
                  red: {
                    color: 'red',
                    lineHeight: 10
                  },
                  large: {
                    color: 'blue',
                    fontSize: 18,
                    fontFamily: 'Microsoft YaHei',
                    borderColor: '#449933',
                    borderRadius: 4
                  }
                }
              },
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                      offset: 0, color: 'red' // color at 0% position
                  }, {
                      offset: 1, color: 'blue' // color at 100% position
                  }],
                  global: false // false by default
                }
              }
            }, {
              name: 'cat2',
              symbol: 'circle',
              symbolSize: 150,
              label: {
                show: true,
                color: '#000',
                formatter: '{b}<br />{c}'
              }
            },
          ],
          edgeLabel: {
            show: true,
            color: '#000',
            formatter: (params) => {
              return 'edge label';
            }
          },
          tooltip: {
            formatter: 'metaId : <br />{b0}'
          },
          nodes: null,
          links: null,
          lineStyle: { normal: { opacity: 1, width: 0.5 } },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: 10,
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
    let fixHeight: number = minHeightSize;
    const minWidthSize: number = $('.ddp-lineage-view').width()- hScrollbarWith;
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

