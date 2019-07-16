import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {CreateWorkbenchModelService} from "./service/create-workbench-model.service";
import {WorkspaceService} from "../../../../workspace/service/workspace.service";
import {StringUtil} from "../../../../common/util/string.util";
import {SortConstant} from "../../../../common/constant/sort.constant";
import {ConstantService} from "../../../../shared/datasource-metadata/service/constant.service";
import {WorkbenchConstant} from "../../../workbench.constant";
import {StorageService} from "../../../../data-storage/service/storage.service";
import {ImplementorType} from "../../../../domain/dataconnection/dataconnection";
import * as _ from 'lodash';

@Component({
  selector: 'component-workbench-select',
  templateUrl: 'create-workbench-select.component.html'
})
export class CreateWorkbenchSelectComponent extends AbstractComponent {

  @Input() readonly workspaceId: string;

  connectionList;
  selectedConnection;
  // filters
  searchKeyword: string;
  authenticationTypeList = this.constant.getAuthenticationTypeFilters();
  selectedAuthenticationType;
  connectionTypeList;
  selectedConnectionType;
  // sort
  selectedContentSort;
  // enum
  SORT_KEY = SortKey;
  SORT_VALUE = SortConstant.SortValue;

  @Output() readonly closedPopup = new EventEmitter();
  @Output() readonly changeStep = new EventEmitter();

  // 생성자
  constructor(private createWorkbenchModel: CreateWorkbenchModelService,
              private workspaceService: WorkspaceService,
              private constant: ConstantService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    this._initView();
  }


  close(): void {
    this.closedPopup.emit();
  }

  next(): void {
    if (this.isNotEmptySelectedConnection()) {
      this.changeStep.emit(WorkbenchConstant.CreateStep.COMPLETE);
    }
  }

  isNotEmptySelectedConnection(): boolean {
    return this._isNotEmptyValue(this.selectedConnection);
  }

  isSelectedConnection(connection): boolean {
    return this.isNotEmptySelectedConnection() && this.selectedConnection.id === connection.id;
  }

  isMoreContents(): boolean {
    return this.pageResult.number < this.pageResult.totalPages -1;
  }

  getConvertedConnectionTypeLabel(implementor) {
    return this.connectionTypeList.find(type => type.value === implementor).label;
  }

  getConvertedAuthenticationTypeLabel(authentication): string {
    return this.authenticationTypeList.find(type => type.value === authentication).label;
  }

  onChangeSort(key: SortKey): void {
    // initial
    if (this.selectedContentSort.key !== key) {
      this.selectedContentSort.sort = SortConstant.SortValue.DEFAULT;
    }
    // change sort key
    this.selectedContentSort.key = key;
    switch (this.selectedContentSort.sort) {
      case SortConstant.SortValue.ASC:
        this.selectedContentSort.sort = SortConstant.SortValue.DESC;
        break;
      case SortConstant.SortValue.DESC:
        this.selectedContentSort.sort = SortConstant.SortValue.ASC;
        break;
      case SortConstant.SortValue.DEFAULT:
        this.selectedContentSort.sort = SortConstant.SortValue.DESC;
        break;
    }
    // set connection list
    this._setDataConnectionList(true);
  }

  onChangeSearchKeyword(keyword: string): void {
    this.searchKeyword = keyword;
    this.createWorkbenchModel.searchKeyword = keyword;
    // set connection list
    this._setDataConnectionList(true);
  }

  onChangeConnectionType(filter): void {
    if (this.selectedConnectionType.value !== filter.value) {
      this.selectedConnectionType = filter;
      this.createWorkbenchModel.selectedConnectionType = filter;
      // set connection list
      this._setDataConnectionList(true);
    }
  }

  onChangeAuthenticationType(filter): void {
    if (this.selectedAuthenticationType.value !== filter.value) {
      this.selectedAuthenticationType = filter;
      this.createWorkbenchModel.selectedAuthenticationType = filter;
      // set connection list
      this._setDataConnectionList(true);
    }
  }

  onChangeSelectedConnection(connection): void {
    // if empty or different
    if (this._isEmptyValue(this.selectedConnection) || this.selectedConnection.id !== connection.id) {
      this.selectedConnection = connection;
    } else {  // if same connection
      this.selectedConnection = undefined;
    }
    this.createWorkbenchModel.selectedConnection = this.selectedConnection;
  }

  onClickMoreContents(): void {
    if (this.isMoreContents()) {
      this.pageResult.number += 1;
      this._setDataConnectionList();
    }
  }

  private _isEmptyValue(value): boolean {
    return _.isNil(value);
  }

  private _isNotEmptyValue(value): boolean {
    return !this._isEmptyValue(value);
  }

  private _getConnectionParams() {
    const params = {
      size: this.page.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    // connection filter
    if (this.selectedConnectionType.value !== ImplementorType.ALL) {
      params['implementor'] = this.selectedConnectionType.value;
    }
    // authentication filter
    if (this.selectedAuthenticationType.value !== 'ALL') {
      params['authenticationType'] = this.selectedAuthenticationType.value;
    }
    // search
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['name'] = this.searchKeyword.trim();
    }
    return params;
  }

  private _setConnectionTypeList(): void {
    this.connectionTypeList = StorageService.connectionTypeList.reduce((result, type) => {
      const filter = {
        label: type.name,
        value: type.implementor
      };
      result.push(filter);
      return result;
    }, [{label: this.translateService.instant('msg.comm.ui.list.all'), value: ImplementorType.ALL}]);
  }

  private _setDataConnectionList(initial?: boolean): void {
    // initial
    if (initial) {
      this.pageResult.number = 0;
      this.connectionList = [];
    }
    // 로딩 show
    this.loadingShow();
    // 조회
    this.workspaceService.getConnections(this.workspaceId, this._getConnectionParams())
      .then((result) => {
        this.pageResult = result.page;
        this.createWorkbenchModel.pageResult = result.page;
        if (this._isNotEmptyValue(result._embedded)) {
          this.connectionList = this.connectionList.concat(result._embedded.connections);
        } else {
          this.connectionList = [];
        }
        this.createWorkbenchModel.connectionList = this.connectionList;
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _initView(): void {
    this._setConnectionTypeList();
    // if not empty data in model service
    if (this._isNotEmptyValue(this.createWorkbenchModel.pageResult)) {
      this.pageResult = this.createWorkbenchModel.pageResult;
    }
    if (this._isNotEmptyValue(this.createWorkbenchModel.selectedContentSort)) {
      this.selectedContentSort = this.createWorkbenchModel.selectedContentSort;
    } else {
      this.selectedContentSort = new Order();
    }
    if (this._isNotEmptyValue(this.createWorkbenchModel.selectedConnection)) {
      this.selectedConnection = this.createWorkbenchModel.selectedConnection;
    }
    if (this._isNotEmptyValue(this.createWorkbenchModel.searchKeyword)) {
      this.searchKeyword = this.createWorkbenchModel.searchKeyword;
    }
    if (this._isNotEmptyValue(this.createWorkbenchModel.selectedAuthenticationType)) {
      this.selectedAuthenticationType = this.createWorkbenchModel.selectedAuthenticationType;
    } else {
      this.selectedAuthenticationType = this.authenticationTypeList[0];
    }
    if (this._isNotEmptyValue(this.createWorkbenchModel.selectedConnectionType)) {
      this.selectedConnectionType = this.createWorkbenchModel.selectedConnectionType;
    } else {
      this.selectedConnectionType = this.connectionTypeList[0];
    }
    // is empty connection list in model service
    if (this._isEmptyValue(this.createWorkbenchModel.connectionList)) {
      this._setDataConnectionList(true);
    } else {
      this.connectionList = this.createWorkbenchModel.connectionList;
    }
  }
}

class Order {
  key: SortKey = SortKey.MODIFIED;
  sort: SortConstant.SortValue = SortConstant.SortValue.DESC;
}

enum SortKey {
  NAME = 'name',
  MODIFIED = 'modifiedTime'
}
