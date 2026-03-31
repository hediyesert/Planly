/** OpenAPI 3.0 — Planly backend. Güncel tutmak için route/controller değişince burayı eşitleyin. */

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Planly API",
    version: "1.0.0",
    description:
      "Çalışma planı, görevler, oturumlar, arkadaşlar ve analitik. Korumalı uçlar için `Authorization: Bearer <token>` kullanın (login/register sonrası dönen JWT).",
  },
  servers: [
    {
      url: "http://localhost:5002",
      description: "Yerel (PORT ortam değişkenine göre değişebilir)",
    },
    { url: "/", description: "Swagger UI ile aynı origin" },
  ],
  tags: [
    { name: "Auth" },
    { name: "Exam types" },
    { name: "Study plans" },
    { name: "Study sessions" },
    { name: "Tasks" },
    { name: "Users" },
    { name: "Friends" },
    { name: "Analytics" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserSafe: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/UserSafe" },
        },
      },
      ErrorMessage: {
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Kayıt",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "JWT + kullanıcı",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "409": {
            description: "E-posta veya kullanıcı adı kullanımda",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorMessage" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Giriş",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "JWT + kullanıcı",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "401": {
            description: "Hatalı kimlik bilgisi",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorMessage" } } },
          },
        },
      },
    },
    "/exam-types": {
      get: {
        tags: ["Exam types"],
        summary: "Sınav türlerini listele",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "ExamType dizisi" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/exam-types/{examTypeId}/topics": {
      get: {
        tags: ["Exam types"],
        summary: "Sınava göre konular",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "examTypeId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Konu listesi" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-plans/ai-generate": {
      post: {
        tags: ["Study plans"],
        summary: "AI ile çalışma planı üret",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["examTypeId", "topicIds", "dailyHours"],
                properties: {
                  examTypeId: { type: "string", description: "Mongo ObjectId" },
                  topicIds: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                  },
                  dailyHours: { type: "number", minimum: 0.5 },
                  targetDate: { type: "string", format: "date" },
                  startDate: { type: "string", format: "date" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "{ plan, tasks }" },
          "400": { description: "Validasyon" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-plans": {
      get: {
        tags: ["Study plans"],
        summary: "Kullanıcının planları",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "StudyPlan[] (examType populate)" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-plans/{id}": {
      get: {
        tags: ["Study plans"],
        summary: "Tek plan + görevler",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "{ plan, tasks }" },
          "404": { description: "Plan bulunamadı" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-sessions/start": {
      post: {
        tags: ["Study sessions"],
        summary: "Çalışma oturumu başlat (önceki aktif/paused oturumlar tamamlanır)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  studyPlanId: { type: "string", nullable: true },
                  taskId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "StudySession" },
          "404": { description: "Plan veya görev yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-sessions/{sessionId}/status": {
      put: {
        tags: ["Study sessions"],
        summary: "Durum: paused | active",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["paused", "active"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Güncellenmiş oturum" },
          "400": { description: "Geçersiz durum veya tamamlanmış oturum" },
          "404": { description: "Oturum yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/study-sessions/{sessionId}/finish": {
      put: {
        tags: ["Study sessions"],
        summary: "Oturumu bitir",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Tamamlanmış StudySession" },
          "404": { description: "Oturum yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Plana göre görevler",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "studyPlanId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Task[]" },
          "400": { description: "studyPlanId gerekli" },
          "404": { description: "Plan yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/tasks/{taskId}/complete": {
      put: {
        tags: ["Tasks"],
        summary: "Görevi tamamla",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "taskId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "{ task, progressPercent }" },
          "404": { description: "Görev yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/users/search": {
      get: {
        tags: ["Users"],
        summary: "Kullanıcı ara (min 2 karakter)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 2 },
          },
        ],
        responses: {
          "200": {
            description: "[{ id, username, email }]",
          },
          "400": { description: "q çok kısa" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/users/me": {
      put: {
        tags: ["Users"],
        summary: "Profil güncelle",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "{ user }" },
          "409": { description: "Çakışan kullanıcı adı/e-posta" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/users/me/password": {
      put: {
        tags: ["Users"],
        summary: "Şifre değiştir",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "{ message }" },
          "401": { description: "Mevcut şifre hatalı veya geçersiz token" },
        },
      },
    },
    "/users/{userId}": {
      delete: {
        tags: ["Users"],
        summary: "Hesabı sil (sadece kendi id)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Silindi" },
          "403": { description: "Başka kullanıcı silinemez" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends/request": {
      post: {
        tags: ["Friends"],
        summary: "Arkadaşlık isteği (email veya username)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  username: { type: "string" },
                },
                description: "En az biri zorunlu",
              },
            },
          },
        },
        responses: {
          "201": { description: "Friend kaydı (pending)" },
          "400": { description: "Kendine istek vb." },
          "404": { description: "Hedef kullanıcı yok" },
          "409": { description: "Zaten istek/arkadaşlık var" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends": {
      get: {
        tags: ["Friends"],
        summary: "Arkadaşlar + bekleyen istekler",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "{ friends, pendingIncoming, pendingOutgoing }",
          },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends/active-studying": {
      get: {
        tags: ["Friends"],
        summary: "Arkadaşların aktif/paused çalışma oturumları",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Oturum özeti dizisi" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends/{id}/accept": {
      post: {
        tags: ["Friends"],
        summary: "Gelen isteği kabul et",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Friend (accepted)" },
          "400": { description: "Artık pending değil" },
          "404": { description: "İstek yok veya alıcı siz değilsiniz" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends/{id}/reject": {
      post: {
        tags: ["Friends"],
        summary: "Gelen isteği reddet",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Silindi" },
          "400": { description: "Kayıt pending değil" },
          "404": { description: "İstek yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/friends/{id}": {
      delete: {
        tags: ["Friends"],
        summary: "Arkadaşlığı veya pending kaydı kaldır (friendship id)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "204": { description: "Silindi" },
          "403": { description: "Yetkisiz" },
          "404": { description: "Kayıt yok" },
          "401": { description: "Yetkisiz" },
        },
      },
    },
    "/analytics/weekly": {
      get: {
        tags: ["Analytics"],
        summary: "Haftalık özet",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description:
              "weekStart, weekEnd, tasksTotal, completedCount, incompleteCount, totalStudyMinutes, dailyBreakdown[]",
          },
          "401": { description: "Yetkisiz" },
        },
      },
    },
  },
};

module.exports = openapi;
