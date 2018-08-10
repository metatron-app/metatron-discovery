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

package app.metatron.discovery.domain.scheduling;

import com.google.common.collect.Lists;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerKey;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 15..
 */
@Profile("scheduling")
@RestController
@RequestMapping("/api")
public class SchedulingController {

  @Autowired
  Scheduler scheduler;

  /**
   * Find all scheduling Jobs
   *
   * @return
   */
  @RequestMapping(value = "/jobs", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findAll() throws SchedulerException {

    List<SchedulingJob> schedulingJobs = Lists.newArrayList();
    for (String groupName : scheduler.getTriggerGroupNames()) {
      for (TriggerKey key : scheduler.getTriggerKeys(GroupMatcher.triggerGroupEquals(groupName))) {
        Trigger trigger = scheduler.getTrigger(key);
        schedulingJobs.add(new SchedulingJob(trigger, scheduler.getTriggerState(key)));
      }
    }

    return ResponseEntity.ok(schedulingJobs);
  }

  /**
   * Find by key
   *
   * @return
   */
  @RequestMapping(value = "/jobs/search/key", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findByKey(@RequestParam(name = "group") String group,
                                     @RequestParam(name = "name", required = false) String name) throws SchedulerException {

    if (StringUtils.isNotEmpty(name)) {
      TriggerKey triggerKey = new TriggerKey(name, group);
      Trigger trigger = scheduler.getTrigger(triggerKey);
      if (trigger == null) {
        return ResponseEntity.ok(Lists.newArrayList());
      }
      return ResponseEntity.ok(Lists.newArrayList(new SchedulingJob(trigger, scheduler.getTriggerState(triggerKey))));
    }

    List<SchedulingJob> schedulingJobs = Lists.newArrayList();
    for (String groupName : scheduler.getTriggerGroupNames()) {
      if (group.equals(groupName)) {
        for (TriggerKey key : scheduler.getTriggerKeys(GroupMatcher.triggerGroupEquals(groupName))) {
          Trigger trigger = scheduler.getTrigger(key);
          schedulingJobs.add(new SchedulingJob(trigger, scheduler.getTriggerState(key)));
        }
        break;
      }
    }

    return ResponseEntity.ok(schedulingJobs);
  }

  /**
   * Find by key
   *
   * @return
   */
  @RequestMapping(value = "/jobs/{group}/{name}/pause", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> pauseJob(@PathVariable("group") String group,
                                     @PathVariable("name") String name) throws SchedulerException {

    TriggerKey triggerKey = new TriggerKey(name, group);
    Trigger trigger = scheduler.getTrigger(triggerKey);
    if (trigger == null) {
      return ResponseEntity.notFound().build();
    }

    scheduler.pauseTrigger(triggerKey);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(value = "/jobs/{group}/{name}/resume", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> resumeJob(@PathVariable("group") String group,
                                     @PathVariable("name") String name) throws SchedulerException {

    TriggerKey triggerKey = new TriggerKey(name, group);
    Trigger trigger = scheduler.getTrigger(triggerKey);
    if (trigger == null) {
      return ResponseEntity.notFound().build();
    }

    scheduler.resumeTrigger(triggerKey);

    return ResponseEntity.noContent().build();
  }

  public class SchedulingJob {
    String name;
    String jobName;
    String group;
    DateTime nextFireTime;
    Trigger.TriggerState status;

    public SchedulingJob() {
    }

    public SchedulingJob(Trigger trigger, Trigger.TriggerState status) {
      this.name = trigger.getKey().getName();
      this.jobName = trigger.getJobKey().getName();
      this.group = trigger.getKey().getGroup();
      this.nextFireTime = new DateTime(trigger.getNextFireTime());
      this.status = status;
    }

    public String getJobName() {
      return jobName;
    }

    public void setJobName(String jobName) {
      this.jobName = jobName;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getGroup() {
      return group;
    }

    public void setGroup(String group) {
      this.group = group;
    }

    public DateTime getNextFireTime() {
      return nextFireTime;
    }

    public void setNextFireTime(DateTime nextFireTime) {
      this.nextFireTime = nextFireTime;
    }

    public Trigger.TriggerState getStatus() {
      return status;
    }

    public void setStatus(Trigger.TriggerState status) {
      this.status = status;
    }
  }
}
