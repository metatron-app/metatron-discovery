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

package app.metatron.discovery.domain.mdm;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Transactional(readOnly = true)
public class CodeTableService {

  @Autowired
  CodeTableRepository codeTableRepository;

  /**
   * 코드 테이블내 CodeValuePair 값을 Map 으로 전환합니다.
   *
   * @param codeTableId
   * @return
   */
  public Optional<Map<String, String>> getCodeValuePair(String codeTableId) {

    CodeTable codeTable = codeTableRepository.findByIdWithValuePair(codeTableId);
    if(codeTable == null) {
      return Optional.empty();
    }

    List<CodeValuePair> codeValuePairs = codeTable.getCodes();
    if(CollectionUtils.isEmpty(codeValuePairs)) {
      return Optional.empty();
    }

    Map<String, String> pair = codeValuePairs.stream()
                  .collect(Collectors.toMap(CodeValuePair::getCode, CodeValuePair::getValue));

    return Optional.of(pair);
  }
}
