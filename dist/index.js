"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_config = require("dotenv/config");
var import_register = require("source-map-support/register");
var import_http = __toESM(require("http"));
var import_socket = require("socket.io");

// src/app.ts
var import_express = __toESM(require("express"));

// src/config/queue.ts
var import_bull = __toESM(require("bull"));

// src/config/email.ts
var import_nodemailer = __toESM(require("nodemailer"));
var MAIL_PORT = Number(process.env.MAIL_PORT || 0);
var transporter = import_nodemailer.default.createTransport({
  host: process.env.MAIL_HOST,
  port: MAIL_PORT,
  secure: process.env.MAIL_SECURE === "true" || MAIL_PORT === 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});
var sendMail = transporter.sendMail.bind(transporter);

// src/utils/logger.ts
var import_debug = require("debug");
var i = (0, import_debug.debug)("info");
var e = (0, import_debug.debug)("error");
var w = (0, import_debug.debug)("warn");
var info = (obj, message, formatter) => {
  if (message)
    if (formatter)
      i(formatter, obj, message);
    else
      i("%j", obj, message);
  else if (formatter)
    i(formatter, obj);
  else
    i("%j", obj);
};
var err = (obj, message, formatter) => {
  if (message)
    if (formatter)
      e(formatter, obj, message);
    else
      e("%o", obj, message);
  else if (formatter)
    e(formatter, obj);
  else
    e("%o", obj);
};
var warn = (obj, message, formatter) => {
  if (message)
    if (formatter)
      w(formatter, obj, message);
    else
      w("%j", obj, message);
  else if (formatter)
    w(formatter, obj);
  else
    w("%j", obj);
};
var logger_default = { info, err, warn };

// src/config/queue.ts
var mainQueue = new import_bull.default("main", process.env.REDIS_URL);
var emailQueue = new import_bull.default(
  "email",
  process.env.REDIS_URL
);
var paymentThreshold = new import_bull.default(
  "payment_threshold",
  process.env.REDIS_URL
);
mainQueue.process(async (job, done) => {
  console.log(job.id, job.data);
  done();
});
emailQueue.process(async (job, done) => {
  sendMail(job.data).then((_info) => {
    done();
  }).catch((error) => {
    logger_default.err(error.message);
    done();
  });
});

// src/handlers/auth/index.ts
var import_express_async_handler = __toESM(require("express-async-handler"));
var makeAuthRouter = ({
  router,
  service
}) => {
  router.get(
    "/",
    (0, import_express_async_handler.default)((_req, res) => {
      res.send("Birds home page");
    })
  );
  router.post(
    "/login",
    (0, import_express_async_handler.default)(async (req, res) => {
      const data = await service.auth.login(req.body);
      emailQueue.add({
        from: '"Hairsap \u{1F465}" <notify@hairsap.com>',
        to: "jideadedejifirst@gmail.com",
        subject: "Hello \u2714",
        text: "Hello world \u{1F434}",
        html: "<b>Hello world \u{1F434}</b>"
      });
      res.status(200).send({ data });
    })
  );
  return router;
};
var auth_default = makeAuthRouter;

// src/schemas/request/postLogin.ts
var import_zod = require("zod");
var PostLoginRequestSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(6).max(32)
}).strict();

// src/utils/Error.ts
var ErrorType = {
  VALIDATION_ERROR: "Validation Error",
  INTERNAL_ERROR: "Internal Error",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",
  UNAUTHORIZED: "Unauthorized"
};
var HsapError = class extends Error {
  constructor(message, status, validationError) {
    super(message);
    this.status = 500;
    this.message = message;
    this.status = status;
    this.validationError = validationError;
  }
};
var ValidationError = class extends HsapError {
  constructor(error) {
    super(
      typeof error === "string" ? error : ErrorType.VALIDATION_ERROR,
      400,
      typeof error !== "string" ? error : void 0
    );
    this.status = 400;
    this.message = typeof error === "string" ? error : ErrorType.VALIDATION_ERROR;
    this.validationError = typeof error !== "string" ? error : void 0;
  }
};
var InternalError = class extends HsapError {
  constructor(message = ErrorType.INTERNAL_ERROR) {
    super(message, 500);
    this.status = 500;
    this.message = message;
  }
};
var NotFoundError = class extends HsapError {
  constructor(message = ErrorType.NOT_FOUND) {
    super(message, 404);
    this.status = 404;
    this.message = message;
  }
};
var handleError = (_err, _req, res, _next) => {
  let err2 = _err;
  if (err2 instanceof InternalError || !(err2 instanceof HsapError)) {
    logger_default.err(err2.message);
  }
  if (!(err2 instanceof HsapError)) {
    err2 = new InternalError(err2.message);
  }
  res.status(err2.status).send(err2.message);
};

// src/utils/generateJwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var generateJwt = (data, expiresIn) => {
  const jwtSecret = process.env.JWT_SECRET || "";
  if (!jwtSecret || jwtSecret === "")
    return;
  return import_jsonwebtoken.default.sign(data, jwtSecret, expiresIn);
};

// src/services/Auth/index.ts
var login = ({ repo, body }) => {
  let req;
  try {
    req = PostLoginRequestSchema.parse(body);
  } catch (error) {
    throw new ValidationError(error.issues);
  }
  try {
    const user = repo.user.getUser(req.email);
    if (!user)
      throw new NotFoundError("user not found");
  } catch (error) {
    throw new InternalError();
  }
  return { token: generateJwt({ email: req.email }) };
};
var makeAuth = ({ repo }) => {
  return {
    login: (body) => login({ repo, body })
  };
};
var Auth_default = makeAuth;

// src/services/index.ts
var makeServices = ({ repo }) => {
  return {
    auth: Auth_default({ repo })
  };
};
var services_default = makeServices;

// src/repo/user.ts
var getUser = ({ db }) => {
  db;
  return {
    email: "jideadedejifirst@gmail.com"
  };
};
var makeUserRepo = ({ db }) => {
  return { getUser: (email) => getUser({ db }) };
};
var user_default = makeUserRepo;

// src/repo/index.ts
var makeRepo = ({ db }) => {
  return {
    user: user_default({ db })
  };
};
var repo_default = makeRepo;

// src/config/db.ts
var db_default = {};

// src/app.ts
var import_compression = __toESM(require("compression"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));

// yaml:/app/docs/swagger.yml
var swagger_default = { openapi: "3.0.0", components: { responses: { InternalError: { required: ["message"], properties: { message: { type: "string", default: "Internal Error" } } }, ValidationError: { required: ["message"], properties: { message: { type: "string", default: "Validation Error" }, validationError: { type: "array", minimum: 1, items: { type: "object", properties: { code: { type: "string", example: "too small" }, minimum: { type: "number", example: 2 }, type: { type: "string", example: "string" }, inclusive: { type: "boolean", example: true }, message: { type: "string", example: "Should be at least 2 characters" }, path: { type: "array", items: { type: "string", example: "example" } } } } } } }, ForbiddenError: { required: ["message"], properties: { message: { type: "string", default: "Forbidden" } } }, NotFoundError: { required: ["message"], properties: { message: { type: "string", default: "Not Found" } } }, UnauthorizedError: { required: ["message"], properties: { message: { type: "string", default: "Unauthorized" } } }, Success: { properties: { data: { type: { oneOf: [{ type: "array" }, { type: "object" }] }, default: "Ok" } } } }, schemas: { AuthLoginRequest: { type: "object", required: ["email", "password"], properties: { email: { type: "string", description: "unique user email", example: "john@hairsap.com" }, password: { type: "string", description: "card type, either virtual or physical", example: "john1234", minimum: 7, maximum: 32 } } }, AuthLoginResponse: { type: "object", required: ["token"], properties: { token: { type: "string", description: "a JWT token", example: "1592BB17-8B6E-4CA7-AAC2-8140E7BF19AC" } } } }, securitySchemes: { BearerAuth: { type: "http", scheme: "bearer" } } }, info: { title: "Hairsap-api", description: "Hairsap API", version: "v1.0.0" }, servers: [{ url: "http://localhost:4000", description: "development" }], paths: { "/auth/login": { post: { operationId: "postAuthLogin", description: "allows a user to login", tags: ["Auth"], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginRequest" } } } }, parameters: [], responses: { "201": { description: "Status 201 Response", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginResponse" } } } }, "400": { description: "Status 400 Response", content: { "application/json": { schema: { $ref: "#/components/responses/ValidationError" } } } }, "500": { description: "Status 500 Response", content: { "application/json": { schema: { $ref: "#/components/responses/InternalError" } } } } } } } } };

// src/app.ts
var createApp = () => {
  const repo = repo_default({ db: db_default });
  const service = services_default({ repo });
  const app2 = (0, import_express.default)();
  const router = (0, import_express.Router)();
  app2.use((0, import_compression.default)());
  app2.use((0, import_helmet.default)());
  app2.use(import_express.default.json());
  app2.use((0, import_cors.default)());
  app2.use("/reference", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(swagger_default));
  app2.get("/", (req, res) => {
    res.send("welcome to hairsap");
  });
  app2.use("/auth", auth_default({ router, service }));
  app2.use(handleError);
  return app2;
};
var app_default = createApp;

// src/index.ts
var app = app_default();
var server = import_http.default.createServer(app);
var io = new import_socket.Server(server);
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
var PORT = process.env.PORT || 4e3;
server.listen(PORT, () => {
  logger_default.info("listening on port " + PORT);
});
//# sourceMappingURL=index.js.map