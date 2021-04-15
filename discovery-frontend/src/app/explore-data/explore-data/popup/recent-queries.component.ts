import {ClipboardService} from 'ngx-clipboard';
import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {DatasourceService} from '../../../datasource/service/datasource.service';

@Component({
  templateUrl: './recent-queries.component.html',
})
export class RecentQueriesComponent extends AbstractComponent implements OnInit {

  @Input()
  datasourceId: string;

  queries: any;

  recentlyQueriesForDataBase = [];

  public isShow: boolean = false;

  constructor(private _datasourceService: DatasourceService,
              private _clipboardService: ClipboardService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

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

  onClickCopy(query: string) {
    this._clipboardService.copyFromContent(query);
    Alert.success(this.translateService.instant('msg.storage.alert.clipboard.copy'));
  }

}
