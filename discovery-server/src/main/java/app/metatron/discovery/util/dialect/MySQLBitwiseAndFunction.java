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

package app.metatron.discovery.util.dialect;

import org.hibernate.dialect.function.StandardSQLFunction;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.type.Type;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 4. 6..
 */
public class MySQLBitwiseAndFunction extends StandardSQLFunction {

  public MySQLBitwiseAndFunction(String name) {
    super(name);
  }

  public MySQLBitwiseAndFunction(String name, Type typeValue) {
    super(name, typeValue);
  }

  @Override
  public String render(Type firstArgumentType, List arguments, SessionFactoryImplementor sessionFactory) {
    if (arguments.size() != 2){
      throw new IllegalArgumentException("the function must be passed 2 arguments");
    }

    final StringBuilder buf = new StringBuilder();
    buf.append(arguments.get(0))
            .append(" & ")
            .append(arguments.get(1));

    return buf.toString();
  }

}
