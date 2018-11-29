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
@Table(name = "pr_snapshot")
public class PrSnapshot extends AbstractHistoryEntity {
    private static final Logger LOGGER = LoggerFactory.getLogger(PrSnapshot.class);

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum SS_TYPE {
        URI,
        DATABASE,
        STAGING_DB,
        DRUID
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum URI_FILE_FORMAT {
        CSV,
        JSON
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum STORAGE_TYPE {
        LOCAL,
        HDFS
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum HIVE_FILE_FORMAT {
        CSV,
        ORC
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum HIVE_FILE_COMPRESSION {
        NONE,
        SNAPPY,
        ZLIB,
        LZO
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum APPEND_MODE {
        OVERWRITE,
        APPEND
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum ENGINE {
        EMBEDDED,
        TWINKLE
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum STATUS {
        NOT_AVAILABLE,
        INITIALIZING,
        RUNNING,
        WRITING,
        TABLE_CREATING,
        SUCCEEDED,
        FAILED,
        CANCELING,
        CANCELED
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
    @Column(name = "df_id")
    String dfId;

    @Size(max = 2000)
    @Column(name = "df_name")
    String dfName;

    @Size(max = 255)
    @Column(name = "ds_id")
    String dsId;

    @Size(max = 2000)
    @Column(name = "ds_name")
    String dsName;

    @Lob
    @Column(name = "stored_uri")
    String storedUri;

    @Column(name = "storage_type")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.STORAGE_TYPE storageType;

    @Size(max = 255)
    @Column(name = "db_name")
    String dbName;

    @Size(max = 255)
    @Column(name = "tbl_name")
    String tblName;

    @Column(name = "ss_type")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.SS_TYPE ssType;

    @Column(name = "uri_file_format")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.URI_FILE_FORMAT uriFileFormat;

    @Column(name = "hive_file_format")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.HIVE_FILE_FORMAT hiveFileFormat;

    @Column(name = "hive_file_compression")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.HIVE_FILE_COMPRESSION hiveFileCompression;

    @Column(name = "append_mode")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.APPEND_MODE appendMode;

    @Column(name = "engine")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.ENGINE engine;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.STATUS status;

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
    String lineageInfo;                 // Contains all ruleStrings when created

    @Column(name = "total_lines")
    Long totalLines;

    @Column(name = "total_bytes")
    Long totalBytes;

    @Column(name = "rule_cnt_total")
    Long ruleCntTotal;

    @Column(name = "rule_cnt_done")
    Long ruleCntDone;

    @Lob
    @Column(name = "server_log")
    String serverLog;

    @Lob
    @Column(name = "custom")
    String custom;

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

    public String getDfId() {
        return dfId;
    }

    public void setDfId(String dfId) {
        this.dfId = dfId;
    }

    public String getDfName() {
        return dfName;
    }

    public void setDfName(String dfName) {
        this.dfName = dfName;
    }

    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }

    public String getDsName() {
        return dsName;
    }

    public void setDsName(String dsName) {
        this.dsName = dsName;
    }

    public String getStoredUri() {
        return storedUri;
    }

    public void setStoredUri(String storedUri) {
        this.storedUri = storedUri;
    }

    public STORAGE_TYPE getStorageType() {
        return storageType;
    }

    public void setStorageType(STORAGE_TYPE storageType) {
        this.storageType = storageType;
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

    public URI_FILE_FORMAT getUriFileFormat() {
        return uriFileFormat;
    }

    public void setUriFileFormat(URI_FILE_FORMAT uriFileFormat) {
        this.uriFileFormat = uriFileFormat;
    }

    public HIVE_FILE_FORMAT getHiveFileFormat() {
        return hiveFileFormat;
    }

    public void setHiveFileFormat(HIVE_FILE_FORMAT hiveFileFormat) {
        this.hiveFileFormat = hiveFileFormat;
    }

    public HIVE_FILE_COMPRESSION getHiveFileCompression() {
        return hiveFileCompression;
    }

    public void setHiveFileCompression(HIVE_FILE_COMPRESSION hiveFileCompression) {
        this.hiveFileCompression = hiveFileCompression;
    }

    public APPEND_MODE getAppendMode() {
        return appendMode;
    }

    public void setAppendMode(APPEND_MODE appendMode) {
        this.appendMode = appendMode;
    }

    public ENGINE getEngine() {
        return engine;
    }

    public void setEngine(ENGINE engine) {
        this.engine = engine;
    }

    public STATUS getStatus() {
        return status;
    }

    public void setStatus(STATUS status) {
        this.status = status;
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

    public String getLineageInfo() {
        return lineageInfo;
    }

    public void setLineageInfo(String lineageInfo) {
        this.lineageInfo = lineageInfo;
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

    public String getServerLog() {
        return serverLog;
    }

    public void setServerLog(String serverLog) {
        this.serverLog = serverLog;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    @JsonIgnore
    public String getStatusCat() {
        if(status != null) {
            if(status==STATUS.SUCCEEDED) {
                return "SUCCESS";
            } else if(status==STATUS.FAILED || status==STATUS.CANCELED || status==STATUS.NOT_AVAILABLE) {
                return "FAIL";
            } else if(status==STATUS.INITIALIZING || status==STATUS.RUNNING || status==STATUS.WRITING || status==STATUS.TABLE_CREATING || status==STATUS.CANCELING) {
                return "PREPARING";
            }
        }
        return null;
    }

    public Map<String,Long> getElapsedTime() {
        Map<String,Long> elapsedTime = null;
        if(this.launchTime!=null && this.finishTime!=null) {
            elapsedTime = new HashMap();

            long elapsedMillis;
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

    @JsonIgnore
    public Map<String,Object> getJsonLineageInfo() {
        Map jsonLineageInfo = null;
        if (this.lineageInfo != null) {
            jsonLineageInfo = GlobalObjectMapper.readValue(this.lineageInfo, Map.class);
        }
        return jsonLineageInfo;
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
