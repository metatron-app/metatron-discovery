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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

public class PrepSnapshotRequestPost {
    PrSnapshot.SS_TYPE ssType;              // URI, DATABASE, STAGING_DB

    String ssName;
    String storedUri;
    String dbName;
    String tblName;
    PrSnapshot.HIVE_FILE_FORMAT hiveFileFormat;
    PrSnapshot.HIVE_FILE_COMPRESSION hiveFileCompression;
    PrSnapshot.APPEND_MODE appendMode;
    PrSnapshot.ENGINE engine;
    List<String> partitionColNames;


    public PrSnapshot.HIVE_FILE_FORMAT getHiveFileFormat() {
        return hiveFileFormat;
    }

    public void setHiveFileFormat(PrSnapshot.HIVE_FILE_FORMAT hiveFileFormat) {
        this.hiveFileFormat = hiveFileFormat;
    }

    public PrSnapshot.HIVE_FILE_COMPRESSION getHiveFileCompression() {
        return hiveFileCompression;
    }

    public void setHiveFileCompression(PrSnapshot.HIVE_FILE_COMPRESSION hiveFileCompression) {
        this.hiveFileCompression = hiveFileCompression;
    }

    public String getSsName() {
        return ssName;
    }

    public void setSsName(String ssName) {
        this.ssName = ssName;
    }

    public PrSnapshot.SS_TYPE getSsType() {
        return ssType;
    }

    public void setSsType(PrSnapshot.SS_TYPE ssType) {
        this.ssType = ssType;
    }

    @JsonIgnore
    public String getJsonPartitionColNames() throws JsonProcessingException {
        if (partitionColNames == null) {
            return null;
        }
        return GlobalObjectMapper.getDefaultMapper().writeValueAsString(partitionColNames);
    }

    public List<String> getPartitionColNames() {
        return partitionColNames;
    }

    public void setPartitionColNames(List<String> partitionColNames) {
        this.partitionColNames = partitionColNames;
    }

    public String getStoredUri() {
        return storedUri;
    }

    public void setStoredUri(String storedUri) {
        this.storedUri = storedUri;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public String getTblName() {
        return tblName;
    }

    public void setTblName(String tblName) {
        this.tblName = tblName;
    }

    public PrSnapshot.APPEND_MODE getAppendMode() {
        return appendMode;
    }

    public void setAppendMode(PrSnapshot.APPEND_MODE appendMode) {
        this.appendMode = appendMode;
    }

    public PrSnapshot.ENGINE getEngine() {
        return engine;
    }

    public void setEngine(PrSnapshot.ENGINE engine) {
        this.engine = engine;
    }
}

