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

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.PropertyWriter;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;

public class PrepDatasetJsonFilter extends SimpleBeanPropertyFilter {
    @Override
    public void serializeAsField(Object pojo, JsonGenerator jgen, SerializerProvider provider, PropertyWriter writer) throws Exception {
        if (pojo instanceof PrepDataset) {
            if (canSerializeAsField((PrepDataset) pojo, writer.getName())) {
                super.serializeAsField(pojo, jgen, provider, writer);
            }
        }
        else {
            super.serializeAsField(pojo, jgen, provider, writer);
        }
    }

    private boolean canSerializeAsField(PrepDataset dataset, String fieldName) {
        if (fieldName.equals("dataset")) {
            return false;
        }
        return true;
    }
}


