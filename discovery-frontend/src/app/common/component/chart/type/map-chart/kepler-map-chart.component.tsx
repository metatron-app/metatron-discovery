import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Injector, OnDestroy, Output,
  ViewChild,
} from '@angular/core';
import React from 'react';
import {Provider} from 'react-redux';
import {render} from 'react-dom';
import store from './store/store';
import KeplerComponent from './kepler.component';
import {AbstractComponent} from '@common/component/abstract.component';
import {deleteEntry} from 'kepler.gl/src/actions';

declare let $: any;

@Component({
  selector: 'kepler-map-chart',
  template: '<div #mapArea style="width: 100%; height: 100%; display: block;"></div>'
})
export class KeplerMapChartComponent extends AbstractComponent implements OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('mapArea', { static: false })
  private area: ElementRef;

  @Output()
  public showNodata = new EventEmitter();

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
  public ngOnDestroy(): void {
    try {
      if (store.getState()['keplerGl'][this.compUUID]) {
        store.dispatch(deleteEntry(this.compUUID));
      }
    } catch (e) {
    }
  }

  // After View Init
  public ngAfterViewInit(): void {
    this.draw();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Map chart draw
   */
  public draw() {
    if ($('#kepler-gl__' + this.compUUID).length == 0) {
      this.render();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private render() {
    this.renderKeplerComponent();
  }

  private renderKeplerComponent()  {
    const mapboxAccessToken = 'pk.eyJ1IjoiZWx0cmlueSIsImEiOiJjanF6OG5oaDQwMDI4NDlueWhjdHB3eHRjIn0.kDLQfa4ITrAniE6m4_aeBw';
    render(
      <Provider store={store}>
        // @ts-ignore
        <KeplerComponent compId={this.compUUID} mapboxAccessToken={mapboxAccessToken} />
      </Provider>
      , this.area.nativeElement);
  }

}
