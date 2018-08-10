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

package app.metatron.discovery.domain.dataprep.teddy.exceptions;
import app.metatron.discovery.prep.parser.exceptions.*;

public class TeddyException extends Exception {
  public TeddyException(String message) {
    super(message);
  }

  public static TeddyException fromRuleException(RuleException re) {
    if(re instanceof FunctionColumnNotFoundException) {
      return new ColumnNotFoundException(re.getMessage());
    } else if(re instanceof FunctionWorksOnlyOnStringException) {
      return new WorksOnlyOnStringException(re.getMessage());
    } else if(re instanceof FunctionWorksOnlyOnNumericException) {
      return new WorksOnlyOnNumericException(re.getMessage());
    } else if(re instanceof FunctionInvalidIndexNumberException) {
      return new InvalidFunctionArgsException(re.getMessage());
    } else if(re instanceof FunctionUndefinedException) {
      return new UnknownError(re.getMessage());
    } else if(re instanceof FunctionTimestampFormatMismatchedException) {
      return new TimestampFormatMismatchException(re.getMessage());
    } else if(re instanceof FunctionWorksOnlyOnTimestampException) {
      return new WorksOnlyOnTimestampException(re.getMessage());
    } else if(re instanceof FunctionInvalidDeltaValueException) {
      return new InvalidDeltaValueException(re.getMessage());
    } else if(re instanceof FunctionInvalidTimestampUnitException) {
      return new InvalidTimestampUnitException(re.getMessage());
    } else if(re instanceof FunctionInvalidTimezonIDException) {
      return new InvalidTimezoneIDException(re.getMessage());
    } else if(re instanceof FunctionInvalidFunctionNameException) {
      return new InvalidFunctionTypeException(re.getMessage());
    }

    return new UnknownError(re.getMessage());
  }
}
