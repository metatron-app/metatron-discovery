import * as _ from 'lodash';

// https://github.com/moxiecode/plupload/wiki/Options
export namespace Pluploader {
  // https://github.com/moxiecode/plupload/wiki/Uploader
  export class Uploader {
    // Properties
    id?: string;
    state?;
    features?;
    runtime?;
    files?;
    settings?;
    total?;

    // Method
    init?: Function;
    setOption?: Function;
    getOption?: Function;
    refresh?: Function;
    start?: Function;
    stop?: Function;
    disableBrowse?: Function;
    getFile?: Function;
    addFile?: Function;
    removeFile?: Function;
    splice?: Function;
    trigger?: Function;
    hasEventListener?: Function;
    bind?: Function;
    unbind?: Function;
    unbindAll?: Function;
    destroy?: Function;

    // Events
    Init?: Function;
    PostInit?: Function;
    OptionChanged?: Function;
    Refresh?: Function;
    StateChanged?: Function;
    Browse?: Function;
    FileFiltered?: Function;
    QueueChanged?: Function;
    FilesAdded?: Function;
    FilesRemoved?: Function;
    BeforeUpload?: Function;
    UploadFile?: Function;
    UploadProgress?: Function;
    BeforeChunkUpload?: Function;
    ChunkUploaded?: Function;
    FileUploaded?: Function;
    UploadComplete?: Function;
    Error?: Function;
    Destroy?: Function;
  }

  export namespace Builder {
    export class UploaderOptionsBuilder {
      private _browseButton: string;
      private _url: string;

      private _filters: FileFilters;
      private _headers: object;
      private _multipart: boolean;
      private _multipartParams: object;
      private _maxRetries: number;
      private _chunkSize: number | string;
      private _resize: ImageResize;
      private _dropElement: string;
      private _multiSelection: boolean;
      private _requiredFeatures: string | object;
      private _uniqueNames: boolean;
      private _runtimes: string;
      private _fileDataName: string;
      private _container: string;
      private _flashSwfUrl: string;

      private _httpMethod: 'POST' | 'PUT';



      private _silverlightXapUrl: string;
      private _sendChunkNumber: boolean;
      private _sendFileName: boolean;

      private _init;

      // TODO
      Init(value): UploaderOptionsBuilder {
        this._init = value;
        return this;
      }
      get init() {
        return this._init;
      }

      ////////////////////////////////
      //// Required
      ////////////////////////////////

      /**
       * Almost any DOM element can be turned into a file dialog trigger, but usually it is either a button, actual file input or an image.
       * Value for the option can be either a DOM element itself or its id
       * 파일 업로더 박스를 사용할 DOM 요소 또는 DOM 요소의 ID
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      BrowseButton(value: string): UploaderOptionsBuilder {
        this._browseButton = value;
        return this;
      }
      get browseButton() {
        return this._browseButton;
      }

      /**
       * Url of the server-side upload handler that will accept the files, do some security checks and finally move them to a destination folder.
       * Might be relative or absolute
       * 파일을 업로드할 URL 주소
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Url(value: string): UploaderOptionsBuilder {
        this._url = value;
        return this;
      }
      get url() {
        return this._url;
      }

      ////////////////////////////////
      //// Optional
      ////////////////////////////////

      /**
       * Plupload comes with several built-in filters that provide a way to restrict a selection (or perhaps an upload) of files that do not meet specific requirements
       * 업로드가능한 파일에 대해 필터를 설정
       * @param {FileFilters} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Filters(value: FileFilters): UploaderOptionsBuilder {
        this._filters = value;
        return this;
      }
      get filters(): FileFilters {
        return this._filters;
      }

      /**
       * A way to pass custom HTTP headers with each upload request.
       * The option is simple set of key/value pairs of header names and their values.
       * - Not supported by html4 runtime.
       * - Requires special operational mode in case of flash and silverlight runtimes.
       * 파일 업로드시 HTTP 헤더에 설정할 key-value
       * @param {object} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Headers(value: object): UploaderOptionsBuilder {
        this._headers = value;
        return this;
      }
      get headers(): object {
        return this._headers;
      }

      /**
       * Whether to send the file as multipart/form-data (default) or binary stream.
       * The latter case is not supported by html4 and is a bit troublesome in flash runtime.
       * It also requires a special care on server-side
       * Multipart 형식의 메시지로 파일 및 추가 매개 변수 전송 여부 (기본값: TRUE)
       * @param {boolean} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Multipart(value: boolean): UploaderOptionsBuilder {
        this._multipart = value;
        return this;
      }
      get multipart(): boolean {
        return this._multipart;
      }

      /**
       * Additional multipart fields to be passed along with each upload request.
       * Each field can be represented by simple key/value pair or some nested arrays and/or objects
       * Multipart 파일 업로드와 함께 보낼 key/value Objects.
       * @param {object} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      MultipartParams(value: object): UploaderOptionsBuilder {
        this._multipartParams = value;
        return this;
      }
      get multipartParams(): object {
        return this._multipartParams;
      }

      /**
       * If max_retries is greater than 0, upload will be retried that many times every time there is plupload.HTTP_ERROR detected.
       * Be it complete file or a single chunk.
       * 오류 이벤트를 수행하기 전에 chunk 또는 파일을 업로드를 재시도할 횟수 (기본값: 0)
       * @param {number} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      MaxRetries(value: number): UploaderOptionsBuilder {
        this._maxRetries = value;
        return this;
      }
      get maxRetries(): number {
        return this._maxRetries;
      }

      /**
       * Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. (default: disabled)
       * 파일을 잘라 넣을 청크 크기(바이트). b, kb, mb, gb, tb 접미사가 있는 쇼커트도 지원된다 (기본값: 사용안함)
       * e.g. 204800 or "204800b" or "200kb"
       * @param {number | string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      ChunkSize(value: number | string): UploaderOptionsBuilder {
        this._chunkSize = value;
        return this;
      }
      get chunkSize() {
        return this._chunkSize;
      }

      /**
       * Plupload can downsize the images on client-side, mainly to save the bandwidth.
       * Perfect solution for thumbs, avatars and such. Currently not recommended for images sensible to quality drop
       * Plupload는 주로 대역폭을 절약하기 위해 클라이언트측에서 이미지 크기를 줄일 수 있다. 엄지손가락, 아바타 등을 위한 완벽한 솔루션. 현재 화질 하락에 대한 센스 있는 이미지에는 권장되지 않는다
       * e.g new ImageResizeBuilder().width(10)
       * @param {ImageResize} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Resize(value: ImageResize): UploaderOptionsBuilder {
        this._resize = value;
        return this;
      }
      get resize(): ImageResize {
        return this._resize;
      }

      /**
       * The DOM element to be used as the dropzone for the files, or folders (Chrome 21+).
       * Can be an id of the DOM element or the DOM element itself, or an array of DOM elements (in the case of multiple dropzones).
       * Currently supported only by html5 runtime (and this will probably never change).
       * Drag drop 시 업로더 활성화 영역으로 사용할 DOM 요소 또는 DOM 요소의 ID
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      DropElement(value: string): UploaderOptionsBuilder {
        this._dropElement = value;
        return this;
      }
      get dropElement() {
        return this._dropElement;
      }

      /**
       * This option allows you to select multiple files from the browse dialog.
       * It is enabled by default, but not possible in some environments and runtimes.
       * 파일 업로더 상자에서 한 번에 여러 파일을 선택할 수 있는 기능 사용 (기본값: TRUE)
       * @param {boolean} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      MultiSelection(value: boolean): UploaderOptionsBuilder {
        this._multiSelection = value;
        return this;
      }
      get multiSelection(): boolean {
        return this._multiSelection;
      }

      /**
       * required_features is an option of mixed type - it can be a comma-separated string of features to take into account.
       * Or - an object of key/value pairs, where the key represents the required feature and the value must be fulfilled by the runtime in question.
       * Or it can be simply set to true and then the configuration itself will be translated into a corresponding set of features that the selected runtime must have to fulfill the expectations.
       * @param {string | object} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      RequiredFeatures(value: string | object): UploaderOptionsBuilder {
        this._requiredFeatures = value;
        return this;
      }
      get requiredFeatures(): string | object {
        return this._requiredFeatures;
      }

      /**
       * When set to true, will generate an unique file name for the uploaded file and send it as an additional argument - name.
       * This argument can then be used by the server-side upload handler to save the file under that name.
       * 이 옵션이 TRUE라면 업로드된 파일에 대한 고유한 파일 이름이 생성 (기본값: FALSE)
       * @param {boolean} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      UniqueNames(value: boolean): UploaderOptionsBuilder {
        this._uniqueNames = value;
        return this;
      }
      get uniqueNames(): boolean {
        return this._uniqueNames;
      }

      /**
       * Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails (default: html5,flash,silverlight,html4)
       * You only need to provide this option if you want to change the order in which runtimes will be tried, or want to exclude some of them at all.
       * Uploader 가능한 클라이언트 목록 (기본값: html5,flash,silverlight,html4)
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Runtimes(value: string): UploaderOptionsBuilder {
        this._runtimes = value;
        return this;
      }
      get runtimes(): string {
        return this._runtimes;
      }

      /**
       * Value of file_data_name will be used as the name for the file field in multipart request.
       * If for some reason you need it to be named differently, you can pass a different value for file_data_name.
       * Multipart 형식 메시지의 파일 필드 이름 (기본값: file)
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      FileDataName(value: string): UploaderOptionsBuilder {
        this._fileDataName = value;
        return this;
      }
      get fileDataName(): string {
        return this._fileDataName;
      }

      /**
       * Defaults to a parent node of browse_button
       * DOM element that will be used as a container for the Plupload html structures.
       * By default an immediate parent of the browse_button element is used.
       * 업로더 구조에 사용될 DOM 요소 또는 DOM 요소 자체의 ID. Browse_button 요소의 상위
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      Container(value: string): UploaderOptionsBuilder {
        this._container = value;
        return this;
      }
      get container() {
        return this._container;
      }

      /**
       * The url of the Flash component, required by the flash runtime.
       * It will fail, if the component is not found or cannot be loaded within a sane amount of time and Plupload will try the next runtime in the list.
       * You do not need to set this option manually if you are using default file structure.
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      FlashSwfUrl(value: string): UploaderOptionsBuilder {
        this._flashSwfUrl = value;
        return this;
      }
      get flashSwfUrl(): string {
        return this._flashSwfUrl;
      }

      /**
       * The url of the Silverlight component, required by the silverlight runtime.
       * It will fail, if the component is not found or cannot be loaded within a sane amount of time and Plupload will try the next runtime in the list.
       * You do not need to set this option manually if you are using default file structure.
       * @param {string} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      SilverlightXapUrl(value: string): UploaderOptionsBuilder {
        this._silverlightXapUrl = value;
        return this;
      }
      get silverlightXapUrl(): string {
        return this._silverlightXapUrl;
      }


      /**
       * HTTP method to use during upload (only PUT or POST allowed) (default: POST)
       * 업로드하는 동안 사용할 API의 HTTP Method(PUT 또는 POST만 허용) (기본값: POST)
       * @param {"POST" | "PUT"} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      HttpMethod(value: 'POST' | 'PUT'): UploaderOptionsBuilder {
        this._httpMethod = value;
        return this;
      }
      get httpMethod(): string {
        return this._httpMethod;
      }

      /**
       * Whether to send chunks and chunk numbers, or total and offset bytes (default: TRUE)
       * 청크 및 청크 번호 또는 총 및 오프셋 바이트를 보낼지 여부
       * @param {boolean} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       *
       * @constructor
       */
      SendChunkNumber(value: boolean): UploaderOptionsBuilder {
        this._sendChunkNumber = value;
        return this;
      }
      get sendChunkNumber(): boolean {
        return this._sendChunkNumber;
      }

      /**
       * Whether to send file name as additional argument - 'name' (required for chunked uploads and some other cases where file name cannot be sent via normal ways) (default: TRUE)
       * 추가 인수로 파일 이름을 보낼지 여부 - '이름' (청크 업로드 및 일반적인 방법으로 파일 이름을 보낼 수 없는 일부 경우 필요) (기본값: TRUE)
       * @param {boolean} value
       * @return {Pluploader.Builder.UploaderOptionsBuilder}
       * @constructor
       */
      SendFileName(value: boolean): UploaderOptionsBuilder {
        this._sendFileName = value;
        return this;
      }
      get sendFileName(): boolean {
        return this._sendFileName;
      }

      /**
       * builder
       * @return {Pluploader.Builder.UploaderOptions}
       */
      build(): UploaderOptions {
        return new UploaderOptions(this);
      }
    }
    export class UploaderOptions {
      //         // required
      private browse_button: string;
      private url: string;
      // optional
      private filters: FileFilters;
      private headers;
      private multipart: boolean;
      private multipart_params;
      private max_retries: number;
      private chunk_size: number | string;
      private resize: ImageResize;
      private drop_element: string;
      private multi_selection: boolean;
      private required_features: string | object;
      private unique_names: boolean;
      private runtimes: string;
      private file_data_name: string;
      private container: string;
      private flash_swf_url: string;
      private silverlight_xap_url: string;

      private http_method: string;
      private send_chunk_number: boolean;
      private send_file_name: boolean;

      private init;

      constructor(builder: UploaderOptionsBuilder) {
        if (!_.isNil(builder.browseButton)) {
          this.browse_button = builder.browseButton;
        }
        if (!_.isNil(builder.chunkSize)) {
          this.chunk_size = builder.chunkSize;
        }
        if (!_.isNil(builder.container)) {
          this.container = builder.container;
        }
        if (!_.isNil(builder.dropElement)) {
          this.drop_element = builder.dropElement;
        }
        if (!_.isNil(builder.fileDataName)) {
          this.file_data_name = builder.fileDataName;
        }
        if (!_.isNil(builder.filters)) {
          this.filters = builder.filters;
        }
        if (!_.isNil(builder.flashSwfUrl)) {
          this.flash_swf_url = builder.flashSwfUrl;
        }
        if (!_.isNil(builder.headers)) {
          this.headers = builder.headers;
        }
        if (!_.isNil(builder.httpMethod)) {
          this.http_method = builder.httpMethod;
        }
        if (!_.isNil(builder.maxRetries)) {
          this.max_retries = builder.maxRetries;
        }
        if (!_.isNil(builder.multipart)) {
          this.multipart = builder.multipart;
        }
        if (!_.isNil(builder.multipartParams)) {
          this.multipart_params = builder.multipartParams;
        }
        if (!_.isNil(builder.multiSelection)) {
          this.multi_selection = builder.multiSelection;
        }
        if (!_.isNil(builder.requiredFeatures)) {
          this.required_features = builder.requiredFeatures;
        }
        if (!_.isNil(builder.resize)) {
          this.resize = builder.resize;
        }
        if (!_.isNil(builder.runtimes)) {
          this.runtimes = builder.runtimes;
        }
        if (!_.isNil(builder.silverlightXapUrl)) {
          this.silverlight_xap_url = builder.silverlightXapUrl;
        }
        if (!_.isNil(builder.sendChunkNumber)) {
          this.send_chunk_number = builder.sendChunkNumber;
        }
        if (!_.isNil(builder.sendFileName)) {
          this.send_file_name = builder.sendFileName;
        }
        if (!_.isNil(builder.url)) {
          this.url = builder.url;
        }
        if (!_.isNil(builder.uniqueNames)) {
          this.unique_names = builder.uniqueNames;
        }
        if (!_.isNil(builder.init)) {
          this.init = builder.init;
        }
      }
    }

    export class UploaderEventBuilder {
      private _init: Function;
      private _postInit: Function;
      private _optionChanged: Function;
      private _refresh: Function;
      private _stateChanged: Function;
      private _browse: Function;
      private _fileFiltered: Function;
      private _queueChanged: Function;
      private _filesAdded: Function;
      private _filesRemoved: Function;
      private _beforeUpload: Function;
      private _uploadFile: Function;
      private _uploadProgress: Function;
      private _beforeChunkUpload: Function;
      private _chunkUploaded: Function;
      private _fileUploaded: Function;
      private _uploadComplete: Function;
      private _error: Function;
      private _destroy: Function;

      PostInit(callback: Function) {
        this._postInit = callback;
        return this;
      }
      get postInit() {
        return this._postInit;
      }

      FilesAdded(callback: Function) {
        this._filesAdded = callback;
        return this;
      }
      get filesAdded() {
        return this._filesAdded;
      }

      UploadProgress(callback: Function) {
        this._uploadProgress = callback;
        return this;
      }
      get uploadProgress() {
        return this._uploadProgress;
      }

      BeforeUpload(callback: Function) {
        this._beforeUpload = callback;
        return this;
      }
      get beforeUpload() {
        return this._beforeUpload;
      }

      UploadFile(callback: Function) {
        this._uploadFile = callback;
        return this;
      }
      get uploadFile() {
        return this._uploadFile;
      }

      FileUploaded(callback: Function) {
        this._fileUploaded = callback;
        return this;
      }
      get fileUploaded() {
        return this._fileUploaded;
      }

      BeforeChunkUpload(callback: Function) {
        this._beforeChunkUpload = callback;
        return this;
      }
      get beforeChunkUpload() {
        return this._beforeChunkUpload;
      }

      ChunkUploaded(callback: Function) {
        this._chunkUploaded = callback;
        return this;
      }
      get chunkUploaded() {
        return this._chunkUploaded;
      }

      UploadComplete(callback: Function) {
        this._uploadComplete = callback;
        return this;
      }
      get uploadComplete() {
        return this._uploadComplete;
      }

      Error(callback: Function) {
        this._postInit = callback;
        return this;
      }
      get error() {
        return this._postInit;
      }

      /**
       * build
       * @return {Pluploader.Builder.UploaderEvent}
       */
      build(): UploaderEvent {
        return new UploaderEvent(this);
      }
    }
    export class UploaderEvent {
      private Init: Function;
      private PostInit: Function;
      private OptionChanged: Function;
      private Refresh: Function;
      private StateChanged: Function;
      private Browse: Function;
      private FileFiltered: Function;
      private QueueChanged: Function;
      private FilesAdded: Function;
      private FilesRemoved: Function;
      private BeforeUpload: Function;
      private UploadFile: Function;
      private UploadProgress: Function;
      private BeforeChunkUpload: Function;
      private ChunkUploaded: Function;
      private FileUploaded: Function;
      private UploadComplete: Function;
      private Error: Function;
      private Destroy: Function;

      constructor(builder: UploaderEventBuilder) {
        if (!_.isNil(builder.postInit)) {
          this.PostInit = builder.postInit;
        }
        if (!_.isNil(builder.filesAdded)) {
          this.FilesAdded = builder.filesAdded;
        }
        if (!_.isNil(builder.uploadProgress)) {
          this.UploadProgress = builder.uploadProgress;
        }
        if (!_.isNil(builder.beforeUpload)) {
          this.BeforeUpload = builder.beforeUpload;
        }
        if (!_.isNil(builder.uploadFile)) {
          this.UploadFile = builder.uploadFile;
        }
        if (!_.isNil(builder.fileUploaded)) {
          this.FileUploaded = builder.fileUploaded;
        }
        if (!_.isNil(builder.beforeChunkUpload)) {
          this.BeforeChunkUpload = builder.beforeChunkUpload;
        }
        if (!_.isNil(builder.chunkUploaded)) {
          this.ChunkUploaded = builder.chunkUploaded;
        }
        if (!_.isNil(builder.uploadComplete)) {
          this.UploadComplete = builder.uploadComplete;
        }
        if (!_.isNil(builder.error)) {
          this.Error = builder.error;
        }
      }
    }

    // https://github.com/moxiecode/plupload/wiki/Options#filters
    export class FileFiltersBuilder {
      private _mimeTypes;
      private _maxFileSize: number | string;
      private _preventDuplicates: boolean;
      private _preventEmpty: boolean;

      /**
       * By default any file type can be picked from file selection dialog (which is obviously a rarely desired case),
       * so by supplying a mime_types filter one can constrain it to only specific file types
       * 기본적으로 파일 선택 대화 상자에서 파일 형식을 선택할 수 있으므로 mime_types필터를 제공함으로써 특정 파일 형식에만 제한
       * e.g. [
       * { title : "Image files", extensions : "jpg,gif,png" },
       * { title : "Zip files", extensions : "zip" }
       * ]
       * @param value
       * @return {Pluploader.Builder.FileFiltersBuilder}
       * @constructor
       */
      MimeTypes(value): FileFiltersBuilder {
        this._mimeTypes = value;
        return this;
      }
      get mimeTypes() {
        return this._mimeTypes;
      }

      /**
       * By default, file of any size is allowed to the queue. But it is possible to constrain it from the top with the max_file_size filter. It accepts numeric or formatted string values
       * 기본적으로 모든 크기의 파일은 대기열에 허용됨. 그러나 max_file_size 필터로 상단에서 제약할 수 있다
       * e.g.: 204800 or "204800b" or "200kb"
       * error : FILE_SIZE_ERROR
       * @param {number | string} value
       * @return {Pluploader.Builder.FileFiltersBuilder}
       * @constructor
       */
      MaxFileSize(value: number | string): FileFiltersBuilder {
        this._maxFileSize = value;
        return this;
      }
      get maxFileSize(): number | string {
        return this._maxFileSize;
      }

      /**
       * If set to true the Plupload will not allow duplicates. Duplicates are detected by matching file's name and size
       * TRUE로 설정하면 중복을 허용하지 않음 (파일 이름과 크기가 일치하여 중복이 감지)
       * @param {boolean} value
       * @return {Pluploader.Builder.FileFiltersBuilder}
       * @constructor
       */
      PreventDuplicates(value: boolean): FileFiltersBuilder {
        this._preventDuplicates = value;
        return this;
      }
      get preventDuplicates(): boolean {
        return this._preventDuplicates;
      }

      /**
       * Empty files are known to cause problems in some older browsers (like IE10), or third party shims (like Silverlight),
       * so a while ago we decided to filter them out by default.
       * But as it turned out many users wanted to allow them anyway, so we transformed the constraint into the filter, that can be turned on or off
       * 빈 파일 허용 여부 설정
       * @param {boolean} value
       * @return {Pluploader.Builder.FileFiltersBuilder}
       * @constructor
       */
      PreventEmpty(value: boolean): FileFiltersBuilder {
        this._preventEmpty = value;
        return this;
      }
      get preventEmpty(): boolean {
        return this._preventEmpty;
      }

      /**
       * builder
       * @return {Pluploader.Builder.FileFilters}
       */
      builder(): FileFilters {
        return new FileFilters(this);
      }
    }
    export class FileFilters {
      private max_file_size: number | string = 0;
      private mime_types = [];
      private prevent_duplicates: boolean = false;
      private prevent_empty: boolean = true;

      constructor(builder: FileFiltersBuilder) {
        if (!_.isNil(builder.maxFileSize)) {
          this.max_file_size = builder.maxFileSize;
        }
        if (!_.isNil(builder.mimeTypes)) {
          this.mime_types = builder.mimeTypes;
        }
        if (!_.isNil(builder.PreventDuplicates)) {
          this.prevent_duplicates = builder.preventDuplicates;
        }
        if (!_.isNil(builder.preventEmpty)) {
          this.prevent_empty = builder.preventEmpty;
        }
      }
    }

    // https://github.com/moxiecode/plupload/wiki/Options#client-side-resize
    export class ImageResizeBuilder {
      private _width: number;
      private _height: number;
      private _crop: boolean;
      private _quality: number;
      private _preserveHeaders: boolean;

      /**
       * The new width for the downsized image. If not specified will default to the actual width of the image.
       * 축소된 이미지의 새 너비. 지정하지 않으면 이미지의 실제 너비로 기본값
       * @param {number} value
       * @return {Pluploader.Builder.ImageResizeBuilder}
       * @constructor
       */
      Width(value: number): ImageResizeBuilder {
        this._width = value;
        return this;
      }
      get width(): number {
        return this._width;
      }

      /**
       * The new height for the downsized image. If not specified will default to the actual height of the image.
       * 축소된 이미지의 새 높이. 지정되지 않으면 이미지의 실제 높이로 기기본값
       * @param {number} value
       * @return {Pluploader.Builder.ImageResizeBuilder}
       * @constructor
       */
      Height(value: number): ImageResizeBuilder {
        this._height = value;
        return this;
      }
      get height(): number {
        return this._height;
      }

      /**
       * Whether to crop the image to exact dimensions, specified by width and height, or - not
       * 너비와 높이로 지정된 정확한 치수로 영상을 자르는지 여부
       * @param {boolean} value
       * @return {Pluploader.Builder.ImageResizeBuilder}
       * @constructor
       */
      Crop(value: boolean): ImageResizeBuilder {
        this._crop = value;
        return this;
      }
      get crop(): boolean {
        return this._crop;
      }

      /**
       * This option is only applicable to JPEGs, since PNGs are lossless and are not subjected to quality cuts.
       * The higher is quality the better the image looks, but the bigger its size is.
       * It must said that quality can only be dropped and never improved. So this option must be used carefully
       * Compression quality for jpegs (1-100)
       * @param {number} value
       * @return {Pluploader.Builder.ImageResizeBuilder}
       * @constructor
       */
      Quality(value: number): ImageResizeBuilder {
        if (value < 1) {
          this._quality = 1;
        } else if (value > 100) {
          this._quality = 100;
        } else {
          this._quality = value;
        }
        return this;
      }
      get quality(): number {
        return this._quality;
      }

      /**
       * Another option that is only applicable to JPEGs.
       * Controls whether the meta headers, containing Exif, GPS or IPTC data, etc, should be retained after the downsize completes.
       * By default meta headers are preserved, but you can set this to false if you do not require them and save some more bytes
       * JPEG만 적용되는 옵션, 메타 헤더를 유지하는지 여부
       * @param {boolean} value
       * @return {Pluploader.Builder.ImageResizeBuilder}
       * @constructor
       */
      PreserveHeaders(value: boolean): ImageResizeBuilder {
        this._preserveHeaders = value;
        return this;
      }
      get preserveHeaders(): boolean {
        return this._preserveHeaders;
      }

      /**
       * builder
       * @return {Pluploader.Builder.ImageResize}
       */
      builder(): ImageResize {
        return new ImageResize(this);
      }
    }
    export class ImageResize {
      width: number;
      height: number;
      crop: boolean;
      quality: number;
      preserve_headers: boolean;

      constructor(builder: ImageResizeBuilder) {
        if (!_.isNil(builder.width)) {
          this.width = builder.width;
        }
        if (!_.isNil(builder.height)) {
          this.height = builder.height;
        }
        if (!_.isNil(builder.crop)) {
          this.crop = builder.crop;
        }
        if (!_.isNil(builder.quality)) {
          this.quality = builder.quality;
        }
        if (!_.isNil(builder.preserveHeaders)) {
          this.preserve_headers = builder.preserveHeaders;
        }
      }
    }
  }

  // https://github.com/moxiecode/plupload/wiki/File
  export class File {
    // Properties
    id?: string;
    name?: string;
    type?;
    size?: number;
    origSize?: number;
    loaded?;
    percent?: number;
    status?: FileStatus;
    lastModifiedDate?;

    // Method
    getNative?: Function;
    getSource?: Function;
    destroy?: Function;

    // UI
    isUploading?: boolean;
    isCanceled?: boolean;
    isFailed?: boolean;
    isComplete?: boolean;
    errorMessage?: string;
    response?: string;
    responseHeaders?: string;
  }

  export enum FileStatus {
    QUEUED = 1,
    UPLOADING = 2,
    FAILED = 4,
    DONE = 5,
  }

  export enum ErrorCode {
    GENERIC_ERROR = -100,
    HTTP_ERROR = -200,
    IO_ERROR = -300,
    SECURITY_ERROR = -400,
    INIT_ERROR = -500,
    FILE_SIZE_ERROR = -600,
    FILE_EXTENSION_ERROR = -601,
    FILE_DUPLICATE_ERROR = -602,
    IMAGE_FORMAT_ERROR = -700,
    MEMORY_ERROR = -701,
    IMAGE_DIMENSIONS_ERROR = -702
  }
}
