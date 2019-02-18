import {AbstractPopupComponent} from "../../../../common/component/abstract-popup.component";
import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {DatasourceInfo} from "../../../../domain/datasource/datasource";
import {IngestionSettingComponent} from "../../component/ingestion-setting.component";

@Component({
  selector: 'create-snapshot-ingestion-select',
  templateUrl: './create-snapshot-source-ingestion.component.html'
})
export class CreateSnapshotSourceIngestionComponent extends AbstractPopupComponent {

  @ViewChild(IngestionSettingComponent)
  private _ingestionSettingComponent: IngestionSettingComponent;

  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  @Input('step')
  private _step: string;

  @Output('stepChange')
  private _stepChange: EventEmitter<string> = new EventEmitter();

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * scroll event
   */
  public onWindowScroll() {
    if (this._ingestionSettingComponent.isShowPartitionValidResult) {
      this._ingestionSettingComponent.isShowPartitionValidResult = false;
    }
  }

  /**
   * Changed page
   * @param {string} step
   */
  public onChangedPage(step: string): void {
    this._step = step === 'NEXT' ? 'snapshot-complete' : 'snapshot-configure';
    this._stepChange.emit(this._step);
  }

  /**
   * Step change click event
   * @param {string} route
   */
  public onClickPageChange(route: string): void {
    route === 'prev' ? this._ingestionSettingComponent.onClickPrev() : this._ingestionSettingComponent.onClickNext();
  }
}
