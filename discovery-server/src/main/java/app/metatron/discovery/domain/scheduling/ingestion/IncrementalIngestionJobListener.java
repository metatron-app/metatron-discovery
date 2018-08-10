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

package app.metatron.discovery.domain.scheduling.ingestion;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by kyungtaak on 2016. 8. 12..
 */
public class IncrementalIngestionJobListener implements JobListener {

  private static Logger LOGGER = LoggerFactory.getLogger(IncrementalIngestionJobListener.class);

  public static final String LISTENER_NAME = "incremental_ingetsion_listener";

  @Override
  public String getName() {
    return LISTENER_NAME; //must return a name
  }

  // Run this if job is about to be executed.
  @Override
  public void jobToBeExecuted(JobExecutionContext context) {

    String jobName = context.getJobDetail().getKey().toString();
    System.out.println("jobToBeExecuted");
    System.out.println("Job : " + jobName + " is going to start...");

  }

  // No idea when will run this?
  @Override
  public void jobExecutionVetoed(JobExecutionContext context) {
    System.out.println("jobExecutionVetoed");
  }

  //Run this after job has been executed
  @Override
  public void jobWasExecuted(JobExecutionContext context,
                             JobExecutionException jobException) {
    System.out.println("jobWasExecuted");

    String jobName = context.getJobDetail().getKey().toString();
    System.out.println("Job : " + jobName + " is finished...");

    if (!jobException.getMessage().equals("")) {
      System.out.println("Exception thrown by: " + jobName
              + " Exception: " + jobException.getMessage());
    }

  }
}
