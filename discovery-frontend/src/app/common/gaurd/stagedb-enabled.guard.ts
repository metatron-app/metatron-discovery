import {Injectable} from '@angular/core';
import {CanLoad, Route} from '@angular/router';
import {Observable} from 'rxjs';
import {StorageService} from '../../data-storage/service/storage.service';

@Injectable()
export class StagedbEnabledGuard implements CanLoad {

  constructor(private storageService: StorageService) {
  }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return this.storageService.checkEnableStageDB().then(() => true).catch(() => true);
  }
}
