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
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Configuration
public class PropertiesConfig {

  /**
   * Accept-Locale based resolver
   * @return
   */
  @Bean
  public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver acceptHeaderLocaleResolver = new AcceptHeaderLocaleResolver();
    acceptHeaderLocaleResolver.setDefaultLocale(Locale.ENGLISH);

    List<Locale> localeList = new ArrayList<>();
    localeList.add(Locale.ENGLISH);
    localeList.add(Locale.KOREAN);
    localeList.add(Locale.CHINESE);
    acceptHeaderLocaleResolver.setSupportedLocales(localeList);

    return acceptHeaderLocaleResolver;
  }

  /**
   *
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
   *
   */
  @Bean
  public MessageSourceAccessor messageSourceAccessor() {
    MessageSourceAccessor messageSourceAccessor = new MessageSourceAccessor(messageSource());
    return messageSourceAccessor;
  }

}
