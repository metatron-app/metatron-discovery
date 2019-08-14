import {Component, ElementRef, Injector, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../service/metadata.service";
import {ActivatedRoute} from "@angular/router";

@Component(
  {
    selector: 'app-metadata-management-metadata-header-lnb',
    templateUrl: './metadata-detail-header-lnb.component.html'
  }
)
export class MetadataDetailHeaderLnbComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private show: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    protected injector: Injector,) {
    super(element, injector);
  }

  /**
   * Show Lnb
   */
  onLnbButtonClicked() {
    this.show = !this.show;
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
