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

package app.metatron.discovery.prep.parser.preparation.rule;

import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

public class RuleBuilder {

  public static Map<String, Supplier<Rule>> ruleNameMapper = new HashMap<>();

  static {
    ruleNameMapper.put("drop", () -> new Drop());
    ruleNameMapper.put("header", () -> new Header());
    ruleNameMapper.put("settype", () -> new SetType());
    ruleNameMapper.put("rename", () -> new Rename());
    ruleNameMapper.put("keep", () -> new Keep());
    ruleNameMapper.put("set", () -> new Set());
    ruleNameMapper.put("derive", () -> new Derive());
    ruleNameMapper.put("replace", () -> new Replace());
    ruleNameMapper.put("countpattern", () -> new CountPattern());
    ruleNameMapper.put("split", () -> new Split());
    ruleNameMapper.put("delete", () -> new Delete());
    ruleNameMapper.put("pivot", () -> new Pivot());
    ruleNameMapper.put("unpivot", () -> new Unpivot());
    ruleNameMapper.put("extract", () -> new Extract());
    ruleNameMapper.put("flatten", () -> new Flatten());
    ruleNameMapper.put("merge", () -> new Merge());
    ruleNameMapper.put("nest", () -> new Nest());
    ruleNameMapper.put("unnest", () -> new Unnest());
    ruleNameMapper.put("join", () -> new Join());
    ruleNameMapper.put("aggregate", () -> new Aggregate());
    ruleNameMapper.put("splitrows", () -> new SplitRows());
    ruleNameMapper.put("move", () -> new Move());
    ruleNameMapper.put("sort", () -> new Sort());
    ruleNameMapper.put("union", () -> new Union());
    ruleNameMapper.put("window", () -> new Window());
    ruleNameMapper.put("setformat", () -> new SetFormat());
  }

  String ruleName;

  List<Arguments> arguments;

  public RuleBuilder(String ruleName, List<Arguments> arguments) {
    this.ruleName = ruleName;
    this.arguments = arguments;
  }

  public Rule setArgs(Rule rule) {

    this.arguments.forEach(arguments -> {

      try {
        BeanUtils.setProperty(rule, arguments.getName(), arguments.getValue());
      } catch (IllegalAccessException | InvocationTargetException e) {
        new RuntimeException("error!" + e.getMessage());
      }
    });

    return rule;
  }

  private Rule getRule() {

    if (ruleNameMapper.containsKey(ruleName.toLowerCase())) {
      return ruleNameMapper.get(ruleName.toLowerCase()).get();
    } else {
      throw new RuntimeException("Not supported rule name ( " + ruleName + " ).");
    }
  }

  public Rule build() {

    Rule rule = getRule();

    return setArgs(rule);
  }
}
