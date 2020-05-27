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

package app.metatron.discovery.common.oauth;

import java.io.UnsupportedEncodingException;

import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.codec.Base64;

public class BasicTokenExtractor {

  private static String decodeToken(String value) throws UnsupportedEncodingException {

    if(StringUtils.isNotEmpty(value)) {
      if(value.toLowerCase().startsWith("Basic".toLowerCase())) {
        value = value.substring("Basic".length()).trim();
      }
      return new String(Base64.decode(value.getBytes("UTF-8")), "UTF-8");
    }

    return value;
  }

  public static String extractClientId(String value) throws UnsupportedEncodingException {
    String decodeToken = decodeToken(value);
    if(StringUtils.isNotEmpty(decodeToken) && decodeToken.indexOf(":") > -1){
      return decodeToken.split(":")[0];
    }
    return null;
  }

  public static String extractClientSecret(String value) throws UnsupportedEncodingException {
    String decodeToken = decodeToken(value);
    if(StringUtils.isNotEmpty(decodeToken) && decodeToken.indexOf(":") > -1){
      return decodeToken.split(":")[1];
    }
    return null;

  }
}
