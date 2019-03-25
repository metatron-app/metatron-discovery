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
 * Expression between native SQL.
 */
public class NativeBetweenExp implements NativeExp {

    /**
     * Column name.
     */
    private String columnName;

    /**
     * Lower value.
     */
    private Object lowValue;

    /**
     * Higer value.
     */
    private Object highValue;

    /**
     * Construcotr.
     *
     * @param columnName Column name
     * @param lowValue   lower value
     * @param highValue  higer value
     */
    public NativeBetweenExp(String columnName, Object lowValue, Object highValue) {
        if (StringUtils.isBlank(columnName))
            throw new IllegalStateException("ColumnName is null!");
        if (lowValue == null)
            throw new IllegalStateException("LowValue is null!");
        if (highValue == null)
            throw new IllegalStateException("HidhValue is null!");

        this.columnName = columnName;
        this.lowValue = lowValue;
        this.highValue = highValue;
    }

    @Override
    public String toSQL(String implementor) {
        if(lowValue instanceof Number){
            return NativeProjection.getQuotedColumnName(implementor, columnName) + " BETWEEN " + lowValue + " AND " + highValue;
        } else {
            return NativeProjection.getQuotedColumnName(implementor, columnName) + " BETWEEN '" + lowValue + "' AND '" + highValue + "'";
        }
    }


}
