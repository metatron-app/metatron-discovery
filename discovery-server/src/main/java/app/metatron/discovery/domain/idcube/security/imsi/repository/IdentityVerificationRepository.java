package app.metatron.discovery.domain.idcube.security.imsi.repository;

import app.metatron.discovery.domain.idcube.security.imsi.entity.IdentityVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdentityVerificationRepository extends JpaRepository<IdentityVerification, Long> {
}
