-- CreateTable
CREATE TABLE "refresh_sessions" (
    "id" CHAR(36) NOT NULL,
    "organization_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "user_agent" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_refresh_sessions_token_hash" ON "refresh_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_sessions_org_user" ON "refresh_sessions"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_sessions_expires_at" ON "refresh_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "fk_refresh_sessions_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "fk_refresh_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
