import {AbstractService} from '../../common/service/abstract.service';
import {Injectable, Injector} from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class StorageService extends AbstractService {

  private isEnableStageDatabase: boolean;

  constructor(protected injector: Injector) {
    super(injector);
  }

  public isEnableStageDB() {
    return this.isEnableStageDatabase;
  }

  /**
   * Check enable stageDB
   * @return {Promise<any>}
   */
  public checkEnableStageDB() {
    return new Promise((resolve, reject) => {
      this.get( `${this.API_URL}storage/stagedb`).then(result => {
        this.isEnableStageDatabase = _.negate(_.isNil)(result);
        resolve(result);
      }).catch(error => {
        this.isEnableStageDatabase = false;
        reject(error);
      });
    });
  }
}
