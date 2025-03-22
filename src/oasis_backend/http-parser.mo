import HttpParser "mo:http-parser.mo";
import Text "mo:base/Text";
import Option "mo:base/Option";
actor {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };
  public query func http_request(rawReq : HttpParser.HttpRequest) : async HttpParser.HttpResponse {

    let req = HttpParser.parse(rawReq);
    // debugRequestParser(req);

    let { url } = req;
    let { path } = url;

    switch (req.method, path.original) {
      case ("GET", "/") {
        let optName = url.queryObj.get("name");
        let name = Option.get(optName, "");
        {
          status_code = 200;
          headers = [];
          body = Text.encodeUtf8(htmlPage(name));
        };
      };
      case (_) {
        {
          status_code = 404;
          headers = [];
          body = Text.encodeUtf8("Page Not Found");
        };
      };
    };
  };

  func htmlPage(name : Text) : Text {
    "<html><head><title> http_request </title></head><body><h1> Hello, " # name # "! </h1></body></html>";
  };

};
