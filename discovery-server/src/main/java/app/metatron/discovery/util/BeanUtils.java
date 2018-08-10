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

import org.apache.commons.beanutils.PropertyUtils;

public class BeanUtils {

  public static void copyPropertiesNullAware(Object dest, Object source)  {

    try{
      PropertyUtils.describe(source).entrySet().stream()
              .filter(element -> element.getValue() != null)
              .filter(element -> ! element.getKey().equals("class"))
              .forEach(element -> {
                try {
                  PropertyUtils.setProperty(dest, element.getKey(), element.getValue());
                } catch (Exception e) {
                  // Error setting property ...;
                }
              });
    } catch (Exception e){
      e.printStackTrace();
    }
  }
}
