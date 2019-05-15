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

package app.metatron.discovery.common.exception;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.common.exceptions.InvalidGrantException;
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.io.IOException;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;

@RestControllerAdvice(basePackages = {"app.metatron.discovery", "org.springframework.security"})
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Value("${polaris.common.exception.printTrace:true}")
  private boolean printStackTrace;

  /**
   * 연결의 Client로 부터 종료 되었을 경우 처리 (내부적으로 진행하고 있는 Connection 에 대한 처리)
   */
  @ExceptionHandler(IOException.class)
  @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
  public ResponseEntity<Object> exceptionHandler(IOException ex, WebRequest request) {

    if (StringUtils.containsIgnoreCase(ExceptionUtils.getRootCauseMessage(ex), "Broken pipe")) {
      String queryId = CommonLocalVariable.getLocalVariable().getQueryId();
      if (StringUtils.isNotEmpty(queryId)) {
        engineMetaRepository.cancelQuery(queryId);
      }
      return null;  // Socket is closed, cannot return any response
    }

    return handleAll(ex, request);
  }

  @ExceptionHandler(value = {MetatronException.class})
  protected ResponseEntity<Object> handleMetatronException(MetatronException ex, WebRequest request) {

    HttpStatus status;
    ErrorResponse response;

    ResponseStatus responseStatus = AnnotatedElementUtils.findMergedAnnotation(ex.getClass(), ResponseStatus.class);

    String details = ExceptionUtils.getRootCauseMessage(ex);

    if (responseStatus != null) {
      status = responseStatus.code();
      response = new ErrorResponse(ex.getCode(), ex.getMessage(), details);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      response = new ErrorResponse(ex.getCode(), MetatronException.DEFAULT_GLOBAL_MESSAGE, details);
    }

    LOGGER.error("[API:{}] {} {}: {}", ((ServletWebRequest) request).getRequest().getRequestURI(),
                 response.getCode() == null ? "" : response.getCode(),
                 response.getMessage(),
                 response.getDetails());

    if(printStackTrace) {
      ex.printStackTrace();
    }

    return handleExceptionInternal(ex, response, new HttpHeaders(), status, request);
  }

  @ExceptionHandler(value = {PrepException.class})
  protected ResponseEntity<Object> handlePrepException(PrepException ex, WebRequest request) {

    HttpStatus status;
    ErrorResponse response;

    ResponseStatus responseStatus = AnnotatedElementUtils.findMergedAnnotation(ex.getClass(), ResponseStatus.class);

    if (responseStatus != null) {
      status = responseStatus.code();
      response = new ErrorResponse(ex.getCode(), ex.getMessageKey(), ex.getMessageDetail());
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      response = new ErrorResponse(ex.getCode(), MetatronException.DEFAULT_GLOBAL_MESSAGE, ex.getMessage());
    }

    LOGGER.error("[API:{}] {} {}: {}", ((ServletWebRequest) request).getRequest().getRequestURI(),
            response.getCode() == null ? "" : response.getCode(),
            response.getMessage(),
            response.getDetails());

    return handleExceptionInternal(ex, response, new HttpHeaders(), status, request);
  }

  @ExceptionHandler(value = {AccessDeniedException.class})
  protected ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
    return handleMetatronException(new app.metatron.discovery.common.exception.AccessDeniedException(ex), request);
  }

  @ExceptionHandler(value = {InvalidTokenException.class})
  protected ResponseEntity<Object> handleInvalidTokenException(InvalidTokenException ex, WebRequest request) {
    return handleMetatronException(new app.metatron.discovery.common.exception.InvalidTokenException(ex), request);
  }

  @ExceptionHandler(value = {InvalidGrantException.class})
  protected ResponseEntity<Object> handleAuthenticationException(InvalidGrantException ex, WebRequest request) {
    return handleMetatronException(new AuthenticationException(ex), request);
  }

  @ExceptionHandler({MethodArgumentTypeMismatchException.class})
  public ResponseEntity<Object> handleMethodTypeMismatchException(MethodArgumentTypeMismatchException ex, WebRequest request) {
    return handleMetatronException(new BadRequestException(ex), request);
  }

  @ExceptionHandler({Exception.class, RuntimeException.class})
  public ResponseEntity<Object> handleAll(Exception ex, WebRequest request) {
    return handleMetatronException(new UnknownServerException(ex), request);
  }

}
