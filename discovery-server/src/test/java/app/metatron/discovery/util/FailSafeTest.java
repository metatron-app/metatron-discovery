/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.util;

import net.jodah.failsafe.Failsafe;
import net.jodah.failsafe.RetryPolicy;

import org.joda.time.DateTime;
import org.junit.Test;

import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

public class FailSafeTest {

  @Test
  public void basicSample() {
    SomeApi api = new SomeApi();

    Callable<String> callable = () -> api.call();

    // @formatter:off
    RetryPolicy retryPolicy = new RetryPolicy()
        .retryOn(ApiException.class)
        .withBackoff(3, 60, TimeUnit.SECONDS)
        .withMaxRetries(20)
        .withMaxDuration(30, TimeUnit.MINUTES);
		// @formatter:on

    try {
      String result = Failsafe.with(retryPolicy)
                              .onComplete((o, throwable, ctx) -> {
                                System.out.println(ctx);
                                if(ctx != null) {
                                  System.out.println(ctx.getElapsedTime().toSeconds());
                                  System.out.println(ctx.getExecutions());
                                }
                              })
                              .get(callable);
      System.out.println(result);

    } catch (Exception ree) {
      System.err.println("retries exhausted..");
    }

  }

  static class ApiException extends Exception {
  }

  static class SomeApi {
    private int count = 1;

    public String call() throws ApiException {
      System.out.println("API call #" + count);
      count++;
      if (count < 5) {
        System.out.println(DateTime.now() + ": throwing exception..");
        throw new ApiException();
      }

      return UUID.randomUUID().toString().toUpperCase();
    }
  }
}
