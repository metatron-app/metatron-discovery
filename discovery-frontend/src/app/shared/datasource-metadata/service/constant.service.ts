import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Constant} from '../domain/constant';
import * as _ from 'lodash';
import {Type} from "../domain/type";
import Logical = Type.Logical;

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

  private readonly typeFilters: Constant.Filter.Logical[] = [
    {label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL'},
    {label: this.translateService.instant('msg.storage.ui.list.string'), value: Logical.STRING},
    {label: this.translateService.instant('msg.storage.ui.list.boolean'), value: Logical.BOOLEAN},
    {label: this.translateService.instant('msg.storage.ui.list.integer'), value: Logical.INTEGER},
    {label: this.translateService.instant('msg.storage.ui.list.double'), value: Logical.DOUBLE},
    {label: this.translateService.instant('msg.storage.ui.list.date'), value: Logical.TIMESTAMP},
    {label: this.translateService.instant('msg.storage.ui.list.lnt'), value: Logical.LNT},
    {label: this.translateService.instant('msg.storage.ui.list.lng'), value: Logical.LNG},
    {label: this.translateService.instant('msg.storage.ui.list.geo.point'), value: Logical.GEO_POINT},
    {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), value: Logical.GEO_POLYGON},
    {label: this.translateService.instant('msg.storage.ui.list.geo.line'), value: Logical.GEO_LINE},
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

  public getTypeFiltersInDimension() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== 'ALL' && type.value !== Logical.GEO_POINT && type.value !== Logical.GEO_POLYGON && type.value !== Logical.GEO_LINE));
  }

  public getTypeFiltersInDimensionOnlyBaseTypeString() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== 'ALL'));
  }

  public getTypeFiltersInMeasure() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== 'ALL' && (type.value === Logical.INTEGER || type.value === Logical.DOUBLE)));
  }
}
