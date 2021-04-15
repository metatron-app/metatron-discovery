import {Component, ElementRef, Injector, Input, OnInit, ViewChildren} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {FieldFormat} from '@domain/datasource/datasource';
import {MetadataColumn} from '@domain/meta-data-management/metadata-column';
import {Metadata} from '@domain/meta-data-management/metadata';
import {Type} from '../../../shared/datasource-metadata/domain/type';
import {MetadataService} from '../../../meta-data-management/metadata/service/metadata.service';
import {CodeTableService} from '../../../meta-data-management/code-table/service/code-table.service';
import {ExploreDataUtilService, SortOption} from '../service/explore-data-util.service';

@Component({
  selector: 'explore-metadata-columns',
  templateUrl: './metadata-columns.component.html',
})
export class MetadataColumnsComponent extends AbstractComponent implements OnInit {

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
  public codeTablePreview: ElementRef;
  @ViewChildren('codeTable')
  private _codeTable: ElementRef;

  @ViewChildren('dictionaryPreview')
  public dictionaryPreview: ElementRef;
  @ViewChildren('dictionary')
  private readonly dictionary: ElementRef;

  public columns: MetadataColumn[];

  public codeTableDetailList: { id: number, code: string, value: string }[];

  public isShowCodeTable: boolean = false;

  constructor(protected element: ElementRef,
              protected injector: Injector,
              private _metadataService: MetadataService,
              private _codeTableService: CodeTableService,
              public exploreDataUtilService: ExploreDataUtilService) {
    super(element, injector);
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
      })[0].label
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

  public onHoverOpenDictionary(column, index) {
    if (column['isShowDictionary']) {
      return;
    }

    // Only open if code table name exits
    if (!column.dictionary) {
      return;
    }

    this.columns.forEach((item) => {
      item['isShowDictionary'] = false;
    });

    column.isShowDictionary = true;
    this.safelyDetectChanges();

    const table = this.dictionary['_results'][index].nativeElement;
    const preview = this.dictionaryPreview['_results'][index].nativeElement;

    this.changeDetect.detectChanges();

    preview.style.top = (table.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
      ? (table.getBoundingClientRect().top - preview.offsetHeight + 'px')
      : (table.getBoundingClientRect().top + 15 + 'px');
    preview.style.left = table.getBoundingClientRect().left + 'px';

  }

  /**
   * Code Table open detail popup
   * @param column
   * @param index
   */
  public onHoverOpenCodeTable(column, index) {
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

      this.safelyDetectChanges();

      // find popup top (css)
      const table = this._codeTable['_results'][index].nativeElement;
      const preview = this.codeTablePreview['_results'][index].nativeElement;

      preview.style.top = (table.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (table.getBoundingClientRect().top - preview.offsetHeight + 'px')
        : (table.getBoundingClientRect().top + 15 + 'px');
      preview.style.left = table.getBoundingClientRect().left + 'px';

    }).catch(error => {
      this.commonExceptionHandler(error)
    });
  }

  public onHideCodeTable(metadataColumn) {
    event.stopImmediatePropagation();
    // 해당 코드테이블 레이어 팝업 show flag
    metadataColumn.codeTable && (metadataColumn.isShowCodeTable = !metadataColumn.isShowCodeTable);
  }

  public onHideDictionary(metadataColumn) {
    event.stopImmediatePropagation();
    // 해당 코드테이블 레이어 팝업 show flag
    metadataColumn.dictionary && (metadataColumn.isShowDictionary = !metadataColumn.isShowDictionary);
  }

  /**
   * On scroll close popups
   */
  public onScroll() {
    this.columns.forEach((item) => {
      item['isShowCodeTable'] = false;
      item['isShowDictionary'] = false;
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
        item['isShowDictionary'] = false;
        return item.name !== 'current_datetime'
      });

      // sort columns ascending order by name
      this.exploreDataUtilService.sortList(this.columns, this.sortOptions, 'name');
      this.loadingHide();
    })
  }
}
