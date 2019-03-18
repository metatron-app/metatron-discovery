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
    new Filter.Role(this.translateService.instant('msg.comm.ui.list.all'), 'ALL', true),
    new Filter.Role(this.translateService.instant('msg.comm.name.dim'), Type.Role.DIMENSION, false),
    new Filter.Role(this.translateService.instant('msg.comm.name.mea'), Type.Role.MEASURE, false),
  ];

  private readonly typeFilters: Filter.Logical[] = [
    new Filter.Logical(this.translateService.instant('msg.comm.ui.list.all'), 'ALL'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.string'), Logical.STRING),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.boolean'), Logical.BOOLEAN),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.integer'), Logical.INTEGER),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.double'), Logical.DOUBLE),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.date'), Logical.TIMESTAMP),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lnt'), Logical.LNT),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lng'), Logical.LNG),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.point'), Logical.GEO_POINT),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.polygon'), Logical.GEO_POLYGON),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.line'), Logical.GEO_LINE),
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
