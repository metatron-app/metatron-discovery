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

package app.metatron.discovery.prep.parser.preparation;

import app.metatron.discovery.prep.parser.preparation.spec.SuggestToken;

import java.util.List;

public interface PrepParser {
        List<SuggestToken> suggest(String ruleString);
        List<String> suggest_conditional_expression(String ruleString);
        List<SuggestToken> suggest_all_rules(String ruleString);
        List<SuggestToken> suggest_aggr_rules(String ruleString);
        List<SuggestToken> suggest_window_rules(String ruleString);
}

