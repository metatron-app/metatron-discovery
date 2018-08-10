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

package app.metatron.discovery.domain.notebook;

import org.springframework.data.rest.webmvc.RepositoryRestController;

/**
 * Created by james on 2017. 7. 16..
 */
@RepositoryRestController
public class NotebookModelController {

//    private static Logger LOGGER = LoggerFactory.getLogger(NotebookModelController.class);
//
//    @Autowired
//    NotebookModelService modelService;
//
//    @Autowired
//    NotebookModelRepository modelRepository;
//
//    @Autowired
//    NotebookModelHistoryRepository modelHistoryRepository;
//
//    @Autowired
//    HttpRepository httpRepository;
//
//    @Autowired
//    MetatronProperties metatronProperties;
//
//    @Autowired
//    PagedResourcesAssembler pagedResourcesAssembler;
//
//
//    /**
//     * history 상세보기
//     */
//    @RequestMapping(path = "/nbmodels/{id}/history/{hid}", method = RequestMethod.GET,
//            produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE})
//    public @ResponseBody
//    ResponseEntity<?> viewResultOfExecution(@PathVariable("id") String id, @PathVariable("hid") Long hid) {
//        NotebookModel model = modelRepository.findOne(id);
//        if (model == null) {
//            return ResponseEntity.notFound().build();
//        }
//        NotebookModelHistory history = modelHistoryRepository.findOne(hid);
//        if (history == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(history.getResult());
//    }
//
//    /**
//     * 스크립트 파일 업로드
//     */
//    @RequestMapping(path = "/nbmodels/upload/script", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
//    public @ResponseBody
//    ResponseEntity<?> uploadScriptFile(
//            @RequestParam("file") MultipartFile file) {
//        String uniqFileName = UUID.randomUUID().toString() + "." + FilenameUtils.getExtension(file.getOriginalFilename());
//        String serverFilePath = metatronProperties.getNotebook().getBaseDir() + uniqFileName;
//        File serverFile = new File(serverFilePath);
//        try {
//            file.transferTo(serverFile);
//        } catch (IOException e) {
//            LOGGER.error("Failed to upload lookup file : " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//        LOGGER.debug("Uploaded server file : {}", serverFile.getAbsolutePath());
//
//        return ResponseEntity.ok(serverFilePath);
//    }
//
//    /**
//     * 어드민 > 모델 목록 > 검색
//     */
//    @RequestMapping(path = "/nbmodels/search", method = RequestMethod.GET)
//    public @ResponseBody
//    ResponseEntity<?> searchModels(
//            @RequestParam(required = false) String name,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) DateTime startDate,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) DateTime endDate,
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false) String subscribe,
//            Pageable pageable, PersistentEntityResourceAssembler resourceAssembler){
//
//        QNotebookModel notebookModel = QNotebookModel.notebookModel;
//
//        BooleanBuilder builder = new BooleanBuilder();
//        BooleanExpression fromModels = notebookModel.id
//                .in(JPAExpressions
//                        .select(notebookModel.id)
//                        .from(notebookModel));
//        builder.and(fromModels);
//
//        if(StringUtils.isNotEmpty(name)) {
//            builder = builder.and(notebookModel.name.containsIgnoreCase(name).or(notebookModel.createdBy.containsIgnoreCase(name)));
//        }
//        if(endDate != null) {
//            builder = builder.and(notebookModel.createdTime.between(startDate, endDate.plusDays(1)));
//        }
//        if(StringUtils.isNotEmpty(status)) {
//            NotebookModel.StatusType statusType = Enum.valueOf(NotebookModel.StatusType.class, status);
//            builder = builder.and(notebookModel.statusType.eq(statusType));
//        }
//        if(StringUtils.isNotEmpty(subscribe)) {
//            NotebookModel.SubscribeType subscribeType = Enum.valueOf(NotebookModel.SubscribeType.class, subscribe);
//            builder = builder.and(notebookModel.subscribeType.eq(subscribeType));
//        }
//
//        Page<NotebookModel> models = modelRepository.findAll(builder, pageable);
//
//        return ResponseEntity.ok(pagedResourcesAssembler.toResource(models, resourceAssembler));
//    }
//
//    /**
//     * 어드민 > 모델 목록 > 모델 실행
//     */
//    @RequestMapping(path = "/nbmodels/subscribe/{id}", method = RequestMethod.GET,
//            produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE})
//    public @ResponseBody
//    ResponseEntity<?> subscribeModel(@PathVariable("id") String id) {
//        NotebookModel model = modelRepository.findOne(id);
//        if (model == null) {
//            return ResponseEntity.notFound().build();
//        }
//        if( StringUtils.isEmpty(model.getScript()) || isNotExistFile(model.getScript())) {
//            forcePublishModel(model);
//        }
//        String response = "";
//        NotebookModelHistory history = new NotebookModelHistory();
//        history.setNotebookModel(model);
//        StopWatch watch = new StopWatch();
//        watch.start();
//        try {
//            response = modelService.execute(model);
//            history.setSuccess(true);
//        } catch (Exception e) {
//            LOGGER.error("Fail to generate notebook model reports.");
//            response = ExceptionUtils.getStackTrace(e);
//            history.setSuccess(false);
//        } finally {
//            watch.stop();
//            history.setElapsedTime(watch.getTotalTimeMillis());
//            history.setResult(response);
//            modelHistoryRepository.saveAndFlush(history);
//        }
//        return ResponseEntity.ok(response);
//    }
//
//    /**
//     * 어드민 > 모델 목록 > 모델 일괄 삭제
//     */
//    @RequestMapping(path = "/nbmodels/batch/{ids}", method = RequestMethod.DELETE)
//    public @ResponseBody
//    ResponseEntity<?> deleteModels(@PathVariable("ids") List<String> ids) {
//        List<NotebookModel> models = modelRepository.findByIdIn(ids);
//        if(models.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//        List<String> scripts = Lists.newArrayList();
//        for(NotebookModel model : models) {
//            scripts.add(model.getScript());
//        }
//        FileUtils.deleteFiles(scripts);
//        modelRepository.deleteByIdIn(ids);
//
//        return ResponseEntity.noContent().build();
//    }
//
//    /**
//     * check file exists
//     *
//     * @param filePath
//     * @return
//     */
//    private boolean isNotExistFile(String filePath) {
//        if(new File(filePath).exists()) {
//            return false;
//        } else {
//            return true;
//        }
//    }
//
//    /**
//     * make script file
//     *
//     * @param model
//     */
//    private void forcePublishModel(NotebookModel model) {
//        NotebookConnector connector = model.getNotebook().getConnector();
//        connector.setHttpRepository(httpRepository);
//        connector.setMetatronProperties(metatronProperties);
//        model.setScript(connector.publishModel(model));
//        modelRepository.save(model);
//    }

}
