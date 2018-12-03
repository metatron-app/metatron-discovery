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

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import com.fasterxml.jackson.annotation.*;
import org.hibernate.annotations.GenericGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "pr_dataset")
public class PrDataset extends AbstractHistoryEntity {
    private static final Logger LOGGER = LoggerFactory.getLogger(PrDataset.class);

    // Enumerators
    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum DS_TYPE {
        IMPORTED,
        WRANGLED;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum IMPORT_TYPE {
        UPLOAD,
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
    public enum STORAGE_TYPE {
        LOCAL,
        HDFS,
        S3,
        BLOB,
        FTP;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum FILE_FORMAT {
        CSV,
        EXCEL,
        JSON;

        @JsonValue
        public String toJson() {
            return name();
        }
    }

    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum RS_TYPE {
        TABLE,
        QUERY;

        @JsonValue
        public String toJson() {
            return name();
        }
    }


    // Attributes

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "ds_id")
    String dsId;

    @Lob
    @Column(name = "serialized_preview")
    String serializedPreview;

    @Size(max = 2000)
    @Column(name = "ds_name", nullable = false)
    private String dsName;

    @Lob
    @Column(name = "ds_desc")
    private String dsDesc;

    @JsonBackReference
    @ManyToMany(mappedBy = "datasets", fetch = FetchType.LAZY, cascade = {CascadeType.MERGE,CascadeType.REFRESH,CascadeType.DETACH})
    private List<PrDataflow> dataflows;

    @Column(name = "ds_type")
    @Enumerated(EnumType.STRING)
    private PrDataset.DS_TYPE dsType;

    @Column(name = "import_type")
    @Enumerated(EnumType.STRING)
    private PrDataset.IMPORT_TYPE importType;

    @Lob
    @Column(name = "stored_uri")
    private String storedUri;

    @Lob
    @Column(name = "filename_before_upload")
    private String filenameBeforeUpload;

    @Column(name = "total_lines")
    private Long totalLines;

    @Column(name = "total_bytes")
    private Long totalBytes;

    @Size(max = 255)
    @Column(name = "dc_id")
    private String dcId;

    @Column(name = "rs_type")
    @Enumerated(EnumType.STRING)
    private PrDataset.RS_TYPE rsType;

    @Size(max = 255)
    @Column(name = "db_name")
    private String dbName;

    @Size(max = 255)
    @Column(name = "tbl_name")
    private String tblName;

    @Lob
    @Column(name = "query_stmt")
    String queryStmt;

    @JsonIgnore
    @OneToMany(mappedBy="dataset", fetch=FetchType.LAZY, cascade = {CascadeType.REMOVE})
    private List<PrTransformRule> transformRules;

    @Size(max = 255)
    @Column(name = "creator_df_id")
    private String creatorDfId;

    @Size(max = 2000)
    @Column(name = "creator_df_name")
    private String creatorDfName;

    @Column(name = "rule_cur_idx")
    private Integer ruleCurIdx;

    @Size(max = 2000)
    @Column(name = "sheet_name")
    private String sheetName;

    @Column(name = "file_format")
    @Enumerated(EnumType.STRING)
    private PrDataset.FILE_FORMAT fileFormat;

    @Column(name = "delimiter")
    private String delimiter;

    @Lob
    @Column(name = "custom")
    private String custom;

    @Transient
    DataFrame gridResponse;

    @Transient
    Map<String,Object> connectionInfo;

    public boolean addDataflow(PrDataflow dataflow) {
        if(dataflow!=null) {
            if(this.dataflows==null) {
                this.dataflows = new ArrayList<PrDataflow>();
            }
            for(PrDataflow df : this.dataflows) {
                if(df.getDfId()==dataflow.getDfId()) {
                    return false;
                }
            }
            this.dataflows.add(dataflow);
            return true;
        }
        return false;
    }

    public void deleteDataflow(PrDataflow dataflow) {
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

    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }

    public String getSerializedPreview() {
        return serializedPreview;
    }

    public void setSerializedPreview(String serializedPreview) {
        this.serializedPreview = serializedPreview;
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

    public List<PrDataflow> getDataflows() {
        return dataflows;
    }

    public void setDataflows(List<PrDataflow> dataflows) {
        this.dataflows = dataflows;
    }

    public DS_TYPE getDsType() {
        return dsType;
    }

    public void setDsType(DS_TYPE dsType) {
        this.dsType = dsType;
    }

    public IMPORT_TYPE getImportType() {
        return importType;
    }

    public void setImportType(IMPORT_TYPE importType) {
        this.importType = importType;
    }

    public String getStoredUri() {
        return storedUri;
    }

    public void setStoredUri(String storedUri) {
        this.storedUri = storedUri;
    }

    public String getFilenameBeforeUpload() {
        return filenameBeforeUpload;
    }

    public void setFilenameBeforeUpload(String filenameBeforeUpload) {
        this.filenameBeforeUpload = filenameBeforeUpload;
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

    public String getDcId() {
        return dcId;
    }

    public void setDcId(String dcId) {
        this.dcId = dcId;
    }

    public RS_TYPE getRsType() {
        return rsType;
    }

    public void setRsType(RS_TYPE rsType) {
        this.rsType = rsType;
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

    public String getQueryStmt() {
        return queryStmt;
    }

    public void setQueryStmt(String queryStmt) {
        this.queryStmt = queryStmt;
    }

    // WARNING: You should call prepareTransformRules() before call this. Or you'll get NULL jsonRuleStrings or shortRuleStrings.
    public List<PrTransformRule> getTransformRules() {
        return transformRules;
    }

    public void setTransformRules(List<PrTransformRule> transformRules) {
        this.transformRules = transformRules;
    }

    public String getCreatorDfId() {
        return creatorDfId;
    }

    public void setCreatorDfId(String creatorDfId) {
        this.creatorDfId = creatorDfId;
    }

    public String getCreatorDfName() {
        return creatorDfName;
    }

    public void setCreatorDfName(String creatorDfName) {
        this.creatorDfName = creatorDfName;
    }

    public Integer getRuleCurIdx() {
        return ruleCurIdx;
    }

    public void setRuleCurIdx(Integer ruleCurIdx) {
        this.ruleCurIdx = ruleCurIdx;
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public FILE_FORMAT getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(FILE_FORMAT fileFormat) {
        this.fileFormat = fileFormat;
    }

    public String getDelimiter() {
        return delimiter;
    }

    public void setDelimiter(String delimiter) {
        this.delimiter = delimiter;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public DataFrame getGridResponse() {
        return gridResponse;
    }

    public void setGridResponse(DataFrame gridResponse) {
        this.gridResponse = gridResponse;
    }

    public Map<String, Object> getConnectionInfo() {
        return connectionInfo;
    }

    public void setConnectionInfo(Map<String, Object> connectionInfo) {
        this.connectionInfo = connectionInfo;
    }

    // Temporary functions for backward compatibility
    /*
    public STORAGE_TYPE getStorageType() {
        String lowerStoredUri = getStoredUri();
        if(lowerStoredUri.startsWith("file:")) {
            return STORAGE_TYPE.LOCAL;
        } else if(lowerStoredUri.startsWith("hdfs:")) {
            return STORAGE_TYPE.HDFS;
        } else if(lowerStoredUri.startsWith("s3:")) {
            return STORAGE_TYPE.S3;
        } else if(lowerStoredUri.startsWith("blob:")) {
            return STORAGE_TYPE.BLOB;
        } else if(lowerStoredUri.startsWith("ftp:")) {
            return STORAGE_TYPE.FTP;
        }

        return null;
    }
    */
}
