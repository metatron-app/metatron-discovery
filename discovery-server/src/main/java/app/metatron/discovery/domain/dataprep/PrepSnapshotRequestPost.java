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

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class PrepSnapshotRequestPost {
    PrSnapshot.SS_TYPE ssType;              // URI, DATABASE, STAGING_DB
    PrSnapshot.STORAGE_TYPE storageType;    // LOCAL, HDFS

    String ssName;
    String uri;
    String dbName;
    String tblName;
    PrSnapshot.HIVE_FILE_FORMAT format;
    PrSnapshot.HIVE_FILE_COMPRESSION compression;
    PrSnapshot.APPEND_MODE mode;
    PrSnapshot.ENGINE engine;
    List<String> partKeys;


    @JsonIgnore
    public PrSnapshot.HIVE_FILE_FORMAT getFormat() {
        return format;
    }

    public void setFormat(PrSnapshot.HIVE_FILE_FORMAT format) {
        this.format = format;
    }

    @JsonIgnore
    public PrSnapshot.HIVE_FILE_COMPRESSION getCompression() {
        return compression;
    }

    public void setCompression(PrSnapshot.HIVE_FILE_COMPRESSION compression) {
        this.compression = compression;
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

    public PrSnapshot.STORAGE_TYPE getStorageType() {
        return storageType;
    }

    public void setStorageType(PrSnapshot.STORAGE_TYPE storageType) {
        this.storageType = storageType;
    }

    public void setSsType(PrSnapshot.SS_TYPE ssType) {
        this.ssType = ssType;
    }

    public List<String> getPartKeys() {
        return partKeys;
    }

    public void setPartKeys(List<String> partKeys) {
        this.partKeys = partKeys;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
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

    public PrSnapshot.APPEND_MODE getMode() {
        return mode;
    }

    public void setMode(PrSnapshot.APPEND_MODE mode) {
        this.mode = mode;
    }

    public PrSnapshot.ENGINE getEngine() {
        return engine;
    }

    public void setEngine(PrSnapshot.ENGINE engine) {
        this.engine = engine;
    }
}

