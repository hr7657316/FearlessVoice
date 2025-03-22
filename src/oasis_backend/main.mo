import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";

//import the custom types we have in Types.mo
import Types "types";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

//Actor
actor {
  let APP_NAME = "Fearless Voice";
  type UserData = {
    id : Nat;
    userData : Text;
    reportedAbuseCases : Text;
    token : Text;
    phone : Text;
  };

  let usersMap = HashMap.HashMap<Text, UserData>(5, Text.equal, Text.hash);
  stable var admin = "+919176097404";
  // Default admin password: 12345678 - simple password for testing
  stable var adminPassword = "12345678";

  public func addNewUser(id : Nat, userData : Text, reportedAbuseCases : Text, token : Text, phone : Text) : async Text {
    let user = {
      id = id;
      userData = userData;
      reportedAbuseCases = reportedAbuseCases;
      token = token;
      phone = phone;
    };
    //check if phone already exists in the map
    var check = false;
    for (value in usersMap.vals()) {
      if (value.phone == phone) {
        check := true;
      };
    };
    if (check) {
      return "{ \"error\": \"Phone number already exists\", \"status\": 400}";
    };
    usersMap.put(phone, user);
    return "{ \"message\": \"User added successfully\", \"status\": 200}";
  };

  public query func getUser(phone : Text) : async ?UserData {
    let user = usersMap.get(phone);
    return user;
  };

  public query func getAdmin() : async Text {
    return admin;
  };

  public func setAdmin(phone : Text) : async Text {
    admin := phone;
    return "{ \"message\": \"Admin set successfully\", \"status\": 200}";
  };

  public query func verifyAdminPassword(password : Text) : async Bool {
    return password == adminPassword;
  };

  public func updateAdminPassword(currentPassword : Text, newPassword : Text) : async Text {
    if (currentPassword != adminPassword) {
      return "{ \"error\": \"Current password is incorrect\", \"status\": 401}";
    };
    
    if (Text.size(newPassword) < 6) {
      return "{ \"error\": \"New password must be at least 6 characters\", \"status\": 400}";
    };
    
    adminPassword := newPassword;
    return "{ \"message\": \"Admin password updated successfully\", \"status\": 200}";
  };

  public query func fetchAllUsers() : async [UserData] {
    //create a new temp array to store the users
    var users = [] : [UserData];
    //loop through the usersMap and add the users to the temp array
    for (value in usersMap.vals()) {
      users := Array.append(users, [value]);
    };
    return users;
  };

  public func updateUser(id : Nat, userData : Text, reportedAbuseCases : Text, token : Text, phone : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    let user = {
      id = id;
      userData = userData;
      reportedAbuseCases = reportedAbuseCases;
      token = token;
      phone = phone;
    };
    usersMap.put(phone, user);
    return "{ \"message\": \"User updated successfully\", \"status\": 200}";
  };

  //remove user with phone
  public func removeUser(phone : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    Debug.print(debug_show (usersMap.remove(phone)));
    return "{ \"message\": \"User removed successfully\", \"status\": 200}";
  };

  //make login request to update token
  public func login_init(phone : Text, token : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    //get the user
    for (value in usersMap.vals()) {
      if (value.phone == phone) {
        //update entire user
        let user = {
          id = value.id;
          userData = value.userData;
          reportedAbuseCases = value.reportedAbuseCases;
          token = token;
          phone = value.phone;
        };
        usersMap.put(phone, user);
      };
    };
    var otpstatus = await sendOTP(phone, token);
    return otpstatus;
  };

  //function to verify token from user like otp
  public func verifyToken(phone : Text, token : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    if (token == "0000") {
      return "{ \"error\": \"Invalid OTP! Please make a login request to receive a valid OTP to your mobile number...\", \"status\": 400}";
    };
    //get the user
    for (value in usersMap.vals()) {
      if (value.phone == phone) {
        if (value.token == token) {
          //update entire user with token = 0000
          let user = {
            id = value.id;
            userData = value.userData;
            reportedAbuseCases = value.reportedAbuseCases;
            token = "0000";
            phone = value.phone;
          };
          usersMap.put(phone, user);
          return "{ \"message\": \"OTP verified successfully\", \"status\": 200}";
        };
      };
    };
    return "{ \"error\": \"OTP does not match\", \"status\": 400}";
  };

  public func updateUserData(phone : Text, userData : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    //get the user
    for (value in usersMap.vals()) {
      if (value.phone == phone) {
        //update entire user
        let user = {
          id = value.id;
          userData = userData;
          reportedAbuseCases = value.reportedAbuseCases;
          token = value.token;
          phone = value.phone;
        };
        usersMap.put(phone, user);
      };
    };
    return "{ \"message\": \"User data updated successfully\", \"status\": 200}";
  };

  public func updateReportedAbuseCases(phone : Text, reportedAbuseCases : Text) : async Text {
    if (usersMap.get(phone) == null) {
      return "{ \"error\": \"User does not exist\", \"status\": 400}";
    };
    //get the user
    for (value in usersMap.vals()) {
      if (value.phone == phone) {
        //update entire user
        let user = {
          id = value.id;
          userData = value.userData;
          reportedAbuseCases = reportedAbuseCases;
          token = value.token;
          phone = value.phone;
        };
        usersMap.put(phone, user);
      };
    };
    return "{ \"message\": \"Reported abuse cases updated successfully\", \"status\": 200}";
  };
  public func sendSMS(phone : Text, message : Text) : async Text {
    // Print the message to console for debugging
    Debug.print("SIMULATED SMS: Sending message to " # phone);
    Debug.print("MESSAGE CONTENT: " # message);
    
    // Instead of making the HTTP call, return a successful response
    return "{ \"message\": \"SMS sent successfully (SIMULATED)\", \"status\": 200}";

    /* Commented out the original code that calls external service
    let ic : Types.IC = actor ("aaaaa-aa");
    let host = "oasis-backend.webxspark.repl.co";
    let url = "https://oasis-backend.webxspark.repl.co/send-otp/" # phone # "/" # message;
    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "exchange_rate_canister" },
    ];
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null; //optional for request
      headers = request_headers;
      body = null; //optional for request
      method = #get;
      transform = null; //optional for request
    };
    Cycles.add(220_131_200_000);
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    decoded_text;
    */
  };
  public func sendOTP(phone : Text, token : Text) : async Text {
    var message = "Hello,%20we%20got%20a%20request%20for%20logging%20in%20to%20your%20account%20at%20" # APP_NAME # ".%20Your%20OTP%20is%20" # token # ".%20Please%20do%20not%20share%20this%20with%20anyone.";
    
    // Print the OTP explicitly for testing
    Debug.print("🔑 TEST OTP FOR " # phone # ": " # token);
    
    return await sendSMS(phone, message);
  };

  public func __externalURLGetMethodSample() : async Text {

    //1. DECLARE IC MANAGEMENT CANISTER
    //We need this so we can use it to make the HTTP request
    let ic : Types.IC = actor ("aaaaa-aa");

    //2. SETUP ARGUMENTS FOR HTTP GET request

    // 2.1 Setup the URL and its query parameters
    let host = "apis.webxspark.com";
    let url = "https://apis.webxspark.com/v2.0/ip/geolocate?trail";

    // 2.2 prepare headers for the system http_request call
    let request_headers = [
      { name = "Host"; value = host # ":443" },
      { name = "User-Agent"; value = "exchange_rate_canister" },
    ];

    // 2.3 The HTTP request
    let http_request : Types.HttpRequestArgs = {
      url = url;
      max_response_bytes = null; //optional for request
      headers = request_headers;
      body = null; //optional for request
      method = #get;
      transform = null; //optional for request
    };

    //3. ADD CYCLES TO PAY FOR HTTP REQUEST
    //IC management canister will make the HTTP request so it needs cycles
    //See: https://internetcomputer.org/docs/current/motoko/main/cycles

    //See: https://internetcomputer.org/docs/current/references/ic-interface-spec/#ic-http_request
    Cycles.add(220_131_200_000); //minimum cycles needed to pass the CI tests. Cycles needed will vary on many things size of http response, subnetc, etc...).

    //4. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
    //Since the cycles were added above, we can just call the IC management canister with HTTPS outcalls below
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    //5. DECODE THE RESPONSE

    //As per the type declarations in `src/Types.mo`, the BODY in the HTTP response
    //comes back as [Nat8s] (e.g. [2, 5, 12, 11, 23]). Type signature:

    //public type HttpResponsePayload = {
    //     status : Nat;
    //     headers : [HttpHeader];
    //     body : [Nat8];
    // };

    //We need to decode that [Nat8] array that is the body into readable text.
    //To do this, we:
    //  1. Convert the [Nat8] into a Blob
    //  2. Use Blob.decodeUtf8() method to convert the Blob to a ?Text optional
    //  3. We use a switch to explicitly call out both cases of decoding the Blob into ?Text
    let response_body : Blob = Blob.fromArray(http_response.body);
    let decoded_text : Text = switch (Text.decodeUtf8(response_body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    //6. RETURN RESPONSE OF THE BODY
    decoded_text;
  };

};
