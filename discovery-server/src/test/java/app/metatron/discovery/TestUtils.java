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

package app.metatron.discovery;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;

import java.util.Map;

/**
 * Created by kyungtaak on 2017. 7. 18..
 */
public class TestUtils {

  public static Map<String, Object> makeMap(Object... e) {
    Map<String, Object> objectMap = Maps.newHashMap();

    if(e.length < 1 || e.length % 2 != 0) {
      return objectMap;
    }

    for(int i = 0; i<e.length; i=i+2) {
      objectMap.put((String) e[i], e[i + 1]);
    }

    return objectMap;
  }

  public static void printTestTitle(String title) {
    int defaultColumnSize = 100;

    int lenth = title == null ? 0 : title.getBytes().length;
    boolean padding = false;
    if(lenth < defaultColumnSize) {
      padding = true;
      lenth = defaultColumnSize;
    }

    System.out.println(StringUtils.rightPad("", lenth + 4, "*"));
    System.out.println(title);
    System.out.println(StringUtils.rightPad("", lenth + 4, "*"));
  }
}
