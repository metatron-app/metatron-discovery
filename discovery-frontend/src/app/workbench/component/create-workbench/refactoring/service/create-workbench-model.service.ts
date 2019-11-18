import {Injectable, Injector} from "@angular/core";
import {PageResult} from "../../../../../domain/common/page";

@Injectable()
export class CreateWorkbenchModelService {
  // page
  pageResult: PageResult;
  // complete data
  name: string;
  description: string;
  isInvalidName: boolean;
  invalidNameMessage: string;
  isInvalidDescription: boolean;
  invalidDescriptionMessage: string;
  // connection
  connectionList;
  selectedConnection;
  // filters
  selectedAuthenticationType;
  selectedConnectionType;
  searchKeyword;
  selectedContentSort;

  initialCompleteData(): void {
    this.name = undefined;
    this.description = undefined;
    this.isInvalidName = undefined;
    this.invalidNameMessage = undefined;
    this.isInvalidDescription = undefined;
    this.invalidDescriptionMessage = undefined;
  }

  initialConnectionFilters(): void {
    this.selectedAuthenticationType = undefined;
    this.selectedConnectionType = undefined;
    this.searchKeyword = undefined;
    this.selectedContentSort = undefined;
  }

  initialConnection(): void {
    this.connectionList = undefined;
    this.selectedConnection = undefined;
    this.pageResult = undefined;
  }
}
