import {Injectable} from '@angular/core';

@Injectable()
export class ExploreDataUtilService {
  /**
   * Sort column clicked
   * @param list
   * @param sortOptions
   * @param selectedKey
   * @param dataType
   */
  public toggleSortOption(list: any[], sortOptions: object, selectedKey: string, dataType: string = 'string') {
    // Initialize every column's option except selected column
    Object.keys(sortOptions).forEach(key => {
      if (key !== selectedKey) {
        sortOptions[key].option = 'default';
      }
    });

    if (sortOptions[selectedKey].option === 'default') {
      sortOptions[selectedKey].option = 'desc';
    } else if (sortOptions[selectedKey].option === 'asc') {
      sortOptions[selectedKey].option = 'desc';
    } else {
      sortOptions[selectedKey].option = 'asc';
    }
    this.sortList(list, sortOptions, selectedKey, dataType);
  }

  /**
   * Sort column array
   * @param list
   * @param sortOptions
   * @param selectedKey : column(key) name
   * @param dataType : string | date | number | ... -> sorting method is different according to data type
   */

  public sortList(list: any[], sortOptions: object, selectedKey: string, dataType: string = 'string') {
    // Check if columns array has more than one element
    if (list.length > 1) {
      if (dataType === 'string') {
        if (sortOptions[selectedKey].option === 'asc') {
          list.sort((a, b) => {
            return a[selectedKey] < b[selectedKey] ? -1 : a[selectedKey] > b[selectedKey] ? 1 : 0;
          })
        } else if (sortOptions[selectedKey].option === 'desc') {
          list.sort((a, b) => {
            return a[selectedKey] > b[selectedKey] ? -1 : a[selectedKey] < b[selectedKey] ? 1 : 0;
          });
        }
      } else if (dataType === 'number') {
        if (sortOptions[selectedKey].option === 'asc') {
          list.sort((a, b) => {
            return a[selectedKey] - b[selectedKey];
          })
        } else if (sortOptions[selectedKey].option === 'desc') {
          list.sort((a, b) => {
            return b[selectedKey] - a[selectedKey];
          })
        }
      } else if (dataType === 'date') {
        if (sortOptions[selectedKey].option === 'asc') {
          list.sort((a, b) => {
            return a[selectedKey] < b[selectedKey] ? -1 : a[selectedKey] > b[selectedKey] ? 1 : 0;
          })
        } else if (sortOptions[selectedKey].option === 'desc') {
          list.sort((a, b) => {
            return a[selectedKey] > b[selectedKey] ? -1 : a[selectedKey] < b[selectedKey] ? 1 : 0;
          });
        }
      }
    }
  }
}

export class SortOption {
  // option could be 'default', 'asc', 'desc'
  constructor(
    public key: string,
    public option: string = 'default',
  ) {
  }
}
