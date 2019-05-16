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

import com.google.common.base.Preconditions;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.ConversionFailedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.rest.core.RepositoryConstraintViolationException;
import org.springframework.data.rest.webmvc.RepositoryRestExceptionHandler;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.data.rest.webmvc.support.ETagDoesntMatchException;
import org.springframework.data.rest.webmvc.support.RepositoryConstraintViolationExceptionMessage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.lang.reflect.InvocationTargetException;

/**
 * Spring Data Rest Custom Exception Handler
 */
@RestControllerAdvice(basePackageClasses = RepositoryRestExceptionHandler.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RestExceptionHandler extends AbstractExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(RestExceptionHandler.class);

  @Value("${polaris.common.exception.printTrace:true}")
  private boolean printStackTrace;

  /**
   * Handles {@link ResourceNotFoundException} by returning {@code 404 Not Found}.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler({ResourceNotFoundException.class})
  ResponseEntity<?> handleNotFound(Exception o_O, WebRequest webRequest) {

    String resource = ((ServletWebRequest)webRequest).getRequest().getRequestURI();

    return notFound(new HttpHeaders(),
                    new app.metatron.discovery.common.exception.ResourceNotFoundException(resource, o_O),
                    webRequest);
  }

  /**
   * Handles {@link HttpMessageNotReadableException} by returning {@code 400 Bad Request}.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler({HttpMessageNotReadableException.class})
  ResponseEntity<ErrorResponse> handleNotReadable(Exception o_O, WebRequest webRequest) {
    return badRequest(new HttpHeaders(), o_O, webRequest);
  }

  /**
   * Handle failures commonly thrown from code tries to read incoming data and convert or cast it to
   * the right type by returning {@code 500 Internal Server Error} and the thrown exception
   * marshalled into JSON.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler({InvocationTargetException.class, IllegalArgumentException.class, ClassCastException.class,
      ConversionFailedException.class, NullPointerException.class})
  ResponseEntity<ErrorResponse> handleMiscFailures(Exception o_O, WebRequest webRequest) {

    return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, new HttpHeaders(), new UnknownServerException(o_O), webRequest);
  }

  /**
   * Send a {@code 500 Conflict} in case of Metatron Biz Exception
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler({MetatronException.class})
  ResponseEntity<ErrorResponse> handleMetatronError(Exception o_O, WebRequest webRequest) {
    return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, new HttpHeaders(), o_O, webRequest);
  }

  /**
   * Handles {@link RepositoryConstraintViolationException}s by returning {@code 400 Bad Request}.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler
  ResponseEntity<RepositoryConstraintViolationExceptionMessage> handleRepositoryConstraintViolationException(
      RepositoryConstraintViolationException o_O) {
    return response(HttpStatus.BAD_REQUEST, new HttpHeaders(), new RepositoryConstraintViolationExceptionMessage(o_O,
                                                                                                                 messageSourceAccessor));
  }

  /**
   * Send a {@code 409 Conflict} in case of concurrent modification.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler({OptimisticLockingFailureException.class, DataIntegrityViolationException.class})
  ResponseEntity<ErrorResponse> handleConflict(Exception o_O, WebRequest webRequest) {
    return errorResponse(HttpStatus.CONFLICT, new HttpHeaders(), o_O, webRequest);
  }

  /**
   * Send {@code 405 Method Not Allowed} and include the supported {@link
   * org.springframework.http.HttpMethod}s in the {@code Allow} header.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler
  ResponseEntity<Void> handle(HttpRequestMethodNotSupportedException o_O, WebRequest webRequest) {

    HttpHeaders headers = new HttpHeaders();
    headers.setAllow(o_O.getSupportedHttpMethods());

    return response(HttpStatus.METHOD_NOT_ALLOWED, headers, webRequest);
  }

  /**
   * Handles {@link ETagDoesntMatchException} by returning {@code 412 Precondition Failed}.
   *
   * @param o_O the exception to handle.
   */
  @ExceptionHandler
  ResponseEntity<Void> handle(ETagDoesntMatchException o_O, WebRequest webRequest) {

    HttpHeaders headers = o_O.getExpectedETag().addTo(new HttpHeaders());
    return response(HttpStatus.PRECONDITION_FAILED, headers, webRequest);
  }

  private ResponseEntity<?> notFound(HttpHeaders headers, Exception exception, WebRequest webRequest) {
    return errorResponse(HttpStatus.NOT_FOUND, headers, exception, webRequest);
  }

  private ResponseEntity<ErrorResponse> badRequest(HttpHeaders headers, Exception exception, WebRequest webRequest) {
    return errorResponse(HttpStatus.BAD_REQUEST, headers, exception, webRequest);
  }

  private ResponseEntity<ErrorResponse> errorResponse(HttpStatus status, HttpHeaders headers, Exception exception, WebRequest webRequest) {

    if (exception != null) {

      HttpStatus resultStatus;
      ErrorCodes code;
      String message;
      String details = ExceptionUtils.getRootCauseMessage(exception);

      if (exception instanceof MetatronException) {
        ResponseStatus responseStatus = AnnotatedElementUtils
                                .findMergedAnnotation(exception.getClass(), ResponseStatus.class);
        MetatronException metatronException = (MetatronException) exception;

        code = metatronException.getCode();
        message = metatronException.getMessage();

        if (responseStatus != null) {
          resultStatus = responseStatus.code() == null ? status : responseStatus.code();
        } else {
          resultStatus = status;
        }

      } else {
        resultStatus = status;
        code = GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE;
        message = MetatronException.DEFAULT_GLOBAL_MESSAGE;
      }

      LOGGER.error("[API:{}] {} {}: {}", ((ServletWebRequest) webRequest).getRequest().getRequestURI(),
                   code == null ? "" : code.getCode(), message, details);
      if(printStackTrace) {
        exception.printStackTrace();
      }

      return response(resultStatus, headers, new ErrorResponse(code, message, details));
    }

    return response(status, headers, null);
  }

  /**
   * Body 없이 에러 메시지 처리
   *
   * @param status
   * @param headers
   * @param webRequest
   * @param <T>
   * @return
   */
  private <T> ResponseEntity<T> response(HttpStatus status, HttpHeaders headers, WebRequest webRequest) {
    // TODO : Handling LOG
    return response(status, headers, null);
  }

  private <T> ResponseEntity<T> response(HttpStatus status, HttpHeaders headers, T body) {

    Preconditions.checkNotNull(headers, "Headers must not be null!");
    Preconditions.checkNotNull(status, "HttpStatus must not be null!");

    return new ResponseEntity<>(body, headers, status);
  }
}
