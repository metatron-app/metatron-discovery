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
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformRule;
import app.metatron.discovery.domain.dataprep.transform.PrepTransformRuleStringinfo;
import app.metatron.discovery.domain.dataprep.transform.PrepTransition;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.hibernate.annotations.GenericGenerator;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "prep_dataset")
@SecondaryTable(
        name="prep_imported_dataset_info",
        pkJoinColumns = @PrimaryKeyJoinColumn(name="ds_id", referencedColumnName="ds_id")
)
public class PrepDataset extends AbstractHistoryEntity {
    private static final Logger LOGGER = LoggerFactory.getLogger(PrepDataset.class);

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum DS_TYPE {
        IMPORTED,
        WRANGLED,
        FULLWRANGLED,
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum IMPORT_TYPE {
        FILE,
        DB,
        HIVE
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum FILE_TYPE {
        LOCAL,
        REMOTE,
        HDFS,
        FTP
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum RS_TYPE {
        TABLE,
        SQL
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum OP_TYPE {
        CREATE,
        APPEND,
        UPDATE,
        DELETE,
        JUMP,
        UNDO,
        REDO,
        PREVIEW,
        NOT_USED
    }

    @Id
    //@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="prep_set_seq")
    //@SequenceGenerator(name="prep_set_seq", initialValue=1, allocationSize=1)
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "ds_id")
    String dsId;

    @Column(name = "ds_type")
    @Enumerated(EnumType.STRING)
    private PrepDataset.DS_TYPE dsType;

    @Column(name = "import_type", table="prep_imported_dataset_info")
    @Enumerated(EnumType.STRING)
    private PrepDataset.IMPORT_TYPE importType;

    @Column(name = "file_type", table="prep_imported_dataset_info")
    @Enumerated(EnumType.STRING)
    private PrepDataset.FILE_TYPE fileType;

    @Column(name = "rs_type", table="prep_imported_dataset_info")
    @Enumerated(EnumType.STRING)
    private PrepDataset.RS_TYPE rsType;

    @Size(max = 255)
    @Column(name = "filekey", table="prep_imported_dataset_info")
    private String filekey;

    @Size(max = 255)
    @Column(name = "filename", table="prep_imported_dataset_info")
    private String filename;

    @Size(max = 255)
    @Column(name = "dc_id", table="prep_imported_dataset_info")
    private String dcId;

    @Size(max = 256)
    @Column(name = "table_name", table="prep_imported_dataset_info")
    private String tableName;

    @Lob
    @Column(name = "query_stmt", table="prep_imported_dataset_info")
    String queryStmt;

    @Size(max = 16)
    @Column(name = "charset", table="prep_imported_dataset_info")
    private String charset;

    @JsonBackReference
    @ManyToMany(mappedBy = "datasets", fetch = FetchType.LAZY, cascade = {CascadeType.MERGE,CascadeType.REFRESH,CascadeType.DETACH})
    private List<PrepDataflow> dataflows;

    @JsonIgnore
    @OneToMany(mappedBy="dataset", fetch=FetchType.LAZY, cascade = {CascadeType.MERGE,CascadeType.REMOVE})
    private List<PrepTransition> transitions;

    @JsonIgnore
    @OneToMany(mappedBy="dataset", fetch=FetchType.LAZY, cascade = {CascadeType.REMOVE})
    private List<PrepDatasetColumnInfo> datasetColumnInfo;

    @JsonIgnore
    @OneToMany(mappedBy="dataset", fetch=FetchType.LAZY, cascade = {CascadeType.REMOVE})
    private List<PrepTransformRule> transformRules;

    @Size(max = 128)
    @Column(name = "ds_name", nullable = false)
    private String dsName;

    @Size(max = 256)
    @Column(name = "ds_desc")
    private String dsDesc;

    @Column(name = "creator_df_id")
    private String creatorDfId;

    @Column(name = "rule_cur_idx")
    private Integer ruleCurIdx;

    @Column(name = "rule_cnt")
    private Integer ruleCnt;

    @Column(name = "session_revision")
    private int sessionRevision;

    @Column(name = "total_lines")
    private Integer totalLines;     // meaningless in temp wrangled dataset which made for confirm()

    @Column(name = "total_bytes")
    private Long totalBytes;

    @Lob
    @Column(name = "custom")
    private String custom;

    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }

    public IMPORT_TYPE getImportTypeEnum() {
        return importType;
    }

    public String getImportType() {
        if(importType==null) {
            return null;
        }
        return importType.name();
    }

    public String getFileType() {
        if(fileType==null) {
            return null;
        }
        return fileType.name();
    }

    public FILE_TYPE getFileTypeEnum() {
        return fileType;
    }

    public RS_TYPE getRsTypeEnum() {
        return rsType;
    }

    public String getRsType() {
        if(rsType==null) {
            return null;
        }
        return rsType.name();
    }

    public String getDsType() {
        if(dsType==null) {
            return null;
        }
        return dsType.name();
    }

    @JsonIgnore
    public DS_TYPE getDsTypeForEnum() {
        return dsType;
    }

    public void setDsType(DS_TYPE dsType) {
        this.dsType = dsType;
    }

    public List<PrepDataflow> getDataflows() {
        return dataflows;
    }

    public void setDataflows(List<PrepDataflow> dataflows) {
        this.dataflows = dataflows;
    }

    public List<PrepTransition> getTransitions() {
        return transitions;
    }

    public void setTransitions(List<PrepTransition> transitions) {
        this.transitions = transitions;
    }

    public List<PrepTransformRule> getTransformRules() {
        return transformRules;
    }

    public void setTransformRules(List<PrepTransformRule> transformRules) {
        this.transformRules = transformRules;
    }

    public String getDsName() {
        return dsName;
    }

    public void setDsName(String dsName) {
        this.dsName = dsName;
    }

    public String getDsDesc() {
        return dsDesc;
    }

    public void setDsDesc(String dsDesc) {
        this.dsDesc = dsDesc;
    }

    public String getCreatorDfId() throws PrepException {
        if(this.dsType!=null&&this.dsType==DS_TYPE.WRANGLED) {
            if(this.creatorDfId==null) {
                String errorMsg = "dataset ["+this.dsName+"] hasn't creator dataflow ID";
                //throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HAS_NO_CREATOR_DATAFLOW, errorMsg);
            }
        }
        return creatorDfId;
    }

    public String getCreatorDfName() throws PrepException {
        if(this.dsType!=null&&this.dsType==DS_TYPE.WRANGLED) {
            if(this.creatorDfId==null) {
                String errorMsg = "dataset ["+this.dsName+"] hasn't creator dataflow";
                //throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HAS_NO_CREATOR_DATAFLOW, errorMsg);
            }
            if(this.dataflows!=null) {
                for (PrepDataflow dataflow : this.dataflows) {
                    if(dataflow.getDfId().equals(this.creatorDfId)) {
                        return dataflow.getDfName();
                    }
                }
            }
        }
        return null;
    }

    public void setCreatorDfId(String creatorDfId) {
        this.creatorDfId = creatorDfId;
    }

    public Integer getRuleCurIdx() {
        return ruleCurIdx;
    }

    public void setRuleCurIdx(Integer ruleCurIdx) {
        this.ruleCurIdx = ruleCurIdx;
    }
    public Integer getRuleCnt() {
        return ruleCnt;
    }

    public void setRuleCnt(Integer ruleCnt) {
        this.ruleCnt = ruleCnt;
    }

    public int getSessionRevision() {
        return sessionRevision;
    }

    public void setSessionRevision(int sessionRevision) {
        this.sessionRevision = sessionRevision;
    }

    public Integer getTotalLines() {
        if(this.totalLines==null) {
            this.totalLines = 0;
        }
        return totalLines;
    }

    public void setTotalLines(Integer totalLines) {
        this.totalLines = totalLines;
    }

    public Long getTotalBytes() {
        if(this.totalBytes==null) {
            this.totalBytes = 0L;
        }
        return totalBytes;
    }

    public void setTotalBytes(Long totalBytes) {
        this.totalBytes = totalBytes;
    }

    public void setImportType(IMPORT_TYPE importType) {
        this.importType = importType;
    }

    public String getDbType() {
        if(this.importType!=null && this.importType==IMPORT_TYPE.DB) {
            return "SOMETHING_DBTYPE";
        }
        return null;
    }
    public void setFileType(FILE_TYPE fileType) {
        this.fileType = fileType;
    }

    public void setRsType(RS_TYPE rsType) {
        this.rsType = rsType;
    }

    public String getFilekey() {
        return filekey;
    }

    public void setFilekey(String filekey) {
        this.filekey = filekey;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getCharset() {
        return charset;
    }

    public void setCharset(String charset) {
        this.charset = charset;
    }

    public String getDcId() {
        return dcId;
    }

    public void setDcId(String dcId) {
        this.dcId = dcId;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public List<PrepDatasetColumnInfo> getDatasetColumnInfo() {
        return datasetColumnInfo;
    }

    public void setDatasetColumnInfo(List<PrepDatasetColumnInfo> datasetColumnInfo) {
        this.datasetColumnInfo = datasetColumnInfo;
    }

    public String getQueryStmt() {
        return queryStmt;
    }

    public void setQueryStmt(String queryStmt) {
        this.queryStmt = queryStmt;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public boolean addDataflow(PrepDataflow dataflow) {
        if(dataflow!=null) {
            if(this.dataflows==null) {
                this.dataflows = new ArrayList<PrepDataflow>();
            }
            for(PrepDataflow df : this.dataflows) {
                if(df.getDfId()==dataflow.getDfId()) {
                    return false;
                }
            }
            this.dataflows.add(dataflow);
            return true;
        }
        return false;
    }

    public void deleteDataflow(PrepDataflow dataflow) {
        if(dataflow!=null && this.dataflows!=null) {
            this.dataflows.remove(dataflow);
        }
    }

    public Integer getRefDfCount() {
        Integer dataflowCount = 0;
        if(this.dataflows!=null) {
            dataflowCount = dataflows.size();
        }
        return dataflowCount;
    }

    public List<PrepTransformRuleStringinfo> getRuleStringInfos() {
        List<PrepTransformRuleStringinfo> ruleStringinfos = Lists.newArrayList();
        if(this.transformRules!=null && 0<this.transformRules.size()) {
            for (PrepTransformRule transformRule : this.transformRules) {
                if( transformRule.getRuleNo()==0 ) { continue; } // skip the CREATE rule
                PrepTransformRuleStringinfo ruleStringinfo = new PrepTransformRuleStringinfo();
                ruleStringinfo.setRuleString(transformRule.getRuleString());
                ruleStringinfo.setValid(transformRule.isValid());
                ruleStringinfo.setRuleNo(transformRule.getRuleNo());
                ruleStringinfo.setJsonRuleString(transformRule.getJsonRuleString());
                ruleStringinfos.add(ruleStringinfo);
            }
        }
        return ruleStringinfos;
    }

    public DataFrame getGridResponse() throws PrepException {
        DataFrame dataFrame = null;

        try {
            String previewPath = getCustomValue("previewPath");
            if(null!=previewPath) {
                ObjectMapper mapper = new ObjectMapper();
                File theFile = new File(previewPath+File.separator+dsId+".df");
                if(true==theFile.exists()) {
                    dataFrame = mapper.readValue(theFile, DataFrame.class);

                    List<ColumnDescription> columnDescs = dataFrame.colDescs;
                    List<Integer> colNos = Lists.newArrayList();
                    int colIdx = 0;
                    for(ColumnDescription columnDesc : columnDescs) {
                        if(columnDesc.getType().equals(ColumnType.TIMESTAMP)){
                            colNos.add(colIdx);
                        }
                        colIdx++;
                    }

                    if(0<colNos.size()) {
                        for (Row row : dataFrame.rows) {
                            for(Integer colNo : colNos) {
                                Object jodaTime = row.get(colNo);
                                if(jodaTime instanceof LinkedHashMap) {
                                    try {
                                        LinkedHashMap mapTime = (LinkedHashMap)jodaTime;
                                        DateTime dateTime = new DateTime((Long) mapTime.get("millis"));
                                        row.objCols.set(colNo,dateTime);
                                    } catch (Exception e) {
                                        LOGGER.debug(e.getMessage());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch(Exception e) {
            LOGGER.debug(e.getMessage());
            //throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return dataFrame;
    }

    // TODO: think about LOCAL/REMOTE, HDFS, FTP later
    @JsonIgnore
    public boolean isImported() {
        return getDsType().equals(DS_TYPE.IMPORTED.name());
    }

    @JsonIgnore
    public boolean isWrangled() {
        return getDsType().equals(DS_TYPE.WRANGLED.name());
    }

    @JsonIgnore
    public boolean isFile() {
        return getImportType().equals(IMPORT_TYPE.FILE.name());
    }

    @JsonIgnore
    public boolean isHive() {
        return getImportType().equals(IMPORT_TYPE.HIVE.name());
    }

    @JsonIgnore
    public boolean isJDBC() {
        return getImportType().equals(IMPORT_TYPE.DB.name());
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

    @JsonIgnore
    private String getStringFromCustom(String key) {
        Map customObject = GlobalObjectMapper.readValue(getCustom(), Map.class);
      return (String) customObject.get(key);
    }

    @JsonIgnore
    public boolean isDSV() {
        String customFileType = getCustomValue("fileType");
        return isImported() && isFile()
          && customFileType!=null && (customFileType.equalsIgnoreCase("DSV") ||
                                      customFileType.equalsIgnoreCase("CSV"));
    }

    @JsonIgnore
    public boolean isEXCEL() {
        String customFileType = getCustomValue("fileType");
        return isImported() && isFile()
            && customFileType!=null && customFileType.equalsIgnoreCase("EXCEL");
    }

    @JsonIgnore
    public boolean isJSON() {
        String customFileType = getCustomValue("fileType");
        return isImported() && isFile()
            && customFileType!=null && customFileType.equalsIgnoreCase("JSON");
    }

    @JsonIgnore
    public String getDelimiter() {
        String delimiter = null;
        if(this.importType!=null && this.importType==IMPORT_TYPE.FILE) {
            //if(true==isDSV()) {
                delimiter = getCustomValue("delimiter");
                if(null==delimiter) {
                    delimiter = ",";
                }
            //}
        }
        return delimiter;
    }

    @JsonIgnore
    public String getSheetName() throws PrepException {
        if(this.importType!=null && this.importType==IMPORT_TYPE.FILE) {
            if(true==isEXCEL()) {
                String customSheetName = getCustomValue("sheet");
                if(null==customSheetName) {
                    String errorMsg = "dataset ["+this.dsName+"] hasn't a sheet name";
                    //throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HAS_NO_SHEET_NAME, errorMsg);
                }
                return customSheetName;
            }
        }
        return null;
    }

    @PostPersist
    void onPersist() {
    }

    @Override
    public String toString() {
        return this.getClass().getName()+"{" +
                "dsId='" + String.valueOf(dsId) + '\'' +
                ", dsName='" + dsName + '\'' +
                ", dsDesc='" + dsDesc + '\'' +
                ", custom='" + custom + '\'' +
                '}';
    }
}
