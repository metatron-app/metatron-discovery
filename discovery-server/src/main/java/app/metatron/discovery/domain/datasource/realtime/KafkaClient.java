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

import org.I0Itec.zkclient.ZkClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Properties;

import kafka.admin.AdminUtils;
import kafka.utils.ZKStringSerializer$;

/**
 * Created by kyungtaak on 2017. 3. 12..
 */
@Component
public class KafkaClient {

  @Autowired
  RealTimeProperties realTimeProperties;

  public void setRealTimeProperties(RealTimeProperties realTimeProperties) {
    this.realTimeProperties = realTimeProperties;
  }

  public void createTopic(String topicName, int partitions, int replication) {

    ZkClient zkClient = getZkClient();

    Properties topicConfig = new Properties(); // add per-topic configurations settings here

    if(!AdminUtils.topicExists(zkClient, topicName)) {
      AdminUtils.createTopic(zkClient, topicName, partitions, replication, topicConfig);
    }

    zkClient.close();

  }

  public void destroyTopic(String topicName) {

    ZkClient zkClient = getZkClient();

    if(AdminUtils.topicExists(zkClient, topicName)) {
      AdminUtils.deleteTopic(zkClient, topicName);
    }

    zkClient.close();
  }

  private ZkClient getZkClient() {
    return new ZkClient(
        realTimeProperties.getZkConnectUrls(),
        realTimeProperties.getSessionTimeout(),
        realTimeProperties.getConnectionTimeout(),
        ZKStringSerializer$.MODULE$);
  }
}
