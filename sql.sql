CREATE TABLE `dianping_test_table`
(
  `AutoId`           bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ShopId`               varchar(88)       DEFAULT NULL COMMENT '逻辑主键-店铺id',
  `Url`              varchar(255)      DEFAULT NULL COMMENT '地址',
  `CityName`         varchar(88)       DEFAULT NULL COMMENT '城市',
  `ShopName`         varchar(500)      DEFAULT NULL COMMENT '店铺名称',
  PRIMARY KEY (`AutoId`),
  UNIQUE KEY `uq_Id` (`ShopId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED COMMENT='大众点评测试'