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
import app.metatron.discovery.common.bridge.JodaTimeSplitBridge;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.search.annotations.*;
import org.hibernate.search.annotations.Index;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "prep_snapshot")
public class PrepSnapshot extends AbstractHistoryEntity {
    private static final Logger LOGGER = LoggerFactory.getLogger(PrepSnapshot.class);

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum SS_TYPE {
        FILE,
        HDFS,
        JDBC,
        HIVE
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum FORMAT {
        CSV,
        JSON,
        ORC,
        PARQUET
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum COMPRESSION {
        NONE,
        SNAPPY,
        ZLIB,
        LZO
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum MODE {
        OVERWRITE,
        APPEND
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum ENGINE {
        EMBEDDED,
        TWINKLE
    }

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "ss_id")
    String ssId;

    @Size(max = 2000)
    @Column(name = "ss_name")
    String ssName;

    @Size(max = 255)
    @Column(name = "creator_df_name")
    String creatorDfName;

    @Size(max = 255)
    @Column(name = "ds_name")
    String dsName;

    @Size(max = 4000)
    @Column(name = "uri")
    String uri;

    @Size(max = 255)
    @Column(name = "db_name")
    String dbName;

    @Size(max = 255)
    @Column(name = "tbl_name")
    String tblName;

    @Column(name = "ss_type")
    @Enumerated(EnumType.STRING)
    private PrepSnapshot.SS_TYPE ssType;

    @Column(name = "format")
    @Enumerated(EnumType.STRING)
    private PrepSnapshot.FORMAT format;

    @Column(name = "compression")
    @Enumerated(EnumType.STRING)
    private PrepSnapshot.COMPRESSION compression;

    @Column(name = "mode")
    @Enumerated(EnumType.STRING)
    private PrepSnapshot.MODE mode;

    @Column(name = "engine")
    @Enumerated(EnumType.STRING)
    private PrepSnapshot.ENGINE engine;

    @Column(name = "profile", nullable = false)
    private boolean profile = true;

    @Size(max = 4096)
    @Column(name = "out_path")
    String outPath;     // used on HDFS type (only)

    @Size(max = 4096)
    @Column(name = "ext_hdfs_dir")
    String extHdfsDir;

    @Column(name = "launch_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "launchTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "launchTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "launchTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "launchTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "launchTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "launchTime.mils")
    DateTime launchTime;

    @Column(name = "finish_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "finishTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "finishTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "finishTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "finishTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "finishTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "finishTime.mils")
    DateTime finishTime;

    @Lob
    @Column(name = "lineage_info")
    String lineageInfo;

    @Column(name = "total_lines")
    Long totalLines;

    @Column(name = "total_bytes")
    Long totalBytes;

    @Column(name = "rule_cnt_total")
    Long ruleCntTotal;

    @Column(name = "rule_cnt_done")
    Long ruleCntDone;

    @Lob
    @Column(name = "stat")
    String stat;

    @Lob
    @Column(name = "custom")
    String custom;

    public Long getValidLines() {
        return 10000L;
    }

    public Long getMismatchedLines() {
        return 0L;
    }

    public Long getMissingLines() {
        return 0L;
    }

    public String getSsId() {
        return ssId;
    }

    public void setSsId(String ssId) {
        this.ssId = ssId;
    }

    public String getSsName() {
        return ssName;
    }

    public void setSsName(String ssName) {
        this.ssName = ssName;
    }

    public String getCreatorDfName() {
        return creatorDfName;
    }

    public void setCreatorDfName(String creatorDfName) {
        this.creatorDfName = creatorDfName;
    }

    public String getDsName() {
        return dsName;
    }

    public void setDsName(String dsName) {
        this.dsName = dsName;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    @JsonIgnore
    public FORMAT getFormatEnum() {
        return format;
    }

    public void setFormat(FORMAT format) {
        this.format = format;
    }

    public void setCompression(COMPRESSION compression) {
        this.compression = compression;
    }

    public boolean isProfile() {
        return profile;
    }

    public void setProfile(boolean profile) {
        this.profile = profile;
    }

    public Map<String,Long> getElapsedTime() {
        Map<String,Long> elapsedTime = null;
        if(this.launchTime!=null && this.finishTime!=null) {
            elapsedTime = new HashMap<String,Long>();

            long elapsedMillis = 0L;
            elapsedMillis = this.finishTime.getMillis() - this.launchTime.getMillis();

            long milli = elapsedMillis%1000L;
            elapsedMillis/=1000L;
            long sec = elapsedMillis%60L;
            elapsedMillis/=60L;
            long min = elapsedMillis%60L;
            elapsedMillis/=60L;
            long hour = elapsedMillis%24L;
            elapsedMillis/=24L;
            long day = elapsedMillis;
            elapsedTime.put("hours",hour);
            elapsedTime.put("days",day);
            elapsedTime.put("minutes",min);
            elapsedTime.put("seconds",sec);
            elapsedTime.put("milliseconds",milli);
        }

        return elapsedTime;
    }

    public DateTime getLaunchTime() {
        return launchTime;
    }

    public void setLaunchTime(DateTime launchTime) {
        this.launchTime = launchTime;
    }

    public DateTime getFinishTime() {
        return finishTime;
    }

    public void setFinishTime(DateTime finishTime) {
        this.finishTime = finishTime;
    }

    public Long getTotalLines() {
        return totalLines;
    }

    public void setTotalLines(Long totalLines) {
        this.totalLines = totalLines;
    }

    public Long getTotalBytes() {
        return totalBytes;
    }

    public void setTotalBytes(Long totalBytes) {
        this.totalBytes = totalBytes;
    }

    public Long getRuleCntTotal() {
        return ruleCntTotal;
    }

    public void setRuleCntTotal(Long ruleCntTotal) {
        this.ruleCntTotal = ruleCntTotal;
    }

    public Long getRuleCntDone() {
        return ruleCntDone;
    }

    public void setRuleCntDone(Long ruleCntDone) {
        this.ruleCntDone = ruleCntDone;
    }

    public String getStat() {
        return stat;
    }

    public void setStat(String stat) {
        this.stat = stat;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
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

    public SS_TYPE getSsType() {
        return ssType;
    }

    public void setSsType(SS_TYPE ssType) {
        this.ssType = ssType;
    }

    public FORMAT getFormat() {
        return format;
    }

    public COMPRESSION getCompression() {
        return compression;
    }

    public MODE getMode() {
        return mode;
    }

    public void setMode(MODE mode) {
        this.mode = mode;
    }

    public ENGINE getEngine() {
        return engine;
    }

    public void setEngine(ENGINE engine) {
        this.engine = engine;
    }

    public void setEngine(String engine) {
        if (engine.equalsIgnoreCase(ENGINE.TWINKLE.name())) {
            this.engine = ENGINE.TWINKLE;
        } else {
            this.engine = ENGINE.EMBEDDED;
        }
    }

    public String getExtHdfsDir() {
        return extHdfsDir;
    }

    public void setExtHdfsDir(String extHdfsDir) {
        this.extHdfsDir = extHdfsDir;
    }

    public String getOutPath() {
        return outPath;
    }

    public void setOutPath(String outPath) {
        this.outPath = outPath;
    }

    @JsonIgnore
    public Map<String,Object> getJsonLineageInfo() {
        Map jsonLineageInfo = null;
        if (this.lineageInfo != null) {
            jsonLineageInfo = GlobalObjectMapper.readValue(this.lineageInfo, Map.class);
        }
        return jsonLineageInfo;
    }

    public String getLineageInfo() {
        return lineageInfo;
    }

    public void setLineageInfo(String lineageInfo) {
        this.lineageInfo = lineageInfo;
    }

    @JsonIgnore
    public String getLineageInfoValue(String key) {
        if (this.custom != null) {
            Map customObject = GlobalObjectMapper.readValue(getLineageInfo(), Map.class);
            if (customObject != null) {
                Object value = customObject.get(key);
                if (value != null) {
                    return value.toString();
                }
            }
        }
        return null;
    }

    @JsonIgnore
    public String getOriginInfo() {
        return lineageInfo;
    }

    @JsonIgnore
    public String getOrigDsInfo(String key) {
        if (this.lineageInfo != null) {
            Map jsonLineageInfo = GlobalObjectMapper.readValue(this.lineageInfo, Map.class);
            if (jsonLineageInfo != null) {
                Object origDsInfo = jsonLineageInfo.get("origDsInfo");
                if (origDsInfo != null) {
                    Map jsonOrigDsInfo = (Map)origDsInfo;
                    if(jsonOrigDsInfo!=null) {
                        Object objValue = jsonOrigDsInfo.get(key);
                        if(objValue!=null) {
                            String value = objValue.toString();
                            return value;
                        }
                    }
                }
            }
        }
        return null;
    }

    @JsonIgnore
    public String getCustomValue(String key) {
        if (this.custom != null) {
            Map customObject = GlobalObjectMapper.readValue(getCustom(), Map.class);
            if (customObject != null) {
                Object value = customObject.get(key);
                if (value != null) {
                    return value.toString();
                }
            }
        }
        return null;
    }

    @JsonIgnore
    public String putCustomValue(String key, String value) {
        if (this.custom == null) {
            this.custom = "{}";
        }
        Map customObject = GlobalObjectMapper.readValue(getCustom(), Map.class);
        if (customObject != null) {
            customObject.put(key, value);
            String jsonCustom = GlobalObjectMapper.writeValueAsString(customObject);
            setCustom(jsonCustom);
        }
        return this.custom;
    }
}
