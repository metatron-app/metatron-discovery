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
 * Default expression for where.
 */
public class NativeSqlExp implements NativeExp {
    private String sql;

    /**
     * Constructor with sql argument.
     *
     * @param sql the sql
     */
    public NativeSqlExp(String sql) {
        if (StringUtils.isBlank(sql))
            throw new IllegalStateException("sql is empty!");

        this.sql = sql;
    }

    @Override
    public String toSQL(String implementor) {
        return sql;
    }

}
