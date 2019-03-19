import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';
import {Type} from '../domain/type';
import {Filter} from '../domain/filter';
import Logical = Type.Logical;

/**
 * Service to be shared by the datasource and metadata
 */
@Injectable()
export class ConstantService {

  private readonly roleTypeFilters: Filter.Role[] = [
    new Filter.Role(this.translateService.instant('msg.comm.ui.list.all'), Type.Role.ALL, true),
    new Filter.Role(this.translateService.instant('msg.comm.name.dim'), Type.Role.DIMENSION, false),
    new Filter.Role(this.translateService.instant('msg.comm.name.mea'), Type.Role.MEASURE, false),
  ];

  private readonly typeFilters: Filter.Logical[] = [
    new Filter.Logical(this.translateService.instant('msg.comm.ui.list.all'), Type.Logical.ALL),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.string'), Type.Logical.STRING),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.boolean'), Type.Logical.BOOLEAN),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.integer'), Type.Logical.INTEGER),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.double'), Type.Logical.DOUBLE),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.date'), Type.Logical.TIMESTAMP),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lnt'), Type.Logical.LNT),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lng'), Type.Logical.LNG),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.point'), Type.Logical.GEO_POINT),
    // new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.polygon'), Type.Logical.GEO_POLYGON),
    // new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.line'), Type.Logical.GEO_LINE),
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

  public getTypeFiltersInCreateStep() {
    const filters = _.cloneDeep(this.typeFilters);
    filters.push(new Filter.Logical(this.translateService.instant('msg.storage.ui.list.user'), Type.Logical.USER_DEFINED));
    return filters;
  }

  public getTypeFiltersInDimension() {
    return _.cloneDeep(
      this.typeFilters.filter(type => {
        return type.value !== Logical.ALL
          && type.value !== Logical.GEO_POINT
          && type.value !== Logical.GEO_POLYGON
          && type.value !== Logical.GEO_LINE;
      }));
  }

  public getTypeFiltersInDimensionOnlyBaseTypeString() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== Logical.ALL));
  }

  public getTypeFiltersInMeasure() {
    return _.cloneDeep(
      this.typeFilters.filter(type => {
        return type.value !== Logical.ALL && (type.value === Logical.INTEGER || type.value === Logical.DOUBLE);
      }));
  }
}
