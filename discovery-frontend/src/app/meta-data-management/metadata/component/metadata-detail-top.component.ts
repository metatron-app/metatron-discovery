import {Component, ElementRef, Injector, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../service/metadata.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";

@Component(
  {
    selector: 'app-metadata-management-metadata-detail-top',
    templateUrl: './metadata-detail-top.component.html'
  }
)
export class MetadataDetailTopComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private more: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Go back
   */
  public goBack() {
    this._location.back();
  } // function - goBack

  private onMoreButtonClicked() {
    this.more = !this.more;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private _location: Location,
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    protected injector: Injector,) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }
}
