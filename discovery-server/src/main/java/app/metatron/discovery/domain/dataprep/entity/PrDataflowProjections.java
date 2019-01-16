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

import org.joda.time.DateTime;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

public class PrDataflowProjections {

    @Projection(name = "default", types = { PrDataflow.class })
    public interface DefaultProjection {

        String getDfId();
        String getDfName();
        String getDfDesc();

        Integer getImportedDsCount();
        Integer getWrangledDsCount();

        List<PrDataset> getDatasets();

        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();
    }

/*
    @Projection(name = "detail", types = { PrDataflow.class })
    public interface DetailProjection {

        String getDfName();
        String getDfDesc();

        Integer getImportedDsCount();
        Integer getWrangledDsCount();

        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();

        List<PrDataset> getDatasets();
        //List<PrepStream> getUpstreamInfos();
    }

    @Projection(name = "listing", types = { PrDataflow.class })
    public interface ListingProjection {

        String getDfId();
        String getDfName();
        String getDfDesc();

        Integer getImportedDsCount();
        Integer getWrangledDsCount();

        DateTime getCreatedTime();
        String getCreatedBy();
        DateTime getModifiedTime();
        String getModifiedBy();
    }
*/

}


