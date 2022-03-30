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

package app.metatron.discovery.common;

import com.google.common.collect.Lists;

import com.google.common.collect.Maps;
import org.apache.commons.lang3.CharEncoding;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.mail.internet.MimeMessage;

import app.metatron.discovery.domain.user.User;

/**
 * Created by kyungtaak on 2017. 1. 26..
 */
@Component
public class Mailer {

  private final Logger LOGGER = LoggerFactory.getLogger(Mailer.class);

  @Autowired
  private MetatronProperties metatronProperties;

  @Autowired(required = false)
  private JavaMailSenderImpl javaMailSender;

  @Autowired
  private MessageSource messageSource;

  @Autowired
  TemplateEngine templateEngine;

  @Value("${polaris.title}")
  private String title;

  @Async
  public void sendEmail(List<String> to, String subject, String content, boolean isMultipart, boolean isHtml) {
    LOGGER.debug("Send e-mail[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
        isMultipart, isHtml, to, subject, content);

    // Prepare message using a Spring helper
    MimeMessage mimeMessage = javaMailSender.createMimeMessage();
    try {
      MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, CharEncoding.UTF_8);
      message.setTo(to.toArray(new String[0]));
      message.setFrom(metatronProperties.getMail().getFrom());
      message.setSubject(subject);
      message.setText(content, isHtml);
      javaMailSender.send(mimeMessage);
      LOGGER.debug("Sent e-mail to User '{}'", to);
    } catch (Exception e) {
      LOGGER.warn("E-mail could not be sent to user '{}'", to, e);
    }
  }

  /**
   * Send mail for providing a temporary password
   *
   * @param user
   * @param client
   * @param temporaryPassword
   * @param isAdmin
   * @param locale
   */
  @Async
  public void sendPasswordResetMail(User user, ClientDetails client, String temporaryPassword, boolean isAdmin, Locale locale) {

    LOGGER.debug("Sending password reset e-mail to '{}'", user.getEmail(), client, locale);

    Map<String, Object> clientInfo = client == null ? Maps.newHashMap() : client.getAdditionalInformation();
    String logoPath = (String) clientInfo.getOrDefault("logoFilePath", "/assets/images/mail/icon_logo.png");
    String title = (String) clientInfo.getOrDefault("clientName", this.title);
    String serviceUrl = (String) clientInfo.getOrDefault("clientBaseUrl", metatronProperties.getMail().getBaseUrl());

    Context context = new Context();
    context.setVariable("user", user);
    context.setVariable("temporaryPassword", temporaryPassword);
    context.setVariable("logoPath", metatronProperties.getMail().getBaseUrl() + logoPath);
    context.setVariable("title", title);
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());
    context.setVariable("serviceUrl", serviceUrl);

    String templateName;
    if(isAdmin) {
      templateName = "email/user_reset_password_by_admin";
    } else {
      templateName = "email/user_reset_password";
    }

    String content = templateEngine.process(templateName, context);
    String subject = "[" + title + "] "
            + messageSource.getMessage("message.app.mail.temp.pwd.title", null, locale);
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  @Async
  public void sendSignUpRequestMail(User user, boolean isAdmin) {
    LOGGER.debug("Sending sign up request e-mail to '{}'", user.getEmail());
    Context context = new Context();
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String content = templateEngine.process("email/user_signup_request", context);
    String subject = this.getUpperCaseTitle() + " User registration request";


    List<String> toList = Lists.newArrayList();
    toList.add(metatronProperties.getMail().getAdmin());

    // TODO: 관리자 목록 가져올 것!
    sendEmail(toList, subject, content, false, true);
  }

  @Async
  public void sendSignUpApprovedMail(User user, boolean isAdmin, String password) {
    LOGGER.debug("Sending sign up approved e-mail to '{}'", user.getEmail());
    Context context = new Context();
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String templateName, subject;
    if(isAdmin) {
      templateName = "email/user_signup_approved_by_admin";
      subject = this.getUpperCaseTitle() + " added your account";
      context.setVariable("temporaryPassword", password);
    } else {
      templateName = "email/user_signup_approved";
      subject = this.getUpperCaseTitle() + " approved your request";
    }

    String content = templateEngine.process(templateName, context);
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  @Async
  public void sendSignUpDeniedMail(User user) {
    LOGGER.debug("Sending sign up denied e-mail to '{}'", user.getEmail());
    Context context = new Context();
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String content = templateEngine.process("email/user_signup_denied", context);
    String subject = this.getUpperCaseTitle() + " rejected your request";

    // TODO: 관리자 목록 가져올 것!
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  private String getUpperCaseTitle() {
    return this.title.toUpperCase();
  }

}
