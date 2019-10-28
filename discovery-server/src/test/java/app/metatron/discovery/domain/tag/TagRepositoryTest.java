package app.metatron.discovery.domain.tag;

import com.querydsl.core.types.Predicate;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import app.metatron.discovery.RepositoryTest;
import app.metatron.discovery.common.entity.DomainType;

/**
 *
 */
public class TagRepositoryTest extends RepositoryTest {

  @Autowired
  TagRepository tagRepository;

  @Test
  @Sql({"/sql/test_tag.sql", "/sql/test_mdm.sql"})
  public void countTagWithCriteriaBuilder(){
    List<TagCountDTO> tags = tagRepository.findTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, null, true, new Sort("name"));
    for(TagCountDTO dto : tags){
      System.out.println(dto);
    }

    Assert.assertTrue(tags.size() == 10);

    tags = tagRepository.findTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, null, false, new Sort("name"));
    for(TagCountDTO dto : tags){
      System.out.println(dto);
      Assert.assertTrue(dto.getCount() > 0);
    }
    Assert.assertTrue(tags.size() == 6);

    String nameContains = "TAG";
    tags = tagRepository.findTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, nameContains, false, new Sort("name"));
    for(TagCountDTO dto : tags){
      System.out.println(dto);
      Assert.assertTrue(dto.getCount() > 0);
      Assert.assertTrue(dto.name.toUpperCase().contains(nameContains.toUpperCase()));
    }

    nameContains = "st_tag_0";
    tags = tagRepository.findTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, nameContains, true, new Sort("name"));
    for(TagCountDTO dto : tags){
      System.out.println(dto);
      Assert.assertTrue(dto.name.toUpperCase().contains(nameContains.toUpperCase()));
    }
  }

  @Test
  @Sql({"/sql/test_tag.sql", "/sql/test_mdm.sql"})
  public void countTagWithCriteriaBuilderTotalCount(){
    Long cnt = tagRepository.countTags(Tag.Scope.DOMAIN, DomainType.METADATA, null, true);
    System.out.println("cnt = " + cnt);
    Assert.assertTrue(cnt == 10L);

    cnt = tagRepository.countTags(Tag.Scope.DOMAIN, DomainType.METADATA, null, false);
    System.out.println("cnt = " + cnt);
    Assert.assertTrue(cnt == 6L);

    cnt = tagRepository.countTags(Tag.Scope.DOMAIN, DomainType.METADATA, "st_tag_0", true);
    System.out.println("cnt = " + cnt);
    Assert.assertTrue(cnt == 7L);
  }

  @Test
  @Sql({"/sql/test_tag.sql", "/sql/test_mdm.sql"})
  public void countTagWithCriteriaBuilderPaging(){
    PageRequest pageRequest = new PageRequest(0, 5);
    Page<TagCountDTO> tags = tagRepository.findTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, null, true, pageRequest);
    for(TagCountDTO dto : tags.getContent()){
      System.out.println(dto);
    }

    Assert.assertEquals(tags.getTotalElements(), 10);
    Assert.assertEquals(tags.getTotalPages(), 2);
    Assert.assertTrue(tags.getContent().size() <= pageRequest.getPageSize());
    Assert.assertEquals(tags.getNumber(), pageRequest.getPageNumber());
  }
}
