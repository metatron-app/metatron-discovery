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

package app.metatron.discovery.spec.druid.ingestion;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;

import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngetionException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.DiscardRule;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionRule;
import app.metatron.discovery.domain.datasource.ingestion.ReplaceRule;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.spec.druid.ingestion.granularity.UniformGranularitySpec;
import app.metatron.discovery.spec.druid.ingestion.parser.CsvParseSpec;
import app.metatron.discovery.spec.druid.ingestion.parser.DimensionsSpec;
import app.metatron.discovery.spec.druid.ingestion.parser.JsonParseSpec;
import app.metatron.discovery.spec.druid.ingestion.parser.Parser;
import app.metatron.discovery.spec.druid.ingestion.parser.TimeAndDimsParseSpec;
import app.metatron.discovery.spec.druid.ingestion.parser.TimestampSpec;
import app.metatron.discovery.spec.druid.ingestion.parser.TsvParseSpec;

public class AbstractSpecBuilder {

  protected FileFormat fileFormat;

  protected DataSchema dataSchema = new DataSchema();

  public void setDataSchema(DataSource dataSource) {

    // Set datasource name
    dataSchema.setDataSource(dataSource.getEngineName());

    // Set Interval Options
    List<String> intervals = null;
    if(dataSource.getIngestionInfo() instanceof HiveIngestionInfo){
      intervals = ((HiveIngestionInfo) dataSource.getIngestionInfo()).getIntervals();
    }

    // Set granularity, Default value (granularity : SECOND, segment granularity : DAY)
    UniformGranularitySpec granularitySpec = new UniformGranularitySpec(
        dataSource.getGranularity() == null ? DataSource.GranularityType.SECOND.name() : dataSource.getGranularity().name(),
        dataSource.getSegGranularity() == null ? DataSource.GranularityType.DAY.name() : dataSource.getSegGranularity().name(),
        intervals == null ? null : intervals.toArray(new String[intervals.size()]));

    // Set Roll up
    granularitySpec.setRollup(dataSource.getIngestionInfo().getRollup());

    dataSchema.setGranularitySpec(granularitySpec);

    // Set measure field
    // 1. default pre-Aggreation
    dataSchema.addMetrics(new CountAggregation("count"));

    // 2. set measure from datasource
    List<Field> measureFields = dataSource.getFieldByRole(Field.FieldRole.MEASURE);
    for(Field field : measureFields) {
      // 삭제된 필드는 추가 하지 않음
      if(BooleanUtils.isTrue(field.getRemoved())) {
        continue;
      }
      dataSchema.addMetrics(field.getAggregation());
    }

    dataSchema.setParser(makeParser(dataSource));

    for (Field field : dataSource.getFields()) {
      if(field.getIngestionRule() == null) {
        continue;
      }

      IngestionRule rule = field.getIngestionRuleObject();

      if(rule instanceof DiscardRule) {
        dataSchema.addValidation(Validation.discardNullValidation(field.getName()));
      } else if(rule instanceof ReplaceRule) {
        ReplaceRule replaceRule = (ReplaceRule) rule;
        if(replaceRule.getValue() == null) {
          continue;
        }
        dataSchema.addEvaluation(Evaluation.nullToDefaultValueEvaluation(field.getName(), replaceRule.getValue()));
      }
    }
  }

  private Parser makeParser(DataSource dataSource) {

    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

    // Set timestamp field
    List<Field> timeFields = dataSource.getFieldByRole(Field.FieldRole.TIMESTAMP);
    if(timeFields.size() != 1) {
      throw new DataSourceIngetionException("Timestamp field must be one.");
    }

    Field timeField = timeFields.get(0);

    TimestampSpec timestampSpec = new TimestampSpec();
    if(ingestionInfo instanceof HiveIngestionInfo) {
      timestampSpec.setType("hadoop");
    }
    timestampSpec.setColumn(timeField.getName());
    if(StringUtils.isEmpty(timeField.getFormat())) {
      timestampSpec.setFormat("auto");
    } else {
      timestampSpec.setFormat(timeField.getFormat());
    }

    if(timeField.getIngestionRule() != null) {
      IngestionRule rule = timeField.getIngestionRuleObject();

      if(rule instanceof ReplaceRule) {
        ReplaceRule replaceRule = (ReplaceRule) rule;
        try {
          DateTime dateTime = DateTimeFormat.forPattern(timeField.getFormat()).parseDateTime((String) replaceRule.getValue());
          timestampSpec.setMissingValue(dateTime);
          timestampSpec.setInvalidValue(dateTime);
          timestampSpec.setReplaceWrongColumn(true);
        } catch (Exception e) {
          // Log!!
        }

      }
    }

    // Set dimnesion field
    List<Field> dimensionfields  = dataSource.getFieldByRole(Field.FieldRole.DIMENSION);
    List<String> dimenstionNames = dimensionfields.stream()
                                                  // 삭제된 필드는 추가 하지 않음
                                                  .filter(field -> BooleanUtils.isNotTrue(field.getRemoved()))
                                                  .map((field) -> field.getName())
                                                  .collect(Collectors.toList());
    DimensionsSpec dimensionsSpec = new DimensionsSpec(dimenstionNames);


    this.fileFormat = ingestionInfo.getFormat() == null ? new CsvFileFormat() : ingestionInfo.getFormat();
    if(fileFormat == null) {
      throw new IllegalArgumentException("Required file format.");
    }

    boolean hadoopIngestion = ingestionInfo instanceof HdfsIngestionInfo;
    String type = hadoopIngestion ? "hadoopyString" : "string";

    Parser parser = new Parser();

    if(fileFormat instanceof CsvFileFormat) {
      // get Columns
      List<String> columns = dataSource.getFields().stream()
                                       .map((field) -> field.getName())
                                       .collect(Collectors.toList());

      CsvFileFormat csvFormat = (CsvFileFormat) fileFormat;
      if(csvFormat.isDefaultCsvMode()) {
        CsvParseSpec parseSpec = new CsvParseSpec();
        parseSpec.setTimestampSpec(timestampSpec);
        parseSpec.setDimensionsSpec(dimensionsSpec);
        parseSpec.setColumns(columns);

        parser.setType(type);
        parser.setParseSpec(parseSpec);
      } else {
        TsvParseSpec parseSpec = new TsvParseSpec();
        parseSpec.setTimestampSpec(timestampSpec);
        parseSpec.setDimensionsSpec(dimensionsSpec);
        parseSpec.setColumns(columns);
        parseSpec.setDelimiter(csvFormat.getDelimeter());
        parseSpec.setListDelimiter(csvFormat.getLineSeparator());

        parser.setType(type);
        parser.setParseSpec(parseSpec);
      }
    } else if (fileFormat instanceof JsonFileFormat) {
      JsonFileFormat jsonFileFormat = (JsonFileFormat) fileFormat;

      JsonParseSpec parseSpec = new JsonParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);
      parseSpec.setFlattenSpec(jsonFileFormat.getFlattenRules());

      parser.setType(type);
      parser.setParseSpec(parseSpec);

    } else if (fileFormat instanceof ExcelFileFormat) {
      // Csv 타입 지정으로 처리
      List<String> columns = dataSource.getFields().stream()
                                       .map((field) -> field.getName())
                                       .collect(Collectors.toList());

      CsvParseSpec parseSpec = new CsvParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);
      parseSpec.setColumns(columns);

      parser.setType(type);
      parser.setParseSpec(parseSpec);

    } else if (fileFormat instanceof OrcFileFormat) {
      TimeAndDimsParseSpec parseSpec = new TimeAndDimsParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);

      parser.setType("orc");
      parser.setParseSpec(parseSpec);
      if(ingestionInfo instanceof HiveIngestionInfo) {
        parser.setTypeString(((HiveIngestionInfo) ingestionInfo).getTypeString());
      }
    } else if (fileFormat instanceof ParquetFileFormat) {
      TimeAndDimsParseSpec parseSpec = new TimeAndDimsParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);

      parser.setType("parquet");
      parser.setParseSpec(parseSpec);

    } else {
      throw new IllegalArgumentException("Not supported format.");
    }

    return parser;
  }
}
