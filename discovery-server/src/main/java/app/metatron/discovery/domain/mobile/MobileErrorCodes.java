package app.metatron.discovery.domain.mobile;

import app.metatron.discovery.common.exception.ErrorCodes;

/**
 * Error codes for mobile
 */
public enum MobileErrorCodes implements ErrorCodes {

  MOBILE_UNKNOWN_ERROR("MO0000"),           // Unknown error for mobile
  MOBILE_RESOURCE_NOT_FOUND("MO0001"),      // Mobile resource not found.
  INVALID_MOBILE_CLIENT("MO0002");          // Invalid mobile client id

  String errorCode;

  MobileErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}