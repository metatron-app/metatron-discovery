package app.metatron.discovery.domain.tag;

/**
 *
 */
public class TagTreeDTO {
  String id;
  String name;
  Long count;

  public TagTreeDTO(String id, String name){
    this.id = id;
    this.name = name;
    this.count = 0L;
  }

  public TagTreeDTO(String id, String name, Long count){
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

  @Override
  public String toString() {
    return "TagTreeDTO{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", count=" + count +
        '}';
  }
}
