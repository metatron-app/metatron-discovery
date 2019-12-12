import {Injectable, Injector} from "@angular/core";
import {AbstractService} from "../../../common/service/abstract.service";

@Injectable()
export class HivePersonalDatabaseService extends AbstractService {
  constructor(protected injector: Injector) {
    super(injector);
  }

  public createTable(workbenchId: string, tableInformation: any): Promise<any> {
    const url = this.API_URL + `plugins/hive-personal-database/workbenches/${workbenchId}/table`;
    return this.post(url, tableInformation);
  }
}
