import {AbstractService} from "../../../common/service/abstract.service";
import {Injectable} from "@angular/core";
//import {Dataset} from "../../../domain/data-preparation/dataset";
import {Subject} from "rxjs";
import {DsType, PrDataset} from "../../../domain/data-preparation/pr-dataset";
import * as _ from 'lodash' ;

@Injectable()
export class DataflowModelService extends AbstractService {

  private datasetsFromDataflow: PrDataset[] = [];

  private upstreamList = [];

  public scrollClose = new Subject();
  public scrollClose$ = this.scrollClose.asObservable();

  private _selectedDsId: string;

  private _selectedDsType: DsType;

  /**
   * Returns list of original Dataset list
   * @returns { string [] }
   */
  public getDatasetsFromDataflow () : PrDataset[] {
    return this.datasetsFromDataflow;
  }


  /**
   * Set datasetIds From Dataflow from outer
   * @param {String[]} datasets
   */
  public setDatasetsFromDataflow (datasets : PrDataset[]) {
    this.datasetsFromDataflow = datasets;
  }

  public setUpstreamList(upstream) {
    this.upstreamList = upstream;
  }

  public getUpstreamList() {
    return this.upstreamList;
  }

  public getSelectedDsId(): string {
    return this._selectedDsId;
  }

  public setSelectedDsId(value: string) {
    this._selectedDsId = value;
  }

  public getSelectedDsType(): DsType {
    return this._selectedDsType;
  }

  public setSelectedDsType(value: DsType) {
    this._selectedDsType = value;
  }

  public isSelectedDsIdAndDsTypeEmpty() : boolean {
    return _.isNil(this._selectedDsId);
  }

  public emptyDsIdAndDsType() {
    this._selectedDsId = null;
    this._selectedDsType = null;
  }

}
