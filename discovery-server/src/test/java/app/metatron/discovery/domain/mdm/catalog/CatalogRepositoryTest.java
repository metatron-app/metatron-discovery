package app.metatron.discovery.domain.mdm.catalog;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import app.metatron.discovery.RepositoryTest;

/**
 *
 */
public class CatalogRepositoryTest extends RepositoryTest {

  @Autowired
  CatalogRepository catalogRepository;

  @Test
  @Sql({"/sql/test_mdm.sql"})
  public void getListCatalogJoined(){
    List<CatalogCountDTO> catalogList = catalogRepository.getCatalogsWithCount(null);
    for(CatalogCountDTO catalog : catalogList){
      System.out.println("catalog = " + catalog.toString());
    }

    Assert.assertEquals(catalogList.size(), 5);
  }

  @Test
  @Sql({"/sql/test_mdm.sql"})
  public void getListCatalogJoinedPagination(){
    PageRequest pageable = new PageRequest(0, 3);
    Page<CatalogCountDTO> catalogCountDTOPage = catalogRepository.getCatalogsWithCount(null, pageable);
    for(CatalogCountDTO catalog : catalogCountDTOPage.getContent()){
      System.out.println("catalog = " + catalog.toString());
    }
    Assert.assertEquals(catalogCountDTOPage.getTotalPages(), 2);
    Assert.assertEquals(catalogCountDTOPage.getTotalElements(), 5);
    Assert.assertEquals(catalogCountDTOPage.getNumber(), pageable.getPageNumber());
    Assert.assertTrue(catalogCountDTOPage.getNumberOfElements() <= pageable.getPageSize());
  }

  @Test
  @Sql({"/sql/test_mdm.sql"})
  public void getListCatalogJoinedPaginationNameContains(){
    PageRequest pageable = new PageRequest(0, 3);
    String nameContains = "CATALOG2";
    Page<CatalogCountDTO> catalogCountDTOPage = catalogRepository.getCatalogsWithCount(nameContains, pageable);
    System.out.println("catalogCountDTOPage.getTotalElements() = " + catalogCountDTOPage.getTotalElements());
    System.out.println("catalogCountDTOPage.getTotalPages() = " + catalogCountDTOPage.getTotalPages());
    for(CatalogCountDTO catalog : catalogCountDTOPage.getContent()){
      System.out.println("catalog = " + catalog.toString());
      Assert.assertTrue(catalog.getName().toUpperCase().contains(nameContains.toUpperCase()));
    }
    Assert.assertEquals(catalogCountDTOPage.getTotalPages(), 1);
    Assert.assertEquals(catalogCountDTOPage.getTotalElements(), 3);
    Assert.assertEquals(catalogCountDTOPage.getNumber(), pageable.getPageNumber());
    Assert.assertTrue(catalogCountDTOPage.getNumberOfElements() <= pageable.getPageSize());
  }
}
