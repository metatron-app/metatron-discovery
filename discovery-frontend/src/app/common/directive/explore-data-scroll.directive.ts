import {Directive,     HostListener} from "@angular/core";

@Directive({
  selector: '[exploreDataScroll]'
})
export class ExploreDataScrollDirective {
  @HostListener('scroll') onScrolled() {
    if($('.ddp-ui-contents-list').scrollTop() > 0){
      $('.ddp-layout-contents').addClass('ddp-scroll');
    } else if ($('.ddp-ui-contents-list').scrollTop()==0) {
      $('.ddp-layout-contents').removeClass('ddp-scroll');
    }
  }
}
