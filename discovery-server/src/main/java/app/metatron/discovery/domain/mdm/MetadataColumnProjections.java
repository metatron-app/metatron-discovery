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

package app.metatron.discovery.domain.mdm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

public class MetadataColumnProjections extends BaseProjections {

  @Projection(types = MetadataColumn.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getPhysicalType();

    String getPhysicalName();

    String getName();

    String getDescription();

    Long getSeq();
  }

  @Projection(types = MetadataColumn.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getPhysicalType();

    String getPhysicalName();

    String getName();

    String getDescription();

    @Value("#{@metadataPopularityService.getPopularityColumnValue(target.id)}")
    Double getPopularity();

    LogicalType getType();

    Field.FieldRole getRole();

    ColumnDictionary getDictionary();

    CodeTable getCodeTable();

    @Value("#{target.getFieldFormat()}")
    FieldFormat getFormat();

    Long getSeq();
  }

  @Projection(types = MetadataColumn.class, name = "forDictionaryListView")
  public interface ForDictionaryListViewProjection {

    String getId();

    String getPhysicalType();

    String getPhysicalName();

    String getName();

    String getDescription();

    LogicalType getType();

    @Value("#{target.metadata.id}")
    String getMetadataId();

    @Value("#{target.metadata.name}")
    String getMetadataName();

    @Value("#{target.metadata.sourceType}")
    Metadata.SourceType getMetadataSourceType();

    @Value("#{target.metadata.source}")
    MetadataSource getMetadataSource();

    Long getSeq();
  }

}
