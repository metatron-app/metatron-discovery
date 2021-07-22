import {TimeFilter} from '@domain/workbook/configurations/filter/time-filter';
import {Field} from '@domain/datasource/datasource';
import _ from 'lodash';

export class TimeDateFilter extends TimeFilter {

  public static LATEST_DATETIME: string = 'LATEST_DATETIME';

  public valueDate: Date | string;
  public intervals: string[];

  constructor(field: Field) {
    super(field);
    this.type = 'time_single';
  }

  public toServerSpec() {
    const spec = super.toServerSpec();
    return _.merge(spec, {
      intervals: this.intervals
    });
  } // function - toServerSpec
}
