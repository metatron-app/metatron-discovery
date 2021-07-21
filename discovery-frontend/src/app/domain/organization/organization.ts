import {AbstractHistoryEntity} from "@domain/common/abstract-history-entity";

export class Organization extends  AbstractHistoryEntity{
  // organization id
  public id: string;
  // organization name
  public name: string;
  // organization description
  public description: string;
  // organization group count
  public groupCount: string;
  // organization member count;
  public userCount: string;

}
