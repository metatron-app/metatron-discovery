import {Component, ElementRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from "../../../common/component/abstract.component";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {TimezoneService} from "../../../data-storage/service/timezone.service";
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {MetadataModelService} from "../../../meta-data-management/metadata/service/metadata.model.service";
import {GridComponent} from "../../../common/component/grid/grid.component";
import * as _ from "lodash";
import {header, SlickGridHeader} from "../../../common/component/grid/grid.header";
import {GridOption} from "../../../common/component/grid/grid.option";
import {Datasource, Field, FieldFormatType, LogicalType} from "../../../domain/datasource/datasource";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {MetadataSource} from "../../../domain/meta-data-management/metadata-source";
import {Metadata} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'explore-metadata-sample-data',
  templateUrl: './metadata-sample-data.component.html',
})
export class MetadataSampleDataComponent extends AbstractComponent {

  @Input() readonly metadata;

  // filters
  roleTypeFilterList = this.constantService.getRoleTypeFilters();
  logicalTypeFilterList = this.constantService.getTypeFilters();
  selectedRoleTypeFilter = this.constantService.getRoleTypeFilterFirst();
  selectedLogicalTypeFilter = this.constantService.getTypeFiltersFirst();
  searchTextKeyword: string;
  // grid data
  fieldList;
  fieldRowList: {[key: string]: string}[];
  gridDataLimit: number = 50;
  isExistCreatedField: boolean;

  @ViewChild(GridComponent)
  private readonly _gridComponent: GridComponent;

  constructor(private constantService: ConstantService,
              private timezoneService: TimezoneService,
              private metadataService: MetadataService,
              private metadataModelService: MetadataModelService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    this._setMetadataSampleData();
  }

  isDatasourceTypeMetadata(): boolean {
    return !_.isNil(this.metadata.source) && Metadata.isSourceTypeIsEngine(this.metadata.sourceType);
  }

  isLinkedSourceType(): boolean {
    return MetadataSource.isNotEmptySource(this.metadata.source) && Datasource.isLinkedDatasource(this.metadata.source.source as Datasource);
  }

  /**
   * Extend grid header
   * @param args
   */
  extendGridHeader(args: any): void {
    // #2172 name -> physicalName, logicalName -> name
    $(`<div class="slick-data">${_.find(this.fieldList, {'physicalName': args.column.id})['name'] || ''}</div>`).appendTo(args.node);
  }

  private _isCreatedField(field): boolean {
    return !_.isNil(field.additionals) && field.additionals.derived === true;
  }

  private _setMetadataSampleData(): void {
    this.loadingShow();
    this.metadataService.getMetadataSampleData(this.metadata.id, this.gridDataLimit)
      .then((result: {size: number, data}) => {
        // if exist data
        if (!_.isNil(result.data)) {
          // set isExistCreatedField flag
          if (result.data.columnDescriptions.length > 0) {
            this.isExistCreatedField = result.data.columnDescriptions.some(col => !_.isNil(col.additionals) && col.additionals.derived === true);
          }
          // set field list
          this._setFieldList(result.data.columnNames, result.data.columnDescriptions);
          // set field data list
          this._setFieldRowList(result.data.columnNames, result.data.rows);
          // create grid
          this._updateGrid();
        }
        this.loadingHide();
      })
      .catch(error => {
        this.fieldList = [];
        this.commonExceptionHandler(error);
      });
  }

  private _setFieldList(colNames: string[], colDescs): void {
    this.fieldList = colDescs.map((col, index) =>  {
      return {
        ...col,
        colName: colNames[index]
      };
    });
  }

  private _setFieldRowList(colNames: string[], rows) {
    this.fieldRowList = rows.reduce((result, row) => {
      result.push(row.values.reduce((mappingRow, data, index) => {
        // #2172 if null or undefined, init empty string
        mappingRow[colNames[index]] = data || '';
        return mappingRow;
      }, {}));
      return result;
    }, []);
  }

  /**
   * Get grid header name
   * @param {Field} field
   * @param {string} headerName
   * @return {string}
   * @private
   */
  private _getGridHeaderName(field, headerName: string): string {
    return field.type === LogicalType.TIMESTAMP && (this.timezoneService.isEnableTimezoneInDateFormat(field.format) || field.format && field.format.type === FieldFormatType.UNIX_TIME)
      ? `<span style="padding-left:20px;"><em class="${this.getFieldTypeIconClass(this._getConvertedType(field.type, field.physicalType).toString())}"></em>${headerName}<div class="slick-column-det" title="${this._getTimezoneLabel(field.format)}">${this._getTimezoneLabel(field.format)}</div></span>`
      : `<span style="padding-left:20px;"><em class="${this.getFieldTypeIconClass(this._getConvertedType(field.type, field.physicalType).toString())}"></em>${headerName}</span>`;
  }

  private _getConvertedType(type: Type.Logical, logicalType: Type.Logical): Type.Logical {
    if (type === Type.Logical.LONG) {
      return Type.Logical.INTEGER;
    } else if (type === Type.Logical.STRUCT) {
      return logicalType;
    } else {
      return type;
    }
  }

  private _getFilteredFieldList(fieldList) {
    // if is datasource type metadata, enable role filter
    if (this.isDatasourceTypeMetadata()) {
      return this._getRoleFilteredFieldList(this._getTypeFilteredFieldList(fieldList));
    } else { // disable role filter
      return this._getTypeFilteredFieldList(fieldList);
    }
  }

  private _getRoleFilteredFieldList(fieldList) {
    // if selected ALL filter
    if (this.selectedRoleTypeFilter.value === Type.Role.ALL) {
      return fieldList;
    } else if (this.selectedRoleTypeFilter.value === Type.Role.DIMENSION) { // if selected DIMENSION filter
      return fieldList.filter(field => field.additionals.role === Type.Role.DIMENSION || field.additionals.role === Type.Role.TIMESTAMP);
    } else {  // if selected MEASURE filter
      return fieldList.filter(field => field.additionals.role === Type.Role.MEASURE);
    }
  }

  private _getTypeFilteredFieldList(fieldList) {
    if ( this.selectedLogicalTypeFilter.value === Type.Logical.ALL) {
      return fieldList;
    } else {
      return fieldList.filter(field => this._getConvertedType(field.type, field.physicalType) === this.selectedLogicalTypeFilter.value);
    }
  }

  /**
   * Get timezone label
   * @param {FieldFormat} format
   * @return {string}
   * @private
   */
  private _getTimezoneLabel(format): string {
    if (format.type === FieldFormatType.UNIX_TIME) {
      return 'Unix time';
    } else {
      return this.timezoneService.getConvertedTimezoneUTCLabel(this.timezoneService.getTimezoneObject(format).utc);
    }
  }

  /**
   * 그리드 header 리스트 생성
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getGridHeader(fields): header[] {
    // if exist created field list
    if (this.isExistCreatedField) {
      // Style
      const defaultStyle: string = 'line-height:30px;';
      const nullStyle: string = 'color:#b6b9c1;';
      const noPreviewGuideMessage: string = this.translateService.instant('msg.dp.ui.no.preview');

      // #2172 name -> physicalName, logicalName -> name
      return fields.map((field) => {
        const headerName: string = field.headerKey || field.physicalName;
        return new SlickGridHeader()
          .Id(headerName)
          .Name(this._getGridHeaderName(field, headerName))
          .Field(headerName)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (headerName.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .Formatter((row, cell, value) => {
            // if derived expression type or LINK geo type
            if (this._isCreatedField(field) && (field.type === LogicalType.STRING || this.isLinkedSourceType())) {
              return '<div  style="' + defaultStyle + nullStyle + '">' + noPreviewGuideMessage + '</div>';
            } else {
              return value;
            }
          })
          .build();
      });
    } else {
      return fields.map((field: Field) => {
        const headerName: string = field.headerKey || field.physicalName;
        return new SlickGridHeader()
          .Id(headerName)
          .Name(this._getGridHeaderName(field, headerName))
          .Field(headerName)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (headerName.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      });
    }
  }

  /**
   * 그리드 업데이트
   * @private
   */
  private _updateGrid(): void {
    // 헤더정보 생성
    const headers: header[] = this._getGridHeader(this._getFilteredFieldList(this.fieldList));
    // rows
    let rows: any[] = this.fieldRowList;
    // row and headers가 있을 경우에만 그리드 생성
    if (rows && 0 < headers.length) {
      if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
        rows = rows.map((row: any, idx: number) => {
          row.id = idx;
          return row;
        });
      }
      // if grid data limit bigger than rows length
      if (this.gridDataLimit > rows.length) {
        // set grid data limit
        this.gridDataLimit = rows.length;
      }
      // dom 이 모두 로드되었을때 작동
      this.changeDetect.detectChanges();
      // 그리드 생성
      this._gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .ShowHeaderRow(true)
        .HeaderRowHeight(32)
        .ExplicitInitialization(true)
        .build());
      // search
      this._gridComponent.search(this.searchTextKeyword || '');
      // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
      !_.isNil(this.metadata) && this._gridComponent.grid.init();
    } else {
      this._gridComponent.destroy();
    }
  }
}
