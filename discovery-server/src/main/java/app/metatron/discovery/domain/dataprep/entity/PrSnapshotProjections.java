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

package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.user.UserProfile;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

public class PrSnapshotProjections {

  @Projection(name = "default", types = {PrSnapshot.class})
  public interface DefaultProjection {

    String getSsId();

    String getSsName();

    PrSnapshot.SS_TYPE getSsType();

    PrSnapshot.ENGINE getEngine();

    PrSnapshot.STATUS getStatus();

    PrSnapshot.APPEND_MODE getAppendMode();

    DateTime getLaunchTime();

    DateTime getFinishTime();

    String getLineageInfo();

    Long getTotalLines();

    Long getMismatchedLines();

    Long getMissingLines();

    Long getTotalBytes();

    Long getRuleCntTotal();

    Long getRuleCntDone();

    String getServerLog();

    String getCustom();

    String getStoredUri();

    String getDcId();

    String getOrigDsDcId();

    String getOrigDsDcImplementor();

    String getOrigDsDcName();

    String getOrigDsDcDesc();

    DataConnection.SourceType getOrigDsDcType();

    String getOrigDsDcHostname();

    Integer getOrigDsDcPort();

    String getOrigDsDcUsername();

    String getOrigDsDcUrl();

    String getOrigDsDbName();

    String getOrigDsTblName();

    String getOrigDsQueryStmt();

    String getOrigDsCreatedBy();

    DateTime getOrigDsCreatedTime();

    String getOrigDsModifiedBy();

    DateTime getOrigDsModifiedTime();

    String getDcImplementor();

    String getDcName();

    String getDcDesc();

    DataConnection.SourceType getDcType();

    String getDcHostname();

    String getDcUsername();

    String getDcPassword();

    String getDcUrl();

    String getDbName();

    String getTblName();

    PrSnapshot.HIVE_FILE_FORMAT getHiveFileFormat();

    PrSnapshot.HIVE_FILE_COMPRESSION getHiveFileCompression();

    String getPartitionColNames();

    String getDfId();

    String getDfName();

    String getDsId();

    String getDsName();

    String getDsCreatedBy();

    DateTime getDsCreatedTime();

    String getDsModifiedBy();

    DateTime getDsModifiedTime();

    String getOrigDsId();

    String getOrigDsName();

    PrDataset.IMPORT_TYPE getOrigDsImportType();

    String getOrigDsStoredUri();

    Map<String, Long> getElapsedTime();

    Map<String, Object> getJsonLineageInfo();

    Map<String, Object> getSourceInfo();

    Map<String, Object> getConnectionInfo();

    List<Object> getRuleStringInfo();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();
  }

  @Projection(name = "listing", types = {PrSnapshot.class})
  public interface ListingProjection {

    String getSsId();

    String getSsName();

    PrSnapshot.SS_TYPE getSsType();

    PrSnapshot.STATUS getStatus();

    DateTime getLaunchTime();

    DateTime getFinishTime();

    String getStoredUri();

    String getDfName();

    String getDsName();

    Map<String, Long> getElapsedTime();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();
  }

}
