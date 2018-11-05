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

import com.google.common.collect.Lists;

import org.joda.time.DateTime;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Created by kyungtaak on 2016. 2. 25..
 */
public class PolarisUtilsTest {

  @Test
  public void objectToString() {
   Object o1 = null;
   Assert.assertEquals("test", PolarisUtils.objectToString(o1, "test"));

   Object o2 = 1.0;
   Assert.assertEquals("1.0", PolarisUtils.objectToString(o2, ""));

   Object o3 = "";
   Assert.assertEquals("abc", PolarisUtils.objectToString(o3, "abc"));

   Object o4 = "def";
   Assert.assertEquals("def", PolarisUtils.objectToString(o4, "abc"));
  }

  @Test
  public void addTimestampColumnFromCsv() {
    String inputFileName = "/tmp/test.csv";
    String outputFileName = "/tmp/test_convert.csv";

    String dateStr = DateTime.now().toString();

    System.out.println(PolarisUtils.addTimestampColumnFromCsv(dateStr, inputFileName, outputFileName));
  }


    @Test
  public void findPathParams() {
    String url = "/abc/{}/{wow}/{cd}";

    List<String> pathParams = PolarisUtils.findPathParams(url);

    Assert.assertThat(pathParams.size(), is(2));
    Assert.assertThat(pathParams.get(0), is("wow"));
    Assert.assertThat(pathParams.get(1), is("cd"));

  }

  @Test
  public void findMatchedValues() {
//    String url = "(a == '3') || (a==4)";
    String url = "(Region=='West' && City=='Seattle')";

    Pattern p = Pattern.compile("City\\s*==\\s*'*([^\\s)']+)");

    List<String> values = PolarisUtils.findMatchedValues(url, p);

    System.out.println(values);

  }

  @Test
  public void matchFormatPattern() {
    String format11 = "%s-KT";
    Assert.assertTrue(PolarisUtils.match(PolarisUtils.PATTERN_TEXT_FORMAT, format11));

    String format12 = "[%s]";
    Assert.assertTrue(PolarisUtils.match(PolarisUtils.PATTERN_TEXT_FORMAT, format12));

    String format13 = "%&&s";
    Assert.assertFalse(PolarisUtils.match(PolarisUtils.PATTERN_TEXT_FORMAT, format13));

    String format21 = "%02d";
    Assert.assertTrue(PolarisUtils.match(PolarisUtils.PATTERN_NUMBER_FORMAT, format21));

    String format22 = "%d";
    Assert.assertTrue(PolarisUtils.match(PolarisUtils.PATTERN_NUMBER_FORMAT, format22));

  }

  @Test
  public void dataLoadFromTempFileForXlsFileCase() {
    File file = new File("src/main/resources/lookupdata/cm_branch.xls");
    List<Map<String, String>> resultSet = PolarisUtils.dataLoadFromTempFile(file);

    System.out.println(resultSet);
  }

  @Test
  public void dataLoadFromTempFileForXlsxFileCase() {
    File file = new File("src/main/resources/lookupdata/cm_branch.xlsx");
    List<Map<String, String>> resultSet = PolarisUtils.dataLoadFromTempFile(file);

    System.out.println(resultSet);
  }

  @Test
  public void getResultSetCaseGroupBy() {
    String result = "[  ]";

    List<?> resultSet = PolarisUtils.makeResponseResult(result);

    System.out.println(resultSet);
  }

  @Test
  public void checkMediaTypeFromFileName() {
    String fileName = "test.PNG";

    System.out.println(PolarisUtils.checkMediaTypeFromFileName(fileName));
  }

  @Test
  public void findHourMinute() {
    String normal1 = "03:00";
    assertEquals(Lists.newArrayList(3, 0), PolarisUtils.findHourMinute(normal1));

    String normal2 = "9:30";
    assertEquals(Lists.newArrayList(9, 30), PolarisUtils.findHourMinute(normal2));

    String normal3 = "12:3";
    assertEquals(Lists.newArrayList(12, 3), PolarisUtils.findHourMinute(normal3));

    assertEquals(Lists.newArrayList(0, 0), PolarisUtils.findHourMinute(null));

    String abnormal1 = "003:00";
    assertEquals(Lists.newArrayList(0, 0), PolarisUtils.findHourMinute(abnormal1));

    String abnormal2 = "25:13";
    assertEquals(Lists.newArrayList(0, 0), PolarisUtils.findHourMinute(abnormal2));

    String abnormal3 = "3:70";
    assertEquals(Lists.newArrayList(0, 0), PolarisUtils.findHourMinute(abnormal3));
  }

  @Test
  public void getFileName() {
    assertEquals("", PolarisUtils.getFileName("/"));
    assertEquals("", PolarisUtils.getFileName("////"));
    assertEquals("", PolarisUtils.getFileName("//C//.//../"));
    assertEquals("", PolarisUtils.getFileName("C//.//../"));
    assertEquals("C", PolarisUtils.getFileName("C"));
    assertEquals("C", PolarisUtils.getFileName("~/C"));
    assertEquals("C", PolarisUtils.getFileName("/C"));
    assertEquals("C", PolarisUtils.getFileName("/C/"));
    assertEquals("C", PolarisUtils.getFileName("//C//"));
    assertEquals("C", PolarisUtils.getFileName("/A/B/C/"));
    assertEquals("C", PolarisUtils.getFileName("/A/B/C"));
    assertEquals("C", PolarisUtils.getFileName("/C/./B/../"));
    assertEquals("C", PolarisUtils.getFileName("//C//./B//..///"));
    assertEquals("user", PolarisUtils.getFileName("/user/java/.."));
    assertEquals("C:", PolarisUtils.getFileName("C:"));
    assertEquals("C:", PolarisUtils.getFileName("/C:"));
    assertEquals("java", PolarisUtils.getFileName("C:\\Program Files (x86)\\java\\bin\\.."));
    assertEquals("C.ext", PolarisUtils.getFileName("/A/B/C.ext"));
    assertEquals("C.ext", PolarisUtils.getFileName("C.ext"));
  }

  @Test
  public void displayMemSizeToByte() {
    assertEquals(2 * 1024 * 1024 * 1024L, PolarisUtils.displayMemSizeToByte("2g"));
    assertEquals(2 * 1024 * 1024 * 1024L, PolarisUtils.displayMemSizeToByte("2 g"));
    assertEquals(2 * 1024 * 1024 * 1024L, PolarisUtils.displayMemSizeToByte("2G"));
    assertEquals(2 * 1024 * 1024L, PolarisUtils.displayMemSizeToByte("2m"));
    assertEquals(2 * 1024 * 1024L, PolarisUtils.displayMemSizeToByte("2M"));
    assertEquals(1024 * 1024L, PolarisUtils.displayMemSizeToByte("2gb"));
    assertEquals(1024 * 1024L, PolarisUtils.displayMemSizeToByte(null));
    assertEquals(1024 * 1024L, PolarisUtils.displayMemSizeToByte(""));
  }

  @Test
  public void escapeSpecialRegexChars() {
    assertEquals("", PolarisUtils.escapeSpecialRegexChars(null));
    assertEquals("\\*", PolarisUtils.escapeSpecialRegexChars("*"));
    assertEquals("\\.", PolarisUtils.escapeSpecialRegexChars("."));
    assertEquals("\\[", PolarisUtils.escapeSpecialRegexChars("["));
    assertEquals("\\]", PolarisUtils.escapeSpecialRegexChars("]"));
    assertEquals("\\{", PolarisUtils.escapeSpecialRegexChars("{"));
    assertEquals("\\}", PolarisUtils.escapeSpecialRegexChars("}"));
    assertEquals("\\.", PolarisUtils.escapeSpecialRegexChars("."));
    assertEquals("\\+", PolarisUtils.escapeSpecialRegexChars("+"));
    assertEquals("\\?", PolarisUtils.escapeSpecialRegexChars("?"));
    assertEquals("\\^", PolarisUtils.escapeSpecialRegexChars("^"));
    assertEquals("\\$", PolarisUtils.escapeSpecialRegexChars("$"));
    assertEquals("\\|", PolarisUtils.escapeSpecialRegexChars("|"));
    assertEquals("A", PolarisUtils.escapeSpecialRegexChars("A"));

    System.out.println(PolarisUtils.escapeSpecialRegexChars("+_*"));
  }

  @Test
  public void escapeTimeFormatChars() {
    assertEquals("", PolarisUtils.escapeSpecialRegexChars(null));
    assertEquals("\\'Week\\' w, yyyy", PolarisUtils.escapeTimeFormatChars("'Week' w, yyyy"));
    assertEquals("dd MMM, yyyy", PolarisUtils.escapeTimeFormatChars("dd MMM, yyyy"));
  }

  @Test
  public void convertSqlLikeToRegex() {
    String testCase1 = "ab[^def]cd_ef[abc]g%";
    String verifiedString1 = "abgcd2efagdsfsdf";
    String pattenString1 = PolarisUtils.convertSqlLikeToRegex(testCase1, false);
    System.out.println(pattenString1);

    assertTrue(verifiedString1.matches(pattenString1));

    String testCase2 = "ABC\\_CD%\\_01%";
    String verifiedString2 = "ABC_CD001_01";
    String pattenString2 = PolarisUtils.convertSqlLikeToRegex(testCase2, false);
    System.out.println(pattenString2);

    assertTrue(verifiedString2.matches(pattenString2));

    String testCase3 = "EAD303\\_B*TCA4208%";
    String verifiedString3 = "EAD303*EAD303_B*TCA4208*01";
    String pattenString3 = PolarisUtils.convertSqlLikeToRegex(testCase3, true);
    System.out.println(pattenString3);

    assertTrue(PolarisUtils.findPattern(verifiedString3,pattenString3));

    String testCase4 = "T_chnology";
    String verifiedString4 = "Technology";
    String pattenString4 = PolarisUtils.convertSqlLikeToRegex(testCase4, false);
    System.out.println(pattenString4);

    assertTrue(verifiedString4.matches(pattenString4));

  }

  @Test
  public void diffMatchesAndFind() {
    Pattern pattern = Pattern.compile("EAD303_B\\*TCA4208.*");
    String verifiedString3 = "EAD303*EAD303_B*TCA4208*01";
    Matcher m = pattern.matcher(verifiedString3);
    assertFalse(m.matches());
    assertTrue(m.find());
  }

  @Test
  public void createTemporaryPassword() {
    int size = 8;
    String randomPassword = PolarisUtils.createTemporaryPassword(size);
    assertTrue(randomPassword.length() == size);
    System.out.println(randomPassword);
  }

  @Test
  public void makeTableName() {
    System.out.println(PolarisUtils.makeTableName("test"));
    System.out.println(PolarisUtils.makeTableName("test가나다"));
    System.out.println(PolarisUtils.makeTableName("test dsa 112가나다"));
    System.out.println(PolarisUtils.makeTableName("test dsa 112가나다"));
  }

  @Test
  public void convertDataSourceName() {
    System.out.println(PolarisUtils.convertDataSourceName("test_tesT_A12"));
    System.out.println(PolarisUtils.convertDataSourceName("test tesT"));
    System.out.println(PolarisUtils.convertDataSourceName("1test$$tesT"));
    System.out.println(PolarisUtils.convertDataSourceName("123te한글뭐지_123"));
    System.out.println(PolarisUtils.convertDataSourceName("test tesT"));
    System.out.println(PolarisUtils.convertDataSourceName("t$est-TEST"));
  }

  @Test
  public void splitToMap() {
    List<String> keys = Lists.newArrayList("key1", "key2");
    String test = "key1=0, key2 =hello\\=world";

    Map<String, String> pair = PolarisUtils.splitToMap(test, ",", "=");
    keys.forEach(s -> System.out.println(s + ": " + pair.get(s)));

    String test2 = "key1=0 key2 =hello\\=world";

    Map<String, String> pair2 = PolarisUtils.splitToMap(test2, ",", "=");
    keys.forEach(s -> System.out.println(s + ": " + pair2.get(s)));

    String test3 = "key1";

    Map<String, String> pair3 = PolarisUtils.splitToMap(test3, ",", "=");
    keys.forEach(s -> System.out.println(s + ": " + pair3.get(3)));


  }

  @Test
  public void getHostname() {
    System.out.println(PolarisUtils.getLocalHostname());
  }


}
