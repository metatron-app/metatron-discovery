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

package app.metatron.discovery.domain.admin;

import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import com.google.common.collect.Maps;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.CommonProperties;
import app.metatron.discovery.common.exception.MetatronException;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/common")
public class CommonController {
  private static Logger LOGGER = LoggerFactory.getLogger(CommonController.class);

  @Autowired
  CommonProperties commonProperties;

  public CommonController() {
  }

  /**
   *
   * @param response
   * @throws IOException
   */
  @RequestMapping(path ="/manual/download", method = RequestMethod.GET, produces = { "application/pdf" })
  public void downloadDataFromWidget(@RequestParam(value = "lang", required = false, defaultValue = "en") String lang,
                                     HttpServletResponse response) throws IOException {

    URI manualLink = commonProperties.getLinkByLang(lang)
                                .orElseThrow(() -> new MetatronException("Manual Link not found."));

    String scheme = manualLink.getScheme();

    switch (scheme) {
      case "file":
        downloadFile(manualLink.getPath(), response);
        break;
      case "http":
      case "https":
      default:
        throw new MetatronException("Invalid manual link : " + manualLink);
    }
  }

  private void downloadFile(String path, HttpServletResponse response) throws IOException {

    File downloadFile = new File(path);

    if(!downloadFile.exists()) {
      throw new MetatronException("Invalid manual link : " + downloadFile.getAbsolutePath());
    }

    response.setContentType("application/pdf");
    response.setHeader("Content-Disposition", String.format("inline; filename=\"%s\"", downloadFile.getName()));

    response.setContentLength((int)downloadFile.length());

    InputStream inputStream = new BufferedInputStream(new FileInputStream(downloadFile));

    FileCopyUtils.copy(inputStream, response.getOutputStream());
  }

  /**
   * 파일 업로드
   */
  @PostMapping("/file")
  public Map<String, Object> uploadTempFile(@RequestParam("file") MultipartFile file) {
    // 파일명 가져오기
    String fileName = file.getOriginalFilename();

    // 파일명을 통해 확장자 정보 얻기
    String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();

    // Upload 파일 처리
    String tempFileName = "TEMP_FILE_" + UUID.randomUUID().toString() + "." + extensionType;
    String tempFilePath = System.getProperty("java.io.tmpdir") + File.separator + tempFileName;

    Map<String, Object> responseMap = Maps.newHashMap();
    responseMap.put("filekey", tempFileName);
    responseMap.put("filePath", tempFilePath);

    try {
      File tempFile = new File(tempFilePath);
      file.transferTo(tempFile);
    } catch (IOException e) {
      LOGGER.error("Failed to upload file : {}", e.getMessage());
      throw new DataSourceIngestionException("Fail to upload file.", e.getCause());
    }

    return responseMap;
  }

}
