const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "UniClub System API Document",
    version: "1.0.0",
    description: "Tài liệu API Swagger chính thức cho Hệ thống Quản lý Câu lạc bộ UniClub. Hỗ trợ đầy đủ các endpoint active, mô hình dữ liệu và các mã lỗi (400, 401, 403, 404, 409, 500).",
    contact: {
      name: "UniClub Dev Team",
      email: "uniclub2402@gmail.com"
    }
  },
  servers: [
    {
      url: "https://localhost:5000",
      description: "HTTPS Local Development Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Nhập JWT Bearer token nhận được sau khi đăng nhập (ví dụ: `Bearer <your_token>`)"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error detailed message" },
          error: { type: "string", example: "Stack trace or optional error detail" }
        }
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
          full_name: { type: "string", example: "Nguyen Van A" },
          email: { type: "string", example: "anv@fpt.edu.vn" },
          role: { type: "string", enum: ["student", "club_member", "club_officer", "student_affairs"], example: "student" },
          avatar_url: { type: "string", example: "https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/avatars/user.png" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" }
        }
      },
      Profile: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
          user_id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
          student_code: { type: "string", example: "SE180000" },
          phone: { type: "string", example: "0912345678" },
          campus: { type: "string", example: "CT" },
          avatar: { type: "string", example: "https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/avatars/user.png" }
        }
      },
      Club: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d3" },
          name: { type: "string", example: "F-Coder Club" },
          category: { type: "string", enum: ["Arts", "Sports", "Academic", "Event", "Other"], example: "Academic" },
          slogan: { type: "string", example: "Code your future" },
          description: { type: "string", example: "Cau lac bo Lap trinh Sinh vien" },
          logo_url: { type: "string", example: "https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/clubs/coding.png" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" }
        }
      },
      Event: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d4" },
          club_id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d3" },
          title: { type: "string", example: "Workshop Web Development 2026" },
          description: { type: "string", example: "Huong dan lap trinh Web hien dai" },
          category: { type: "string", example: "Academic" },
          start_time: { type: "string", format: "date-time", example: "2026-10-01T08:00:00.000Z" },
          end_time: { type: "string", format: "date-time", example: "2026-10-01T11:00:00.000Z" },
          location: { type: "string", example: "Hall A101" },
          is_public: { type: "boolean", example: true },
          capacity: { type: "number", example: 100 },
          status: { type: "string", enum: ["coming_soon", "opening", "closed", "cancelled"], example: "opening" },
          progress_status: { type: "string", enum: ["draft", "completed"], example: "completed" },
          media_uris: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/events/banner.png"] }
        }
      },
      Reward: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d5" },
          club_id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d3" },
          name: { type: "string", example: "Highlands Coffee Voucher" },
          description: { type: "string", example: "Voucher tri gia 50k" },
          image_url: { type: "string", example: "https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/rewards/voucher.png" },
          points_required: { type: "number", example: 150 },
          quantity: { type: "number", example: 20 },
          status: { type: "string", enum: ["active", "hidden"], example: "active" }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: "Lỗi 401 Unauthorized - Chưa xác thực hoặc Token JWT hết hạn",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Unauthorized access: Token expired or invalid" }
          }
        }
      },
      ForbiddenError: {
        description: "Lỗi 403 Forbidden - Không có quyền truy cập vai trò này",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Access forbidden: Requires student_affairs role" }
          }
        }
      },
      NotFoundError: {
        description: "Lỗi 404 Not Found - Dữ liệu yêu cầu không tồn tại",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Resource not found" }
          }
        }
      },
      BadRequestError: {
        description: "Lỗi 400 Bad Request - Tham số truyền vào không hợp lệ",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Missing required fields: title, start_time" }
          }
        }
      },
      ConflictError: {
        description: "Lỗi 409 Conflict - Dữ liệu đã tồn tại hoặc bị trùng lặp",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Club name already exists" }
          }
        }
      },
      InternalServerError: {
        description: "Lỗi 500 Internal Server Error - Lỗi xử lý hệ thống",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { success: false, message: "Internal server error", error: "Database connection failed" }
          }
        }
      }
    }
  },
  tags: [
    { name: "Auth", description: "Đăng nhập Google OAuth2, FEID & Đăng xuất" },
    { name: "Profile", description: "Quản lý thông tin cá nhân & Avatar sinh viên" },
    { name: "Upload", description: "Tải ảnh trực tiếp lên Cloudinary CDN" },
    { name: "Club Discovery & Management", description: "Khám phá CLB, Đăng ký thành lập CLB & Quản lý CLB" },
    { name: "Event Management", description: "Khám phá Sự kiện, Tạo đơn & Quản lý sự kiện" },
    { name: "Event Timeline & Attendance", description: "Lịch trình chi tiết & Điểm danh check-in sự kiện" },
    { name: "Reward Management", description: "Quản lý & Đổi điểm lấy phần thưởng" },
    { name: "Poll Management", description: "Tạo, Bình chọn & Quản lý khảo sát ý kiến" },
    { name: "Activity Schedule", description: "Lịch hoạt động nội bộ CLB" },
    { name: "Finance & Payment", description: "Thanh toán hội phí VNPay & Quản lý thu chi CLB" },
    { name: "Invitation Management", description: "Mời thành viên gia nhập CLB" }
  ],
  paths: {
    "/api/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "UC-01: Đăng nhập bằng Google OAuth2",
        description: "Xác thực email domain trường (@fpt.edu.vn) và cấp mã JWT token (7 ngày).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string", description: "Google OAuth Authorization Code" },
                  token: { type: "string", description: "Google ID Token" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Đăng nhập thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          500: { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "UC-03: Đăng xuất khỏi hệ thống",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Đăng xuất thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logged out successfully" }
                  }
                }
              }
            }
          },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    },
    "/api/profile/me": {
      get: {
        tags: ["Profile"],
        summary: "UC-04: Lấy thông tin hồ sơ cá nhân",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lấy hồ sơ thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        profile: { $ref: "#/components/schemas/Profile" }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" }
        }
      },
      patch: {
        tags: ["Profile"],
        summary: "UC-05: Cập nhật thông tin cá nhân & Avatar (Cloudinary)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  avatar: { type: "string", description: "Chuỗi Base64 Data URI hoặc URL ảnh avatar" },
                  phone: { type: "string", example: "0912345678" },
                  campus: { type: "string", example: "CT" },
                  student_code: { type: "string", example: "SE180000" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Cập nhật hồ sơ thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Profile" }
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    },
    "/api/profile/search": {
      get: {
        tags: ["Profile"],
        summary: "Tìm kiếm thông tin sinh viên theo từ khóa",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" }, description: "Từ khóa tên hoặc email" }
        ],
        responses: {
          200: {
            description: "Trả về danh sách gợi ý người dùng",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    },
    "/api/upload": {
      post: {
        tags: ["Upload"],
        summary: "Tải ảnh trực tiếp lên Cloudinary CDN",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary", description: "File ảnh upload" },
                  folder: { type: "string", example: "uniclub/general" }
                }
              }
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", description: "Chuỗi Base64 Data URI" },
                  folder: { type: "string", example: "uniclub/general" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Upload ảnh thành công, trả về URL CDN Cloudinary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        url: { type: "string", example: "https://res.cloudinary.com/dsjawxwjh/image/upload/v1/uniclub/general/img.png" }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          500: { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },
    "/api/clubs": {
      get: {
        tags: ["Club Discovery & Management"],
        summary: "UC-11: Xem danh sách câu lạc bộ active",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" }, description: "Lọc theo danh mục" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Từ khóa tìm kiếm" }
        ],
        responses: {
          200: {
            description: "Danh sách CLB",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Club" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/clubs/{id}": {
      get: {
        tags: ["Club Discovery & Management"],
        summary: "UC-12: Xem chi tiết câu lạc bộ",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Thông tin chi tiết CLB",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Club" }
                  }
                }
              }
            }
          },
          404: { $ref: "#/components/responses/NotFoundError" }
        }
      }
    },
    "/api/club-management/creation-requests": {
      post: {
        tags: ["Club Discovery & Management"],
        summary: "UC-10: Nộp đơn xin thành lập câu lạc bộ mới (Logo Cloudinary & $\\ge 10$ thành viên)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["club_name", "category", "logo_url", "member_ids"],
                properties: {
                  club_name: { type: "string", example: "FPT Chess Club" },
                  category: { type: "string", example: "Sports" },
                  slogan: { type: "string", example: "Think fast, play smart" },
                  description: { type: "string", example: "CLB Co Vua FPT" },
                  reason: { type: "string", example: "Tao san choi ruyen luyen tu duy cho sinh vien" },
                  logo_url: { type: "string", description: "Chuỗi Base64 Data URI hoặc Cloudinary URL" },
                  member_ids: { type: "array", items: { type: "string" }, description: "Danh sách tối thiểu 10 mã User ID thành viên sáng lập" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Nộp đơn thành công" },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          409: { $ref: "#/components/responses/ConflictError" }
        }
      },
      get: {
        tags: ["Club Discovery & Management"],
        summary: "UC-13: Xem danh sách yêu cầu tạo CLB chờ duyệt (Dành cho Student Affairs)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Danh sách yêu cầu tạo CLB" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/api/club-management/clubs/{id}": {
      put: {
        tags: ["Club Discovery & Management"],
        summary: "UC-20: Cập nhật thông tin câu lạc bộ & Logo (Student Affairs / Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  slogan: { type: "string" },
                  description: { type: "string" },
                  logo_url: { type: "string", description: "Base64 hoặc Cloudinary URL" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Cập nhật CLB thành công" },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
          404: { $ref: "#/components/responses/NotFoundError" }
        }
      }
    },
    "/api/events": {
      get: {
        tags: ["Event Management"],
        summary: "UC-33: Xem danh sách sự kiện công khai",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Danh sách sự kiện" }
        }
      }
    },
    "/api/events/{id}": {
      get: {
        tags: ["Event Management"],
        summary: "UC-38: Xem chi tiết sự kiện",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Chi tiết sự kiện" },
          404: { $ref: "#/components/responses/NotFoundError" }
        }
      }
    },
    "/api/event-requests": {
      post: {
        tags: ["Event Management"],
        summary: "Nộp đơn xin phê duyệt sự kiện mới (Kèm link Hợp đồng / Giấy phép)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "category", "location", "start_time", "end_time", "capacity"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  location: { type: "string" },
                  start_time: { type: "string", format: "date-time" },
                  end_time: { type: "string", format: "date-time" },
                  capacity: { type: "number" },
                  approval_document_url: { type: "string", description: "URL Google Drive/PDF giấy tờ phê duyệt" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Nộp đơn xin phép sự kiện thành công" },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    },
    "/api/member/clubs-membership/{clubId}/rewards": {
      get: {
        tags: ["Reward Management"],
        summary: "UC-63: Xem danh sách phần thưởng có thể đổi của CLB",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "clubId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Danh sách phần thưởng active" },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    },
    "/api/member/clubs-membership/{clubId}/rewards/{rewardId}/redeem": {
      post: {
        tags: ["Reward Management"],
        summary: "UC-66: Đổi phần thưởng bằng điểm cống hiến",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "clubId", in: "path", required: true, schema: { type: "string" } },
          { name: "rewardId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Đổi quà thành công" },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" }
        }
      }
    },
    "/api/president/reward-management/clubs/{clubId}/rewards": {
      post: {
        tags: ["Reward Management"],
        summary: "UC-69: Tạo phần thưởng mới (Tự động tải ảnh quà lên Cloudinary)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "clubId", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "points_required", "quantity"],
                properties: {
                  name: { type: "string", example: "Voucher Highlands 50k" },
                  description: { type: "string" },
                  image_url: { type: "string", description: "Base64 hoặc Cloudinary URL / Emoji" },
                  points_required: { type: "number", example: 150 },
                  quantity: { type: "number", example: 20 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Tạo quà thành công" },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/api/payment/vnpay/create-payment-url": {
      post: {
        tags: ["Finance & Payment"],
        summary: "UC-98: Tạo URL thanh toán đóng hội phí qua VNPay Gateway",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["transaction_id", "period", "amount"],
                properties: {
                  transaction_id: { type: "string" },
                  period: { type: "string", example: "SU26" },
                  amount: { type: "number", example: 100000 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Trả về VNPay payment URL để redirect",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    vnpUrl: { type: "string", example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..." }
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestError" },
          401: { $ref: "#/components/responses/UnauthorizedError" }
        }
      }
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerDocument,
};
