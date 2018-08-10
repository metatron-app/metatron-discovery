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

package app.metatron.discovery.domain.code;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * @date        : 2016.04.22
 * @description : CommonCode
 * @author      : lKJ
 */
@Entity
@Table(name="common_code")
public class CommonCode extends AbstractHistoryEntity implements MetatronDomain<Long> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
    @GenericGenerator(name = "native", strategy = "native")
    @Column(name = "id")
    Long id;

    @Column(name="CATEGORY_CODE")
    private String categoryCode;

    @Column(name="COMMON_CODE")
    private String commonCode;

    @Column(name="COMMON_VALUE")
    private String commonValue;

    @Column(name="CATEGORY_CODE_NM")
    private String categoryCommonCodeNm;

    @Column(name="COMMON_CODE_NM")
    private String commonCodeNm;

    @Column(name="COMMON_CODE_SNO")
    int commonCodeSNO;

    @Column(name="COMMON_USE_FL")
    private String commonUseFl;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getCommonCode() {
        return commonCode;
    }

    public void setCommonCode(String commonCode) {
        this.commonCode = commonCode;
    }

    public String getCategoryCommonCodeNm() {
        return categoryCommonCodeNm;
    }

    public void setCategoryCommonCodeNm(String categoryCommonCodeNm) {
        this.categoryCommonCodeNm = categoryCommonCodeNm;
    }

    public String getCommonCodeNm() {
        return commonCodeNm;
    }

    public void setCommonCodeNm(String commonCodeNm) {
        this.commonCodeNm = commonCodeNm;
    }

    public int getCommonCodeSNO() {
        return commonCodeSNO;
    }

    public void setCommonCodeSNO(int commonCodeSNO) {
        this.commonCodeSNO = commonCodeSNO;
    }

    public String getCommonUseFl() {
        return commonUseFl;
    }

    public void setCommonUseFl(String commonUseFl) {
        this.commonUseFl = commonUseFl;
    }

    public String getCommonValue() {
        return commonValue;
    }

    public void setCommonValue(String commonValue) {
        this.commonValue = commonValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "CommonCode{" +
                "Id='" + id + '\'' +
                "categoryCode='" + categoryCode + '\'' +
                ", commonCode='" + commonCode + '\'' +
                ", categoryCommonCodeNm='" + categoryCommonCodeNm + '\'' +
                ", commonCodeNm='" + commonCodeNm + '\'' +
                ", commonCodeSNO=" + commonCodeSNO +
                ", commonUseFl='" + commonUseFl + '\'' +
                ", commonValue='" + commonValue + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
