-- CreateTable
CREATE TABLE "authors" (
    "author_id" SERIAL NOT NULL,
    "fk_user_id" INTEGER NOT NULL,
    "description" VARCHAR(512),

    CONSTRAINT "pk_authors_author_id" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "fk_category_id" INTEGER,

    CONSTRAINT "pk_categories_category_id" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_user_id" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "pk_comments_comment_id" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "drafts" (
    "draft_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "title" VARCHAR(512),
    "body" TEXT,
    "main_img" TEXT,
    "other_imgs" TEXT[],
    "fk_author_id" INTEGER,
    "fk_category_id" INTEGER,

    CONSTRAINT "pk_drafts_draft_id" PRIMARY KEY ("draft_id")
);

-- CreateTable
CREATE TABLE "posts" (
    "post_id" SERIAL NOT NULL,
    "title" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT,
    "main_img" TEXT,
    "other_imgs" TEXT[],
    "fk_author_id" INTEGER,
    "fk_category_id" INTEGER,
    "updated_at" TIMESTAMPTZ(6),
    "is_published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pk_posts_post_id" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "posts_comments" (
    "fk_comment_id" INTEGER NOT NULL,
    "fk_post_id" INTEGER NOT NULL,

    CONSTRAINT "pk_posts_comments_id" PRIMARY KEY ("fk_comment_id","fk_post_id")
);

-- CreateTable
CREATE TABLE "posts_drafts" (
    "fk_draft_id" INTEGER NOT NULL,
    "fk_post_id" INTEGER NOT NULL,

    CONSTRAINT "pk_posts_drafts_id" PRIMARY KEY ("fk_draft_id","fk_post_id")
);

-- CreateTable
CREATE TABLE "posts_tags" (
    "fk_post_id" INTEGER NOT NULL,
    "fk_tag_id" INTEGER NOT NULL,

    CONSTRAINT "pk_posts_tags_id" PRIMARY KEY ("fk_post_id","fk_tag_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" SERIAL NOT NULL,
    "title" VARCHAR(512),

    CONSTRAINT "pk_tags_tag_id" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "refresh_token" TEXT NOT NULL,
    "fk_user_id" INTEGER NOT NULL,

    CONSTRAINT "pk_refresh_token" PRIMARY KEY ("refresh_token")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(128) NOT NULL,
    "last_name" VARCHAR(128),
    "avatar" VARCHAR(128),
    "login" VARCHAR(128) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "activate_link" VARCHAR(128) NOT NULL,
    "email" TEXT,
    "is_activated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pk_users_user_id" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_fk_user_id_key" ON "authors"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_fk_user_id_key" ON "tokens"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "fk_authors_user_id" FOREIGN KEY ("fk_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_category_id" FOREIGN KEY ("fk_category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_user_id" FOREIGN KEY ("fk_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "fk_drafts_category_id" FOREIGN KEY ("fk_category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "fk_posts_author_id" FOREIGN KEY ("fk_author_id") REFERENCES "authors"("author_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_author_id" FOREIGN KEY ("fk_author_id") REFERENCES "authors"("author_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_category_id" FOREIGN KEY ("fk_category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_comments" ADD CONSTRAINT "fk_posts_comments_comment_id" FOREIGN KEY ("fk_comment_id") REFERENCES "comments"("comment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_comments" ADD CONSTRAINT "fk_posts_comments_post_id" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_drafts" ADD CONSTRAINT "fk_posts_drafts_drafts_id" FOREIGN KEY ("fk_draft_id") REFERENCES "drafts"("draft_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_drafts" ADD CONSTRAINT "fk_posts_drafts_post_id" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_tags" ADD CONSTRAINT "fk_posts_tags_post_id" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_tags" ADD CONSTRAINT "fk_posts_tags_tag_id" FOREIGN KEY ("fk_tag_id") REFERENCES "tags"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "fk_tokens_user_id" FOREIGN KEY ("fk_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
