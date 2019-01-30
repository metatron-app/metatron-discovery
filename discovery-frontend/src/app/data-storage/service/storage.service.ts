import {AbstractService} from "../../common/service/abstract.service";
import {Injectable, Injector} from "@angular/core";

@Injectable()
export class StorageService extends AbstractService {

  public static isEnableStageDB: boolean;

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * Check enable stageDB
   * @return {Promise<any>}
   */
  public checkEnableStageDB():Promise<any> {
    return this.get(this.API_URL + `storage/stagedb`).then(result => {
      StorageService.isEnableStageDB = result ? true : false;
      return result;
    });
  }
}
