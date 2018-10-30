package app.metatron.discovery.domain.datasource.format;

import com.google.common.collect.Lists;

import org.junit.Test;

import app.metatron.discovery.domain.datasource.TimeFormatCheckRequest;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class DateTimeFormatCheckerTest {

  @Test
  public void checkTimeFormat() {
    TimeFormatCheckRequest request = new TimeFormatCheckRequest("time_unix",
                                                                Lists.newArrayList("123", "456", "abc"));

    assertTrue(new DateTimeFormatChecker().checkTimeFormat(request));

    request = new TimeFormatCheckRequest("time_unix",
                                         Lists.newArrayList("a123", "a456", "123"));

    assertFalse(new DateTimeFormatChecker().checkTimeFormat(request));

    request = new TimeFormatCheckRequest("yyyy-MM-dd",
                                         Lists.newArrayList("2017-01-01", "2018-01-01", "123"));

    assertTrue(new DateTimeFormatChecker().checkTimeFormat(request));

  }

}