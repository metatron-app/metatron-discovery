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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "pr_dataflow")
public class PrDataflow extends AbstractHistoryEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "df_id")
    private String dfId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "pr_dataflow_dataset",
            joinColumns = @JoinColumn(name = "df_id", referencedColumnName="df_id"),
            inverseJoinColumns = @JoinColumn(name = "ds_id", referencedColumnName="ds_id"))
    private List<PrDataset> datasets;

    @Size(max = 2000)
    @Column(name = "df_name", nullable = false)
    private String dfName;

    @Lob
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

    public List<PrDataset> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<PrDataset> datasets) {
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

    public boolean addDataset(PrDataset dataset) {
        if(dataset!=null) {
            if(this.datasets==null) {
                this.datasets = new ArrayList<PrDataset>();
            }
            for(PrDataset ds : this.datasets) {
                if(ds.getDsId()==dataset.getDsId()) {
                    return false;
                }
            }
            this.datasets.add(dataset);
            return true;
        }
        return false;
    }

    public void deleteDataset(PrDataset dataset) {
        if(dataset!=null && this.datasets!=null) {
            this.datasets.remove(dataset);
        }
    }

    @JsonIgnore
    public Map<String,Integer> getDatasetCountByType() {
        Map<String,Integer> countMap = null;
        if(this.datasets!=null) {
            countMap = new HashMap<String,Integer>();
            for(PrDataset pd : this.datasets) {
                String key = pd.getDsType().name();
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
    public Integer getDsCountByType(PrDataset.DS_TYPE type) {
        Integer count = 0;
        if(this.datasets!=null) {
            for(PrDataset pd : this.datasets) {
                PrDataset.DS_TYPE dsType = pd.getDsType();
                if(null!=dsType && dsType==type) {
                    count++;
                }
            }
        }
        return count;
    }

    public Integer getImportedDsCount() {
        return this.getDsCountByType(PrDataset.DS_TYPE.IMPORTED);
    }

    public Integer getWrangledDsCount() {
        return this.getDsCountByType(PrDataset.DS_TYPE.WRANGLED);
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


