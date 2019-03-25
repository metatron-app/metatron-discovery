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

package app.metatron.discovery.config;

import org.quartz.spi.JobFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.quartz.CronTriggerFactoryBean;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

import app.metatron.discovery.common.scheduling.AutowiringSpringBeanJobFactory;
import app.metatron.discovery.domain.scheduling.common.TemporaryCSVFileCleanJob;
import app.metatron.discovery.domain.scheduling.engine.DataSourceCheckJob;
import app.metatron.discovery.domain.scheduling.engine.DataSourceIngestionCheckJob;
import app.metatron.discovery.domain.scheduling.engine.DataSourceSizeCheckJob;
import app.metatron.discovery.domain.scheduling.engine.TemporaryCleanJob;
import app.metatron.discovery.domain.scheduling.ingestion.IncrementalIngestionJob;
import app.metatron.discovery.domain.scheduling.mdm.CalculatePopularityJob;
import app.metatron.discovery.domain.scheduling.notebook.KillNotebookKernelJob;
import app.metatron.discovery.domain.scheduling.workbench.TimeoutConnectionCloseJob;

/**
 * Created by kyungtaak on 2016. 6. 21..
 */
@Profile("scheduling")
@Configuration
public class SchedulingConfig {

  private final static String JOB_GROUP_CHECK = "check";

  private final static String JOB_GROUP_INGESTION = "ingestion";

  private final static String JOB_GROUP_DOMAIN = "domain";

  private final static String JOB_GROUP_CLEANER = "cleaner";

  @Autowired
  @Qualifier("dataSource")
  DataSource dataSource;

  @Autowired
  PlatformTransactionManager transactionManager;

  @Autowired
  private ApplicationContext applicationContext;

  @Bean
  public JobFactory jobFactory() {
    AutowiringSpringBeanJobFactory jobFactory = new AutowiringSpringBeanJobFactory();
    jobFactory.setApplicationContext(applicationContext);
    return jobFactory;
  }

  @Bean
  public SchedulerFactoryBean scheduler() {
    SchedulerFactoryBean schedulerFactoryBean = new SchedulerFactoryBean();
    schedulerFactoryBean.setDataSource(dataSource);
    schedulerFactoryBean.setTransactionManager(transactionManager);
    schedulerFactoryBean.setJobFactory(jobFactory());
    schedulerFactoryBean.setWaitForJobsToCompleteOnShutdown(true);
    schedulerFactoryBean.setJobDetails(dataSourceCheckJob().getObject(),
                                       dataSourceIngestionCheckJob().getObject(),
                                       dataSourceSizeCheckJob().getObject(),
                                       incrementalJob().getObject(),
                                       tempDataSourceCleanJob().getObject(),
                                       calculatePopularityJob().getObject(),
                                       notebookKillKernelJob().getObject(),
                                       tempCSVFileCleanJob().getObject(),
                                       timeoutWorkbenchConnectionCloseJob().getObject());
    schedulerFactoryBean.setTriggers(dataSourceCheckTrigger().getObject(),
                                     dataSourceIngestionCheckTrigger().getObject(),
                                     dataSourceSizeCheckTrigger().getObject(),
                                     tempDataSourceCleanTrigger().getObject(),
                                     calculatePopularityTrigger().getObject(),
                                     notebookKillKernelTrigger().getObject(),
                                     tempCSVFileCleanTrigger().getObject(),
                                     timeoutWorkbenchConnectionCloseTrigger().getObject());

    return schedulerFactoryBean;
  }

  @Bean
  public JobDetailFactoryBean incrementalJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("incremental-ingestion");
    jobDetailFactory.setGroup(JOB_GROUP_INGESTION);
    jobDetailFactory.setJobClass(IncrementalIngestionJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  @Bean
  public JobDetailFactoryBean dataSourceCheckJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("check-datasource");
    jobDetailFactory.setGroup(JOB_GROUP_CHECK);
    jobDetailFactory.setJobClass(DataSourceCheckJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 5분에 한번식 데이터 소스 체크
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean dataSourceCheckTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(dataSourceCheckJob().getObject());
    triggerFactory.setStartDelay(10000);
    triggerFactory.setName("check-datasource-trigger");
    triggerFactory.setGroup(JOB_GROUP_CHECK);
    triggerFactory.setCronExpression("0 0/30 * 1/1 * ? *");
    return triggerFactory;
  }


  @Bean
  public JobDetailFactoryBean dataSourceIngestionCheckJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("check-ingestion-task");
    jobDetailFactory.setGroup(JOB_GROUP_CHECK);
    jobDetailFactory.setJobClass(DataSourceIngestionCheckJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 1분에 한번씩 데이터 적재 작업 체크
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean dataSourceIngestionCheckTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(dataSourceIngestionCheckJob().getObject());
    triggerFactory.setStartDelay(10000);
    triggerFactory.setName("check-ingestion-task");
    triggerFactory.setGroup(JOB_GROUP_CHECK);
    triggerFactory.setCronExpression("0 0/1 * 1/1 * ? *");
    return triggerFactory;
  }

  @Bean
  public JobDetailFactoryBean dataSourceSizeCheckJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("check-datasource-size");
    jobDetailFactory.setGroup(JOB_GROUP_CHECK);
    jobDetailFactory.setJobClass(DataSourceSizeCheckJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 10분에 한번씩 데이터 소스 체크
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean dataSourceSizeCheckTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(dataSourceSizeCheckJob().getObject());
    triggerFactory.setStartDelay(20000);
    triggerFactory.setName("check-datasource-size-trigger");
    triggerFactory.setGroup(JOB_GROUP_CHECK);
    triggerFactory.setCronExpression("0 0/10 * 1/1 * ? *");
    return triggerFactory;
  }

  /**
   * Temporary DataSource Cleaner
   *
   * @return
   */
  @Bean
  public JobDetailFactoryBean tempDataSourceCleanJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("temporary-cleaner");
    jobDetailFactory.setGroup(JOB_GROUP_CLEANER);
    jobDetailFactory.setJobClass(TemporaryCleanJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 10분에 한번씩 데이터 소스 체크
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean tempDataSourceCleanTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(tempDataSourceCleanJob().getObject());
    triggerFactory.setStartDelay(20000);
    triggerFactory.setName("temporary-cleaner-trigger");
    triggerFactory.setGroup(JOB_GROUP_CLEANER);
    triggerFactory.setCronExpression("0 0/10 * 1/1 * ? *");
    return triggerFactory;
  }


  /**
   * Calculate Metadata Popularity
   *
   * @return
   */
  @Bean
  public JobDetailFactoryBean calculatePopularityJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("calculate-popularity");
    jobDetailFactory.setGroup(JOB_GROUP_DOMAIN);
    jobDetailFactory.setJobClass(CalculatePopularityJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 3시간에 한번씩 수행
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean calculatePopularityTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(calculatePopularityJob().getObject());
    triggerFactory.setName("calculate-popularity-trigger");
    triggerFactory.setGroup(JOB_GROUP_DOMAIN);
    triggerFactory.setCronExpression("0 0 0/3 1/1 * ? *");
    return triggerFactory;
  }

  /**
   * Kill all of notebook kernels
   *
   * @return
   */
  @Bean
  public JobDetailFactoryBean notebookKillKernelJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("kill-notebook-kernel");
    jobDetailFactory.setGroup(JOB_GROUP_CLEANER);
    jobDetailFactory.setJobClass(KillNotebookKernelJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 매일 새벽 1시에 실행
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean notebookKillKernelTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(notebookKillKernelJob().getObject());
    triggerFactory.setName("kill-notebook-kernel-trigger");
    triggerFactory.setGroup(JOB_GROUP_CLEANER);
    triggerFactory.setCronExpression("0 0 1 1/1 * ? *");
    return triggerFactory;
  }

  /**
   * Temporary CSV File Cleaner
   *
   * @return
   */
  @Bean
  public JobDetailFactoryBean tempCSVFileCleanJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("temporary-csv-cleaner");
    jobDetailFactory.setGroup(JOB_GROUP_CLEANER);
    jobDetailFactory.setJobClass(TemporaryCSVFileCleanJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 매일 새벽 2시에 실행
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean tempCSVFileCleanTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(tempCSVFileCleanJob().getObject());
    triggerFactory.setStartDelay(20000);
    triggerFactory.setName("temporary-csv-cleaner-trigger");
    triggerFactory.setGroup(JOB_GROUP_CLEANER);
    triggerFactory.setCronExpression("0 0 2 1/1 * ? *");
    return triggerFactory;
  }

  /**
   * timeout workbench connection close
   *
   * @return
   */
  @Bean
  public JobDetailFactoryBean timeoutWorkbenchConnectionCloseJob() {
    JobDetailFactoryBean jobDetailFactory = new JobDetailFactoryBean();
    jobDetailFactory.setName("timeout-connection-close");
    jobDetailFactory.setGroup(JOB_GROUP_DOMAIN);
    jobDetailFactory.setJobClass(TimeoutConnectionCloseJob.class);
    jobDetailFactory.setDurability(true);
    return jobDetailFactory;
  }

  /**
   * 매 30분마다 실행
   *
   * @return
   */
  @Bean
  public CronTriggerFactoryBean timeoutWorkbenchConnectionCloseTrigger(){
    CronTriggerFactoryBean triggerFactory = new CronTriggerFactoryBean();
    triggerFactory.setJobDetail(timeoutWorkbenchConnectionCloseJob().getObject());
    triggerFactory.setStartDelay(1000);
    triggerFactory.setName("timeout-connection-close-trigger");
    triggerFactory.setGroup(JOB_GROUP_DOMAIN);
    triggerFactory.setCronExpression("0 0/30 * 1/1 * ? *");
    return triggerFactory;
  }

}
