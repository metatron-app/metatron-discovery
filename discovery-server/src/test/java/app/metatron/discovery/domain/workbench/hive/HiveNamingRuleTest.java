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
package app.metatron.discovery.domain.workbench.hive;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class HiveNamingRuleTest {

  @Test
  public void replaceNotAllowedCharacters() {
    // given
    String str = "private_test.user";

    // when
    String actual = HiveNamingRule.replaceNotAllowedCharacters(str);


    // then
    assertThat(actual).isEqualTo("private_test_user");
  }

  @Test
  public void replaceNotAllowedCharacters_when() {
    // given
    String str = "private_testuser";

    // when
    String actual = HiveNamingRule.replaceNotAllowedCharacters(str);


    // then
    assertThat(actual).isEqualTo("private_testuser");
  }
}