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

import java.beans.PropertyEditorSupport;

/**
 *
 */
public class CaseInsensitiveConverter <T extends Enum<T>> extends PropertyEditorSupport {

  private final Class<T> typeParameterClass;

  public CaseInsensitiveConverter(Class<T> typeParameterClass) {
    super();
    this.typeParameterClass = typeParameterClass;
  }

  @Override
  public void setAsText(final String text) throws IllegalArgumentException {
    String upper = text.toUpperCase();
    T value = T.valueOf(typeParameterClass, upper);
    setValue(value);
  }
}