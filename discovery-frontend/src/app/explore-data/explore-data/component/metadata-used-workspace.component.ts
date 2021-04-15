import {Component, ElementRef, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'component-metadata-used-workspace',
  templateUrl: 'metadata-used-workspace.component.html'
})
export class MetadataUsedWorkspaceComponent extends AbstractComponent implements OnInit {

  public workspaceList;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  @Output() readonly closedPopup = new EventEmitter();

  ngOnInit() {
    // TODO set workspace list
  }

  closePopup(): void {
    this.closedPopup.emit();
  }
}
