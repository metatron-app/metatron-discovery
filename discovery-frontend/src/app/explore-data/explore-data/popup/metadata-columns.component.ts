import {Component, ElementRef, Injector, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";
import {CodeTableService} from "../../../meta-data-management/code-table/service/code-table.service";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {FieldFormat} from "../../../domain/datasource/datasource";
import {ExploreDataUtilService, SortOption} from "../service/explore-data-util.service";

@Component({
  selector: 'explore-metadata-columns',
  templateUrl: './metadata-columns.component.html',
})
export class MetadataColumnsComponent extends AbstractComponent {

  readonly typeList = this.getMetaDataLogicalTypeList();
  public readonly ROLE = Type.Role;

  public sortOptions = {
    popularity: new SortOption('popularity'),
    physicalName: new SortOption('physicalName', 'desc'),
    name: new SortOption('name'),
  };

  @Input() readonly metadata: Metadata;

  @Input()
  public metadataId: string;

  @ViewChildren('codeTablePreview')
  public codeTablePreview: QueryList<ElementRef>;

  public columns: MetadataColumn[];

  public codeTableDetailList: {id: number, code: string, value: string}[];

  public isShowCodeTable: boolean = false;

  constructor(protected element: ElementRef,
              protected injector: Injector,
              private constant: ConstantService,
              private _metadataService: MetadataService,
              private exploreDataUtilService: ExploreDataUtilService,
              private _codeTableService: CodeTableService) {
    super(element,injector);
  }

  ngOnInit() {
    if (this.metadataId) {
      this.loadingShow();
      this._getColumns(this.metadataId);
    }
  }

  getConvertedType(column: MetadataColumn) {
    return column.type
      ? this.typeList.filter((type) => {
        return type.value === column.type;
      })[ 0 ].label
      : 'Select';
  }

  isDatasourceTypeMetadata(): boolean {
    return Metadata.isSourceTypeIsEngine(this.metadata.sourceType);
  }

  isTimestampTypeField(column: MetadataColumn): boolean {
    return MetadataColumn.isTypeIsTimestamp(column);
  }

  onClickInfoIcon(column: MetadataColumn): void {
    if (MetadataColumn.isEmptyFormat(column)) {
      column.format = new FieldFormat();
    }
    column.format.isShowTimestampValidPopup = true;
  }

  /**
   * Code Table open detail popup
   * @param column
   * @param idx
   */
  public onClickOpenCodeTable(column, idx) {
    if (column['isShowCodeTable']) {
      return;
    }

    // Only open if code table name exits
    if (!column.codeTable || !column.codeTable.name) {
      return;
    }

    // close already opened popup
    this.columns.forEach((item) => {
      item['isShowCodeTable'] = false;
    });

    // fetch codeTable detail
    this._codeTableService.getCodeTableDetail(column.codeTable.id).then((result) => {

      this.codeTableDetailList = result.codes;

      // open Close
      column.isShowCodeTable = true;

      // find popup top (css)
      const current = this.codeTablePreview.toArray()[idx].nativeElement;
      const parent = this.codeTablePreview.toArray()[idx].nativeElement.parentNode;

      current.style.top = (parent.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (parent.getBoundingClientRect().top - parent.offsetHeight + 'px')
        : (parent.getBoundingClientRect().top + 25 + 'px');
      current.style.left = parent.getBoundingClientRect().left + 'px';

    }).catch(error => {
      this.commonExceptionHandler(error)
    });
  }

  /**
   * On scroll close popups
   */
  public onScroll() {
    this.columns.forEach((item) => {
      item['isShowCodeTable'] = false;
    })
  }

  /**
   * Fetch column list
   * @param id
   * @private
   */
  private _getColumns(id: string) {
    this._metadataService.getColumnSchemaListInMetaData(id).then((result) => {

      // remove item with name == 'current_datetime'
      this.columns = result.filter((item) => {
        item['isShowCodeTable'] = false;
        return item.name !== 'current_datetime'
      });

      // sort columns ascending order by name
      this.exploreDataUtilService.sortList(this.columns, this.sortOptions, 'name');
      this.loadingHide();
    })
  }
}
