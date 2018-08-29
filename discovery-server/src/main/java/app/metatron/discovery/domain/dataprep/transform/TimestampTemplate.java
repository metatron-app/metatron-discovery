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

public enum TimestampTemplate {
    DATE_TIME_01("yyyy-MM-dd HH:mm:ss"),
    DATE_TIME_02("yyyy-MM-dd HH:mm:ssz"),
    DATE_TIME_03("yyyy-MM-dd HH:mm:ssZ"),
    DATE_TIME_04("yyyy-MM-dd HH:mm:ssZZ"),
    DATE_TIME_05("yyyy-MM-dd HH:mm:ssZZZ"),
    DATE_TIME_06("yyyy-MM-dd HH:mm:ss.SSS"),
    DATE_TIME_07("yyyy-MM-dd HH:mm:ss.SSSz"),
    DATE_TIME_08("yyyy-MM-dd HH:mm:ss.SSSZ"),
    DATE_TIME_09("yyyy-MM-dd HH:mm:ss.SSSZZ"),
    DATE_TIME_10("yyyy-MM-dd HH:mm:ss.SSSZZZ"),
    DATE_TIME_11("yyyy-MM-dd'T'HH:mm:ss"),
    DATE_TIME_12("yyyy-MM-dd'T'HH:mm:ssz"),
    DATE_TIME_13("yyyy-MM-dd'T'HH:mm:ssZ"),
    DATE_TIME_14("yyyy-MM-dd'T'HH:mm:ssZZ"),
    DATE_TIME_15("yyyy-MM-dd'T'HH:mm:ssZZZ"),
    DATE_TIME_16("yyyy-MM-dd'T'HH:mm:ss.SSSz"),
    DATE_TIME_17("yyyy-MM-dd'T'HH:mm:ss.SSSZ"),
    DATE_TIME_18("yyyy-MM-dd'T'HH:mm:ss.SSSZZ"),
    DATE_TIME_19("yyyy-MM-dd'T'HH:mm:ss.SSSZZZ"),

    DATE_ONLY_01("yy-MM-dd"),
    DATE_ONLY_02("yy-MMM-dd"),
    DATE_ONLY_03("MM-dd-yy"),
    DATE_ONLY_04("MMM-dd-yy"),
    DATE_ONLY_05("dd-MM-yy"),
    DATE_ONLY_06("dd-MMM-yy"),
    DATE_ONLY_07("yyyy.MM.dd."),
    DATE_ONLY_08("yyyy.MM.dd"),
    DATE_ONLY_09("MM.dd.yyyy"),
    DATE_ONLY_10("MMM.dd.yyyy"),
    DATE_ONLY_11("yyyy. MM. dd."),
    DATE_ONLY_12("yyyy. MM. dd"),
    DATE_ONLY_13("MM. dd. yyyy"),
    DATE_ONLY_14("MMM. dd. yyyy"),
    DATE_ONLY_15("yyyy/MM/dd"),
    DATE_ONLY_16("yyyy-MM-dd"),
    DATE_ONLY_17("yyyy-MMM-dd"),
    DATE_ONLY_18("MM-dd-yyyy"),
    DATE_ONLY_19("MMM-dd-yyyy"),
    DATE_ONLY_20("dd-MM-yyyy"),
    DATE_ONLY_21("dd-MMM-yyyy"),

    TIME_ONLY_01("HH:mm:ss.SSS"),
    TIME_ONLY_02("HH:mm:ss"),
    TIME_ONLY_03("HH:mm");

    private String format;
    TimestampTemplate(String format) {
        this.format = format;
    }
    public String getFormat() {
        return format;
    }
    public String getFormatForRuleString(){
        return format.replace("'", "\\'");
    }

}
