/*
package app.metatron.discovery.domain.dataprep.exceptions;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;

public class PrepErrorResponse {
    String exceptionClassName;
    String errorMsg;

    public PrepErrorResponse(Exception e) {
        if (System.getProperty("dataprep").equals("disabled"))
          e = PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_INVALID_CONFIG_CODE);

        this.exceptionClassName = e.getClass().toString();
        if (e.getMessage() == null) {
            this.errorMsg = this.exceptionClassName;
        } else {
            this.errorMsg = e.getMessage();
        }
    }

    public PrepErrorResponse(String errorMsg) {
        this.exceptionClassName = null;
        this.errorMsg = errorMsg;
    }

    public String getExceptionClassName() {
        return exceptionClassName;
    }

    public void setExceptionClassName(String exceptionClassName) {
        this.exceptionClassName = exceptionClassName;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }
}
*/
