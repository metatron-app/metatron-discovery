import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {MetadataConstant} from "../../../metadata.constant";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {ConnectionComponent} from "../../../../data-storage/component/connection/connection.component";
import {DataconnectionService} from "../../../../dataconnection/service/dataconnection.service";
import {PageResult} from "../../../../domain/common/page";
import {Dataconnection} from "../../../../domain/dataconnection/dataconnection";
import * as _ from 'lodash';

@Component({
  selector: 'create-metadata-db-connection',
  templateUrl: 'create-metadata-db-connection.component.html'
})
export class CreateMetadataDbConnectionComponent extends AbstractComponent {

  @ViewChild(ConnectionComponent)
  private _connectionComponent: ConnectionComponent;

  @Input() readonly createData;
  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();

  connectionPresetList;
  selectedConnectionPreset;

  // constructor
  constructor(private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this._setConnectionPresetList();
    this._connectionComponent.init();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Change selected connection preset
   * @param preset
   */
  onSelectedConnectionPreset(preset): void {
    // change selected connection preset
    this.selectedConnectionPreset = preset;
    // set connection data in connection component
    this._setConnectionPresetDetailDataInConnectionComponent();
  }

  /**
   * Change to next step
   */
  changeToNextStep(): void {
    this.changeStep.emit(MetadataConstant.CreateStep.DB_SELECT);
  }

  /**
   * Set connection preset list
   * @param {number} pageNumber
   */
  setConnectionPresetList(pageNumber: number): void {
    if (this._isMoreConnectionList()) {
      this.pageResult.number = pageNumber;
      // set connection preset list
      this._setConnectionPresetList();
    }
  }

  /**
   * Is empty connection preset list
   * @return {boolean}
   */
  isEmptyConnectionPresetList(): boolean {
    return _.isNil(this.connectionPresetList) || this.connectionPresetList.length === 0;
  }

  /**
   * Is more connection list
   * @return {boolean}
   * @private
   */
  private _isMoreConnectionList(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
  }

  /**
   * Set connection preset list
   * @private
   */
  private _setConnectionPresetList(): void {
    // loading show
    this.loadingShow();
    // get connection preset list
    this.connectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // if exist preset list
        if (result['_embedded']) {
          this.connectionPresetList = _.isNil(this.connectionPresetList) ? result['_embedded'].connections : this.connectionPresetList.concat(result['_embedded'].connections);
        }
        // page
        this.pageResult = result['page'];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set connection preset detail data in connection component
   * @private
   */
  private _setConnectionPresetDetailDataInConnectionComponent(): void {
    // loading show
    this.loadingShow();
    //  get connection data in preset
    this.connectionService.getDataconnectionDetail(this.selectedConnectionPreset.id)
      .then((connection: Dataconnection) => {
        // loading hide
        this.loadingHide();
        // init
        this._connectionComponent.init(connection);
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get parameter for connection preset list
   * @param {PageResult} pageResult
   * @returns {Object}
   * @private
   */
  private _getConnectionPresetListParams(pageResult: PageResult): object {
    return {
      size: pageResult.size,
      page: pageResult.number,
      type: 'jdbc'
    };
  }
}
