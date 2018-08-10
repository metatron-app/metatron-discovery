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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.Size;

@Entity
@Table(name = "prep_dataset_column_info")
public class PrepDatasetColumnInfo {
    @JsonFormat(shape = JsonFormat.Shape.OBJECT)
    public enum COL_TYPE {
        VARCHAR,
        INT,
        TEXT,
        BLOB,
        DATATIME,
    }

    @Id
    @Column(name = "col_no")
    Integer colNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ds_id")
    PrepDataset dataset;

    @Size(max = 255)
    @Column(name = "col_name")
    String colName;

    @Column(name = "col_type")
    @Enumerated(EnumType.STRING)
    private PrepDatasetColumnInfo.COL_TYPE colType;

    public Integer getColNo() {
        return colNo;
    }

    public void setColNo(Integer colNo) {
        this.colNo = colNo;
    }

    public PrepDataset getDataset() {
        return dataset;
    }

    public void setDataset(PrepDataset dataset) {
        this.dataset = dataset;
    }

    public String getColName() {
        return colName;
    }

    public void setColName(String colName) {
        this.colName = colName;
    }

    public String getColType() {
        if(colType==null) {
            return null;
        }
        return colType.name();
    }

    @JsonIgnore
    public COL_TYPE getColTypeEnum() {
        return colType;
    }

    public void setColType(COL_TYPE colType) {
        this.colType = colType;
    }
}


