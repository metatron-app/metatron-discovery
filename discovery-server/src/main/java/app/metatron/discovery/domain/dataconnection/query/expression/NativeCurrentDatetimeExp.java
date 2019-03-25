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

package app.metatron.discovery.domain.dataconnection.query.expression;

import org.apache.commons.lang3.StringUtils;

/**
 * Expression Current Datetime native SQL.
 */
public class NativeCurrentDatetimeExp implements NativeExp {

    /**
     * Column name.
     */
    private String columnName;

    /**
     * Construcotr.
     *
     * @param columnName Column name
     */
    public NativeCurrentDatetimeExp(String columnName) {
        if (StringUtils.isBlank(columnName))
            throw new IllegalStateException("ColumnName is null!");

        this.columnName = columnName;
    }

    @Override
    public String toSQL(String implementor) {
        switch(implementor){
            case "MYSQL" :
                return "DATE_FORMAT(NOW(),'%Y-%m-%d %T') AS " + columnName;
            case "ORACLE" : case "TIBERO":
                return "TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') AS " + columnName;
            case "HIVE":
                return "DATE_FORMAT(current_timestamp,'yyyy-MM-dd HH:mm:ss') AS " + columnName;
            case "MSSQL":
                return "TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS') AS " + columnName;
            case "PRESTO":
                return "format_datetime(current_timestamp,'yyyy-MM-dd HH:mm:ss') AS " + columnName;
            case "POSTGRESQL":
                return "TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS') AS " + columnName;
            default:
                return columnName;

        }
    }


}
