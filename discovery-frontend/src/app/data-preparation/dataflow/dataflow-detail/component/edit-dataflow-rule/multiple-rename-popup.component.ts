/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {AbstractComponent} from "../../../../../common/component/abstract.component";
import {header, SlickGridHeader} from "../../../../../common/component/grid/grid.header";
import {Field} from "../../../../../domain/data-preparation/pr-dataset";
import {GridOption} from "../../../../../common/component/grid/grid.option";
import {ScrollLoadingGridComponent} from "./edit-rule-grid/scroll-loading-grid.component";
import {ScrollLoadingGridModel} from "./edit-rule-grid/scroll-loading-grid.model";
import {isNullOrUndefined} from "util";
import {DatasetService} from "../../../../dataset/service/dataset.service";

declare const moment: any;

@Component({
  selector: 'multiple-rename-popup',
  templateUrl: './multiple-rename-popup.component.html'
})
export class MultipleRenamePopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  private renameMultiColumns = new EventEmitter();

  @ViewChild(ScrollLoadingGridComponent)
  private _gridComp: ScrollLoadingGridComponent;

  private _korToEngRules = {
    hangul: {
      /**
       * Revised Romanization Transcription
       */
      'rr': {
        // Note: giyeok (0x1100) for middle moeum is different than giyeok (0x3131) for standalone jamo
        cho: {
          'ᄀ': 'g', 'ᄁ': 'kk',
          'ᄂ': 'n',
          'ᄃ': 'd', 'ᄄ': 'tt',
          'ᄅ': 'r',
          'ᄆ': 'm',
          'ᄇ': 'b', 'ᄈ': 'pp',
          'ᄉ': 's', 'ᄊ': 'ss',
          'ᄋ': '',
          'ᄌ': 'j', 'ᄍ': 'jj',
          'ᄎ': 'ch',
          'ᄏ': 'k',
          'ᄐ': 't',
          'ᄑ': 'p',
          'ᄒ': 'h'
        },

        // Note: ᅡ (0x1161) for middle moeum is different than ㅏ (0x314F) for standalone jamo
        jung: {
          'ᅡ': 'a', 'ᅢ': 'ae', 'ᅣ': 'ya', 'ᅤ': 'yae',
          'ᅥ': 'eo', 'ᅦ': 'e', 'ᅧ': 'yeo', 'ᅨ': 'ye',
          'ᅩ': 'o', 'ᅪ': 'wa', 'ᅫ': 'wae', 'ᅬ': 'oe', 'ᅭ': 'yo',
          'ᅮ': 'u', 'ᅯ': 'wo', 'ᅰ': 'we', 'ᅱ': 'wi', 'ᅲ': 'yu',
          'ᅳ': 'eu', 'ᅴ': 'eui', 'ᅵ': 'i'
        },

        // Note: ᆨ (0x11A8) for last jaeum (batchim) is different than ᄀ (0x1100) for first jaeum
        // also different than ㄱ (0x3131) for standalone jamo
        jong: {
          'ᆨ': 'k', 'ᆨᄋ': 'g', 'ᆨᄂ': 'ngn', 'ᆨᄅ': 'ngn', 'ᆨᄆ': 'ngm', 'ᆨᄒ': 'kh',
          'ᆩ': 'kk', 'ᆩᄋ': 'kg', 'ᆩᄂ': 'ngn', 'ᆩᄅ': 'ngn', 'ᆩᄆ': 'ngm', 'ᆩᄒ': 'kh',
          'ᆪ': 'k', 'ᆪᄋ': 'ks', 'ᆪᄂ': 'ngn', 'ᆪᄅ': 'ngn', 'ᆪᄆ': 'ngm', 'ᆪᄒ': 'kch',
          'ᆫ': 'n', 'ᆫᄅ': 'll',
          'ᆬ': 'n', 'ᆬᄋ': 'nj', 'ᆬᄂ': 'nn', 'ᆬᄅ': 'nn', 'ᆬᄆ': 'nm', 'ᆬㅎ': 'nch',
          'ᆭ': 'n', 'ᆭᄋ': 'nh', 'ᆭᄅ': 'nn',
          'ᆮ': 't', 'ᆮᄋ': 'd', 'ᆮᄂ': 'nn', 'ᆮᄅ': 'nn', 'ᆮᄆ': 'nm', 'ᆮᄒ': 'th',
          'ᆯ': 'l', 'ᆯᄋ': 'r', 'ᆯᄂ': 'll',
          'ᆰ': 'k', 'ᆰᄋ': 'lg', 'ᆰᄂ': 'ngn', 'ᆰᄅ': 'ngn', 'ᆰᄆ': 'ngm', 'ᆰᄒ': 'lkh',
          'ᆱ': 'm', 'ᆱᄋ': 'lm', 'ᆱᄂ': 'mn', 'ᆱᄅ': 'mn', 'ᆱᄆ': 'mm', 'ᆱᄒ': 'lmh',
          'ᆲ': 'p', 'ᆲᄋ': 'lb', 'ᆲᄂ': 'mn', 'ᆲᄅ': 'mn', 'ᆲᄆ': 'mm', 'ᆲᄒ': 'lph',
          'ᆳ': 't', 'ᆳᄋ': 'ls', 'ᆳᄂ': 'nn', 'ᆳᄅ': 'nn', 'ᆳᄆ': 'nm', 'ᆳᄒ': 'lsh',
          'ᆴ': 't', 'ᆴᄋ': 'lt', 'ᆴᄂ': 'nn', 'ᆴᄅ': 'nn', 'ᆴᄆ': 'nm', 'ᆴᄒ': 'lth',
          'ᆵ': 'p', 'ᆵᄋ': 'lp', 'ᆵᄂ': 'mn', 'ᆵᄅ': 'mn', 'ᆵᄆ': 'mm', 'ᆵᄒ': 'lph',
          'ᆶ': 'l', 'ᆶᄋ': 'lh', 'ᆶᄂ': 'll', 'ᆶᄅ': 'll', 'ᆶᄆ': 'lm', 'ᆶᄒ': 'lh',
          'ᆷ': 'm', 'ᆷᄅ': 'mn',
          'ᆸ': 'p', 'ᆸᄋ': 'b', 'ᆸᄂ': 'mn', 'ᆸᄅ': 'mn', 'ᆸᄆ': 'mm', 'ᆸᄒ': 'ph',
          'ᆹ': 'p', 'ᆹᄋ': 'ps', 'ᆹᄂ': 'mn', 'ᆹᄅ': 'mn', 'ᆹᄆ': 'mm', 'ᆹᄒ': 'psh',
          'ᆺ': 't', 'ᆺᄋ': 's', 'ᆺᄂ': 'nn', 'ᆺᄅ': 'nn', 'ᆺᄆ': 'nm', 'ᆺᄒ': 'sh',
          'ᆻ': 't', 'ᆻᄋ': 'ss', 'ᆻᄂ': 'tn', 'ᆻᄅ': 'tn', 'ᆻᄆ': 'nm', 'ᆻᄒ': 'th',
          'ᆼ': 'ng',
          'ᆽ': 't', 'ᆽᄋ': 'j', 'ᆽᄂ': 'nn', 'ᆽᄅ': 'nn', 'ᆽᄆ': 'nm', 'ᆽᄒ': 'ch',
          'ᆾ': 't', 'ᆾᄋ': 'ch', 'ᆾᄂ': 'nn', 'ᆾᄅ': 'nn', 'ᆾᄆ': 'nm', 'ᆾᄒ': 'ch',
          'ᆿ': 'k', 'ᆿᄋ': 'k', 'ᆿᄂ': 'ngn', 'ᆿᄅ': 'ngn', 'ᆿᄆ': 'ngm', 'ᆿᄒ': 'kh',
          'ᇀ': 't', 'ᇀᄋ': 't', 'ᇀᄂ': 'nn', 'ᇀᄅ': 'nn', 'ᇀᄆ': 'nm', 'ᇀᄒ': 'th',
          'ᇁ': 'p', 'ᇁᄋ': 'p', 'ᇁᄂ': 'mn', 'ᇁᄅ': 'mn', 'ᇁᄆ': 'mm', 'ᇁᄒ': 'ph',
          'ᇂ': 't', 'ᇂᄋ': 'h', 'ᇂᄂ': 'nn', 'ᇂᄅ': 'nn', 'ᇂᄆ': 'mm', 'ᇂᄒ': 't'
        }
      },

      /**
       * Revised Romanization Transliteration
       */
      'rr-translit': {
        // Note: giyeok (0x1100) for middle moeum is different than giyeok (0x3131) for standalone jamo
        cho: {
          'ᄀ': 'g', 'ᄁ': 'kk',
          'ᄂ': 'n',
          'ᄃ': 'd', 'ᄄ': 'tt',
          'ᄅ': 'l',
          'ᄆ': 'm',
          'ᄇ': 'b', 'ᄈ': 'pp',
          'ᄉ': 's', 'ᄊ': 'ss',
          'ᄋ': '',
          'ᄌ': 'j', 'ᄍ': 'jj',
          'ᄎ': 'ch',
          'ᄏ': 'k',
          'ᄐ': 't',
          'ᄑ': 'p',
          'ᄒ': 'h'
        },

        // Note: ᅡ (0x1161) for middle moeum is different than ㅏ (0x314F) for standalone jamo
        jung: {
          'ᅡ': 'a', 'ᅢ': 'ae', 'ᅣ': 'ya', 'ᅤ': 'yae',
          'ᅥ': 'eo', 'ᅦ': 'e', 'ᅧ': 'yeo', 'ᅨ': 'ye',
          'ᅩ': 'o', 'ᅪ': 'oa', 'ᅫ': 'oae', 'ᅬ': 'oi', 'ᅭ': 'yo',
          'ᅮ': 'u', 'ᅯ': 'ueo', 'ᅰ': 'ue', 'ᅱ': 'ui', 'ᅲ': 'yu',
          'ᅳ': 'eu', 'ᅴ': 'eui', 'ᅵ': 'i'
        },

        // Note: ᆨ (0x11A8) for last jaeum (batchim) is different than ᄀ (0x1100) for first jaeum
        // also different than ㄱ (0x3131) for standalone jamo
        jong: {
          'ᆨ': 'g', 'ᆨᄋ': 'g-',
          'ᆩ': 'kk', 'ᆩᄋ': 'kk-',
          'ᆪ': 'gs', 'ᆪᄋ': 'gs-', 'ᆪᄉ': 'gs-s',
          'ᆫ': 'n', 'ᆫᄋ': 'n-',
          'ᆬ': 'nj', 'ᆬᄋ': 'nj-', 'ᆬᄌ': 'nj-j',
          'ᆭ': 'nh', 'ᆭᄋ': 'nh-',
          'ᆮ': 'd', 'ᆮᄋ': 'd-',
          'ᆯ': 'l', 'ᆯᄋ': 'l-',
          'ᆰ': 'lg', 'ᆰᄋ': 'lg-',
          'ᆱ': 'lm', 'ᆱᄋ': 'lm-',
          'ᆲ': 'lb', 'ᆲᄋ': 'lb-',
          'ᆳ': 'ls', 'ᆳᄋ': 'ls-', 'ᆳᄉ': 'ls-s',
          'ᆴ': 'lt', 'ᆴᄋ': 'lt-',
          'ᆵ': 'lp', 'ᆵᄋ': 'lp-',
          'ᆶ': 'lh', 'ᆶᄋ': 'lh-',
          'ᆷ': 'm', 'ᆷᄋ': 'm-',
          'ᆸ': 'b', 'ᆸᄋ': 'b-',
          'ᆹ': 'bs', 'ᆹᄋ': 'bs-', 'ᆹᄉ': 'bs-s',
          'ᆺ': 's', 'ᆺᄋ': 's-', 'ᆺᄊ': 's-ss',
          'ᆻ': 'ss', 'ᆻᄋ': 'ss-', 'ᆻᄉ': 'ss-s',
          'ᆼ': 'ng', 'ᆼᄋ': 'ng-',
          'ᆽ': 'j', 'ᆽᄋ': 'j-', 'ᆽᄌ': 'j-j',
          'ᆾ': 'ch', 'ᆾᄋ': 'ch-',
          'ᆿ': 'k', 'ᆿᄋ': 'k-',
          'ᇀ': 't', 'ᇀᄋ': 't-',
          'ᇁ': 'p', 'ᇁᄋ': 'p-',
          'ᇂ': 'h', 'ᇂᄋ': 'h-'
        }
      },

      'skats': {
        hyphen: ' ',

        // Note: giyeok (0x1100) for middle moeum is different than giyeok (0x3131) for standalone jamo
        cho: {
          'ᄀ': 'L', 'ᄁ': 'LL',
          'ᄂ': 'F',
          'ᄃ': 'B', 'ᄄ': 'BB',
          'ᄅ': 'V',
          'ᄆ': 'M',
          'ᄇ': 'W', 'ᄈ': 'WW',
          'ᄉ': 'G', 'ᄊ': 'GG',
          'ᄋ': 'K',
          'ᄌ': 'P', 'ᄍ': 'PP',
          'ᄎ': 'C',
          'ᄏ': 'X',
          'ᄐ': 'Z',
          'ᄑ': 'O',
          'ᄒ': 'J',
          ' ': '  '
        },

        // Note: ᅡ (0x1161) for middle moeum is different than ㅏ (0x314F) for standalone jamo
        jung: {
          'ᅡ': 'E', 'ᅢ': 'EU', 'ᅣ': 'I', 'ᅤ': 'IU',
          'ᅥ': 'T', 'ᅦ': 'TU', 'ᅧ': 'S', 'ᅨ': 'SU',
          'ᅩ': 'A', 'ᅪ': 'AE', 'ᅫ': 'AEU', 'ᅬ': 'AU', 'ᅭ': 'N',
          'ᅮ': 'H', 'ᅯ': 'HT', 'ᅰ': 'HTU', 'ᅱ': 'HU', 'ᅲ': 'R',
          'ᅳ': 'D', 'ᅴ': 'DU', 'ᅵ': 'U'
        },

        // Note: ᆨ (0x11A8) for last jaeum (batchim) is different than ᄀ (0x1100) for first jaeum
        // also different than ㄱ (0x3131) for standalone jamo
        jong: {
          'ᆨ': 'L', 'ᆩ': 'LL', 'ᆪ': 'LG',
          'ᆫ': 'F', 'ᆬ': 'FP', 'ᆭ': 'FJ',
          'ᆮ': 'B',
          'ᆯ': 'V', 'ᆰ': 'VL', 'ᆱ': 'VM', 'ᆲ': 'VW', 'ᆳ': 'VG', 'ᆴ': 'VZ', 'ᆵ': 'VO', 'ᆶ': 'VJ',
          'ᆷ': 'M',
          'ᆸ': 'W', 'ᆹ': 'WG',
          'ᆺ': 'G', 'ᆻ': 'GG',
          'ᆼ': 'K',
          'ᆽ': 'P',
          'ᆾ': 'C',
          'ᆿ': 'X',
          'ᇀ': 'Z',
          'ᇁ': 'O',
          'ᇂ': 'J'
        }
      },

      /**
       * Indonesian Transcription
       */
      'ebi': {
        // Note: giyeok (0x1100) for middle moeum is different than giyeok (0x3131) for standalone jamo
        cho: {
          'ᄀ': 'gh', 'ᄁ': 'k',
          'ᄂ': 'n',
          'ᄃ': 'dh', 'ᄄ': 't',
          'ᄅ': 'r',
          'ᄆ': 'm',
          'ᄇ': 'bh', 'ᄈ': 'p',
          'ᄉ': 's', 'ᄊ': 's',
          'ᄋ': '',
          'ᄌ': 'jh', 'ᄍ': 'c',
          'ᄎ': 'ch',
          'ᄏ': 'kh',
          'ᄐ': 'th',
          'ᄑ': 'ph',
          'ᄒ': 'h'
        },

        // Note: giyeok (0x1100) for middle moeum is different than giyeok (0x3131) for standalone jamo
        cho2: {
          'ᄀ': 'g', 'ᄁ': 'k',
          'ᄂ': 'n',
          'ᄃ': 'd', 'ᄄ': 't',
          'ᄅ': 'r',
          'ᄆ': 'm',
          'ᄇ': 'b', 'ᄈ': 'p',
          'ᄉ': 's', 'ᄊ': 's',
          'ᄋ': '',
          'ᄌ': 'j', 'ᄍ': 'c',
          'ᄎ': 'ch',
          'ᄏ': 'kh',
          'ᄐ': 'th',
          'ᄑ': 'ph',
          'ᄒ': 'h'
        },

        // Note: ᅡ (0x1161) for middle moeum is different than ㅏ (0x314F) for standalone jamo
        jung: {
          'ᅡ': 'a', 'ᅢ': 'è', 'ᅣ': 'ya', 'ᅤ': 'yè',
          'ᅥ': 'ö', 'ᅦ': 'é', 'ᅧ': 'yö', 'ᅨ': 'yé',
          'ᅩ': 'o', 'ᅪ': 'wa', 'ᅫ': 'wè', 'ᅬ': 'wé', 'ᅭ': 'yo',
          'ᅮ': 'u', 'ᅯ': 'wo', 'ᅰ': 'wé', 'ᅱ': 'wi', 'ᅲ': 'yu',
          'ᅳ': 'eu', 'ᅴ': 'eui', 'ᅵ': 'i'
        },

        // Note: ᆨ (0x11A8) for last jaeum (batchim) is different than ᄀ (0x1100) for first jaeum
        // also different than ㄱ (0x3131) for standalone jamo
        jong: {
          'ᆨ': 'k', 'ᆨᄋ': 'g', 'ᆨᄂ': 'ngn', 'ᆨᄅ': 'ngn', 'ᆨᄆ': 'ngm', 'ᆨᄒ': 'kh',
          'ᆩ': 'k', 'ᆩᄋ': 'kg', 'ᆩᄂ': 'ngn', 'ᆩᄅ': 'ngn', 'ᆩᄆ': 'ngm', 'ᆩᄒ': 'kh',
          'ᆪ': 'k', 'ᆪᄋ': 'ks', 'ᆪᄂ': 'ngn', 'ᆪᄅ': 'ngn', 'ᆪᄆ': 'ngm', 'ᆪᄒ': 'kch',
          'ᆫ': 'n', 'ᆫᄅ': 'll',
          'ᆬ': 'n', 'ᆬᄋ': 'nj', 'ᆬᄂ': 'nn', 'ᆬᄅ': 'nn', 'ᆬᄆ': 'nm', 'ᆬㅎ': 'nch',
          'ᆭ': 'n', 'ᆭᄋ': 'nh', 'ᆭᄅ': 'nn',
          'ᆮ': 't', 'ᆮᄋ': 'd', 'ᆮᄂ': 'nn', 'ᆮᄅ': 'nn', 'ᆮᄆ': 'nm', 'ᆮᄒ': 'th',
          'ᆯ': 'l', 'ᆯᄋ': 'r', 'ᆯᄂ': 'll',
          'ᆰ': 'k', 'ᆰᄋ': 'lg', 'ᆰᄂ': 'ngn', 'ᆰᄅ': 'ngn', 'ᆰᄆ': 'ngm', 'ᆰᄒ': 'lkh',
          'ᆱ': 'm', 'ᆱᄋ': 'lm', 'ᆱᄂ': 'mn', 'ᆱᄅ': 'mn', 'ᆱᄆ': 'mm', 'ᆱᄒ': 'lmh',
          'ᆲ': 'p', 'ᆲᄋ': 'lb', 'ᆲᄂ': 'mn', 'ᆲᄅ': 'mn', 'ᆲᄆ': 'mm', 'ᆲᄒ': 'lph',
          'ᆳ': 't', 'ᆳᄋ': 'ls', 'ᆳᄂ': 'nn', 'ᆳᄅ': 'nn', 'ᆳᄆ': 'nm', 'ᆳᄒ': 'lsh',
          'ᆴ': 't', 'ᆴᄋ': 'lt', 'ᆴᄂ': 'nn', 'ᆴᄅ': 'nn', 'ᆴᄆ': 'nm', 'ᆴᄒ': 'lth',
          'ᆵ': 'p', 'ᆵᄋ': 'lp', 'ᆵᄂ': 'mn', 'ᆵᄅ': 'mn', 'ᆵᄆ': 'mm', 'ᆵᄒ': 'lph',
          'ᆶ': 'l', 'ᆶᄋ': 'lh', 'ᆶᄂ': 'll', 'ᆶᄅ': 'll', 'ᆶᄆ': 'lm', 'ᆶᄒ': 'lh',
          'ᆷ': 'm', 'ᆷᄅ': 'mn',
          'ᆸ': 'p', 'ᆸᄋ': 'b', 'ᆸᄂ': 'mn', 'ᆸᄅ': 'mn', 'ᆸᄆ': 'mm', 'ᆸᄒ': 'ph',
          'ᆹ': 'p', 'ᆹᄋ': 'ps', 'ᆹᄂ': 'mn', 'ᆹᄅ': 'mn', 'ᆹᄆ': 'mm', 'ᆹᄒ': 'psh',
          'ᆺ': 't', 'ᆺᄋ': 'sh', 'ᆺᄂ': 'nn', 'ᆺᄅ': 'nn', 'ᆺᄆ': 'nm', 'ᆺᄒ': 'sh',
          'ᆻ': 't', 'ᆻᄋ': 's', 'ᆻᄂ': 'nn', 'ᆻᄅ': 'nn', 'ᆻᄆ': 'nm', 'ᆻᄒ': 'th',
          'ᆼ': 'ng',
          'ᆽ': 't', 'ᆽᄋ': 'j', 'ᆽᄂ': 'nn', 'ᆽᄅ': 'nn', 'ᆽᄆ': 'nm', 'ᆽᄒ': 'ch',
          'ᆾ': 't', 'ᆾᄋ': 'ch', 'ᆾᄂ': 'nn', 'ᆾᄅ': 'nn', 'ᆾᄆ': 'nm', 'ᆾᄒ': 'ch',
          'ᆿ': 'k', 'ᆿᄋ': 'k', 'ᆿᄂ': 'ngn', 'ᆿᄅ': 'ngn', 'ᆿᄆ': 'ngm', 'ᆿᄒ': 'kh',
          'ᇀ': 't', 'ᇀᄋ': 't', 'ᇀᄂ': 'nn', 'ᇀᄅ': 'nn', 'ᇀᄆ': 'nm', 'ᇀᄒ': 'th', 'ᇀ이': 'ch',
          'ᇁ': 'p', 'ᇁᄋ': 'p', 'ᇁᄂ': 'mn', 'ᇁᄅ': 'mn', 'ᇁᄆ': 'mm', 'ᇁᄒ': 'ph',
          'ᇂ': 't', 'ᇂᄋ': 'h', 'ᇂᄂ': 'nn', 'ᇂᄅ': 'nn', 'ᇂᄆ': 'mm', 'ᇂᄒ': 't'
        }
      }
    }
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChildren('renamedAsColumns')
  public renamedAsColumns: QueryList<ElementRef>;

  public isPopupOpen: boolean = false;

  public datasetName: string;

  public columns: Column[] = [];

  public gridData: { data: any, fields: any };

  public errorEsg: string;

  public op: string = 'APPEND' || 'UPDATE';

  // used when updating
  public currentIdx: number;

  public typeDesc: any;

  private _$gridElm: any;

  private _savedViewPort: { top: number, left: number };

  public subTitle: string = '';

  public indexForName: number = 1;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected element: ElementRef,
              protected injector: Injector,
              protected datasetService: DatasetService) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Open rename component with init
   * @param dsInfo
   */
  public init(dsInfo: {
    gridData: { data: any, fields: any },
    dsName: string,
    typeDesc: any,
    editInfo?: { ruleCurIdx: number, cols: string[], to: string[] },
    isFromSnapshot?: boolean,
    dsId?: string
  }) {

    this.datasetName = dsInfo.dsName;

    if (dsInfo.isFromSnapshot) {
      this.subTitle = 'for hive-type snapshot';
      this.op = 'APPEND';

      this._getGridData(dsInfo.dsId).then((result) => {
        this.gridData = this._getGridDataFromGridResponse(result.gridResponse);
        this.gridData.data = this.gridData.data.splice(0, 50);
        this.typeDesc = result.gridResponse.colDescs;
        this._setColumns(this.gridData.fields);
        this.currentIdx = result.transformRules.length - 1;

        // open popup
        this.isPopupOpen = true;

        // Grid component is undefined;
        this.safelyDetectChanges();
        this._updateGrid(this.gridData.fields, this.gridData.data);


      })

    } else {

      // open popup
      this.isPopupOpen = true;

      // set grid info, columns
      this.gridData = dsInfo.gridData;

      // Only show 50 rows
      this.gridData.data = this.gridData.data.splice(0, 50);

      this.typeDesc = dsInfo.typeDesc;

      // Set column information (right side)
      if (dsInfo.editInfo) {
        this._setColumns(this.gridData.fields, dsInfo.editInfo.cols, dsInfo.editInfo.to);
        this.op = 'UPDATE';
        this.currentIdx = dsInfo.editInfo.ruleCurIdx;
      } else {
        this._setColumns(this.gridData.fields);
        this.op = 'APPEND';
      }

      // Grid component is undefined;
      this.safelyDetectChanges();
      this._updateGrid(this.gridData.fields, this.gridData.data);


    }

  }


  /**
   * Fetch grid data of dataset
   * @param dsId
   * @private
   */
  private _getGridData(dsId: string) {

    return new Promise<any>((resolve, reject) => {

      this.datasetService.getDatasetDetail(dsId).then((result) => {
        resolve(result);
      })

    });

  }

  /**
   * Change grid data to grid response
   * @param gridResponse 매트릭스 정보
   * @returns 그리드 데이터
   */
  private _getGridDataFromGridResponse(gridResponse: any) {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for (let idx = 0; idx < colCnt; idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for (let idx = 0; idx < colCnt; idx++) {
        obj[colNames[idx]] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse


  /**
   * Close popup
   */
  public close() {
    this.isPopupOpen = false;
    this.errorEsg = null;
    this.subTitle = '';
    this.indexForName = 1;

    if (this.op === 'UPDATE') {
      this.renameMultiColumns.emit(null);
    }
  }


  /**
   * When edit button in clicked
   * @param column
   * @param index
   * @param input
   */
  public editItem(column: Column, index: number, input: HTMLInputElement) {

    // 에러가 있을떄는 에러가 해결돼야 다른 컬럼을 수정할 수 있다
    if (isNullOrUndefined(this.errorEsg)) {

      // 에러가 없을때만 !
      column.isEditing = true;

      input.focus();

    }

  }


  /**
   * Focus (tab 버튼으로 이동할때 focus가 잡히지 않아서 (focus)이용
   * @param column
   */
  public focus(column: Column) {
    if (isNullOrUndefined(this.errorEsg)) {
      column.isEditing = true;
    }
  }


  /**
   * Done button is clicked
   */
  public applyRename() {

    // Validation check
    this.columns.forEach((item, index) => {
      this.focusOut(item, index);
    });

    // If error return
    if (this.errorEsg) {
      return;
    }

    const originals: string[] = [];
    const originalsWithBackTick: string[] = [];
    const renamed: string[] = [];
    const renamedWithQuote: string[] = [];


    // wrap original columns with back ticks,
    // wrap renamed columns with single quotation
    this.columns.forEach((item) => {

      if (this.op === 'UPDATE') {
        if (item.renamedAs.trim() !== '' && (item.editOriginalName !== item.renamedAs) || item.original !== item.renamedAs) {
          originals.push(item.original);
          originalsWithBackTick.push('`' + item.original + '`');
          renamed.push(item.renamedAs);
          renamedWithQuote.push("'" + item.renamedAs + "'");
        }
      }

      if (this.op === 'APPEND') {
        if (item.renamedAs.trim() !== '' && item.original !== item.renamedAs) {
          originals.push(item.original);
          originalsWithBackTick.push('`' + item.original + '`');
          renamed.push(item.renamedAs);
          renamedWithQuote.push("'" + item.renamedAs + "'");
        }
      }
    });

    let param = null;

    if (originals.length > 0) {

      param = {
        op: this.op,
        ruleString: `rename col: ${originalsWithBackTick.toString()} to: ${renamedWithQuote.toString()}`,
        uiRuleString: {name: 'rename', col: originals, to: renamed, isBuilder: true}
      };

      if (this.subTitle !== '') {
        param.ruleIdx = this.currentIdx;
      }

    }

    // close popup
    this.isPopupOpen = false;
    this.subTitle = '';
    this.indexForName = 1;

    // If nothing is changed, returns null
    this.renameMultiColumns.emit(param);

  }


  /**
   * On key down
   * @param event
   * @param column
   */
  public onKeydownHandler(event: KeyboardEvent, column: Column) {

    if (event.keyCode === 9) {
      if (isNullOrUndefined(this.errorEsg)) {

        // 에러가 있을때 탭을 눌렀다면 현재 input을 벗어나지 못함
        column.isEditing = true;
      }
    } else { // 아무 키를 눌렀다면 에러 메시지 삭제
      column.isError = false;
      this.errorEsg = null
    }

  }


  /**
   * Check if column name has back quote
   * @param column
   * returns trues if column name has quote (`)
   */
  public hasBackTick(column: Column): boolean {

    let result: boolean = false;
    if (-1 !== column.renamedAs.indexOf('`')) {
      this.errorEsg = this.translateService.instant('msg.dp.alert.no.backtick.colname');
      result = true;
    }
    return result;
  }


  /**
   * Returns true if column name is empty
   * @param column
   */
  public isRenameInputEmpty(column: Column): boolean {
    let result: boolean = false;
    if (column.renamedAs.trim() === '' || isNullOrUndefined(column.renamedAs)) {
      this.errorEsg = this.translateService.instant('msg.dp.alert.empty.column');
      result = true;
    }
    return result;

  }


  /**
   * Returns true is name already exists
   * @param column
   * @param index
   */
  public isNameDuplicate(column: Column, index: number) {

    let isDuplicated: boolean = false;

    this.columns.forEach((item, idx) => {
      // 컬럼스에서 자기 자신과 같은 이름을 갖고 있는 컬럼이 있는지 확인한다.
      if (idx !== index && item.renamedAs === column.renamedAs) {
        isDuplicated = true;
        this.errorEsg = this.translateService.instant('msg.dp.alert.duplicate.colname');
      }
    });
    return isDuplicated;
  }


  /**
   * Focus out from input
   * @param column
   * @param index
   * @param event
   * @param input
   */
  public focusOut(column: Column, index: number, event?: FocusEvent, input?: HTMLInputElement) {

    // 편집중이면
    if (column.isEditing) {

      // Validation - back quote, duplicate name, Check if input is empty
      if (this.hasBackTick(column) || this.isNameDuplicate(column, index) || this.isRenameInputEmpty(column)) {
        column.isError = true;
        event && event.stopPropagation();
        input && input.focus();
        return;
      }

      // 포커스 아웃 할 대상은 false 로 바꿔줘야한다
      if (isNullOrUndefined(this.errorEsg)) {
        column.isEditing = false;
      }

      this._savePosition();
      // 그리드 업데이트
      this._updateGrid(this.gridData.fields, this.gridData.data);

      this._moveToSavedPosition();
    }

  }

  /**
   * Returns label
   * when update : edit
   * when append : done
   */
  public getButtonLabel(): string {
    if (this.op === 'UPDATE') {
      return this.translateService.instant('msg.comm.ui.edit')
    } else {
      return this.translateService.instant('msg.comm.btn.done2')
    }

  }


  /**
   * Returns true if item is editing
   * @param column
   */
  public isEditing(column: Column): boolean {
    return column.isEditing;
  }


  /**
   * Returns true is column name is changed from original column name
   * @param column
   */
  public isChanged(column: Column) {
    return column.renamedAs !== column.original && !column.isEditing
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Set default values for columns
   * @param fields
   * @param cols ['column1', 'column2']
   * @param tos  ['col1', 'col2']
   * column1 from cols is renamed to col1, column2 from cols is renamed to col2
   * @private
   */
  private _setColumns(fields: any, cols?: string[], tos?: string[]) {
    this.columns = [];
    fields.forEach((item) => {
      if (cols) {
        // 편집일 경우 편집한 이름으로 renamedAs 를 넣어준다
        let idx = cols.indexOf(item.name);
        this.columns.push({
          editOriginalName: idx === -1 ? item.name : tos[idx],
          original: item.name, renamedAs: idx === -1 ? item.name : tos[idx],
          isError: false,
          isEditing: false
        });
      } else {
        if (this.subTitle !== '') { // Came from snapshot popup
          this.columns.push({
            original: item.name,
            renamedAs: this._replaceWhiteSpace(this._korToEng(item.name), '_').toLowerCase(),
            isError: false,
            isEditing: false
          });
        } else {
          this.columns.push({
            original: item.name,
            renamedAs: item.name,
            isError: false,
            isEditing: false
          });
        }
      }
    });


    // Except korean, english, numbers and _ change to default name
    if (!cols && this.subTitle !== '') {
      this._changeToDefaultName();
    }
  }


  /**
   * Replace white space into '_'
   * @param name
   * @param replaceVal
   * @private
   */
  private _replaceWhiteSpace(name: string, replaceVal: string = '_') {
    return name.replace(/ /gi, replaceVal)
  }


  /**
   * Returns appropriate name for each column name
   * @private
   */
  private _changeToDefaultName(): void {

    const validCheckReg = /[a-zA-Z0-9_가-힣]/;
    const koCheckReg = /[ㄱ-ㅎㅏ-ㅣ]+/g;

    this.columns.forEach((item, index) => {

      // if name is 안녕ㅎㅎㅎ -> ㅎㅎㅎ is not changed
      let koMatched = item.renamedAs.match(koCheckReg);

      // Check if has any character other than alphabet, number, korean and _
      let otherMatched = validCheckReg.test(item.renamedAs);

      const renamedAs = this.columns.map((item) => item.renamedAs);

      if (!isNullOrUndefined(koMatched) || !otherMatched) {
        while (-1 !== renamedAs.indexOf('column' + this.indexForName)) {
          this.indexForName += 1;
        }
        this.columns[index].renamedAs = 'column' + this.indexForName;
      }
    })

  }

  /**
   * Update grid
   * @private
   */
  private _updateGrid(fields, rows) {

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field, index) => {
      return new SlickGridHeader()
        .Id('_idProperty_')
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + this.columns[index].renamedAs + '</span>')
        .Field(field.name)
        .Behavior('select')
        .Selectable(false)
        .CssClass('cell-selection')
        .Width(200)
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .Formatter((row, cell, value) => {
          const colDescs = (this.typeDesc) ? this.typeDesc[cell] : {};
          if (!isNullOrUndefined(colDescs)) {
            value = this._setFieldFormatter(value, colDescs.type, colDescs);
          }
          return value;
        })
        .build();
    });

    this._gridComp.create(
      headers,
      new ScrollLoadingGridModel(
        () => {
        },
        () => {
        },
        rows
      ),
      new GridOption()
        .SyncColumnCellResize(true)
        .RowHeight(32)
        .MultiSelect(false)
        .MultiColumnSort(false)
        .EnableColumnReorder(false)
        .EnableSeqSort(false)
        .build(),
      0,
      0
    );

    this._$gridElm = this._gridComp.getGridJQueryObject();
  }


  /**
   * 문자열에 타임스탬프 포맷을 적용함
   * @param {string} value
   * @param {string} timestampStyle
   * @return {string}
   * @private
   */
  private _setTimeStampFormat(value: string, timestampStyle?: string): string {

    (timestampStyle) || (timestampStyle = 'YYYY-MM-DDTHH:mm:ss');
    let result = moment.utc(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g, ''));
    if (result === 'Invalid date') {
      result = value;
    }
    return result;
  }

  /**
   * 필드에 대한 형식 지정
   * @param value
   * @param {string} type
   * @param {{timestampStyle: string, arrColDesc: any, mapColDesc: any}} colDescs
   * @returns {string}
   * @private
   */
  private _setFieldFormatter(value: any, type: string,
                             colDescs: { timestampStyle?: string, arrColDesc?: any, mapColDesc?: any }): string {
    let strFormatVal: string = '';
    if (colDescs) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = this._setTimeStampFormat(value, colDescs.timestampStyle);
      } else if ('ARRAY' === type) {
        // 배열 형식내 각 항목별 타임 스템프 처리
        const arrColDescs = colDescs.arrColDesc ? colDescs.arrColDesc : {};
        strFormatVal = JSON.stringify(
          value.map((item: any, idx: number) => {
            const colDesc = arrColDescs[idx] ? arrColDescs[idx] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              return this._setTimeStampFormat(item, colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(item, colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              return ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          })
        );
      } else if ('MAP' === type) {
        // 구조체내 각 항목별 타임 스템프 처리
        const mapColDescs = colDescs.mapColDesc ? colDescs.mapColDesc : {};
        let newMapValue = {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            const colDesc = mapColDescs.hasOwnProperty(key) ? mapColDescs[key] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              newMapValue[key] = this._setTimeStampFormat(value[key], colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(value[key], colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              newMapValue[key]
                = ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          }
        }
        strFormatVal = JSON.stringify(newMapValue);
      } else {
        strFormatVal = <string>value;
      }
    } else {
      strFormatVal = <string>value;
    }

    return strFormatVal;
  } // function - _setFieldFormatter


  /**
   * Save scroll position
   */
  private _savePosition() {
    const viewPort = this._$gridElm.find('.slick-viewport').get(0);
    this._savedViewPort = {
      top: viewPort.scrollTop,
      left: viewPort.scrollLeft
    };
  }

  /**
   * Move to saved scroll position
   */
  public _moveToSavedPosition() {
    const $viewPort = this._$gridElm.find('.slick-viewport');
    $viewPort.scrollTop(this._savedViewPort.top);
    $viewPort.scrollLeft(this._savedViewPort.left);
  }


  /**
   * Change korean to english 안녕 --> annyeong
   * @param argText
   * @param argRule
   * @param argHyphen
   * @private
   */
  private _korToEng(argText: string, argRule?: string, argHyphen?: string) {

    // Helper functions
    // Check if it's letter or numbers
    let isChoseong = (char) => {
      if (char.charCodeAt(0) >= 0x1100 && char.charCodeAt(0) <= 0x1112) {
        return true;
      } else {
        return false;
      }
    };

    // Options mapping
    let args = {text: argText, rule: argRule, hyphen: argHyphen};
    if (args.hyphen == null) {
      args.hyphen = '';
    }

    let rulemap = this._korToEngRules.hangul.rr;
    if (args.rule != null && this._korToEngRules.hangul[args.rule] != null) {
      rulemap = this._korToEngRules.hangul[args.rule];
    } else if (args.rule != null) {
      throw 'Invalid rule ' + args.rule;
    }

    let rom = '';
    let curr = null, next;
    let skipJaeum = false; // Indicates jaeum of current iteration to be skipped
    for (let i = 0; i <= args.text.length; i++) {
      // If next is hangul syllable, separate it into jamo
      // 0xAC00 is the first hangul syllable in unicode table
      // 0x1100 is the first hangul jaeum in unicode table
      // 0x1161 is the first hangul moeum in unicode table
      // 0x11A8 is the first hangul batchim in unicode table
      let nextIdx = args.text.charCodeAt(i) - 0xAC00;
      if (!isNaN(nextIdx) && nextIdx >= 0 && nextIdx <= 11171) {
        next = String.fromCharCode(Math.floor(nextIdx / 588) + 0x1100)
          + String.fromCharCode(Math.floor(nextIdx % 588 / 28) + 0x1161)
          + (nextIdx % 28 == 0 ? '' : String.fromCharCode(nextIdx % 28 + 0x11A7)); // Index 0 is reserved for nothing
      } else {
        next = args.text.charAt(i);
      }

      // Except for first iteration (curr is null),
      // Curr and next contains 2 or 3 jamo, or 1 non-hangul letter
      if (curr != null) {

        var res = '';

        // Choseong Jaeum
        if (!skipJaeum) {
          // If not the first syllable, try cho2 if defined
          if (i > 0 && !/\s/.test(args.text.charAt(i - 2)) &&
            rulemap['cho2'] != undefined &&
            rulemap['cho2'][curr.charAt(0)] != undefined
          ) {
            res += rulemap['cho2'][curr.charAt(0)];
          } else if (rulemap.cho[curr.charAt(0)] != undefined) {
            res += rulemap.cho[curr.charAt(0)];
          } else {
            res += curr.charAt(0);
          }
        }
        skipJaeum = false;

        // Jungseong Moeum
        if (curr.length > 1) {
          if (rulemap.jung[curr.charAt(1)] != undefined) {
            res += rulemap.jung[curr.charAt(1)];
          } else {
            res += curr.charAt(1);
          }

          // Add hyphen if no batchim
          if (curr.length == 2 && isChoseong(next.charAt(0))) {
            res += ' ';
          }
        }

        // Jongseong Jaeum (Batchim)
        if (curr.length > 2) {
          // Changing sound with next jaeum + moeum
          if (rulemap.jong[curr.charAt(2) + next.charAt(0) + next.charAt(1)] != undefined) {
            res += rulemap.jong[curr.charAt(2) + next.charAt(0) + next.charAt(1)];
            skipJaeum = true;

            // No need to add hyphen here as it's already defined
          }
          // Changing sound with next jaeum
          else if (rulemap.jong[curr.charAt(2) + next.charAt(0)] != undefined) {
            res += rulemap.jong[curr.charAt(2) + next.charAt(0)];
            skipJaeum = true;

            // No need to add hyphen here as it's already defined
          }
          // Unchanging sound
          else if (rulemap.jong[curr.charAt(2)] != undefined) {
            res += rulemap.jong[curr.charAt(2)];

            // Add hyphen
            if (isChoseong(next.charAt(0))) {
              res += ' ';
            }
          } else {
            res += curr.charAt(2);

            // Add hyphen
            if (isChoseong(next.charAt(0))) {
              res += ' ';
            }
          }
        }

        // Replace hyphen (if this is hangeul word)
        if (curr.length > 1) {
          if (args.hyphen == '' && rulemap['hyphen'] != null) {
            res = res.replace(' ', rulemap['hyphen']);
          } else {
            // Soft hyphen
            res = res.replace(' ', args.hyphen);
            // Hard hyphen
            if (args.hyphen != '') {
              res = res.replace('-', args.hyphen);
            }
          }
        }
        rom += res;
      }

      curr = next;
    }
    return rom;
  } // function - _korToEng

}

class Column {
  public original: string;
  public renamedAs: string;
  public editOriginalName?: string;
  public isError: boolean;
  public isEditing: boolean;
}

