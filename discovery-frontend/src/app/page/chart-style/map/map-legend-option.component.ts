import { Component, ElementRef, Injector, Input } from '@angular/core';
import {BaseOptionComponent} from "../base-option.component";
import { AnnotationPosition, UIPosition } from '../../../common/component/chart/option/define/common';
import { UIOption } from '../../../common/component/chart/option/ui-option';
import * as _ from 'lodash';
@Component({
  selector: 'map-legend-option',
  templateUrl: './map-legend-option.component.html'
})
export class MapLegendOptionComponent extends BaseOptionComponent {

  // legend position list
  public legendPositionList: Object[] = [
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.right.bottom'), value: UIPosition.RIGHT_BOTTOM},
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.left.bottom'), value: UIPosition.LEFT_BOTTOM},
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.right.top'), value: UIPosition.RIGHT_TOP},
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.left.top'), value: UIPosition.LEFT_TOP}
  ];

  // constructor
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // if (!uiOption.legend) {
    //   uiOption.legend = {};
    //   uiOption.legend.pos = this.legendPositionList[0]['value'];
    //   uiOption.legend.showName = true;
    // }

    this.uiOption = uiOption;
  }

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

  /**
   * change legend position
   * @param legend
   */
  public changeLegendPos(legend: any): void {

    this.uiOption.legend.pos = legend['value'];

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { legend : this.uiOption.legend });

    this.update();
  }

  /**
   * toggle legend
   */
  public toggleLegend(): void {

    this.uiOption.legend.showName = !this.uiOption.legend.showName;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { legend : this.uiOption.legend });

    this.update();
  }

  /**
   * get index of legend position
   */
  public getLegendPosIndex(): number {

    const pos = this.uiOption.legend.pos;

    let index: number = 0;

    if (!pos) return 0;

    _.each(this.legendPositionList, (item, idx) => {

      if (item['value'] === pos) {
        index = idx;
        return;
      }
    });

    return index;
  }
}
