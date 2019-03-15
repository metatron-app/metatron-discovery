import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Constant} from '../domain/constant';
import * as _ from 'lodash';

/**
 * Service to be shared by the datasource and metadata
 */
@Injectable()
export class ConstantService {

  private readonly roleTypeFilters: Constant.Filter.Role[] = [
    {label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL', checked: true},
    {label: this.translateService.instant('msg.comm.name.dim'), value: 'DIMENSION', checked: false},
    {label: this.translateService.instant('msg.comm.name.mea'), value: 'MEASURE', checked: false},
  ];

  private readonly typeFilters: Constant.Filter.Type[] = [
    {label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
    {label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING'},
    {label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN'},
    {label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', measure: true},
    {label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', measure: true},
    {label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP'},
    {label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT'},
    {label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG'},
    {label: this.translateService.instant('msg.storage.ui.list.geo.point'), value: 'GEO_POINT', derived: true},
    {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), value: 'GEO_POLYGON', derived: true},
    {label: this.translateService.instant('msg.storage.ui.list.geo.line'), value: 'GEO_LINE', derived: true},
  ];

  constructor(private translateService: TranslateService) {
  }

  public getRoleTypeFilterFirst() {
    return _.cloneDeep(this.roleTypeFilters[0]);
  }

  public getRoleTypeFilters() {
    return _.cloneDeep(this.roleTypeFilters);
  }

  public getTypeFiltersFirst() {
    return _.cloneDeep(this.typeFilters[0]);
  }

  public getTypeFilters() {
    return _.cloneDeep(this.typeFilters);
  }

}
