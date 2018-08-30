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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformRuleStringinfo;
import org.joda.time.DateTime;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

public class PrepDatasetProjections {

    @Projection(name = "default", types = { PrepDataset.class })
    public interface DefaultProjection {

        String getDsId();
        String getDsName();
        String getDsDesc();

        Integer getRefDfCount();

        String getDsType();

        String getImportType();
        String getCustom();
        String getCreatorDfId();

        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        // added for pycli
        String getQueryStmt();
    }

    @Projection(name = "detail", types = { PrepDataset.class })
    public interface DetailProjection {

        String getDsName();
        String getDsDesc();
        String getDsType();
        String getImportType();
        String getFileType();
        String getDbType();
        String getFilename();
        String getFilekey();
        String getCustom();
        String getRsType();
        String getDcId();
        String getTableName();
        String getQueryStmt();
        Long getTotalLines();
        Long getTotalBytes();

        Integer getRefDfCount();
        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        String getCreatorDfId();
        Integer getRuleCurIdx();

        List<PrepDataflow> getDataflows();
        List<PrepTransformRuleStringinfo> getRuleStringInfos();

        DataFrame getGridResponse();
    }

    @Projection(name = "listing", types = { PrepDataset.class })
    public interface ListingProjection {

        String getDsId();
        String getDsName();
        String getDsDesc();

        Integer getRefDfCount();

        String getDsType();
        String getImportType();

        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        String getCreatorDfName();
        String getFilename();
        String getTableName();

        List<PrepDataflow> getDataflows();
    }

    @Projection(name = "post", types = { PrepDataset.class })
    public interface PostProjection {

        String getDsName();
        String getDsDesc();
        String getDsType();
        List<PrepDataflow> getDataflows();
        String getImportType();
        String getFileType();
        String getFilekey();
        String getFilename();
        String getCreatorDfId();
        String getDcId();
    }
}

