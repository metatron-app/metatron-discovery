/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.images;

import app.metatron.discovery.util.PolarisUtils;
import org.imgscalr.Scalr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import javax.validation.Valid;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

/**
 * Created by kyungtaak on 2016. 7. 21..
 */
@RepositoryRestController
public class ImageController {

  private static final Logger LOGGER = LoggerFactory.getLogger(ImageController.class);

  private static final int THUMBNAIL_SIZE = 100;

  @Autowired
  ImageService imageService;

  @Autowired
  ImageRepository imageRepository;

  @RequestMapping(path = "/images/upload", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> uploadImage(@Valid Image image,
                                       @RequestParam("file") MultipartFile file,
                                      @RequestParam(value = "thumbnailSize", required = false, defaultValue = "" + THUMBNAIL_SIZE) int thumbNailSize) {

    image.setFileName(file.getOriginalFilename());

    try {
      image.setOriginal(file.getBytes());

//      File target = new File("test");
//      FileUtils.writeByteArrayToFile(target, file.getBytes());

    } catch (IOException e) {
      LOGGER.error("Fail to transfer image file: " + e.getMessage());
      return ResponseEntity.badRequest().build();
    }

    try {
      image.setThumbnail(createThumbnail(file.getInputStream(), thumbNailSize));
    } catch (IOException e) {
      LOGGER.error("Fail to create thumbnail image: " + e.getMessage());
      return ResponseEntity.badRequest().build();
    }

    imageRepository.saveAndFlush(image);

    final URI location = ServletUriComponentsBuilder
            .fromCurrentServletMapping().path("/api/images/{id}").build()
            .expand(image.getId()).toUri();

    return ResponseEntity.created(location).body(image);

  }

  @RequestMapping(path = "/images/load/id", method = RequestMethod.GET,
          produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE})
  public ResponseEntity<?> getLoadImageById(@RequestParam(name = "id") String id,
                                        @RequestParam(name = "thumbnail", required = false, defaultValue = "false") boolean thumbnail) {

    Image image = imageRepository.findOne(id);
    if(image == null) {
      return ResponseEntity.notFound().build();
    }

    final HttpHeaders headers = new HttpHeaders();

    byte[] imageBinaries = null;
    if(thumbnail) {
      imageBinaries = image.getThumbnail();
      headers.setContentType(MediaType.IMAGE_JPEG);
    } else {
      imageBinaries = image.getOriginal();
      headers.setContentType(PolarisUtils.checkMediaTypeFromFileName(image.getFileName()));
    }

    return new ResponseEntity<>(imageBinaries, headers, HttpStatus.OK);

  }

  @RequestMapping(path = "/images/load/url", method = RequestMethod.GET,
          produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE, MediaType.ALL_VALUE})
  public ResponseEntity<?> getImageByUrl(@RequestParam("url") String url) {

    Image image = imageService.loadImageByImageUrl(url);

    final HttpHeaders headers = new HttpHeaders();

    boolean thumbnail = false;
    if(url.indexOf("/thumbnail") > 0) {
      thumbnail = true;
    }

    byte[] imageBinaries = null;
    if(thumbnail) {
      imageBinaries = image.getThumbnail();
      headers.setContentType(MediaType.IMAGE_JPEG);
    } else {
      imageBinaries = image.getOriginal();
      headers.setContentType(PolarisUtils.checkMediaTypeFromFileName(image.fileName));
    }


    return new ResponseEntity<>(imageBinaries, headers, HttpStatus.OK);
  }

  private byte[] createThumbnail(InputStream in, int size) throws IOException {

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    BufferedImage thumbnail = ImageIO.read(in);

    //이미지 색상이 변경되는 현상이 있어서 해당 로직 추가
    BufferedImage convertedImg = new BufferedImage(thumbnail.getWidth(), thumbnail.getHeight(), BufferedImage.TYPE_INT_RGB);
    convertedImg.getGraphics().drawImage(thumbnail, 0, 0, null);
    thumbnail = convertedImg;

    int width = thumbnail.getWidth();
    int height = thumbnail.getHeight();
    if (width > size || height > size) {
      if (width > height) {
        thumbnail = Scalr.resize(thumbnail, Scalr.Method.QUALITY, Scalr.Mode.FIT_TO_HEIGHT, size);
//        thumbnail = Scalr.crop(thumbnail, thumbnail.getWidth() / 2 - size / 2, 0, size, size); //crop 안하고 리사이즈만 적용하는걸로 수정 20161010
      } else {
        thumbnail = Scalr.resize(thumbnail, Scalr.Method.QUALITY, Scalr.Mode.FIT_TO_WIDTH, size);
//        thumbnail = Scalr.crop(thumbnail, 0, thumbnail.getWidth() / 2 - size / 2, size, size); //crop 안하고 리사이즈만 적용하는걸로 수정 20161010
      }
    }

    try {
      ImageIO.write(thumbnail, "jpeg", baos);
      baos.flush();
      return baos.toByteArray();
    } finally {
      baos.close();
    }
  }


}
