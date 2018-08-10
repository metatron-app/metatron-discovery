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

package app.metatron.discovery.common.entity;

import com.fasterxml.jackson.databind.type.CollectionType;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2017. 7. 18..
 */
@Component
public class SpecValidator implements ConstraintValidator<Spec, String> {

  private static Logger LOGGER = LoggerFactory.getLogger(SpecValidator.class);

  private Class target;

  private boolean isArray;

  @Override
  public void initialize(Spec specAnnotation) {
    if(specAnnotation.target() == null) {
      throw new IllegalArgumentException("target class required.");
    }
    target = specAnnotation.target();
    isArray = specAnnotation.isArray();
  }

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {

    LOGGER.debug("Check spec for {} : {}", target, value);

    if(StringUtils.isEmpty(value)) {
      return true;
    }

    try {
      if(isArray) {
        CollectionType type = GlobalObjectMapper.getDefaultMapper()
                                                .getTypeFactory().constructCollectionType(List.class, target);
        GlobalObjectMapper.getDefaultMapper().readValue(value, type);
      } else {
        GlobalObjectMapper.getDefaultMapper().readValue(value, target);
      }
    } catch (IOException e) {
      LOGGER.warn("Invalid spec({}) : {}", target.getName(), e.getMessage());
      return false;
    }

    return true;
  }
}
