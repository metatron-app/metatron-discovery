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

package app.metatron.discovery.util;

import com.google.common.collect.Lists;

import java.util.List;

public class EnumUtils extends org.apache.commons.lang3.EnumUtils {

  public static <E extends Enum<E>> boolean isValidUpperCaseEnum(final Class<E> enumClass, final String enumName) {
    if (enumName == null) {
      return false;
    }
    try {
      Enum.valueOf(enumClass, enumName.toUpperCase());
      return true;
    } catch (final IllegalArgumentException ex) {
      return false;
    }
  }

  public static <E extends Enum<E>> List<String> getEnumValues(final Class<E> enumClass) {
    List<String> enumValue = Lists.newArrayList();
    for (final Enum e: enumClass.getEnumConstants()) {
      enumValue.add(e.name());
    }
    return enumValue;
  }

  public static <E extends Enum<E>> E getEnum(final Class<E> enumClass, final String enumName, final E defaultValue) {
    if (enumName == null) {
      return defaultValue;
    }
    try {
      return Enum.valueOf(enumClass, enumName);
    } catch (final IllegalArgumentException ex) {
      return defaultValue;
    }
  }

  public static <E extends Enum<E>> E getUpperCaseEnum(final Class<E> enumClass, final String enumName) {
    if (enumName == null) {
      return null;
    }
    try {
      return Enum.valueOf(enumClass, enumName.toUpperCase());
    } catch (final IllegalArgumentException ex) {
      return null;
    }
  }

  public static <E extends Enum<E>> E getUpperCaseEnum(final Class<E> enumClass, final String enumName, final E defaultValue) {

    if (enumName == null) {
      return defaultValue;
    }
    try {
      return Enum.valueOf(enumClass, enumName.toUpperCase());
    } catch (final IllegalArgumentException ex) {
      return defaultValue;
    }
  }

  public static <E extends Enum<E>> E getCaseEnum(final Class<E> enumClass, final String enumName, final E defaultValue) {

    if (enumName == null) {
      return defaultValue;
    }

    String caseIgnoreName = null;
    if(isValidEnum(enumClass, enumName)) {
      caseIgnoreName = enumName;
    } else if(isValidEnum(enumClass, enumName.toUpperCase())) {
      caseIgnoreName = enumName.toUpperCase();
    } else if(isValidEnum(enumClass, enumName.toLowerCase())) {
      caseIgnoreName = enumName.toLowerCase();
    } else {
      return defaultValue;
    }

    return Enum.valueOf(enumClass, caseIgnoreName);
  }
}
