package app.metatron.discovery.plugins.hive_personal_database;

import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateLoopRange;
import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateSource;
import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateTarget;
import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateTaskInformation;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;


public class DataAggregateQueryTest {
  @Test
  public void getRangeOfValues_range_type_is_date() {
    // given
    DataAggregateQuery dataAggregateQuery = new DataAggregateQuery(new DataAggregateTaskInformation(
        new DataAggregateSource("default", "select ${date_range} as dt, sum(sale_amt) as tot_amt from dt_sample where dt = ${date_range}"),
        new DataAggregateTarget("private_admin", "result_001"),
        new DataAggregateLoopRange("date", "20191225", "20200102", "yyyyMMdd")
    ), "");

    // when
    String[] rangeOfValues = dataAggregateQuery.getRangeOfValues();

    // then
    assertThat(rangeOfValues).hasSize(9);
    assertThat(rangeOfValues).contains("20191225", "20191226", "20191227", "20191228", "20191229", "20191230", "20191231", "20200101", "20200102");
  }

  @Test
  public void getRangeOfValues_range_type_is_hour() {
    // given
    DataAggregateQuery dataAggregateQuery = new DataAggregateQuery(new DataAggregateTaskInformation(
        new DataAggregateSource("default", "select ${date_range} as dt, sum(sale_amt) as tot_amt from dt_sample where dt = ${date_range}"),
        new DataAggregateTarget("private_admin", "result_001"),
        new DataAggregateLoopRange("hour", "01", "10", "")
    ), "");

    // when
    String[] rangeOfValues = dataAggregateQuery.getRangeOfValues();

    // then
    assertThat(rangeOfValues).hasSize(10);
    assertThat(rangeOfValues).contains("01", "02", "03", "04", "05", "06", "07", "08", "09", "10");
  }

  @Test
  public void generateDynamicQuery_range_type_is_date() {
    // given
    DataAggregateQuery dataAggregateQuery = new DataAggregateQuery(new DataAggregateTaskInformation(
        new DataAggregateSource("default", "select ${date_range} as dt, sum(sale_amt) as tot_amt from dt_sample where dt = ${date_range}"),
        new DataAggregateTarget("private_admin", "result_001"),
        new DataAggregateLoopRange("date", "20191225", "20200102", "yyyyMMdd")
    ), "");

    // when
    String query = dataAggregateQuery.generateDynamicQuery("20191225");

    // then
    assertThat(query).isEqualTo("select '20191225' as dt, sum(sale_amt) as tot_amt from dt_sample where dt = '20191225'");
  }

  @Test
  public void generateDynamicQuery_range_type_is_hour() {
    // given
    DataAggregateQuery dataAggregateQuery = new DataAggregateQuery(new DataAggregateTaskInformation(
        new DataAggregateSource("default", "select ${hour_range} as hh, sum(amt) as tot_amt from sample where dt = '20191212' and hh = ${hour_range}"),
        new DataAggregateTarget("private_admin", "result_001"),
        new DataAggregateLoopRange("hour", "01", "24", "")
    ), "");

    // when
    String query = dataAggregateQuery.generateDynamicQuery("02");

    // then
    assertThat(query).isEqualTo("select '02' as hh, sum(amt) as tot_amt from sample where dt = '20191212' and hh = '02'");
  }
}