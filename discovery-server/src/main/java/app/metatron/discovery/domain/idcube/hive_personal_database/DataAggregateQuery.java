package app.metatron.discovery.domain.idcube.hive_personal_database;

import app.metatron.discovery.domain.idcube.hive_personal_database.dto.DataAggregateLoopRange;
import app.metatron.discovery.domain.idcube.hive_personal_database.dto.DataAggregateTaskInformation;
import org.apache.commons.lang.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class DataAggregateQuery {
  private DataAggregateTaskInformation taskInformation;
  private String partitionColumn;

  public DataAggregateQuery(DataAggregateTaskInformation taskInformation, String partitionColumn) {
    this.taskInformation = taskInformation;
    this.partitionColumn = partitionColumn;
  }

  public String[] getRangeOfValues() {
    DataAggregateLoopRange loopRange = this.taskInformation.getLoopRange();

    List<String> rangeOfValues = new ArrayList<>();
    if(loopRange.getType().equalsIgnoreCase("date")) {
      String from = loopRange.getFrom();
      String to = loopRange.getTo();
      // TODO DataAggregateTaskInformation 에 유효성 검사 추가 시작과 끝이 명확한가...
      LocalDate fromDate = LocalDate.of(Integer.valueOf(from.substring(0, 4)), Integer.valueOf(from.substring(4, 6)), Integer.valueOf(from.substring(6, 8)));
      LocalDate toDate = LocalDate.of(Integer.valueOf(to.substring(0, 4)), Integer.valueOf(to.substring(4, 6)), Integer.valueOf(to.substring(6, 8)));

      LocalDate tmpDate = fromDate;
      // TODO 무한 루프에 빠지지 않아야....
      while(tmpDate.isBefore(toDate) || tmpDate.equals(toDate)) {
        rangeOfValues.add(tmpDate.format(DateTimeFormatter.ofPattern(loopRange.getFormat())));
        tmpDate = tmpDate.plusDays(1);
      }

    } else if(loopRange.getType().equalsIgnoreCase("hour")) {
      // TODO DataAggregateTaskInformation 에 유효성 검사 추가 시작과 끝이 명확한가...
      String from = loopRange.getFrom();
      String to = loopRange.getTo();

      for(int i = Integer.valueOf(from); i <= Integer.valueOf(to); i++) {
        rangeOfValues.add(String.format("%02d", i));
      }
    } else {
      throw new IllegalArgumentException("No support DataAggregate loop range type");
    }

    return rangeOfValues.toArray(new String[rangeOfValues.size()]);
  }

  public String generateDynamicQuery(String value) {
    String selectQuery;
    if(this.taskInformation.getLoopRange().getType().equalsIgnoreCase("date")) {
      selectQuery = this.taskInformation.getSource().getQuery().replaceAll(Pattern.quote("${date_range}"), String.format("'%s'", value));
    } else if(this.taskInformation.getLoopRange().getType().equalsIgnoreCase("hour")) {
      selectQuery = this.taskInformation.getSource().getQuery().replaceAll(Pattern.quote("${hour_range}"), String.format("'%s'", value));
    } else {
      throw new IllegalArgumentException("No support DataAggregate loop range type");
    }

    selectQuery = selectQuery.replaceAll(";", "");
    // TODO 멀티 파티션인 경우에는 어떻게 하나???
    if(StringUtils.isNotEmpty(this.partitionColumn)) {
      return String.format("INSERT INTO %s.%s PARTITION(%s) %s",
          this.taskInformation.getTarget().getDatabase(), this.taskInformation.getTarget().getTable(), this.partitionColumn, selectQuery);
    } else {
      return String.format("INSERT INTO %s.%s %s",
          this.taskInformation.getTarget().getDatabase(), this.taskInformation.getTarget().getTable(), selectQuery);
    }
  }

  public String getUseDatabase() {
    return this.taskInformation.getSource().getDatabase();
  }
}
