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

package app.metatron.discovery.util;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.FileValidationResponse;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.monitorjbl.xlsx.StreamingReader;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.joda.time.DateTime;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ExcelProcessor {

  File targetFile;

  Workbook workbook;

  String extensionType;

  private static int MAX_HEADER_NAME = 50;

  public ExcelProcessor(File targetFile) throws IOException {

    this.targetFile = targetFile;

    extensionType = FilenameUtils.getExtension(targetFile.getName());

    if ("xls".equals(extensionType)) {       // 97~2003
      workbook = new HSSFWorkbook(new FileInputStream(targetFile));
    } else {   // 2007 ~
      // old POI library
      // workbook = new XSSFWorkbook(new FileInputStream(targetFile));
      InputStream is = new FileInputStream(targetFile);
      workbook = StreamingReader.builder()
              .rowCacheSize(100)
              .bufferSize(4096)
              .open(is);
    }

  }

  public Map<String, FileValidationResponse> getSheetNames() {

    Map<String, FileValidationResponse> sheetNames = Maps.newLinkedHashMap();
    int sheetCount = workbook.getNumberOfSheets();

    for (int i = 0; i < sheetCount; i++) {
      for ( Row row : workbook.getSheetAt(i)) {
        sheetNames.put(workbook.getSheetAt(i).getSheetName(), validateHeaders(row));
        break;
      }
    }

    return sheetNames;

  }

  public IngestionDataResultResponse getSheetData(String sheetName, int limit, boolean firstHeaderRow) throws IOException {

    int sheetIndex = workbook.getSheetIndex(sheetName);

    Sheet sheet = workbook.getSheetAt(sheetIndex);
    // shiftRows() and getPhysicalNumberOfRows() is unsupported method of StreamingSheet
    /*
    int totalRows = sheet.getPhysicalNumberOfRows();
    if (firstHeaderRow) {
      // 헤더를 제외한 데이터 수
      totalRows--;
    } else {
      createHeaderRow(sheet);
    }
    */
    IngestionDataResultResponse resultResponse = getResultSetFromSheet(sheet, limit, firstHeaderRow);

    //resultResponse.setTotalRows(totalRows);

    return resultResponse;
  }

  private void createHeaderRow(Sheet sheet) {
    sheet.shiftRows(0, sheet.getLastRowNum(), 1);

    Row row = sheet.createRow(0);
    for (int i = 0; i < sheet.getRow(1).getPhysicalNumberOfCells(); i++) {
      Cell cell = row.createCell(i);
      cell.setCellValue("field_" + (i + 1));
    }
  }

  public IngestionDataResultResponse getResultSetFromSheet(Sheet sheet, int limit, boolean firstHeaderRow) {

    List<Map<String, Object>> resultSet = Lists.newArrayList();
    List<Field> fields = Lists.newArrayList();
    // 병합의 이슈로 컬럼 정보는 Column Index
    Map<Integer, String> columnMap = Maps.newTreeMap();

    FileValidationResponse isParsable = new FileValidationResponse(true);

    long rowCnt = 0;
    for (Row row : sheet) {

      if (limit > 0 && rowCnt > limit) {
        rowCnt++;
        continue;
      }

      Map<String, Object> rowMap = Maps.newTreeMap();
      for (Cell cell : row) { // 열구분
        int columnIndex = cell.getColumnIndex();
        if (rowCnt == 0) {
          String value;
          if(firstHeaderRow) {
            value = PolarisUtils.objectToString(getCellValue(cell), "col" + columnIndex);
            if (getCellValue(cell) == null) { // Check header is merged.
              isParsable.setValid(false);
              isParsable.setWarning(FileValidationResponse.WarningType.HEADER_MERGED.getCode());
            }
            columnMap.put(columnIndex, value);
            fields.add(makeField(columnIndex, value, cell));
          } else {
            value = "field_" + (columnIndex+1);
            columnMap.put(columnIndex, value);
            fields.add(makeField(columnIndex, value, cell));

            rowMap.put(columnMap.get(columnIndex), getCellValue(cell));
          }
        } else {
          if (columnMap.containsKey(columnIndex)) {
            rowMap.put(columnMap.get(columnIndex), getCellValue(cell));
          }
        }
      }

      if (rowCnt > 0 || false==firstHeaderRow) {
        resultSet.add(rowMap);
      }

      rowCnt++;

    }

    if (firstHeaderRow && 0<rowCnt) {
      rowCnt = rowCnt - 1;
    }

    return new IngestionDataResultResponse(fields, resultSet, rowCnt, isParsable);
  }

  private FileValidationResponse validateHeaders(Row row) {

    //TODO: Disable null, long, duplicated header validation. Discussed on #1057.
    // It will be refactor after datasource schema validation is adapted.

/*
    Set<String> bounder = new HashSet<>();

    if (row.getLastCellNum() != row.getPhysicalNumberOfCells()) {
      return new FileValidationResponse(false,
          FileValidationResponse.WarningType.NULL_HEADER.getCode());
    }
*/
    for ( Cell cell : row ) {
/*
      if (cell.getStringCellValue().length() > MAX_HEADER_NAME) {
        return new FileValidationResponse(false,
            FileValidationResponse.WarningType.TOO_LONG_HEADER.getCode());
      }

      if (bounder.contains(cell.getStringCellValue())) {
        return new FileValidationResponse(false,
            FileValidationResponse.WarningType.DUPLICATED_HEADER.getCode());
      }
*/
      if (getCellValue(cell) == null) {
        return new FileValidationResponse(false,
            FileValidationResponse.WarningType.HEADER_MERGED.getCode());
      }
//      bounder.add(cell.getStringCellValue());
    }
    return new FileValidationResponse(true);
  }

  private Field makeField(int idx, String fieldName, Cell dataCell) {
    DataType fieldType;
    Field.FieldRole fieldRole;

    switch (dataCell.getCellTypeEnum()) {
      case STRING:
        fieldType = DataType.TEXT;
        fieldRole = Field.FieldRole.DIMENSION;
        break;
      case NUMERIC:
        if (DateUtil.isCellDateFormatted(dataCell)) {
          fieldType = DataType.TIMESTAMP;
          fieldRole = Field.FieldRole.DIMENSION;
        } else {
          fieldType = DataType.DOUBLE;
          fieldRole = Field.FieldRole.MEASURE;
        }
        break;
      case BOOLEAN:
        fieldType = DataType.BOOLEAN;
        fieldRole = Field.FieldRole.DIMENSION;
        break;
      case FORMULA:
        switch (dataCell.getCachedFormulaResultTypeEnum()) {
          case NUMERIC:
            if (DateUtil.isCellDateFormatted(dataCell)) { //날짜데이터 포멧설정
              fieldType = DataType.TIMESTAMP;
              fieldRole = Field.FieldRole.DIMENSION;
            } else {
              fieldType = DataType.DOUBLE;
              fieldRole = Field.FieldRole.MEASURE;
            }
            break;
          case BOOLEAN:
            fieldType = DataType.BOOLEAN;
            fieldRole = Field.FieldRole.DIMENSION;
            break;
          default:
            fieldType = DataType.TEXT;
            fieldRole = Field.FieldRole.DIMENSION;
            break;
        }
        break;
      default:
        fieldType = DataType.TEXT;
        fieldRole = Field.FieldRole.DIMENSION;
    }

    return new Field(fieldName, fieldType, fieldRole, new Long(idx + 1));
  }

  public static Object getCellValue(Cell cell) {

    Object cellValue = null;

    switch (cell.getCellTypeEnum()) {
      case FORMULA:
        switch (cell.getCachedFormulaResultTypeEnum()) {
          case NUMERIC:
            if (DateUtil.isCellDateFormatted(cell)) { //날짜데이터 포멧설정
              cellValue = new DateTime(cell.getDateCellValue().getTime()).toString();
            } else {
              cellValue = cell.getNumericCellValue();
            }
            break;
          case STRING:
            cellValue = cell.getStringCellValue();
            break;
          case BLANK:
            cellValue = null;
            break;
          case BOOLEAN:
            cellValue = cell.getBooleanCellValue();
            break;
          case ERROR:
            cellValue = cell.getErrorCellValue();
            break;
        }
        break;
      case NUMERIC:
        if (DateUtil.isCellDateFormatted(cell)) { //날짜데이터 포멧설정
          cellValue = new DateTime(cell.getDateCellValue().getTime()).toString();
        } else {
          cellValue = cell.getNumericCellValue();
        }
        break;
      case STRING:
        cellValue = cell.getStringCellValue();
        break;
      case BLANK:
        cellValue = null;
        break;
      case BOOLEAN:
        cellValue = cell.getBooleanCellValue();
        break;
      case ERROR:
        cellValue = cell.getErrorCellValue();
        break;
    }

    return cellValue;

  }

  //  private String getCellValue(Cell cell) {
  //    String v = null;
  //
  //    switch (cell.getCellType()) {
  //      case Cell.CELL_TYPE_STRING:
  //        v = cell.getRichStringCellValue().getString();
  //        break;
  //      case Cell.CELL_TYPE_NUMERIC:
  //        if (DateUtil.isCellDateFormatted(cell)) {
  //          v = new DateTime(cell.getDateCellValue().getTime()).toString();
  //        } else {
  //          v = String.valueOf(cell.getNumericCellValue());
  //        }
  //        break;
  //      case Cell.CELL_TYPE_BOOLEAN:
  //        v = String.valueOf(cell.getBooleanCellValue());
  //        break;
  //      case Cell.CELL_TYPE_FORMULA:
  //        v = cell.getCellFormula();
  //        break;
  //      default:
  //    }
  //    return v;
  //  }
}
