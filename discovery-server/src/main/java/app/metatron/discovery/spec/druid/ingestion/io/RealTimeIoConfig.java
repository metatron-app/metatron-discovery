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

package app.metatron.discovery.spec.druid.ingestion.io;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.spec.druid.ingestion.firehose.Firehose;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class RealTimeIoConfig implements IoConfig {

  @NotNull
  Firehose firehose;

  String firehoseV2;

  public RealTimeIoConfig() {
  }

  public RealTimeIoConfig(Firehose firehose) {
    this.firehose = firehose;
  }

  public Firehose getFirehose() {
    return firehose;
  }

  public void setFirehose(Firehose firehose) {
    this.firehose = firehose;
  }

  public String getFirehoseV2() {
    return firehoseV2;
  }

  public void setFirehoseV2(String firehoseV2) {
    this.firehoseV2 = firehoseV2;
  }
}
