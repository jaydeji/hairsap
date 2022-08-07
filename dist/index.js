"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  io: () => io
});
module.exports = __toCommonJS(src_exports);
var import_config = require("dotenv/config");
var import_register = require("source-map-support/register");
var import_http = __toESM(require("http"));
var import_socket = require("socket.io");

// src/app.ts
var import_express = __toESM(require("express"));

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
      const data = await service.auth.login(req.body, req.query.role);
      res.status(200).send({ data });
    })
  );
  router.post(
    "/signup",
    (0, import_express_async_handler.default)(async (req, res) => {
      const data = await service.auth.signup(req.body, req.query.role);
      res.status(200).send({ data });
    })
  );
  return router;
};
var auth_default = makeAuthRouter;

// src/config/constants.ts
var ROLES = {
  USER: "user",
  ADMIN: "admin",
  PRO: "pro"
};

// src/config/email/templates/signup.ts
var signUpEmailTemplate = (name) => {
  return {
    from: '"Hairsap" <notify@hairsap.com>',
    to: "admin@hairsap.com",
    subject: "New SignUp",
    text: `A new user with name ${name} has signed up`,
    html: `<p>A new user with name ${name} has signed up</p>`
  };
};

// src/config/queue.ts
var import_bull = __toESM(require("bull"));

// src/config/email/index.ts
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

// src/utils/hashPassword.ts
var import_crypto = require("crypto");
var hashPassword = (plainTextPassword) => {
  return (0, import_crypto.createHmac)(
    "sha256" /* SHA256 */,
    process.env.DATA_ENCRYPTION_KEY || ""
  ).update(plainTextPassword).digest("hex");
};

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
  if (process.env.NODE_ENV !== "production")
    return done();
  sendMail(job.data).then((_info) => {
    done();
  }).catch((error) => {
    logger_default.err(error.message);
    done();
  });
});

// src/schemas/request/postSignup.ts
var import_zod = require("zod");
var PostSignupRequestSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  name: import_zod.z.string(),
  password: import_zod.z.string().min(6).max(32),
  role: import_zod.z.nativeEnum(ROLES).refine((role) => role === ROLES.PRO || role === ROLES.USER, {
    message: "type must be user or admin"
  })
}).strict();
var PostSignupUserRequestSchema = PostSignupRequestSchema.extend({
  deviceInfo: import_zod.z.string().min(1)
});
var PostSignupProRequestSchema = PostSignupRequestSchema.extend({
  businessName: import_zod.z.string(),
  deviceInfo: import_zod.z.string().min(1)
});

// src/schemas/request/postLogin.ts
var import_zod2 = require("zod");
var PostLoginRequestSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6).max(32),
  role: import_zod2.z.nativeEnum(ROLES)
}).strict();
var PostLoginUserRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: import_zod2.z.string()
});
var PostLoginProRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: import_zod2.z.string()
});

// src/utils/Error.ts
var import_zod3 = require("zod");
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
      error instanceof import_zod3.ZodError ? error.issues : typeof error !== "string" ? error : void 0
    );
    this.status = 400;
    this.message = typeof error === "string" ? error : ErrorType.VALIDATION_ERROR;
    this.validationError = error instanceof import_zod3.ZodError ? error.issues : typeof error !== "string" ? error : void 0;
    this.name = this.constructor.name;
  }
};
var InternalError = class extends HsapError {
  constructor(message = ErrorType.INTERNAL_ERROR) {
    super(message, 500);
    this.status = 500;
    this.message = message;
    this.name = this.constructor.name;
  }
};
var ForbiddenError = class extends HsapError {
  constructor(message = ErrorType.FORBIDDEN) {
    super(message, 403);
    this.status = 403;
    this.message = message;
    this.name = this.constructor.name;
  }
};
var UnauthorizedError = class extends HsapError {
  constructor(message = ErrorType.UNAUTHORIZED) {
    super(message, 401);
    this.status = 401;
    this.message = message;
    this.name = this.constructor.name;
  }
};
var handleError = (_err, _req, res, _next) => {
  let err2 = _err;
  if ((err2 == null ? void 0 : err2.type) === "entity.parse.failed") {
    err2 = new HsapError("entity.parse.failed", 413);
  }
  if (err2 instanceof InternalError || !(err2 instanceof HsapError)) {
    logger_default.err(err2.message, err2.stack);
  }
  if (!(err2 instanceof HsapError)) {
    err2 = new InternalError();
  }
  res.status(err2.status).send({ message: err2.message, validationError: err2.validationError });
};

// src/utils/jwtLib.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var generateJwt = (data, admin, expiresIn) => {
  const secret = (admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET) || "";
  if (!secret || secret === "")
    return;
  return import_jsonwebtoken.default.sign(data, secret, expiresIn);
};
var decodeJwt = (token) => {
  return import_jsonwebtoken.default.decode(token);
};
var verifyJwt = (token, admin) => {
  const secret = (admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET) || "";
  return import_jsonwebtoken.default.verify(token, secret);
};

// src/services/Auth/index.ts
var login = async ({
  repo,
  body,
  role
}) => {
  if (!role)
    throw new ValidationError("Param role not passed");
  const req = PostLoginRequestSchema.parse({ ...body, role });
  const isAdmin = role === ROLES.ADMIN;
  let user;
  try {
    user = await repo.user.getUserByEmail(body.email);
  } catch (error) {
    throw new InternalError(error);
  }
  if (!user)
    throw new ForbiddenError("email or password incorrect");
  const hashedPassword = hashPassword(body.password);
  if (body.password !== hashedPassword) {
    throw new ForbiddenError("email or password incorrect");
  }
  if (!isAdmin && (user.deactivated || user.terminated)) {
    throw new ForbiddenError("account inactive, contact support");
  }
  if (role === ROLES.PRO && !user.verified) {
    throw new ForbiddenError("user not verified");
  }
  if (!isAdmin) {
    const device = user.devices.find(
      (device2) => device2.value === body.deviceInfo
    );
    if (!device)
      throw new ForbiddenError("device not recognised");
  }
  const token = generateJwt({ email: req.email, role }, isAdmin, {
    expiresIn: isAdmin ? String(60 * 60 * 24) : String(60 * 60 * 24 * 7)
  });
  return {
    user,
    token
  };
};
var signup = async ({
  repo,
  body,
  role
}) => {
  if (!role)
    throw new ValidationError("Param role not passed");
  if (role === ROLES.USER) {
    PostSignupUserRequestSchema.parse({ ...body, role });
  } else if (role === ROLES.PRO) {
    PostSignupProRequestSchema.parse({ ...body, role });
  } else {
    PostSignupRequestSchema.parse({ ...body, role });
  }
  const _user = await repo.user.getUserByEmailandRole(body.email, role);
  if (_user)
    throw new ValidationError("User with this email already exists");
  const hashedPassword = hashPassword(body.password);
  const { deviceInfo, ...newBody } = body;
  const user = await repo.user.createUser({
    ...newBody,
    role,
    password: hashedPassword,
    devices: {
      create: {
        value: body.deviceInfo
      }
    }
  });
  const token = generateJwt({ email: user.email, role }, false, {
    expiresIn: String(60 * 60 * 24 * 7)
  });
  emailQueue.add(signUpEmailTemplate(user.name));
  return { user, token };
};
var makeAuth = ({ repo }) => {
  return {
    login: (body, role) => login({ repo, body, role }),
    signup: (body, role) => signup({ repo, body, role })
  };
};
var Auth_default = makeAuth;

// src/schemas/request/patchUser.ts
var import_zod4 = require("zod");
var PatchUserRequestSchema = import_zod4.z.object({
  userId: import_zod4.z.number(),
  photoUrl: import_zod4.z.string().min(1)
});
var PatchUserUserRequestSchema = PatchUserRequestSchema.extend({});
var PatchUserProRequestSchema = PatchUserRequestSchema.extend({
  closingAt: import_zod4.z.date(),
  resumptionAt: import_zod4.z.date()
});

// src/services/User/index.ts
var updateUser = ({ repo }) => async (body) => {
  PatchUserRequestSchema.parse(body);
  const { userId, ...newBody } = body;
  await repo.user.updateUser(newBody, userId);
};
var makeUser = ({ repo }) => {
  return {
    updateUser: updateUser({ repo })
  };
};
var User_default = makeUser;

// src/services/index.ts
var makeServices = ({ repo }) => {
  return {
    auth: Auth_default({ repo }),
    user: User_default({ repo })
  };
};
var services_default = makeServices;

// src/repo/user.ts
var getUserById = ({ db }) => (userId) => {
  return db.user.findUnique({
    where: {
      userId
    },
    include: {
      devices: true
    }
  });
};
var getUserByEmail = ({ email, db }) => {
  return db.user.findUnique({
    where: {
      email
    },
    include: {
      devices: true
    }
  });
};
var getUserByEmailandRole = async ({
  email,
  role,
  db
}) => {
  const user = await db.user.findUnique({
    where: {
      email
    }
  });
  return (user == null ? void 0 : user.role) === role ? user : null;
};
var createUser = ({
  user,
  db
}) => db.user.create({ data: user });
var updateUser2 = ({ db }) => (user, userId) => {
  db.user.update({
    data: user,
    where: {
      userId
    }
  });
};
var makeUserRepo = ({ db }) => {
  return {
    getUserById: getUserById({ db }),
    getUserByEmail: (email) => getUserByEmail({ db, email }),
    getUserByEmailandRole: (email, role) => getUserByEmailandRole({ db, email, role }),
    createUser: (user) => createUser({ user, db }),
    updateUser: updateUser2({ db })
  };
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
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});
var db_default = prisma;

// src/app.ts
var import_compression = __toESM(require("compression"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));

// yaml:/app/docs/swagger.yml
var swagger_default = { openapi: "3.0.0", components: { responses: { InternalError: { required: ["message"], properties: { message: { type: "string", default: "Internal Error" } } }, ValidationError: { required: ["message"], properties: { message: { type: "string", default: "Validation Error" }, validationError: { type: "array", minimum: 1, items: { type: "object", properties: { code: { type: "string", example: "too small" }, minimum: { type: "number", example: 2 }, type: { type: "string", example: "string" }, inclusive: { type: "boolean", example: true }, message: { type: "string", example: "Should be at least 2 characters" }, path: { type: "array", items: { type: "string", example: "example" } } } } } } }, ForbiddenError: { required: ["message"], properties: { message: { type: "string", default: "Forbidden" } } }, NotFoundError: { required: ["message"], properties: { message: { type: "string", default: "Not Found" } } }, UnauthorizedError: { required: ["message"], properties: { message: { type: "string", default: "Unauthorized" } } }, Success: { properties: { data: { type: { oneOf: [{ type: "array" }, { type: "object" }] }, default: "Ok" } } } }, schemas: { AuthLoginRequest: { type: "object", required: ["email", "password"], properties: { email: { type: "string", description: "unique user email", example: "john@hairsap.com" }, password: { type: "string", description: "card type, either virtual or physical", example: "john1234", minimum: 7, maximum: 32 } } }, AuthLoginResponse: { type: "object", required: ["token"], properties: { token: { type: "string", description: "a JWT token", example: "1592BB17-8B6E-4CA7-AAC2-8140E7BF19AC" } } } }, securitySchemes: { BearerAuth: { type: "http", scheme: "bearer" } } }, info: { title: "Hairsap-api", description: "Hairsap API", version: "v1.0.0" }, servers: [{ url: "http://localhost:4000", description: "development" }], paths: { "/auth/login": { post: { operationId: "postAuthLogin", description: "allows a user to login", tags: ["Auth"], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginRequest" } } } }, parameters: [], responses: { "201": { description: "Status 201 Response", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginResponse" } } } }, "400": { description: "Status 400 Response", content: { "application/json": { schema: { $ref: "#/components/responses/ValidationError" } } } }, "500": { description: "Status 500 Response", content: { "application/json": { schema: { $ref: "#/components/responses/InternalError" } } } } } } } } };

// src/handlers/user/index.ts
var import_express_async_handler2 = __toESM(require("express-async-handler"));

// src/handlers/user/patchUser.ts
var patchUser = ({ service }) => async (req, res) => {
  await service.user.updateUser(req.body);
  res.sendStatus(201);
};

// src/handlers/user/index.ts
var makeUserRouter = ({
  router,
  service
}) => {
  router.patch("/", (0, import_express_async_handler2.default)(patchUser({ service })));
  return router;
};
var user_default2 = makeUserRouter;

// src/middleware/auth.ts
var auth = () => (req, res, next) => {
  let token = req.headers.authorization;
  if (!token)
    throw new UnauthorizedError();
  token = token.replace(/Bearer /g, "");
  const decodedToken = decodeJwt(token);
  try {
    verifyJwt(token, decodedToken == null ? void 0 : decodedToken.admin);
  } catch (error) {
    throw new ForbiddenError();
  }
  res.locals.tokenData = decodedToken;
  next();
};
var auth_default2 = auth;

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
  app2.use("/user", auth_default2(), user_default2({ router, service }));
  app2.use(handleError);
  return app2;
};
var app_default = createApp;

// src/index.ts
var app = app_default();
var server = import_http.default.createServer(app);
var io = new import_socket.Server(server);
var PORT = process.env.PORT || 4e3;
server.listen(PORT, () => {
  logger_default.info("listening on port " + PORT);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  io
});
//# sourceMappingURL=index.js.map