package app.metatron.discovery.domain.idcube.security.imsi;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.idcube.security.imsi.adapter.CipherAdapter;
import app.metatron.discovery.domain.workbench.WorkbenchException;
import app.metatron.discovery.util.ApplicationContextProvider;
import app.metatron.discovery.util.BeanUtils;
import app.metatron.discovery.util.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.supercsv.cellprocessor.*;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvMapReader;
import org.supercsv.io.CsvMapWriter;
import org.supercsv.io.ICsvMapReader;
import org.supercsv.io.ICsvMapWriter;
import org.supercsv.prefs.CsvPreference;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static app.metatron.discovery.domain.workbench.WorkbenchErrorCodes.CSV_FILE_NOT_FOUND;

public class ImsiCipher {
  private static final Logger LOGGER = LoggerFactory.getLogger(ImsiCipher.class);
  private static final String CIPHER_FIELD_POSTFIX = "_암복호화";
  private static final int PROCESS_MAX_ROW = 10000;
  final private String cipherType;
  final private String csvBaseDir;
  final private String csvFile;
  final private List<Field> fields;
  final private String targetField;

  public ImsiCipher(String cipherType, String csvBaseDir, String csvFile, List<Field> fields, String targetField) {
    if(fields.stream().filter(field -> field.getName().equalsIgnoreCase(targetField)).findFirst().isPresent() == false) {
      throw new MetatronException("Not found target field in fields");
    }

    this.cipherType = cipherType;
    this.csvBaseDir = csvBaseDir;
    this.csvFile = csvFile;
    this.fields = fields;
    this.targetField = targetField;
  }

  public List<Map<String, Object>> encryptOrDecrypt() {
    final String csvFilePath = this.csvBaseDir + this.csvFile;
    List<Map<String, Object>> allOfValues = new ArrayList<>();
    List<String> allOfEncryptOrDecryptedValues = new ArrayList<>();
    // 암복호화 API 제약으로 1만건씩 잘라서 처리한다.
    int index = 0;
    while(true) {
      List<Map<String, Object>> values = readCsv(csvFilePath, this.fields, index, (PROCESS_MAX_ROW - 1));
      if(values == null || values.size() == 0) {
        break;
      }
      List<String> collectData = values.stream().map(value -> String.valueOf(value.get(this.targetField))).collect(Collectors.toList());
      // 데이터 암복호화 API 호출
      CipherAdapter adapter = ApplicationContextProvider.getApplicationContext().getBean(CipherAdapter.class);
      List<String> encryptOrDecryptedData = adapter.encryptOrDecrypt(this.cipherType, collectData);
      if(values.size() != encryptOrDecryptedData.size()) {
        LOGGER.error("원 데이터와 암복호화 데이터의 크기가 다릅니다. : " + values.size() + ", " + encryptOrDecryptedData.size());
        throw new MetatronException("원 데이터와 암복호화 데이터의 크기가 다릅니다.");
      }

      allOfValues.addAll(values);
      allOfEncryptOrDecryptedValues.addAll(encryptOrDecryptedData);
      index += PROCESS_MAX_ROW;
    }

    Field originalField = fields.stream().filter(field -> field.getName().equalsIgnoreCase(targetField)).findFirst().get();
    Field newField = new Field();
    BeanUtils.copyPropertiesNullAware(newField, originalField);
    newField.setName(originalField.getName() + CIPHER_FIELD_POSTFIX);
    newField.setLogicalName(originalField.getLogicalName() + CIPHER_FIELD_POSTFIX);
    newField.setOriginalName(originalField.getOriginalName() + CIPHER_FIELD_POSTFIX);
    newField.setType(DataType.STRING);
    this.fields.add(newField);

    for(int i = 0; i < allOfValues.size(); i++) {
      allOfValues.get(i).put(this.targetField + CIPHER_FIELD_POSTFIX, allOfEncryptOrDecryptedValues.get(i));
    }

    return allOfValues;
  }

  public String writeToCSV(List<Map<String, Object>> data) {
    final String newCsvFileName = FilenameUtils.getBaseName(this.csvFile) + "_imsi." + FilenameUtils.getExtension(this.csvFile);
    final String csvFilePath = this.csvBaseDir + newCsvFileName;
    FileUtils.deleteFile(csvFilePath);

    ICsvMapWriter mapWriter = null;
    try {
      mapWriter = new CsvMapWriter(new FileWriter(csvFilePath),
          CsvPreference.STANDARD_PREFERENCE);

      final CellProcessor[] processors = getProcessors(this.fields);

      // write the header
      final String[] header = this.fields.stream().map(field -> field.getName()).toArray(String[]::new);

      mapWriter.writeHeader(header);

      // write the customer maps
      for(Map<String, Object> row : data) {
        mapWriter.write(row, header, processors);
      }
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if( mapWriter != null ) {
        try {
          mapWriter.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

    return newCsvFileName;
  }

  public List<Map<String, Object>> readCsv(String fileName, List<Field> fieldList, int index, int length) {
    ICsvMapReader mapReader = null;
    List<Map<String, Object>> returnList = new ArrayList<>();
    try {
      mapReader = new CsvMapReader(new FileReader(fileName)
          , new CsvPreference.Builder('"', ',', "\r\n")
          .ignoreEmptyLines(false)
          .build());

      // the header columns are used as the keys to the Map
      final String[] header = mapReader.getHeader(true);

      Map<String, Object> rowMap;
      while ((rowMap = mapReader.read(header, getProcessors(fieldList))) != null && mapReader.getRowNumber() - 1 < index + length + 1) {
        if (mapReader.getRowNumber() - 1 > index) {
          returnList.add(rowMap);
        }
      }
    } catch (FileNotFoundException e) {
      throw new WorkbenchException(CSV_FILE_NOT_FOUND, "CSV File Not Founded.", e);
    } catch (IOException e) {
      throw new WorkbenchException(CSV_FILE_NOT_FOUND, "read CSV IOException.", e);
    } finally {
      try {
        if (mapReader != null)
          mapReader.close();
      } catch (Exception e) {
      }
    }
    return returnList;
  }

  private CellProcessor[] getProcessors(List<Field> fieldList) {
    List<CellProcessor> cellProcessorList = new ArrayList<>();
    for (Field field : fieldList) {
      switch (field.getType()) {
        case INTEGER:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseInt()));
          break;
        case DECIMAL:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseBigDecimal()));
          break;
        case DOUBLE:
        case FLOAT:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseDouble()));
          break;
        case LONG:
        case NUMBER:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseLong()));
          break;
        case BOOLEAN:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseBool()));
          break;
        default:
          cellProcessorList.add(new Optional());
          break;
      }
    }
    return cellProcessorList.toArray(new CellProcessor[]{});
  }
}

