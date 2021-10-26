import {Component, ViewChild, ElementRef, AfterViewInit} from "@angular/core";

import * as React from "react";
import * as ReactDOM from 'react-dom';
import store from './store';
import {Provider} from 'react-redux';
import KeplerComponent from "./kepler.component";


declare let $: any;
const containerElementName = 'keplerContainer'
@Component({
  selector:'app-kepler',
  template: `<span #${containerElementName}></span>`
})
export class KeplerWrapperComponent implements AfterViewInit{
  @ViewChild(containerElementName, {static:false}) containerRef: ElementRef | undefined;


  ngAfterViewInit() {
    this.render();

  }


  private render(){

    if(this.containerRef){
      React.version;

      ReactDOM.render(<Provider store={store}>
        <KeplerComponent>
        </KeplerComponent>
      </Provider>, this.containerRef.nativeElement);


    }

  }
}


