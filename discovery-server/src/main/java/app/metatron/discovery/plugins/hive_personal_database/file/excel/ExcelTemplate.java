package app.metatron.discovery.plugins.hive_personal_database.file.excel;

import com.google.common.collect.Lists;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ExcelTemplate {
  private static Logger LOGGER = LoggerFactory.getLogger(ExcelTemplate.class);
  private Workbook workbook;

  public ExcelTemplate(File targetFile) throws IOException {
    if ("xls".equals(FilenameUtils.getExtension(targetFile.getName()))) {       // 97~2003
      this.workbook = new HSSFWorkbook(new FileInputStream(targetFile));
    } else {   // 2007 ~
      // old POI library
      workbook = new XSSFWorkbook(new FileInputStream(targetFile));
    }
  }

  public <T> List<T> getRows(String sheetName, ExcelRowMapper<T> rowMapper) {
    return this.getRows(sheetName, rowMapper, -1);
  }

  public <T> List<T> getRows(String sheetName, ExcelRowMapper<T> rowMapper, int limit) {
    int sheetIndex = 0;
    if(StringUtils.isNotEmpty(sheetName)) {
      sheetIndex = workbook.getSheetIndex(sheetName);
    }

    Sheet sheet = workbook.getSheetAt(sheetIndex);

    List<T> rows = new ArrayList<>();
    int rowNumber = 1;
    for (Row row : sheet) {
      if((rowNumber - 1) == limit) {
        break;
      }

      T mappedRow = rowMapper.mapRow(rowNumber, row);
      if (mappedRow != null) {
        rows.add(rowMapper.mapRow(rowNumber, row));
      }

      rowNumber++;
    }
    return rows;
  }

  public int getTotalRows(String sheetName) {
    int sheetIndex = 0;
    if(StringUtils.isNotEmpty(sheetName)) {
      sheetIndex = workbook.getSheetIndex(sheetName);
    }

    Sheet sheet = workbook.getSheetAt(sheetIndex);
    return sheet.getLastRowNum() + 1;
  }

  public List<String> getSheetNames() {
    List<String> sheetNames = Lists.newArrayList();
    int sheetsCount = workbook.getNumberOfSheets();
    for (int i = 0; i < sheetsCount; i++) {
      sheetNames.add(workbook.getSheetAt(i).getSheetName());
    }

    return sheetNames;
  }

  public FormulaEvaluator getFormulaEvaluator() {
    try {
      return workbook.getCreationHelper().createFormulaEvaluator();
    } catch (Exception e) {
      LOGGER.error("error : createFormulaEvaluator", e);
      return null;
    }
  }
}
