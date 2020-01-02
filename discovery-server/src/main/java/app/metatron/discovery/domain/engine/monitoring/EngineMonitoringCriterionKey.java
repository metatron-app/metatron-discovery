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

package app.metatron.discovery.domain.engine.monitoring;

import app.metatron.discovery.common.criteria.ListCriterionKey;

/**
 *
 */
public enum EngineMonitoringCriterionKey implements ListCriterionKey {
  TASK_STATUS("STATUS"),
  DURATION("DURATION"),
  TYPE("TYPE"),
  CREATED_TIME("CREATE_TIME"),
  CAPACITY("CAPACITY"),
  VERSION("VERSION"),
  COMPLETED_TIME("COMPLETED_TIME"),
  SERVICE("SERVICE"),
  RESULT("RESULT"),
  HOST("HOST"),
  STARTED_TIME("STARTED_TIME"),
  AVAILABILITY("AVAILABILITY");

  String criterionKey;
  EngineMonitoringCriterionKey(String s){
    criterionKey = s;
  }

  public EngineMonitoringCriterionKey getCriterionKey(){
    return EngineMonitoringCriterionKey.valueOf(criterionKey);
  }
}
