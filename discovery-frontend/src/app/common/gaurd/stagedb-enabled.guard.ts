import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {StorageService} from '../../data-storage/service/storage.service';

@Injectable()
export class StagedbEnabledGuard implements CanActivate {

  constructor(private storageService: StorageService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.storageService.checkEnableStageDB().then(() => true).catch(() => true);
  }

}
