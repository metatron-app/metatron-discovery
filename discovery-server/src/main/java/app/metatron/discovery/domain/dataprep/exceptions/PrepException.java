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

import static app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes.PREP_TEDDY_ERROR_CODE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_JDBC_CONNECTION_ERROR;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_CAST_FROM;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_CAST_TO;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_SERIALIZE_INTO_JSON;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_CANNOT_UNNEST_EMPTY_COLUMN;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_COLUMN_NOT_CONTINUOUS;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_COLUMN_NOT_FOUND;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_COLUMN_TYPE_SHOULD_BE_DOUBLE_OR_LONG;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_DIFFERENT_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_GROUPBY_COLUMN_NOT_FOUND;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_IDX_ON_MAPTYPE_SHOULD_BE_STRING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_AGGREGATION_FUNCTION_EXPRESSION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_COLUMN_NAME_FOR_HIVE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_PATTERN_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVAILD_INDEX_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVAILD_JOIN_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_AGGREGATION_VALUE_EXPRESSION_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_COLUMN_EXPRESSION_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_COLUMN_NAME_EXPRESSION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_DELTA_VALUE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_ARGS;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_JSON;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_TIMESTAMP_UNIT;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_INVALID_TIMEZONE_ID;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_JOIN_TYPE_NOT_SUPPORTED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_LEFT_PREDICATE_NOT_FOUND;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NEED_BEFORE_OR_AFTER;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_ASSIGNMENT_STATEMENT_IS_ALLOWED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_INPUT_COLUMN_DESIGNATED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_LIMIT;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_NO_ROW;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_PREDICATE_TYPE_MISMATCH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_QUERY_FAILED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_RIGHT_PREDICATE_NOT_FOUND;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_RULE_NOT_SUPPORTED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TARGET_COLUMN_NOT_FOUND;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TIMESTAMP_FORMAT_MISMATCH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TOO_MANY_PIVOTED_COLUMNS;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_FAILED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_INTERRUPTED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TRANSFORM_TIMEOUT;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_TYPE_MISMATCH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_UNKNOWN_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_UNSUPPORTED_AGGREGATION_FUNCTION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_UNSUPPORTED_CONSTANT_TYPE;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY_OR_MAP;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_NUMERIC;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_STRING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_TIMESTAMP;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_AGGREGATION_FUNCTION_EXPRESSION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_ARRAY_INDEX;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_GROUPEVERY_COUNT;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_MAP_KEY;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_SUBSTRING_INDEX_PARAM;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_TARGET_COLUMN_EXPRESSION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_TARGET_POSITION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_WRONG_WINDOW_FUNCTION_EXPRESSION;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_UNKOWN_ERROR;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotCastFromException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotCastToException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotUnnestEmptyColumnException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotContinuousException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnTypeShouldBeDoubleOrLongException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.GroupByColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IdxOnMapTypeShouldBeStringException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalAggregationFunctionExpression;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalPatternTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidAggregationValueExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidColumnExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidDeltaValueException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidFunctionArgsException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidFunctionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidIndexTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidJoinTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidTimestampUnitException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidTimezoneIDException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcQueryFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcTypeNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JoinTypeNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.LeftPredicateNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NeedBeforeOrAfterException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoAssignmentStatementIsAllowedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoInputColumnDesignatedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoLimitException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.NoRowException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.PredicateTypeMismatchException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.RightPredicateNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.RuleNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TargetColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TimestampFormatMismatchException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TooManyPivotedColumnsException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionInterrupteddException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformTimeoutException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TypeDifferentException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TypeMismatchException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnknownError;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnknownTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnsupportedAggregationFunctionExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnsupportedConstantType;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnArrayException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnArrayOrMapException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnNumericException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnStringException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WorksOnlyOnTimestampException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongAggregationFunctionExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongArrayIndexException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongGroupEveryCountException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongMapKeyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongSubstringIndexParamException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetColumnExpressionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongTargetPositionException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongWindowFunctionExpressionException;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Preparation Error")
public class PrepException extends MetatronException {

  public static String DEFAULT_GLOBAL_MESSAGE = "Preparation Error";

  // msg.dp.alert....
  String messageKey;

  // detail message
  String messageDetail;

  public String getMessageKey() {
    return messageKey;
  }

  public String getMessageDetail() {
    return messageDetail;
  }

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
    } else if (e instanceof TeddyException) {
      return PrepException.fromTeddyException((TeddyException) e);
    } else {
      if (e instanceof JdbcDataConnectionException) {
        return create(code, MSG_DP_ALERT_JDBC_CONNECTION_ERROR);
      } else {
        String detail = e.getMessage();
        if (detail == null) {
          detail = e.getClass().getName();
        }
        return create(code, MSG_DP_ALERT_UNKOWN_ERROR, detail);
      }
    }
  }

  static public PrepException create(ErrorCodes code, PrepMessageKey messageKey) {
    return new PrepException(code, messageKey.getMessageKey(), null);
  }

  static public PrepException create(ErrorCodes code, PrepMessageKey messageKey, String detail) {
    return new PrepException(code, messageKey.getMessageKey(), detail);
  }

  static private PrepException fromTeddy(TeddyException e, PrepMessageKey msgkey) {
    return new PrepException(PREP_TEDDY_ERROR_CODE, msgkey.getMessageKey(), e.getMessage());
  }

  static public PrepException fromTeddyException(TeddyException e) {
    if (e instanceof CannotCastFromException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_CANNOT_CAST_FROM);
    } else if (e instanceof CannotCastToException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_CANNOT_CAST_TO);
    } else if (e instanceof CannotSerializeIntoJsonException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_CANNOT_SERIALIZE_INTO_JSON);
    } else if (e instanceof CannotUnnestEmptyColumnException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_CANNOT_UNNEST_EMPTY_COLUMN);
    } else if (e instanceof ColumnNotContinuousException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_COLUMN_NOT_CONTINUOUS);
    } else if (e instanceof WrongMapKeyException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_MAP_KEY);
    } else if (e instanceof ColumnNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_COLUMN_NOT_FOUND);
    } else if (e instanceof ColumnTypeShouldBeDoubleOrLongException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_COLUMN_TYPE_SHOULD_BE_DOUBLE_OR_LONG);
    } else if (e instanceof GroupByColumnNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_GROUPBY_COLUMN_NOT_FOUND);
    } else if (e instanceof IdxOnMapTypeShouldBeStringException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_IDX_ON_MAPTYPE_SHOULD_BE_STRING);
    } else if (e instanceof IllegalAggregationFunctionExpression) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_ILLEGAL_AGGREGATION_FUNCTION_EXPRESSION);
    } else if (e instanceof IllegalPatternTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_ILLEGAL_PATTERN_TYPE);
    } else if (e instanceof InvalidAggregationValueExpressionTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_AGGREGATION_VALUE_EXPRESSION_TYPE);
    } else if (e instanceof InvalidColumnExpressionTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_COLUMN_EXPRESSION_TYPE);
    } else if (e instanceof InvalidFunctionArgsException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_ARGS);
    } else if (e instanceof InvalidFunctionTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_FUNCTION_TYPE);
    } else if (e instanceof InvalidIndexTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVAILD_INDEX_TYPE);
    } else if (e instanceof InvalidJoinTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVAILD_JOIN_TYPE);
    } else if (e instanceof InvalidJsonException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_JSON);
    } else if (e instanceof JdbcQueryFailedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_QUERY_FAILED);
    } else if (e instanceof JdbcTypeNotSupportedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE);
    } else if (e instanceof JoinTypeNotSupportedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_JOIN_TYPE_NOT_SUPPORTED);
    } else if (e instanceof LeftPredicateNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_LEFT_PREDICATE_NOT_FOUND);
    } else if (e instanceof NeedBeforeOrAfterException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NEED_BEFORE_OR_AFTER);
    } else if (e instanceof NoInputColumnDesignatedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NO_INPUT_COLUMN_DESIGNATED);
    } else if (e instanceof NoLimitException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NO_LIMIT);
    } else if (e instanceof NoRowException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NO_ROW);
    } else if (e instanceof PredicateTypeMismatchException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_PREDICATE_TYPE_MISMATCH);
    } else if (e instanceof RightPredicateNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_RIGHT_PREDICATE_NOT_FOUND);
    } else if (e instanceof RuleNotSupportedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_RULE_NOT_SUPPORTED);
    } else if (e instanceof CannotSerializeIntoJsonException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TARGET_COLUMN_NOT_FOUND);
    } else if (e instanceof TargetColumnNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TARGET_COLUMN_NOT_FOUND);
    } else if (e instanceof TargetColumnNotFoundException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TARGET_COLUMN_NOT_FOUND);
    } else if (e instanceof TooManyPivotedColumnsException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TOO_MANY_PIVOTED_COLUMNS);
    } else if (e instanceof TypeDifferentException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_DIFFERENT_TYPE);
    } else if (e instanceof TypeMismatchException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TYPE_MISMATCH);
    } else if (e instanceof UnknownError) {
      return fromTeddy(e, MSG_DP_ALERT_UNKOWN_ERROR);
    } else if (e instanceof UnknownTypeException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_UNKNOWN_TYPE);
    } else if (e instanceof UnsupportedAggregationFunctionExpressionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_UNSUPPORTED_AGGREGATION_FUNCTION);
    } else if (e instanceof UnsupportedConstantType) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_UNSUPPORTED_CONSTANT_TYPE);
    } else if (e instanceof WorksOnlyOnArrayException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY);
    } else if (e instanceof WorksOnlyOnArrayOrMapException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_ARRAY_OR_MAP);
    } else if (e instanceof WorksOnlyOnStringException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_STRING);
    } else if (e instanceof WorksOnlyOnNumericException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_NUMERIC);
    } else if (e instanceof WrongAggregationFunctionExpressionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_AGGREGATION_FUNCTION_EXPRESSION);
    } else if (e instanceof WrongArrayIndexException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_ARRAY_INDEX);
    } else if (e instanceof WrongGroupEveryCountException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_GROUPEVERY_COUNT);
    } else if (e instanceof WrongSubstringIndexParamException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_SUBSTRING_INDEX_PARAM);
    } else if (e instanceof WrongTargetColumnExpressionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_TARGET_COLUMN_EXPRESSION);
    } else if (e instanceof WrongTargetPositionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_TARGET_POSITION);
    } else if (e instanceof TimestampFormatMismatchException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TIMESTAMP_FORMAT_MISMATCH);
    } else if (e instanceof WorksOnlyOnTimestampException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WORKS_ONLY_ON_TIMESTAMP);
    } else if (e instanceof InvalidDeltaValueException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_DELTA_VALUE);
    } else if (e instanceof InvalidTimestampUnitException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_TIMESTAMP_UNIT);
    } else if (e instanceof InvalidTimezoneIDException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_TIMEZONE_ID);
    } else if (e instanceof IllegalColumnNameExpressionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_INVALID_COLUMN_NAME_EXPRESSION);
    } else if (e instanceof IllegalColumnNameForHiveException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_ILLEGAL_COLUMN_NAME_FOR_HIVE);
    } else if (e instanceof TransformTimeoutException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TRANSFORM_TIMEOUT);
    } else if (e instanceof TransformExecutionFailedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_FAILED);
    } else if (e instanceof TransformExecutionInterrupteddException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_TRANSFORM_EXECUTION_INTERRUPTED);
    } else if (e instanceof NoAssignmentStatementIsAllowedException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_NO_ASSIGNMENT_STATEMENT_IS_ALLOWED);
    } else if (e instanceof WrongWindowFunctionExpressionException) {
      return fromTeddy(e, MSG_DP_ALERT_TEDDY_WRONG_WINDOW_FUNCTION_EXPRESSION);
    }

    return create(PREP_TEDDY_ERROR_CODE, MSG_DP_ALERT_UNKOWN_ERROR);  // Should not reach here.
  }

  private PrepException(ErrorCodes code, String message, String detail) {
    super(code, message);
    messageKey = message;
    messageDetail = detail;
  }
}
