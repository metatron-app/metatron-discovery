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

package app.metatron.discovery.domain.datasource.data.result;

import com.fasterxml.jackson.databind.JsonNode;

import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.engine.EngineQueryProperties;

/**
 * Created by kyungtaak on 2016. 10. 3..
 */
public class FileResultFormat extends SearchResultFormat {

  String targetDir;

  public FileResultFormat() {
  }

  public FileResultFormat(String targetDir) {
    this.targetDir = targetDir;
  }

  @Override
  public Object makeResult(JsonNode root) {
    if(checkFileResult(root)) {
      URI resultFileURI = getResultFileURI(root, targetDir);
      //TODO: Forward 타입에 따라 뭔가 조치를 취해야할지도..
      return resultFileURI.getPath();
    } else {

      if(StringUtils.isEmpty(targetDir)) {
        targetDir = EngineQueryProperties.getLocalResultDir();
      }

      //TODO: 임시파일명 생성을 통일할 유틸 만들것!
      File targetFile = new File(targetDir + File.separator + "MFD-" + UUID.randomUUID().toString());

      try {
        GlobalObjectMapper.getDefaultMapper().writeValue(targetFile, root);
      } catch (IOException e) {
        throw new QueryTimeExcetpion("Fail to write result to file : " + e.getMessage());
      }

      return targetFile.getAbsolutePath();
    }
  }

  public String getTargetDir() {
    return targetDir;
  }

  public void setTargetDir(String targetDir) {
    this.targetDir = targetDir;
  }
}
