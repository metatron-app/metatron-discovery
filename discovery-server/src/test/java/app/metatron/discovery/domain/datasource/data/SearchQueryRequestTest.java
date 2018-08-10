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

package app.metatron.discovery.domain.datasource.data;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Test;

import java.io.IOException;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2017. 6. 14..
 */
public class SearchQueryRequestTest {

  @Test
  public void serializeDataSource() throws IOException {
    Map<String, Object> dataSourceReq = Maps.newHashMap();
    dataSourceReq.put("dataSource", "sales");

    String body = GlobalObjectMapper.writeValueAsString(dataSourceReq);

    System.out.println("Body: " + body);

    System.out.println(GlobalObjectMapper.getDefaultMapper()
                                         .readValue(body, SearchQueryRequest.class).toString());


    Map<String, Object> dataSource = Maps.newLinkedHashMap();
    dataSource.put("type", "default");
    dataSource.put("name", "sales");

    dataSourceReq.put("dataSource", dataSource);

    body = GlobalObjectMapper.writeValueAsString(dataSourceReq);

    System.out.println("Body: " + body);

    System.out.println(GlobalObjectMapper.getDefaultMapper()
                                         .readValue(body, SearchQueryRequest.class).toString());
  }

  @Test
  public void makeResult() throws Exception {

    String node = "[\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.216552734375,\n" +
        "            \"AVG(py2)\": 3585.72900390625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:19\",\n" +
        "            \"AVG(pymax2)\": 3585.9765625,\n" +
        "            \"AVG(pymin2)\": 3585.459716796875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.41796875,\n" +
        "            \"AVG(py2)\": 3585.68896484375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:20\",\n" +
        "            \"AVG(pymax2)\": 3585.97802734375,\n" +
        "            \"AVG(pymin2)\": 3585.423828125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.042724609375,\n" +
        "            \"AVG(py2)\": 3585.66650390625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:21\",\n" +
        "            \"AVG(pymax2)\": 3585.875,\n" +
        "            \"AVG(pymin2)\": 3585.387451171875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.213623046875,\n" +
        "            \"AVG(py2)\": 3585.619873046875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:22\",\n" +
        "            \"AVG(pymax2)\": 3585.833984375,\n" +
        "            \"AVG(pymin2)\": 3585.258056640625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3587.718017578125,\n" +
        "            \"AVG(py2)\": 3585.6220703125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:23\",\n" +
        "            \"AVG(pymax2)\": 3585.89892578125,\n" +
        "            \"AVG(pymin2)\": 3585.1474609375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.997802734375,\n" +
        "            \"AVG(py2)\": 3585.626953125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:24\",\n" +
        "            \"AVG(pymax2)\": 3585.81494140625,\n" +
        "            \"AVG(pymin2)\": 3585.375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3587.1015625,\n" +
        "            \"AVG(py2)\": 3585.686767578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:25\",\n" +
        "            \"AVG(pymax2)\": 3585.807861328125,\n" +
        "            \"AVG(pymin2)\": 3585.496337890625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.881591796875,\n" +
        "            \"AVG(py2)\": 3585.67138671875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:26\",\n" +
        "            \"AVG(pymax2)\": 3585.943115234375,\n" +
        "            \"AVG(pymin2)\": 3585.413818359375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.564208984375,\n" +
        "            \"AVG(py2)\": 3585.62646484375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:27\",\n" +
        "            \"AVG(pymax2)\": 3585.85205078125,\n" +
        "            \"AVG(pymin2)\": 3585.2900390625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.441650390625,\n" +
        "            \"AVG(py2)\": 3585.6142578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:28\",\n" +
        "            \"AVG(pymax2)\": 3585.91015625,\n" +
        "            \"AVG(pymin2)\": 3585.181640625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.44287109375,\n" +
        "            \"AVG(py2)\": 3585.6005859375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:29\",\n" +
        "            \"AVG(pymax2)\": 3586.03466796875,\n" +
        "            \"AVG(pymin2)\": 3584.953857421875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.4130859375,\n" +
        "            \"AVG(py2)\": 3585.566162109375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:30\",\n" +
        "            \"AVG(pymax2)\": 3585.953369140625,\n" +
        "            \"AVG(pymin2)\": 3585.246826171875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.2099609375,\n" +
        "            \"AVG(py2)\": 3585.61376953125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:31\",\n" +
        "            \"AVG(pymax2)\": 3585.8505859375,\n" +
        "            \"AVG(pymin2)\": 3585.373291015625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.849365234375,\n" +
        "            \"AVG(py2)\": 3585.5703125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:32\",\n" +
        "            \"AVG(pymax2)\": 3585.922607421875,\n" +
        "            \"AVG(pymin2)\": 3585.317626953125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.32177734375,\n" +
        "            \"AVG(py2)\": 3585.560791015625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:33\",\n" +
        "            \"AVG(pymax2)\": 3585.947265625,\n" +
        "            \"AVG(pymin2)\": 3585.2021484375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.416259765625,\n" +
        "            \"AVG(py2)\": 3585.530517578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:34\",\n" +
        "            \"AVG(pymax2)\": 3585.931884765625,\n" +
        "            \"AVG(pymin2)\": 3585.1953125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.00732421875,\n" +
        "            \"AVG(py2)\": 3585.519775390625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:35\",\n" +
        "            \"AVG(pymax2)\": 3585.994384765625,\n" +
        "            \"AVG(pymin2)\": 3585.131591796875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.845947265625,\n" +
        "            \"AVG(py2)\": 3585.552490234375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:36\",\n" +
        "            \"AVG(pymax2)\": 3585.9462890625,\n" +
        "            \"AVG(pymin2)\": 3585.140625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.0732421875,\n" +
        "            \"AVG(py2)\": 3585.545654296875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:37\",\n" +
        "            \"AVG(pymax2)\": 3585.808349609375,\n" +
        "            \"AVG(pymin2)\": 3585.295166015625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.56494140625,\n" +
        "            \"AVG(py2)\": 3585.534912109375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:38\",\n" +
        "            \"AVG(pymax2)\": 3585.944091796875,\n" +
        "            \"AVG(pymin2)\": 3585.227294921875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.2841796875,\n" +
        "            \"AVG(py2)\": 3585.483642578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:39\",\n" +
        "            \"AVG(pymax2)\": 3585.786865234375,\n" +
        "            \"AVG(pymin2)\": 3585.192626953125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.302001953125,\n" +
        "            \"AVG(py2)\": 3585.5146484375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:40\",\n" +
        "            \"AVG(pymax2)\": 3585.87890625,\n" +
        "            \"AVG(pymin2)\": 3585.20556640625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.468994140625,\n" +
        "            \"AVG(py2)\": 3585.467529296875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:41\",\n" +
        "            \"AVG(pymax2)\": 3585.879638671875,\n" +
        "            \"AVG(pymin2)\": 3585.097900390625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.675537109375,\n" +
        "            \"AVG(py2)\": 3585.472900390625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:42\",\n" +
        "            \"AVG(pymax2)\": 3585.889892578125,\n" +
        "            \"AVG(pymin2)\": 3584.970947265625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.240234375,\n" +
        "            \"AVG(py2)\": 3585.484130859375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:43\",\n" +
        "            \"AVG(pymax2)\": 3585.970458984375,\n" +
        "            \"AVG(pymin2)\": 3585.075927734375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.0869140625,\n" +
        "            \"AVG(py2)\": 3585.47412109375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:44\",\n" +
        "            \"AVG(pymax2)\": 3585.893798828125,\n" +
        "            \"AVG(pymin2)\": 3585.15283203125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.599609375,\n" +
        "            \"AVG(py2)\": 3585.41943359375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:45\",\n" +
        "            \"AVG(pymax2)\": 3585.77685546875,\n" +
        "            \"AVG(pymin2)\": 3585.12255859375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.844970703125,\n" +
        "            \"AVG(py2)\": 3585.49462890625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:46\",\n" +
        "            \"AVG(pymax2)\": 3585.861572265625,\n" +
        "            \"AVG(pymin2)\": 3585.247802734375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.931396484375,\n" +
        "            \"AVG(py2)\": 3585.45751953125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:47\",\n" +
        "            \"AVG(pymax2)\": 3585.769287109375,\n" +
        "            \"AVG(pymin2)\": 3585.159423828125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.296630859375,\n" +
        "            \"AVG(py2)\": 3585.392578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:48\",\n" +
        "            \"AVG(pymax2)\": 3585.7861328125,\n" +
        "            \"AVG(pymin2)\": 3584.990234375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.913330078125,\n" +
        "            \"AVG(py2)\": 3585.417236328125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:49\",\n" +
        "            \"AVG(pymax2)\": 3585.823974609375,\n" +
        "            \"AVG(pymin2)\": 3585.06201171875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3583.854248046875,\n" +
        "            \"AVG(py2)\": 3585.445068359375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:50\",\n" +
        "            \"AVG(pymax2)\": 3585.80810546875,\n" +
        "            \"AVG(pymin2)\": 3585.076171875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.580810546875,\n" +
        "            \"AVG(py2)\": 3585.3671875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:51\",\n" +
        "            \"AVG(pymax2)\": 3585.708740234375,\n" +
        "            \"AVG(pymin2)\": 3584.984619140625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.5771484375,\n" +
        "            \"AVG(py2)\": 3585.42333984375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:52\",\n" +
        "            \"AVG(pymax2)\": 3585.753173828125,\n" +
        "            \"AVG(pymin2)\": 3585.069091796875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.36181640625,\n" +
        "            \"AVG(py2)\": 3585.3818359375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:53\",\n" +
        "            \"AVG(pymax2)\": 3585.6533203125,\n" +
        "            \"AVG(pymin2)\": 3585.052734375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.91943359375,\n" +
        "            \"AVG(py2)\": 3585.352294921875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:54\",\n" +
        "            \"AVG(pymax2)\": 3585.738525390625,\n" +
        "            \"AVG(pymin2)\": 3585.090087890625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.718017578125,\n" +
        "            \"AVG(py2)\": 3585.3154296875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:55\",\n" +
        "            \"AVG(pymax2)\": 3585.736083984375,\n" +
        "            \"AVG(pymin2)\": 3584.953857421875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.061767578125,\n" +
        "            \"AVG(py2)\": 3585.43310546875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:56\",\n" +
        "            \"AVG(pymax2)\": 3585.79296875,\n" +
        "            \"AVG(pymin2)\": 3585.1435546875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.07275390625,\n" +
        "            \"AVG(py2)\": 3585.33935546875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:57\",\n" +
        "            \"AVG(pymax2)\": 3585.7119140625,\n" +
        "            \"AVG(pymin2)\": 3585.0185546875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.638671875,\n" +
        "            \"AVG(py2)\": 3585.372802734375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:58\",\n" +
        "            \"AVG(pymax2)\": 3585.857177734375,\n" +
        "            \"AVG(pymin2)\": 3585.14599609375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.455322265625,\n" +
        "            \"AVG(py2)\": 3585.310546875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:51:59\",\n" +
        "            \"AVG(pymax2)\": 3585.71240234375,\n" +
        "            \"AVG(pymin2)\": 3585.159912109375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.998291015625,\n" +
        "            \"AVG(py2)\": 3585.289794921875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:00\",\n" +
        "            \"AVG(pymax2)\": 3585.58935546875,\n" +
        "            \"AVG(pymin2)\": 3585.143798828125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.947265625,\n" +
        "            \"AVG(py2)\": 3585.211669921875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:01\",\n" +
        "            \"AVG(pymax2)\": 3585.6962890625,\n" +
        "            \"AVG(pymin2)\": 3585.02197265625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3583.37109375,\n" +
        "            \"AVG(py2)\": 3585.33984375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:02\",\n" +
        "            \"AVG(pymax2)\": 3585.7001953125,\n" +
        "            \"AVG(pymin2)\": 3585.05859375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.70458984375,\n" +
        "            \"AVG(py2)\": 3585.3076171875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:03\",\n" +
        "            \"AVG(pymax2)\": 3585.675537109375,\n" +
        "            \"AVG(pymin2)\": 3585.150634765625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.33251953125,\n" +
        "            \"AVG(py2)\": 3585.3349609375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:04\",\n" +
        "            \"AVG(pymax2)\": 3585.771728515625,\n" +
        "            \"AVG(pymin2)\": 3585.143798828125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.956787109375,\n" +
        "            \"AVG(py2)\": 3585.30126953125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:05\",\n" +
        "            \"AVG(pymax2)\": 3585.677490234375,\n" +
        "            \"AVG(pymin2)\": 3585.14501953125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.193115234375,\n" +
        "            \"AVG(py2)\": 3585.27783203125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:06\",\n" +
        "            \"AVG(pymax2)\": 3585.555419921875,\n" +
        "            \"AVG(pymin2)\": 3585.075927734375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.839599609375,\n" +
        "            \"AVG(py2)\": 3585.17919921875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:07\",\n" +
        "            \"AVG(pymax2)\": 3585.5478515625,\n" +
        "            \"AVG(pymin2)\": 3584.9091796875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.215087890625,\n" +
        "            \"AVG(py2)\": 3585.309814453125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:08\",\n" +
        "            \"AVG(pymax2)\": 3585.594482421875,\n" +
        "            \"AVG(pymin2)\": 3584.93212890625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.45361328125,\n" +
        "            \"AVG(py2)\": 3585.30517578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:09\",\n" +
        "            \"AVG(pymax2)\": 3585.62158203125,\n" +
        "            \"AVG(pymin2)\": 3584.966552734375\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.232421875,\n" +
        "            \"AVG(py2)\": 3585.331298828125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:10\",\n" +
        "            \"AVG(pymax2)\": 3585.76416015625,\n" +
        "            \"AVG(pymin2)\": 3584.95703125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3586.07470703125,\n" +
        "            \"AVG(py2)\": 3585.31884765625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:11\",\n" +
        "            \"AVG(pymax2)\": 3585.6337890625,\n" +
        "            \"AVG(pymin2)\": 3585.071533203125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.974609375,\n" +
        "            \"AVG(py2)\": 3585.249267578125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:12\",\n" +
        "            \"AVG(pymax2)\": 3585.456787109375,\n" +
        "            \"AVG(pymin2)\": 3585.059326171875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.088134765625,\n" +
        "            \"AVG(py2)\": 3585.163818359375,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:13\",\n" +
        "            \"AVG(pymax2)\": 3585.475830078125,\n" +
        "            \"AVG(pymin2)\": 3584.9296875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.11669921875,\n" +
        "            \"AVG(py2)\": 3585.297607421875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:14\",\n" +
        "            \"AVG(pymax2)\": 3585.5126953125,\n" +
        "            \"AVG(pymin2)\": 3585.01904296875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3583.68701171875,\n" +
        "            \"AVG(py2)\": 3585.299560546875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:15\",\n" +
        "            \"AVG(pymax2)\": 3585.406494140625,\n" +
        "            \"AVG(pymin2)\": 3585.1416015625\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.117431640625,\n" +
        "            \"AVG(py2)\": 3585.3828125,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:16\",\n" +
        "            \"AVG(pymax2)\": 3585.540771484375,\n" +
        "            \"AVG(pymin2)\": 3585.15673828125\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3584.734375,\n" +
        "            \"AVG(py2)\": 3585.4013671875,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:17\",\n" +
        "            \"AVG(pymax2)\": 3585.58642578125,\n" +
        "            \"AVG(pymin2)\": 3585.19873046875\n" +
        "        }\n" +
        "    },\n" +
        "    {\n" +
        "        \"version\": \"v1\",\n" +
        "        \"timestamp\": \"2017-06-14T16:51:19.000Z\",\n" +
        "        \"event\": {\n" +
        "            \"AVG(y2)\": 3585.044677734375,\n" +
        "            \"AVG(py2)\": 3585.369140625,\n" +
        "            \"timestamp_SECOND\": \"2017-06-14 16:52:18\",\n" +
        "            \"AVG(pymax2)\": 3585.55078125,\n" +
        "            \"AVG(pymin2)\": 3585.14697265625\n" +
        "        }\n" +
        "    }\n" +
        "]";

    JsonNode root = GlobalObjectMapper.getDefaultMapper().readValue(node, JsonNode.class);

    JsonNode result = new SearchQueryRequest().makeResult(root);

    System.out.println(GlobalObjectMapper.writeValueAsString(result));
  }

}
