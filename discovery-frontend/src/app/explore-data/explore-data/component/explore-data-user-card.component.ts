import {Component, ElementRef, Injector, Input} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {SourceType} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'component-explore-data-user-card',
  templateUrl: 'explore-data-user-card.component.html'
})
export class ExploreDataUserCardComponent extends AbstractComponent {
  @Input() readonly topUser;
  @Input() readonly sourceType: SourceType;

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

    const popupX = (window.screen.width / 2) - (1200 / 2);
    const popupY = (window.screen.height / 2) - (900 / 2);
    const popUrl = `workbench/${this.topUser.workbench.id}`;

    window.open(popUrl, '', 'status=no, height=700, width=1200, left=' + popupX + ', top=' + popupY + ', screenX=' + popupX + ', screenY= ' + popupY);
  }

  onClickDashBoardName(hasPermission: boolean) {
    if (!hasPermission) {
      return;
    }

    const popupX = (window.screen.width / 2) - (1200 / 2);
    const popupY = (window.screen.height / 2) - (900 / 2);
    const popUrl = `workbook/${this.topUser.workbook.id}/${this.topUser.dashboard.id}`;

    window.open(popUrl, '', 'status=no, height=700, width=1200, left=' + popupX + ', top=' + popupY + ', screenX=' + popupX + ', screenY= ' + popupY);
  }
}
