CREATE TABLE `urls` (
	`id` INT(255) NOT NULL AUTO_INCREMENT,
	`url` TEXT NOT NULL,
	`slug` TEXT NOT NULL,
	`timestmp` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;
