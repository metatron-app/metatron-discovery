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

import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.user.UserProfile;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

public class PrDatasetProjections {

    @Projection(name = "default", types = { PrDataset.class })
    public interface DefaultProjection {

        Integer getRefDfCount();
        String getDsId();
        String getSerializedPreview();
        String getDsName();
        String getDsDesc();
        PrDataset.DS_TYPE getDsType();
        PrDataset.IMPORT_TYPE getImportType();
        String getStoredUri();
        String getFilenameBeforeUpload();
        Long getTotalLines();
        Long getTotalBytes();
        String getDcId();
        String getDcImplementor();
        String getDcName();
        String getDcDesc();
        String getDcType();
        String getDcHostname();
        Integer getDcPort();
        String getDcOptions();
        String getDcUsername();
        String getDcPassword();
        String getDcUrl();
        String getDcConnectUrl();
        String getDcAuthenticationType();
        Boolean getDcPublished();
        PrDataset.RS_TYPE getRsType();
        String getDbName();
        String getTblName();
        String getQueryStmt();
        String getCreatorDfId();
        String getCreatorDfName();
        Integer getRuleCurIdx();
        String getSheetName();
        PrDataset.FILE_FORMAT getFileFormat();
        String getDelimiter();
        String getCustom();
        //PrDataset.STORAGE_TYPE getStorageType();

        List<PrDataflow> getDataflows();
        List<PrTransformRule> getTransformRules();
        DataFrame getGridResponse();
        // Map<String, Object> getConnectionInfo();

        DateTime getCreatedTime();
        DateTime getModifiedTime();

        @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
        UserProfile getCreatedBy();

        @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
        UserProfile getModifiedBy();
    }

}

