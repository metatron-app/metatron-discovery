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

package app.metatron.discovery.domain.dataprep.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnknownError;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Preparation Error")
public class PrepException extends MetatronException {
    public static String DEFAULT_GLOBAL_MESSAGE = "Preparation Error";

    // msg.dp.alert....
    String messageKey;

    // detail message
    String messageDetail;

    public String getMessageKey() { return messageKey; }
    public String getMessageDetail() { return messageDetail; }

    public void setMessageKey(String messageKey) {
        this.messageKey = messageKey;
    }
    public void setMessageDetail(String messageDetail) {
        this.messageDetail = messageDetail;
    }

    //
    // dataprep에서는 항상 create()중에 하나만을 통해서만 exception을 생성합니다.
    // 결국 client한테는 다음의 형태의 JSON이 전달됩니다.

    // {
    //   "code": code,
    //   "details": message,
    //   "message": @ResponseStatus.reason (즉, client에서 보게되는 PrepException의 message는 언제나 "Preparation Logical Error"임)
    // }
    //
    // message가 details가 되고 reason이 message가 되는 것에 주의!!!
    //

    // 이미 PrepException 형태로 catch가 되면 그냥 던지고, 아니면 Exception의 message를 뽑아서 PrepException으로 만듦.
    static public PrepException create(ErrorCodes code, Exception e) {
        if (e instanceof PrepException) {
            return (PrepException) e;
        } else if(e instanceof  TeddyException) {
            return PrepException.fromTeddyException((TeddyException) e);
        } else {
            if(e instanceof JdbcDataConnectionException) {
                return create(code, PrepMessageKey.MSG_DP_ALERT_JDBC_CONNECTION_ERROR);
            } else {
                String detail = e.getMessage();
                if(detail==null) {
                    detail = e.getClass().getName();
                }
                return create(code, PrepMessageKey.MSG_DP_ALERT_UNKOWN_ERROR, detail);
            }
        }
    }

    static public PrepException create(ErrorCodes code, PrepMessageKey messageKey) {
        return new PrepException(code, messageKey.getMessageKey(), null);
    }
    static public PrepException create(ErrorCodes code, PrepMessageKey messageKey, String detail) {
        return new PrepException(code, messageKey.getMessageKey(), detail);
    }

    // FIXME: convert all TeddyException into PrepException WITH the detail messages.
    static public PrepException fromTeddyException(TeddyException e) {
        if (e instanceof CannotCastFromException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_CAST_FROM);
        else if (e instanceof CannotCastToException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_CAST_TO);
        else if (e instanceof WrongMapKeyException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_MAP_KEY);
        else if (e instanceof ColumnNotFoundException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_COLUMN_NOT_FOUND, e.getMessage());
        else if (e instanceof ColumnTypeShouldBeDoubleOrLongException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_COLUMN_TYPE_SHOULD_BE_DOUBLE_OR_LONG);
        else if (e instanceof GroupByColumnNotFoundException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_GROUPBY_COLUMN_NOT_FOUND);
        else if (e instanceof IdxOnMapTypeShouldBeStringException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_IDX_ON_MAPTYPE_SHOULD_BE_STRING);
        else if (e instanceof IllegalAggregationFunctionExpression)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_AGGREGATION_FUNCTION_EXPRESSION);
        else if (e instanceof IllegalPatternTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_PATTERN_TYPE);
        else if (e instanceof InvalidAggregationValueExpressionTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_AGGREGATION_VALUE_EXPRESSION_TYPE);
        else if (e instanceof InvalidColumnExpressionTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_COLUMN_EXPRESSION_TYPE);
        else if (e instanceof InvalidFunctionArgsException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_ARGS);
        else if (e instanceof InvalidFunctionTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_TYPE);
        else if (e instanceof InvalidIndexTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVAILD_INDEX_TYPE);
        else if (e instanceof InvalidJsonException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_JSON);
        else if (e instanceof JdbcQueryFailedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_QUERY_FAILED);
        else if (e instanceof JdbcTypeNotSupportedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE);
        else if (e instanceof JoinTypeNotSupportedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_JOIN_TYPE_NOT_SUPPORTED);
        else if (e instanceof LeftPredicateNotFoundException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_LEFT_PREDICATE_NOT_FOUND);
        else if (e instanceof NeedBeforeOrAfterException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NEED_BEFORE_OR_AFTER);
        else if (e instanceof NoInputColumnDesignatedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_INPUT_COLUMN_DESIGNATED);
        else if (e instanceof NoLimitException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_LIMIT);
        else if (e instanceof NoRowException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_ROW);
        else if (e instanceof PredicateTypeMismatchException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PREDICATE_TYPE_MISMATCH);
        else if (e instanceof RightPredicateNotFoundException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_RIGHT_PREDICATE_NOT_FOUND);
        else if (e instanceof RuleNotSupportedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_RULE_NOT_SUPPORTED);
        else if (e instanceof TargetColumnNotFoundException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TARGET_COLUMN_NOT_FOUND);
        else if (e instanceof TooManyPivotedColumnsException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TOO_MANY_PIVOTED_COLUMNS);
        else if (e instanceof TypeDifferentException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_DIFFERENT_TYPE);
        else if (e instanceof TypeMismatchException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TYPE_MISMATCH);
        else if (e instanceof UnknownError)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNKOWN_ERROR);
        else if (e instanceof UnknownTypeException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_UNKNOWN_TYPE);
        else if (e instanceof UnsupportedAggregationFunctionExpressionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_UNSUPPORTED_AGGREGATION_FUNCTION);
        else if (e instanceof UnsupportedConstantType)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_UNSUPPORTED_CONSTANT_TYPE);
        else if (e instanceof WorksOnlyOnArrayException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY);
        else if (e instanceof WorksOnlyOnArrayOrMapException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY_OR_MAP);
        else if (e instanceof WorksOnlyOnStringException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_STRING);
        else if (e instanceof WorksOnlyOnNumericException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_NUMERIC);
        else if (e instanceof WrongAggregationFunctionExpressionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_AGGREGATION_FUNCTION_EXPRESSION);
        else if (e instanceof WrongArrayIndexException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_ARRAY_INDEX);
        else if (e instanceof WrongGroupEveryCountException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_GROUPEVERY_COUNT);
        else if (e instanceof WrongSubstringIndexParamException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_SUBSTRING_INDEX_PARAM);
        else if (e instanceof WrongTargetColumnExpressionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_TARGET_COLUMN_EXPRESSION);
        else if (e instanceof WrongTargetPositionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_TARGET_POSITION);
        else if (e instanceof  TimestampFormatMismatchException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TIMESTAMP_FORMAT_MISMATCH);
        else if (e instanceof  WorksOnlyOnTimestampException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_TIMESTAMP);
        else if (e instanceof  InvalidDeltaValueException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_DELTA_VALUE);
        else if (e instanceof  InvalidTimestampUnitException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_TIMESTAMP_UNIT);
        else if (e instanceof  InvalidTimezoneIDException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_TIMEZONE_ID);
        else if (e instanceof IllegalColumnNameExpressionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_COLUMN_NAME_EXPRESSION);
        else if (e instanceof IllegalColumnNameForHiveException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_COLUMN_NAME_FOR_HIVE);
        else if (e instanceof TransformTimeoutException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_TIMEOUT);
        else if (e instanceof TransformExecutionFailedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_FAILED);
        else if (e instanceof TransformExecutionInterrupteddException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_INTERRUPTED);
        else if (e instanceof NoAssignmentStatementIsAllowedException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_ASSIGNMENT_STATEMENT_IS_ALLOWED);
        else if (e instanceof WrongWindowFunctionExpressionException)
            return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_WINDOW_FUNCTION_EXPRESSION, e.getMessage());

        return create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNKOWN_ERROR);   // FIXME: unhandled teddy error exception을 만들어서 써야함.
    }

    private PrepException(ErrorCodes code, String message, String detail) {
        super(code, message);
        messageKey = message;
        messageDetail = detail;
    }
}
