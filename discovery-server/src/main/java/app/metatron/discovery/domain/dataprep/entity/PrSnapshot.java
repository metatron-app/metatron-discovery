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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonValue;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.FieldBridge;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Index;
import org.hibernate.search.annotations.SortableField;
import org.hibernate.search.annotations.Store;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.bridge.JodaTimeSplitBridge;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.dataconnection.DataConnection;

@Entity
@Table(name = "pr_snapshot")
public class PrSnapshot extends AbstractHistoryEntity {
    private static final Logger LOGGER = LoggerFactory.getLogger(PrSnapshot.class);

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum SS_TYPE {
        URI,
        DATABASE,
        STAGING_DB,
        DRUID;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum URI_FILE_FORMAT {
        CSV,
        JSON;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum HIVE_FILE_FORMAT {
        CSV,
        ORC;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum HIVE_FILE_COMPRESSION {
        NONE,
        SNAPPY,
        ZLIB,
        LZO;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum APPEND_MODE {
        OVERWRITE,
        APPEND;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum ENGINE {
        EMBEDDED,
        TWINKLE;

        @JsonValue
        public String toJson() {
            return name();
        }
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
        CANCELED;

        @JsonValue
        public String toJson() {
            return name();
        }
    }


    //////////////////////////////
    // Snapshot own information //
    //////////////////////////////

    // Common attributes for all snapshot types.
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "ss_id")
    String ssId;

    @Size(max = 2000)
    @Column(name = "ss_name")
    String ssName;

    @Column(name = "ss_type")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.SS_TYPE ssType;

    @Column(name = "engine")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.ENGINE engine;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.STATUS status;

    @Column(name = "append_mode")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.APPEND_MODE appendMode;


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

    @Column(name = "mismatched_lines")
    Long mismatchedLines;

    @Column(name = "missing_lines")
    Long missingLines;

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


    // Attributes for URI snapshots
    @Lob
    @Column(name = "stored_uri")
    String storedUri;


    // Attributes for database snapshots (Not implemented yet)
    @Size(max = 255)
    @Column(name = "dc_id")
    String dcId;

    @Size(max = 255)
    @Column(name = "dc_implementor")
    protected String dcImplementor;

    @Column(name = "dc_name")
    @Size(max = 150)
    protected String dcName;

    @Lob
    @Column(name = "dc_desc")
    protected String dcDesc;

    @Column(name = "dc_type")
    @Enumerated(EnumType.STRING)
    protected DataConnection.SourceType dcType;

    @Column(name = "dc_hostname")
    protected String dcHostname;

    @Column(name = "dc_port")
    protected Integer dcPort;

    @Column(name = "dc_username")
    protected String dcUsername;

    @Column(name = "dc_password")
    protected String dcPassword;

    @Column(name = "dc_url")
    protected String dcUrl;

    @Size(max = 255)
    @Column(name = "db_name")
    String dbName;

    @Size(max = 255)
    @Column(name = "tbl_name")
    String tblName;


    // Attributes for stagingDb snapshots
    @Column(name = "hive_file_format")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.HIVE_FILE_FORMAT hiveFileFormat;

    @Column(name = "hive_file_compression")
    @Enumerated(EnumType.STRING)
    private PrSnapshot.HIVE_FILE_COMPRESSION hiveFileCompression;

    @Lob
    @Column(name = "partition_col_names")
    String partitionColNames;           // as JSONized List like ["col1", "col2"]


    ///////////////////////////////////////////////////////
    // Wrangled dataset info (for snapshot details page) //
    ///////////////////////////////////////////////////////
    @Size(max = 255)
    @Column(name = "df_id")
    String dfId;

    @Lob
    @Column(name = "df_name")
    String dfName;

    @Size(max = 255)
    @Column(name = "ds_id")
    String dsId;

    @Size(max = 2000)
    @Column(name = "ds_name")
    String dsName;

    @Column(name = "ds_created_by")
    @Field(index = Index.YES, analyze = Analyze.NO, store = Store.NO)
    protected String dsCreatedBy;

    @Column(name = "ds_created_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "dsCreatedTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsCreatedTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsCreatedTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsCreatedTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsCreatedTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "dsCreatedTime.mils")
    protected DateTime dsCreatedTime;

    @Column(name = "ds_modified_by")
    @Field(index = Index.YES, analyze = Analyze.NO, store = Store.NO)
    protected String dsModifiedBy;

    @Column(name = "ds_modified_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "dsModifiedTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsModifiedTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsModifiedTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsModifiedTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "dsModifiedTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "dsModifiedTime.mils")
    protected DateTime dsModifiedTime;


    ////////////////////////////////////////////////////////////////
    // Original imported dataset info (for snapshot details page) //
    ////////////////////////////////////////////////////////////////
    @Size(max = 255)
    @Column(name = "orig_ds_id")
    String origDsId;

    @Size(max = 2000)
    @Column(name = "orig_ds_name")
    String origDsName;

    @Column(name = "orig_ds_import_type")
    @Enumerated(EnumType.STRING)
    private PrDataset.IMPORT_TYPE origDsImportType;

    @Lob
    @Column(name = "orig_ds_stored_uri")
    private String origDsStoredUri;

    @Size(max = 255)
    @Column(name = "orig_ds_dc_id")
    String origDsDcId;

    @Size(max = 255)
    @Column(name = "orig_ds_dc_implementor")
    protected String origDsDcImplementor;

    @Column(name = "orig_ds_dc_name")
    @Size(max = 150)
    protected String origDsDcName;

    @Lob
    @Column(name = "orig_ds_dc_desc")
    protected String origDsDcDesc;

    @Column(name = "orig_ds_dc_type")
    @Enumerated(EnumType.STRING)
    protected DataConnection.SourceType origDsDcType;

    @Column(name = "orig_ds_dc_hostname")
    protected String origDsDcHostname;

    @Column(name = "orig_ds_dc_port")
    protected Integer origDsDcPort;

    @Column(name = "orig_ds_dc_username")
    protected String origDsDcUsername;

    @Column(name = "orig_ds_dc_url")
    protected String origDsDcUrl;

    @Size(max = 255)
    @Column(name = "orig_ds_db_name")
    private String origDsDbName;

    @Size(max = 255)
    @Column(name = "orig_ds_tbl_name")
    private String origDsTblName;

    @Lob
    @Column(name = "orig_ds_query_stmt")
    String origDsQueryStmt;

    @Column(name = "orig_ds_created_by")
    @Field(index = Index.YES, analyze = Analyze.NO, store = Store.NO)
    protected String origDsCreatedBy;

    @Column(name = "orig_ds_created_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "origDsCreatedTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsCreatedTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsCreatedTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsCreatedTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsCreatedTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "origDsCreatedTime.mils")
    protected DateTime origDsCreatedTime;

    @Column(name = "orig_ds_modified_by")
    @Field(index = Index.YES, analyze = Analyze.NO, store = Store.NO)
    protected String origDsModifiedBy;

    @Column(name = "orig_ds_modified_time")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @FieldBridge(impl = JodaTimeSplitBridge.class)
    @Fields({
            @Field(name = "origDsModifiedTime.year", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsModifiedTime.month", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsModifiedTime.day", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsModifiedTime.ymd", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
            @Field(name = "origDsModifiedTime.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
    })
    @SortableField(forField = "origDsModifiedTime.mils")
    protected DateTime origDsModifiedTime;


    // Getters, setters
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

    public SS_TYPE getSsType() {
        return ssType;
    }

    public void setSsType(SS_TYPE ssType) {
        this.ssType = ssType;
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

    public APPEND_MODE getAppendMode() {
        return appendMode;
    }

    public void setAppendMode(APPEND_MODE appendMode) {
        this.appendMode = appendMode;
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

    public Long getMismatchedLines() {
        return mismatchedLines;
    }

    public void setMismatchedLines(Long mismatchedLines) {
        this.mismatchedLines = mismatchedLines;
    }

    public Long getMissingLines() {
        return missingLines;
    }

    public void setMissingLines(Long missingLines) {
        this.missingLines = missingLines;
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

    public String getStoredUri() {
        return storedUri;
    }

    public void setStoredUri(String storedUri) {
        this.storedUri = storedUri;
    }

    public String getDcId() {
        return dcId;
    }

    public void setDcId(String dcId) {
        this.dcId = dcId;
    }

    public String getOrigDsDcId() {
        return origDsDcId;
    }

    public void setOrigDsDcId(String origDsDcId) {
        this.origDsDcId = origDsDcId;
    }

    public String getOrigDsDcImplementor() {
        return origDsDcImplementor;
    }

    public void setOrigDsDcImplementor(String origDsDcImplementor) {
        this.origDsDcImplementor = origDsDcImplementor;
    }

    public String getOrigDsDcName() {
        return origDsDcName;
    }

    public void setOrigDsDcName(String origDsDcName) {
        this.origDsDcName = origDsDcName;
    }

    public String getOrigDsDcDesc() {
        return origDsDcDesc;
    }

    public void setOrigDsDcDesc(String origDsDcDesc) {
        this.origDsDcDesc = origDsDcDesc;
    }

    public DataConnection.SourceType getOrigDsDcType() {
        return origDsDcType;
    }

    public void setOrigDsDcType(DataConnection.SourceType origDsDcType) {
        this.origDsDcType = origDsDcType;
    }

    public String getOrigDsDcHostname() {
        return origDsDcHostname;
    }

    public void setOrigDsDcHostname(String origDsDcHostname) {
        this.origDsDcHostname = origDsDcHostname;
    }

    public Integer getOrigDsDcPort() {
        return origDsDcPort;
    }

    public void setOrigDsDcPort(Integer origDsDcPort) {
        this.origDsDcPort = origDsDcPort;
    }

    public String getOrigDsDcUsername() {
        return origDsDcUsername;
    }

    public void setOrigDsDcUsername(String origDsDcUsername) {
        this.origDsDcUsername = origDsDcUsername;
    }

    public String getOrigDsDcUrl() {
        return origDsDcUrl;
    }

    public void setOrigDsDcUrl(String origDsDcUrl) {
        this.origDsDcUrl = origDsDcUrl;
    }

    public String getOrigDsDbName() {
        return origDsDbName;
    }

    public void setOrigDsDbName(String origDsDbName) {
        this.origDsDbName = origDsDbName;
    }

    public String getOrigDsTblName() {
        return origDsTblName;
    }

    public void setOrigDsTblName(String origDsTblName) {
        this.origDsTblName = origDsTblName;
    }

    public String getOrigDsQueryStmt() {
        return origDsQueryStmt;
    }

    public void setOrigDsQueryStmt(String origDsQueryStmt) {
        this.origDsQueryStmt = origDsQueryStmt;
    }

    public String getOrigDsCreatedBy() {
        return origDsCreatedBy;
    }

    public void setOrigDsCreatedBy(String origDsCreatedBy) {
        this.origDsCreatedBy = origDsCreatedBy;
    }

    public DateTime getOrigDsCreatedTime() {
        return origDsCreatedTime;
    }

    public void setOrigDsCreatedTime(DateTime origDsCreatedTime) {
        this.origDsCreatedTime = origDsCreatedTime;
    }

    public String getOrigDsModifiedBy() {
        return origDsModifiedBy;
    }

    public void setOrigDsModifiedBy(String origDsModifiedBy) {
        this.origDsModifiedBy = origDsModifiedBy;
    }

    public DateTime getOrigDsModifiedTime() {
        return origDsModifiedTime;
    }

    public void setOrigDsModifiedTime(DateTime origDsModifiedTime) {
        this.origDsModifiedTime = origDsModifiedTime;
    }

    public String getDcImplementor() {
        return dcImplementor;
    }

    public void setDcImplementor(String dcImplementor) {
        this.dcImplementor = dcImplementor;
    }

    public String getDcName() {
        return dcName;
    }

    public void setDcName(String dcName) {
        this.dcName = dcName;
    }

    public String getDcDesc() {
        return dcDesc;
    }

    public void setDcDesc(String dcDesc) {
        this.dcDesc = dcDesc;
    }

    public DataConnection.SourceType getDcType() {
        return dcType;
    }

    public void setDcType(DataConnection.SourceType dcType) {
        this.dcType = dcType;
    }

    public String getDcHostname() {
        return dcHostname;
    }

    public void setDcHostname(String dcHostname) {
        this.dcHostname = dcHostname;
    }

    public Integer getDcPort() {
        return dcPort;
    }

    public void setDcPort(Integer dcPort) {
        this.dcPort = dcPort;
    }

    public String getDcUsername() {
        return dcUsername;
    }

    public void setDcUsername(String dcUsername) {
        this.dcUsername = dcUsername;
    }

    public String getDcPassword() {
        return dcPassword;
    }

    public void setDcPassword(String dcPassword) {
        this.dcPassword = dcPassword;
    }

    public String getDcUrl() {
        return dcUrl;
    }

    public void setDcUrl(String dcUrl) {
        this.dcUrl = dcUrl;
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

    public String getPartitionColNames() {
        return partitionColNames;
    }

    public void setPartitionColNames(String partitionColNames) {
        this.partitionColNames = partitionColNames;
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

    public String getDsCreatedBy() {
        return dsCreatedBy;
    }

    public void setDsCreatedBy(String dsCreatedBy) {
        this.dsCreatedBy = dsCreatedBy;
    }

    public DateTime getDsCreatedTime() {
        return dsCreatedTime;
    }

    public void setDsCreatedTime(DateTime dsCreatedTime) {
        this.dsCreatedTime = dsCreatedTime;
    }

    public String getDsModifiedBy() {
        return dsModifiedBy;
    }

    public void setDsModifiedBy(String dsModifiedBy) {
        this.dsModifiedBy = dsModifiedBy;
    }

    public DateTime getDsModifiedTime() {
        return dsModifiedTime;
    }

    public void setDsModifiedTime(DateTime dsModifiedTime) {
        this.dsModifiedTime = dsModifiedTime;
    }

    public String getOrigDsId() {
        return origDsId;
    }

    public void setOrigDsId(String origDsId) {
        this.origDsId = origDsId;
    }

    public String getOrigDsName() {
        return origDsName;
    }

    public void setOrigDsName(String origDsName) {
        this.origDsName = origDsName;
    }

    public PrDataset.IMPORT_TYPE getOrigDsImportType() {
        return origDsImportType;
    }

    public void setOrigDsImportType(PrDataset.IMPORT_TYPE origDsImportType) {
        this.origDsImportType = origDsImportType;
    }

    public String getOrigDsStoredUri() {
        return origDsStoredUri;
    }

    public void setOrigDsStoredUri(String origDsStoredUri) {
        this.origDsStoredUri = origDsStoredUri;
    }

    // Extra getters
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

//    @JsonIgnore
//    public String getOriginInfo() {
//        return lineageInfo;
//    }

//    @JsonIgnore
//    public String getOrigDsInfo(String key) {
//        if (this.lineageInfo != null) {
//            Map jsonLineageInfo = GlobalObjectMapper.readValue(this.lineageInfo, Map.class);
//            if (jsonLineageInfo != null) {
//                Object origDsInfo = jsonLineageInfo.get("origDsInfo");
//                if (origDsInfo != null) {
//                    Map jsonOrigDsInfo = (Map)origDsInfo;
//                    if(jsonOrigDsInfo!=null) {
//                        Object objValue = jsonOrigDsInfo.get(key);
//                        if(objValue!=null) {
//                            String value = objValue.toString();
//                            return value;
//                        }
//                    }
//                }
//            }
//        }
//        return null;
//    }

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

    public Map<String,Object> getSourceInfo() {
        Map<String,Object> sourceInfo = Maps.newHashMap();

        sourceInfo.put("dfId", getDfId());
        sourceInfo.put("dfName", getDfName());
        sourceInfo.put("dsId", getDsId());
        sourceInfo.put("dsName", getDsName());
        sourceInfo.put("dsCreatedBy", getDsCreatedBy());
        sourceInfo.put("dsCreatedTime", getDsCreatedTime());
        sourceInfo.put("dsModifiedBy", getDsModifiedBy());
        sourceInfo.put("dsModifiedTime", getDsModifiedTime());
        sourceInfo.put("origDsId", getOrigDsId());
        sourceInfo.put("origDsName", getOrigDsName());
        sourceInfo.put("origDsImportType", getOrigDsImportType());
        sourceInfo.put("origDsStoredUri", getOrigDsStoredUri());
        sourceInfo.put("origDsDbName", getOrigDsDbName());
        sourceInfo.put("origDsTblName", getOrigDsTblName());
        sourceInfo.put("origDsQueryStmt", getOrigDsQueryStmt());
        sourceInfo.put("origDsCreatedBy", getOrigDsCreatedBy());
        sourceInfo.put("origDsCreatedTime", getOrigDsCreatedTime());
        sourceInfo.put("origDsModifiedBy", getOrigDsModifiedBy());
        sourceInfo.put("origDsModifiedTime", getOrigDsModifiedTime());


        Map<String,Object> connectionInfo = Maps.newHashMap();
        connectionInfo.put("origDsDcId", getOrigDsDcId());
        connectionInfo.put("origDsDcImplementor", getOrigDsDcImplementor());
        connectionInfo.put("origDsDcName", getOrigDsDcName());
        connectionInfo.put("origDsDcDesc", getOrigDsDcDesc());
        connectionInfo.put("origDsDcType ", getOrigDsDcType ());
        connectionInfo.put("origDsDcHostname", getOrigDsDcHostname());
        connectionInfo.put("origDsDcPort", getOrigDsDcPort());
        connectionInfo.put("origDsDcUsername", getOrigDsDcUsername());
        connectionInfo.put("origDsDcUrl", getOrigDsDcUrl());

        sourceInfo.put("origDsConnectionInfo", connectionInfo);

        return sourceInfo;
    }

    public Map<String,Object> getConnectionInfo() {
        Map<String,Object> connectionInfo = Maps.newHashMap();

        connectionInfo.put("dcId", getDcId());
        connectionInfo.put("dcImplementor", getDcImplementor());
        connectionInfo.put("dcName", getDcName());
        connectionInfo.put("dcDesc", getDcDesc());
        connectionInfo.put("dcType", getDcType ());
        connectionInfo.put("dcHostname", getDcHostname());
        connectionInfo.put("dcPort", getDcPort());
        connectionInfo.put("dcUsername", getDcUsername());
        connectionInfo.put("dcPassword", getDcPassword());
        connectionInfo.put("dcUrl", getDcUrl());

        return connectionInfo;
    }

    public List<Object> getRuleStringInfo() {
        if (this.lineageInfo != null) {
            Map jsonLineageInfo = GlobalObjectMapper.readValue(this.lineageInfo, Map.class);
            if (jsonLineageInfo != null) {
                Object ruleStringInfo = jsonLineageInfo.get("transformRules");
                if (ruleStringInfo != null) {
                    return (List)ruleStringInfo;
                }
            }
        }
        return Lists.newArrayList();
    }

    static public URI_FILE_FORMAT getFileFormatByUri(String uri) {
        if (uri.endsWith(".json")) {
            return URI_FILE_FORMAT.JSON;
        }

        return URI_FILE_FORMAT.CSV;
    }
}
