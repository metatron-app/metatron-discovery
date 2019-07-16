import {AbstractPopupComponent} from "../../../../common/component/abstract-popup.component";
import {Component, ElementRef, EventEmitter, Injector, Output} from "@angular/core";
import {WorkbenchConstant} from "../../../workbench.constant";
import {CreateWorkbenchModelService} from "./service/create-workbench-model.service";

@Component({
  selector: 'component-create-workbench',
  templateUrl: 'create-workbench-container.component.html'
})
export class CreateWorkbenchContainerComponent extends AbstractPopupComponent {

  // required
  workspaceId: string;
  createStep: WorkbenchConstant.CreateStep = WorkbenchConstant.CreateStep.SELECT;

  // optional
  folderId: string; // this only used in workspace
  isAccessFromExplore: boolean; // this only used external page

  // enum
  CREATE_STEP = WorkbenchConstant.CreateStep;

  @Output() readonly closedPopup = new EventEmitter();

  // 생성자
  constructor(private createWorkbenchModelService: CreateWorkbenchModelService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // initial data
    this.createWorkbenchModelService.initialCompleteData();
    this.createWorkbenchModelService.initialConnection();
    this.createWorkbenchModelService.initialConnectionFilters();
  }

  accessFromExplore() {
    this.isAccessFromExplore = true;
    this.createStep = WorkbenchConstant.CreateStep.COMPLETE;
  }

  setWorkspaceId(workspaceId: string): void {
    this.workspaceId = workspaceId;
  }

  setFolderId(folderId: string): void {
    this.folderId = folderId;
  }

  setConnectionInModel(connection): void {
    this.createWorkbenchModelService.selectedConnection = connection;
  }

  changeStep(step: WorkbenchConstant.CreateStep): void {
    this.createStep = step;
  }

  closePopup(): void {
    this.closedPopup.emit();
  }

}
