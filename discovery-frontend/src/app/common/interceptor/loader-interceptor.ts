import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Injectable, Injector} from '@angular/core'
import {Observable, of} from 'rxjs'
import {catchError, finalize} from 'rxjs/operators'
import {Router} from '@angular/router';
import {Alert} from '../util/alert.util';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  protected router: Router;

  protected translateService: TranslateService;

  constructor(protected injector: Injector) {
    this.router = injector.get(Router);
    this.translateService = injector.get(TranslateService);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const showLoading = !request.headers.has('hideLoading');
    if (showLoading) {
      this.totalRequests += 1
    }
    if (request.responseType === 'json') {
      const jsonHeaders = request.headers.append('x-requested-with', 'XMLHttpRequest');
      request = request.clone({headers: jsonHeaders})
    }
    return next.handle(request).pipe(
      catchError((err: any) => {
        // do something
        if (err.error.details === 'User ip is not in whitelist.') {
          Alert.error(this.translateService.instant('msg.sso.ui.not.matched.userip'));
          this.router.navigate(['/user/login']);
          return of(err);
        }
        throw err;
      }),
      finalize(() => {
        if (showLoading) {
          this.decreaseRequests()
        }
      })
    )
  }

  private decreaseRequests() {
    if (this.totalRequests > 0) {
      this.totalRequests -= 1
    }
  }
}
