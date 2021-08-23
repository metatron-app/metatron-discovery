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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datasource.validation;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import app.metatron.discovery.domain.datasource.Field;

public class DuplicatedFieldValidator implements ConstraintValidator<DuplicatedFieldValidation, List<Field>> {

  @Override
  public void initialize(DuplicatedFieldValidation duplicatedFieldValidation) {
  }

  @Override
  public boolean isValid(List<Field> fields, ConstraintValidatorContext constraintValidatorContext) {

    Set<String> fieldNames = new HashSet<>();
    for(Field field : fields) {
      if (fieldNames.contains(field.getName())){
        constraintValidatorContext.disableDefaultConstraintViolation();
        constraintValidatorContext
            .buildConstraintViolationWithTemplate("Duplicated Field : " + field.getName())
            .addConstraintViolation();
        return false;
      } else {
        fieldNames.add(field.getName());
      }
    }

    return true;
  }
}
