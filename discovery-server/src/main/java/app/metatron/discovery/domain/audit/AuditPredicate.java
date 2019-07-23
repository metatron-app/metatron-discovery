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

package app.metatron.discovery.domain.audit;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class AuditPredicate {

  public static Predicate searchList(String searchKeyword, Audit.AuditStatus auditStatus, Audit.AuditType auditType,
                                     DateTime from, DateTime to, String user, Long elapsedTime) {

    BooleanBuilder builder = new BooleanBuilder();
    QAudit audit = QAudit.audit;

    if(StringUtils.isNotEmpty(searchKeyword)){
      builder = builder.and(
        audit.applicationId.containsIgnoreCase(searchKeyword)
          .or(audit.jobName.containsIgnoreCase(searchKeyword))
          .or(audit.jobId.containsIgnoreCase(searchKeyword))
          .or(audit.user.containsIgnoreCase(searchKeyword))
      );
    }

    if(auditStatus != null){
      builder = builder.and(audit.status.eq(auditStatus));
    }

    if(auditType != null){
      builder = builder.and(audit.type.eq(auditType));
    }

    if(from != null && to != null) {
      builder = builder.and(audit.startTime.between(from, to));
    }

    if(StringUtils.isNotEmpty(user)){
      builder = builder.and(audit.user.containsIgnoreCase(user));
    }

    if(elapsedTime != null){
      builder = builder.and(audit.elapsedTime.goe(elapsedTime));
    }

    builder = builder.and(audit.query.isNotNull());

    return builder;
  }

//  public static Predicate countByUser(DateTime from, DateTime to, Audit.AuditType auditType) {
//
//    BooleanBuilder builder = new BooleanBuilder();
//    QAudit audit = QAudit.audit;
//
//    if(auditType != null){
//      builder = builder.and(audit.type.eq(auditType));
//    }
//
//    if(from != null && to != null) {
//      builder = builder.and(audit.startTime.between(from, to));
//    }
//
//    builder = builder.and(audit.user.isNotNull());
//
//    return builder;
//  }
//
//  public static Predicate countStatusByDateUser(DateTime from, DateTime to, Audit.AuditStatus auditStatus,
//                                                Audit.AuditType auditType, String user) {
//
//    BooleanBuilder builder = new BooleanBuilder();
//    QAudit audit = QAudit.audit;
//
//    if(auditStatus != null){
//      builder = builder.and(audit.status.eq(auditStatus));
//    } else {
//      // 기본은 성공/실패 케이스만 카운트
//      builder = builder.and(audit.status.in(Audit.AuditStatus.SUCCESS, Audit.AuditStatus.FAIL));
//    }
//
//    if(auditType != null){
//      builder = builder.and(audit.type.eq(auditType));
//    }
//
//    if(from != null && to != null) {
//      builder = builder.and(audit.startTime.between(from, to));
//    }
//
//    if(StringUtils.isNotEmpty(user)){
//      builder = builder.and(audit.user.containsIgnoreCase(user));
//    }
//
//    return builder;
//  }
//  public static Predicate countByStatus(DateTime from, DateTime to, Audit.AuditStatus auditStatus,
//                                                Audit.AuditType auditType, String user) {
//
//    BooleanBuilder builder = new BooleanBuilder();
//    QAudit audit = QAudit.audit;
//
//    if(auditStatus != null){
//      builder = builder.and(audit.status.eq(auditStatus));
//    } else {
//      // 기본은 성공/실패 케이스만 카운트
//      builder = builder.and(audit.status.in(Audit.AuditStatus.SUCCESS, Audit.AuditStatus.FAIL));
//    }
//
//    if(auditType != null){
//      builder = builder.and(audit.type.eq(auditType));
//    }
//
//    if(from != null && to != null) {
//      builder = builder.and(audit.startTime.between(from, to));
//    }
//
//    if(StringUtils.isNotEmpty(user)){
//      builder = builder.and(audit.user.containsIgnoreCase(user));
//    }
//
//    return builder;
//  }
}
