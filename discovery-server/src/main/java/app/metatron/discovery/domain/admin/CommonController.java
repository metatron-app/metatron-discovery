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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.CommonProperties;
import app.metatron.discovery.common.exception.MetatronException;

@RestController
@RequestMapping("/api/common")
public class CommonController {

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
}
