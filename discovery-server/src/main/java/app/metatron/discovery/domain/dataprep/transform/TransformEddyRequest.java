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

package app.metatron.discovery.domain.dataprep.transform;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import app.metatron.discovery.domain.dataprep.PrepDataset;

/**
 * Created by seungunchoe on 2017. 7. 3..
 */
public class TransformEddyRequest implements Serializable {
    List<String> rules;

    boolean stackStages;

    String dsId;

    @JsonIgnore
    PrepDataset prepdataset;

    @JsonIgnore
    ArrayList<PrepDataset> arrayPrepdataset;

    public TransformEddyRequest() {
        this.stackStages = true;
    }

    public TransformEddyRequest(List<String> rules, PrepDataset prepdataset) {
        this.rules = rules;
        this.stackStages = true;
        this.prepdataset = prepdataset;
    }

    public List<String> getRules() {
        return rules;
    }

    public void setRules(List<String> rules) {
        this.rules = rules;
    }

    public boolean isStackStages() {
        return stackStages;
    }

    public void setStackStages(boolean stackStages) {
        this.stackStages = stackStages;
    }

    public PrepDataset getDataset() {
        return prepdataset;
    }

    public void setDataset(PrepDataset prepdataset) {
        this.prepdataset = prepdataset;
    }

    public ArrayList<PrepDataset> getArrayPrepdataset() {
        return arrayPrepdataset;
    }

    public void setArrayPrepdataset(ArrayList<PrepDataset> arrayPrepdataset) {
        this.arrayPrepdataset = arrayPrepdataset;
    }

    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }
}
