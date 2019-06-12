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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.UnknownTypeException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Date;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTime;

public enum ColumnType {
  STRING,
  LONG,
  DOUBLE,
  BOOLEAN,
  ARRAY,
  MAP,
  TIMESTAMP,
  UNKNOWN;

  public static ColumnType fromJdbcType(int type) {

    switch (type) {
      case Types.VARCHAR:
      case Types.CHAR:
      case Types.NCHAR:
      case Types.NVARCHAR:
      case Types.LONGNVARCHAR:
        return ColumnType.STRING;
      case Types.BOOLEAN:
        return ColumnType.BOOLEAN;
      case Types.NUMERIC:
      case Types.INTEGER:
      case Types.BIGINT:
        return ColumnType.LONG;
      case Types.FLOAT:
      case Types.DOUBLE:
      case Types.DECIMAL:
        return ColumnType.DOUBLE;
      case Types.ARRAY:
        return ColumnType.ARRAY;
      case Types.JAVA_OBJECT:
        return ColumnType.MAP;
      case Types.DATE:
      case Types.TIME:
      case Types.TIME_WITH_TIMEZONE:
      case Types.TIMESTAMP:
      case Types.TIMESTAMP_WITH_TIMEZONE:
        return ColumnType.TIMESTAMP;
      default:
        return ColumnType.STRING;
    }
  }

  public static Object fromJdbcObj(Object obj) {

    if (obj instanceof Integer) {
      return Long.valueOf(((Integer) obj).longValue());
    }
    else if (obj instanceof BigInteger) {
      return Long.valueOf(((BigInteger) obj).longValue());
    }
    else if (obj instanceof BigDecimal) {
      return Long.valueOf(((BigDecimal) obj).longValue());
    }
    else if (obj instanceof Float) {
      return Double.valueOf(((Float) obj).doubleValue());
    }
    else if (obj instanceof Timestamp) {
      return TeddyUtil.sqlTimestampToJodaDateTime((Timestamp) obj);
    }
    else if (obj instanceof Date) {
      long millis = ((Date) obj).getTime();
      return TeddyUtil.sqlTimestampToJodaDateTime(new Timestamp(millis));
    }

    return obj;
  }

  public static ColumnType fromClass(Object obj) throws UnknownTypeException {
    if (obj instanceof String) {
      return ColumnType.STRING;
    } else if (obj instanceof Long) {
      return ColumnType.LONG;
    } else if (obj instanceof Double) {
      return ColumnType.DOUBLE;
    } else if (obj instanceof Boolean) {
      return ColumnType.BOOLEAN;
    } else if (obj instanceof List) {
      return ColumnType.ARRAY;
    } else if (obj instanceof Map) {
      return ColumnType.MAP;
    } else if (obj instanceof DateTime) {
      return ColumnType.TIMESTAMP;
    } else {
      throw new UnknownTypeException("ColumnType.fromClass(): invalid object type: " + obj.toString());
    }
  }
}
