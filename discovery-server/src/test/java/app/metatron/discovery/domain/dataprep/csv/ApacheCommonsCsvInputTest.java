package app.metatron.discovery.domain.dataprep.csv;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.file.PrepParseResult;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import org.junit.Test;

public class ApacheCommonsCsvInputTest {

  // utility functions for building URIs, paths
  public static String buildStrUrlFromResourceDir(String relpath) {
    return String.format("file://%s/src/test/resources/%s", System.getProperty("user.dir"), relpath);
  }


  @Test
  public void test_with_df() {
    String strUri = buildStrUrlFromResourceDir("csv/sale.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }

  @Test
  public void test_bom() {
    String strUri = buildStrUrlFromResourceDir("csv/sale_bom16.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }

  @Test
  public void test_bom_and_header() {
    String strUri = buildStrUrlFromResourceDir("csv/sale_bom16.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 30, null, true);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }

  @Test
  public void test_unstructured() {
    String strUri = buildStrUrlFromResourceDir("csv/unstructured.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show(50);
  }

  @Test
  public void test_multi_line() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 6);
  }

  @Test
  public void test_multi_line_escape() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line_with_bs_escape.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 5);
    assertTrue(result.grid.get(4)[7].contains("\"quote\""));
  }

  @Test
  public void test_multi_line_unmatched() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line_with_bs_escape.csv");
    PrepParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null, null, true, false);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    assertEquals(result.grid.size(), 4);
    assertTrue(result.grid.get(3)[7].contains("\"quote\""));
  }
}
