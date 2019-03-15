package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.PrUploadFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrUploadFileRepository extends JpaRepository<PrUploadFile,String> {

}

