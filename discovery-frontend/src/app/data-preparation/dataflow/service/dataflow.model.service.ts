import {AbstractService} from "../../../common/service/abstract.service";
import {Injectable} from "@angular/core";
//import {Dataset} from "../../../domain/data-preparation/dataset";
import {PrDataset} from "../../../domain/data-preparation/pr-dataset";

@Injectable()
export class DataflowModelService extends AbstractService {

  //private datasetsFromDataflow: Dataset[] = [];
  private datasetsFromDataflow: PrDataset[] = [];

  private upstreamList = [];

  /**
   * Returns list of original Dataset list
   * @returns { string [] }
   */
  //public getDatasetsFromDataflow () : Dataset[] {
  public getDatasetsFromDataflow () : PrDataset[] {
    return this.datasetsFromDataflow;
  }


  /**
   * Set datasetIds From Dataflow from outer
   * @param {String[]} datasets
   */
  //public setDatasetsFromDataflow (datasets : Dataset[]) {
  public setDatasetsFromDataflow (datasets : PrDataset[]) {
    this.datasetsFromDataflow = datasets;
  }

  public setUpstreamList(upstream) {
    this.upstreamList = upstream;
  }

  public getUpstreamList() {
    return this.upstreamList;
  }
}
