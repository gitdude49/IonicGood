var CordovaPromiseFS =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Static Private functions
	 */

	/* createDir, recursively */
	function __createDir(rootDirEntry, folders, success,error) {
	  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
	    // Recursively add the new subfolder (if we still have another to create).
	    if (folders.length > 1) {
	      __createDir(dirEntry, folders.slice(1),success,error);
	    } else {
	      success(dirEntry);
	    }
	  }, error);
	}

	function dirname(str) {
	  str = str.substr(0,str.lastIndexOf('/')+1);
	  if(str[0] === '/') str = str.substr(1);
		return str;
	}

	function filename(str) {
	  return str.substr(str.lastIndexOf('/')+1);
	}

	function normalize(str){
	  str = str || '';
	  if(str[0] === '/') str = str.substr(1);
	  if(!!str && str.indexOf('.') < 0 && str[str.length-1] !== '/') str += '/';
	  if(str === './') str = '';
	  return str;
	}

	var transferQueue = [], // queued fileTransfers
	    inprogress = 0;     // currently active filetransfers

	/**
	 * Factory function: Create a single instance (based on single FileSystem)
	 */
	module.exports = function(options){
		console.log("--> constructor, options:", options);
	  /* Promise implementation */
	  var Promise = options.Promise || window.Promise;
	  if(!Promise) { throw new Error("No Promise library given in options.Promise"); }

	  /* default options */
	  this.options = options = options || {};
	  options.persistent = options.persistent !== undefined? options.persistent: true;
	  options.storageSize = options.storageSize || 20*1024*1024;
	  options.concurrency = options.concurrency || 3;
	  options.retry = options.retry || [];

	  /* Cordova deviceready promise */
	  var deviceready, isCordova = typeof cordova !== 'undefined' && !cordova.isLocal;
	  if(isCordova){
	    deviceready = new Promise(function(resolve,reject){
	      document.addEventListener("deviceready", resolve, false);
	      setTimeout(function(){ reject(new Error('deviceready has not fired after 5 seconds.')); },5100);
	    });
	  } else {
	    /* FileTransfer implementation for Chrome */
	    deviceready = ResolvedPromise(true);
	    if(typeof webkitRequestFileSystem !== 'undefined'){
	      window.requestFileSystem = webkitRequestFileSystem;
	      window.FileTransfer = function FileTransfer(){};
	      FileTransfer.prototype.download = function download(url,file,win,fail) {
	        var xhr = new XMLHttpRequest();
	        xhr.open('GET', url);
	        xhr.responseType = "blob";
	        xhr.onreadystatechange = function(onSuccess, onError, cb) {
	          if (xhr.readyState == 4) {
	            if(xhr.status === 200){
	              write(file,xhr.response).then(win,fail);
	            } else {
	              fail(xhr.status);
	            }
	          }
	        };
	        xhr.send();
	        return xhr;
	      };

			FileTransfer.prototype.upload = function upload(file, url, win, fail, options) {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', url);

				var formData = new FormData();

				if (options && options.params) {
					for (var paramName in options.params) {
						if (options.params.hasOwnProperty(paramName)) {
							var paramValue = options.params[paramName];
							formData.append(paramName, paramValue);
						}
					}
				}

				if (options && options.headers) {
					for (var headername in options.headers) {
						if (options.headers.hasOwnProperty(headername)) {
							var headerValue = options.headers[headername];
							xhr.setRequestHeader(headername, headerValue);
						}
					}
				}

				toDataURL(file).then(function(dataUrl) {
					var blob = dataURItoBlob(dataUrl);
					var fileKey = options && options.fileKey ? options.fileKey : "file";
					var fileName = options && options.fileName ? options.fileName : null;
					formData.append(fileKey, blob, fileName);
					xhr.onreadystatechange = function(onSuccess, onError, cb) {
						if (xhr.readyState == 4) {
							if(xhr.status === 200 || xhr.status === 204){
								win(xhr.response);
							} else {
								fail(xhr.status);
							}
						}
					};
					xhr.send(formData);
				}, function(error) {
					fail(error);
				})

				return xhr;
			};

	      window.ProgressEvent = function ProgressEvent(){};
	      window.FileEntry = function FileEntry(){};
	    } else {
	      window.requestFileSystem = function(x,y,z,fail){
	        fail(new Error('requestFileSystem not supported!'));
	      };
	    }
	  }

	  /* Promise resolve helper */
	  function ResolvedPromise(value){
	    return new Promise(function(resolve){
	      return resolve(value);
	    });
	  }

	  /* the filesystem! */
	  var fs = new Promise(function(resolve,reject){
	    deviceready.then(function(){
	      var type = options.persistent? 1: 0;
	      if(typeof options.fileSystem === 'number'){
	        type = options.fileSystem;
	      }
	      // Chrome only supports persistent and temp storage, not the exotic onces from Cordova
	      if(!isCordova && type > 1) {
	        console.warn('Chrome does not support fileSystem "'+type+'". Falling back on "0" (temporary).');
	        type = 0;
	      }
	      // On chrome, request quota to store persistent files
	      if (!isCordova && type === 1 && navigator.webkitPersistentStorage) {
	        navigator.webkitPersistentStorage.requestQuota(options.storageSize, function(grantedBytes) {
	          window.requestFileSystem(type, grantedBytes, resolve, reject);
	        });
	      }
	      else {
	        window.requestFileSystem(type, options.storageSize, resolve, reject);
	      }
	      setTimeout(function(){ reject(new Error('Could not retrieve FileSystem after 5 seconds.')); },5100);
	    },reject);
	  });

	  /* debug */
	  fs.then(function(fs){
	    window.__fs = fs;
	  },function(err){
	    console.error('Could not get Cordova FileSystem:',err);
	  });

	  /* ensure directory exists */
	  function ensure(folders) {
	    return new Promise(function(resolve,reject){
	      return fs.then(function(fs){
	          if(!folders) {
	            resolve(fs.root);
	          } else {
	            folders = folders.split('/').filter(function(folder) {
	              return folder && folder.length > 0 && folder !== '.' && folder !== '..';
	            });
	            __createDir(fs.root,folders,resolve,reject);
	          }
	        },reject);
	    });
	  }

	    /* get file file */
	  function file(path,options){
	    return new Promise(function(resolve,reject){
	      if(typeof path === 'object') {
	        return resolve(path);
	      }
	      path = normalize(path);
	      options = options || {};
	      return fs.then(function(fs){
	        fs.root.getFile(path,options,resolve,reject);
	      },reject);
	    });
	  }

	  /* get directory entry */
	  function dir(path,options){
	    path = normalize(path);
	    options = options || {};
	    return new Promise(function(resolve,reject){
	      return fs.then(function(fs){
	        if(!path || path === '/') {
	          resolve(fs.root);
	        } else {
	          fs.root.getDirectory(path,options,resolve,reject);
	        }
	      },reject);
	    });
	  }

	  /* list contents of a directory */
	  function list(path,mode) {
	    mode = mode || '';
	    var recursive = mode.indexOf('r') > -1;
	    var getAsEntries = mode.indexOf('e') > -1;
	    var onlyFiles = mode.indexOf('f') > -1;
	    var onlyDirs = mode.indexOf('d') > -1;
	    if(onlyFiles && onlyDirs) {
	      onlyFiles = false;
	      onlyDirs = false;
	    }

	    return new Promise(function(resolve,reject){
	      return dir(path).then(function(dirEntry){
	        var dirReader = dirEntry.createReader();
	        dirReader.readEntries(function(entries) {
	          var promises = [ResolvedPromise(entries)];
	          if(recursive) {
	            entries
	              .filter(function(entry){return entry.isDirectory; })
	              .forEach(function(entry){
	                promises.push(list(entry.fullPath,'re'));
	              });
	          }
	          Promise.all(promises).then(function(values){
	              var entries = [];
	              entries = entries.concat.apply(entries,values);
	              if(onlyFiles) entries = entries.filter(function(entry) { return entry.isFile; });
	              if(onlyDirs) entries = entries.filter(function(entry) { return entry.isDirectory; });
	              if(!getAsEntries) entries = entries.map(function(entry) { return entry.fullPath; });
	              resolve(entries);
	            },reject);
	        }, reject);
	      },reject);
	    });
	  }

	  /* does file exist? If so, resolve with fileEntry, if not, resolve with false. */
	  function exists(path){
	    return new Promise(function(resolve,reject){
	      file(path).then(
	        function(fileEntry){
	          resolve(fileEntry);
	        },
	        function(err){
	          if(err.code === 1) {
	            resolve(false);
	          } else {
	            reject(err);
	          }
	        }
	      );
	    });
	  }

	  /* does dir exist? If so, resolve with fileEntry, if not, resolve with false. */
	  function existsDir(path){
	    return new Promise(function(resolve,reject){
	      dir(path).then(
	        function(dirEntry){
	          resolve(dirEntry);
	        },
	        function(err){
	          if(err.code === 1) {
	            resolve(false);
	          } else {
	            reject(err);
	          }
	        }
	      );
	    });
	  }

	  function create(path){
	    return ensure(dirname(path)).then(function(){
	      return file(path,{create:true});
	    });
	  }

	  /* convert path to URL to be used in JS/CSS/HTML */
	  function toURL(path) {
	    return file(path).then(function(fileEntry) {
	      return fileEntry.toURL();
	    });
	  }

	  /* convert path to URL to be used in JS/CSS/HTML */
	  var toInternalURL,toInternalURLSync;
	  if(isCordova) {
	    /* synchronous helper to get internal URL. */
	    toInternalURLSync = function(path){
	      path = normalize(path);
	      return path.indexOf('://') < 0? 'cdvfile://localhost/'+(options.persistent? 'persistent/':'temporary/') + path: path;
	    };

	    toInternalURL = function(path) {
	      return file(path).then(function(fileEntry) {
	        return fileEntry.toInternalURL();
	      });
	    };
	  } else {
	    /* synchronous helper to get internal URL. */
	    toInternalURLSync = function(path){
	      path = normalize(path);
	      return 'filesystem:'+location.origin+(options.persistent? '/persistent/':'/temporary/') + path;
	    };

	    toInternalURL = function(path) {
	      return file(path).then(function(fileEntry) {
	        return fileEntry.toURL();
	      });
	    };
	  }

	  /* return contents of a file */
	  function read(path,method) {
		  //console.log("--> read, method: " + method);
	    method = method || 'readAsText';
	    return file(path).then(function(fileEntry) {
	      return new Promise(function(resolve,reject){
	        fileEntry.file(function(file){
				//console.log("we've got a file", file);
	          var reader = new FileReader();
				//console.log("reader (FileReader)", reader);

	          reader.onloadend = function(){
				  //console.log("reader.onloadend, result", this.result);
	            resolve(this.result);
	          };
				reader[method](file);

	        },reject);
	      });
	    });
	  }

	  /* convert path to base64 date URI */
	  function toDataURL(path) {
	    return read(path,'readAsDataURL');
	  }


	  function readJSON(path){
	    return read(path).then(JSON.parse);
	  }

	  /* write contents to a file */
	  function write(path,blob,mimeType) {
		  console.log("--> write");
		  console.log("path", path);
		  console.log("blob", blob);
	    return ensure(dirname(path))
	      .then(function() { return file(path,{create:true}); })
	      .then(function(fileEntry) {
	        return new Promise(function(resolve,reject){
	          fileEntry.createWriter(function(writer){
	            writer.onwriteend = function(e) {
					console.log("onwriteend (file has been written), invoking resolve", e);
					resolve();
				};
	            writer.onerror = function(e) {
					console.log("onerror (file write error), invoking reject", e);
					reject();
				}
	            if(typeof blob === 'string') {
					console.log("typeOf blob: string, creating new Blob with mimeType 'text/plain'");
					//TODO: Good doesn't allow writing of binary files, testing here!
					if (blob === "TEMP CONTENT - GOOD DOESN'T DO BINARY - TEMP CONTENT") {
						//do nothing leave string intact
					} else {
						blob = new Blob([blob],{type: mimeType || 'text/plain'});
					}
	            } else if(blob instanceof Blob !== true){
					console.log("typeOf blob: !Blob, creating new Blob with mimeType 'application/json'");
	              blob = new Blob([JSON.stringify(blob,null,4)],{type: mimeType || 'application/json'});
	            } else {
					console.log("typeOf blob: we don't have to convert to Blob");
				}
	            writer.write(blob);
	          },reject);
	        });
	      });
	    }

	  /* move a file */
	  function move(src,dest) {
	    return ensure(dirname(dest))
	      .then(function(dir) {
	        return file(src).then(function(fileEntry){
	          return new Promise(function(resolve,reject){
	            fileEntry.moveTo(dir,filename(dest),resolve,reject);
	          });
	        });
	      });
	  }

	  /* move a dir */
	  function moveDir(src,dest) {
	    src = src.replace(/\/$/, '');
	    dest = dest.replace(/\/$/, '');
	    return ensure(dirname(dest))
	      .then(function(destDir) {
	        return dir(src).then(function(dirEntry){
	          return new Promise(function(resolve,reject){
	            dirEntry.moveTo(destDir,filename(dest),resolve,reject);
	          });
	        });
	      });
	  }

	  /* copy a file */
	  function copy(src,dest) {
	    return ensure(dirname(dest))
	      .then(function(dir) {
	        return file(src).then(function(fileEntry){
	          return new Promise(function(resolve,reject){
	            fileEntry.copyTo(dir,filename(dest),resolve,reject);
	          });
	        });
	      });
	  }

	  /* delete a file */
	  function remove(path,mustExist) {
	    var method = mustExist? file:exists;
	    return new Promise(function(resolve,reject){
	        method(path).then(function(fileEntry){
	        if(fileEntry !== false) {
	          fileEntry.remove(resolve,reject);
	        } else {
	          resolve(1);
	        }
	      },reject);
	    }).then(function(val){
	      return val === 1? false: true;
	    });
	  }

	  /* delete a directory */
	  function removeDir(path) {
	    return dir(path).then(function(dirEntry){
	      return new Promise(function(resolve,reject) {
	        dirEntry.removeRecursively(resolve,reject);
	      });
	    });
	  }

	  // Whenever we want to start a transfer, we call popTransferQueue
	  function popTransferQueue(){
	    // while we are not at max concurrency
	    while(transferQueue.length > 0 && inprogress < options.concurrency){
	      // increment activity counter
	      inprogress++;

	      // fetch filetranfer, method-type (isDownload) and arguments
	      var args = transferQueue.pop();
	      var ft = args.shift();
	      var isDownload = args.shift();
	      var serverUrl = args.shift();
	      var localPath = args.shift();
	      var win = args.shift();
	      var fail = args.shift();
	      var trustAllHosts = args.shift();
	      var transferOptions = args.shift();

	      if(ft._aborted) {
	        inprogress--;
	      } else if(isDownload){
	        ft.download.call(ft,serverUrl,localPath,win,fail,trustAllHosts,transferOptions);
	        if(ft.onprogress) ft.onprogress(new ProgressEvent());
	      } else {
	        ft.upload.call(ft,localPath,serverUrl,win,fail,transferOptions,trustAllHosts);
	      }
	    }
	    // if we are at max concurrency, popTransferQueue() will be called whenever
	    // the transfer is ready and there is space avaialable.
	  }

	  // Promise callback to check if there are any more queued transfers
	  function nextTransfer(result){
	    inprogress--; // decrement counter to free up one space to start transfers again!
	    popTransferQueue(); // check if there are any queued transfers
	    return result;
	  }

	  function filetransfer(isDownload,serverUrl,localPath,transferOptions,onprogress){
		  console.log("--> filetransfer");
		  console.log("isDownload", isDownload);
		  console.log("serverUrl", serverUrl);
		  console.log("localPath", localPath);
		  console.log("transferOptions", transferOptions);
		  console.log("onprogress", onprogress);
	    if(typeof transferOptions === 'function') {
	      onprogress = transferOptions;
	      transferOptions = {};
	    }
	    if(isCordova && localPath.indexOf('://') < 0) localPath = toInternalURLSync(localPath);

	    transferOptions = transferOptions || {};
	    if(!transferOptions.retry || !transferOptions.retry.length) {
	      transferOptions.retry = options.retry;
	    }
	    transferOptions.retry = transferOptions.retry.concat();
	    if(!transferOptions.file && !isDownload){
			if (!transferOptions.fileName) {
				//only calculate a filename when we didn't get a fileName in the options
				transferOptions.fileName = filename(localPath);
			}
	    }

	    var ft = new FileTransfer();
	    onprogress = onprogress || transferOptions.onprogress;
	    if(typeof onprogress === 'function') ft.onprogress = onprogress;
	    var promise = new Promise(function(resolve,reject){
	      var attempt = function(err){
	        if(transferOptions.retry.length === 0) {
	          reject(err);
	        } else {
	          transferQueue.unshift([ft,isDownload,serverUrl,localPath,resolve,attempt,transferOptions.trustAllHosts || false,transferOptions]);
	          var timeout = transferOptions.retry.shift();
	          if(timeout > 0) {
	            setTimeout(nextTransfer,timeout);
	          } else {
	            nextTransfer();
	          }
	        }
	      };
	      transferOptions.retry.unshift(0);
	      inprogress++;
	      attempt();
	    });
	    promise.then(nextTransfer,nextTransfer);
	    promise.progress = function(onprogress){
	      ft.onprogress = onprogress;
	      return promise;
	    };
	    promise.abort = function(){
	      ft._aborted = true;
	      ft.abort();
	      return promise;
	    };
	    return promise;
	  }

	  function download(url,dest,options,onprogress){
	    return filetransfer(true,url,dest,options,onprogress);
	  }

	  function upload(source,dest,options,onprogress){
		  console.log("--> upload");
		  console.log("source", source);
		  console.log("dest", dest);
		  console.log("options", options);
		  console.log("onprogress", onprogress);

	    return filetransfer(false,dest,source,options,onprogress);
	  }

	  return {
	    fs: fs,
	    normalize: normalize,
	    file: file,
	    filename: filename,
	    dir: dir,
	    dirname: dirname,
	    create:create,
	    read: read,
	    readJSON: readJSON,
	    write: write,
	    move: move,
	    moveDir: moveDir,
	    copy: copy,
	    remove: remove,
	    removeDir: removeDir,
	    list: list,
	    ensure: ensure,
	    exists: exists,
	    existsDir: existsDir,
	    download: download,
	    upload: upload,
	    toURL:toURL,
	    isCordova:isCordova,
	    toInternalURLSync: toInternalURLSync,
	    toInternalURL:toInternalURL,
	    toDataURL:toDataURL,
	    deviceready: deviceready,
	    options: options,
	    Promise: Promise
	  };
	};


/***/ }
/******/ ]);