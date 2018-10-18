import {AbstractService} from "../../../common/service/abstract.service";
import {Injectable} from "@angular/core";
import {Dataset} from "../../../domain/data-preparation/dataset";

@Injectable()
export class DataflowModelService extends AbstractService {

  private datasetsFromDataflow: Dataset[] = [];


  /**
   * Returns list of original Dataset list
   * @returns { string [] }
   */
  public getDatasetsFromDataflow () : Dataset[] {
    return this.datasetsFromDataflow;
  }


  /**
   * Set datasetIds From Dataflow from outer
   * @param {String[]} datasets
   */
  public setDatasetsFromDataflow (datasets : Dataset[]) {
    this.datasetsFromDataflow = datasets;
  }
}
