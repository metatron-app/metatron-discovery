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

package app.metatron.discovery.util;

import org.apache.http.entity.ContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

/**
 * Created by james on 2017. 8. 1..
 */
public class HttpUtils {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpUtils.class);

    public static void downloadCSVFile(HttpServletResponse response, String fileName, String filePath, ContentType contentType)
            throws IOException{
        downloadCSVFile(response, fileName, filePath, contentType.toString());
    }

    public static void downloadCSVFile(HttpServletResponse response, String fileName, String filePath, String contentType)
            throws IOException{
        BufferedOutputStream outStream = new BufferedOutputStream(response.getOutputStream());

        outStream.write(0xEF);
        outStream.write(0xBB);
        outStream.write(0xBF);

        File file = new File(filePath);

        //캐릭터 인코딩 3바이트 추가
        long length = file.length() + 3;
        if (length <= Integer.MAX_VALUE) {
            response.setContentLength((int)length);
        } else {
            response.addHeader("Content-Length", Long.toString(length));
        }

        response.setContentType(contentType);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
        BufferedInputStream inStream = new BufferedInputStream(new FileInputStream(file));

        byte[] buffer = new byte[1024];
        int bytesRead = 0;
        while ((bytesRead = inStream.read(buffer)) != -1) {
            outStream.write(buffer, 0, bytesRead);
        }
        outStream.flush();
        inStream.close();
    }

}
