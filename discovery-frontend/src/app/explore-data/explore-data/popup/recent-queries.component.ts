import {Component, Input, OnInit} from '@angular/core';
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {ClipboardService} from "ngx-clipboard";
import {Alert} from "../../../common/util/alert.util";

@Component({
  templateUrl: './recent-queries.component.html',
})
export class RecentQueriesComponent implements OnInit {

  @Input()
  datasourceId: string;

  queries: any;

  public isShow: boolean = false;

  constructor(private _datasourceService: DatasourceService,
              private _clipboardService: ClipboardService) { }


  public init() {
    this.isShow = true;
  }

  test() {
    this.queries = 'tttttttt';
  }

  ngOnInit() {
  }

  public closePopup() {
    this.isShow = false;
  }


  public getRecentQueries() {
    this._datasourceService.getQueryHistories(this.datasourceId, {})
      .then((result) => {
      this.queries = result;
    })
  }

  onClickCopy(queryElement: Element) {
    this._clipboardService.copyFromContent(queryElement.textContent);
  }

}
