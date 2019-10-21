package app.metatron.discovery.domain.mdm.catalog;

import java.util.List;
import java.util.Map;

/**
 *
 */
public class CatalogCountDTO {

  String id;
  String name;
  Long count;
  List<Map<String, String>> hierarchies;

  public CatalogCountDTO(String id, String name){
    this.id = id;
    this.name = name;
    this.count = 0L;
  }

  public CatalogCountDTO(String id, Integer count){
    this.id = id;
    this.count = Long.valueOf(count);
  }

  public CatalogCountDTO(String id, Long count){
    this.id = id;
    this.count = count;
  }

  public CatalogCountDTO(String id, String name, Integer count){
    this.id = id;
    this.name = name;
    this.count = Long.valueOf(count);
  }

  public CatalogCountDTO(String id, String name, Long count){
    this.id = id;
    this.name = name;
    this.count = count;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  public List<Map<String, String>> getHierarchies() {
    return hierarchies;
  }

  public void setHierarchies(List<Map<String, String>> hierarchies) {
    this.hierarchies = hierarchies;
  }

  @Override
  public String toString() {
    return "CatalogCountDTO{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", count=" + count +
        ", hierarchies=" + hierarchies +
        '}';
  }
}
