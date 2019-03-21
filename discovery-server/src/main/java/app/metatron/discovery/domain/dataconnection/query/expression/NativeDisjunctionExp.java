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

import java.util.ArrayList;
import java.util.List;

/**
 * Native OR expression.
 */
public class NativeDisjunctionExp implements NativeJunctionExp {
    private List<NativeExp> exps;

    public NativeDisjunctionExp() {
        this.exps = new ArrayList<>();
    }

    public NativeDisjunctionExp(List<NativeExp> exps) {
        super();
        if (exps != null)
            this.exps = exps;
    }

    /**
     * Add sql expression.
     *
     * @param exp the exp
     * @return the native junction exp
     */
    @Override
    public NativeJunctionExp add(NativeExp exp) {
        if (exp == null)
            throw new IllegalStateException("exp is null!");

        exps.add(exp);
        return this;
    }

    /**
     * Add sql expressions.
     *
     * @param exps the exps
     * @return the native junction exp
     */
    @Override
    public NativeJunctionExp add(List<NativeExp> exps) {
        if (exps == null)
            throw new IllegalStateException("exp is null!");

        this.exps.addAll(exps);
        return null;
    }

    /**
     * Return sql query
     *
     * @return the string
     */
    @Override
    public String toSQL(String implementor) {
        if (exps.isEmpty()) return "";

        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("(");
        final String SPACE = " ";
        boolean first = true;
        for (NativeExp exp : exps) {
            if (first) {
                sqlBuilder.append(exp.toSQL(implementor));
                first = false;
            } else {
                sqlBuilder.append(SPACE).append("OR").append(SPACE)
                        .append(exp.toSQL(implementor));
            }
        }
        sqlBuilder.append(")");
        return sqlBuilder.toString();
    }

}
