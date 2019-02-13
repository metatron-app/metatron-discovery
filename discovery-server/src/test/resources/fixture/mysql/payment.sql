DROP TABLE IF EXISTS `payment`;

CREATE TABLE `payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payment_type` varchar(255) DEFAULT NULL,
  `payment_amt` double DEFAULT NULL,
  `in_datetime` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',129, '2018-04-26 05:58:12');

INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',800.7,'2018-04-26 08:11:03');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',328,'2018-04-26 12:26:36');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',456,'2018-04-26 12:30:29');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',548,'2018-04-27 05:35:37');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',466,'2018-04-27 07:02:03');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',642.6,'2018-04-27 07:16:34');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',428,'2018-04-27 09:29:06');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',606,'2018-04-27 10:14:10');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',128,'2018-04-27 10:36:51');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',149,'2018-04-27 11:45:55');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('AliPay',794,'2018-04-27 11:59:32');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',298,'2018-04-27 12:59:34');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',278.8,'2018-04-27 13:04:15');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',298,'2018-04-27 13:34:22');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',456,'2018-04-28 06:32:42');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',298,'2018-04-28 06:46:01');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',326,'2018-04-28 07:26:00');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',298,'2018-04-28 09:13:49');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('WeiXinPay',488,'2018-04-28 10:16:06');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',298,'2018-04-28 11:11:27');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',110,'2018-04-28 11:37:33');


INSERT INTO `payment` (`payment_type`,`payment_amt`,`in_datetime`)
VALUES ('Cash',298,'2018-04-28 12:02:22');