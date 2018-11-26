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

import org.joda.time.DateTime;
import org.springframework.data.rest.core.config.Projection;

import java.util.Map;

public class PrepSnapshotProjections {

    @Projection(name = "default", types = { PrepSnapshot.class })
    public interface DefaultProjection {
        String getSsId();
        String getSsName();
        String getCreatorDfName();
        String getDsName();
        DateTime getLaunchTime();
        DateTime getFinishTime();
        String getCreatedBy();

        String getCustom();
        String getLineageInfo();
        String getStatus();
    }

    @Projection(name = "detail", types = { PrepSnapshot.class })
    public interface DetailProjection {
        String getSsName();
        String getCreatorDfName();
        String getCompression();
        String getFormat();
        String getSsType();
        String getDsName();
        DateTime getLaunchTime();
        DateTime getFinishTime();
        Long getTotalLines() ;
        Long getTotalBytes();
        Long getRuleCntTotal();
        Long getRuleCntDone();

        Map<String,Long>  getElapsedTime();
        Long getValidLines();
        Long getMismatchedLines();
        Long getMissingLines();

        String getUri();

        String getCustom();
        //String getLineageInfo();
        Map<String,Object> getJsonLineageInfo();
        String getStatus();
    }

    @Projection(name = "listing", types = { PrepSnapshot.class })
    public interface ListingProjection {
        String getSsId();
        String getSsName();
        String getSsType();
        String getCreatorDfName();
        String getDsName();
        DateTime getLaunchTime();
        DateTime getFinishTime();
        String getCreatedBy();

        Long getRuleCntTotal();
        Long getRuleCntDone();

        Map<String,Long> getElapsedTime();
        Long getValidLines();
        Long getMismatchedLines();
        Long getMissingLines();

        String getCustom();
        String getLineageInfo();
        String getStatus();
    }

    @Projection(name = "post", types = { PrepSnapshot.class })
    public interface PostProjection {

        String getSsId();
        DateTime getLaunchTime();
    }
}
