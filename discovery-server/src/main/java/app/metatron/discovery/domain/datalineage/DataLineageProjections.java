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

package app.metatron.discovery.domain.datalineage;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
public class DataLineageProjections extends BaseProjections{

  @Projection(name = "default", types = { DataLineage.class })
  public interface DefaultProjection {

    String getId();

    String getSourceDataBaseName();

    String getSourceTableName();

    String getSourceFieldName();

    String getSourceFieldType();

    String getSourceFieldComment();

    String getTargetDataBaseName();

    String getTargetTableName();

    String getTargetFieldName();

    String getTargetFieldType();

    String getTargetFieldComment();

    String getTargetTableType();

    boolean getTargetTableTemporary();

    DateTime getTimestamp();

    String getCluster(); //Server 종류로 Hive 의 설정 파일 정보에서 가져오게 해야할 것 같음

    String getCurrentDatabase();

    boolean getPredicate();

    String getPredicateStr();

    boolean getPruning();

    String getSqlQuery();

    String getSqlType();

    String getOwner();

    String getWorkflowFileName();

    String getQueryId();

    String getJobId();

    String getUserIpAddress();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(name = "tableList", types = { DataLineage.class })
  public interface TableListProjection {

    String getId();

    String getSourceDataBaseName();

    String getSourceTableName();

    String getSourceFieldName();

    String getTargetDataBaseName();

    String getTargetTableName();

    String getTargetFieldName();

    String getTargetTableType();

    boolean getTargetTableTemporary();

    DateTime getTimestamp();

    String getCluster(); //Server 종류로 Hive 의 설정 파일 정보에서 가져오게 해야할 것 같음

    String getCurrentDatabase();

    String getSqlType();

  }

  @Projection(name = "sqlList", types = { DataLineage.class })
  public interface SQLListProjection {

    String getId();

    String getSourceDataBaseName();

    String getSourceTableName();

    String getSourceFieldName();

    String getTargetDataBaseName();

    String getTargetTableName();

    String getTargetFieldName();

    DateTime getTimestamp();

    String getCluster(); //Server 종류로 Hive 의 설정 파일 정보에서 가져오게 해야할 것 같음

    String getCurrentDatabase();

    boolean getPredicate();

    String getPredicateStr();

    boolean getPruning();

    String getSqlQuery();

    String getSqlType();

  }

}
