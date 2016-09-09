/**
 * @fileOverview Cordova Plugin for Good Dynamics.
 *
 * @author <a href="http://www.good.com">Good Technology, Inc.</a>
 *
 * @description The Good Dynamics (GD) APIs enable the following functionality
 * and features to be included in a GD application installed on a user's mobile device:
 * 
 * <p>
 * <b>Activating the GD client</b><br/>
 * This includes collecting device and user-specific information that is used
 * by the Network Operations Center (NOC) for device activation and profile 
 * creation.
 * </p>
 * 
 * <p>
 * <b>Establishing a secure communications channel with the NOC</b><br/>
 * Secure communications are achieved through the socket API if needed. After
 * specifying whether or not to use the Secure Socket Layer (SSL), the connection
 * is made and data is shared.
 * </p>
 * 
 * <p>
 * <b>Securing corporate data in a discrete container on the mobile device</b><br/>
 * The secure container is a feature of a GD-enabled app.  It stores corporate data
 * in encrypted form within the local storage on the device.  Also, the secure
 * container separates corporate data from the user's data on the mobile device.
 * </p>
 * 
 * <p>
 * <b>Creating a push channel</b><br/>
 * This channel is the primary mechanism by which the GD client becomes aware of
 * updates to data from behind the corporate firewall. This mechanism allows the GD
 * client to conserve battery power by only connecting when it is necessary.
 * </p>
 * 
 * <p>
 * <b>Enforcing entitlement and authorization policies</b><br/>
 * The GD client manages the user's access and available functionality based on the
 * enterprise policies and authorization for that specific user.
 * <br/><br/>
 * The GD client also periodically checks for updates to the user's entitlement or
 * authorization. Should either of these change, the GD client can update the mobile
 * device accordingly.
 * </p>
 * 
 * @version 1.0
 */




/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

	/**
	 * @class GDHttpResponse
	 * @classdesc This class encapsulates the HTTP response returned from a GDHttpRequest's
	 * send function.
	 * 
	 * @param {string} json The input data (formatted as JSON text) used to construct the
	 * response object.
	 * 
	 * @property {string} headers The HTTP response headers.
	 * 
	 * @property {string} status The HTTP response status.
	 * 
	 * @property {string} statusText The textual HTTP response status, as sent by the server,
	 * or details of error if the returned status is 0.
	 * 
	 * @property {string} responseText The data returned from the HTTP request.  This data is
	 * retrieved from the JSON string that was passed into this function.  If the input to this
	 * function is not in valid JSON format, then this property will be the empty string.
	 * 
	 * @property {string} responseData This is the raw (unparsed) data that was passed into this
	 * function.  This data is useful as a means to support manual processing/parsing if the input
	 * data could not be parsed as a JSON object.
	 * 
	 * @property {string} responseState This value represents the current state of the opened HTTP
	 * process.  The response is not complete until the responseState reaches the "DONE" state.
	 * The following states are valid:
	 * <ul>
	 *     <li>"HEADERS_RECEIVED" Response headers have been received.</li>
	 *     <li>"LOADING" Response headers and some data have been received. The loading state is
	 *     typically indicative of an incremental request that is in progress.</li>
	 *     <li>"DONE" All data has been received, or a permanent error has been encountered. </li>
	 * </ul>
	 * 
	 * @return {GDHttpResponse}
	 */
	var GDHttpResponse = function(json) {
		this.headers = null;
		this.status = null;
		this.statusText = null;
		this.responseText = null;
		this.responseData = json;
		this.responseState = null;

		try {
			var obj = JSON.parse(json),
			    escapedJson = {};

			for (var i in obj) {
				escapedJson[i] = unescape(obj[i]);
			}
			this.headers = escapedJson.headers;
			this.status = parseInt(escapedJson.status);
			this.statusText = escapedJson.statusText;
			this.responseState = escapedJson.responseState;

			/*
			 * The response could have been JSON text, which we might need to revert to it's
			 * string representation.
			 */
			try {
				if(typeof escapedJson.responseText === 'Object') {
					this.responseText = JSON.stringify(escapedJson.responseText);
				} else {
					this.responseText = escapedJson.responseText;
				}
			} catch(e) {
				this.responseText = escapedJson.responseText;
			}
		} catch(e) {
			this.responseData = json;
		}
	};
	
	/**
	 * @class GDHttpRequest
	 * @classdesc Implements the secure HTTP communications APIs.
	 * 
	 * @property {string} method Case-sensitive string containing the HTTP method, which
	 * will be sent to the server. Typical values are: "GET", "POST", "HEAD",
	 * "OPTIONS", "TRACE", "PUT", "CONNECT". Any other value is sent as a custom
	 * method.
	 *
	 * @property {string} url Uniform Resource Locator (URL) that will be requested. The
	 * URL must be fully qualified, including a scheme, domain, and path. For
	 * example: "http://www.example.com/index.html".
	 * 
	 * @property {number} timeout Length of time out in seconds, or 0 (zero) for never.
	 * A negative timeout number will allow this request to use the default timeout
	 * value (30 seconds).
	 *
	 * @property {boolean} isAsync Set this value to true to make asynchronous calls.
	 *
	 * @property {string} user Authentication username. For Kerberos, this is in the
	 * user@realm format.
	 *
	 * @property {string} password Authentication password.
	 *
	 * @property {string} auth The authentication scheme.  Valid values are:
	 * <ul><li>"NTLM" to use NTLM authentication (NTLM version 2 is not supported)</li>
	 * <li>"DIGEST" to use Digest Access authentication</li>
	 * <li>"NEGOTIATE" to use negotiated Kerberos authentication</li>
	 * <li>"BASIC" or a null pointer to use Basic Access authentication.</li></ul>
	 *
	 * @property {boolean} isIncremental Determine if the response from an asynchronous HTTP request
	 * should be processed incrementally (as soon as data is received), or if the entire
	 * request should be returned within a single response.
	 *
	 * @property {boolean} disableHostVerification Disable host name verification, when
	 * making an HTTPS request. Host name verification is an SSL/TLS security option.
	 *
	 * @property {boolean} disableFollowLocation Disable automatic following of redirections.
	 * When automatic following is disabled, the application must handle redirection
	 * itself, including handling Location: headers, and HTTP statuses in the 30x range.
	 *
	 * @property {boolean} disablePeerVerification Disable certificate authenticity
	 * verification, when making an HTTPS request. Authenticity verification is an
	 * SSL/TLS security option.
	 *
	 * @property {boolean} disableCookieHandling Disable automatic cookie handling. When
	 * automatic handling is disabled, the application must store and process cookies
	 * itself.
	 *
	 * @property {string} cookieState Stores a value that determines whether or not cookies
	 * should be cleared prior to sending the request.  This value should not be set
	 * directly.  Instead, call the clearCookies method.
	 * 
	 * @property {string} host The address of the proxy. Can be either an Internet Protocol
	 * address (IP address, for example "192.168.1.10"), or a fully qualified domain name
	 * (for example "www.example.com"). 
	 * 
	 * @property {number} port Number of the port on the proxy to which connection will be made.
	 * 
	 * @property {string} proxyUser The proxy authentication username.
	 * 
	 * @property {string} proxyPassword The proxy authentication password.
	 * 
	 * @property {string} proxyAuth The proxy authentication scheme.  Valid values are:
	 * <ul>
	 *	<li>"NTLM" to use NTLM authentication (NTLM version 2 is not supported)</li>
	 *	<li>"DIGEST" to use Digest Access authentication</li>
	 *	<li>"BASIC" or a null pointer to use Basic Access authentication.</li>
	 * </ul>
	 * 
	 * @property {string} fileName The path (optional) and filename of the file to upload if this
	 * is a file upload request. If path is omitted, the file is read from the current working directory.
	 * NOTE: There is no need to set this property directly since it will be set during the sendFile
	 * function call (see <a href="#sendFile">sendFile</a>).
	 * 
	 * @property {object} sendOptions This object contains any optional parameters that
	 * are sent with the HTTP request.  This value should not be set directly.  Instead,
	 * call the desired optional methods to set the request parameters (e.g.
	 * addPostParameter, addRequestHeader, addHttpBody).
	 */
	var GDHttpRequest = function() {
		this.method = null;
		this.url = null;
		this.timeout = -1;
		this.isAsync = false;
		this.user = null;
		this.password = null;
		this.auth = null;
		this.isIncremental = false;
		this.disableHostVerification = false;
		this.disableFollowLocation = false;
		this.disablePeerVerification = false;
		this.disableCookieHandling = false;
		this.cookieState = null;
		this.host = null;
		this.port = -1;
		this.proxyUser = null;
		this.proxyPassword = null;
		this.proxyAuth = null;
		this.fileName = null;
		this.sendOptions = {"RequestHeaders": null, "PostParameters": null, "HttpBody": null};
		this.requestTag = null;
	};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDHttpRequest *****

	/**
	 * @function GDHttpRequest#createRequest
	 *
	 * @description Call this function to create the HTTP request, and set the main parameters.
	 * NOTE: This function only initializes the HTTP parameters; it does not initiate
	 * data transfer (see send).
	 *
	 * @param {string} method Case-sensitive string containing the HTTP method, which
	 * will be sent to the server. Typical values are: "GET", "POST", "HEAD",
	 * "OPTIONS", "TRACE", "PUT", "CONNECT". Any other value is sent as a custom
	 * method.
	 * 
	 * @param {string} url Uniform Resource Locator (URL) that will be requested. The
	 * URL must be fully qualified, including a scheme, domain, and path. For
	 * example: "http://www.example.com/index.html".
	 * 
	 * @param {number} timeout Length of time out in seconds, or 0 (zero) for never.
	 * A negative timeout number will allow this request to use the default timeout
	 * value (30 seconds).
	 *  
	 * @param {boolean} isAsync Set this value to true to make asynchronous calls.
	 * 
	 * @param {string} user Authentication username. For Kerberos, this is in the
	 * user@realm format.
	 * 
	 * @param {string} password Authentication password.
	 * 
	 * @param {string} auth The authentication scheme.  Valid values are:
	 * <ul>
	 *	<li>"NTLM" to use NTLM authentication (NTLM version 2 is not supported)</li>
	 *	<li>"DIGEST" to use Digest Access authentication</li>
	 *	<li>"NEGOTIATE" to use negotiated Kerberos authentication</li>
	 *	<li>"BASIC" or a null pointer to use Basic Access authentication.</li>
	 * </ul>
	 * 
	 * @param {boolean} isIncremental Determine if the response from an aysnchronous HTTP request
	 * should be processed incrementally (as soon as data is received), or if the entire
	 * request should be returned within a single response.
	 *
	 * @return {GDHttpRequest} The newly created request object.
	 */
	GDHttpRequest.prototype.createRequest = function(method, url, timeout, isAsync, user, password, auth, isIncremental) {
		var result = new GDHttpRequest();
		result.method = method;
		result.url = url;
		result.timeout = (timeout === null || timeout === "") ? -1 : timeout;
		result.isAsync = isAsync;
		result.user = user;
		result.password = password;
		result.auth = auth;
		if(typeof isIncremental === "undefined")
			result.isIncremental = false;
		else
			result.isIncremental = isIncremental;
		
		return result;
	};

	/**
	 * @function GDHttpRequest#clearCookies
	 * 
	 * @description Clear cookies that were automatically stored. Cookies can be cleared from
	 * memory only, or from the persistent cookie store too. If cleared from memory only,
	 * cookies will still be reloaded from the persistent cookie store when the application
	 * is next launched.  This function is most useful when automatic cookie handling is
	 * enabled (i.e. GDHttpRequest.disableCookieHandling = false).
	 * 
	 * @param {boolean} includePersistentStore When this value is set to true, then all
	 * cookies are cleared from memory and the persistent cookie storage file.  When
	 * this value is false, then all cookies are cleared from memory only. 
	 */
	GDHttpRequest.prototype.clearCookies = function(includePersistentStore) {
		if(includePersistentStore === true)
			this.cookieState = "persistent";
		else
			this.cookieState = "memory";
	};
	
	/**
	 * @function GDHttpRequest#enableHttpProxy
	 * 
	 * @description Call this function to configure an HTTP proxy address and credentials,
	 * and enable connection through the proxy.  The proxy server can be located behind the
	 * enterprise firewall. In this case its address must be registered in the enterprise's
	 * Good Control (GC) console. Registration would usually be as a GC additional server.
	 * <a href="https://begood.good.com/community/gdn">See the Good Control overview for
	 * application developers</a>.  Certificate authenticity verification while using a proxy
	 * is not currently supported. When making HTTPS requests through a proxy, SSL/TLS
	 * certificate verification must be disabled, see the disablePeerVerification function.
	 * This function should be called before <a href="#send">GDHttpRequest.send</a> or 
	 * <a href="#sendFile">GDHttpRequest.sendFile</a> has been called.
	 * 
	 * @param {string} host The address of the proxy. Can be either an Internet Protocol
	 * address (IP address, for example "192.168.1.10"), or a fully qualified domain name
	 * (for example "www.example.com").
	 * 
	 * @param {number} port Number of the port on the proxy to which connection will be made.
	 * 
	 * @param {string} user The proxy authentication username.
	 * 
	 * @param {string} password The proxy authentication password.
	 * 
	 * 
	 * @param {string} auth The proxy authentication scheme.  Valid values are:
	 * <ul>
	 *	<li>"NTLM" to use NTLM authentication (NTLM version 2 is not supported)</li>
	 *	<li>"DIGEST" to use Digest Access authentication</li>
	 *	<li>"BASIC" or a null pointer to use Basic Access authentication.</li>
	 * </ul>
	 */
	GDHttpRequest.prototype.enableHttpProxy = function(host, port, user, password, auth) {
		this.host = host;
		this.port = port;
		this.proxyUser = user;
		this.proxyPassword = password;
		this.proxyAuth = auth;
	};
	
	/**
	 * @function GDHttpRequest#disableHttpProxy
	 * 
	 * @description Call this function to disable connection through an HTTP proxy.
	 * This function should be called before <a href="#send">GDHttpRequest.send</a> 
	 * or <a href="#sendFile">GDHttpRequest.sendFile</a> has been called.
	 */
	GDHttpRequest.prototype.disableHttpProxy = function() {
		this.host = null;
		this.port = -1;
		this.proxyUser = null;
		this.proxyPassword = null;
		this.proxyAuth = null;
	};
	
	/**
	 * @function GDHttpRequest#addRequestHeader
	 * 
	 * @description Call this function to add a Header Field to the HTTP request. This
	 * is for standard HTTP Header Fields such as "Authorization".  This function can
	 * be called zero or more times, since not all HTTP requests will require headers to
	 * be added by the application.  If a header key is added multiple times, only the
	 * last stored value will be maintained (e.g. duplicate keys are not allowed).
	 * @param {string} key The HTTP Header Field to be added.
	 * @param {string} value The header field's value.
	 */
	GDHttpRequest.prototype.addRequestHeader = function(key, value) {
		if(typeof this.sendOptions.RequestHeaders === 'undefined' || this.sendOptions.RequestHeaders === null)
			this.sendOptions.RequestHeaders = {};
		
		this.sendOptions.RequestHeaders[key] = value;
	};
	
	/**
	 * @function GDHttpRequest#clearRequestHeaders
	 * 
	 * @description Call this function to remove all name/value request headers that
	 * were added through a call to addRequestHeader.
	 */
	GDHttpRequest.prototype.clearRequestHeaders = function() {
		this.sendOptions.RequestHeaders = null;
	};
	
	/**
	 * @function GDHttpRequest#addPostParameter
	 * 
	 * @description Call this function to add a name/value pair to the HTTP request.
	 * The request method must be "POST". Multiple name/value pairs can be added, by
	 * calling this function multiple times.  When the request is sent, name/value pairs
	 * will be encoded in the request body in a way that is compatible with HTML form
	 * submission. No other body data can be passed in the send call.
	 * 
	 * @param {string} key The name associated with the value.
	 * @param {string} value The value to be set. 
	 */
	GDHttpRequest.prototype.addPostParameter = function(key, value) {
		if(typeof this.sendOptions.PostParameters === 'undefined' || this.sendOptions.PostParameters === null)
			this.sendOptions.PostParameters = [];
		
		var entry = {};
		entry[key] = value;
		this.sendOptions.PostParameters.push(entry);
	};
	
	/**
	 * @function GDHttpRequest#clearPostParameters
	 * 
	 * @description Call this function to remove all name/value post variables from the HTTP
	 * request. Name/value pairs would have been added with the addPostParameter function.
	 * This function need only be called if it is required to clear name/value pairs before
	 * sending.
	 */
	GDHttpRequest.prototype.clearPostParameters = function() {
		this.sendOptions.PostParameters = null;
	};
	
	/**
	 * @function GDHttpRequest#addHttpBody
	 * 
	 * @description Call this function to add an httpBody to a post request, the body will take 
     * the place of any post parameters
	 * 
	 * @param {string} body the http body to be sent
	 */
	GDHttpRequest.prototype.addHttpBody = function(body) {		
		this.sendOptions.HttpBody = body;
	};
	
	/**
	 * @function GDHttpRequest#clearHttpBody
	 * 
	 * @description Call this function to clear the httpBody of a request
	 * 
	 */
	GDHttpRequest.prototype.clearHttpBody = function() {		
		this.sendOptions.HttpBody = null;
	};
	
	/**
	 * @function GDHttpRequest#parseHttpResponse
	 * 
	 * @description Call this function to transform the HTTP response text into a
	 * GDHttpResponse object.
	 * 
	 * @param {string} responseText A string representing the HTTP response text.
	 * 
	 * @return {GDHttpResponse} The HTTP response object.
	 */
	GDHttpRequest.prototype.parseHttpResponse = function(responseText) {
		return new GDHttpResponse(responseText);
	};
	
	/**
	 * @function GDHttpRequest#send
	 * @description Send the HTTP request with it's associated parameters.
	 * @param {function} success Callback function to invoke upon successful completion of the request.
	 * @param {function} fail Callback function to invoke if the request cannot be completed.
	 */
	GDHttpRequest.prototype.send = function(success, fail) {
		this.sendRequest(success, fail);
	};
	
	/**
	 * @function GDHttpRequest#sendFile
	 * @description Call this function to upload a file using the HTTP request object.  NOTE: this method does not
	 * support asynchronous operations.  The HTTP request's method can be "PUT" or a custom method. This function 
	 * causes the HTTP request to be sent, similarly to the send function, above. The body of the request will be 
	 * the contents of the specified file.  The file will not be deleted after it is uploaded. Uploading directly 
	 * from the Good Dynamics secure file system is supported.
	 * 
	 * @param {string} fileName The path (optional) and filename of the file to upload. If path is omitted, the file 
	 * is read from the application documents directory. 
	 * 
	 * @param {function} success Callback function to invoke upon successful completion of the request.
	 * 
	 * @param {function} fail Callback function to invoke if the request cannot be completed.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * var data_json_url = "http://servername.dev.company.com:8082/data.json";
	 * var poster_url = "http://servername.dev.company.com:8082/httpposter/load";
	 * var MaxTestDuration = 10 * 1000;	// In milliseconds.
	 * var gTestTimeoutID = null;
	 * var aRequest;
	 * 
	 * function myHTTPRequest(){
	 * var method = "GET";
	 * var url = data_json_url;
	 * var timeout = 30;
	 * var isAsync = false;
	 * var user = null;
	 * var password = null;
	 * var auth = null;
	 * var isIncremental = true;
	 * 
	 * //-- createRequest
	 * aRequest = window.plugins.GDHttpRequest.createRequest(method, url, timeout, isAsync, user, password, auth, isIncremental);
	 * 
	 * //-- clearCookies in memory
	 * aRequest.clearCookies(false);
	 * 
	 * //-- clearCookies in memory and the persistent cookie storage file
	 * aRequest.clearCookies(true);
	 * 
	 * //-- enableHttpProxy & disableHttpProxy
	 * var host = "some_host.com", port = 8080;
	 * user = "some_user";
	 * password = "some_pwd";
	 * aRequest.enableHttpProxy(host, port, user, password, auth);
	 * aRequest.disableHttpProxy();
	 * 
	 * //-- addRequestHeader
	 * var headerName = "customHeader", headerValue = "customValue";
	 * aRequest.addRequestHeader(headerName, headerValue);
	 * 
	 * //-- addPostParameter & clearPostParameters
	 * var postName = "someName", postValue = "some value";
	 * aRequest.addPostParameter(postName, postValue);
	 * aRequest.clearPostParameters();
	 * 
	 * //-- send
	 * function sendSuccess(response) {
     *  console.log("Received valid response from the send request");
     *  try {
     *      //-- parseHttpResponse
     *      var responseObj = window.plugins.GDHttpRequest.parseHttpResponse(response);
     *      console.log(responseObj.responseText);
     *  } catch(e) {
     *      console.log("Invalid response object returned from call to send.");
     *  }
     *  };
     *
     * function sendFail() {
     *  console.log("The send request resulted in an error.");
     * }
     *
     * aRequest.send(sendSuccess,sendFail);
     * }
     * 
     * </code></pre>
     * 
     * 
	 * 
	 */
	GDHttpRequest.prototype.sendFile = function(fileName, success, fail) {
		if(typeof fileName === 'Object' || typeof fileName === 'undefined') {
			console.log("ERROR: invalid fileName passed to sendFile.");
			this.fileName = null;
		}
		else
			this.fileName = fileName;
		
		this.sendRequest(success, fail);
	};
	
	/* (Private function)
	 * @function GDHttpRequest#sendRequest
	 * @description Send the HTTP request with it's associated parameters.
	 * @param {function} success Callback function to invoke upon successful completion of the request.
	 * @param {function} fail Callback function to invoke if the request cannot be completed.
	 * 
     * 
     */
	GDHttpRequest.prototype.sendRequest = function(success, fail) {
		/**
		 * The properties of the GDHttpRequest object are passed to the native iOS code as an
		 * array of string values in the following order:
		 * [method, url, isAsync, user, password, auth, disableHostVerification, 
		 *  disableFollowLocation, disablePeerVerification, disableCookieHandling].
		 */

		if(this.method === null || typeof this.method === 'undefined') {
			console.log("ERROR: No method passed to sendRequest.");
			return;
		}
		
		if(this.method === null || typeof this.method === 'undefined') {
			console.log("ERROR: No url passed to sendRequest.");
			return;
		}
		
		var lAsync = (this.isAsync === false) ? "false" : "true";
		var lIsIncremental = (this.isIncremental === true) ? "true" : "false";
		var lHost = (this.disableHostVerification === false) ? "false" : "true";
		var lFollow = (this.disableFollowLocation === false) ? "false" : "true";
		var lPeer = (this.disablePeerVerification === false) ? "false" : "true";
		var lCookie = (this.disableCookieHandling === false) ? "false" : "true";

		function guid() {
 			function s4() {
    			return Math.floor((1 + Math.random()) * 0x10000)
               		.toString(16)
               		.substring(1);
  			}
  			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         		s4() + '-' + s4() + s4() + s4();
		}
		this.requestTag = guid();

		var parms = [this.method,
		             this.url,
		             this.timeout.toString(),
		             lAsync,
		             this.user,
		             this.password,
		             this.auth,
		             lIsIncremental,
		             lHost,
		             lFollow,
		             lPeer,
		             lCookie,
		             this.cookieState,
		             this.host,
		             this.port.toString(),
		             this.proxyUser,
		             this.proxyPassword,
		             this.proxyAuth,
		             this.fileName,
		             this.sendOptions,
		             this.requestTag
		            ];
		cordovaRef.exec(success, fail, "GDHttpRequest", "send", parms);
	};

	GDHttpRequest.prototype.abort = function() {
		var lAsync = (this.isAsync === false) ? "false" : "true";
		cordovaRef.exec(function(){}, function(){}, "GDHttpRequest", "abort", [lAsync, this.requestTag]);
	}

	// ***** END: MODULE METHOD DEFINITIONS - GDHttpRequest *****

	
	/**
	 * @class GDSocketResponse
	 * @classdesc This class encapsulates the response returned from the GDSocket class.
	 * 
	 * @param {string} json The input data (formatted as JSON text) used to construct the
	 * response object.
	 * 
	 * @property {string} socketID The unique ID for the socket connection that generated this response.
	 * 
	 * @property {string} responseType This value is used to distinguish what action triggered this response.
	 * Valid values are:
	 * <ul>
	 *   <li>open - The socket was just successfully opened.</li>
	 *   <li>message - A new message was received from the server.  The responseData property will be
	 *   populated with the data from the server.</li>
	 *   <li>error - A socket error occurred.  The responseData may or may not be populated with a
	 *   description of the error.</li>
	 *   <li>close - The socket connection was closed.</li>
	 * </ul>
	 * 
	 * @property {string} responseData This field will be populated with data from the server if the
	 * response contained data what was intended to be processed by the client.
	 * 
	 * @return {GDSocketResponse}
	 */
	var GDSocketResponse = function(json) {
		this.socketID = null;
		this.responseType = null;
		this.responseData = null;
		
		try {
			var obj = JSON.parse(unescape(json));
			this.socketID = obj.socketID;
			this.responseType = obj.responseType;
			
			/*
			 * The response could have been JSON text, which we might need to revert to it's
			 * string representation.
			 */
			try {
				if(typeof obj.responseData === 'Object') {
					this.responseData = JSON.stringify(obj.responseData);
				} else {
					this.responseData = obj.responseData;
				}
			} catch(e) {
				this.responseData = obj.responseData;
			}
		} catch(e) {
			this.responseType = "error";
		}
	};
	
	/**
	 * @class GDSocket
	 * @classdesc Implements the secure Socket communications APIs.
	 * 
	 * @property {string} url The address of the server. Can be either an Internet Protocol
	 * address (IP address, for example "192.168.1.10"), or a fully qualified domain name
	 * (for example "www.example.com").
	 * 
	 * @property {number} port Number of the server port to which the socket will connect.
	 * 
	 * @property {boolean} useSSL This value determines whether or not to use SSL/TLS security.
	 * 
	 * @property {boolean} disableHostVerification Disable host name verification, when
	 * making an HTTPS request. Host name verification is an SSL/TLS security option.
	 *
	 * @property {boolean} disablePeerVerification Disable certificate authenticity verification,
	 * when making an SSL/TLS connection. Authenticity verification is an SSL/TLS security option.
	 * 
	 * @property {function} onSocketResponse This function is the callback handler that is called
	 * whenever a response is returned from the socket connection.  This function should check
	 * the value of the responseType returned and determine the required action to take.  If the
	 * responseType = "open", then the socketID returned in the response should be used to send
	 * data in subsequent calls for this socket connection (see GDSocket.send).  NOTE: This
	 * function is required to be a non-null value.
	 * 
	 * @property {function} onSocketError This function is the callback handler that is called
	 * whenever a socket error occurs.  This function should check the value of the responseType
	 * returned and determine the required action to take.
	 */
	var GDSocket = function() {
		this.url = null;
		this.port = -1;
		this.useSSL = false;
		this.disableHostVerification = false;
		this.disablePeerVerification = false;
		this.onSocketResponse = null;
		this.onSocketError = null;
	};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDSocket *****
	
	/**
	 * @function GDSocket#createSocket
	 * 
	 * @description Call this function to create a socket and set the main parameters.  NOTE: This
	 * funtion only initializes the socket parameters; it does not initiate data transfer nor does
	 * it make the initial socket connection (see GDSocket.connect).
	 * 
	 * @param {string} url The address of the server. Can be either an Internet Protocol
	 * address (IP address, for example "192.168.1.10"), or a fully qualified domain name
	 * (for example "www.example.com").
	 * 
	 * @param {number} port Number of the server port to which the socket will connect.
	 * 
	 * @param {boolean} useSSL his value determines whether or not to use SSL/TLS security.
	 * 
	 * @return {GDSocket}
	 */
	GDSocket.prototype.createSocket = function(url, port, useSSL) {
		var result = new GDSocket();
		result.url = url;
		result.port = port;
		result.useSSL = useSSL;
		return result;
	};
	
	/**
	 * @function GDSocket#connect
	 * 
	 * @description Open a new socket connection.
	 * 
	 * @return {GDSocketResponse} A socket response object in JSON format.  The result should be
	 * parsed and saved as a GDSocketResponse object in the callback handler.  If the connection
	 * was successful then the response object will be initialize with a socketID property that
	 * can be used to send data using this socket connection (see GDSocket.send).  Since this is
	 * an asynchronous call, the response will be returned via the onSocketResponse callback or
	 * the onSocketError callback (whichever is applicable).
	 */
	GDSocket.prototype.connect = function() {
		// Make sure that the response callback handler is not null.
		if(this.onSocketResponse === null) {
			console.log("onSocketResponse callback handler for GDSocket object is null.");
			return;
		}
		
		var lUseSSL = (this.useSSL === true) ? "true" : "false";
		var lHost = (this.disableHostVerification === true) ? "true" : "false";
		var lPeer = (this.disablePeerVerification === true) ? "true" : "false";
		
		var parms = [this.url,
		             this.port.toString(),
		             lUseSSL,
		             lHost,
		             lPeer
		            ];
		cordovaRef.exec(this.onSocketResponse, this.onSocketError, "GDSocket", "connect", parms);
	};
	
	/**
	 * @function GDSocket#send
	 * 
	 * @description Call this function to send data using the open socket connection.
	 * 
	 * @param {string} socketID The identifier for the open socket connection.  This value
	 * is returned from a successful call to GDSocket.connect.
	 * 
	 * @param {string} data The data to transmit using the open socket.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function mySocketRequest(){
     *  var url = socket_url;
     *  var port = socket_port;
     *  var useSSL = false;
     *  //--createSocket 
     *  var aSocket = window.plugins.GDSocket.createSocket(url, port, useSSL);
     *  
     *  aSocket.onSocketResponse = function(obj) {
     *      console.log("Socket response is valid.");
     *      var socketResponse = window.plugins.GDSocket.parseSocketResponse(obj);
     *
     *      // Once the socket is open, attempt to send some data, then close the connection.
     *  switch(socketResponse.responseType) {
     *     case "open":
     *          console.log("Socket connection opened.");
     *
     *          // Format a string for the current time.
     *          var now = new Date();
     *          var localTime = now.toLocaleTimeString();
     *          var re = new RegExp("^[0-9]*:[0-9]*:[0-9]*");
     *          var matches = re.exec(localTime);
     *          var time = matches[0];
     *
     *          // Send some data to the server then close the connection.
     *          //-- send
     *          window.plugins.GDSocket.send(socketResponse.socketID, "Hello There! [" + time + "]");
     *          //-- close
     *          window.plugins.GDSocket.close(socketResponse.socketID);
     *          break;
     *      case "message":
     *          //-- close
     *          window.plugins.GDSocket.close(socketResponse.socketID);
     *          break;
     *      case "error":
     *          console.log("Received an error status from the socket connection.");
     *          break;
     *      case "close":
     *          console.log("Socket connection closed successfully.");
     *          break;
     *     default:
     *          console.log( "Unknown Socket response type: " + socketResponse.responseType);
     *     }
     *  };
     *  //-- onSocketError
     *  aSocket.onSocketError = function(err) {
     *      console.log("The socket connection failed: " + err);
     *  };
     *  //-- connect
     *  aSocket.connect();
     *
     * }
     * </code></pre>
     */
	GDSocket.prototype.send = function(socketID, data, success, failure) {
		if(socketID === null) {
			console.log("Null socketID passed to GDSocket.send.");
			return;
		}
		
		var parms = [socketID,
		             data
		            ];
		
		cordovaRef.exec(success, failure, "GDSocket", "send", parms);
	};

	/**
	 * @function GDSocket#close
	 * 
	 * @description Call this function to close the socket connection.
	 * 
	 * @param {string} socketID The identifier for the open socket connection.  This value
	 * is returned from a successful call to GDSocket.connect.
	 */
	GDSocket.prototype.close = function(socketID, success, failure) {
		if(socketID === null) {
			console.log("Null socketID passed to GDSocket.close.");
			return;
		}
		
		var parms = [socketID];
		
		cordovaRef.exec(success, failure, "GDSocket", "close", parms);
	};


	/**
	 * @function GDSocket#parseSocketResponse
	 * 
	 * @description Call this function to transform the socket response text into a
	 * GDSocketResponse object.
	 * 
	 * @param {string} responseText A string representing the socket response text.
	 * 
	 * @return {GDSocketResponse} The socket response object.
	 */
	GDSocket.prototype.parseSocketResponse = function(responseText) {
		return new GDSocketResponse(responseText);
	};

	// ***** END: MODULE METHOD DEFINITIONS - GDSocket *****

	/**
	 * @class GDCacheController
	 * @classdesc Use this class to control the secure authentication caches of the 
	 * GDURLLoadingSystem and GDHttpRequest classes. (Currently, there are only two controls.) 
	 * The secure authentication cache is used by these classes as follows:<br/>
	 * <br/>
	 * <b>GD URL Loading System</b>
	 * <ul>
	 *     <li>Stores credentials for all authentication methods.</li>
	 *     <li>Stores tickets for Kerberos authentication.</li>
	 * </ul>
	 * <b>GD HTTP Request</b>
	 * <ul>
	 *     <li>Stores tickets for Kerberos authentication.</li>
	 * </ul>
	 */
	var GDCacheController = function() {};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDCacheController *****
	
	/**
	 * @function GDCacheController#clearCredentialsForMethod
	 * 
	 * @description Call this function to clear the cached credentials for a 
	 * particular authentication method, or to clear for all methods. Calling this 
	 * function clears the session cache, and the permanent cache if present. 
	 * (Currently, the Good Dynamics client library only has a permanent cache for 
	 * Kerberos authentication tickets.)
	 * 
	 * @param {string} method One of the following constants, specifying which cache 
	 * or caches are to be cleared:
	 * <ul>
	 *	<li>"HTTPBasic" clears Basic Authentication credentials</li>
	 *	<li>"Default" also clears Basic Authentication credentials</li>
	 *	<li>"HTTPDigest" clears Digest Authentication credentials</li>
	 *	<li>"NTLM" clears Kerberos Authentication credentials and tickets</li>
	 *	<li>"Negotiate" clears Kerberos Authentication credentials and tickets</li>
	 *	<li>"All" clears all of the above</li>
	 * </ul>
	 * 
	 * @param {function} success Callback function to invoke upon successful completion of the request.
	 * @param {function} fail Callback function to invoke if the request cannot be completed.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function gdccOnSuccess(response) {
     *  console.log("The function call succeeded.");
	 * };
     * 
	 * function gdccOnError(response) {
     *   console.log("The function call failed: " + response);
     * };
     * 
     * function clearCredential(){
     *  var method = "HTTPDigest";
     *  try {
     *      window.plugins.GDCacheController.clearCredentialsForMethod(method, gdccOnSuccess, gdccOnError);
     *  } catch(e) {
     *      console.log("A try catch error was caught on GDCacheController.clearCredentialsForMethod");
     *  };
     * }
     *  </code></pre>
	 */
	GDCacheController.prototype.clearCredentialsForMethod = function(method, success, fail) {
		switch(method) {
		case "HTTPBasic":
		case "Default":
		case "HTTPDigest":
		case "NTLM":
		case "Negotiate":
		case "All":
			// Send it.
			cordovaRef.exec(success, fail, "GDHttpRequest", "clearCredentialsForMethod", [method]);
			break;
		default:
			console.log("Invalid method passed to GDCacheController.clearCredentialsForMethod: " + method);
			break;
		}
	};

	/**
	 * @function GDCacheController#kerberosAllowDelegation
	 * 
	 * @description Call this function to allow or disallow Kerberos delegation within Good Dynamics 
	 * secure communications. By default, Kerberos delegation is not allowed.  When Kerberos delegation 
	 * is allowed, the Good Dynamics run-time behaves as follows:
	 * 
	 * <ul>
	 *	<li>Kerberos requests will be for tickets that can be delegated.</li>
	 *	<li>Application servers that are trusted for delegation can be sent tickets that can be 
	 *      delegated, if such tickets were issued.</li>
	 * </ul>
	 * 
	 * When Kerberos delegation is not allowed, the Good Dynamics run-time behaves as follows:
	 * 
	 * <ul>
	 *	<li>Kerberos requests will not be for tickets that can be delegated.</li>
	 *	<li>No application server will be sent tickets that can be delegated, even if such tickets were issued.</li>
	 * </ul>
	 * 
	 * After this function has been called, delegation will remain allowed or disallowed until this function is 
	 * called again with a different setting.  When this function is called, the Kerberos ticket and credentials 
	 * caches will be cleared. I.e. there is an effective call to the clearCredentialsForMethod: function with an 
	 * NSURLAuthenticationMethodNegotiate parameter.  Note: User and service configuration in the Kerberos Domain 
	 * Controller (typically a Microsoft Active Directory server) is required in order for delegation to be 
	 * successful. On its own, calling this function will not make Kerberos delegation work in the whole end-to-end 
	 * application. 
	 * 
	 * @param {boolean} allow true to allow delegation, false to disallow. 
	 * @param {function} success Callback function to invoke upon successful completion of the request.
	 * @param {function} fail Callback function to invoke if the request cannot be completed.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function gdccOnSuccess(response) {
     *  console.log("The function call succeeded.");
	 * };
	 * 
	 * function gdccOnError(response) {
     *  console.log("The function call failed: " + response);
	 * };
	 * 
	 * function clearCredential(){
     *  try {
     *      window.plugins.GDCacheController.kerberosAllowDelegation(true, gdccOnSuccess, gdccOnError);
     *  } catch(e) {
     *       console.log("A try catch error was caught on GDCacheController.kerberosAllowDelegation");
     *  };
	 * }
	 * </code></pre>
	 * 
	 * 
	 */
	GDCacheController.prototype.kerberosAllowDelegation = function(allow, success, fail) {
		if(allow === true || allow === false)
			cordovaRef.exec(success, fail, "GDHttpRequest", "kerberosAllowDelegation", [allow]);
		else
			console.log("Invalid boolean value passed to GDCacheController.kerberosAllowDelegation. Type: " + typeof allow);
	};
	
	// ***** END: MODULE METHOD DEFINITIONS - GDCacheController *****

	// Install the plugin.
	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDHttpRequest) window.plugins.GDHttpRequest = new GDHttpRequest();
		if(!window.plugins.GDSocket) window.plugins.GDSocket = new GDSocket();
		if(!window.plugins.GDCacheController) window.plugins.GDCacheController = new GDCacheController();
	});
}());	// End the Module Definition.
//************************************************************************************************


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

if (!window.Cordova) window.Cordova = window.cordova;


;(function() {
  var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
  var ProgressEvent = (function() {  
      return function ProgressEvent(type, dict) {
           this.type = type;
           this.bubbles = false;
           this.cancelBubble = false;
           this.cancelable = false;
           this.lengthComputable = false;
           this.loaded = dict && dict.loaded ? dict.loaded : 0;
           this.total = dict && dict.total ? dict.total : 0;
           this.target = dict && dict.target ? dict.target : null;
      };
   }());

  function newProgressEvent(result) {
      var pe = new ProgressEvent();
      pe.lengthComputable = result.lengthComputable;
      pe.loaded = result.loaded;
      pe.total = result.total;
      return pe;
  }
  
//********************GDLocalFileSystem***********************//
  /**
   * @class GDLocalFileSystem
   * @classdesc This object provides a way to obtain root secure file systems. GDFileSystem
   *
   * 
   */
  var GDLocalFileSystem = function() {
  };
  
  GDLocalFileSystem.TEMPORARY = 0; //temporary, with no guarantee of persistence
  GDLocalFileSystem.PERSISTENT = 1; //persistent
  
  /**
   * @function GDLocalFileSystem#gdRequestFileSystem
   * @description gdRequestFileSystem - Request a secure file system in which to store application data.
   * @param {string} type local secure file system type
   * @param {integer} size  indicates how much storage space, in bytes, the application expects to need (not supported)
   * @param {function} successCallback invoked with a FileSystem object
   * @param {function} errorCallback invoked if error occurs retrieving the secure file system
   */
  var gdRequestFileSystem = function(type, size, successCallback, errorCallback) {
	  var fail = function(code) {
		  if (typeof errorCallback === 'function') {
			  errorCallback(new FileError(code));
		  }
	  };
	  //if (type < 0 || type > 3) {
	  if (type < 0 || type > 1) {
		  fail(FileError.SYNTAX_ERR);
	  } else {
	  	  var success = function(file_system) {
	  	   	if (file_system) {
	  	   	   if (successCallback) {
	  	   	   	   // grab the name and root from the file system object
	  	   	   	   var result = new FileSystem(file_system.name, file_system.root);
	  	   	   	   successCallback(result);
	  	   	   }
	  	   	} else {
	  	   		// no FileSystem object returned
	  	   		fail(FileError.NOT_FOUND_ERR);
	  	   	}
	  	  };
	  	  cordovaRef.exec(success, fail, "GDStorage", "requestFileSystem", [type, size]);
	  }
  };
  
  /**
   * @function GDLocalFileSystem#gdResolveLocalFileSystemURI
   * @description gdResolveLocalFileSystemURI Look up file system Entry referred to by local URI.
   * @param {string}  uri URI referring to a local file or directory
   * @param {function} successCallback invoked with Entry object corresponding to URI
   * @param {function} errorCallback invoked if error occurs retrieving file system entry
   * 
   * @example
   * <p class="p3"><br></p>
   * <p class="p4">GDLocalFileSystem<span class="s3"> overrides the PhoneGap </span>LocalFileSystem <span class="s3">object</span></p>
   * <p class="p1">Sample Code for <span class="s1">LocalFileSystem</span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22LocalFileSystem">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#LocalFileSystem</a></span></p>
   * <p class="p3"><br></p>
   * 
   */
  
  var gdResolveLocalFileSystemURI = function(uri, successCallback, errorCallback) {
	  // error callback
      var fail = function(error) {
          if (typeof errorCallback === 'function') {
              errorCallback(new FileError(error));
          }
      };
      // if successful, return either a file or directory entry
      var success = function(entry) {
          var result;

          if (entry) {
              if (typeof successCallback === 'function') {
                  // create appropriate Entry object
                  result = (entry.isDirectory) ? new GDDirectoryEntry(entry.name, entry.fullPath) : new GDFileEntry(entry.name, entry.fullPath);
                  try {
                      successCallback(result);
                  }
                  catch (e) {
                      console.log('Error invoking callback: ' + e);
                  }
              }
          }
          else {
              // no Entry object returned
              fail(FileError.NOT_FOUND_ERR);
          }
      };
      cordovaRef.exec(success, fail, "GDStorage", "resolveLocalFileSystemURI", [uri]);
  };
  
//**************GDFileSystem****************// 
    /**
   * @class GDFileSystem
   * @classdesc An interface representing a secure file system
   * @property {string} name the unique name of the file system (readonly)
   * @property {DirectoryEntry} root directory of the file system (readonly)
   */
  var GDFileSystem = function(name, root) {
	  this.name = name || null;
	  this.root = new GDDirectoryEntry("GDDocuments", "/");
  };
  
  /**
   * @function GDFileSystem#exportLogFileToDocumentsFolder
   * @description Call this function to create a dump of Good Dynamics activity logs. 
   * The logs will be dumped to a file that is outside the secure store, in the Documents folder. 
   * The file will not be encrypted. 
   */
  GDFileSystem.prototype.exportLogFileToDocumentsFolder = function(successCallback, errorCallback) {
	  var win = typeof successCallback !== 'function' ? null : function(result) {
		  successCallback();
	  };
	  var fail = typeof errorCallback !== 'function' ? null : function(code) {
		  errorCallback(new FileError(code));
	  };
	  cordovaRef.exec(win, fail, "GDStorage", "exportLogFileToDocumentsFolder", []);
  };
  
  /**
   * @function GDFileSystem#uploadLogs
   * @description Call this function to upload Good Dynamics activity logs for support purposes. 
   * The logs will be uploaded to a server in the Good Technology Network Operation Center (NOC).
   * Upload takes place in background and is retried as necessary.
   * 
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDFileSystem</span> overrides the PhoneGap <span class="s1">FileSystem </span>object</p>
   * <p class="p1">Sample Code for <span class="s1">FileSystem</span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22FileSystem">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#FileSystem</a></span></p>
   * <p class="p3"><br></p>
   * 
   */
  GDFileSystem.prototype.uploadLogs = function(successCallback, errorCallback) {
	  var win = typeof successCallback !== 'function' ? null : function(result) {
		  successCallback();
	  };
	  var fail = typeof errorCallback !== 'function' ? null : function(code) {
		  errorCallback(new FileError(code));
	  };
	  cordovaRef.exec(win, fail, "GDStorage", "uploadLogs", []);
  };
  
//********GDDirectoryEntry**********************// 
  /**
   * @class GDDirectoryEntry
   * @classdesc An interface representing a directory on the file system.
   * @property {boolean} isFile always false (readonly)
   * @property {boolean} isDirectory always true (readonly)
   * @property {string} name of the directory, excluding the path leading to it (readonly)
   * @property {string} fullPath the absolute full path to the directory (readonly)
   * @property {FileSystem} filesystem on which the directory resides (readonly) - not supported by Cordova
   */
   var GDDirectoryEntry = function(name, fullPath) {
	  this.isFile = false;
      this.isDirectory = true;
      this.name = name || '';
      this.fullPath = fullPath || '';
      this.filesystem = null;
  };

  /**
   * @function GDDirectoryEntry#createReader
   * @description Creates a new DirectoryReader to read entries from this directory
   */
  GDDirectoryEntry.prototype.createReader = function() {
	  return new GDDirectoryReader(this.fullPath);
  };
  
  /**
   * @function GDDirectoryEntry#getDirectory
   * @description getDirectory Creates or looks up a directory
   * @param {string} path either a relative or absolute path from this directory in which to look up or create a directory
   * @param {Flags} options to create or exclusively create the directory
   * @param {function} successCallback is called with the new entry
   * @param {function} errorCallback is called with a FileError
   */
  GDDirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
	  var create = options.create? "true":"false";
	  var win = typeof successCallback !== 'function' ? null : function(result) {
		  var entry = new GDDirectoryEntry(result.name, result.fullPath);
		  successCallback(entry);
	  };
	  var fail = typeof errorCallback !== 'function' ? null : function(code) {
		  errorCallback(new FileError(code));
	  };
	  cordovaRef.exec(win, fail, "GDStorage", "getDirectory", [this.fullPath, path, create]);
  };
  
  /**
   * @function GDDirectoryEntry#removeRecursively
   * @description Deletes a directory and all of it's contents
   * @param {function} successCallback is called with no parameters
   * @param {function} errorCallback is called with a FileError
   */
  GDDirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
	  var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(successCallback, fail, "GDStorage", "removeRecursively", [this.fullPath]);
  };

  /**
   * @function GDDirectoryEntry#getFile
   * @description Creates or looks up a file. 
   * @param {string} path either a relative or absolute path from this directory in which to look up or create a file
   * @param {Flags} options to create or exclusively create the file
   * @param {function} successCallback is called with the new entry
   * @param {function} errorCallback is called with a FileError
   * 
   */
  GDDirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
	  var win = typeof successCallback !== 'function' ? null : function(result) {
          var entry = new GDFileEntry(result.name, result.fullPath);
          successCallback(entry);
      };
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(win, fail, "GDStorage", "getFile", [this.fullPath, path, options]);
  };
  
  //**************************Common to Entry (GDDirectoryEntry)******************************//
  /**
   * @function GDDirectoryEntry#getMetadata
   * @description Look up the metadata of the entry.
   * @param {function} successCallback is called with a Metadata object
   * @param {function} errorCallback is called with a FileError
   */
  GDDirectoryEntry.prototype.getMetadata = function(successCallback, errorCallback) {
    var success = typeof successCallback !== 'function' ? null : function(lastModified) {
        var metadata = new Metadata(lastModified);
        successCallback(metadata);
    };
    var fail = typeof errorCallback !== 'function' ? null : function(code) {
        errorCallback(new FileError(code));
    };
    cordovaRef.exec(success, fail, "GDStorage", "getMetadata", [this.fullPath]);
  };

  /**
   * @function GDDirectoryEntry#moveTo
   * @description Move a file or directory to a new location.
   * @param {GDDirectoryEntry} parent the directory to which to move this entry
   * @param {string} newName new name of the entry, defaults to the current name
   * @param {function} successCallback called with the new DirectoryEntry object
   * @param {function} errorCallback called with a FileError
   */
  GDDirectoryEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
	  var fail = function(code) {
          if (typeof errorCallback === 'function') {
              errorCallback(new FileError(code));
          }
      };
      // user must specify parent Entry
      if (!parent) {
          fail(FileError.NOT_FOUND_ERR);
          return;
      }
      // source path
      var srcPath = this.fullPath,
          // entry name
          name = newName || this.name,
          success = function(entry) {
              if (entry) {
                  if (typeof successCallback === 'function') {
                      // create appropriate Entry object
                      var result = new GDDirectoryEntry(entry.name, entry.fullPath);
                      try {
                          successCallback(result);
                      }
                      catch (e) {
                          console.log('Error invoking callback: ' + e);
                      }
                  }
              }
              else {
                  // no Entry object returned
                  fail(FileError.NOT_FOUND_ERR);
              }
          };
      // copy
      cordovaRef.exec(success, fail, "GDStorage", "moveTo", [srcPath, parent.fullPath, name]);
  };

  /**
   *  @function GDDirectoryEntry#copyTo
   * @description Copy a directory to a different location. --NOT yet working
   * @param {GDDirectoryEntry} parent  the directory to which to copy the entry
   * @param {string} newName new name of the entry, defaults to the current name
   * @param {function} successCallback called with the new Entry object
   * @param {function} errorCallback called with a FileError
   */
  GDDirectoryEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
      var fail = function(code) {
          if (typeof errorCallback === 'function') {
              errorCallback(new FileError(code));
          }
      };
      // user must specify parent Entry
      if (!parent) {
          fail(FileError.NOT_FOUND_ERR);
          return;
      }
          // source path
      var srcPath = this.fullPath,
          // entry name
          name = newName || this.name,
          // success callback
          success = function(entry) {
              if (entry) {
                  if (typeof successCallback === 'function') {
                      // create appropriate Entry object
                      var result = (entry.isDirectory) ? new GDDirectoryEntry(entry.name, entry.fullPath) :
                          new GDFileEntry(entry.name, entry.fullPath);
                      try {
                          successCallback(result);
                      }
                      catch (e) {
                          console.log('Error invoking callback: ' + e);
                      }
                  }
              }
              else {
                  // no Entry object returned
                  fail(FileError.NOT_FOUND_ERR);
              }
          };
      cordovaRef.exec(success, fail, "GDStorage", "copyTo", [srcPath, parent.fullPath, name]);
  };

  /**
   * @function GDDirectoryEntry#toURL
   * @description Return a URL that can be used to identify this entry.
   * 
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDDirectoryEntry</span> overrides the PhoneGap <span class="s1">DirectoryEntry</span> object</p>
   * <p class="p1">Sample Code for <span class="s1">DirectoryEntry</span> : </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22DirectoryEntry">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#DirectoryEntry</a></span></p>
   * <p class="p3"><br></p>
   * 
   * 
   */
  GDDirectoryEntry.prototype.toURL = function() {
      // fullPath attribute contains the full URL
      return this.fullPath;
  };

  /**
   * @function GDDirectoryEntry#toURI
   * @description Returns a URI that can be used to identify this entry.
   * @param {string} mimeType mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
   * @return uri
   */
  GDDirectoryEntry.prototype.toURI = function(mimeType) {
      console.log("DEPRECATED: Update your code to use 'toURL'");
      // fullPath attribute contains the full URI
      return this.fullPath;
  };

  /**
   * @function GDDirectoryEntry#remove
   * @description Remove a file or directory. It is an error to attempt to delete a
   * directory that is not empty. It is an error to attempt to delete a
   * root directory of a file system.
   * @param {function} successCallback called with no parameters
   * @param {function} errorCallback called with a FileError
   */
  GDDirectoryEntry.prototype.remove = function(successCallback, errorCallback) {
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(successCallback, fail, "GDStorage", "remove", [this.fullPath]);
  };

  /**
   * @function GDDirectoryEntry#getParent
   * @description Look up the parent GDDirectoryEntry of this entry.
   * @param {function} successCallback called with the parent GDDirectoryEntry object
   * @param {function} errorCallback called with a FileError
   */
  GDDirectoryEntry.prototype.getParent = function(successCallback, errorCallback) {
      var win = typeof successCallback !== 'function' ? null : function(result) {
          var entry = new GDDirectoryEntry(result.name, result.fullPath);
          successCallback(entry);
      };
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(win, fail, "GDStorage", "getParent", [this.fullPath]);
  };
  
  //************************** GDFileEntry ******************************//
  /**
   * @class GDFileEntry
   * @classdesc An interface representing a directory on the file system.
   * @property {boolean} isFile always false (readonly)
   * @property {boolean} isDirectory always true (readonly)
   * @property {string} name of the directory, excluding the path leading to it (readonly)
   * @property {string} fullPath the absolute full path to the directory (readonly)
   * @property {FileSystem} filesystem on which the directory resides (readonly) - not supported by Cordova
   */
   var GDFileEntry = function(name, fullPath) {
	  this.isFile = true;
      this.isDirectory = false;
      this.name = name || '';
      this.fullPath = fullPath || '';
      this.filesystem = null;
  };
  
  /**
   * @function GDFileEntry#file
   * @description Returns a File that represents the current state of the file that this FileEntry represents.
   * @param {function} successCallback is called with the new File object
   * @param {function} errorCallback is called with a FileError
   */
  GDFileEntry.prototype.file = function(successCallback, errorCallback) {
     var win = typeof successCallback !== 'function' ? null : function(f) {
          var file = new GDFile(f.name, f.fullPath, f.type, f.lastModifiedDate, f.size);
          successCallback(file);
      };
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(win, fail, "GDStorage", "getFileMetadata", [this.fullPath]);
  };
  
  /**
   * @function GDFileEntry#createWriter
   * @descriptionCreates a new FileWriter associated with the file that this FileEntry represents.
   * @param {function} successCallback is called with the new FileWriter
   * @param {function} errorCallback is called with a FileError
   */
  GDFileEntry.prototype.createWriter = function(successCallback, errorCallback) {
	  this.file(function(filePointer) {
          var writer = new GDFileWriter(filePointer);

          if (writer.fileName === null || writer.fileName === "") {
              if (typeof errorCallback === "function") {
                  errorCallback(new FileError(FileError.INVALID_STATE_ERR));
              }
          } else {
              if (typeof successCallback === "function") {
                  successCallback(writer);
              }
          }
      }, errorCallback);
  };
  
  //**************************Common to Entry (GDFileEntry)******************************//
  /**
   * @function GDFileEntry#getMetadata
   * @description Look up the metadata of the entry.
   * @param {function} successCallback is called with a Metadata object
   * @param {function} errorCallback is called with a FileError
   */
  GDFileEntry.prototype.getMetadata = function(successCallback, errorCallback) {
    var success = typeof successCallback !== 'function' ? null : function(lastModified) {
        var metadata = new Metadata(lastModified);
        successCallback(metadata);
    };
    var fail = typeof errorCallback !== 'function' ? null : function(code) {
        errorCallback(new FileError(code));
    };
    cordovaRef.exec(success, fail, "GDStorage", "getMetadata", [this.fullPath]);
  };

  /**
   * @function GDFileEntry#moveTo
   * @description Move a file or directory to a new location.
   * @param {GDDirectoryEntry} parent the directory to which to move this entry
   * @param {string} newName new name of the entry, defaults to the current name
   * @param {function} successCallback called with the new DirectoryEntry object
   * @param {function} errorCallback called with a FileError
   */
  GDFileEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
	  var fail = function(code) {
          if (typeof errorCallback === 'function') {
              errorCallback(new FileError(code));
          }
      };
      // user must specify parent Entry
      if (!parent) {
          fail(FileError.NOT_FOUND_ERR);
          return;
      }
      // source path
      var srcPath = this.fullPath,
          // entry name
          name = newName || this.name,
          success = function(entry) {
              if (entry) {
                  if (typeof successCallback === 'function') {
                      // create appropriate Entry object
                      var result = new GDFileEntry(entry.name, entry.fullPath);
                      try {
                          successCallback(result);
                      }
                      catch (e) {
                          console.log('Error invoking callback: ' + e);
                      }
                  }
              }
              else {
                  // no Entry object returned
                  fail(FileError.NOT_FOUND_ERR);
              }
          };
      // copy
      cordovaRef.exec(success, fail, "GDStorage", "moveTo", [srcPath, parent.fullPath, name]);
  };

  /**
   * @function GDFileEntry#copyTo
   * @description Copy a directory to a different location. --NOT yet working
   * @param {GDDirectoryEntry} parent the directory to which to copy the entry
   * @param {string} newName new name of the entry, defaults to the current name
   * @param {function} successCallback called with the new Entry object
   * @param {function} errorCallback called with a FileError
   */
  GDFileEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
      var fail = function(code) {
          if (typeof errorCallback === 'function') {
              errorCallback(new FileError(code));
          }
      };
      // user must specify parent Entry
      if (!parent) {
          fail(FileError.NOT_FOUND_ERR);
          return;
      }
          // source path
      var srcPath = this.fullPath,
          // entry name
          name = newName || this.name,
          // success callback
          success = function(entry) {
              if (entry) {
                  if (typeof successCallback === 'function') {
                      // create appropriate Entry object
                      var result = (entry.isDirectory) ? new GDDirectoryEntry(entry.name, entry.fullPath) :
                          new GDFileEntry(entry.name, entry.fullPath);
                      try {
                          successCallback(result);
                      }
                      catch (e) {
                          console.log('Error invoking callback: ' + e);
                      }
                  }
              }
              else {
                  // no Entry object returned
                  fail(FileError.NOT_FOUND_ERR);
              }
          };
      cordovaRef.exec(success, fail, "GDStorage", "copyTo", [srcPath, parent.fullPath, name]);
  };

  /**
   * @function GDFileEntry#toURL
   * @description Return a URL that can be used to identify this entry.
   *  
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDFileEntry</span> overrides the PhoneGap <span class="s1">FileEntry </span>object</p>
   * <p class="p1">Sample Code for <span class="s1">FileEntry </span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22FileEntry">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#FileEntry</a></span></p>
   * <p class="p3"><br></p>
   * 
   * 
   */
  GDFileEntry.prototype.toURL = function() {
      // fullPath attribute contains the full URL
      return this.fullPath;
  };

  /**
   * @function GDFileEntry#toURI
   * @description Returns a URI that can be used to identify this entry.
   * @param {string} mimeType mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
   * @return uri
   */
  GDFileEntry.prototype.toURI = function(mimeType) {
      console.log("DEPRECATED: Update your code to use 'toURL'");
      // fullPath attribute contains the full URI
      return this.fullPath;
  };

  /**
   * @function GDFileEntry#remove
   * @description Remove a file or directory. It is an error to attempt to delete a
   * directory that is not empty. It is an error to attempt to delete a
   * root directory of a file system.
   * @param {function} successCallback called with no parameters
   * @param {function} errorCallback called with a FileError
   */
  GDFileEntry.prototype.remove = function(successCallback, errorCallback) {
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(successCallback, fail, "GDStorage", "remove", [this.fullPath]);
  };

  /**
   * @function GDFileEntry#getParent
   * @description Look up the parent GDDirectoryEntry of this entry.
   * @param {function} successCallback called with the parent GDDirectoryEntry object
   * @param {function} errorCallback called with a FileError
   */
  GDFileEntry.prototype.getParent = function(successCallback, errorCallback) {
      var win = typeof successCallback !== 'function' ? null : function(result) {
          var entry = new GDDirectoryEntry(result.name, result.fullPath);
          successCallback(entry);
      };
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(win, fail, "GDStorage", "getParent", [this.fullPath]);
  };
  
  //************************* GDDirectoryReader *****************************//
  /**
   * @class GDDirectoryReader
   * @classdesc  An interface that lists the files and directories in a directory.
   */
  function GDDirectoryReader(path) {
	  this.path = path || null;
  }

  /**
   * @function GDDirectoryReader#readEntries
   * @description Returns a list of entries from a directory.
   * @param {function} successCallback is called with a list of entries
   * @param {function} errorCallback is called with a FileError
   * @example
   * <p class="p3"><br></p>
   * <p class="p4">GDDirectoryReader<span class="s3"> overrides the PhoneGap </span>DirectoryReaderobject</p>
   * <p class="p1">Sample Code for <span class="s1">DirectoryReader</span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22DirectoryReader">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#DirectoryReader</a></span></p>
   * <p class="p3"><br></p>
   */
  GDDirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
	  var win = typeof successCallback !== 'function' ? null : function(result) {
          var retVal = [];
          for (var i=0; i<result.length; i++) {
              var entry = null;
              if (result[i].isDirectory) {
                  entry = new GDDirectoryEntry();
              }
              else if (result[i].isFile) {
                  entry = new GDDirectoryEntry();
              }
              entry.isDirectory = result[i].isDirectory;
              entry.isFile = result[i].isFile;
              entry.name = result[i].name;
              entry.fullPath = result[i].fullPath;
              retVal.push(entry);
          }
          successCallback(retVal);
      };
      var fail = typeof errorCallback !== 'function' ? null : function(code) {
          errorCallback(new FileError(code));
      };
      cordovaRef.exec(win, fail, "GDStorage", "readEntries", [this.path]);
  };

  
 //************************************* GDFile **********************// 
  /**
   * @class GDFile
   * @classdesc This object contains attributes of a single file.
   * @property {string} name  name of the file, without path information
   * @property {string} fullPath the full path of the file, including the name
   * @property {string} type mime type
   * @property {date} lastModifiedDate last modified date
   * @property {number} size size of the file in bytes
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDFile</span> overrides the PhoneGap <span class="s1">File </span>object</p>
   * <p class="p1">Sample Code for <span class="s1">File </span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22File">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#File</a></span></p>
   * <p class="p3"><br></p>
   * 
   */
  var GDFile = function(name, fullPath, type, lastModifiedDate, size){
      this.name = name || '';
      this.fullPath = fullPath || null;
      this.type = type || null;
      this.lastModifiedDate = lastModifiedDate || null;
      this.size = size || 0;
  };
	  
	
//************************************ GDFileReader ****************************
  /**
   * @class GDFileReader
   * @classdesc GDFileReader is an object that allows one to read a file from the Good Dynamics secure file system. 
   * Implements the GDFileSystem APIs.
   * @property {string} fileName File name of a secured file.
   * @property {integer} readyState One of the three states the reader can be in EMPTY, LOADING or DONE.		
   * @property {string} result The contents of the file that has been read. .
   * @property {FileError} error An object containing errors.
   * @property {function}	onloadstart Called when the read starts.
   * @property {function} onprogress Called while reading the file, reports progress (progess.loaded/progress.total). 
   * -NOT SUPPORTED
   * @property {function} onload Called when the read has successfully completed.			
   * @property {function} onerror Called when the read has been aborted. For instance, by invoking the abort() method.		
   * @property {function} onloadend Called when the read has failed.
   * @property {function} onabort  Called when the request has completed (either in success or failure).	
   */	

  //get native FileReader
  function getOriginalSymbol(context, symbolPath) {
      var parts = symbolPath.split('.'),
        obj = context;

      for (var i = 0; i < parts.length; ++i) {
          obj = obj && obj[parts[i]];
      }

      return obj;
  };

  var origFileReader = getOriginalSymbol(this, 'FileReader');

  var GDFileReader = function()
  {
    this.fileName = "";
    this.readyState = 0; // FileReader.EMPTY
    // File data
    this.result = null;
    // Error
    this.error = null;
    // Event handlers
    this._realReader = origFileReader ? new origFileReader() : {}; //original FileReader
	  this.onloadstart = null;    // When the read starts.
	  this.onprogress = null;     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
	  this.onload = null;         // When the read has successfully completed.
	  this.onerror = null;        // When the read has failed (see errors).
	  this.onloadend = null;      // When the request has completed (either in success or failure).
	  this.onabort = null;        // When the read has been aborted. For instance, by invoking the abort() method.
  };
  
  // States
  GDFileReader.EMPTY = 0;
  GDFileReader.LOADING = 1;
  GDFileReader.DONE = 2;
  
  /**
   * @function GDFileReader#abort
   * @description abort -  Aborts reading file.
   */
  GDFileReader.prototype.abort = function() 
  {
	  this.result = null;
	  if (this.readyState === GDFileReader.DONE || this.readyState === GDFileReader.EMPTY) {
		  return;
	  } 
	  this.readyState = GDFileReader.DONE;
	  // If abort callback
	  if (typeof this.onabort === 'function') {
		  this.onabort(new ProgressEvent('abort', {target:this}));
	  }
	  // If load end callback
	  if (typeof this.onloadend === 'function') {
		  this.onloadend(new ProgressEvent('loadend', {target:this}));
	  }
  };
  
  /**
   * @function GDFileReader#readAsText
   * @description readAsText - Reads text file.
   * @param {GDFile} file function to invoke upon successful completion of the request.
   * @param {string} encoding the encoding to use to encode the file's content. Default is UTF8.
   * Not supported in iOS, UTF8 encoding is always used.
   * 
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDFileReader</span> overrides the PhoneGap <span class="s1">FileReader </span>object</p>
   * <p class="p1">Sample Code for <span class="s1">FileReader </span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22FileReader">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#FileReader</a></span></p>
   * <p class="p3"><br></p>
   * 
   * 
   */
  GDFileReader.prototype.readAsText = function(file, encoding) 
  {
	  // Figure out pathing
	  this.fileName = '';
	  if (typeof file.fullPath === 'undefined') {
          this.fileName = file;
      } else {
          this.fileName = file.fullPath;
      }
	  // Already loading something
	  if (this.readyState === GDFileReader.LOADING) {
		  throw new FileError(FileError.INVALID_STATE_ERR);
	  }
	  // LOADING state
	  this.readyState = GDFileReader.LOADING;
	  // If loadstart callback
	  if (typeof this.onloadstart === "function") {
		  this.onloadstart(new ProgressEvent("loadstart", {target:this}));
	  }
	  // Default encoding is UTF-8
	  var enc = encoding ? encoding : "UTF-8";
	  var me = this;
	  // Read file
	  cordovaRef.exec(
			  // Success callback
			  function(r) {    
                  // If DONE (cancelled), then don't do anything
                  if (me.readyState === GDFileReader.DONE) {
                      return;
                  }
                  // Save result
                  me.result = r;
                  // If onload callback
                  if (typeof me.onload === "function") {
                      me.onload(new ProgressEvent("load", {target:me}));
                  }
                  // DONE state
                  me.readyState = GDFileReader.DONE;
                  // If onloadend callback
                  if (typeof me.onloadend === "function") {
                     me.onloadend(new ProgressEvent("loadend", {target:me}));
                  }
			  },
              // Error callback
              function(e) {
                  // If DONE (cancelled), then don't do anything
                  if (me.readyState === GDFileReader.DONE) {
                     return;
                  }
                  // DONE state
                  me.readyState = GDFileReader.DONE;
                  // null result
                  me.result = null;
                  // Save error
                  me.error = new FileError(e);
                  // If onerror callback
                  if (typeof me.onerror === "function") {
                     me.onerror(new ProgressEvent("error", {target:me}));
                  }
                  // If onloadend callback
                  if (typeof me.onloadend === "function") {
                     me.onloadend(new ProgressEvent("loadend", {target:me}));
                  }
			  },
              "GDStorage", "readAsText", [this.fileName, enc]);
  };

  /**
   * @function GDFileReader#readAsDataURL
   * @Description Read file and return data as a base64 encoded data url.
   * A data url is of the form: data:[<mediatype>][;base64],<data>
   * @param {GDFile} file File object containing file properties
   */
  GDFileReader.prototype.readAsDataURL = function(file) {  
	  this.fileName = "";
      if (typeof file.fullPath === "undefined") {
          this.fileName = file;
      } else {
          this.fileName = file.fullPath;
      }
      // Already loading something
      if (this.readyState === FileReader.LOADING) {
          throw new FileError(FileError.INVALID_STATE_ERR);
      }
      // LOADING state
      this.readyState = FileReader.LOADING;
      // If loadstart callback
      if (typeof this.onloadstart === "function") {
          this.onloadstart(new ProgressEvent("loadstart", {target:this}));
      }
      var me = this;
      // Read file
      cordovaRef.exec(
          // Success callback
          function(r) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === FileReader.DONE) {
                  return;
              }

              // DONE state
              me.readyState = FileReader.DONE;

              // Save result
              me.result = 'data:' + file.type + ';base64,' + r;

              // If onload callback
              if (typeof me.onload === "function") {
                  me.onload(new ProgressEvent("load", {target:me}));
              }

              // If onloadend callback
              if (typeof me.onloadend === "function") {
                  me.onloadend(new ProgressEvent("loadend", {target:me}));
              }
          },
          // Error callback
          function(e) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === FileReader.DONE) {
                  return;
              }
              // DONE state
              me.readyState = FileReader.DONE;
              me.result = null;
              // Save error
              me.error = new FileError(e);
              // If onerror callback
              if (typeof me.onerror === "function") {
                  me.onerror(new ProgressEvent("error", {target:me}));
              }
              // If onloadend callback
              if (typeof me.onloadend === "function") {
                  me.onloadend(new ProgressEvent("loadend", {target:me}));
              }
          }, "GDStorage", "readAsDataURL", [this.fileName]);
  };

  /**
   * @function GDFileReader#readAsBinaryString
   * @Description Read file and return data as a binary data.
   * @param {GDFile} file File object containing file properties
   */
  GDFileReader.prototype.readAsBinaryString = function(file) {
    this.fileName = "";
    if (typeof file.fullPath === "undefined") {
        this.fileName = file;
    } else {
        this.fileName = file.fullPath;
    }
    // Already loading something
    if (this.readyState === FileReader.LOADING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }
    // LOADING state
    this.readyState = FileReader.LOADING;
    // If loadstart callback
    if (typeof this.onloadstart === "function") {
        this.onloadstart(new ProgressEvent("loadstart", {target:this}));
    }
    var me = this;
    // Read file
    cordovaRef.exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }
                  
            // DONE state
            me.readyState = FileReader.DONE;
                  
            // Save result
            me.result = r;
                  
            // If onload callback
            if (typeof me.onload === "function") {
                me.onload(new ProgressEvent("load", {target:me}));
            }
                  
            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }
            // DONE state
            me.readyState = FileReader.DONE;
            me.result = null;
            // Save error
            me.error = new FileError(e);
            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {target:me}));
            }
            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        }, "GDStorage", "readAsBinaryString", [this.fileName]);
  };

  /**
   * @function GDFileReader#readAsArrayBuffer
   * @Description Read file and return data as a binary data.
   * @param {GDFile} file File object containing file properties
   */
  GDFileReader.prototype.readAsArrayBuffer = function(file) {
    this.fileName = "";
    if (typeof file.fullPath === "undefined") {
        this.fileName = file;
    } else {
        this.fileName = file.fullPath;
    }
    // Already loading something
    if (this.readyState === FileReader.LOADING) {
        throw new FileError(FileError.INVALID_STATE_ERR);
    }
    // LOADING state
    this.readyState = FileReader.LOADING;
    // If loadstart callback
    if (typeof this.onloadstart === "function") {
        this.onloadstart(new ProgressEvent("loadstart", {target:this}));
    }
    var me = this;
    // Read file
    cordovaRef.exec(
        // Success callback
        function(r) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }
                
            // DONE state
            me.readyState = FileReader.DONE;
                
                    // Save result
            me.result = r;
            
            // If onload callback
            if (typeof me.onload === "function") {
                me.onload(new ProgressEvent("load", {target:me}));
            }
                
            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        },
        // Error callback
        function(e) {
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }
            // DONE state
            me.readyState = FileReader.DONE;
            me.result = null;
            // Save error
            me.error = new FileError(e);
            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror(new ProgressEvent("error", {target:me}));
            }
            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend(new ProgressEvent("loadend", {target:me}));
            }
        }, "GDStorage", "readAsArrayBuffer", [this.fileName]);
  };
  
 //***************************** GDFileWriter ********************************//
  /**
   * @class GDFileWriter
   * @classdesc This class writes to the mobile device file system.
   * @param {file} file File object containing file properties
   * @param {bool} append if true write to the end of the file, otherwise overwrite the file
   */
  var GDFileWriter = function(file) {
      this.fileName = "";
      this.length = 0;
      if (file) {
          this.fileName = file.fullPath || file;
          this.length = file.size || 0;
      }
      // default is to write at the beginning of the file
      this.position = 0;
      this.readyState = 0; // EMPTY
      this.result = null;
      // Error
      this.error = null;
      // Event handlers
      this.onwritestart = null;   // When writing starts
      this.onprogress = null;     // While writing the file, and reporting partial file data
      this.onwrite = null;        // When the write has successfully completed.
      this.onwriteend = null;     // When the request has completed (either in success or failure).
      this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
      this.onerror = null;        // When the write has failed (see errors).
  };

  // States
  GDFileWriter.INIT = 0;
  GDFileWriter.WRITING = 1;
  GDFileWriter.DONE = 2;

  /**
   * @function GDFileWriter#abort
   * @Description Abort writing file.
   */
  GDFileWriter.prototype.abort = function() {
      // check for invalid state
      if (this.readyState === GDFileWriter.DONE || this.readyState === GDFileWriter.INIT) {
          throw new FileError(FileError.INVALID_STATE_ERR);
      }

      // set error
      this.error = new FileError(FileError.ABORT_ERR);

      this.readyState = GDFileWriter.DONE;

      // If abort callback
      if (typeof this.onabort === "function") {
          this.onabort(new ProgressEvent("abort", {"target":this}));
      }

      // If write end callback
      if (typeof this.onwriteend === "function") {
          this.onwriteend(new ProgressEvent("writeend", {"target":this}));
      }
  };

  /**
   * @function GDFileWriter#write
   * @Description Writes data to the file
   * @param {string} data to be written. Supports string and binary (Blob and ArrayBuffer)
   * 
   * @example
   * <p class="p3"><br></p>
   * <p class="p1"><span class="s1">GDFileWriter</span> overrides the PhoneGap <span class="s1">FileWriter </span>object</p>
   * <p class="p1">Sample Code for <span class="s1">FileWriter</span>: </p>
   * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html%22%20%5Cl%20%22FileWriter">http://docs.phonegap.com/en/1.7.0/cordova_file_file.md.html#FileWriter</a></span></p>
   * <p class="p3"><br></p>
   * 
   * 
   */
  GDFileWriter.prototype.write = function(data) {
	     
      var that = this;
      var supportsBinary = (typeof window.Blob !== 'undefined' && typeof window.ArrayBuffer !== 'undefined');
      var isBinary;

      // Check to see if the incoming data is a blob
      if (data instanceof File || (supportsBinary && data instanceof Blob)) {
          var fileReader = new FileReader();
          fileReader._realReader.onload = function() {
              // Call this method again, with the arraybuffer as argument
              GDFileWriter.prototype.write.call(that, this.result);
          };
          if (supportsBinary) {
              fileReader._realReader.readAsArrayBuffer(data);
          } else {
              fileReader.readAsText(data);
          }
          return;
      }

      // Mark data type for safer transport over the binary bridge
      isBinary = supportsBinary && (data instanceof ArrayBuffer);

      // Throw an exception if we are already writing a file
      if (this.readyState === GDFileWriter.WRITING) {
          throw new FileError(FileError.INVALID_STATE_ERR);
      }
      // WRITING state
      this.readyState = GDFileWriter.WRITING;
      var me = this;
      // If onwritestart callback
      if (typeof me.onwritestart === "function") {
          me.onwritestart(new ProgressEvent("writestart", {"target":me}));
      }

      // Write file
      cordovaRef.exec(
          // Success callback
          function(r) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === GDFileWriter.DONE) {
                  return;
              }

              // position always increases by bytes written because file would be extended
              me.position += r;
              // The length of the file is now where we are done writing.

              me.length = me.position;

              // DONE state
              me.readyState = GDFileWriter.DONE;

              // If onwrite callback
              if (typeof me.onwrite === "function") {
                  me.onwrite(new ProgressEvent("write", {"target":me}));
              }

              // If onwriteend callback
              if (typeof me.onwriteend === "function") {
                  me.onwriteend(new ProgressEvent("writeend", {"target":me}));
              }
          },
          // Error callback
          function(e) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === GDFileWriter.DONE) {
                  return;
              }

              // DONE state
              me.readyState = GDFileWriter.DONE;

              // Save error
              me.error = new FileError(e);

              // If onerror callback
              if (typeof me.onerror === "function") {
                  me.onerror(new ProgressEvent("error", {"target":me}));
              }

              // If onwriteend callback
              if (typeof me.onwriteend === "function") {
                  me.onwriteend(new ProgressEvent("writeend", {"target":me}));
              }
          }, "GDStorage", "write", [this.fileName, data, this.position, isBinary]);
  };

  /**
   * @function GDFileWriter#seek
   * @Description Moves the file pointer to the location specified.
   * If the offset is a negative number the position of the file
   * pointer is rewound.  If the offset is greater than the file
   * size the position is set to the end of the file.
   * @param {integer} offset is the location to move the file pointer to.
   */
  GDFileWriter.prototype.seek = function(offset) {
      // Throw an exception if we are already writing a file
      if (this.readyState === GDFileWriter.WRITING) {
          throw new FileError(FileError.INVALID_STATE_ERR);
      }

      if (!offset && offset !== 0) {
          return;
      }

      // See back from end of file.
      if (offset < 0) {
          this.position = Math.max(offset + this.length, 0);
      }
      // Offset is bigger then file size so set position
      // to the end of the file.
      else if (offset > this.length) {
          this.position = this.length;
      }
      // Offset is between 0 and file size so set the position
      // to start writing.
      else {
          this.position = offset;
      }
  };

  /**
   * @function GDFileWriter#truncate
   * @Description Truncates the file to the size specified.
   * @param {integer} size to chop the file at.
   */
  GDFileWriter.prototype.truncate = function(size) {
      // Throw an exception if we are already writing a file
      if (this.readyState === GDFileWriter.WRITING) {
          throw new FileError(FileError.INVALID_STATE_ERR);
      }

      // WRITING state
      this.readyState = GDFileWriter.WRITING;

      var me = this;

      // If onwritestart callback
      if (typeof me.onwritestart === "function") {
          me.onwritestart(new ProgressEvent("writestart", {"target":this}));
      }

      // Write file
      cordovaRef.exec(
          // Success callback
          function(r) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === GDFileWriter.DONE) {
                  return;
              }

              // DONE state
              me.readyState = GDFileWriter.DONE;

              // Update the length of the file
              me.length = r;
              me.position = Math.min(me.position, r);

              // If onwrite callback
              if (typeof me.onwrite === "function") {
                  me.onwrite(new ProgressEvent("write", {"target":me}));
              }

              // If onwriteend callback
              if (typeof me.onwriteend === "function") {
                  me.onwriteend(new ProgressEvent("writeend", {"target":me}));
              }
          },
          // Error callback
          function(e) {
              // If DONE (cancelled), then don't do anything
              if (me.readyState === GDFileWriter.DONE) {
                  return;
              }

              // DONE state
              me.readyState = GDFileWriter.DONE;

              // Save error
              me.error = new FileError(e);

              // If onerror callback
              if (typeof me.onerror === "function") {
                  me.onerror(new ProgressEvent("error", {"target":me}));
              }

              // If onwriteend callback
              if (typeof me.onwriteend === "function") {
                  me.onwriteend(new ProgressEvent("writeend", {"target":me}));
              }
          }, "GDStorage", "truncate", [this.fileName, size]);
  };

  /**
   * 
   * @class GDFileTransfer
   * @classdesc FileTransfer uploads a file to a remote server.
   * @constructor
   */
  var GDFileTransfer = function() {
    this.onprogress = null; // optional callback
  };

   /**
   * @function GDFileTransfer#upload
   * @Description Given an absolute file path, uploads a file on the device to a remote server
   * using a multipart HTTP request. 
   * @param filePath {String}           Full path of the file on the device
   * @param server {String}             URL of the server to receive the file
   * @param successCallback (Function}  Callback to be invoked when upload has completed
   * @param errorCallback {Function}    Callback to be invoked upon error
   * @param options {FileUploadOptions} Optional parameters such as file name and mimetype
   * @param trustAllHosts {Boolean} Optional trust all hosts (e.g. for self-signed certs), defaults to false
   */
  GDFileTransfer.prototype.upload = function(filePath, server, successCallback, errorCallback, options, trustAllHosts) {
	  // check for options
      var fileKey = null;
      var fileName = null;
      var mimeType = null;
      var params = null;
      var chunkedMode = true;
      if (options) {
          fileKey = options.fileKey;
          fileName = options.fileName;
          mimeType = options.mimeType;
          if (options.chunkedMode !== null || typeof options.chunkedMode !== "undefined") {
              chunkedMode = options.chunkedMode;
          }
          if (options.params) {
              params = options.params;
          }
          else {
              params = {};
          }
      }
  
      var self = this;
      var win = function(result) {
          if (typeof result.lengthComputable != "undefined") {
              if (self.onprogress) {
                  self.onprogress(newProgressEvent(result));
              }
          } else {
              successCallback && successCallback(result);
          }
      }

      cordovaRef.exec(win, errorCallback, 'GDFileTransfer', 'upload', [filePath, server, fileKey, fileName, mimeType, params, trustAllHosts, chunkedMode]);
  };

  /**
   * @function GDFileTransfer#download
   * @Description Downloads a file form a given URL and saves it to the specified directory.
   * @param source {String}          URL of the server to receive the file
   * @param target {String}         Full path of the file on the device
   * @param successCallback (Function}  Callback to be invoked when upload has completed
   * @param errorCallback {Function}    Callback to be invoked upon error
   */
  GDFileTransfer.prototype.download = function(source, target, successCallback, errorCallback) {
  
      var self = this;
  
      var win = function(result) {
        if (typeof result.lengthComputable != "undefined") {
            if (self.onprogress) {
                self.onprogress(newProgressEvent(result));
            }
        } else {
            var entry = null;
            entry = (result.isDirectory) ? new GDDirectoryEntry(result.name, result.fullPath) : new GDFileEntry(result.name, result.fullPath);
          
            entry.isDirectory = result.isDirectory;
            entry.isFile = result.isFile;
            successCallback(entry);
        };
      }
      
      cordovaRef.exec(win, errorCallback, 'GDFileTransfer', 'download', [source, target]);
  };
  
   /**
   * 
   * @classs GDSecureStorage
   * @classdescc FileTransfer uploads a file to a remote server.
   * @constructor
   */
  var GDSecureStorage = function() {};

  /* Local Storage */
  var storageDictionary;    // the dictionary to hold local storage
  var secureStorage;         // global GDSecureStorage object for local storage functions

  GDSecureStorage.prototype.setItem = function(key, value) {
  
        if ( !storageDictionary ) {
            storageDictionary = new Object();
        }
        
        // keep local java script dictionary in sync
        storageDictionary[ key ] = value;
        
        cordovaRef.exec(null, null, "GDStorage", "setItem", [key, value]);
  };

  GDSecureStorage.prototype.getItem = function(key) {
          
        // retrieve the result from the storageDictionary
        var resultToReturn;
        
        try {
            resultToReturn = storageDictionary[ key ];
        }
        catch( err ) {
            resultToReturn = null;
            alert( "catch in get item" );
        }

        return resultToReturn;
  };
  
  GDSecureStorage.prototype.removeItem = function(key) {
          
        delete storageDictionary[ key ];
        cordovaRef.exec(null, null, "GDStorage", "removeStorageItem", [key]);
  };
  
  GDSecureStorage.prototype.length = function() {
          
        var count = 0;
        for (var k in storageDictionary) {
            ++count;
        }

        return count;
  };

  GDSecureStorage.prototype.key = function(index) {
          
        // return the Ith key
        var count = 0;
        for (var k in storageDictionary) {
            if (storageDictionary.hasOwnProperty(k)) {
                if ( count == index )
                    return k;
                ++count;
            }
        }

        return null;
  };

  GDSecureStorage.prototype.clear = function() {
    
        // clear local storage
        storageDictionary = new Object();
        cordovaRef.exec(null, null, "GDStorage", "clearStorage", []);        
  };
  
  GDSecureStorage.prototype.getDictionary = function() {

    // retrieve the dictionary from the plugin
    cordovaRef.exec( function( result ) { 
        try {
            storageDictionary = eval( result );
        }
        catch (err) {
        }
    }, null, "GDStorage", "getDictionary", []);
  };
  
  //***************************** sqlite3enc_import ********************************//

  /**
   * @function sqlite3enc_import
   * @description This method will return a Secure Database object. Use the Database Object to manipulate the data.
   * @property {string} srcFilename Full path, within the secure file system, of the plain SQLite database file to be imported.
   * @property {string} destFilename Full path of the database to be created. If the database already exists, its contents will be overwritten.
   * @param successCallback (Function}  Callback to be invoked when upload has completed
   * @param errorCallback {Function}    Callback to be invoked upon error
   * 
   * 
   * @example
   * <pre class="prettyprint"><code>
   * function success(dbFile) {
   *     console.log("Imported Database Path: " + dbFile.fullPath);
   *     db = window.openDatabase(dbFile.fullPath, "1.0", "Secure SQLite", 200000);
   * }
   * 
   * function fail(error) {
   *     alert(error.code);
   * }
   * 
   * function importSQLiteFile(entry) {
   *  sqlite3enc_import(entry.fullPath,"/SecureSQLite3.db",success,fail);
   * }
   * </code></pre>
   */
  //const char *srcFilename, const char *destFilename
  var gdSQLite3enc_import = function(srcFilename,destFilename,successCallback,errorCallback) {
	var win = typeof successCallback !== 'function' ? null : function(result) {
		var dbFileEntry = new GDFileEntry(result.name,result.fullPath);
		dbFileEntry.isDirectory = false;
		dbFileEntry.isFile = true;
        successCallback(dbFileEntry);
    };
    var fail = typeof errorCallback !== 'function' ? null : function(code) {
        errorCallback(new FileError(code));
    };
    
    cordovaRef.exec(win, fail, "GDStorage", "sqlite3enc_import", [srcFilename, destFilename]);
  };
  
//***************************** GDSQLitePlugin ********************************//
/**
 * @class GDSQLitePlugin
 * @classdesc GDSQLitePlugin is a Secure Database object. Use this Object to manipulate the data.
 * 
 * @property {string} name The name of the database.
 * @property {string} version The version of the database.
 * @property {string} displayName The display name of the database.
 * @property {integer} size The size of the database in bytes.
 * 
 */
  var GDSQLitePlugin, GDSQLitePluginTransaction, counter, getOptions, root, exec;
  root = this;
  counter = 0;

  exec = function(method, options, success, error) {
    if (root.sqlitePlugin.DEBUG){
      console.log('GDSQLitePlugin.' + method + '(' + JSON.stringify(options) + ')');
    }
    cordova.exec(success, error, "GDSQLite", method, [options]);
  };

  GDSQLitePlugin = function(dbargs, openSuccess, openError) {
    if (!dbargs || !dbargs['name']) {
      throw new Error("Cannot create a GDSQLitePlugin instance without a db name");
    }

    this.dbargs = dbargs;
    this.dbname = dbargs.name;
    
    dbargs.name = this.dbname;

    this.openSuccess = openSuccess;
    this.openError = openError;
    var successMsg = "DB opened: " + this.dbname;
    this.openSuccess || (this.openSuccess = function() {
      console.log(successMsg);
    });
    this.openError || (this.openError = function(e) {
      console.log(e.message);
    });
    this.bg = !!dbargs.bgType && dbargs.bgType === 1;
    this.open(this.openSuccess, this.openError);
  };

  GDSQLitePlugin.prototype.openDBs = {};
  GDSQLitePlugin.prototype.txQueue = [];
  GDSQLitePlugin.prototype.databaseFeatures = { isGDSQLitePluginDatabase: true };
  /*
    DEPRECATED AND WILL BE REMOVED:
  */
  GDSQLitePlugin.prototype.features = { isGDSQLitePlugin: true };
  /*
    DEPRECATED AND WILL BE REMOVED:
  */
  GDSQLitePlugin.prototype.executePragmaStatement = function(sql, success, error) {
    if (!sql) throw new Error("Cannot executeSql without a query");
    this.executeSql(sql, [], success, error);
  };

  GDSQLitePlugin.prototype.executeSql = function(sql, values, success, error) {
    if (!sql) throw new Error("Cannot executeSql without a query");
    var mycommand = this.bg ? "backgroundExecuteSql" : "executeSql";
    var query = [sql].concat(values || []);
    var args = {dbargs: { dbname: this.dbname }, ex: {query: query}};
    var mysuccess = function (result) {
      var response = result;
      var payload = {
        rows: { item: function (i) { return response.rows[i] }, length: response.rows.length},
        rowsAffected: response.rowsAffected,
        insertId: response.insertId || null
      };
      success(payload);
    };
    exec(mycommand, args, mysuccess, error);
  };

/**
* @function GDSQLitePlugin#transaction
* @Description Calls the GDSQLitePluginTransaction object instance
* @param {function} fn function that has the transaction as a parameter
* @param {function} error Error callback.
* @param {function} success Success callback.
*/
  GDSQLitePlugin.prototype.transaction = function(fn, error, success) {
    var t = new GDSQLitePluginTransaction(this, fn, error, success);
    this.txQueue.push(t);
    if (this.txQueue.length == 1){
   	console.log('EXECUTING TRANSACTION');
      t.start();
    }
    else {
        console.log('NOT - EXECUTING TRANSACTION');
    }
  };
  GDSQLitePlugin.prototype.startNextTransaction = function(){
    this.txQueue.shift();
    if (this.txQueue[0]){
      this.txQueue[0].start();
    }
  };

  GDSQLitePlugin.prototype.open = function(success, error) {
    console.log('open db: ' + this.dbname);
	  var opts;
    if (!(this.dbname in this.openDBs)) {
      this.openDBs[this.dbname] = true;
      exec("open", this.dbargs, success, error);
    } else {
    	console.log('found db already open ...');
    	success();
    }
  };
  GDSQLitePlugin.prototype.close = function(success, error) {
    if (this.dbname in this.openDBs) {
      delete this.openDBs[this.dbname];
      exec("close", { path: this.dbname }, success, error);
    }
  };
  // API TBD ??? - subect to change:
  GDSQLitePlugin.prototype._closeCrashed = function(success, error) {
	 if(this.dbname in this.openDBs) {
		 delete this.openDBs[this.dbname];
	 }
	 success();
  };
  // API TBD ??? - subect to change:
  GDSQLitePlugin.prototype._deleteDB =
  GDSQLitePlugin.prototype._terminate = function(success,error) {
	  delete this.openDBs[this.dbname];
	  exec("delete", {path: this.dbname},success,error);
  };

//***************************** GDSQLTransaction ********************************//
/**
 * @class GDSQLitePluginTransaction
 * @classdesc GDSQLitePluginTransaction is an object that contains methods that allow the user to execute SQL statements against the secure Database.
 * @property {string} db database object which the transaction is executing against.
 * 
 */
  GDSQLitePluginTransaction = function(db, fn, error, success) {
    if (typeof fn !== 'function') {
      // This is consistent with the implementation in Chrome -- it
      // throws if you pass anything other than a function. This also
      // prevents us from stalling our txQueue if somebody passes a
      // false value for fn.
      throw new Error("transaction expected a function")
    }
    this.db = db;
    this.fn = fn;
    this.error = error;
    this.success = success;
    this.executes = [];
    this.executeSql('BEGIN', [], null, function(tx, err){ throw new Error("unable to begin transaction: " + err.message) });
  };

  GDSQLitePluginTransaction.prototype.start = function() {
    try {
      if (!this.fn) {
        return;
      }
      this.fn(this);
      this.fn = null;
      this.run();
    }
    catch (err) {
      // If "fn" throws, we must report the whole transaction as failed.
      this.db.startNextTransaction();
      if (this.error) {
        this.error(err);
      }
    }
  };

/**
* @function GDSQLitePluginTransaction#executeSql
* @Description Execute an SQL statements against the Secure Database.
* @param {string} sql SQL statement to execute.
* @param {array} values Array of arguments for the SQL statement parameters.
* @param {function} successk Success callback.
* @param {function} error Error callback.
* 
* @example
* <p class="p3"><br></p>
* <p class="p4">GDSQLTransaction<span class="s3"> overrides the PhoneGap </span>SQLTransaction <span class="s3">object</span></p>
* <p class="p1">Sample Code for <span class="s1">SQLTransaction</span>: </p>
* <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_storage_storage.md.html">http://docs.phonegap.com/en/1.7.0/cordova_storage_storage.md.html#SQLTransaction</a></span></p>
* <p class="p3"><br></p> 
*/
  GDSQLitePluginTransaction.prototype.executeSql = function(sql, values, success, error) {
    var qid = this.executes.length;
    
    this.db.bg = false;
    this.executes.push({
      qid: qid,
      sql: sql,
      params: values || [],
      success: success,
      error: error
    });
  };


  /**
  * @function GDSQLitePluginTransaction#backgroundExecuteSql
  * @Description Execute an SQL statements against the Secure Database in background.
  * @param {string} sql SQL statement to execute.
  * @param {array} values Array of arguments for the SQL statement parameters.
  * @param {function} successk Success callback.
  * @param {function} error Error callback.
  * 
  * @example
  * <p class="p3"><br></p>
  * <p class="p4">GDSQLTransaction<span class="s3"> overrides the PhoneGap </span>SQLTransaction <span class="s3">object</span></p>
  * <p class="p1">Sample Code for <span class="s1">SQLTransaction</span>: </p>
  * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_storage_storage.md.html">http://docs.phonegap.com/en/1.7.0/cordova_storage_storage.md.html#SQLTransaction</a></span></p>
  * <p class="p3"><br></p> 
  */
  GDSQLitePluginTransaction.prototype.backgroundExecuteSql = function(sql, values, success, error) {
    var qid = this.executes.length;

    this.db.bg = true;
    this.executes.push({
      qid: qid,
      sql: sql,
      params: values || [],
      success: success,
      error: error
    });
  };

  GDSQLitePluginTransaction.prototype.handleStatementSuccess = function(handler, response) {
    if (!handler)
      return;
    var payload = {
      rows: { item: function (i) { return response.rows[i] }, length: response.rows.length},
      rowsAffected: response.rowsAffected,
      insertId: response.insertId || null
    };
    handler(this, payload);
  };

  GDSQLitePluginTransaction.prototype.handleStatementFailure = function(handler, error) {
    if (!handler || handler(this, error)){
      throw error;
    }
  };

  GDSQLitePluginTransaction.prototype.run = function() {

    var batchExecutes = this.executes,
        waiting = batchExecutes.length,
        txFailure,
        tx = this,
        opts = [];
        this.executes = [];

    // var handlerFor = function (index, didSucceed) {
    var handleFor = function (index, didSucceed, response) {
      try {
        if (didSucceed){
          tx.handleStatementSuccess(batchExecutes[index].success, response);
        } else {
          tx.handleStatementFailure(batchExecutes[index].error, response);
        }
      }
      catch (err) {
        if (!txFailure)
          txFailure = err;
      }
      if (--waiting == 0){
        if (txFailure){
          tx.rollBack(txFailure);
        } else if (tx.executes.length > 0) {
          // new requests have been issued by the callback
          // handlers, so run another batch.
          tx.run();
        } else {
          tx.commit();
        }
      }
    }

    for (var i=0; i<batchExecutes.length; i++) {
      var request = batchExecutes[i];
      opts.push({
        qid: request.qid,
        query: [request.sql].concat(request.params),
        sql: request.sql,
        params: request.params
      });
    }

    // NOTE: this function is no longer expected to be called:
    var error = function (resultsAndError) {
        var results = resultsAndError.results;
        var nativeError = resultsAndError.error;
        var j = 0;

        // call the success handlers for statements that succeeded
        for (; j < results.length; ++j) {
          handleFor(j, true, results[j]);
        }

        if (j < batchExecutes.length) {
          // only pass along the additional error info to the statement that
          // caused the failure (the only one the error info applies to);
          var error = new Error('Request failed: ' + opts[j].query);
          error.code = nativeError.code;
          // the following properties are only defined if the plugin
          // was compiled with INCLUDE_SQLITE_ERROR_INFO
          error.sqliteCode = nativeError.sqliteCode;
          error.sqliteExtendedCode = nativeError.sqliteExtendedCode;
          error.sqliteMessage = nativeError.sqliteMessage;

          handleFor(j, false, error);
          j++;
        }

        // call the error handler for the remaining statements
        // (Note: this doesn't adhere to the Web SQL spec...)
        for (; j < batchExecutes.length; ++j) {
          handleFor(j, false, new Error('Request failed: ' + opts[j].query));
        }
    };

    var success = function (results) {
      if (results.length != opts.length) {
        // Shouldn't happen, but who knows...
        error(results);
      }
      else {
        for (var j = 0; j < results.length; ++j) {
          if (!results[j].error) {
            var result = results[j].result;
            handleFor(j, true, result);
          } else {
            var error = new Error('Request failed: ' + opts[j].query);
            error.code = results[j].error.code;
            handleFor(j, false, error);
          }
        }
      }
    };
    mycommand = this.db.bg ? "backgroundExecuteSqlBatch" : "executeSqlBatch";
    var args = {dbargs: { dbname: this.db.dbname }, executes: opts};
    exec(mycommand, args, success, /* not expected: */ error);
  };

  GDSQLitePluginTransaction.prototype.rollBack = function(txFailure) {
    if (this.finalized)
      return;
    this.finalized = true;
    tx = this;
    function succeeded(){
      tx.db.startNextTransaction();
      if (tx.error){
        tx.error(txFailure)
      }
    }
    function failed(tx, err){
      tx.db.startNextTransaction();
      if (tx.error){
        tx.error(new Error("error while trying to roll back: " + err.message))
      }
    }
    this.executeSql('ROLLBACK', [], succeeded, failed);
    this.run();
  };

  GDSQLitePluginTransaction.prototype.commit = function() {
    if (this.finalized)
      return;
    this.finalized = true;
    tx = this;
    function succeeded(){
      tx.db.startNextTransaction();
      if (tx.success){
        tx.success()
      }
    }
    function failed(tx, err){
      tx.db.startNextTransaction();
      if (tx.error){
        tx.error(new Error("error while trying to commit: " + err.message))
      }
    }
    this.executeSql('COMMIT', [], succeeded, failed);
    this.run();
  };

  GDSQLiteFactory = {
    opendb: function() {
      var errorcb, first, okcb, openargs;
      if (arguments.length < 1) return null;
      first = arguments[0];
      openargs = null;
      okcb = null;
      errorcb = null;
      if (first.constructor === String) {
        openargs = {
          name: first
        };
        if (arguments.length >= 5) {
          okcb = arguments[4];
          if (arguments.length > 5) errorcb = arguments[5];
        }
      } else {
        openargs = first;
        if (arguments.length >= 2) {
          okcb = arguments[1];
          if (arguments.length > 2) errorcb = arguments[2];
        }
      }
      return new GDSQLitePlugin(openargs, okcb, errorcb);
    },
    deleteDb: function(databaseName, success, error) {
        exec("delete", { path: databaseName }, success, error);
    }
  };

//***************************** GDSQLitePlugin openDatabase ********************************//
/**
 * @function GDSQLitePlugin#openDatabase
 * @description This method will return a Secure Database object. Use the Database Object to manipulate the data.
 * @property {string} dbPath The file path of the database.
 * @property {string} version The version of the database.
 * @property {string} displayName The display name of the database.
 * @property {integer} size The size of the database in bytes.
 * @param {function} creationCallback Success callback.
 * @param {function} errorCallback Error callback. 
 * 
 * @example
 * <p class="p3"><br></p>
 * <p class="p1"><span class="s1">gdOpenDatabase</span> overrides the PhoneGap <span class="s1">openDatabase </span>object</p>
 * <p class="p1">Sample Code for <span class="s1">openDatabase</span>: </p>
 * <p class="p2"><span class="s2"><a href="http://docs.phonegap.com/en/1.7.0/cordova_stora">http://docs.phonegap.com/en/1.7.0/cordova_storage_storage.md.html#openDatabase</a></span></p>
 */
  root.sqlitePlugin = {
    sqliteFeatures: { isSQLitePlugin: true },
    openDatabase: GDSQLiteFactory.opendb,
    deleteDatabase: GDSQLiteFactory.deleteDb
  };
  //***** END: Classes *****//
  
  // Install the plugin.
  cordovaRef.addConstructor(function() {

	  
	  //*******************************************//
	    if(!window.plugins) window.plugins = {};
        
        LocalFileSystem = GDLocalFileSystem;
        requestFileSystem = gdRequestFileSystem;
        resolveLocalFileSystemURI = gdResolveLocalFileSystemURI;
        FileSystem = GDFileSystem;
        DirectoryEntry = GDDirectoryEntry;
        DirectoryReader = GDDirectoryReader;
        FileEntry = GDFileEntry;
        File = GDFile;
        FileReader = GDFileReader;	
        FileWriter = GDFileWriter;
        openDatabase = sqlitePlugin.openDatabase;

        FileTransfer = GDFileTransfer;
        sqlite3enc_import=gdSQLite3enc_import;
         
        // Override Storage for local storage
        {
        	secureStorage = new GDSecureStorage();
            secureStorage.getDictionary();
            
            Storage.prototype._setItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value)
            {
              secureStorage.setItem( key, value );
            }

            Storage.prototype._getItem = Storage.prototype.getItem;
            Storage.prototype.getItem = function(key)
            {  
              return secureStorage.getItem( key );
            }

            Storage.prototype._removeItem = Storage.prototype.removeItem;
            Storage.prototype.removeItem = function(key)
            {  
              return secureStorage.removeItem( key );
            }

            Storage.prototype._key = Storage.prototype.key;
            Storage.prototype.key = function(index)
            {  
              return secureStorage.key( index );
            }

            Storage.prototype._clear = Storage.prototype.clear;
            Storage.prototype.clear = function()
            {  
              return secureStorage.clear();
            }

            Storage.prototype._length = Storage.prototype.length;
            Storage.prototype.getLength = function()
            {  
              return secureStorage.length();
            }
        }
        
        //Stays the same
        //- MetaData
        //- Flags
        //- FileError
        //- FileTransfer
        //- FileTransferError
        //- FileUploadOptions 
        //- FileUploadResult      
        //- 
   });
}());

// End GDStorage.js
//*****************************************************************  //leave empty line after


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

	/**
	 * @class GDPushChannelResponse
	 * @classdesc This class encapsulates the response returned from the GDPush class.
	 * 
	 * @param {string} json The input data (formatted as JSON text) used to construct the
	 * response object.
	 * 
	 * @property {string} channelID The unique ID for the push channel that generated this response.
	 * 
	 * @property {string} responseType This value is used to distinguish what action triggered this response.
	 * Valid values are:
	 * <ul>
	 *   <li>open - The channel was just successfully opened.</li>
	 *   <li>message - A new message was received from the server.  The responseData property will be
	 *   populated with the data from the server.</li>
	 *   <li>error - A channel error occurred.  The responseData may or may not be populated with a
	 *   description of the error.</li>
	 *   <li>close - The channel connection was closed.</li>
	 *   <li>pingFail - Ping Failure is an optional feature of the Push Channel framework. The application
	 *   server registers for ping after receiving the Push Channel token from the client.  If an
	 *   application server registers for ping, then the server will be periodically checked ("pinged") by
	 *   the Good Dynamics Network Operating Center (NOC). If the application server does not respond to a
	 *   ping, then the NOC notifies the client.</li>
	 * </ul>
	 * 
	 * @property {string} responseData This field will be populated with data from the server if the
	 * response contained data what was intended to be processed by the client.
	 * 
	 * @return {GDPushChannelResponse}
	 */
	var GDPushChannelResponse = function(json) {
		this.channelID = null;
		this.responseType = null;
		this.responseData = null;
		
		try {
			var obj = JSON.parse(unescape(json));
			this.channelID = obj.channelID;
			this.responseType = obj.responseType;
			
			/*
			 * The response could have been JSON text, which we might need to revert to it's
			 * string representation.
			 */
			try {
				if(typeof obj.responseData === 'Object') {
					this.responseData = JSON.stringify(obj.responseData);
				} else {
					this.responseData = obj.responseData;
				}
			} catch(e) {
				this.responseData = obj.responseData;
			}
		} catch(e) {
			this.responseType = "error";
		}
	};
	
	/**
	 * @class GDPushChannel
	 * @classdesc This class encapsulates the GD Push Channel object.  The Push Channel framework is a
	 * Good Dynamics (GD) feature used to receive notifications from an application server.  Note that
	 * the GD Push Channel feature is not part of the native iOS notification feature set; however,
	 * Push Channels are dependent on the Push Connection, and Push Channels can only be established when
	 * the Push Connection is open and operating.<br/>
	 * <br/>
	 * Push Channels are established from the client end, then used by the server when needed. The sequence
	 * of events is as follows:<br/>
	 * <ol>
	 * <li>The client sets an event handler for Push Channel notifications</li>
	 * <li>The client application requests a Push Channel token from the Good Dynamics proxy infrastructure</li>
	 * <li>The client application sends the token to its server using, for example, a socket or HTTP request</li>
	 * <li>The client can now wait for a Push Channel notification</li>
	 * </ol>
	 * The Good Dynamics platform keeps data communications between client and server alive while the client is
	 * waiting for a Push Channel notification. This is achieved by sending "heartbeat" messages at an interval
	 * that is dynamically optimized for battery and network performance.<br/>
	 * <br/>
	 * NOTE: Create a new push channel by calling <a href="GDPushConnection.html#createPushChannel">GDPushConnection.createPushChannel</a>.
	 * 
	 * @property {function} onChannelResponse This function is the callback handler that is called
	 * whenever a response is returned from the channel connection.  This function should check
	 * the value of the responseType returned and determine the required action to take.  If the
	 * responseType = "open", then the channelID returned in the response should be used to reference this
	 * channel in subsequent calls over this connection (see <a href="#close">GDPushChannel.close</a>).  NOTE: This
	 * function is required to be a non-null value.
	 */
	var GDPushChannel = function(responseCallback) {
		if(typeof responseCallback === 'function')
			this.onChannelResponse = responseCallback;
	};
	
	/**
	 * @function GDPushChannel#open
	 * 
	 * @description Call this function to open the Push Channel. This function can only be called when
	 * the channel is not open.  This function causes a request for a Push Channel to be sent to the Good
	 * Dynamics proxy infrastructure Network Operating Center (NOC). The NOC will create the channel, and
	 * issue a Push Channel token, which can then be used to identify the channel.  Logically, Push
	 * Channels exist within the Push Connection. Opening a Push Channel will not succeed if the Push
	 * Connection is not open and operating.
	 *  
	 * @return {GDPushChannelResponse} A push channel response object in JSON format.  The result should be
	 * parsed and saved as a GDPushChannelResponse object in the callback handler.  If the channel was
	 * opened then the response object will be initialize with a channelID property that can be used to
	 * reference this channel connection.  Additionally, the response will also contain a token that uniquely
	 * identifies the device associated with this push channel.  Since this is an asynchronous call, the
	 * response will be returned via the onChannelResponse callback.
	 * 
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function myPushConnection(){
     *  var myConnection;
     *  var channel = null;
     *  var savedChannelID = null;
     *  //--GDPushConnection
     *  myConnection = window.plugins.GDPushConnection;
     *  
     *  try {
     *       myConnection = window.plugins.GDPushConnection;
     *  } catch(e) {
     *       console.log("Unable to initialize the GD Connection (mConnection).");
     *  }
     *  
     *  //-- GDPushChannelResponse
     *  function pushChannelResponse(response){
     *      try {
     *          var channelResponse = mConnection.parseChannelResponse(response);
     *          console.log("Got response channelID: " + channelResponse.channelID);
     *          console.log("Got response responseType: " + channelResponse.responseType);
     *          console.log("Got response responseData: " + channelResponse.responseData);
     *          switch(channelResponse.responseType) {
     *          case "open":
     *              savedChannelID = channelResponse.channelID;
     *              console.log("Channel connection opened with ID :" + savedChannelID);
     *          
     *              // send application server the savedChannelID (token) here
     *          
     *          case "message":
     *          
     *              // handle pushed message from the server 
     *          
     *              break;
     *          case "error":
     *              console.log("Received an error status from the channel connection.");
     *              break;
     *          case "close":
     *              console.log("Channel connection closed successfully.");
     *          case "pingFail":
     *              break;
     *          default:
     *              ok(false, "Unknown channel response type: " + channelResponse.responseType);
     *              break;
     *          }
     *      } catch(e) {
     *           console.log("Invalid response object sent to channel response callback handler.");
     *      }
     *  };
     *  
     *  function pushConnectionOk(){
     *      //-- GDPushChannel
     *      channel = myConnection.createPushChannel(pushChannelResponse);
     *      channel.open();
     *  };
     *  
     *  if(myConnection !== "undefined"){
     *       myConnection.isConnected(
     *       function(result) {
     *                  console.log("Push connection is established.");
     *                  pushConnectionOk();
     *              },
     *              function(result) {
     *                  console.log("An error occurred while checking the status of the push connection: " + result);
     *              }
     *  );
     *  };
     * };
	 * </code></pre>
	 */
	GDPushChannel.prototype.open = function() {
		// Make sure that the response callback handler is not null.
		if(this.onChannelResponse === null || typeof this.onChannelResponse === 'undefined') {
			console.log("onChannelResponse callback handler for GDPushChannel object is null.");
			return;
		}
		
		cordovaRef.exec(this.onChannelResponse, null, "GDPush", "open", ["none"]);
	};
	
	/**
	 * @function GDPushChannel#close
	 * 
	 * @description Call this function to initiate permanent disconnection of the Push Channel.  This function
	 * causes a request for Push Channel termination to be sent to the Good Dynamics proxy infrastructure Network
	 * Operating Center (NOC). The NOC will delete the channel, and invalidate the Push Channel token that was
	 * issued when the channel was initially opened.
	 * 
	 * @param {string} channelID The unique ID for the push channel to close.
	 */
	GDPushChannel.prototype.close = function(channelID) {
		if(channelID === null || typeof channelID === 'undefined') {
			console.log("Null channelID passed to GDPushChannel.close.");
			return;
		}
		
		var parms = [channelID];
		cordovaRef.exec(this.onChannelResponse, this.onChannelResponse, "GDPush", "close", parms);
	};
	
	/**
	 * @class GDPushConnection
	 * 
	 * @classdesc The Push Connection is the container and conduit for the device's Push Channels. An
	 * application may open multiple Push Channels; all will be managed within a single Push Connection.
	 * The Push Connection is automatically established during Good Dynamics authorization processing,
	 * and then maintained by the Good Dynamics run-time under application control. The application can
	 * instruct the run-time to switch the Push Connection off and on.  When instructed to switch off,
	 * the GD run-time will terminate the Push Connection, and suspend its maintenance. When instructed
	 * to switch back on, the GD run-time will re-establish the Push Connection, and resume maintenance.
	 * Switching off the Push Connection might be an option that the application offers to the end user,
	 * for example, allowing them to reduce power consumption on the device.
	 * 
	 * @property {function} onConnected Callback function to invoke after the connection is established.
	 * 
	 * @property {function} onDisconnected Callback function to invoke after the connection is terminated.
	 */
	var GDPushConnection = function() {
		this.onConnected = null;
		this.onDisconnected = null;
	};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDPushConnection *****
	
	/**
	 * @function GDPushConnection#initialize
	 * @description Initialize the push connection in prior to establishing the connection.  This function
	 * should be called before calling <a href="#connect">GDPushConnection.connect</a>.
	 * 
	 * @param {function} onConnected Callback function to invoke after the connection is established.
	 * 
	 * @param {function} onDisconnected Callback function to invoke after the connection is terminated.
	 */
	GDPushConnection.prototype.initialize = function(onConnected, onDisconnected) {
		if(typeof onConnected !== 'function') {
			console.log("ERROR in GDPushConnection.initialize: onConnected parameter is not a function.");
			return;
		}
		
		if(typeof onDisconnected !== 'function') {
			console.log("ERROR in GDPushConnection.initialize: onDisconnected parameter is not a function.");
			return;
		}
		
		this.onConnected = onConnected;
		this.onDisconnected = onDisconnected;
	};
	
	/**
	 * @function GDPushConnection#connect
	 * 
	 * @description Call this function to establish, or re-establish, the Push Channel connection with the
	 * Good Dynamics proxy infrastructure Network Operating Center (NOC).
	 */
	GDPushConnection.prototype.connect = function() {
		if(this.onConnected === null || typeof this.onConnected === 'undefined') {
			console.log("ERROR: GDPushConnection has no onConnected handler defined.");
			return;
		}

		cordovaRef.exec(this.onConnected, this.onDisconnected, "GDPush", "connect", ["none"]);
	};
	
	/**
	 * @function GDPushConnection#disconnect
	 * 
	 * @description Call this function to terminate the Push Channel connection with the Good Dynamics
	 * proxy infrastructure Network Operating Center (NOC).
	 */
	GDPushConnection.prototype.disconnect = function() {
		cordovaRef.exec(this.onConnected, this.onDisconnected, "GDPush", "disconnect", ["none"]);
	};
	
	/**
	 * @function GDPushConnection#createPushChannel
	 * 
	 * @description Call this function to create a new push channel to receive notifications
	 * from an application server.  Push Channels can only be established when the Push Connection
	 * is open and operating.
	 * 
	 * @param {function} responseCallback Callback function to invoke whenever a response is received by
	 * this push channel.
	 * 
	 * @returns {GDPushChannel}
	 */
	GDPushConnection.prototype.createPushChannel = function(responseCallback) {
		return new GDPushChannel(responseCallback);
	};
	
	/**
	 * @function GDPushConnection#parseChannelResponse
	 * 
	 * @description Call this function to transform the push channel response text into a
	 * GDPushChannelResponse object.
	 * 
	 * @param {string} responseText A string representing the push channel response text.
	 * 
	 * @return {GDPushChannelResponse} The push channel response object.
	 */
	GDPushConnection.prototype.parseChannelResponse = function(responseText) {
		return new GDPushChannelResponse(responseText);
	};

	/**
	 * @function GDPushConnection#isConnected
	 * 
	 * @description This function returns the current status of the Push Channel connection. 
	 * 
	 * @param {function} responseCallback Callback function to invoke when the function returns.
	 * A single result string will be passed as the input to the callback function: "true" or
	 * "false".
	 * 
	 *  @return {boolean} "true" or "false".
	 */
	GDPushConnection.prototype.isConnected = function(responseCallback) {
		cordovaRef.exec(responseCallback, responseCallback, "GDPush", "isConnected", ["none"]);
	};

	
	// ***** END: MODULE METHOD DEFINITIONS - GDPushConnection *****

	// Install the plugin.
	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDPushConnection) window.plugins.GDPushConnection = new GDPushConnection();
	});
}());	// End the Module Definition.
//************************************************************************************************


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */
 
;(function() {
  var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
  
  /**
   * @class GDInterAppCommunication
   *
   * @classdesc The GDInterAppCommunication is used to return information about a service provider
   * application.
   */
  var GDInterAppCommunication = function() {};

  // ***** BEGIN: MODULE METHOD DEFINITIONS - GDInterAppCommunication *****

  GDInterAppCommunication.prototype.getGDAppDetails = function(serviceId, version, onSuccess, onError) {
    if(serviceId === null || typeof serviceId === 'undefined') {
        console.log("Null serviceId passed to GDInterAppCommunication.getGDAppDetails.");
        return;
    }
  
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDInterAppCommunication.getGDAppDetails: onSuccess parameter is not a function.");
        return;
    }
  
    var parms = [serviceId, version];
    cordovaRef.exec(onSuccess, onError, "GDInterAppCommunication", "getGDAppDetails", parms);
  };
  
  // ***** END: MODULE METHOD DEFINITIONS - GDInterAppCommunication *****
  
  // Install the plugin.
  cordovaRef.addConstructor(function() {
    if(!window.plugins) window.plugins = {};
    if(!window.plugins.GDInterAppCommunication) window.plugins.GDInterAppCommunication = new GDInterAppCommunication();
  });
}());	// End the Module Definition.
//************************************************************************************************

/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
		
	/**
	 * @class GDApplication
	 * 
	 * @classdesc The GD Application object provides access to information that is globally available to
	 * any Good Dynamics Application.
	 */
	var GDApplication = function() {};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDApplication *****
	
	/**
	 * @function GDApplication#getApplicationConfig
	 * 
	 * @description This function returns a collection of configuration settings. The settings will have
	 * been entered in the Good Control (GC) console, and retrieved by the Good Dynamics run-time.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @return {Object} A JSON string representing a configuration dictionary of name/value pairs.  Use
	 * the JSON.parse function to transform the data into a JavaScript object.
	 * <table border="1" style="border-spacing:0px;">
	 * <tr><th>Key Constant</th><th>Setting</th></tr>
	 * <tr>
	 *     <td>appHost</td>
	 *     <td>Application server address.  An application server address can be entered in the GC console, in
	 *     the application management user interface.</td>
	 * </tr>
	 * <tr>
	 *     <td>appPort</td>
	 *     <td>Application server port number.  An application port number can also be entered in the GC console,
	 *     in the application management user interface.</td>
	 * </tr>
	 * <tr>
	 *     <td>appConfig</td>
	 *     <td>Application-specific configuration data.  As well as the application server details, above, a free
	 *     text can also be entered in the GC console. Whatever was entered is passed through and made available
	 *     to the application client here.</td>
	 * </tr>
	 * <tr>
	 *     <td>copyPasteOn</td>
	 *     <td>Data Leakage security policy indicator.  false means that enterprise security policies require that the
	 *     end user must be prevented from taking any action that is classified as data loss or data leakage in the
	 *     Good Dynamics Security Compliance Requirements document.  true means that the above policy is not in effect,
	 *     so the user is permitted to take those actions.</td>
	 * </tr>
	 * <tr>
	 *     <td>detailedLogsOn</td>
	 *     <td>Logging level.  0 means that the logging level is low, and only minimal logs should be written.  1
	 *     means that the logging level is high, and detailed logs should be written. Detailed logs facilitate
	 *     debugging of run-time issues.  The Good Dynamics run-time will automatically adjust its logging according
	 *     to the configured setting. The setting is present in the API so that the application can adjust its logging
	 *     consistently with the run-time.</td>
	 * </tr>
	 * <tr>
	 *     <td>userId</td>
	 *     <td>Enterprise e-mail address.  The end user will have entered their e-mail address in the enterprise
	 *     activation user interface when the application was run for the first time, during authorization processing.
	 *     This will be the same as the e-mail address to which the access key was sent when the user was provisioned
	 *     in the GC console.</td>
	 * </tr>
	 * </table>
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function success(result) {
     * try {
     *      JSON.parse(result);
     *      console.log("Successfully parsed the configuration JSON format: " + result);
     *  } catch(e) {
     *       console.log("Unable to parse configuration JSON format: " + result);
     * }
     * };
     * 
     * function fail(result) {
     *   console.log("An error occurred while retrieving the application configuration: " + result);
     * };
     * 
     * function getApplicationConfiguration(){
     *   window.plugins.GDApplication.getApplicationConfig(success,fail);
     * };
	 * </code></pre>
	 * 
	 * 
	 * 
	 */
	GDApplication.prototype.getApplicationConfig = function(onSuccess, onError) {
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDApplication.getApplicationConfig: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDApplication", "getApplicationConfig", ["none"]);
	};
	
	/**
	 * @function GDApplication#getVersion
	 * 
	 * @description This function returns a string containing the library version in major.minor.build format.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @return {string}
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * 
	 * function success(result) {
     *   console.log("Retrieved the version data: " + result);
	 * };
	 * 
	 * function fail(result) {
     *   console.log("An error occurred while retrieving the application version: " + result);
	 * };
	 * 
	 * 
	 * function getApplicationVersion(){
     * window.plugins.GDApplication.getVersion(success,fail);
	 * };
	 * </code></pre>
	 * 
	 * 
	 */
	GDApplication.prototype.getVersion = function(onSuccess, onError) {
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDApplication.getVersion: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDApplication", "getVersion", ["none"]);
	};
	
	/**
	 * @function GDApplication#showPreferenceUI
	 * 
	 * @description Call this function to show the Good Dynamics (GD) preferences user interface (UI). This is
	 * the UI in which the end user sets any options that are applied by the library directly, without reference
	 * to the application. This includes, for example, changing their security password.  This function enables
	 * the GD preferences UI to be included in the application's own user interface.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 */	
	GDApplication.prototype.showPreferenceUI = function(onSuccess, onError) {
		cordovaRef.exec(onSuccess, onError, "GDApplication", "showPreferenceUI", ["none"]);
	};
	
	
	// ***** END: MODULE METHOD DEFINITIONS - GDApplication *****

	// Install the plugin.
	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDApplication) window.plugins.GDApplication = new GDApplication();
	});
}());	// End the Module Definition.
//************************************************************************************************


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
		
	/**
	 * @class GDDocuments
	 *
	 * @deprecated Since version 2.1.78. Will be deleted in future releases. Use GDAppKinetics plugin instead.
	 *
	 * @classdesc The Good Secure Documents API is a means of exchanging data between two applications
	 * running on the same device.  One of the applications must be a Good Dynamics (GD)
	 * application, the other must be the Good for Enterprise (GFE) e-mail and Personal
	 * Information Management (PIM) application.  The security of data is not compromised
	 * during exchange.  The data remains in the Good secure storage throughout.<br/>
	 *<br/>
	 * The Secure Documents API can be used to exchange any type of data between applications.
	 * The API can also be used to delegate user authentication from GD to GFE.  To utilize
	 * this API for application data exchange or for authentication delegation, the application
	 * must register a specific URL type for use with the iOS OpenURL.  Registration is
	 * configured in the project's build resources.
	 */
	var GDDocuments = function() {};

	// ***** BEGIN: MODULE METHOD DEFINITIONS - GDDocuments *****
	
	/**
	 * @function GDDocuments#canSendFileToGFE
	 * 
	 * @description Call this function to check if it is currently possible to send files to the Good For
	 * Enterprise e-mail and PIM application.  Sending will be possible if:
	 * <ul>
	 *   <li>The Good For Enterprise mobile application is installed and activated, and</li>
	 *   <li>The installed version supports inbound Secure Documents API data exchange.</li>
	 * </ul>
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @return {boolean} "true" or "false"
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function myCanSendFileToGFE(){
     *  function success(result){
     *      if(result === "true" || result === "false")
     *          console.log("GDDocuments.canSendFileToGFE succeeded with result: " + result);
     *  };
     *  
     *  function fail(result){
     *      console.log("GDDocuments.canSendFileToGFE error occurred: " + result);
     *  };
     *  window.plugins.GDDocuments.canSendFileToGFE(success,fail);
     * };
     *  </code></pre>
	 */
	GDDocuments.prototype.canSendFileToGFE = function(onSuccess, onError) {
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDDocuments.canSendFileToGFE: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDDocuments", "canSendFileToGFE", ["none"]);
	};
	
	/**
	 * @function GDDocuments#canSendFileToApplication
	 * 
	 * @description Call this function to check if it is currently possible to send files to a specified
	 * other application.  Sending will be possible if:
	 * <ul>
	 *   <li>The specified application is installed and activated, and</li>
	 *   <li>The installed version supports inbound Secure Documents API data exchange.</li>
	 * </ul>
	 * @param {string} applicationID The iOS Application ID of the application to check. Note that this
	 * may be different to the Good Dynamics App ID.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @return {boolean} "true" or "false"
	 * 
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function myCanSendFileToApplication(){
     *  function success(result){
     *      if(result === "true" || result === "false")
     *           console.log("GDDocuments.canSendFileToApplication succeeded with result: " + result);
     *  };
     *  
     *  function fail(result){
     *      console.log("GDDocuments.canSendFileToApplication error occurred: " + result);
     *  };
     *  window.plugins.GDDocuments.canSendFileToApplication("com.good.gmmiphone",success,fail);
     *  };
     *  </code></pre>
	 */
	GDDocuments.prototype.canSendFileToApplication = function(applicationID, onSuccess, onError) {
		if(applicationID === null || applicationID.trim() === '') {
			console.log("ERROR in GDDocuments.canSendFileToApplication: applicationID is empty.");
			return;
		}
		
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDDocuments.canSendFileToApplication: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDDocuments", "canSendFileToApplication", [applicationID]);
	};
	
	/**
	 * @function GDDocuments#sendFileToGFE
	 * 
	 * @description Call this function to send a file to the Good For Enterprise (GFE) e-mail and PIM
	 * application using the Secure Documents API. The file must be in the GD secure store.  
	 * 
	 * @param {string} filePath The path, within the secure store, of the file to be sent. 
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function mySendFileToGFE(){
     *  function success(){
     *       console.log("Call succeeded");
     *  };
     *  
     *  function fail(){
     *      console.log("An error occurred ");
     *  };
     *  
     *  window.plugins.GDDocuments.sendFileToGFE("/SampleFile.txt",success,fail);
     *  };	
     *  </code></pre>
     *  
	 */
	GDDocuments.prototype.sendFileToGFE = function(filePath, onSuccess, onError) {
		if(filePath === null || filePath.trim() === '') {
			console.log("ERROR in GDDocuments.sendFileToGFE: filePath is empty.");
			return;
		}
		
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDDocuments.sendFileToGFE: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDDocuments", "sendFileToGFE", [filePath]);
	};
	
	/**
	 * @function GDDocuments#sendFileToApplication
	 * 
	 * @description Call this function to send a file to a specified application, using the Secure Documents
	 * API. The file must be in the GD secure store.
	 * 
	 * @param {string} filePath The path, within the secure store, of the file to be sent. 
	 * 
	 * @param {string} applicationID The iOS Application ID of the application to check. Note that this
	 * may be different to the Good Dynamics App ID.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 * function mySendFileToApplication(){
     *  function success(){
     *       console.log("Call succeeded");
     *  };
     *  
     *  function fail(){
     *      console.log("An error occurred ");
     *  };
     *  
     *  window.plugins.GDDocuments.sendFileToApplication("/SampleFile.txt", "com.good.gmmiphone", success, fail);
     * };
     *  </code></pre>
	 */
	GDDocuments.prototype.sendFileToApplication = function(filePath, applicationID, onSuccess, onError) {
		if(filePath === null || filePath.trim() === '') {
			console.log("ERROR in GDDocuments.sendFileToApplication: filePath is empty.");
			return;
		}
		
		if(applicationID === null || applicationID.trim() === '') {
			console.log("ERROR in GDDocuments.sendFileToApplication: applicationID is empty.");
			return;
		}
		
		if(typeof onSuccess !== 'function') {
			console.log("ERROR in GDDocuments.sendFileToApplication: onSuccess parameter is not a function.");
			return;
		}
		
		cordovaRef.exec(onSuccess, onError, "GDDocuments", "sendFileToApplication", [filePath, applicationID]);
	};
	
	// ***** END: MODULE METHOD DEFINITIONS - GDDocuments *****

	// Install the plugin.
	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDDocuments) window.plugins.GDDocuments = new GDDocuments();
	});
}());	// End the Module Definition.
//************************************************************************************************


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
  var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
  
  /**
   * @class GDTokenHelper
   *
   * @classdesc The GDTokenHelper is used to request token from server side and process 
   * callback on response
   */
  var GDTokenHelper = function() {};

  // ***** BEGIN: MODULE METHOD DEFINITIONS - GDTokenHelper *****

	/**
	 * @function GDTokenHelper#getGDAuthToken
	 * 
	 * @description Call this function to check if it is currently possible to open an app using an url scheme
	 * 
	 * @param {string} challenge string for the authorization
     *
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDTokenHelper.getGDAuthToken("test",
	 *         function(result) {
	 *             notStrictEqual(typeof result, "undefined", "Retrieved Application details " + result);
	 *         },
	 *         function(result) {
	 *             ok(true, "Api not supported on emulated devices: " + result);
	 *         }
	 *     );
     *  </code></pre>
	 */
  GDTokenHelper.prototype.getGDAuthToken = function(challenge, onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDTokenHelper.getGDAuthToken: onSuccess parameter is not a function.");
        return;
    }
  
    var parms = [challenge];
    cordovaRef.exec(onSuccess, onError, "GDTokenHelper", "getGDAuthToken", parms);
  };
  
  // ***** END: MODULE METHOD DEFINITIONS - GDTokenHelper *****
  
  // Install the plugin.
  cordovaRef.addConstructor(function() {
    if(!window.plugins) window.plugins = {};
    if(!window.plugins.GDTokenHelper) window.plugins.GDTokenHelper = new GDTokenHelper();
  });
}());	// End the Module Definition.
//************************************************************************************************

/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

;(function() {
  var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;
  
  /**
   * @class GDAppKinetics
   *
   * @classdesc GDAppKinetics provides the functionality of AppKinetics the abilit to securely communicate between applications
   */
  var GDAppKineticsPlugin = function() {};

  // ***** BEGIN: MODULE METHOD DEFINITIONS - GDAppKinetics *****

	/**
	 * @function GDAppKinetics#canLaunchAppUsingUrlScheme
	 * 
	 * @description Call this function to check if it is currently possible to open an app using an url scheme
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.canLaunchAppUsingUrlScheme("http://address/App.plist",
	 *             function(result) {
	 *                 ok(true, "Should be able to launch this app " + result);
	 *                 start();
	 *             },
	 *             function(result) {
	 *                 ok(false, "Should be able to launch this app " + result);
	 *                 start();
	 *             }
	 *     );
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.canLaunchAppUsingUrlScheme = function(urlToTest, onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.canLaunchAppUsingUrlScheme: onSuccess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.canLaunchAppUsingUrlScheme: onError parameter is not a function.");
        return;
    }
  
    var parms = [urlToTest];
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "canLaunchAppUsingUrlScheme", parms);
  };

	/**
	 * @function GDAppKinetics#launchAppUsingUrlScheme
	 * 
	 * @description Call this function to open an app using an url scheme
	 * 
	 * @param {string} urlToLaunch url which is registered to the app which should be launched.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.launchAppUsingUrlScheme("com.good.gd.example.pg.appkinetics.filebouncer",
	 *             function(result) {
	 *                 ok(true, "Should be able to launch this app " + result);
	 *                 start();
	 *             },
	 *             function(result) {
	 *                 ok(false, "Should be able to launch this app " + result);
	 *                 start();
	 *             }
	 *     );
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.launchAppUsingUrlScheme = function(urlToLaunch, onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.launchAppUsingUrlScheme: onSuccess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.launchAppUsingUrlScheme: onError parameter is not a function.");
        return;
    }
  
    var parms = [urlToLaunch];
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "launchAppUsingUrlScheme", parms);
  };

	/**
	 * @function GDAppKinetics#bringAppToFront
	 * 
	 * @description Call this function to an app to the front of the device
	 * 
	 * @param {string} applicationId id of the app which should be brought to the front.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.launchAppUsingUrlScheme("com.good.gd.example.pg.appkinetics.filebouncer",
	 *             function(result) {
	 *                 ok(true, "Should be able to launch this app " + result);
	 *                 start();
	 *             },
	 *             function(result) {
	 *                 ok(false, "Should be able to launch this app " + result);
	 *                 start();
	 *             }
	 *     );
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.bringAppToFront = function(applicationId, onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.bringAppToFront: onSuccess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.bringAppToFront: onError parameter is not a function.");
        return;
    }
  
    var parms = [applicationId];
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "bringAppToFront", parms);
  };
  
	/**
	 * @function GDAppKinetics#copyFilesToSecureFileSystem
	 * 
	 * @description Files which are transferred via AppKinetics calls must reside within the secure container.
     * While this is not an issue for applications using most apis to write or read via GDCordova, there is a
     * problem with moving files which are part of the iOS Bundle into the secure container.  This api solves
     * that problem and moves all files within the app bundle into the secure container.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully and the 
     * parameter to the success function is a string which contains the number of files moved.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.copyFilesToSecureFileSystem(function(result) {
	 *                 ok(true, "Number of files copied = " + result);
	 *                 start();
	 *             }
	 *     );
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.copyFilesToSecureFileSystem = function(onSuccess) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.copyFilesToSecureFileSystem: onSuccess parameter is not a function.");
        return;
    }
    var parms = [];      // no parms
    
        // calls success function with number of files copied
    cordovaRef.exec(onSuccess, onSuccess, "GDAppKinetics", "copyAllBundledFilesToSecureFileSystem", parms);
  };

	/**
	 * @function GDAppKinetics#sendFileToApp
	 * 
	 * @description Call this function to an app to the front of the device
	 * 
	 * @param {string} filePath path to the file to send.
	 * 
	 * @param {string} applicationId id of the app to which the file is sent.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.sendFileToApp("Brief GD Inter-Container Communication.pdf", "com.good.gd.example.pg.appkinetics.filebouncer",
	 *             function(result) {
	 *                 ok(true, "Should be able to send file " + result);
	 *                 start();
	 *             },
	 *             function(result) {
	 *                 ok(false, "Should be able to send file " + result);
	 *                 start();
	 *             }
	 *     );
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.sendFileToApp = function(filePath, applicationId, onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.sendFileToApp: onSuccess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.sendFileToApp: onError parameter is not a function.");
        return;
    }
  
    var parms = [applicationId, filePath];      // order is applicationId then filePath
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "sendFileToApp", parms);
  };

	/**
	 * @function GDAppKinetics#retrieveFiles
	 * 
	 * @description Call this function to retreive any waiting files but only for the file transfer service.
	 * 
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully with a parameter
     * of an array of file paths of the received files.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions or when no files are waiting.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.retrieveFiles(
	 *         function(result) {
	 *             ok(true, "File Retreived");
	 *             start();
	 *         },
	 *         function(result) {
	 *             ok(false, "Should be able to get a file " + result);
	 *             start();
	 *     });
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.retrieveFiles = function(onSuccess, onError) {
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.retrieveFiles: onSucess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.retrieveFiles: onError parameter is not a function.");
        return;
    }
  
    var parms = [];      // no parms
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "retrieveFiles", parms);
  };

	/**
	 * @function GDAppKinetics#setReceiveAttachmentsFunction
	 * 
	 * @description Call this function to set a function to be called for all files received but only for the file transfer 
     * service.  Any currently waiting files will be delivered immediately.
	 * 
	 * @param {function} receiveFileFunction Callback function to invoke when the function returns successfully with a parameter
     * of an array of file paths of the received files.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.setReceiveAttachmentsFunction(
	 *         function(result) {
	 *             ok(true, "File Retreived");
	 *         });
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.setReceiveAttachmentsFunction = function(receiveFileFunction) {
    if(typeof receiveFileFunction !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.setReceiveAttachmentsFunction: receiveFile parameter is not a function.");
        return;
    }
  
    var parms = [];      // no parms
    cordovaRef.exec(receiveFileFunction, receiveFileFunction, "GDAppKinetics", "readyToReceiveFile", parms);
  };
    
	/**
	 * @function GDAppKinetics#callAppKineticsService
	 * 
	 * @description Call this function to call any AppKinetics service.
	 * 
	 * @param {string} applicationId - id of app to send to
	 * 
	 * @param {string} serviceId id of the service
	 * 
	 * @param {string} version of the service
     *
	 * @param {string} method of the service
     *
	 * @param {object} parameters for the service as a dictionary
     *
	 * @param {array} array of attachements which must reside within secure storage, see copyFilesToSecureFileSystem
     *
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions, check the error string returned for cause.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.callAppKineticsService( "com.good.gd.example.pg.appkinetics.filebouncer", 
     *                      "com.demo.generic.call2", "1.0.0.0", "testMethod-FileAttachment", 
	 *                     { "arrayEntry-3Elements" : [ "arrayEntry1", "arrayEntry2", "arrayEntry3"], 
     *                      "dictionary" : {"key1":"value1", "key2":"value2", "key3":"value3"}, "string" : "value" }, 
	 *                     [ "Brief GD Inter-Container Communication.pdf" ],     // File attachment
	 *         function(result) {
	 *             ok(true, "Email sent");
	 *             start();
	 *         },
	 *         function(result) {
	 *             ok(false, "Should be able to send email");
	 *             start();
	 *     });
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.callAppKineticsService = function(applicationId, serviceId, version, method, parameters, attachments, onSuccess, onError) {
  
    if(typeof onSuccess !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.callAppKineticsService: onSuccess parameter is not a function.");
        return;
    }
    if(typeof onError !== 'function') {
        console.log("ERROR in GDAppKineticsPlugin.prototype.callAppKineticsService: onError parameter is not a function.");
        return;
    }

    var parms = [ applicationId, serviceId, version, method, parameters, attachments ];

    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "callAppKineticsService", parms);
  };

	/**
	 * @function GDAppKinetics#sendEmailViaGFE
	 * 
	 * @description Call this function to send email via GFE (Good For Enterprise)
	 * 
	 * @param {array} array of recipients email addresses
	 * 
	 * @param {string} subject of the email
	 * 
	 * @param {string} text of the email
     *
	 * @param {array} array of attachements which must reside within secure storage, see copyFilesToSecureFileSystem
     *
	 * @param {function} onSuccess Callback function to invoke when the function returns successfully.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions, check the error string returned for cause.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.sendEmailViaGFE( ["sample@good.com"], "Test Email", "Hi, this is a test email", [],
	 *         function(result) {
	 *             ok(true, "Email sent");
	 *             start();
	 *         },
	 *         function(result) {
	 *             ok(true, "Should be able to send email - unless GFE is not installed - check to see if GFE is not installed");
	 *             start();
	 *         });
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.sendEmailViaGFE = function(arrayOfRecipients, subject, emailText, attachments, onSuccess, onError) {
  
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "callAppKineticsService", 
                                    [ "com.good.gfeiphone", "com.good.gfeservice.send-email", "1.0.0.0", "sendEmail", 
                                            { "to" : arrayOfRecipients, "subject" : subject, "body" : emailText }, 
                                    attachments]);    
  };

	/**
	 * @function GDAppKinetics#readyToProvideService
	 * 
	 * @description Call this function to provide an app kinetics service
	 * 
	 * @param {string} serviceName - name of the service.
	 * 
	 * @param {string} versionOfService - the version of the service
     *
	 * @param {function} onSuccess Callback function to invoke when the app receives an app kinetics request matching
     * serviceName and service function.  The parameter received in the function is a dictionary of the received parameters
     * and file attachments in any.
	 * 
	 * @param {function} onError Callback function to invoke for error conditions, check the error string returned for cause.
	 * 
	 * @example
	 * <pre class="prettyprint"><code>
	 *     window.plugins.GDAppKineticsPlugin.readyToProvideService( "com.demo.generic.call", "1.0.0.0", 
	 *         function(result) {
	 *             ok(true, "Object received from " + result.applicationName + " with service " + result.serviceName + " version - " + result.version + 
	 *                 " using method - " + result.method + " with parameters - " + JSON.stringify( result.parameters ) + " and attachments - " + JSON.stringify( result.attachments ));
	 *             start();
	 *         },
	 *         function(result) {
	 *             ok(false, "Should be able to receive email service");
	 *             start();
	 *     });
     *  </code></pre>
	 */
  GDAppKineticsPlugin.prototype.readyToProvideService = function(serviceName, versionOfService, onSuccess, onError) {
  
    cordovaRef.exec(onSuccess, onError, "GDAppKinetics", "readyToProvideService", [ serviceName, versionOfService ]);    
  };

  // ***** END: MODULE METHOD DEFINITIONS - GDAppKinetics *****
  
  // Install the plugin.
  cordovaRef.addConstructor(function() {
    if(!window.plugins) window.plugins = {};
    if(!window.plugins.GDAppKineticsPlugin) window.plugins.GDAppKineticsPlugin = new GDAppKineticsPlugin();
  });
}());	// End the Module Definition.
//************************************************************************************************

/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

if (!window.Cordova) window.Cordova = window.cordova;

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

	/**
     * @class GDSpecificPolicies
     *
     * @classdesc The GDSpecificPolicies is used to read application-specific policy from Good Control (GC) console and return it in JSON format.
     * To use this feature you should create policy file in XML format and upload it to the GC for specific application 
     * (for mere details see following guide: https://community.good.com/view-doc.jspa?fileName=_app_policies.html&docType=api)
     * The settings can be retrieved by calling updatePolicy method below.
     */

	window.GDSpecificPolicies = function() {};

	/**
     * @function GDSpecificPolicies#updatePolicy
     *
     * @description Call this function to retrieve application-specific policy from Good Control (GC) console in JSON format.
     * This method observes the application-policy state and once it is updated on GC we will receive the letest version directly in success callback.
     *
     * @param {function} successCallback Callback function to invoke when updatePolicy method returns successfully. 
     * The policy object is passed to this function as parameter.
     *
     * @param {function} errorCallback Callback function to invoke for error conditions.
     *
     * @example
     * window.plugins.GDSpecificPolicies.updatePolicy(
     *     function(policy) {
	 *         alert("Retrieved application-specific policy is: " + policy);
	 *     },
     *     function(error) {
	 *         alert("Error occure: " + error);
	 *     }
     * );
     */

	GDSpecificPolicies.prototype.updatePolicy = function(successCallback, errorCallback) {
		if (arguments.length == 0) {
			throw ({
				message: "TypeError: Failed to execute 'updatePolicy' on 'GDSpecificPolicies': 2 argument required, but only " + arguments.length + " present."
			});
		}

		var parms = [];
		
		var success = function(result) {		
			var obj = JSON.parse(result);
			successCallback(obj);
		};

		cordovaRef.exec(success, errorCallback, "GDSpecificPolicies", "updatePolicy", parms);
	};

	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDSpecificPolicies) window.plugins.GDSpecificPolicies = new GDSpecificPolicies();
	});

}());

// End GDSpecificPolicies.js
//*****************************************************************  //leave empty line after


/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

if (!window.Cordova) window.Cordova = window.cordova;

;(function() {
	var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

	/**
     * @class GDServerSideServices
     *
     * @classdesc The GDServerSideServices provides ability to use GD Server Based Serveices. 
     * It returns all the needed information about service in JSON format. 
     * To use this feature you should bind the service you want to the sample application in Good Control (GC) console.
     * Also you should bind the server where the service itself is hosted to the sample application in GC console.
     * For example, there is 'Google Timezone service' available on GC to be used in your application. 
     * This service is hosted on following server: maps.googleapis.com on port 443.
     * You should configure your application to be subscribed on above service and to use above server. See GC guide on how to do this.
     * Then when you call callGDServerSideService method with appropriate parameters you will receive all the information about this service.
     */

	window.GDServerSideServices = function() {};

	/**
     * @function GDServerSideServices#callGDServerSideService
     *
     * @description Call this function to retrieve the information about server based service from Good Control (GC) console in JSON format.
     * This method returns following information:
     * serviceProviders - array of applications that provide appropriate service
     * Each serviceProvider has information such as:
     * identifier - identifier of the serviceProvider
     * version - version of serviceProvider
     * name - name of serviceProvider
     * address - address of serviceProvider
     * icon - icon associated with serviceProvider
     * serverCluster - array of servers that are bind to the serviceProvider (application)
     * services - array of services that are bind to the serviceProvider (appliaction)
     * Each serverCluster has information about:
     * server - host name of the server
     * port - port server is running on
     * priority - the priority of the server
     * Each service has: 
     * identifier - identifier of the service
     * version - version of the service
     * type - service type
     *
     * @param {string} serviceName Name of the service, for example, "google.timezone.service"
     *
     * @param {string} serviceVersion Service version, for example, "1.0.0.0"
     *
     * @param {function} successCallback Callback function to invoke when callGDServerSideService method returns successfully. 
     * The object with information about service is passed to this function as parameter.
     *
     * @param {function} errorCallback Callback function to invoke for error conditions.
     *
     * @example
     * window.plugins.GDServerSideServices.callGDServerSideService("google.timezone.service", "1.0.0.0",
     *     function(info) {
	 *         alert("Information about service: " + info);
	 *     },
     *     function(error) {
	 *         alert("Error occured: " + error);
	 *     }
     * );
     */

	GDServerSideServices.prototype.callGDServerSideService = function(serviceName, serviceVersion, successCallback, errorCallback) {
		if (arguments.length == 0 || arguments.length == 1 || arguments.length == 2 || arguments.length == 3) {
			throw ({
				message: "TypeError: Failed to execute 'callGDServerSideService' on 'GDServerSideServices': \
				3 argument required, but only " + arguments.length + " present."
			});
		}

		var parms = [
			serviceName,
			serviceVersion
		];

		var success = function(result) {			
			var obj = JSON.parse(result);
			successCallback(obj);
		};

		cordovaRef.exec(success, errorCallback, "GDServerSideServices", "callGDServerSideService", parms);
	};

	cordovaRef.addConstructor(function() {
		if(!window.plugins) window.plugins = {};
		if(!window.plugins.GDServerSideServices) window.plugins.GDServerSideServices = new GDServerSideServices();
	});

}());

// End GDServerSideServices.js
//*****************************************************************  //leave empty line after

