import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {SourceType} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'component-explore-data-user-card',
  templateUrl: 'explore-data-user-card.component.html'
})
export class ExploreDataUserCardComponent extends AbstractComponent {
  @Input() readonly topUser;
  @Input() readonly sourceType: SourceType;
  @Output() readonly userClicked = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onClickWorkbenchName(hasPermission: boolean) {
    if (!hasPermission) {
      return;
    }

    const popUrl = `workbench/${this.topUser.workbench.id}`;
    //open in new tab
    window.open(popUrl, '_blank');
  }

  onClickDashBoardName(hasPermission: boolean) {
    if (!hasPermission) {
      return;
    }
    const popUrl = `workbook/${this.topUser.workbook.id}/${this.topUser.dashboard.id}`;
    //open in new tab
    window.open(popUrl, '_blank');
  }

  onClickUserName(creator: string) {
    this.userClicked.emit(creator);
  }
}
