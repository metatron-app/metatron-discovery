package app.metatron.discovery.domain.workspace;


import app.metatron.discovery.common.GlobalObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class BookAuditLogService {
  private static final Logger LOGGER = LoggerFactory.getLogger(BookAuditLogService.class);

  private BookDataDownloadHistoryRepository bookDataDownloadHistoryRepository;

  @Autowired
  public void setBookDataDownloadHistoryRepository(BookDataDownloadHistoryRepository bookDataDownloadHistoryRepository) {
    this.bookDataDownloadHistoryRepository = bookDataDownloadHistoryRepository;
  }

  public void logDataDownload(String bookType, String bookId, String query) {
    try {
      bookDataDownloadHistoryRepository.save(
          new BookDataDownloadHistory(bookType,
              bookId,
              query));
    } catch (Exception e) {
      LOGGER.error("error Logging workspace audit logs for data downloads from workbenches and workbook", e);
    }
  }
}
