import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';
import {Type} from '../domain/type';
import {Filter} from '../domain/filter';
import {DataStorageConstant} from "../../../data-storage/constant/data-storage-constant";

/**
 * Service to be shared by the datasource and metadata
 */
@Injectable()
export class ConstantService {

  private readonly roleTypeFilters: Filter.Role[] = [
    new Filter.Role(this.translateService.instant('msg.comm.ui.list.all'), Type.Role.ALL, true, ''),
    new Filter.Role(this.translateService.instant('msg.comm.name.dim'), Type.Role.DIMENSION, false, 'ddp-dimension'),
    new Filter.Role(this.translateService.instant('msg.comm.name.mea'), Type.Role.MEASURE, false, 'ddp-measure'),
  ];

  private readonly typeFilters: Filter.Logical[] = [
    new Filter.Logical(this.translateService.instant('msg.comm.ui.list.all'), Type.Logical.ALL, ''),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.string'), Type.Logical.STRING, 'ddp-icon-type-ab'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.boolean'), Type.Logical.BOOLEAN, 'ddp-icon-type-tf'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.integer'), Type.Logical.INTEGER, 'ddp-icon-type-int'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.double'), Type.Logical.DOUBLE, 'ddp-icon-type-float'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.date'), Type.Logical.TIMESTAMP, 'ddp-icon-type-calen'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lnt'), Type.Logical.LNT, 'ddp-icon-type-latitude'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.lng'), Type.Logical.LNG, 'ddp-icon-type-longitude'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.point'), Type.Logical.GEO_POINT, 'ddp-icon-type-point'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.polygon'), Type.Logical.GEO_POLYGON, 'ddp-icon-type-polygon'),
    new Filter.Logical(this.translateService.instant('msg.storage.ui.list.geo.line'), Type.Logical.GEO_LINE, 'ddp-icon-type-line'),
  ];

  private readonly authenticationTypeFilters: Filter.Authentication[] = [
    new Filter.Authentication(this.translateService.instant('msg.comm.ui.list.all'), DataStorageConstant.Dataconnection.Authentiacation.ALL),
    new Filter.Authentication(this.translateService.instant('msg.storage.li.connect.always'), DataStorageConstant.Dataconnection.Authentiacation.MANUAL),
    new Filter.Authentication(this.translateService.instant('msg.storage.li.connect.account'), DataStorageConstant.Dataconnection.Authentiacation.USERINFO),
    new Filter.Authentication(this.translateService.instant('msg.storage.li.connect.id'), DataStorageConstant.Dataconnection.Authentiacation.DIALOG),
  ];

  private readonly geoCoordinates: string[] = [
    'EPSG:4326',
    'EPSG:4301'
  ];

  constructor(private translateService: TranslateService) {
  }

  public getGeoCoordinateList() {
    return _.cloneDeep(this.geoCoordinates);
  }

  public getRoleTypeFilterFirst() {
    return _.cloneDeep(this.roleTypeFilters[0]);
  }

  public getRoleTypeFilters() {
    return _.cloneDeep(this.roleTypeFilters);
  }

  public getRoleTypeFiltersFirstExceptAll() {
    return _.cloneDeep(this.roleTypeFilters.filter(type => type.value !== Type.Role.ALL)[0]);
  }

  public getRoleTypeFiltersExceptAll() {
    return _.cloneDeep(this.roleTypeFilters.filter(type => type.value !== Type.Role.ALL));
  }

  public getTypeFiltersFirst() {
    return _.cloneDeep(this.typeFilters[0]);
  }

  public getTypeFilters() {
    return _.cloneDeep(this.typeFilters);
  }

  public getTypeFiltersFirstExceptAll() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== Type.Logical.ALL)[0]);
  }

  public getTypeFiltersExceptAll() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== Type.Logical.ALL));
  }

  public getTypeFiltersInCreateStep() {
    const filters = _.cloneDeep(this.typeFilters);
    filters.push(new Filter.Logical(this.translateService.instant('msg.storage.ui.list.expression'), Type.Logical.USER_DEFINED, 'ddp-icon-type-expression'));
    return filters;
  }

  public getTypeFiltersInDimension() {
    return _.cloneDeep(
      this.typeFilters.filter(type => {
        return type.value !== Type.Logical.ALL
          && type.value !== Type.Logical.GEO_POINT
          && type.value !== Type.Logical.GEO_POLYGON
          && type.value !== Type.Logical.GEO_LINE;
      }));
  }

  public getTypeFiltersInDimensionIncludeGeoTypes() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== Type.Logical.ALL));
  }

  public getTypeFiltersInDimensionOnlyBaseTypeString() {
    return _.cloneDeep(this.typeFilters.filter(type => type.value !== Type.Logical.ALL));
  }

  public getTypeFiltersInMeasure() {
    return _.cloneDeep(
      this.typeFilters.filter(type => {
        return type.value !== Type.Logical.ALL && (type.value === Type.Logical.INTEGER || type.value === Type.Logical.DOUBLE);
      }));
  }

  public getAuthenticationTypeFilters() {
    return _.cloneDeep(this.authenticationTypeFilters);
  }
}
