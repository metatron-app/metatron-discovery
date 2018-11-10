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

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import org.apache.commons.lang3.exception.ExceptionUtils;

import java.io.Serializable;

/**
 * API 에러처리를 위한 모델
 */
@JsonPropertyOrder({ "code", "message", "details" })
public class ErrorResponse implements Serializable {
  /**
   * 에러 코드
   */
  String code;

  /**
   * 대표 에러 메시지
   */
  String message;

  /**
   * 상세 에러 메시지
   */
  Object details;

  public ErrorResponse() {
    // empty constructor
  }

  public ErrorResponse(ErrorCodes code, String message, Object details) {
    this.code = Preconditions.checkNotNull(code).getCode();
    this.message = message;
    this.details = details;
  }

  public ErrorResponse(MetatronException e) {
    this.code = e.getCode() == null ? GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE.toString() : e.getCode().toString();
    this.message = e.getMessage();
    this.details = ExceptionUtils.getStackTrace(e);
  }

  public static ErrorResponse unknownError(Exception ex) {
    return new ErrorResponse(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, MetatronException.DEFAULT_GLOBAL_MESSAGE, ExceptionUtils.getStackTrace(ex));
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Object getDetails() {
    return details;
  }

  public void setDetails(Object details) {
    this.details = details;
  }

  @Override
  public String toString() {
    return "ErrorResponse{" +
        "code='" + code + '\'' +
        ", message='" + message + '\'' +
        ", details=" + details +
        '}';
  }
}
