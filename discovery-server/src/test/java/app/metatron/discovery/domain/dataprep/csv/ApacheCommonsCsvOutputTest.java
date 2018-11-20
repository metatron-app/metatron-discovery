package app.metatron.discovery.domain.dataprep.csv;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.Test;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil.getReaderAfterDetectingCharset;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

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

  /**
   * @param df          DataFrame to write out
   * @param strUri      URI as String (to be java.net.URI)
   * @param colNames    If not null (for FILE snapshots), print as a header.
   *
   *  colNames is null for StagingDB snapshots.
   */
  private void writeCsv(DataFrame df, String strUri, List<String> colNames) {
    FileWriter writer = null;
    CSVPrinter printer = null;

//    try {
//      writer = new FileWriter(buildPathToTestOutputDir("ApacheCommonsCsvInputTest.csv"), false);    // append = false
//    } catch (IOException e) {
//      e.printStackTrace();
//    }

//    try {
//      printer = new CSVPrinter(writer, CSVFormat.RFC4180);
//    } catch (IOException e) {
//      e.printStackTrace();
//    }
  }

  private void useCSVPrinter(DataFrame df, String strUri, Configuration conf) {
    CSVPrinter printer = PrepCsvUtil.getPrinter(strUri, conf);
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
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }
  }

  private void cat(String strUri, Configuration conf) {
    Reader reader;
    URI uri;

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataInputStream his;
        try {
          his = hdfsFs.open(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_HDFS_PATH, strUri);
        }

        reader = PrepCsvUtil.getReaderAfterDetectingCharset(his, strUri);
        break;

      case "file":
        File file = new File(uri);

        FileInputStream fis;
        try {
          fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        reader = getReaderAfterDetectingCharset(fis, strUri);
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
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

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, null);
    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();

    strUri = buildStrUrlFromResourceDir("test_output/test_csv_printer.csv");
    useCSVPrinter(df, strUri, null);
    cat(strUri, null);
  }
}
