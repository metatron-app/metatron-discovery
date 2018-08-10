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

package app.metatron.discovery.common.bridge;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexableField;
import org.hibernate.search.bridge.LuceneOptions;
import org.hibernate.search.bridge.TwoWayFieldBridge;

import static app.metatron.discovery.domain.user.role.Role.PREDEFINED_GROUP_ADMIN;
import static app.metatron.discovery.domain.user.role.Role.PREDEFINED_GROUP_SUPER;
import static app.metatron.discovery.domain.user.role.Role.PREDEFINED_GROUP_USER;

/**
 * Created by kyungtaak on 2017. 2. 13..
 */
public class PredefinedRoleBridge implements TwoWayFieldBridge {

  @Override
  public Object get(String name, Document document) {
    IndexableField field = document.getField(name);
    return field.stringValue();
  }

  @Override
  public String objectToString(Object object) {
    return object.toString();
  }

  @Override
  public void set(String name, Object value, Document document, LuceneOptions luceneOptions) {

    String indexValue;
    if(name.endsWith("name.predefined")) {
      if (PREDEFINED_GROUP_ADMIN.equals(value)) {
        indexValue = "!0001";
      } else if (PREDEFINED_GROUP_SUPER.equals(value)) {
        indexValue = "!0002";
      } else if (PREDEFINED_GROUP_USER.equals(value)) {
        indexValue = "!0003";
      } else {
        indexValue = "!0004";
      }
    } else {
      indexValue = String.valueOf(value);
    }

    luceneOptions.addFieldToDocument(name, indexValue, document);

  }
}
