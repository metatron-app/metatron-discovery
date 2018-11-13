package app.metatron.discovery.domain.dataprep.csv;

import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ApacheCommonsCsvInputTest {

  // utility functions for building URIs, paths
  public static String buildPathToTestOutputDir(String relpath) {
    return String.format("%s/src/test/resources/test_output/%s", System.getProperty("user.dir"), relpath);
  }

  public static String buildStrUrlFromResourceDir(String relpath) {
    return String.format("file://%s/src/test/resources/%s", System.getProperty("user.dir"), relpath);
  }


  @Test
  public void test_basic() {
    FileWriter writer = null;
    CSVPrinter printer = null;

    try {
      writer = new FileWriter(buildPathToTestOutputDir("ApacheCommonsCsvInputTest.csv"), false);    // append = false
    } catch (IOException e) {
      e.printStackTrace();
    }

    try {
      printer = new CSVPrinter(writer, CSVFormat.RFC4180);
    } catch (IOException e) {
      e.printStackTrace();
    }

    List<Object> rows = new ArrayList();
    rows.add(new ArrayList(Arrays.asList("id", "userName", "firstName", "lastName", "birthday")));
    rows.add(new ArrayList(Arrays.asList(1, "john73", "John", "Doe", "1973-09-15")));
    rows.add(new ArrayList(Arrays.asList(2, "mary", "Mary", "Meyer", "1985-03-29")));

    try {
      for (Object row : rows) {
        printer.printRecord((List<Object>) row);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    try {
      printer.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void test_with_df() {
    String strUri = buildStrUrlFromResourceDir("csv/sale.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }

  @Test
  public void test_bom() {
    String strUri = buildStrUrlFromResourceDir("csv/sale_bom16.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }

  // TODO: revive the below test after alleviating the column name limitation. (DataFrame.assertParsible)
//  @Test
//  public void test_bom_and_header() {
//    String strUri = buildStrUrlFromResourceDir("csv/sale_bom16.csv");
//    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 30, null, true);
//    DataFrame df = new DataFrame();
//    df.setByGrid(result);
//    df.show();
//  }

  @Test
  public void test_unstructured() {
    String strUri = buildStrUrlFromResourceDir("csv/unstructured.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show(50);
  }

  @Test
  public void test_multi_line() {
    String strUri = buildStrUrlFromResourceDir("csv/multi-line.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 6);
  }

  @Test
  public void test_multi_line_escape() {
    String strUri = buildStrUrlFromResourceDir("csv/multi-line_escape.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 6);
    assertTrue(result.grid.get(4)[7].contains("\"quote\""));
  }

  @Test
  public void test_unmatched_quotes() {
    String strUri = buildStrUrlFromResourceDir("csv/unmatched_quotes.csv");
    PrepCsvParseResult result = PrepCsvUtil.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 6);
  }
}
