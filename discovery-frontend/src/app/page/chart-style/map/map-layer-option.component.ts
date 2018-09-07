import {
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import * as _ from 'lodash';
import {
  UIOption,
  ColorRange,
  UIChartColorByDimension,
  UIChartColorBySeries,
  UIChartColorByValue,
} from '../../../common/component/chart/option/ui-option';
import {
  ChartType,
  EventType,
  FontSize,
  UIFontStyle,
} from '../../../common/component/chart/option/define/common';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { BaseOptionComponent } from "../base-option.component";

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})

export class MapLayerOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {

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

  public color: Object = {
    by: 'NONE',
    column: '',
    schema: this.selectedDefaultColor,
    transparency: 100
  };

  public size: Object = {
    by: 'NONE',
    column: ''
  };

  public outline: Object = {
    color: this.selectedDefaultColor,
    thickness: 'NONE'
  };

  public clustering: boolean = false;
  public layerOptions: Object;

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

     // Set
     this.uiOption = uiOption;
   }

   /**
    * Chart - 맵차트 레이어 타입
    * @param layerType
    */
   public mapLayerType(layerType: string): void {

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
     } else if(colorType === 'MEASURE') {
       this.color['schema'] = 'VC1';
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
     if (this.uiOption.layers[this.layerNum].color.by === 'MEASURE') {

       // this.uiOption.layers[this.layerNum].color['ranges'] = this.setMeasureColorRange(ChartColorList[color['colorNum']]);
       //
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

     this.color['schema'] = color;

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

     this.update();
   }

   /**
    * 사이즈 타입 변경시
    * @param type 사이즈타입 (series(default), dimension)
    */
   public changeSizeType(sizeType: string) {

     this.size['by'] = sizeType;

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
    * outline on/off
    */
   public changeClusteringFlag() {

     this.clustering = !this.clustering;

     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
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
    * feature single color
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

     this.layerOptions = [{
       type: this.type,
       name: this.name,
       symbol: this.symbol,
       color: this.color,
       size: this.size,
       outline: this.outline,
       clustering: this.clustering
     }]

     return this.layerOptions;

   }

   /**
    * mapping, mappingArray값 설정
    * @param color
    * @returns {string[]}
    */
   private setUserCodes(color: Object): Object {

     // // color by series가 아닐거나 mapping값이 없을때 return
     // if ((!_.eq(ChartColorType.SERIES, this.uiOption.color.type) && !_.eq(ChartType.GAUGE, this.uiOption.type)) || (_.eq(ChartType.GAUGE, this.uiOption.type) && !_.eq(ChartColorType.DIMENSION, this.uiOption.color.type))  || !(<UIChartColorBySeries>this.uiOption.color).mapping) return;
     //
     // // 기존 색상 리스트
     // const colorList = ChartColorList[(<UIChartColorBySeries>this.uiOption.color).schema];
     // (<UIChartColorBySeries>this.uiOption.color).mappingArray.forEach((item, index) => {
     //
     //   // 다른코드값이 아닌경우
     //   if (_.eq(colorList[index], item['color'])) {
     //     const changedColorList = ChartColorList[color['colorNum']];
     //
     //     (<UIChartColorBySeries>this.uiOption.color).mapping[item['alias']] = changedColorList[index];
     //     (<UIChartColorBySeries>this.uiOption.color).mappingArray[index]['color'] = changedColorList[index];
     //   }
     // });
     //

     return (<UIChartColorBySeries>this.uiOption.color);
   }

   /**
    * 타입이 series, diemnsion일때 코드값이 같은경우 해당 코드 리스트에서 index를 가져온다
    * @returns {any}
    */
   public checkDefaultSelectedColor(): number {
     // 컬러리스트에서 같은 코드값을 가지는경우
     for (const item of this.defaultColorList) {

       // 코드값이 같은경우
       if (JSON.stringify(this.uiOption.layers[this.layerNum].color['schema']['colorNum']) === JSON.stringify(item['colorNum'])) {

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
       if (JSON.stringify(this.uiOption.layers[this.layerNum].color['schema']['colorNum']) === JSON.stringify(item['colorNum'])) {

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
     //   if (JSON.stringify(this.uiOption.layers[this.layerNum].color['schema']) === JSON.stringify(item['colorNum'])) {
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
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {


    this.type = this.uiOption.layers[this.layerNum].type;
    this.name = this.uiOption.layers[this.layerNum].name;
    this.symbol = this.uiOption.layers[this.layerNum].symbol;
    this.color = this.uiOption.layers[this.layerNum].color;
    this.size = this.uiOption.layers[this.layerNum].size;
    this.outline = this.uiOption.layers[this.layerNum].outline;
    this.clustering = this.uiOption.layers[this.layerNum].clustering;

    // Init
    super.ngOnInit();
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
    * 위에 uiOption 을 다시 재정의 하는 경우 레퍼런스가 변경되기 때문에
    * update를 호출해서 싱크를 맞추어야 함
    * uiOption 그대로 속성만 변경하면 자동으로 uiOptionChange 호출 됨
    */
   // public update(drawChartParam?: any) {
   //   this.uiOptionChange.emit(this.uiOption);
   //   if (drawChartParam) {
   //     this.setDrawChartParam.emit(drawChartParam);
   //   }
   //   debugger
   //   console.log('map update');
   // }

}
