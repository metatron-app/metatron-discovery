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

package app.metatron.discovery.common;

import com.google.common.collect.Lists;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;

/**
 * Created by kyungtaak on 2017. 1. 26..
 */

public class MailerTest extends AbstractIntegrationTest {

  @Autowired
  Mailer mailer;

  @Test
  public void sendEmail() throws Exception {
    String mailTo = "kyungtaak@gmail.com";

    mailer.sendEmail(Lists.newArrayList(mailTo), "test subject", "test content", false, false);
  }

}
