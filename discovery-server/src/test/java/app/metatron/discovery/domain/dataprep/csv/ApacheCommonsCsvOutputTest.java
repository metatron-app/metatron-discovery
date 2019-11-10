package app.metatron.discovery.domain.dataprep.csv;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.hadoop.conf.Configuration;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.file.PrepParseResult;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;

import static app.metatron.discovery.domain.dataprep.file.PrepFileUtil.getReader;

public class ApacheCommonsCsvOutputTest {

  // utility functions for building URIs, paths
  public static String buildPathToTestOutputDir(String relpath) {
    return String.format("%s/src/test/resources/test_output/%s", System.getProperty("user.dir"), relpath);
  }

  public static String buildStrUrlFromResourceDir(String relpath) {
    return String.format("file://%s/src/test/resources/%s", System.getProperty("user.dir"), relpath);
  }

  @Test
  public void test_basic_output() {
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

  private void useCSVPrinter(DataFrame df, String strUri, Configuration conf) {
    CSVPrinter printer = PrepCsvUtil.DEFAULT.withHadoopConf(conf).getPrinter(strUri);
    String errmsg = null;

    try {
      for (int rowno = 0; rowno < df.rows.size(); ++rowno) {
        Row row = df.rows.get(rowno);
        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          printer.print(row.get(colno));
        }
        printer.println();
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      printer.close(true);
    } catch (IOException e) {
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV,
              e.getMessage());
    }

    if (errmsg != null) {
      throw PrepException
              .create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }
  }

  private void cat(String strUri, Configuration conf) {
    PrepParseResult result = new PrepParseResult();
    Reader reader = getReader(strUri, conf, false, result);
    BufferedReader br = new BufferedReader(reader);

    try {
      for (String line = br.readLine(); line != null; line = br.readLine()) {
        System.out.println(line);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Test
  public void test_minimal_quote_mode_and_quote_escaped() {
    String strUri = buildStrUrlFromResourceDir("csv/minimal_quote_mode_and_quote_escaped.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }

  @Test
  public void test_all_non_null_quote_mode_and_quote_escaped() {
    String strUri = buildStrUrlFromResourceDir("csv/sale.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }

  @Test
  public void test_minimal_quote_mode_and_multi_line() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }

  @Test
  public void test_minimal_quote_mode_and_multi_line_with_bs_escape() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line_with_bs_escape.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }

  @Test
  public void test_minimal_quote_mode_and_multi_line_with_unmatched_bs_escape() {
    String strUri = buildStrUrlFromResourceDir("csv/multi_line_with_unmatched_bs_escape.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }

  @Test
  public void test_unstructured() {
    String strUri = buildStrUrlFromResourceDir("csv/unstructured.csv");
    cat(strUri, null);

    PrepParseResult result = PrepCsvUtil.DEFAULT.parse(strUri);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }
}
