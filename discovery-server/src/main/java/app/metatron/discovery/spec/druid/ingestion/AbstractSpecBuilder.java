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

import com.google.common.collect.Maps;

import org.apache.commons.lang3.BooleanUtils;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.rule.EvaluationRule;
import app.metatron.discovery.domain.datasource.ingestion.rule.IngestionRule;
import app.metatron.discovery.domain.datasource.ingestion.rule.ReplaceNullRule;
import app.metatron.discovery.domain.datasource.ingestion.rule.ValidationRule;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoPointFormat;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.RelayAggregation;
import app.metatron.discovery.spec.druid.ingestion.granularity.UniformGranularitySpec;
import app.metatron.discovery.spec.druid.ingestion.index.LuceneIndexStrategy;
import app.metatron.discovery.spec.druid.ingestion.index.LuceneIndexing;
import app.metatron.discovery.spec.druid.ingestion.index.SecondaryIndexing;
import app.metatron.discovery.spec.druid.ingestion.parser.*;

public class AbstractSpecBuilder {

  protected FileFormat fileFormat;

  protected DataSchema dataSchema = new DataSchema();

  protected boolean useGeoIngestion;

  protected Map<String, SecondaryIndexing> secondaryIndexing = Maps.newLinkedHashMap();

  public void setDataSchema(DataSource dataSource) {

    // Set datasource name
    dataSchema.setDataSource(dataSource.getEngineName());

    // Use ingestion rule and field format
    for (Field field : dataSource.getFields()) {

      if (field.getDerivationRule() != null) {
        addRule(field.getName(), field.getDerivationRuleObject());
      }

      if (field.getIngestionRule() != null) {
        addRule(field.getName(), field.getIngestionRuleObject());
      }

      FieldFormat fieldFormat = field.getFormatObject();
      if (fieldFormat != null) {
        if (fieldFormat instanceof GeoFormat) {
          useGeoIngestion = true;
          GeoFormat geoFormat = (GeoFormat) fieldFormat;
          makeSecondaryIndexing(field.getName(), field.getType(), geoFormat);
          addGeoFieldToMatric(field.getName(), field.getType(), geoFormat);
        }
      }
    }

    // Set Interval Options
    List<String> intervals = null;
    if (dataSource.getIngestionInfo() instanceof HiveIngestionInfo) {
      intervals = ((HiveIngestionInfo) dataSource.getIngestionInfo()).getIntervals();
    }

    // Set granularity, Default value (granularity : SECOND, segment granularity : DAY)
    UniformGranularitySpec granularitySpec = new UniformGranularitySpec(
        dataSource.getGranularity() == null ? DataSource.GranularityType.SECOND.name() : dataSource.getGranularity().name(),
        dataSource.getSegGranularity() == null ? DataSource.GranularityType.DAY.name() : dataSource.getSegGranularity().name(),
        intervals == null ? null : intervals.toArray(new String[intervals.size()]));

    // Set Roll up
    if (useGeoIngestion) {
      granularitySpec.setRollup(false);
    } else {
      granularitySpec.setRollup(dataSource.getIngestionInfo().getRollup());
    }

    dataSchema.setGranularitySpec(granularitySpec);

    if (!useGeoIngestion) {
      // Set measure field
      // 1. default pre-Aggreation
      dataSchema.addMetrics(new CountAggregation("count"));
    }

    // 2. set measure from datasource
    List<Field> measureFields = dataSource.getFieldByRole(Field.FieldRole.MEASURE);
    for (Field field : measureFields) {
      // 삭제된 필드는 추가 하지 않음
      if (BooleanUtils.isTrue(field.getUnloaded())) {
        continue;
      }
      dataSchema.addMetrics(field.getAggregation(useGeoIngestion));
    }

    dataSchema.setParser(makeParser(dataSource));

  }

  private void addRule(String name, IngestionRule rule) {
    if (rule instanceof ValidationRule) {
      ValidationRule validationRule = (ValidationRule) rule;
      dataSchema.addValidation(validationRule.toValidation(name));
    } else if (rule instanceof EvaluationRule) {
      EvaluationRule evaluationRule = (EvaluationRule) rule;
      dataSchema.addEvaluation(evaluationRule.toEvaluation(name));
    }
  }

  private void makeSecondaryIndexing(String name, DataType originalType, GeoFormat geoFormat) {
    String originalSrsName = geoFormat.notDefaultSrsName();
    if (geoFormat instanceof GeoPointFormat || (originalType == DataType.STRUCT)) {
      secondaryIndexing.put(name, new LuceneIndexing(new LuceneIndexStrategy.LatLonStrategy("coord", "lat", "lon", originalSrsName)));
    } else {
      secondaryIndexing.put(name, new LuceneIndexing(new LuceneIndexStrategy.ShapeStrategy("shape", "WKT", geoFormat.getMaxLevels())));
    }
  }

  private void addGeoFieldToMatric(String name, DataType originalType, GeoFormat geoFormat) {
    if (geoFormat instanceof GeoPointFormat || (originalType == DataType.STRUCT)) {
      dataSchema.addMetrics(new RelayAggregation(name, "struct(lat:double,lon:double)"));
    } else {
      dataSchema.addMetrics(new RelayAggregation(name, "string"));
    }
  }

  private Parser makeParser(DataSource dataSource) {

    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

    // Set timestamp field
    List<Field> timeFields = dataSource.getFieldByRole(Field.FieldRole.TIMESTAMP);
    if (timeFields.size() != 1) {
      throw new DataSourceIngestionException("[Building Spec] : Timestamp field must be one.");
    }

    Field timeField = timeFields.get(0);

    TimestampSpec timestampSpec = timeField.createTimestampSpec();

    if (ingestionInfo instanceof HiveIngestionInfo) {
      timestampSpec.setType("hadoop");
    }

    if (timeField.getIngestionRule() != null) {
      IngestionRule rule = timeField.getIngestionRuleObject();

      if (rule instanceof ReplaceNullRule) {
        ReplaceNullRule replaceRule = (ReplaceNullRule) rule;
        try {
          DateTime dateTime = DateTimeFormat.forPattern(timeField.getTimeFormat()).parseDateTime((String) replaceRule.getValue());
          timestampSpec.setMissingValue(dateTime);
          timestampSpec.setInvalidValue(dateTime);
          timestampSpec.setReplaceWrongColumn(true);
        } catch (Exception e) {
          throw new DataSourceIngestionException("[Building Spec] : The datetime format does not match the value to be replaced.", e);
        }

      }
    }

    // Set dimnesion field
    List<Field> dimensionfields = dataSource.getFieldByRole(Field.FieldRole.DIMENSION);
    List<String> dimenstionNames = dimensionfields.stream()
                                                  // 삭제된 필드는 추가 하지 않음
                                                  .filter(field -> BooleanUtils.isNotTrue(field.getUnloaded()) && !field.isGeoType())
                                                  .map((field) -> field.getName())
                                                  .collect(Collectors.toList());
    DimensionsSpec dimensionsSpec = new DimensionsSpec(dimenstionNames);


    this.fileFormat = ingestionInfo.getFormat() == null ? new CsvFileFormat() : ingestionInfo.getFormat();
    if (fileFormat == null) {
      throw new IllegalArgumentException("Required file format.");
    }

    Parser parser;

    if (fileFormat instanceof CsvFileFormat || fileFormat instanceof ExcelFileFormat) {

      // get Columns
      List<String> columns = dataSource.getFields().stream()
                                       .filter(field -> BooleanUtils.isNotTrue(field.getDerived()))
                                       .map((field) -> field.getName())
                                       .collect(Collectors.toList());

      CsvStreamParser csvStreamParser = new CsvStreamParser();

      if ( ingestionInfo instanceof LocalFileIngestionInfo ) {
        boolean skipHeaderRow = ((LocalFileIngestionInfo) ingestionInfo).getRemoveFirstRow();
        csvStreamParser.setSkipHeaderRecord(skipHeaderRow);
      }

      if (fileFormat instanceof CsvFileFormat){

        CsvFileFormat csvFormat = (CsvFileFormat) fileFormat;

        if (!csvFormat.isDefaultCsvMode()) {
          csvStreamParser.setTimestampSpec(timestampSpec);
          csvStreamParser.setDimensionsSpec(dimensionsSpec);
          csvStreamParser.setColumns(columns);
          csvStreamParser.setDelimiter(csvFormat.getDelimeter());

          parser = csvStreamParser;
        } else {
          csvStreamParser.setTimestampSpec(timestampSpec);
          csvStreamParser.setDimensionsSpec(dimensionsSpec);
          csvStreamParser.setColumns(columns);
          csvStreamParser.setDelimiter(csvFormat.getDelimeter());

          parser = csvStreamParser;
        }
      } else {
        csvStreamParser.setTimestampSpec(timestampSpec);
        csvStreamParser.setDimensionsSpec(dimensionsSpec);
        csvStreamParser.setColumns(columns);

        parser = csvStreamParser;
      }

    } else if (fileFormat instanceof JsonFileFormat) {
      JsonFileFormat jsonFileFormat = (JsonFileFormat) fileFormat;

      JsonParseSpec parseSpec = new JsonParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);
      parseSpec.setFlattenSpec(jsonFileFormat.getFlattenRules());

      parser = new StringParser(parseSpec);

    } else if (fileFormat instanceof OrcFileFormat) {
      TimeAndDimsParseSpec parseSpec = new TimeAndDimsParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);

      OrcParser orcParser = new OrcParser(parseSpec);

      if (ingestionInfo instanceof HiveIngestionInfo) {
        orcParser.setTypeString(((HiveIngestionInfo) ingestionInfo).getTypeString());
      }
      parser = orcParser;

    } else if (fileFormat instanceof ParquetFileFormat) {
      TimeAndDimsParseSpec parseSpec = new TimeAndDimsParseSpec();
      parseSpec.setTimestampSpec(timestampSpec);
      parseSpec.setDimensionsSpec(dimensionsSpec);

      parser = new ParquetParser(parseSpec);

    } else {
      throw new IllegalArgumentException("Not supported format.");
    }

    return parser;
  }
}
