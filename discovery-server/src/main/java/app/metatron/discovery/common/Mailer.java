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

import org.apache.commons.lang3.CharEncoding;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Locale;

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

  @Async
  public void sendPasswordResetMail(User user, String temporaryPassword, boolean isAdmin) {
    LOGGER.debug("Sending password reset e-mail to '{}'", user.getEmail());

    Locale locale = Locale.KOREA;
    Context context = new Context(locale);
    context.setVariable("user", user);
    context.setVariable("temporaryPassword", temporaryPassword);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String templateName;
    if(isAdmin) {
      templateName = "email/user_reset_password_by_admin";
    } else {
      templateName = "email/user_reset_password";
    }

    String content = templateEngine.process(templateName, context);
//    String subject = messageSource.getMessage(("email.reset.title", null, locale);
    String subject = this.getUpperCaseTitle() + " 임시비밀번호 발급 안내";
//    String subject = "Metatron 임시비밀번호 발급 안내";
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  @Async
  public void sendSignUpRequestMail(User user, boolean isAdmin) {
    LOGGER.debug("Sending sign up request e-mail to '{}'", user.getEmail());
    Locale locale = Locale.KOREA;
    Context context = new Context(locale);
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String content = templateEngine.process("email/user_signup_request", context);
    String subject = this.getUpperCaseTitle() + " 사용자 등록 요청";


    List<String> toList = Lists.newArrayList();
    toList.add(metatronProperties.getMail().getAdmin());

    // TODO: 관리자 목록 가져올 것!
    sendEmail(toList, subject, content, false, true);
  }

  @Async
  public void sendSignUpApprovedMail(User user, boolean isAdmin) {
    LOGGER.debug("Sending sign up approved e-mail to '{}'", user.getEmail());
    Locale locale = Locale.KOREA;
    Context context = new Context(locale);
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String templateName, subject;
    if(isAdmin) {
      templateName = "email/user_signup_approved_by_admin";
      subject = this.getUpperCaseTitle() + " 가입 완료 안내";
    } else {
      templateName = "email/user_signup_approved";
      subject = this.getUpperCaseTitle() + " 가입 요청 승인 안내";
    }

    String content = templateEngine.process(templateName, context);
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  @Async
  public void sendSignUpDeniedMail(User user) {
    LOGGER.debug("Sending sign up denied e-mail to '{}'", user.getEmail());
    Locale locale = Locale.KOREA;
    Context context = new Context(locale);
    context.setVariable("user", user);
    context.setVariable("title", this.getUpperCaseTitle());
    context.setVariable("baseUrl", metatronProperties.getMail().getBaseUrl());

    String content = templateEngine.process("email/user_signup_denied", context);
    String subject = this.getUpperCaseTitle() + " 가입 요청 반려";

    // TODO: 관리자 목록 가져올 것!
    sendEmail(Lists.newArrayList(user.getEmail()), subject, content, false, true);
  }

  private String getUpperCaseTitle() {
    return this.title.toUpperCase();
  }

}
