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

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.dataprep.PrepDataset;

@Entity
@IdClass(PrepTransitionId.class)
@Table(name = "prep_transition")
public class PrepTransition {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ds_id")
    private PrepDataset dataset;

    @Id
    @Column(name = "change_no", nullable = false)
    private int changeNo = 0;

    @Column(name = "ds_revision", nullable = false)
    private int dsRevision = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "op", nullable = false)
    private PrepDataset.OP_TYPE op = PrepDataset.OP_TYPE.NOT_USED;

    @Size(max = 4000)
    @Column(name = "rule_string")
    private String ruleString;

    @Column(name = "rule_cur_idx_before", nullable = false)
    private int ruleCurIdxBefore = -2;

    @Column(name = "rule_cur_idx_after", nullable = false)
    private int ruleCurIdxAfter = -1;

    @Column(name = "rule_cnt_before", nullable = false)
    private int ruleCntBefore = 0;

    @Column(name = "rule_cnt_after", nullable = false)
    private int ruleCntAfter = 0;

    @Column(name = "src_idx", nullable = false)
    private int srcIdx = -1;

    @Column(name = "dst_idx", nullable = false)
    private int dstIdx = 0;

    public PrepTransition() { }

    public PrepTransition(PrepDataset dataset, PrepDataset.OP_TYPE op) {
      this.dataset = dataset;
      this.op = op;
    }

    public PrepDataset getDataset() {
        return dataset;
    }

    public void setDataset(PrepDataset dataset) {
        this.dataset = dataset;
    }

    public int getChangeNo() {
        return changeNo;
    }

    public void setChangeNo(int changeNo) {
        this.changeNo = changeNo;
    }

    public int getDsRevision() {
        return dsRevision;
    }

    public void setDsRevision(int revision) {
        this.dsRevision = revision;
    }

    public PrepDataset.OP_TYPE getOp() {
        return op;
    }

    public void setOp(PrepDataset.OP_TYPE op) {
        this.op = op;
    }

    public String getRuleString() {
        return ruleString;
    }

    public void setRuleString(String ruleString) {
        this.ruleString = ruleString;
    }

    public int getRuleCurIdxBefore() {
        return ruleCurIdxBefore;
    }

    public void setRuleCurIdxBefore(int ruleCurIdxBefore) {
        this.ruleCurIdxBefore = ruleCurIdxBefore;
    }

    public int getRuleCurIdxAfter() {
        return ruleCurIdxAfter;
    }

    public void setRuleCurIdxAfter(int ruleCurIdxAfter) {
        this.ruleCurIdxAfter = ruleCurIdxAfter;
    }

    public int getRuleCntBefore() {
        return ruleCntBefore;
    }

    public void setRuleCntBefore(int ruleCntBefore) {
        this.ruleCntBefore = ruleCntBefore;
    }

    public int getRuleCntAfter() {
        return ruleCntAfter;
    }

    public void setRuleCntAfter(int ruleCntAfter) {
        this.ruleCntAfter = ruleCntAfter;
    }

    public int getSrcIdx() {
        return srcIdx;
    }

    public void setSrcIdx(int srcIdx) {
        this.srcIdx = srcIdx;
    }

    public int getDstIdx() {
        return dstIdx;
    }

    public void setDstIdx(int dstIdx) {
        this.dstIdx = dstIdx;
    }

    @Override
    public String toString() {
        return "PrepTransition{" +
          "dataset=" + dataset +
          ", changeNo=" + changeNo +
          ", dsRevision=" + dsRevision +
          ", op=" + op +
          ", ruleString='" + ruleString + '\'' +
          ", ruleCurIdxBefore=" + ruleCurIdxBefore +
          ", ruleCurIdxAfter=" + ruleCurIdxAfter +
          ", ruleCntBefore=" + ruleCntBefore +
          ", ruleCntAfter=" + ruleCntAfter +
          ", srcIdx=" + srcIdx +
          ", dstIdx=" + dstIdx +
          '}';
    }
}
