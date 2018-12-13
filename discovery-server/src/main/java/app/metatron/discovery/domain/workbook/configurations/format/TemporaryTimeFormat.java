/*
 *
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
package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;

public class TemporaryTimeFormat extends TimeFieldFormat implements FieldFormat {

    @JsonCreator
    public TemporaryTimeFormat() {
    }

    @Override
    public String getFormat() {
        return DEFAULT_DATETIME_FORMAT;
    }

    @Override
    public String getSortFormat() {
        return null;
    }

    @Override
    public boolean enableSortField() {
        return false;
    }

    @Override
    public String getSortComparator() {
        return null;
    }
}