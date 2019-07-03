import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'explore-workspace-uses',
  templateUrl: './workspace-uses.component.html',
})
export class WorkspaceUsesComponent implements OnInit {

  isShow: boolean = false;
  workspaces : any;

  constructor() { }

  ngOnInit() {

  }

  public init(workspaces) {
    this.workspaces = workspaces;
    this.isShow = true;
  }

  public closePopup() {
    this.isShow = false;
  }

}
