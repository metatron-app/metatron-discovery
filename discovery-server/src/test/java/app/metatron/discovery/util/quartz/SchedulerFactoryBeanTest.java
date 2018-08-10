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

package app.metatron.discovery.util.quartz;

import org.junit.Test;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.quartz.impl.matchers.KeyMatcher;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.List;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;

/**
 * Created by kyungtaak on 2016. 8. 11..
 */
public class SchedulerFactoryBeanTest extends AbstractIntegrationTest {

  @Autowired
  Scheduler scheduler;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Test
  public void job() throws SchedulerException, InterruptedException {

    JobKey jobKey = new JobKey("incremental", "ingestion");
    TriggerKey triggerKey = new TriggerKey("job1", "ingestion");

    JobDataMap map = new JobDataMap();
    map.put("dataSourceId", "ds_id");
    map.put("ingestionId", "ig_id");

    Trigger trigger = TriggerBuilder
            .newTrigger()
            .withIdentity(triggerKey)
            .forJob(jobKey)
            .usingJobData(map)
            .withSchedule(CronScheduleBuilder
                    .cronSchedule("0/3 * * 1/1 * ? *")
                    .withMisfireHandlingInstructionDoNothing())
            .build();

    scheduler.scheduleJob(trigger);

    Thread.sleep(15 * 1000L);

    scheduler.clear();

    List<IngestionHistory> histroys = ingestionHistoryRepository.findAll();
    for(IngestionHistory histroy : histroys) {
      System.out.println(histroy.toString());
    }
  }

  @Test
  public void scheduleSimple() throws SchedulerException, InterruptedException {

    JobKey jobKey = new JobKey("job1", "group1");
    TriggerKey triggerKey = new TriggerKey("job1", "group1");

    Trigger trigger = TriggerBuilder
            .newTrigger()
            .withIdentity(triggerKey)
            .withSchedule(SimpleScheduleBuilder
                    .simpleSchedule()
                    .withIntervalInSeconds(3).withRepeatCount(3))
            .build();

    JobDataMap map = new JobDataMap();
    map.put("test", "contextMap");

    JobDetail jobDetail = JobBuilder.newJob().newJob(TestJob.class)
            .usingJobData(map)
            .withIdentity(jobKey).build();

    scheduler.scheduleJob(jobDetail, trigger);

    for (String groupName : scheduler.getJobGroupNames()) {

      for (JobKey key : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {

        String jobName = jobKey.getName();
        String jobGroup = jobKey.getGroup();

        //get job's trigger
        List<Trigger> triggers = (List<Trigger>) scheduler.getTriggersOfJob(key);
        Date nextFireTime = triggers.get(0).getNextFireTime();

        System.out.println("[jobName] : " + jobName + " [groupName] : "
                + jobGroup + " - " + nextFireTime);

      }

    }

    Thread.sleep(15 * 1000L);

    scheduler.clear();
  }

  @Test
  public void scheduleCronTrigger() throws SchedulerException, InterruptedException {

    JobKey jobKey = new JobKey("job1", "group1");
    TriggerKey triggerKey = new TriggerKey("job1", "group1");

    Trigger trigger = TriggerBuilder
            .newTrigger()
            .withIdentity(triggerKey)
            .withSchedule(CronScheduleBuilder
                    .cronSchedule("0/3 * * 1/1 * ? *")
                    .withMisfireHandlingInstructionDoNothing())
            .build();

    JobDataMap map = new JobDataMap();
    map.put("test", "contextMap");

    JobDetail jobDetail = JobBuilder.newJob().newJob(TestJob.class)
            .usingJobData(map)
            .withIdentity(jobKey).build();

    scheduler.scheduleJob(jobDetail, trigger);

    Thread.sleep(15 * 1000L);

    scheduler.clear();
  }

  @Test
  public void scheduleSimpleWithException() throws SchedulerException, InterruptedException {

    JobKey jobKey = new JobKey("job1", "group1");
    TriggerKey triggerKey = new TriggerKey("job1", "group1");

    Trigger trigger = TriggerBuilder
            .newTrigger()
            .withIdentity(triggerKey)
            .withSchedule(SimpleScheduleBuilder
                    .simpleSchedule()
                    .withIntervalInSeconds(3).withRepeatCount(3))
            .build();

    JobDetail jobDetail = JobBuilder.newJob(TestJobWithException.class)
            .withIdentity(jobKey).build();

    scheduler.getListenerManager().addJobListener(
            new TestJobListener(), KeyMatcher.keyEquals(jobKey)
    );

    scheduler.scheduleJob(jobDetail, trigger);

    Thread.sleep(15 * 1000L);

    scheduler.clear();
  }

}
