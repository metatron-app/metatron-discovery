package app.metatron.discovery.util;

import java.beans.PropertyEditorSupport;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 28/01/2019
 * Time : 11:01 AM
 */
public class CaseInsensitiveConverter <T extends Enum<T>> extends PropertyEditorSupport {

  private final Class<T> typeParameterClass;

  public CaseInsensitiveConverter(Class<T> typeParameterClass) {
    super();
    this.typeParameterClass = typeParameterClass;
  }

  @Override
  public void setAsText(final String text) throws IllegalArgumentException {
    String upper = text.toUpperCase();
    T value = T.valueOf(typeParameterClass, upper);
    setValue(value);
  }
}