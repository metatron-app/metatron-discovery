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
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "prep_dataflow")
public class PrepDataflow extends AbstractHistoryEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "df_id")
    private String dfId;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE})
    @JoinTable(name = "prep_dataflow_dataset",
            joinColumns = @JoinColumn(name = "df_id", referencedColumnName="df_id"),
            inverseJoinColumns = @JoinColumn(name = "ds_id", referencedColumnName="ds_id"))
    private List<PrepDataset> datasets;

    @Size(max = 128)
    @Column(name = "df_name", nullable = false)
    private String dfName;

    @Size(max = 256)
    @Column(name = "df_desc")
    private String dfDesc;

    @Lob
    @Column(name = "custom")
    private String custom;

    public String getDfId() {
        return dfId;
    }

    public void setDfId(String dfId) {
        this.dfId = dfId;
    }

    public List<PrepDataset> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<PrepDataset> datasets) {
        this.datasets = datasets;
    }

    public String getDfName() {
        return dfName;
    }

    public void setDfName(String dfName) {
        this.dfName = dfName;
    }

    public String getDfDesc() {
        return dfDesc;
    }

    public void setDfDesc(String dfDesc) {
        this.dfDesc = dfDesc;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }

    public boolean addDataset(PrepDataset dataset) {
        if(dataset!=null) {
            if(this.datasets==null) {
                this.datasets = new ArrayList<PrepDataset>();
            }
            for(PrepDataset ds : this.datasets) {
                if(ds.getDsId()==dataset.getDsId()) {
                    return false;
                }
            }
            this.datasets.add(dataset);
            return true;
        }
        return false;
    }

    public void deleteDataset(PrepDataset dataset) {
        if(dataset!=null && this.datasets!=null) {
            this.datasets.remove(dataset);
        }
    }

    @JsonIgnore
    public Map<String,Integer> getDatasetCountByType() {
        Map<String,Integer> countMap = null;
        if(this.datasets!=null) {
            countMap = new HashMap<String,Integer>();
            for(PrepDataset pd : this.datasets) {
                String key = pd.getDsType();
                if(null!=key) {
                    Integer value = countMap.get(key);
                    if(null==value) {
                        value = 0;
                    }
                    value++;
                    countMap.put(key,value);
                }
            }
        }
        return countMap;
    }

    @JsonIgnore
    public Integer getDsCountByType(PrepDataset.DS_TYPE type) {
        Integer count = 0;
        if(this.datasets!=null) {
            for(PrepDataset pd : this.datasets) {
                PrepDataset.DS_TYPE dsType = pd.getDsTypeForEnum();
                if(null!=dsType && dsType==type) {
                    count++;
                }
            }
        }
        return count;
    }

    public Integer getImportedDsCount() {
        return this.getDsCountByType(PrepDataset.DS_TYPE.IMPORTED);
    }

    public Integer getWrangledDsCount() {
        return this.getDsCountByType(PrepDataset.DS_TYPE.WRANGLED);
    }

    @Override
    public String toString() {
        return this.getClass().getName()+"{" +
                "dfId='" + String.valueOf(dfId) + '\'' +
                ", dfName='" + dfName + '\'' +
                ", dfDesc='" + dfDesc + '\'' +
                ", custom='" + custom + '\'' +
                '}';
    }
}


