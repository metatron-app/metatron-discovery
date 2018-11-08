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

import app.metatron.discovery.domain.dataprep.PrepDataset;

import javax.persistence.*;

@Entity
@IdClass(PrepTransformRuleId.class)
@Table(name = "prep_transform_rule")
public class PrepTransformRule {
    @Id
    @Column(name = "rule_no", nullable = false)
    private Integer ruleNo;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ds_id")
    private PrepDataset dataset;

    @Lob
    @Column(name = "rule_string", nullable = false)
    private String ruleString;

    @Column(name = "is_valid", nullable = false)
    private boolean isValid = true;

    @Column(columnDefinition = "TEXT", name = "json_rule_string")
    private String jsonRuleString;

    @Column(columnDefinition = "TEXT", name = "custom")
    private String custom;

    public  PrepTransformRule() {}

    public PrepTransformRule(PrepDataset dataset, Integer ruleNo, String ruleString) {
        this.dataset = dataset;
        this.ruleNo = ruleNo;
        this.ruleString = ruleString;
    }

    public Integer getRuleNo() {
        return ruleNo;
    }

    public void setRuleNo(Integer ruleNo) {
        this.ruleNo = ruleNo;
    }

    public PrepDataset getDataset() {
        return dataset;
    }

    public void setDataset(PrepDataset dataset) {
        this.dataset = dataset;
    }

    public String getRuleString() {
        return ruleString;
    }

    public void setRuleString(String ruleString) {
        this.ruleString = ruleString;
    }

    public boolean isValid() {
        return isValid;
    }

    public void setValid(boolean valid) {
        isValid = valid;
    }

    public String getJsonRuleString() {
        return jsonRuleString;
    }

    public void setJsonRuleString(String jsonRuleString) {
        this.jsonRuleString = jsonRuleString;
    }

    public String getCustom() {
        return custom;
    }

    public void setCustom(String custom) {
        this.custom = custom;
    }
}



