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

package app.metatron.discovery.domain.activities;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.NumberExpression;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;

import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;

/**
 * Created by kyungtaak on 2017. 1. 23..
 */
public class ActivityStreamRepositoryImpl extends QueryDslRepositorySupport implements ActivityStreamRepositoryExtends {

  private static final Logger LOGGER = LoggerFactory.getLogger(ActivityStreamRepositoryImpl.class);

  @Autowired
  private EntityManager entityManager;

  public ActivityStreamRepositoryImpl() {
    super(ActivityStream.class);
  }

  @Override
  public Map<String, Long> findWorkspaceViewStat(String workspaceId, TimeFieldFormat.TimeUnit timeUnit, DateTime from, DateTime to) {

    QActivityStream qActivity = QActivityStream.activityStream;

    List<Expression> timeExprs = null;
    switch (timeUnit) {
      case HOUR:
        timeExprs = Lists.newArrayList(
            qActivity.publishedTime.year(),
            qActivity.publishedTime.month(),
            qActivity.publishedTime.dayOfMonth(),
            qActivity.publishedTime.hour()
        );
        break;
      case DAY:
        timeExprs = Lists.newArrayList(
            qActivity.publishedTime.year(),
            qActivity.publishedTime.month(),
            qActivity.publishedTime.dayOfMonth()
        );
        break;
      case WEEK:
        timeExprs = Lists.newArrayList(
            qActivity.publishedTime.year(),
            qActivity.publishedTime.week()
        );
        break;
      case MONTH:
        timeExprs = Lists.newArrayList(
            qActivity.publishedTime.year(),
            qActivity.publishedTime.month()
        );
        break;
      default:
        timeExprs = Lists.newArrayList(
            qActivity.publishedTime.year(),
            qActivity.publishedTime.month(),
            qActivity.publishedTime.dayOfMonth()
        );
        timeUnit = TimeFieldFormat.TimeUnit.DAY;
        break;
    }

    List<Expression> projectionExprs = Lists.newArrayList(timeExprs);
    projectionExprs.add(qActivity.id.count());

    List<OrderSpecifier> orderByExprs = timeExprs.stream()
                                                 .map(expression -> ((NumberExpression) expression).asc())
                                                 .collect(Collectors.toList());

    List<Tuple> result = from(qActivity).where(qActivity.objectType.eq(ActivityStream.MetatronObjectType.WORKSPACE),
                                             qActivity.objectId.eq(workspaceId),
                                             qActivity.action.eq(ActivityType.VIEW),
                                             qActivity.publishedTime.goe(from),
                                             qActivity.publishedTime.loe(to))
                                      .select(projectionExprs.toArray(new Expression[projectionExprs.size()]))
                                      .groupBy(timeExprs.toArray(new Expression[timeExprs.size()]))
                                      .orderBy(orderByExprs.toArray(new OrderSpecifier[orderByExprs.size()])).fetch();

    Map<String, Long> resultMap = Maps.newLinkedHashMap();
    for (Tuple tuple : result) {
      String originalTimeFormat = null;
      switch (timeUnit) {
        case HOUR:
          originalTimeFormat = tuple.get(0, Integer.class) + "-" +
              StringUtils.leftPad(tuple.get(1, Integer.class) + "", 2, "0") + "-" +
              StringUtils.leftPad(tuple.get(2, Integer.class) + "", 2, "0") + " " +
              StringUtils.leftPad(tuple.get(3, Integer.class) + "", 2, "0");
          break;
        case DAY:
          originalTimeFormat = tuple.get(0, Integer.class) + "-" +
              StringUtils.leftPad(tuple.get(1, Integer.class) + "", 2, "0") + "-" +
              StringUtils.leftPad(tuple.get(2, Integer.class) + "", 2, "0");
          break;
        case WEEK:
        case MONTH:
          originalTimeFormat = tuple.get(0, Integer.class) + "-" +
              StringUtils.leftPad(tuple.get(1, Integer.class) + "", 2, "0");
          break;
        default:
          originalTimeFormat = tuple.get(0, Integer.class) + "-" +
              StringUtils.leftPad(tuple.get(1, Integer.class) + "", 2, "0") + "-" +
              StringUtils.leftPad(tuple.get(2, Integer.class) + "", 2, "0");
          break;
      }

      String dateTimeStr = DateTime.parse(originalTimeFormat, DateTimeFormat.forPattern(timeUnit.sortFormat()))
                                   .toString(DateTimeFormat.forPattern(timeUnit.format()).withLocale(Locale.ENGLISH));

      resultMap.put(dateTimeStr, tuple.get(projectionExprs.size() - 1, Long.class));

    }

    return resultMap;
  }
}
