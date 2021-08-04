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

package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.common.datasource.DataType;
import com.google.common.collect.Sets;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;

import org.assertj.core.util.Lists;
import org.junit.Test;

import java.util.*;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by kyungtaak on 2016. 10. 20..
 */
public class DataSourceTest {
  @Test
  public void getRegexDataSourceName() throws Exception {

    DataSource dataSource = new DataSource();
    dataSource.setName("fdc_summary");
    dataSource.setPartitionKeys("fab,eqp_id");
    dataSource.setPartitionSeparator("_");

    // 2개 모두 비어있는 경우
    LinkedHashMap<String, Set<String>> model1 = Maps.newLinkedHashMap();
    model1.put("fab", Sets.newHashSet());
    model1.put("eqp_id", Sets.newHashSet());
    System.out.println(dataSource.getRegexDataSourceName(model1));

    // 첫번째 값이 비어있는 경우
    LinkedHashMap<String, Set<String>> model2 = Maps.newLinkedHashMap();
    model2.put("fab", Sets.newHashSet());
    model2.put("eqp_id", Sets.newHashSet("CMP102"));
    System.out.println(dataSource.getRegexDataSourceName(model2));

    // 마지막 값이 비어있는 경우
    LinkedHashMap<String, Set<String>> model3 = Maps.newLinkedHashMap();
    model3.put("fab", Sets.newHashSet("M10"));
    model3.put("eqp_id", Sets.newHashSet());
    System.out.println(dataSource.getRegexDataSourceName(model3));
  }

  @Test
  public void isFieldMatchedByNames_matched() {
    // given
    DataSource dataSource = new DataSource();
    dataSource.addField(new Field("time", DataType.STRING, Field.FieldRole.TIMESTAMP, 1));
    dataSource.addField(new Field("d", DataType.STRING, Field.FieldRole.DIMENSION, 2));
    dataSource.addField(new Field("m", DataType.STRING, Field.FieldRole.MEASURE, 3));

    List<String> matchingFieldNames = Arrays.asList("d", "m");

    // when
    boolean actual = dataSource.isFieldMatchedByNames(matchingFieldNames);

    // then
    assertThat(actual).isTrue();
  }

  @Test
  public void isFieldMatchedByNames_not_matched() {
    // given
    DataSource dataSource = new DataSource();
    dataSource.addField(new Field("time", DataType.STRING, Field.FieldRole.TIMESTAMP, 1));
    dataSource.addField(new Field("d", DataType.STRING, Field.FieldRole.DIMENSION, 2));
    dataSource.addField(new Field("m", DataType.STRING, Field.FieldRole.MEASURE, 3));

    List<String> matchingFieldNames = Arrays.asList("d", "m", "m2");

    // when
    boolean actual = dataSource.isFieldMatchedByNames(matchingFieldNames);

    // then
    assertThat(actual).isFalse();
  }

  @Test
  public void isFieldMatchedByNames_empty_field() {
    // given
    DataSource dataSource = new DataSource();

    List<String> matchingFieldNames = Arrays.asList("d", "m", "m2");

    // when
    boolean actual = dataSource.isFieldMatchedByNames(matchingFieldNames);

    // then
    assertThat(actual).isFalse();
  }

  @Test
  public void synchronizeFields() {
    // given
    DataSource dataSource = new DataSource();
    dataSource.addField(new Field("time", DataType.STRING, Field.FieldRole.TIMESTAMP, 1));
    dataSource.addField(new Field("d", DataType.STRING, Field.FieldRole.DIMENSION, 2));
    dataSource.addField(new Field("m", DataType.STRING, Field.FieldRole.MEASURE, 3));

    List<Field> candidateFields = getCandidateFields();

    // when
    dataSource.synchronizeFields(candidateFields);

    // then
    List<Field> actualFields = dataSource.getFields();
    assertThat(actualFields).hasSize(5);
    assertThat(actualFields).extracting("seq")
        .contains(1L, 2L, 3L, 4L, 5L);
    assertThat(actualFields).extracting("name")
        .contains("time", "d", "m", "d2", "m2");
    assertThat(actualFields).extracting("role")
        .contains(Field.FieldRole.TIMESTAMP, Field.FieldRole.DIMENSION, Field.FieldRole.MEASURE, Field.FieldRole.DIMENSION, Field.FieldRole.MEASURE);
  }

  private List<Field> getCandidateFields() {
    List<Field> candidateFields = new ArrayList<>();

    Field candidateField1 = new Field();
    candidateField1.setName("d2");
    candidateField1.setType(DataType.STRING);
    candidateField1.setRole(Field.FieldRole.DIMENSION);
    candidateFields.add(candidateField1);

    Field candidateField2 = new Field();
    candidateField2.setName("m2");
    candidateField2.setType(DataType.STRING);
    candidateField2.setRole(Field.FieldRole.MEASURE);
    candidateFields.add(candidateField2);

    Field candidateField3 = new Field();
    candidateField3.setName("m");
    candidateField3.setType(DataType.STRING);
    candidateField3.setRole(Field.FieldRole.MEASURE);
    candidateFields.add(candidateField3);

    Field candidateField4 = new Field();
    candidateField4.setName("d");
    candidateField4.setType(DataType.STRING);
    candidateField4.setRole(Field.FieldRole.DIMENSION);
    candidateFields.add(candidateField4);

    return candidateFields;
  }

  @Test
  public void duplicatedFieldTest() {

    List<Field> fields = Lists.newArrayList();

    // Create a field
    Field m1 = new Field();
    m1.setName("measure1");
    m1.setType(DataType.DOUBLE);
    m1.setRole(Field.FieldRole.MEASURE);

    fields.add(m1);

    // Create a second field with same name (measure1)
    Field m2 = new Field();
    m2.setName("measure1");
    m2.setType(DataType.DOUBLE);
    m2.setRole(Field.FieldRole.MEASURE);

    fields.add(m2);

    final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    final DataSource ds = new DataSourceBuilder()
        .name("DuplicatedDatasource")
        .fields(m1, m2)
        .build();

    final Collection<ConstraintViolation<DataSource>> constraintViolations = validator.validate(ds);

    assertThat(constraintViolations.iterator().next().getMessage()
        .equals("Duplicated Field : " + m1.getName())).isTrue();
  }

}
