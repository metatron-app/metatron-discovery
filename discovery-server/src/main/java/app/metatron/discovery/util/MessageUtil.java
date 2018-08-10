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

package app.metatron.discovery.util;

import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Locale;
 
/*
 * 클래스 이름 : MessageUtil
 * 
 * 클래스 설명 : 메시지 유틸
 * 
 * 작성자 정보 : KJ
 *
 * 버전 정보 : v1
 *
 * 수정 이력  : 2016. 01. 25
 *
 */
public class MessageUtil {
 
    private MessageSourceAccessor messageSourceAccessor = null;
     
    public void setMessageSourceAccessor(MessageSourceAccessor msAcc) {
        this.messageSourceAccessor = msAcc;
    }
     
    public String getMessage(String key) {
    	if( null == RequestContextHolder.getRequestAttributes() ) {
    		return messageSourceAccessor.getMessage(key);
    	}
    	else {
    		Locale locale = LocaleContextHolder.getLocale();
    		return messageSourceAccessor.getMessage(key, locale);
    	}
    }
}
