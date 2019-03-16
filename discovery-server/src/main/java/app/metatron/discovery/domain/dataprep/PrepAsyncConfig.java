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

package app.metatron.discovery.domain.dataprep;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.Future;

@Configuration
@EnableAsync
public class PrepAsyncConfig {

  protected Logger logger = LoggerFactory.getLogger(getClass());
  protected Logger errorLogger = LoggerFactory.getLogger("error");

  @Bean(name = "prepThreadPoolTaskExecutor")
  public Executor prepThreadPoolTaskExecutor() {
    ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
    taskExecutor.setCorePoolSize(30);
    taskExecutor.setMaxPoolSize(30);
    taskExecutor.setQueueCapacity(1000);
    taskExecutor.setThreadNamePrefix("PrepThread-");
    taskExecutor.initialize();
    return new HandlingExecutor(taskExecutor); // HandlingExecutor로 wrapping 합니다.
  }

  public class HandlingExecutor implements AsyncTaskExecutor {
    private AsyncTaskExecutor executor;

    public HandlingExecutor(AsyncTaskExecutor executor) {
      this.executor = executor;
    }

    @Override
    public void execute(Runnable task) {
      executor.execute(task);
    }

    @Override
    public void execute(Runnable task, long startTimeout) {
      executor.execute(createWrappedRunnable(task), startTimeout);
    }

    @Override
    public Future<?> submit(Runnable task) {
      return executor.submit(createWrappedRunnable(task));
    }

    @Override
    public <T> Future<T> submit(final Callable<T> task) {
      return executor.submit(createCallable(task));
    }

    private <T> Callable<T> createCallable(final Callable<T> task) {
      return new Callable<T>() {
        @Override
        public T call() throws Exception {
          try {
            return task.call();
          } catch (Exception ex) {
            handle(ex);
            throw ex;
          }
        }
      };
    }

    private Runnable createWrappedRunnable(final Runnable task) {
      return new Runnable() {
        @Override
        public void run() {
          try {
            task.run();
          } catch (Exception ex) {
            handle(ex);
          }
        }
      };
    }

    private void handle(Exception ex) {
      errorLogger.info("Failed to execute task. : {}", ex.getMessage());
      errorLogger.error("Failed to execute task. ",ex);
    }

  }

}
