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
import org.joda.time.DateTime;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

public class PrDatasetProjections {

    @Projection(name = "default", types = { PrDataset.class })
    public interface DefaultProjection {

        String getDsId();
        String getSerializedPreview();
        String getDsName();
        String getDsDesc();
        PrDataset.DS_TYPE getDsType();
        PrDataset.IMPORT_TYPE getImportType();
        //PrDataset.STORAGE_TYPE getStorageType();
        String getStoredUri();
        String getFilenameBeforeUpload();
        Long getTotalLines();
        Long getTotalBytes();
        String getDcId();
        PrDataset.RS_TYPE getRsType();
        String getDbName();
        String getTblName();
        String getQueryStmt();
        String getSheetName();
        PrDataset.FILE_FORMAT getFileFormat();
        String getDelimiter();
        String getCustom();

        Integer getRefDfCount();
        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        String getCreatorDfId();
        String getCreatorDfName();
        Integer getRuleCurIdx();

        List<PrDataflow> getDataflows();
        List<PrTransformRule> getTransformRules();

        DataFrame getGridResponse();
        Map<String,Object> getConnectionInfo();
    }

    @Projection(name = "detail", types = { PrDataset.class })
    public interface DetailProjection {
        String getDsId();
        String getSerializedPreview();
        String getDsName();
        String getDsDesc();
        PrDataset.DS_TYPE getDsType();
        PrDataset.IMPORT_TYPE getImportType();
        //PrDataset.STORAGE_TYPE getStorageType();
        String getStoredUri();
        String getFilenameBeforeUpload();
        Long getTotalLines();
        Long getTotalBytes();
        String getDcId();
        PrDataset.RS_TYPE getRsType();
        String getDbName();
        String getTblName();
        String getQueryStmt();
        String getSheetName();
        PrDataset.FILE_FORMAT getFileFormat();
        String getDelimiter();
        String getCustom();

        Integer getRefDfCount();
        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        String getCreatorDfId();
        String getCreatorDfName();
        Integer getRuleCurIdx();

        List<PrDataflow> getDataflows();
        List<PrTransformRule> getTransformRules();

        DataFrame getGridResponse();
        Map<String,Object> getConnectionInfo();
    }

    @Projection(name = "listing", types = { PrDataset.class })
    public interface ListingProjection {
        String getDsId();
        String getSerializedPreview();
        String getDsName();
        String getDsDesc();
        PrDataset.DS_TYPE getDsType();
        PrDataset.IMPORT_TYPE getImportType();
        //PrDataset.STORAGE_TYPE getStorageType();
        String getStoredUri();
        String getFilenameBeforeUpload();
        Long getTotalLines();
        Long getTotalBytes();
        String getDcId();
        PrDataset.RS_TYPE getRsType();
        String getDbName();
        String getTblName();
        String getQueryStmt();
        String getSheetName();
        PrDataset.FILE_FORMAT getFileFormat();
        String getDelimiter();
        String getCustom();

        Integer getRefDfCount();
        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        String getCreatorDfId();
        String getCreatorDfName();
        Integer getRuleCurIdx();

        List<PrDataflow> getDataflows();
        List<PrTransformRule> getTransformRules();

        DataFrame getGridResponse();
        Map<String,Object> getConnectionInfo();
    }

}

