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
import java.util.Map;

public class PrSnapshotProjections {

    @Projection(name = "default", types = { PrSnapshot.class })
    public interface DefaultProjection {
        String getSsId();
        String getSsName();
        String getDfName();
        String getHiveFileCompression();
        String getHiveFileFormat();
        String getSsType();
        String getDsName();
        DateTime getLaunchTime();
        DateTime getFinishTime();
        Long getTotalLines();
        Long getTotalBytes();
        Long getRuleCntTotal();
        Long getRuleCntDone();

        Map<String,Long>  getElapsedTime();
        Long getMismatchedLines();
        Long getMissingLines();

        String getStoredUri();

        String getCustom();
        //String getLineageInfo();
        String getStatus();

        Map<String,Object> getSourceInfo();
        Map<String,Object> getConnectionInfo();
        List<Object> getRuleStringInfo();
    }

}
