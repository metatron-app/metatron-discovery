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

package app.metatron.discovery.domain.datasource.ingestion;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.common.datasource.DataType;

/**
 *
 */
public class IngestionOptionProjections extends BaseProjections {

  @Projection(types = IngestionOption.class, name = "default")
  public interface DefaultProjection {

    String getName();

    IngestionOption.OptionType getType();

    IngestionOption.IngestionType getIngestionType();

    DataType getDataType();

    String getDescription();

    @Value("#{target.defaultValueByType()}")
    Object getDefaultValue();

    String getEnumValues();

    Number getMin();

    Number getMax();

  }

}
