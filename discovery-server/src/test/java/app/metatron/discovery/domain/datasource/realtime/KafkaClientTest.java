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

package app.metatron.discovery.domain.datasource.realtime;

import org.junit.Test;

/**
 * Created by kyungtaak on 2017. 3. 12..
 */
public class KafkaClientTest {

  @Test
  public void createTopic() throws Exception {
    KafkaClient kafkaClient = new KafkaClient();
    kafkaClient.setRealTimeProperties(getRealTimeProperties());

    kafkaClient.createTopic("test-topic", 2, 1);

    // 확인 명령어 : ./kafka-topics.sh --zookeeper localhost:2181 --list
  }

  @Test
  public void destroyTopic() throws Exception {
    KafkaClient kafkaClient = new KafkaClient();
    kafkaClient.setRealTimeProperties(getRealTimeProperties());

    kafkaClient.destroyTopic("test-topic");
  }

  private RealTimeProperties getRealTimeProperties() {
    RealTimeProperties realTimeProperties = new RealTimeProperties();
    realTimeProperties.setZkConnectUrls("localhost:2181");

    return realTimeProperties;
  }

}
