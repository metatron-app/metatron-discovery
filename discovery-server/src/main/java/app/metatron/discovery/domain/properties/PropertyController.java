package app.metatron.discovery.domain.properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PropertyController {
  private static Logger LOGGER = LoggerFactory.getLogger(PropertyController.class);

  @Value("${polaris.mapbox.accesstoken:}")
  String mapboxAccessToken;


  @RequestMapping(value = "/properties/{type}", method = RequestMethod.GET)
  public ResponseEntity<?> findStorageInfoByType(@PathVariable String type) {

    switch (type){
      case "mapbox":
        return ResponseEntity.ok(mapboxAccessToken);
      default:
        throw new IllegalArgumentException("Not supported type " + type);
    }
  }
}
