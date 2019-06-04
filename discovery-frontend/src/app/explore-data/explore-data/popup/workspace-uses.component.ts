import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-workspace-uses',
  templateUrl: './workspace-uses.component.html',
})
export class WorkspaceUsesComponent implements OnInit {

  isShow: boolean = false;
  workspaces : any;

  constructor() { }

  ngOnInit() {
  }

  openPopup(workspaces: any) {

    this.workspaces = workspaces;

  }

}
