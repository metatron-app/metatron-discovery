package app.metatron.discovery.util.excel;

import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.*;

public class ExcelTemplateTest {

  @Test
  public void getRows() throws IOException {
    // given
    final String filePath = getClass().getClassLoader().getResource("sales-product.xlsx").getPath();
    ExcelTemplate excelTemplate = new ExcelTemplate(new File(filePath));
    final String sheetName = "sales";
    final boolean firstHeaderRow = true;

    // when
    final DataFormatter formatter = new DataFormatter();
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, String>> rows = excelTemplate.getRows(sheetName, (rowNumber, row) -> {
      if (rowNumber == 1) {
        if (firstHeaderRow) {
          for (Cell cell : row) {
            headers.put(cell.getColumnIndex(), StringUtils.defaultString(cell.getStringCellValue(), "col_" + (cell.getColumnIndex() + 1)));
          }
          return null;
        } else {
          for (Cell cell : row) {
            headers.put(cell.getColumnIndex(), "col_" + (cell.getColumnIndex() + 1));
          }
        }
      }

      Map<String, String> rowMap = Maps.newTreeMap();
      for (Cell cell : row) {
        if (headers.containsKey(cell.getColumnIndex())) {
          rowMap.put(headers.get(cell.getColumnIndex()), formatter.formatCellValue(cell));
        }

      }
      return rowMap;
    });

    // then
    assertThat(headers).hasSize(5);
    assertThat(headers).containsValues("time", "order_id", "amount", "product_id", "sale_count");

    assertThat(rows).hasSize(9);
    assertThat(rows).extracting("time").contains("20/04/2017", "21/04/2017", "22/04/2017", "23/04/2017", "24/04/2017", "25/04/2017", "26/04/2017", "27/04/2017", "28/04/2017");
    assertThat(rows).extracting("order_id").contains("1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat(rows).extracting("amount").contains("20", "300", "400", "550", "129", "212", "412", "412", "2111");
    assertThat(rows).extracting("product_id").contains("1", "1", "2", "2", "3", "3", "4", "4", "5");
    assertThat(rows).extracting("sale_count").contains("1", "2", "3", "4", "1", "2", "3", "4", "5");
  }

  @Test
  public void getRows_when_limit() throws IOException {
    // given
    final String filePath = getClass().getClassLoader().getResource("sales-product.xlsx").getPath();
    ExcelTemplate excelTemplate = new ExcelTemplate(new File(filePath));
    final String sheetName = "sales";
    final boolean firstHeaderRow = true;

    // when
    final DataFormatter formatter = new DataFormatter();
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, String>> rows = excelTemplate.getRows(sheetName, (rowNumber, row) -> {
      if (rowNumber == 1) {
        if (firstHeaderRow) {
          for (Cell cell : row) {
            headers.put(cell.getColumnIndex(), StringUtils.defaultString(cell.getStringCellValue(), "col_" + (cell.getColumnIndex() + 1)));
          }
          return null;
        } else {
          for (Cell cell : row) {
            headers.put(cell.getColumnIndex(), "col_" + (cell.getColumnIndex() + 1));
          }
        }
      }

      Map<String, String> rowMap = Maps.newTreeMap();
      for (Cell cell : row) {
        if (headers.containsKey(cell.getColumnIndex())) {
          rowMap.put(headers.get(cell.getColumnIndex()), formatter.formatCellValue(cell));
        }

      }
      return rowMap;
    }, 3);

    // then
    assertThat(headers).hasSize(5);
    assertThat(headers).containsValues("time", "order_id", "amount", "product_id", "sale_count");

    assertThat(rows).hasSize(2);
    assertThat(rows).extracting("time").contains("20/04/2017", "21/04/2017");
    assertThat(rows).extracting("order_id").contains("1", "2");
    assertThat(rows).extracting("amount").contains("20", "300");
    assertThat(rows).extracting("product_id").contains("1", "1");
    assertThat(rows).extracting("sale_count").contains("1", "2");
  }

  @Test
  public void getTotalRows() throws IOException {
    // given
    final String filePath = getClass().getClassLoader().getResource("sales-product.xlsx").getPath();
    ExcelTemplate excelTemplate = new ExcelTemplate(new File(filePath));
    final String sheetName = "sales";

    // when
    int totalRows = excelTemplate.getTotalRows(sheetName);

    // then
    assertThat(totalRows).isEqualTo(10);
  }
}