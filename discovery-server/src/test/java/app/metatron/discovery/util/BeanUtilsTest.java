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

import org.junit.Test;

import app.metatron.discovery.domain.audit.Audit;

public class BeanUtilsTest {
  @Test
  public void copyProp(){
    Audit auditSource = new Audit();
    auditSource.setJobName("jobname_source");
    auditSource.setNumRows(99L);
    auditSource.setStatus(Audit.AuditStatus.SUCCESS);


    Audit auditDest = new Audit();
    auditDest.setJobName("jobName_dest");
    auditDest.setId("id_dest");
    auditDest.setElapsedTime(1000L);

    BeanUtils.copyPropertiesNullAware(auditDest, auditSource);

    System.out.println("auditDest.getJobName() = " + auditDest.getJobName());
    System.out.println("auditDest.getNumRows() = " + auditDest.getNumRows());
    System.out.println("auditDest.getStatus() = " + auditDest.getStatus());
    System.out.println("auditDest.getId() = " + auditDest.getId());
    System.out.println("auditDest.getElapsedTime() = " + auditDest.getElapsedTime());
  }
}
