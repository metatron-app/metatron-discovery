/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http" ://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.dataconnection.query.expression;

import org.apache.commons.lang3.StringUtils;

/**
 * Expression Current Datetime native SQL.
 */
public class NativeDateFormatExp implements NativeExp {

  public final static String COMMON_DEFAULT_DATEFORMAT = "yyyy-MM-dd HH:mm:ss";

  /**
   * Column name.
   */
  private String columnName;


  /**
   * DateFormat
   */
  private String dateFormat;

  /**
   * Construcotr.
   *
   * @param columnName Column name
   */
  public NativeDateFormatExp(String columnName, String dateFormat) {
    if (StringUtils.isBlank(columnName))
      throw new IllegalStateException("ColumnName is null!");

    this.columnName = columnName;
    this.dateFormat = dateFormat;
  }

  @Override
  public String toSQL(String implementor) {
    if(StringUtils.isEmpty(this.dateFormat)){
      this.dateFormat = getDefaultDateFormat(implementor);
    }

    String quotedColumnName = NativeProjection.getQuotedColumnName(implementor, columnName);
    switch(implementor){
      case "MYSQL" : case "HIVE" :
        return "DATE_FORMAT(" + quotedColumnName + ",'" + this.dateFormat + "') AS " + columnName;
      case "ORACLE" : case "TIBERO" : case "MSSQL" : case "POSTGRESQL" :
        return "TO_CHAR(" + quotedColumnName + ", '" + this.dateFormat + "') AS " + columnName;
      case "PRESTO" :
        return "format_datetime(" + quotedColumnName + ",'" + this.dateFormat + "') AS " + columnName;
      default :
        return quotedColumnName;

    }
  }
  
  public String getDefaultDateFormat(String implementor){
    switch(implementor){
      case "MYSQL" :
        return "%Y-%m-%d %T";
      case "ORACLE" : case "TIBERO" : case "MSSQL" : case "POSTGRESQL" :
        return "YYYY-MM-DD HH24:MI:SS";
      case "HIVE" : case "PRESTO" :
        return COMMON_DEFAULT_DATEFORMAT;
      default :
        return COMMON_DEFAULT_DATEFORMAT;
    }
  }
}
