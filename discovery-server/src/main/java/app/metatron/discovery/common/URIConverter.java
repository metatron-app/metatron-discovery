package app.metatron.discovery.common;

import org.springframework.boot.context.properties.ConfigurationPropertiesBinding;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;

@Component
@ConfigurationPropertiesBinding
public class URIConverter implements Converter<String, URI> {


  @Override
  public URI convert(String value) {

    if(value == null){
      return null;
    }

    try {
      URI uri = new URI(value.replace(" ", "%20"));
      return uri;
    } catch (URISyntaxException e) {
      e.printStackTrace();
    }
    return null;
  }
}
