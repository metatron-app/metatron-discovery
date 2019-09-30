import {Injectable} from "@angular/core";

@Injectable()
export class ExploreDataUtilService {
  /**
   * Sort column clicked
   * @param list
   * @param sortOptions
   * @param type
   * @param dataType
   */
  public toggleSortOption(list: any[], sortOptions: Object, type: string, dataType: string = "string") {
    // Initialize every column's option except selected column
    Object.keys(sortOptions).forEach(key => {
      if (key !== type) {
        sortOptions[key].option = 'default';
      }
    });

    if (sortOptions[type].option === 'none') {
      sortOptions[type].option = 'desc';
    } else if (sortOptions[type].option === 'asc') {
      sortOptions[type].option = 'desc';
    } else {
      sortOptions[type].option = 'asc';
    }
    this.sortList(list, sortOptions, type, dataType);
  }

  /**
   * Sort column array
   * @param list
   * @param sortOptions
   * @param type : column(key) name
   * @param dataType : string | date | number | ... -> sorting method is different according to data type
   */

  public sortList(list: any[], sortOptions: Object, type: string, dataType: string = "string") {
    // Check if columns array has more than one element
    if (list.length > 1) {
      if (dataType === "string") {
        if (sortOptions[type].option === 'asc'){
          list.sort((a, b) => {
            return a[type] < b[type] ? -1 : a[type] > b[type] ? 1 : 0;
          })
        } else if(sortOptions[type].option === 'desc') {
          list.sort((a, b) => {
            return a[type] > b[type] ? -1 : a[type] < b[type] ? 1 : 0;
          });
        }
      } else if (dataType === "number") {
        if (sortOptions[type].option === 'asc') {
          list.sort((a, b) => {
            return a[type] - b[type];
          })
        } else if (sortOptions[type].option === 'desc') {
          list.sort((a, b) => {
            return b[type] - a[type];
          })
        }
      } else if (dataType === "date") {
        if (sortOptions[type].option === 'asc'){
          list.sort((a, b) => {
            return a[type] < b[type] ? -1 : a[type] > b[type] ? 1 : 0;
          })
        } else if (sortOptions[type].option === 'desc') {
          list.sort((a, b) => {
            return a[type] > b[type] ? -1 : a[type] < b[type] ? 1 : 0;
          });
        }
      }
    }
  }
}

export class SortOption {
  constructor(
    public key: string,
    public option: string = 'default',
  ){}
}
