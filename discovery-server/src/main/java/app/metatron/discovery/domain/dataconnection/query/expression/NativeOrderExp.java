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

import com.google.common.base.Preconditions;

import org.apache.commons.lang3.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Native ORDER BY expression.
 */
public class NativeOrderExp implements NativeExp {
    private Map<String, OrderType> orders;

    public enum OrderType {

        /**
         * The ASC sorting with default db nulls last/first behaviour.
         */
        ASC("ASC"),
        /*
         * The ASC sorting with nulls first.
         */
        ASC_NULLS_FIRST("ASC NULLS FIRST"),
        /**
         * The ASC sorting with nulls last.
         */
        ASC_NULLS_LAST("ASC NULLS LAST"),
        /**
         * The DESC sorting with default db null last/first behaviour.
         */
        DESC("DESC"),
        /**
         * The DESC sorting with nulls first.
         */
        DESC_NULLS_FIRST("DESC NULLS FIRST"),
        /**
         * The DESC sorting with nulls last.
         */
        DESC_NULLS_LAST("DESC NULLS LAST");

        /**
         * The type.
         */
        private String type;

        /**
         * Instantiates a new order type.
         *
         * @param type the type
         */
        OrderType(String type) {
            this.type = type;
        }

        /**
         * Gets the type.
         *
         * @return the type
         */
        public String getType() {
            return type;
        }
    }

    public NativeOrderExp() {
        orders = new LinkedHashMap<>();
    }

    /**
     * Adds the.
     *
     * @param columnName the column name
     * @param orderType  the order type
     * @return the native order exp
     */
    public NativeOrderExp add(String columnName, OrderType orderType) {
        if (StringUtils.isBlank(columnName)) {
            throw new IllegalStateException("columnName is null!");
        }
        if (orderType == null) {
            throw new IllegalStateException("orderType is null!");
        }

        orders.put(columnName, orderType);
        return this;
    }

    /**
     * Copy orders from different native expression.
     *
     * @param otherNativeExp different native order expression
     * @return current native order expression with added expressions with different one provied as parameter
     */
    public NativeOrderExp add(NativeOrderExp otherNativeExp) {
        Preconditions.checkNotNull(otherNativeExp);
        for (Entry<String, OrderType> otherEntry : otherNativeExp.orders.entrySet()) {
            this.add(otherEntry.getKey(), otherEntry.getValue());
        }
        return this;
    }

    /**
     * To sql.
     *
     * @return the string
     */
    public String toSQL(String implementor) {
        StringBuilder order = new StringBuilder();
        if (orders.size() > 0) {
            for (Entry<String, OrderType> entry : orders.entrySet()) {
                if (order.length() > 0) {
                    order.append(", ")
                            .append(NativeProjection.getQuotedColumnName(implementor, entry.getKey())).append(" ")
                            .append(entry.getValue().getType());
                } else {
                    order.append(NativeProjection.getQuotedColumnName(implementor, entry.getKey())).append(" ")
                            .append(entry.getValue().getType());
                }
            }
        }

        if (order.length() > 0) {
            return "ORDER BY " + order.toString();
        } else {
            return "";
        }
    }
}
