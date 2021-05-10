import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {SourceType} from '@domain/meta-data-management/metadata';
import {DataCreator} from '@domain/meta-data-management/data-creator';
import {MetadataService} from '../../../meta-data-management/metadata/service/metadata.service';

@Component({
  selector: 'component-explore-data-user-card',
  templateUrl: 'explore-data-user-card.component.html'
})
export class ExploreDataUserCardComponent extends AbstractComponent implements OnInit {
  @Input() readonly topUser;
  @Input() readonly sourceType: SourceType;
  @Output() readonly userClicked = new EventEmitter();

  creator: DataCreator = null;

  constructor(protected element: ElementRef,
              private metadataService: MetadataService,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.metadataService.getCreatorDetail(this.topUser.user.username).then((result) => {
      this.creator = result;
    });
  }

  onClickWorkbenchName(hasPermission: boolean) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!hasPermission) {
      return;
    }
    const popUrl = `workbench/${this.topUser.workbench.id}`;
    // open in new tab
    window.open(popUrl, '_blank');
  }

  onClickDashBoardName(hasPermission: boolean) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!hasPermission) {
      return;
    }
    const popUrl = `workbook/${this.topUser.workbook.id}/${this.topUser.dashboard.id}`;
    // open in new tab
    window.open(popUrl, '_blank');
  }

  onClickUserName(username: string) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.userClicked.emit(username);
  }

  onClickFavoriteIconInTopUser() {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.metadataService.toggleCreatorFavorite(this.creator.creator.id, this.creator.favorite).then().catch(e => this.commonExceptionHandler(e));
    this.creator.favorite = !this.creator.favorite;
  }


  public getUserImage(userInfo): string {
    if (userInfo && userInfo.hasOwnProperty('imageUrl')) {
      return '/api/images/load/url?url=' + userInfo.imageUrl + '/thumbnail';
    } else {
      return this.defaultPhotoSrc;
    }
  } // function - getUserImage
}
