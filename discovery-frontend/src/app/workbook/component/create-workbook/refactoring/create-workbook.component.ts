import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {StringUtil} from "../../../../common/util/string.util";
import * as _ from "lodash";
import {CommonUtil} from "../../../../common/util/common.util";
import {Book} from "../../../../domain/workspace/book";
import {Alert} from "../../../../common/util/alert.util";
import {WorkbookService} from "../../../service/workbook.service";
import {ExploreConstant} from "../../../../explore-data/constant/explore.constant";

@Component({
  selector: 'component-create-workbook',
  templateUrl: 'create-workbook.component.html'
})
export class CreateWorkbookComponent extends AbstractComponent {

  name: string;
  description: string;

  isInvalidName: boolean;
  invalidNameMessage: string;
  isInvalidDescription: boolean;
  invalidDescriptionMessage: string;

  // required
  workspaceId: string;
  // optional
  folderId: string; // this only used in workspace

  // used in explore
  isAccessFromExplore: boolean;
  sourceId: string;

  @Output() readonly closedPopup = new EventEmitter();
  @Output() readonly completedPopup = new EventEmitter();

  // 생성자
  constructor(private workbookService: WorkbookService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  accessFromExplore(): void {
    this.isAccessFromExplore = true;
  }

  setWorkspaceId(workspaceId: string): void {
    this.workspaceId = workspaceId;
  }

  setFolderId(folderId: string): void {
    this.folderId = folderId;
  }

  setSourceId(sourceId: string): void {
    this.sourceId = sourceId;
  }

  closePopup(): void {
    this.closedPopup.emit();
  }

  complete(): void {
    this._checkNameValidation();
    this._checkDescriptionValidation();
    if (this.isValid()) {
      this._createWorkBook();
    }
  }

  isValid(): boolean {
    return this.isInvalidName !== true && this.isInvalidDescription !== true;
  }

  isEmptyName(): boolean {
    return StringUtil.isEmpty(this.name);
  }

  isEmptyDescription(): boolean {
    return StringUtil.isEmpty(this.description);
  }

  onChangeNameValidation(value: string): void {
    this.name = value;
    this.isInvalidName = undefined;
  }

  onChangeDescriptionValidation(value: string): void {
    this.description = value;
    this.isInvalidDescription = undefined;
  }

  private _isEmptyValue(value): boolean {
    return _.isNil(value);
  }

  private _isNotEmptyValue(value): boolean {
    return !this._isEmptyValue(value);
  }

  private _getCreateWorkbookParams() {
    const params: {workspace: string, name: string, type: 'workbook' | 'folder', description?: string, folderId?: string} = {
      workspace: `/api/workspaces/${this.workspaceId}`,
      name: this.name.trim(),
      type: 'workbook'
    };
    // if not empty folder id
    if (this._isNotEmptyValue(this.folderId)) {
      params.folderId = this.folderId;
    }
    // if not empty description
    if (this._isNotEmptyValue(this.description)) {
      params.description = this.description.trim();
    }
    return params;
  }

  private _checkNameValidation(): void {
    // check empty
    if (this.isEmptyName()) {
      this.isInvalidName = true;
      this.invalidNameMessage = this.translateService.instant('msg.alert.edit.name.empty');
    } else if (CommonUtil.getByte(this.name) > 150) { // check length
      this.isInvalidName = true;
      this.invalidNameMessage = this.translateService.instant('msg.alert.edit.name.len');
    } else {
      this.isInvalidName = undefined;
    }
  }

  private _checkDescriptionValidation(): void {
    if (!this.isEmptyDescription() && CommonUtil.getByte(this.description) > 450) {
      this.isInvalidDescription = true;
      this.invalidDescriptionMessage = this.translateService.instant('msg.alert.edit.description.len');
    } else {
      this.isInvalidDescription = undefined;
    }
  }

  private _createWorkBook(): void {
    this.loadingShow();
    this.workbookService.createWorkbook2(this._getCreateWorkbookParams()).then((result:Book) => {
      // this.createComplete.emit({ createDashboardFl: this.createDashboardFl, id: result['id'] });
      this.loadingHide();
      Alert.success(`'${result.name}’ ` + this.translateService.instant('msg.book.alert.create.workbook.success'));
      if (this.isAccessFromExplore) {
        const params: {id: string, type: 'workbook'} = {
          type: 'workbook',
          id: this.sourceId,
        };
        // set source id and table in session storage
        sessionStorage.setItem(ExploreConstant.SessionStorageKey.CREATED_FROM_EXPLORE, JSON.stringify(params));
      }
      // complete
      this.completedPopup.emit(result.id);
      // close
      this.closePopup();
    }).catch((error) => {
      Alert.error(this.translateService.instant('msg.book.alert.create.workbook.fail'));
      this.loadingHide();
    });
  }
}
