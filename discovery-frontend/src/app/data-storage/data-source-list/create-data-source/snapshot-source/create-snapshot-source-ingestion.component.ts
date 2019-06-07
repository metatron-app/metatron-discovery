import {AbstractPopupComponent} from "../../../../common/component/abstract-popup.component";
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {DatasourceInfo} from "../../../../domain/datasource/datasource";
import {IngestionSettingComponent} from "../../component/ingestion-setting.component";
import {SsType} from "../../../../domain/data-preparation/pr-snapshot";
import {DataStorageConstant} from "../../../constant/data-storage-constant";

@Component({
  selector: 'create-snapshot-ingestion-select',
  templateUrl: './create-snapshot-source-ingestion.component.html'
})
export class CreateSnapshotSourceIngestionComponent extends AbstractPopupComponent implements OnChanges {

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
   * ngOnChanges
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // if changed source Data
    if (changes._sourceData) {
      this._ingestionSettingComponent.init(
        this._sourceData, this._sourceData.snapshotData.selectedSnapshot.ssType === SsType.STAGING_DB ? 'SNAPSHOT-STAGING' : 'SNAPSHOT',
        this._sourceData.schemaData.selectedTimestampType === DataStorageConstant.Datasource.TimestampType.CURRENT ? null :  this._sourceData.schemaData.selectedTimestampField,
        this._sourceData.schemaData.isChangedTimestampField
      );
      // remove changed flag
      delete this._sourceData.schemaData.isChangedTimestampField;
    }
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
    route === 'PREV' ? this._ingestionSettingComponent.onClickPrev() : this._ingestionSettingComponent.onClickNext();
  }
}
