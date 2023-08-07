-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "fk_tokens_user_id";

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "fk_tokens_user_id" FOREIGN KEY ("fk_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
