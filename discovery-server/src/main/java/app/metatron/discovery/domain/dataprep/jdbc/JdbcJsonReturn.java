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

package app.metatron.discovery.domain.dataprep.jdbc;

import java.util.List;

/**
 * Created by seungunchoe on 2017. 11. 13..
 */

public class JdbcJsonReturn {
    private List<String> json;
    private List<String> meta;  // column name
    //private List<com.sk.eddy.types.DataType> types;

    public JdbcJsonReturn(List<String> json, List<String> meta) {//, List<com.sk.eddy.types.DataType> types) {
        this.json = json;
        this.meta = meta;
 //       this.types = types;
    }

  public List<String> getJson() {
        return json;
    }

    public List<String> getMeta() {
        return meta;
    }

//    public List<com.sk.eddy.types.DataType> getTypes() {
//        return types;
//    }
}
