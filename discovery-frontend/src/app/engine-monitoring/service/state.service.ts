import {Injectable} from '@angular/core';
import {EngineServiceModule} from './engine-service.module';
import {Subject} from 'rxjs';
import {Engine} from '../../domain/engine-monitoring/engine';

@Injectable({
  providedIn: EngineServiceModule
})
export class StateService {

  private changeTabSubject: Subject<{ current: Engine.Content, next: Engine.ContentType }> = new Subject();
  public changeTab$ = this.changeTabSubject.asObservable();

  constructor() {
  }

  public changeTab(current: Engine.Content, next: Engine.ContentType) {
    this.changeTabSubject.next({ current, next });
  }

}
