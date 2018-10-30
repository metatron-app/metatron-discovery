import {
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  NgZone,
  SimpleChanges
} from '@angular/core';
import * as _ from 'lodash';
import {
  UIOption,
  ColorRange,
  UIChartColorByDimension,
  UIChartColorBySeries,
  UIChartColorByValue
} from '../../../common/component/chart/option/ui-option';
import {
  CellColorTarget,
  ChartColorList,
  ChartColorType,
  ColorCustomMode,
  ColorRangeType
} from '../../../common/component/chart/option/define/common';

import { GradationGeneratorComponent } from '../../../common/component/gradation/gradation-generator.component';

import { ColorOptionConverter } from '../../../common/component/chart/option/converter/color-option-converter';

import {
  ChartType,
  EventType,
  FontSize,
  UIFontStyle,
} from '../../../common/component/chart/option/define/common';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { BaseOptionComponent } from "../base-option.component";
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { FormatOptionConverter } from '../../../common/component/chart/option/converter/format-option-converter';

import { OptionGenerator } from '../../../common/component/chart/option/util/option-generator';
import UI = OptionGenerator.UI;

@Component({
  selector: 'map-layer-option2',
  templateUrl: './map-layer-option2.component.html'
})

export class MapLayerOptionComponent2 extends BaseOptionComponent implements OnInit, OnDestroy {

  private gradationIndex: number;

  // series, dimension 색상 리스트
  public defaultColorList: Object[] = [
    { index: 1, colorNum: 'SC1' },
    { index: 2, colorNum: 'SC2' },
    { index: 3, colorNum: 'SC3' },
    { index: 4, colorNum: 'SC4' },
    { index: 5, colorNum: 'SC5' },
    { index: 6, colorNum: 'SC6' },
    { index: 7, colorNum: 'SC7' },
    { index: 8, colorNum: 'SC8' },
    { index: 9, colorNum: 'SC9' }
  ];

  public measureColorList: Object[] = [
    { index: 1, colorNum: 'VC1' },
    { index: 2, colorNum: 'VC2' },
    { index: 3, colorNum: 'VC3' },
    { index: 4, colorNum: 'VC4' },
    { index: 5, colorNum: 'VC5' },
    { index: 6, colorNum: 'VC6' },
    { index: 7, colorNum: 'VC7' }
  ];

  // measure 반전(value) 색상 리스트
  public measureReverseColorList: Object[] = [
    { index: 8, colorNum: 'VC8' },
    { index: 9, colorNum: 'VC9' },
    { index: 10, colorNum: 'VC10' },
    { index: 11, colorNum: 'VC11' },
    { index: 12, colorNum: 'VC12' },
    { index: 13, colorNum: 'VC13' },
    { index: 14, colorNum: 'VC14' },
    { index: 15, colorNum: 'VC15' },
    { index: 16, colorNum: 'VC16' },
    { index: 17, colorNum: 'VC17' },
    { index: 18, colorNum: 'VC18' },
    { index: 19, colorNum: 'VC19' }
  ];

  // 선택된 default 색상
  public selectedDefaultColor: Object = this.defaultColorList[0];

  // 선택된 measure 색상
  public selectedMeasureColor: Object = this.measureColorList[0];

  // 팔레트 show hide 설정
  public colorListFlag: boolean = false;

  public layerNum: number = 0;

  public type: string = 'symbol';

  public name: string = 'Layer1';

  public symbol: string = 'CIRCLE';

  public tile: string = 'HEXAGON';

  public color: Object = {
    by: 'NONE',
    column: '',
    schema: this.selectedDefaultColor,
    transparency: 100,
    resolution: 8
  };

  public size: Object = {
    by: 'NONE',
    column: '',
    max: 10
  };

  public outline: Object = {
    color: this.selectedDefaultColor,
    thickness: 'NONE',
    lineDash: 'SOLID'
  };

  public measureList = [];

  // range list for view
  public rangesViewList = [];

  // gradation seperate value
  public separateValue: number = 10;

  // gradation component
  @ViewChild(GradationGeneratorComponent)
  public gradationComp: GradationGeneratorComponent;

  // currently seleted color range
  public currentRange: ColorRange;

  // color type list
  public colorRangeTypeList = [{name : this.translateService.instant('msg.page.chart.color.measure.new.range.type.default'), value: ColorCustomMode.SECTION},
                              {name : this.translateService.instant('msg.page.chart.color.measure.new.range.type.gradient'), value: ColorCustomMode.GRADIENT}];

  // min / max
  public minValue: string;
  public maxValue: string;

  public availableRangeValue: string;

  public clustering: boolean = false;
  public viewRawData: boolean = false;
  public layerOptions: Object;

  // 색상의 기준이 되는 행/열 필드 리스트
  public fieldList: string[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

   // 선반데이터
   @Input('pivot')
   public pivot: Pivot;

   @Input('resultData')
   public resultData: Object;

   @ViewChild('blurRangeSlider2')
   private _blurRangeSlider: ElementRef;
   private _$blurRangeSlider: any;

   @ViewChild('radiusRangeSlider2')
   private _radiusRangeSlider: ElementRef;
   private _$radiusRangeSlider: any;

   @ViewChild('resolutionRangeSlider2')
   private _resolutionRangeSlider: ElementRef;
   private _$resolutionRangeSlider: any;

   @Input('uiOption')
   public set setUiOption(uiOption: UIOption) {

     // if( !uiOption.toolTip ) {
     //   uiOption.toolTip = {};
     // }
     // // displayTypes가 없는경우 차트에 따라서 기본 displayTypes설정
     // if (!uiOption.toolTip.displayTypes) {
     //   uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);
     // }
     //
     // uiOption.toolTip.previewList = this.setPreviewList(uiOption);
     //
     // // useDefaultFormat이 없는경우
     // if (typeof uiOption.toolTip.useDefaultFormat === 'undefined') uiOption.toolTip.useDefaultFormat = true;

     //Set
     if(this.resultData['data'][1].valueRange[uiOption.layers[1].color.column]) {
       const minValue = this.checkMinZero(this.resultData['data'][1].valueRange[uiOption.layers[1].color.column].minValue, this.resultData['data'][1].valueRange[uiOption.layers[1].color.column].minValue);

       this.minValue = FormatOptionConverter.getDecimalValue(minValue, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep);
       this.maxValue = FormatOptionConverter.getDecimalValue(this.resultData['data'][1].valueRange[uiOption.layers[1].color.column].maxValue, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep);
     }

     this.uiOption = uiOption;

     // Set field list
     this.fieldList = _.filter(this.uiOption.fieldList, (field) => {
       let isNotGeoField: boolean = true;
       _.each(this.pivot.columns, (dimension) => {
         if( _.eq(field, dimension.name)
           && (_.eq(dimension.field.logicalType, "GEO_POINT") || _.eq(dimension.field.logicalType, "GEO_LINE") || _.eq(dimension.field.logicalType, "GEO_POLYGON")) ) {
           isNotGeoField = false;
         }
       });
       return isNotGeoField;
     });
   }

   /**
    * Chart - 맵차트 레이어 타입
    * @param layerType
    */
   public mapLayerType(layerType: string): void {
     let geomType = this.uiOption.fielDimensionList[0].field.logicalType.toString();

     for(let field of this.uiOption.fielDimensionList) {
       if(field["layerNum"] && field["layerNum"] === 2) {
         geomType = field.field.logicalType.toString();
         break;
       }
     }

     if(geomType === "GEO_POINT") {
       if(layerType === "symbol" || layerType === "heatmap" || layerType === "heatmap" || layerType === "tile") {
         console.log("point");
       } else {
         return;
       }
     } else if(geomType === "GEO_LINE") {
       if(layerType === "line") {
         console.log("line");
       } else {
         return;
       }
     } else if(geomType === "GEO_POLYGON") {
       if(layerType === "polygon") {
         console.log("polygon");
       } else {
         return;
       }
     }

     if(layerType === "heatmap" && this.color["by"] === "DIMENSION") {
       this.color["by"] = "NONE";
       this.color["schema"] = "#602663";
     }

     this.type = layerType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * Chart - 레이어 심볼 타입
    * @param SymbolType
    */
   public symbolType(symbolType: string): void {

     this.symbol = symbolType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * Chart - 레이어 타일 타입
    * @param tileType
    */
   public tileType(tileType: string): void {

     this.tile = tileType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   // color type show hide 설정
   public colorTypeFlag: boolean = false;

   // color column show hide 설정
   public colorColumnFlag: boolean = false;

   // size type show hide 설정
   public sizeTypeFlag: boolean = false;

   // size column show hide 설정
   public sizeColumnFlag: boolean = false;

   // 투명도 설정
   public transparencyFlag: boolean = false;

   // 흐림 설정
   public blurFlag: boolean = false;

   // 반경 설정
   public radiusFlag: boolean = false;

   // Tile Resolution 설정
   public resolutionFlag: boolean = false;

   // Line Dashtype 설정
   public lineDashTypeFlag: boolean = false;

   /**
    * 컬러타입 변경시
    * @param type 컬러타입 (series(default), dimension)
    */
   public changeColorType(colorType: string) {

     this.color['by'] = colorType;

     // default schema
     if(colorType === 'NONE') {
       this.color['schema'] = '#602663';
     } else if(colorType === 'DIMENSION') {
       this.color['schema'] = 'SC1';
       // init column
       if (this.uiOption.layers[1]) {
         if (!this.uiOption.layers[1].color) this.uiOption.layers[1].color = {};
         this.uiOption.layers[1].color['column'] = "NONE";
       }
     } else if(colorType === 'MEASURE') {
       this.color['schema'] = 'VC1';
       // init column
       if (this.uiOption.layers[1]) {
         if (!this.uiOption.layers[1].color) this.uiOption.layers[1].color = {};
         this.uiOption.layers[1].color['column'] = "NONE";
       }
     }

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * 팔레트 색상을 변경한다
    */
   public changeColor(color: Object, gridColor?: Object) {

     // 차트 타입이 MEASURE인경우
     if (this.uiOption.layers[1].color.by === 'MEASURE') {

       this.uiOption.layers[1].color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][1], ChartColorList[color['colorNum']]);

       // // 선택된 컬러를 변수에 설정
       // if( _.eq(this.uiOption.type, ChartType.GRID) ) {
       //   this.selectedMeasureColor = color;
       //   color = gridColor;
       // }
     } else {
       // 선택된 컬러를 변수에 설정
       this.selectedDefaultColor = color;
     }

     // color by series일때 사용자 색상지정(mapping) 설정
     this.setUserCodes(color);

     this.color['schema'] = color['colorNum'];

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     // update
     this.update();
   }

   /**
    * 투명도 변경시
    * @param transparency 투명도
    */
   public changeTransparency(transparency: number) {

     this.color['transparency'] = transparency;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * 흐림 변경시
    * @param blur 흐림
    */
   public changeBlur(blur: number) {

     this.color['blur'] = blur;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }



   /**
    * 반경 변경시
    * @param blur 흐림
    */
   public changeRadius(radius: number) {

     this.color['radius'] = radius;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * Tile Resolution 변경시
    * @param resolution
    */
   public changeResolution(resolution: number) {

     this.color['resolution'] = resolution;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update({});
   }

   /**
    * 사이즈 타입 변경시
    * @param type 사이즈타입 (series(default), dimension)
    */
   public changeSizeType(sizeType: string) {

     this.size['by'] = sizeType;

     // default schema
     if(sizeType === 'NONE') {

     } else if(sizeType === 'MEASURE') {

       // init column
       if (this.uiOption.layers[1]) {
         if (!this.uiOption.layers[1].size) this.uiOption.layers[1].size = {};
         this.uiOption.layers[1].size['column'] = "NONE";
         this.clustering = false;
       }
     }

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * 사이즈 컬럼 변경시
    * @param sizeCol 사이즈컬럼 (series(default), dimension)
    */
   public changeSizeColumn(sizeCol: string) {

     this.size['column'] = sizeCol;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * 컬러 컬럼 변경시
    * @param colorCol 컬러컬럼 (series(default), dimension)
    */
   public changeColorColumn(colorCol: string) {

     this.color['column'] = colorCol;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * Chart - 아웃라인 타입
    * @param outlineType
    */
   public outlineType(outlineType: string): void {

     this.outline['thickness'] = outlineType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * Chart - 라인 유형
    * @param lineDashType
    */
   public lineDashType(lineDashType: string): void {

     this.outline["lineDash"] = lineDashType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * outline on/off
    */
   public changeOutlineFlag() {
     if(this.outline['thickness'] !== 'NONE') {
       this.outline['thickness'] = 'NONE';
     } else {
       this.outline['thickness'] = 'THIN';
     }

     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * cluster on/off
    */
   public changeClusteringFlag() {

     this.clustering = !this.clustering;

     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * view raw data on/off
    */
   public changeViewRawDataFlag() {

     this.viewRawData = !this.viewRawData;

     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update({});
   }

   /**
    * feature single color
    */
   public selectSingleColor(event: any) {
     this.color['schema'] = event;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   /**
    * feature outline color
    */
   public selectOutlineColor(event: any) {
     this.outline['color'] = event;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

   public changeLayerOption() {

     this.layerOptions = [this.uiOption.layers[0],{
       type: this.type,
       name: this.name,
       symbol: this.symbol,
       color: this.color,
       size: this.size,
       outline: this.outline,
       clustering: this.clustering,
       viewRawData: this.viewRawData
     },this.uiOption.layers[2]]

     this.measureList = [];
     for(let field of this.uiOption.fieldMeasureList) {
       if(field["layerNum"] && field["layerNum"] === 2) {
         this.measureList.push(field.alias.toString());
       }
     }

     // when color column is none or empty, set default column
     if (this.uiOption.layers && this.uiOption.layers.length > 0 &&
         'NONE' == this.uiOption.layers[1].color['column'] || !this.uiOption.layers[1].color['column']) {

       if (!this.uiOption.layers[1].color) this.uiOption.layers[1].color = {};

       const colorType = this.uiOption.layers[1].color.by;

       // when it's dimension, set default column
       if ('DIMENSION' === colorType) {

         this.uiOption.layers[1].color['column'] = this.uiOption.fieldList[0];

         // when it's measure, set default column
       } else if ('MEASURE' === colorType && this.measureList && this.measureList.length > 0) {

         this.uiOption.layers[1].color['column'] = this.measureList[0];
       }
     }

     // when size column is none or empty, set default column
     if (this.uiOption.layers && this.uiOption.layers.length > 0 &&
         'NONE' == this.uiOption.layers[1].size['column'] || !this.uiOption.layers[1].size['column']) {

       if (!this.uiOption.layers[1].size) this.uiOption.layers[1].size = {};

       const sizeType = this.uiOption.layers[1].size.by;

         // when it's measure, set default column
       if ('MEASURE' === sizeType && this.measureList && this.measureList.length > 0) {

         this.uiOption.layers[1].size['column'] = this.measureList[0];
       }
     }

     return this.layerOptions;
   }

   /**
    * 옵션관련 숫자값 문자형으로 변환
    * @param type, val
    * @return string
    */
   public translateNumber(type: string, val: number) {
     let resultVal = '';

     if(type === 'heatmapBlur') {
       if(val === 10) {
         resultVal = '20%';
       } else if(val === 15) {
         resultVal = '40%';
       } else if(val === 20) {
         resultVal = '60%';
       } else if(val === 25) {
         resultVal = '80%';
       } else if(val === 30) {
         resultVal = '100%';
       }
     }

     if(type === 'heatmapRadius') {
       if(val === 10) {
         resultVal = '20%';
       } else if(val === 15) {
         resultVal = '40%';
       } else if(val === 20) {
         resultVal = '60%';
       } else if(val === 25) {
         resultVal = '80%';
       } else if(val === 30) {
         resultVal = '100%';
       }
     }

     if(type === 'hexagonRadius') {
       if(val === 10) {
         resultVal = '100%';
       } else if(val === 9) {
         resultVal = '80%';
       } else if(val === 8) {
         resultVal = '60%';
       } else if(val === 7) {
         resultVal = '40%';
       } else if(val === 6) {
         resultVal = '20%';
       } else if(val === 5) {
         resultVal = '0%';
       }
     }

     if(type === 'transparency') {
       if(val === 80) {
         resultVal = '20%';
       } else if(val === 60) {
         resultVal = '40%';
       } else if(val === 40) {
         resultVal = '60%';
       } else if(val === 20) {
         resultVal = '80%';
       } else if(val === 0) {
         resultVal = '100%';
       }
     }

     return resultVal;
   }

   /**
    * mapping, mappingArray값 설정
    * @param color
    * @returns {string[]}
    */
   private setUserCodes(color: Object): Object {

     // // color by series가 아닐거나 mapping값이 없을때 return
     // if ((!_.eq(ChartColorType.SERIES, this.uiOption.layers[1].color.type) && !_.eq(ChartType.GAUGE, this.uiOption.type)) || (_.eq(ChartType.GAUGE, this.uiOption.type) && !_.eq(ChartColorType.DIMENSION, this.uiOption.layers[1].color.type))  || !(<UIChartColorBySeries>this.uiOption.layers[1].color).mapping) return;
     //
     // // 기존 색상 리스트
     // const colorList = ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[1].color).schema];
     // (<UIChartColorBySeries>this.uiOption.layers[1].color).mappingArray.forEach((item, index) => {
     //
     //   // 다른코드값이 아닌경우
     //   if (_.eq(colorList[index], item['color'])) {
     //     const changedColorList = ChartColorList[color['colorNum']];
     //
     //     (<UIChartColorBySeries>this.uiOption.layers[1].color).mapping[item['alias']] = changedColorList[index];
     //     (<UIChartColorBySeries>this.uiOption.layers[1].color).mappingArray[index]['color'] = changedColorList[index];
     //   }
     // });
     //

     return (<UIChartColorBySeries>this.uiOption.layers[1].color);
   }

   /**
    * 타입이 series, diemnsion일때 코드값이 같은경우 해당 코드 리스트에서 index를 가져온다
    * @returns {any}
    */
   public checkDefaultSelectedColor(): number {
     // 컬러리스트에서 같은 코드값을 가지는경우
     for (const item of this.defaultColorList) {

       // 코드값이 같은경우
       if (JSON.stringify(this.uiOption.layers[1].color['schema']) === JSON.stringify(item['colorNum'])) {

         return item['index'];
       }
     }
   }

   /**
    * 타입이 measure일때 코드값이 같은경우 해당 코드 리스트에서 index를 가져온다
    * @returns {any}
    */
   public checkMeasureSelectedColor(): void {

     let colorList: Object[] = [];

     // measure color list 합치기
     colorList = colorList.concat(this.measureColorList);
     colorList = colorList.concat(this.measureReverseColorList);

     // 컬러리스트에서 같은 코드값을 가지는경우
     for (const item of colorList) {

       // 코드값이 같은경우
       if (JSON.stringify(this.uiOption.layers[1].color['schema']) === JSON.stringify(item['colorNum'])) {

         return item['index'];
       }
     }

     // colorList = [];
     //
     // // Grid용: measure color list 합치기
     // colorList = colorList.concat(this.measureColorList);
     // colorList = colorList.concat(this.measureReverseColorList);
     //
     // // 컬러리스트에서 같은 코드값을 가지는경우
     // for (const item of colorList) {
     //
     //   // 코드값이 같은경우
     //   if (JSON.stringify(this.uiOption.layers[1].color['schema']) === JSON.stringify(item['colorNum'])) {
     //
     //     return item['index'];
     //   }
     // }
   }

   /**
    * 컬러리스트버튼 toggle시
    */
   public toggleColorList() {

     // colostListFlag 반대값 설정
     this.colorListFlag = !this.colorListFlag;
   }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private zone: NgZone) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    this.type = this.uiOption.layers[1].type;
    this.name = this.uiOption.layers[1].name;
    this.symbol = this.uiOption.layers[1].symbol;
    this.color = this.uiOption.layers[1].color;
    this.size = this.uiOption.layers[1].size;
    this.outline = this.uiOption.layers[1].outline;
    this.clustering = this.uiOption.layers[1].clustering;


    this.measureList = [];
    for(let field of this.uiOption.fieldMeasureList) {
      if(field["layerNum"] && field["layerNum"] === 2) {
        this.measureList.push(field.alias.toString());
      }
    }

    if(this.color['customMode']) {
      this.rangesViewList = this.color['ranges'];
    }

    if(this.type === "heatmap") {
      setTimeout(
        () => {
          this.setBlurSlider();
          this.setRadiusSlider();
        }
      );
    } else if(this.type === "tile") {
      setTimeout(
        () => {
          this.setResolutionSlider();
        }
      );
    }

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }


  // Color Option

  /**
   * color range on / off 버튼 변경시
   */
  public changeColorRange() {

    let colorOption = <any>this.uiOption.layers[1].color;

    // custom color setting이 없을때
    if (!this.uiOption.layers[1].color['customMode']) {

      colorOption['customMode'] = ColorCustomMode.SECTION;

      // ranges 값이 없는경우 uiOption update
      if (!(<UIChartColorByValue>this.uiOption.layers[1].color).ranges) {

        const ranges = this.setMeasureColorRange(this.uiOption, this.resultData['data'][1], ChartColorList[this.uiOption.layers[1].color['schema']]);

        this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).schema;
        this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[1].color).customMode;
        this.color['ranges'] = ranges;
        this.rangesViewList = ranges;

      }
    // color range hide일때
    } else {

      // color by measure기본 ranges값으로 초기화
      let ranges = this.setMeasureColorRange(this.uiOption, this.resultData['data'][1], <any>ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[1].color).schema]);

      this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).schema;
      this.color['ranges'] = ranges;
      this.color['customMode'] = null;

    }

    // this.uiOption = <UIOption>_.extend({}, this.uiOption, {
    //   color: colorOption
    // });

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

    this.update();
  }

  /**
   * 사용자 색상설정 타입 선택시
   */
  public selectColorRangeType(customMode: Object): void {

    if (this.uiOption.layers[1].color['customMode'] == customMode['value']) return;

    // 선택된 customMode 설정
    this.uiOption.layers[1].color['customMode'] = customMode['value'];

    // case gradation
    if (ColorCustomMode.GRADIENT == customMode['value']) {
      delete this.uiOption.layers[1].color['ranges'];
      delete this.uiOption.layers[1].color['visualGradations'];
      // gradation range initialize
      const obj = this.gradationInit(this.uiOption.layers[1].color['ranges'], true);

      this.uiOption.layers[1].color['ranges'] = obj['ranges'];
      this.rangesViewList = this.uiOption.layers[1].color['ranges'];
      this.uiOption.layers[1].color['visualGradations'] = obj['visualGradations'];
    // section일때
    } else if (ColorCustomMode.SECTION == customMode['value']) {
      delete this.uiOption.layers[1].color['ranges'];
      delete this.uiOption.layers[1].color['visualGradations'];
      // range initialize
      this.uiOption.layers[1].color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][1], <any>ChartColorList[this.uiOption.layers[1].color['schema']]);
      this.rangesViewList = this.uiOption.layers[1].color['ranges'];
    }

    // this.uiOption = <UIOption>_.extend({}, this.uiOption, {color : this.uiOption.layers[1].color});

    this.color = this.uiOption.layers[1].color;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

    this.update();
  }

  /**
   * 그라데이션 초기화설정
   */
  private gradationInit(gradations: Object[], initFl?: boolean): Object {

    let colorList = ChartColorList[this.uiOption.layers[1].color['schema']];

    const minValue = parseInt(this.resultData['data'][0].valueRange.minValue.toFixed(0));
    const maxValue = parseInt(this.resultData['data'][0].valueRange.maxValue.toFixed(0));

    if (!gradations || gradations.length == 0) {
      gradations = [
        {
          color: colorList[0],
          position: -4,
          value: minValue
        },
        {
          color: colorList[colorList.length - 1],
          position: 193,
          value: maxValue
        }
      ];
    }

    let data : Object= {min: minValue, max: maxValue, separateValue: this.separateValue, positionMin: -4, positionMax : 193};

    this.changeDetect.detectChanges();

    // gradation initialize
    const obj = this.gradationComp.init(gradations, data, initFl);

    // change emit이 안타는경우 type이 없을때 type값 설정
    if (initFl) obj['ranges'].forEach((item) => {if (!item['type']) {item['type'] = ColorRangeType.GRADIENT; return item} else { return item}});

    return obj;
  }

  /**
   * set minvalue zero by chart types
   * @param {number} minValue
   * @param {number} elseValue
   */
  private checkMinZero(minValue: number, elseValue: number) {

    let returnValue: number = elseValue;

    // switch(this.uiOption.type) {
    //
    //   // charts minvalue is zero
    //   case ChartType.BAR:
    //   case ChartType.LINE:
    //   case ChartType.SCATTER:
    //   case ChartType.BOXPLOT:
    //   case ChartType.COMBINE:
    //     if (minValue >= 0) returnValue = 0;
    // }

    return returnValue;
  }

  /**
   * color by measure)데이터에 맞게 색상 범위 균등분할
   */
  public equalColorRange(): void {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;

    let colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[1].color['schema']]);

    // rangeList에서의 색상을 색상리스트에 설정
    rangeList.reverse().forEach((item, index) => {

      colorList[index] = item.color;
    });

    // set color ranges
    this.uiOption.layers[1].color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][1], colorList, rangeList);

    // this.uiOption = <UIOption>_.extend({}, this.uiOption, { color : this.uiOption.layers[1].color });

    this.color = this.uiOption.layers[1].color;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

    this.update();
  }

  /**
   * return ranges of color by measure
   * @returns {any}
   */
  public setMeasureColorRange(uiOption, data, colorList: any, colorAlterList = []): ColorRange[] {

    // return value
    let rangeList = [];

    let rowsListLength = data.features.length;

    let gridRowsListLength = data.features.length;


    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = data.valueRange[uiOption.layers[1].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[1].color.column].minValue);

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (data.valueRange[uiOption.layers[1].color.column].maxValue - minValue) / colorListLength;

    let maxValue = _.cloneDeep(data.valueRange[uiOption.layers[1].color.column].maxValue);

    let shape;
    // if ((<UIScatterChart>uiOption).pointShape) {
    //   shape = (<UIScatterChart>uiOption).pointShape.toString().toLowerCase();
    // }

    // set decimal value
    const formatValue = ((value) => {
      return parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal));
    });

    // decimal min value
    let formatMinValue = formatValue(data.valueRange[uiOption.layers[1].color.column].minValue);
    // decimal max value
    let formatMaxValue = formatValue(data.valueRange[uiOption.layers[1].color.column].maxValue);

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      // set the biggest value in min(gt)
      if (colorListLength == index) {

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, formatMaxValue, null, formatMaxValue, null, shape));

      } else {
        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : formatValue(maxValue - addValue);

        // if value if lower than minValue, set it as minValue
        if (min < data.valueRange.minValue && min < 0) min = _.cloneDeep(formatMinValue);

          rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

        maxValue = min;
      }
    }

    return rangeList;
  }

  /**
   * 그라데이션 색상을 클릭시 input박스에 값설정
   * @param item
   * @param index
   */
  public showGradationColor(item, index) {

    // 선택된 값이 있는경우 => input박스 height값만큼 color picker top위치 내려줌
    if (undefined == this.gradationIndex && undefined !== item.value) {
      let top = $('.sp-container').not('.sp-hidden').offset().top;
      top += 30;
      $('.sp-container').not('.sp-hidden').css({top : top});
    }

    // 현재 그라데이션 리스트에서 선택된 index
    this.gradationIndex = index;

    // 리스트에서의 선택클래스 해제
    this.$element.find('.ddp-box-color').not('#ddp-box-color-' + index).find('.sp-replacer').removeClass('sp-active');

    // gradation바의 선택클래스 해제
    this.gradationComp.unselectSlider(item.index);

  }

  /**
   * 그라데이션 색상팝업이 닫힐때 그라데이션슬라이더도 클릭해제
   * @param {number} index
   */
  public hideGradationColor(index?: number) {

    if (!$(event.target).attr('class')) return;

    // 그라데이션 슬라이더 선택시
    if (-1 !== $(event.target).attr('class').indexOf('gradx_slider')) {

      // 현재 그라데이션 리스트에서 선택된 index
      this.gradationIndex = undefined;

    // 인풋박스, 리스트, 추가버튼 선택이 아닐때
    } else if (-1 == $(event.target).attr('class').indexOf('ddp-input-txt') &&
        -1 == $(event.target).attr('class').indexOf('sp-preview-inner') &&
        -1 == $(event.target).attr('class').indexOf('ddp-icon-apply') &&
        -1 == $(event.target).attr('class').indexOf('ddp-list-blank')) {

      // 다른 선택된 클래스 제거
      this.$element.find('.ddp-box-color').find('.sp-replacer').removeClass('sp-active');

      // currentValue 화면에 반영
      this.changeDetect.detectChanges();

      this.gradationComp.unselectSlider();

      // 현재 그라데이션 리스트에서 선택된 index
      this.gradationIndex = undefined;

    // 인풋박스일때
    } else if (null !== index && -1 !== $(event.target).attr('class').indexOf('ddp-input-txt')) {
      // 선택해제된 클래스 재설정
      this.$element.find('#ddp-box-color-' + index + ' .sp-replacer').addClass('sp-active');
    }
  }

  /**
   * 새로운 색상범위 추가버튼클릭시
   */
  public addNewRange(index: number) {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.resultData['data'][0].valueRange[this.uiOption.layers[1].color.column].minValue >= 0 ? 0 : Math.floor(Number(this.resultData['data'][0].valueRange[this.uiOption.layers[1].color.column].minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 최대값
    let maxValue = rangeList[index - 1].gt;
    let minValue = rangeList[index].gt ? rangeList[index].gt : uiMinValue;

    // 현재 단계의 최소값 설정
    minValue = minValue + (maxValue - minValue) / 2;

    const formatMinValue =  Math.floor(Number(minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);
    const formatMaxValue =  Math.floor(Number(maxValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 하위단계의 최대값 현재 최소값으로 변경
    rangeList[index].lte = formatMinValue;
    rangeList[index].fixMax = formatMinValue;

    let currentColor = rangeList[index].color;

    // 새로운 범위값 추가
    rangeList.splice(index, 0, UI.Range.colorRange(ColorRangeType.SECTION, currentColor, formatMinValue, formatMaxValue, formatMinValue, formatMaxValue));

    // this.color['type'] = this.uiOption.layers[1].color.type;
    this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).schema;
    this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[1].color).customMode;
    this.color['ranges'] = rangeList;
    this.color['colorTarget'] = this.uiOption.layers[1].color['colorTarget']

    // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

    this.update();
  }

  /**
   * 선택된 컬러범위를 제거
   */
  public removeColorRange(range: ColorRange, index: number) {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;

    // rangeList가 1개 남은경우 삭제불가
    if (1 == rangeList.length) return;

    let upperValue = rangeList[index - 1] ? rangeList[index - 1] : null;
    let lowerValue = rangeList[index + 1] ? rangeList[index + 1] : null;

    // 상위, 하위값 둘다있는경우
    if (upperValue && lowerValue) {
      // 상위범위 최대값
      let upperMaxValue = rangeList[index - 1].lte ? rangeList[index - 1].lte : rangeList[index - 1].gt;
      // 하위범위 최소값
      let lowerMinValue = rangeList[index + 1].gt ? rangeList[index + 1].gt : rangeList[index + 1].lte;

      // 삭제시 상위 최소값, 하위 최대값 자동변경값
      let autoChangeValue = Math.floor(Number((upperMaxValue + lowerMinValue) / 2) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);


      // 삭제된 상위값 최소값 변경
      rangeList[index - 1].gt = autoChangeValue;
      rangeList[index - 1].fixMin = autoChangeValue;
      // 삭제된 하위값 최대값 변경
      rangeList[index + 1].lte = autoChangeValue;
      rangeList[index + 1].fixMax = autoChangeValue;
    }

    // 리스트에서 선택된 컬러범위 제거
    rangeList.splice(index, 1);

    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();

  }

  /**
   * 컬러팔렛트의 색상을 선택시
   */
  public colorPaletteSelected(colorCode: string, item?: any) {

    // color by series일때
    // if (this.uiOption.layers[1].color['by'].toString() == ChartColorType.SERIES) {
    //   // 선택된 필드의 index 가져오기
    //   const index = _.findIndex(this.uiOption.fieldMeasureList, {alias: item.alias});
    //
    //   const color = ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[1].color).schema];
    //
    //   // 해당 선택된 아이템이 있는경우
    //   if (-1 !== index) {
    //
    //     // userCodes값이 없는경우 color codes값을 deep copy
    //     if (!(<UIChartColorBySeries>this.uiOption.layers[1].color).mapping) {
    //       (<UIChartColorBySeries>this.uiOption.layers[1].color).mapping = _.cloneDeep(color);
    //     }
    //
    //     // mapping list에 변경된값 설정
    //     (<UIChartColorBySeries>this.uiOption.layers[1].color).mappingArray[index]['color'] = colorCode;
    //
    //     // uiOption userCodes에 세팅
    //     (<UIChartColorBySeries>this.uiOption.layers[1].color).mapping[(<UIChartColorBySeries>this.uiOption.layers[1].color).mappingArray[index]['alias']] = colorCode;
    //
    //
    //     this.color['by'] = this.uiOption.layers[1].color.by;
    //     this.color['mapping'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).mapping;
    //     this.color['mappingArray'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).mappingArray;
    //     this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).schema;
    //     this.color['settingUseFl'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).settingUseFl;
    //
    //     // 해당 레이어 타입으로 설정
    //     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
    //      layers: this.changeLayerOption()
    //     });
    //
    //     this.update();
    //   }
    //   // color by measure일때
    // } else if (this.uiOption.layers[1].color['by'].toString() == ChartColorType.MEASURE) {

      const index = this.rangesViewList.indexOf(item);
      // 선택된 색상으로 설정
      (<UIChartColorByValue>this.uiOption.layers[1].color).ranges[index].color = colorCode;

      this.color['by'] = this.uiOption.layers[1].color.by;
      this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[1].color).schema;
      this.color['ranges'] = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;
      this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[1].color).customMode;

      // 해당 레이어 타입으로 설정
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
      });

      // 선택된 필드 제거
      this.currentRange = null;

      this.update();
    // }
  }

  /**
   * range max 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMaxInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;

    if (!range.lte || isNaN(FormatOptionConverter.getNumberValue(range.lte))) {

      // set original value
      range.lte = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMax, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.checkMinZero(this.resultData['data'][0].valueRange.minValue, this.resultData['data'][0].valueRange.minValue);

    // 하위 fixMin값
    const lowerfixMin = rangeList[index + 1] ?(rangeList[index + 1].fixMin) ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax : null;

    // 최소값인경우
    if (!rangeList[index + 1]) {

      // 사용가능범위인경우
      if (uiMinValue < range.lte && rangeList[index - 1].fixMin > range.lte) {

        range.fixMax = range.lte;
        rangeList[index-1].gt = range.lte;
      } else {
        // 기존값으로 리턴
        range.lte = range.fixMax;
      }
    }
    // 최대값이 입력가능범위를 벗어나는경우
    else if (range.fixMax < range.lte || (lowerfixMin > range.lte)) {

      // 기존값으로 리턴
      range.lte = range.fixMax;
    } else {
      range.fixMax = range.lte;
    }

    // 상위의 최대값에 같은값 입력
    if (rangeList[index - 1]) {

      rangeList[index - 1].fixMin = range.lte;
      rangeList[index - 1].gt = range.lte;
    }

    // 최소값이 현재 최대값보다 큰경우 최소값과 하위 최대값 변경
    if (null != range.fixMin && rangeList[index + 1] && range.fixMin > range.fixMax) {

      range.gt = range.fixMax;
      rangeList[index + 1].lte = range.fixMax;
      rangeList[index + 1].fixMax = range.fixMax;
    }

    // set changed range in list
    rangeList[index] = range;

    this.color = this.uiOption.layers[1].color;
    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();
  }

  /**
   * range min 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMinInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = (<UIChartColorByValue>this.uiOption.layers[1].color).ranges;

    if (!range.gt || isNaN(FormatOptionConverter.getNumberValue(range.gt))) {
      // set original value
      range.gt = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMin, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    let decimalValue = this.resultData['data'][0].valueRange.minValue;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.checkMinZero(this.resultData['data'][0].valueRange.minValue, decimalValue);

    // 입력가능 최소 / 최대범위 구하기
    let minValue = rangeList[index + 1] ? rangeList[index + 1].gt ? rangeList[index + 1].gt : uiMinValue :
                   rangeList[index].gt ? rangeList[index].gt : rangeList[index].lte;
    let maxValue = range.lte;

    // 최대값인경우 (변경불가)
    if (!rangeList[index - 1]) {

      // 최대값보다 큰거나 하위의 최대값보다 값이 작은경우
      if (this.resultData['data'][0].valueRange.maxValue < range.gt || rangeList[index + 1].fixMax > range.gt) {
        range.gt = range.fixMin;
      } else {
        range.fixMin = range.gt;
      }
    }
    // 최소값이 입력가능범위를 벗어나는경우
    else if (minValue > range.gt || maxValue < range.gt) {

      // 기존값으로 리턴
      range.gt = range.fixMin;
    } else {
      range.fixMin = range.gt;
    }

    // 하위의 최대값에 같은값 입력
    if (rangeList[index + 1]) {

      rangeList[index + 1].lte = range.gt;
      rangeList[index + 1].fixMax = range.gt;
    }

    // set changed range in list
    rangeList[index] = range;

    this.color = this.uiOption.layers[1].color;
    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();
  }

  /**
   * 입력 가능범위값 리턴
   */
  public availableRange(currentRnage: any, index: number): void {

    // color range list
    const rangeList = this.rangesViewList;

    let returnString: string = '';

    // case max value
    if (0 == index) {

      returnString += ': ' + currentRnage.fixMin;

    // case min value
    } else if (rangeList.length - 1 == index) {

      returnString += ': ' + currentRnage.fixMax;
    }
    else {

      // 하위값이 있는경우 하위값의 min값이 있는경우 min값으로 설정 없는경우 최소값 설정
      let availableMin = !rangeList[index + 1] ? null : rangeList[index + 1].fixMin ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax;
      let availableMax = currentRnage.fixMax;

      if (null !== availableMin) returnString += ': ' + availableMin.toString() + ' ~ ';
      if (null !== availableMax) returnString += availableMax.toString();
    }

    this.availableRangeValue = returnString;
  }

  /**
   * parse string to float
   * @param range
   * @returns {any}
   */
  private parseStrFloat(range: any): any {

    range.fixMax = null == range.fixMax ? null : FormatOptionConverter.getNumberValue(range.fixMax);
    range.fixMin = null == range.fixMin ? null : FormatOptionConverter.getNumberValue(range.fixMin);
    range.gt     = null == range.gt ? null : FormatOptionConverter.getNumberValue(range.gt);
    range.lte    = null == range.lte ? null : FormatOptionConverter.getNumberValue(range.lte);
    return range;
  }

  /**
   * 변경된 gradation 리스트값 설정
   * @param {Object} data
   */
  public changeGradations(data: Object) {

    this.uiOption.layers[1].color['visualGradations'] = data['visualGradations'];

    data['ranges'].forEach((item) => {if (!item.type) {item.type = ColorRangeType.GRADIENT; return item} else { return item}});

    if (JSON.stringify(data['ranges']) != JSON.stringify(this.uiOption.layers[1].color['ranges'])) {
      this.uiOption.layers[1].color['ranges'] = data['ranges'];

      this.rangesViewList = this.uiOption.layers[1].color['ranges'];
    }

    // binding된 데이터에 반영이 안되므로 zone run으로 실행
    this.zone.run(() => {
      // this.uiOption = <UIOption>_.extend({}, this.uiOption, {
      //   color: this.uiOption.color
      // });

      this.color = this.uiOption.layers[1].color;

      // 해당 레이어 타입으로 설정
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
      });
    });

    // 화면에 추가된 리스트 반영
    this.changeDetect.detectChanges();

    this.$element.find('.ddp-box-color').find('.sp-replacer').removeClass('sp-active');
    // 같은 index번째의 리스트값에서 선택 클래스 설정
    this.$element.find('.ddp-box-color#ddp-box-color-' + data['currentSliderIndex']).find('.sp-replacer').addClass('sp-active');

    // update
    this.update();
  }

  /**
   * 그라데이션 색상 범위 삭제
   */
  public deleteGradientRange(currentIndex: number) {

    // 리스트에서 선택된클래스 해제
    this.$element.find('.ddp-box-color').find('.sp-replacer').removeClass('sp-active');

    this.gradationComp.unselectSlider();

    this.gradationComp.deleteRange(currentIndex);
  }

  /**
   * 그라데이션의 리스트의 색상 변경시
   * @param colorStr
   * @param item
   */
  public gradationColorSelected(colorStr: string, item: any) {

    const rgbColor = this.setHextoRgb(colorStr);

    this.gradationComp.changeGradationColor(item.index, rgbColor);
  }

  /**
   * hex에서 rgb값으로 변경
   * @param color
   * @returns {string}
   */
  private setHextoRgb(color: string): string {

    color = _.cloneDeep(color.replace('#', ''));

    const rColor = parseInt(color.substring(0,2),16);
    const gColor = parseInt(color.substring(2,4),16);
    const bColor = parseInt(color.substring(4),16);

    return 'rgb(' + rColor + ',' + gColor + ',' + bColor + ')';
  }

  /**
   * 그라데이션 색상의 범위를 추가
   */
  public addGradientRange(currentIndex: number) {

    // 첫번째 아이템이 아닌경우에만 현재 index의 앞의 index 설정
    currentIndex = 0 !== currentIndex ? currentIndex - 1 : 0;

    // 새로운 범위 추가
    this.gradationComp.addNewRangeIndex(currentIndex);
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    if(this.type === "heatmap") {
      setTimeout(
        () => {
          this.setBlurSlider();
          this.setRadiusSlider();
        }
      );
    } else if(this.type === "tile") {
      setTimeout(
        () => {
          this.setResolutionSlider();
        }
      );
    }


  } // function - ngOnChanges

  public setRadiusSlider() {
    const scope = this;
    this._$radiusRangeSlider = $(this._radiusRangeSlider.nativeElement);
    this._$radiusRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 30,
        from: scope.uiOption.layers[0].color.radius,
        type: 'single',
        step: 5,
        onChange(data) {
          scope.changeRadius(data.from);
        }
        // onFinish(data) {
          // scope._updateBoundValue(data);
          // scope.change.emit(scope.getData());
        // }
      })
  }

  public setResolutionSlider() {
    const scope = this;
    this._$resolutionRangeSlider = $(this._resolutionRangeSlider.nativeElement);
    this._$resolutionRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 10,
        from: scope.uiOption.layers[0].color.resolution,
        type: 'single',
        step: 1,
        onChange(data) {
          scope.changeResolution(data.from);
        }
        // onFinish(data) {
          // scope._updateBoundValue(data);
          // scope.change.emit(scope.getData());
        // }
      })
  }

  public setBlurSlider() {
    const scope = this;
    this._$blurRangeSlider = $(this._blurRangeSlider.nativeElement);
    this._$blurRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 30,
        from: 5,
        type: 'single',
        step: 5,
        onChange(data) {
          scope.changeBlur(data.from);
        }
        // onFinish(data) {
          // scope._updateBoundValue(data);
          // scope.change.emit(scope.getData());
        // }
      })
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

   /**
    * 위에 uiOption 을 다시 재정의 하는 경우 레퍼런스가 변경되기 때문에
    * update를 호출해서 싱크를 맞추어야 함
    * uiOption 그대로 속성만 변경하면 자동으로 uiOptionChange 호출 됨
    */
   // public update(drawChartParam?: any) {
   //   this.uiOptionChange.emit(this.uiOption);
   //   if (drawChartParam) {
   //     this.setDrawChartParam.emit(drawChartParam);
   //   }
   //   // debugger
   //   console.log('map update');
   // }

}
