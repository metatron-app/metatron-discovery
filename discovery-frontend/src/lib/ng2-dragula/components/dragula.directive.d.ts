import { ElementRef, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { DragulaService } from './dragula.provider';
export declare class DragulaDirective implements OnInit, OnChanges {
    dragula: string;
    dragulaModel: any;
    dragulaOptions: any;
    private container;
    private drake;
    private el;
    private dragulaService;
    constructor(el: ElementRef, dragulaService: DragulaService);
    ngOnInit(): void;
    ngOnChanges(changes: {
        dragulaModel?: SimpleChange;
    }): void;
}
