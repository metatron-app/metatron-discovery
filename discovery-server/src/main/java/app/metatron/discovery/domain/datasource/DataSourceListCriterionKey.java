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

package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.common.criteria.ListCriterionKey;

/**
 *
 */
public enum DataSourceListCriterionKey implements ListCriterionKey {
  STATUS("STATUS"),
  PUBLISH("PUBLISH"),
  CREATOR("CREATOR"),
  DATETIME("DATETIME"),
  CONNECTION_TYPE("CONNECTION_TYPE"),
  DATASOURCE_TYPE("DATASOURCE_TYPE"),
  SOURCE_TYPE("SOURCE_TYPE"),
  MORE("MORE"),
  CONTAINS_TEXT("CONTAINS_TEXT"),
  CREATED_TIME("CREATE_TIME"),
  MODIFIED_TIME("MODIFIED_TIME");

  String criterionKey;
  DataSourceListCriterionKey(String s){
    criterionKey = s;
  }

  public DataSourceListCriterionKey getCriterionKey(){
    return DataSourceListCriterionKey.valueOf(criterionKey);
  }
}
