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

package app.metatron.discovery.spec.druid.ingestion.firehose;

import java.util.Map;

/**
 * Created by kyungtaak on 2017. 3. 12..
 */
public class Kafka80Firehose implements Firehose {

  String feed;

  Map<String, String> consumerProps;

  public Kafka80Firehose() {
  }

  public Kafka80Firehose(String feed, Map<String, String> consumerProps) {
    this.feed = feed;
    this.consumerProps = consumerProps;
  }

  public String getFeed() {
    return feed;
  }

  public void setFeed(String feed) {
    this.feed = feed;
  }

  public Map<String, String> getConsumerProps() {
    return consumerProps;
  }

  public void setConsumerProps(Map<String, String> consumerProps) {
    this.consumerProps = consumerProps;
  }
}
