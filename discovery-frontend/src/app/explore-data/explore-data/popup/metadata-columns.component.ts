import {Component, ElementRef, Injector, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";
import {CodeTableService} from "../../../meta-data-management/code-table/service/code-table.service";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import {FieldFormat} from "../../../domain/datasource/datasource";

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
   * Sort column clicked
   * @param tyoe
   */
  public toggleSortOption(type: string) {
    // Initialize every column's option except selected column
    Object.keys(this.sortOptions).forEach(key => {
      if (key !== type) {
        this.sortOptions[key].option = 'default';
      }
    });

    // Change options according to selected column
    switch (type) {
      case 'popularity':
        if (this.sortOptions.popularity.option === 'none') {
          this.sortOptions.popularity.option = 'desc';
        } else if (this.sortOptions.popularity.option === 'asc') {
          this.sortOptions.popularity.option = 'desc';
        } else {
          this.sortOptions.popularity.option = 'asc';
        }
        this.sortColumns(type, this.sortOptions.popularity.option);
        break;

      case 'physicalName':
        if (this.sortOptions.physicalName.option === 'none') {
          this.sortOptions.physicalName.option = 'desc';
        } else if (this.sortOptions.physicalName.option === 'asc'){
          this.sortOptions.physicalName.option = 'desc';
        } else {
          this.sortOptions.physicalName.option = 'asc';
        }

        this.sortColumns(type, this.sortOptions.physicalName.option);
        break;

      case 'name':
        if (this.sortOptions.name.option === 'none') {
          this.sortOptions.name.option = 'desc';
        } else if (this.sortOptions.name.option === 'asc'){
          this.sortOptions.name.option = 'desc';
        } else {
          this.sortOptions.name.option = 'asc';
        }

        this.sortColumns(type, this.sortOptions.name.option);
        break;

      default:
        break;
    }
  }

  /**
   * Sort column array
   * @param type
   * @param option
   */

  public sortColumns(type: string, option: string) {
    // Check if columns array has more than one element
    if (this.columns.length > 1) {
      // Sort...
      switch (type) {
        case 'popularity':
          if (option === 'asc') {
            this.columns.sort((a, b) => {
              return a.popularity - b.popularity;
            })
          } else if (option === 'desc') {
            this.columns.sort((a, b) => {
              return b.popularity - a.popularity;
            })
          }
          break;

        case 'physicalName':
          if (option === 'asc'){
            this.columns.sort((a, b) => {
              return a.physicalName < b.physicalName ? -1 : a.physicalName > b.physicalName ? 1 : 0;
            })
          } else if (option === 'desc') {
            this.columns.sort((a, b) => {
              return a.physicalName > b.physicalName ? -1 : a.physicalName < b.physicalName ? 1 : 0;
            });
          }
          break;

        case 'name':
          if (option === 'asc'){
            this.columns.sort((a, b) => {
              return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            })
          } else if(option === 'desc') {
            this.columns.sort((a, b) => {
              return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
            });
          }
          break;

        default:
          break;
      }
    }

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
      this.sortColumns('name', 'asc');
      this.loadingHide();
    })
  }
}

export class SortOption {
  constructor(
    public key: string,
    public option: string = 'default',
  ){}
}
