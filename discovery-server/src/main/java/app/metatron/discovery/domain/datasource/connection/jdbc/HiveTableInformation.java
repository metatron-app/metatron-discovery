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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import com.google.common.collect.Lists;

import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SelectQueryBuilder;

public class HiveTableInformation {

  public final static String INPUT_FORMAT_PROP = "InputFormat:";
  public final static String ORC_INPUT_FORMAT = "org.apache.hadoop.hive.ql.io.orc.OrcInputFormat";
  public final static String PARQUET_INPUT_FORMAT = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat";
  public final static String TEXT_INPUT_FORMAT = "org.apache.hadoop.mapred.TextInputFormat";
  public final static String FIELD_DELIMITER_PROP = "field.delim";
  public final static String PARTITION_INFORMATION_HEADER = "# Partition Information";

  private List<Field> partitionFields;

  private List<Field> fields;

  private Map<String, Object> partitionInformation;

  private Map<String, Object> detailInformation;

  private Map<String, Object> storageInformation;

  public void generatePartitionFields(){
    if(this.partitionInformation != null){
      List<Field> partitionFields = Lists.newArrayList();
      for(String key : this.partitionInformation.keySet()){
        if(PARTITION_INFORMATION_HEADER.equals(key)){
          continue;
        }
        Field field = new Field();
        field.setName(extractColumnName(key));
        field.setType(DataType.jdbcToFieldType((String) this.partitionInformation.get(key)));
        field.setRole(field.getType().toRole());
        partitionFields.add(field);
      }
      this.setPartitionFields(partitionFields);
    }
  }

  public FileFormat getFileFormat(){
    if(this.storageInformation != null){
      String inputFormat = (String) this.storageInformation.get(INPUT_FORMAT_PROP);
      switch(inputFormat){
        case ORC_INPUT_FORMAT :
          return new OrcFileFormat();
        case PARQUET_INPUT_FORMAT :
          return new ParquetFileFormat();
        case TEXT_INPUT_FORMAT :
          String delimiter = (String) this.storageInformation.get(FIELD_DELIMITER_PROP);
          //convert tab delimiter string to character
          if("\\t".equals(delimiter)){
            delimiter = "\t";
          }
          CsvFileFormat csvFileFormat = new CsvFileFormat();
          csvFileFormat.setDelimiter(delimiter);
          return csvFileFormat;
        default:
          return null;
      }
    }
    return null;
  }

  private String extractColumnName(String name) {
    return StringUtils.removeStartIgnoreCase(name, SelectQueryBuilder.TEMP_TABLE_NAME + ".");
  }

  public List<Field> getPartitionFields() {
    return partitionFields;
  }

  public void setPartitionFields(List<Field> partitionFields) {
    this.partitionFields = partitionFields;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  public Map<String, Object> getPartitionInformation() {
    return partitionInformation;
  }

  public void setPartitionInformation(Map<String, Object> partitionInformation) {
    this.partitionInformation = partitionInformation;
    this.generatePartitionFields();
  }

  public Map<String, Object> getDetailInformation() {
    return detailInformation;
  }

  public void setDetailInformation(Map<String, Object> detailInformation) {
    this.detailInformation = detailInformation;
  }

  public Map<String, Object> getStorageInformation() {
    return storageInformation;
  }

  public void setStorageInformation(Map<String, Object> storageInformation) {
    this.storageInformation = storageInformation;
  }

  @Override
  public String toString() {
    return "HiveTableInformation{" +
            "partitionFields=" + partitionFields +
            ", fields=" + fields +
            ", partitionInformation=" + partitionInformation +
            ", detailInformation=" + detailInformation +
            ", storageInformation=" + storageInformation +
            '}';
  }
}
