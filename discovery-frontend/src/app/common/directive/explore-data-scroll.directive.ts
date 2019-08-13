import {Directive,     HostListener} from "@angular/core";

@Directive({
  selector: '[exploreDataScroll]'
})
export class ExploreDataScrollDirective {
  // 이 함수 이름은 맘대로 해도된다.
  @HostListener('scroll') onScrolled() {
    if($('.ddp-ui-contents-list').scrollTop() > 0){
      $('.ddp-layout-contents').addClass('ddp-scroll');
    } else if ($('.ddp-ui-contents-list').scrollTop()==0) {
      $('.ddp-layout-contents').removeClass('ddp-scroll');
    }
  }
}
