import { Component, ElementRef, Injector, Input } from '@angular/core';
import * as _ from 'lodash';
import {BaseOptionComponent} from "../base-option.component";
import {
  UIOption
} from '../../../common/component/chart/option/ui-option';

@Component({
  selector: 'map-common-option',
  templateUrl: './map-common-option.component.html'
})
export class MapCommonOptionComponent extends BaseOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

   // map type 설정
   public mapTypeFlag: boolean = false;


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
    * 배경맵을 변경한다
    */
   public changeMapType(type?: string) {

     // 해당 베이스맵 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       map: type
     });

     // update
     this.update();
   }

   /**
    * 라이센스 Notation을 변경한다
    */
   public changeLicenseNotation() {

     // 해당 라이센스 Notation으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       licenseNotation: this.uiOption.licenseNotation
     });

     // update
     this.update();
   }

   /**
    * toggle basemap
    */
   public toggleBaseMap(): void {

     this.uiOption.showMapLayer = !this.uiOption.showMapLayer;

     this.uiOption = <UIOption>_.extend({}, this.uiOption, { showMapLayer : this.uiOption.showMapLayer });

     this.update();
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

}
