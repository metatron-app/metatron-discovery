export namespace Criteria {

  export const KEY_EXTENSIONS = 'extensions';
  export const KEY_DATETIME_TYPE_SUFFIX = 'TYPE';
  export const QUERY_DELIMITER = '^';

  export class ListCriterion {
    criterionKey: ListCriterionKey;
    criterionType: ListCriterionType;
    criterionName: string;
    subCriteria?: ListCriterion[];
    filters?: ListFilter[];
    searchable?: boolean;
  }
  export class ListFilter {
    criterionKey?: ListCriterionKey;
    filterKey: string;
    filterName: string;
    filterValue: string;
    filterSubKey?: string;
    filterSubValue?: string;
  }

  export interface Criterion {
    criteria: ListCriterion[];
    defaultFilters: ListFilter[];
  }

  export enum ListCriterionType {
    CHECKBOX = 'CHECKBOX',
    RADIO = 'RADIO',
    DATETIME = 'DATETIME',
    RANGE_DATETIME = 'RANGE_DATETIME',
    TEXT = 'TEXT'
  }
  
  export enum ListCriterionKey {
    STATUS = 'STATUS',
    PUBLISH = 'PUBLISH',
    CREATOR = 'CREATOR',
    DATETIME = 'DATETIME',
    CONNECTION_TYPE = 'CONNECTION_TYPE',
    DATASOURCE_TYPE = 'DATASOURCE_TYPE',
    SOURCE_TYPE = 'SOURCE_TYPE',
    MORE = 'MORE',
    CONTAINS_TEXT = 'CONTAINS_TEXT',
    IMPLEMENTOR = 'IMPLEMENTOR',
    AUTH_TYPE = 'AUTH_TYPE',
    CREATED_TIME = 'CREATED_TIME',
    MODIFIED_TIME = 'MODIFIED_TIME'
  }

  // ONLY USE UI
  export enum DateTimeType {
    ALL = 'ALL',
    TODAY = 'TODAY',
    SEVEN_DAYS = 'SEVEN_DAYS',
    BETWEEN = 'BETWEEN'
  }
}
