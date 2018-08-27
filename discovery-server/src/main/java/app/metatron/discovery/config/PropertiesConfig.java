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

package app.metatron.discovery.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.Locale;

import app.metatron.discovery.util.MessageUtil;

@Configuration
public class PropertiesConfig {
	
	/**
	 * language 값으로 locale 변경
	 * @return
	 */
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor(){
        LocaleChangeInterceptor localeChangeInterceptor=new LocaleChangeInterceptor();
        //request로 넘어오는 language parameter를 받아서 locale로 설정 한다.
        localeChangeInterceptor.setParamName("language");
        return localeChangeInterceptor;
    }
    
    /**
     * localResolver 값 세팅. en_US
     * @return
     */
    @Bean(name = "localeResolver")
    public LocaleResolver sessionLocaleResolver(){
        //세션 기준으로 로케일을 설정 한다.
        SessionLocaleResolver localeResolver=new SessionLocaleResolver();
        //쿠키 기준(세션이 끊겨도 브라우져에 설정된 쿠키 기준으로)
//        CookieLocaleResolver localeResolver = new CookieLocaleResolver();
 
        //최초 기본 로케일을 강제로 설정이 가능 하다.
        localeResolver.setDefaultLocale(new Locale("ko"));
        return localeResolver;
    }
 
    /**
     * interceptors 추가.
     * @param registry
     */
    public void addInterceptors(InterceptorRegistry registry) {
        //Interceptor를 추가 한다.
        registry.addInterceptor(localeChangeInterceptor());
    }
    
	/**
     * declare messageSource
     * @return
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames("messages/messages", "messages/metatron_security_messages");
        messageSource.setFallbackToSystemLocale(false);
        messageSource.setCacheSeconds(100000);
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }
    
    /**
     * declare messageSourceAccessor
     * @return
     */
    @Bean
    public MessageSourceAccessor messageSourceAccessor(){
    	MessageSourceAccessor messageSourceAccessor = new MessageSourceAccessor( messageSource() );
    	return messageSourceAccessor;
    }
    
	/**
	 * declare messageUtil
	 * @return
	 */
	@Bean 
	MessageUtil messageUtil(){
    	MessageUtil messageUtil = new MessageUtil();
    	messageUtil.setMessageSourceAccessor(messageSourceAccessor());
    	return messageUtil;
	}
    
	/**
	 * declare properties
	 * @return
	 */
//  application ymal로 변경.
//	@Bean
//	public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
//
//		PropertySourcesPlaceholderConfigurer props = new PropertySourcesPlaceholderConfigurer();
//		props.setIgnoreUnresolvablePlaceholders(true);
//		props.setLocation(new ClassPathResource("properties/config.properties"));
//		return props;
//	}
}
