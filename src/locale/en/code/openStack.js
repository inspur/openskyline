/**
 * ibase错误消息定义.
 */
export default {
  "0":"The server is abnormal.Please contact the administrator",
  "400": "Wrong request parameters",
  "401": "Current user needs user authentication",
  "403": "The server has understood the request but refused to execute",
  "404": "The request failed and the requested resource was not found on the server",
  "405": "The request method specified in the request line cannot be used to request the corresponding resource",
  "406": "The requested resource content cannot satisfy the condition in the request header",
  "408": "Request timed out",
  "409": "There is a conflict between the current state of the requested resource",
  "410": "Request resource unavailable",
  "411": "The server refused to accept the request",
  "412": "When the prerequisite condition is given in the header field of the request,it fails to meet",
  "413": "The server refuses to process the current request, the size of the entity data submitted by the request exceeds the range that the server can handle",
  "414": "The length of the request URI exceeds the length that the server can understand",
  "415": "Accepted entities are not supported by the server",
  "500": "The server encountered an unexpected situation",
  "501": "The server doed not supported a function required by the current request",
  "503": "Server is unavailable",
  "504": "Gateway timeout,please contact administrator"
};
