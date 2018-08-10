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

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class PrepSnapshotRequestPost {
    PrepSnapshot.SS_TYPE ssType;
    String ssName;
    String uri;
    String dbName;
    String tblName;
    PrepSnapshot.FORMAT format;
    PrepSnapshot.COMPRESSION compression;
    PrepSnapshot.MODE mode;
    PrepSnapshot.ENGINE engine;
    boolean profile;
    String extHdfsDir;
    List<String> partKeys;

    @JsonIgnore
    public PrepSnapshot.FORMAT getFormatEnum() {
        return format;
    }

    public String getFormat() {
        if(format==null) {
            return null;
        }
        return format.name();
    }

    public void setFormat(PrepSnapshot.FORMAT format) {
        this.format = format;
    }

    @JsonIgnore
    public PrepSnapshot.COMPRESSION getCompressionEnum() {
        return compression;
    }

    public String getCompression() {
        if(compression==null) {
            return null;
        }
        return compression.name();
    }

    public void setCompression(PrepSnapshot.COMPRESSION compression) {
        this.compression = compression;
    }

    public boolean isProfile() {
        return profile;
    }

    public void setProfile(boolean profile) {
        this.profile = profile;
    }

    public String getSsName() {
        return ssName;
    }

    public void setSsName(String ssName) {
        this.ssName = ssName;
    }

    public PrepSnapshot.SS_TYPE getSsTypeEnum() {
        return ssType;
    }

    public String getSsType() {
        if(ssType==null) {
            return null;
        }
        return ssType.name();
    }

    public void setSsType(PrepSnapshot.SS_TYPE ssType) {
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

    public PrepSnapshot.MODE getModeEnum() {
        return mode;
    }

    public String getMode() {
        if(mode==null) {
            return null;
        }
        return mode.name();
    }

    public void setMode(PrepSnapshot.MODE mode) {
        this.mode = mode;
    }

    public String getExtHdfsDir() {
        return extHdfsDir;
    }

    public void setExtHdfsDir(String extHdfsDir) {
        this.extHdfsDir = extHdfsDir;
    }

    public PrepSnapshot.ENGINE getEngineEnum() {
        return engine;
    }

    public String getEngine() {
        if(engine==null) {
            return null;
        }
        return engine.name();
    }

    public void setEngine(PrepSnapshot.ENGINE engine) {
        this.engine = engine;
    }
}

