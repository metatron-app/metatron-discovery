import {Component, Input, OnInit} from '@angular/core';
import {DatasourceService} from "../../../datasource/service/datasource.service";

@Component({
  selector: 'app-recent-queries',
  templateUrl: './recent-queries.component.html',
})
export class RecentQueriesComponent implements OnInit {

  @Input()
  datasourceId: string;

  queries: any;

  constructor(private _datasourceService: DatasourceService) { }

  ngOnInit() {
  }


  getRecentQueries() {
    this._datasourceService.getQueryHistories(this.datasourceId, {})
      .then((result) => {
      this.queries = result;
    })
  }

}
