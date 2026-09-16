CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(300) NOT NULL,
	`file_name` varchar(200) NOT NULL,
	`original_name` varchar(200) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`size` int NOT NULL,
	`width` int,
	`height` int,
	`alt` varchar(250) NOT NULL DEFAULT '',
	`title` varchar(200) NOT NULL DEFAULT '',
	`folder` varchar(80) NOT NULL DEFAULT 'general',
	`uploaded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_revisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` json NOT NULL,
	`note` varchar(190),
	`user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(190) NOT NULL,
	`page_type` varchar(40) NOT NULL DEFAULT 'generic',
	`template` varchar(60) NOT NULL DEFAULT 'blank',
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`is_home` boolean NOT NULL DEFAULT false,
	`draft` json NOT NULL,
	`published` json,
	`has_unpublished_changes` boolean NOT NULL DEFAULT true,
	`published_at` timestamp,
	`deleted_at` timestamp,
	`created_by` int,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_path` varchar(250) NOT NULL,
	`to_path` varchar(500) NOT NULL,
	`status_code` int NOT NULL DEFAULT 301,
	`hits` int NOT NULL DEFAULT 0,
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `redirects_id` PRIMARY KEY(`id`),
	CONSTRAINT `redirects_from_uq` UNIQUE(`from_path`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(60) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`role` enum('admin','editor','seo') NOT NULL DEFAULT 'editor',
	`active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folder`);--> statement-breakpoint
CREATE INDEX `rev_page_idx` ON `page_revisions` (`page_id`);--> statement-breakpoint
CREATE INDEX `pages_type_idx` ON `pages` (`page_type`);